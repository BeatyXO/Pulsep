import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  readContract: vi.fn(),
  getContractCode: vi.fn(),
  writeContract: vi.fn(),
  getTransaction: vi.fn(),
}));

vi.mock('genlayer-js', () => ({
  chains: { studionet: { id: 61999, name: 'GenLayer Studionet' } },
  createClient: vi.fn((config: { provider?: { request: (request: { method: string; params?: unknown[] }) => Promise<unknown> } }) => {
    if (config.provider) {
      return {
        writeContract: (args: unknown) => mocks.writeContract(args, config.provider),
      };
    }
    return {
      readContract: mocks.readContract,
      getContractCode: mocks.getContractCode,
      getTransaction: mocks.getTransaction,
    };
  }),
}));

import {
  checkPending,
  connectInjected,
  discoverInjectedProviders,
  lastTxKey,
  loadPending,
  pendingKey,
  readContract,
  verifyWallet,
  writeContract,
} from './chain';
import type { Deployment, Eip1193Provider, WalletSession } from './types';

const ADDRESS = '0x7876e9f76f32925c212528d57bc9dfe5e34bcc07' as const;
const OTHER = '0x5bf2926e49d5896c975b03fee2fda5e96cb4dd04';
const HASH = `0x${'a'.repeat(64)}` as const;
const DEPLOYMENT: Deployment = {
  verified: true,
  address: '0x5B5dDeeaDBfCc2075A7E75401202E259a076f9Cf',
  chainId: 61999,
  network: 'studionet',
  version: 'pulsep.v0.5',
  sourceSha256: '',
  deploymentTransaction: `0x${'b'.repeat(64)}`,
};
const CONFIG = {
  version: 'pulsep.v0.5', network_scope: 'studionet-only', admin: null,
  assessment_cooldown_seconds: 300, evidence_maturity_seconds: 300,
  max_sla_versions: 8, revision_expiry_seconds: 86400,
};

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

function makeProvider(request: Eip1193Provider['request']): Eip1193Provider {
  return { request };
}

function session(provider: Eip1193Provider = makeProvider(async ({ method }) => {
  if (method === 'eth_accounts') return [ADDRESS];
  if (method === 'eth_chainId') return '0xf22f';
  return null;
})): WalletSession {
  return { address: ADDRESS, provider };
}

describe('injected wallet and release guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: memoryStorage() });
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
    mocks.readContract.mockImplementation(async ({ functionName }: { functionName: string }) => functionName === 'get_config' ? CONFIG : { pacts: [] });
    mocks.getContractCode.mockResolvedValue('deployed source');
    mocks.writeContract.mockImplementation(async (_args: unknown, provider: Eip1193Provider) =>
      provider.request({ method: 'eth_sendTransaction', params: [{}] }));
    mocks.getTransaction.mockResolvedValue({ statusName: 'ACCEPTED' });
  });

  it('discovers MetaMask and Rabby provider collections without duplicating providers', () => {
    const first = makeProvider(vi.fn());
    const second = makeProvider(vi.fn());
    Object.defineProperty(window, 'ethereum', { configurable: true, value: { providers: [first, second, first] } });
    expect(discoverInjectedProviders()).toEqual([first, second]);
  });

  it('connects on chain 61999 and switches a wrong chain', async () => {
    const provider = makeProvider(vi.fn(async ({ method }) => {
      if (method === 'eth_requestAccounts' || method === 'eth_accounts') return [ADDRESS];
      if (method === 'eth_chainId') return '0x1';
      return null;
    }));
    await expect(connectInjected(provider)).resolves.toMatchObject({ address: ADDRESS });
    expect(provider.request).toHaveBeenCalledWith({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xf22f' }] });
  });

  it('adds Studionet when the wallet reports the chain is unknown', async () => {
    const provider = makeProvider(vi.fn(async ({ method }) => {
      if (method === 'eth_requestAccounts' || method === 'eth_accounts') return [ADDRESS];
      if (method === 'eth_chainId') return '0x1';
      if (method === 'wallet_switchEthereumChain') throw Object.assign(new Error('unknown chain'), { code: 4902 });
      return null;
    }));
    await connectInjected(provider);
    expect(provider.request).toHaveBeenCalledWith(expect.objectContaining({
      method: 'wallet_addEthereumChain',
      params: [expect.objectContaining({ chainId: '0xf22f', rpcUrls: ['https://studio.genlayer.com/api'] })],
    }));
  });

  it('does not continue after a user rejects the connection request', async () => {
    const provider = makeProvider(vi.fn().mockRejectedValueOnce(Object.assign(new Error('User rejected'), { code: 4001 })));
    await expect(connectInjected(provider)).rejects.toThrow('User rejected');
    expect(provider.request).toHaveBeenCalledTimes(1);
  });

  it('rejects a changed or disconnected account and a wallet on the wrong chain', async () => {
    await expect(verifyWallet(session(makeProvider(async ({ method }) => method === 'eth_accounts' ? [OTHER] : '0xf22f')))).rejects.toThrow('account changed');
    await expect(verifyWallet(session(makeProvider(async ({ method }) => method === 'eth_accounts' ? [] : '0xf22f')))).rejects.toThrow('account changed');
    await expect(verifyWallet(session(makeProvider(async ({ method }) => method === 'eth_accounts' ? [ADDRESS] : '0x1')))).rejects.toThrow('Wrong network');
  });

  it('blocks a mismatched deployment before prompting the wallet', async () => {
    const provider = makeProvider(vi.fn());
    await expect(writeContract({ ...DEPLOYMENT, chainId: 1 }, session(provider), 'propose_pact', ['{}'])).rejects.toThrow('verified');
    expect(provider.request).not.toHaveBeenCalled();
  });

  it('blocks a deployed config or source hash mismatch before signing', async () => {
    const provider = makeProvider(vi.fn());
    mocks.readContract.mockResolvedValueOnce({ ...CONFIG, max_sla_versions: 7 });
    await expect(writeContract(DEPLOYMENT, session(provider), 'propose_pact', ['{}'])).rejects.toThrow('does not match');
    mocks.readContract.mockResolvedValue(CONFIG);
    const wrongHash = { ...DEPLOYMENT, sourceSha256: '0'.repeat(64) };
    await expect(writeContract(wrongHash, session(provider), 'propose_pact', ['{}'])).rejects.toThrow('source hash');
    expect(provider.request).not.toHaveBeenCalled();
  });

  it('supports anonymous read-only pact data from contract reads', async () => {
    mocks.readContract.mockResolvedValue({ pacts: ['canonical'] });
    await expect(readContract(DEPLOYMENT, 'list_pacts', [0, 10])).resolves.toEqual({ pacts: ['canonical'] });
    expect(mocks.readContract).toHaveBeenCalledWith(expect.objectContaining({ functionName: 'list_pacts' }));
  });

  it('persists a returned hash for reload recovery and blocks a second send', async () => {
    const provider = makeProvider(vi.fn(async ({ method }) => {
      if (method === 'eth_accounts') return [ADDRESS];
      if (method === 'eth_chainId') return '0xf22f';
      if (method === 'eth_sendTransaction') return HASH;
      return null;
    }));
    mocks.writeContract.mockImplementation(async (_args: unknown, guarded: Eip1193Provider) => {
      await guarded.request({ method: 'eth_sendTransaction', params: [{}] });
      return guarded.request({ method: 'eth_sendTransaction', params: [{}] });
    });
    await expect(writeContract(DEPLOYMENT, session(provider), 'propose_revision', ['pact', '{}'], 0n, 'pact'))
      .rejects.toThrow('A transaction hash was received');
    expect(vi.mocked(provider.request).mock.calls.filter(([request]) => request.method === 'eth_sendTransaction')).toHaveLength(1);
    expect(loadPending()).toMatchObject({ hash: HASH, method: 'propose_revision', pactId: 'pact', account: ADDRESS });
    expect(localStorage.getItem(pendingKey)).not.toBeNull();
  });

  it('keeps an ambiguous send out of the pending-hash slot and never retries it automatically', async () => {
    const provider = makeProvider(vi.fn(async ({ method }) => {
      if (method === 'eth_accounts') return [ADDRESS];
      if (method === 'eth_chainId') return '0xf22f';
      if (method === 'eth_sendTransaction') throw new Error('transport closed');
      return null;
    }));
    await expect(writeContract(DEPLOYMENT, session(provider), 'approve_revision', ['pact']))
      .rejects.toThrow('no reliable hash is known');
    expect(vi.mocked(provider.request).mock.calls.filter(([request]) => request.method === 'eth_sendTransaction')).toHaveLength(1);
    expect(loadPending()).toBeNull();
    expect(localStorage.getItem(pendingKey)).toBeNull();
  });

  it('recovers a known pending hash after refresh and records finalized outcomes', async () => {
    localStorage.setItem(pendingKey, JSON.stringify({ hash: HASH, method: 'approve_revision', pactId: 'pact', account: ADDRESS, submittedAt: 1 }));
    const pending = loadPending();
    expect(pending?.hash).toBe(HASH);
    expect(await checkPending(pending!)).toBe('pending');
    mocks.getTransaction.mockResolvedValue({
      statusName: 'FINALIZED', txExecutionResultName: 'FINISHED_WITH_RETURN',
      consensusData: { leaderReceipt: [{ mode: 'leader', execution_result: 'SUCCESS' }] },
    });
    expect(await checkPending(pending!)).toBe('success');
    expect(localStorage.getItem(pendingKey)).toBeNull();
    expect(JSON.parse(localStorage.getItem(lastTxKey)!).outcome).toBe('success');
  });
});
