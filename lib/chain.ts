import { createClient, chains } from 'genlayer-js';
import { TransactionHashVariant, type Hash } from 'genlayer-js/types';
import type { Deployment, Eip1193Provider, PendingTx, WalletSession } from './types';

export const CHAIN_ID = 61999;
export const RPC_URL = 'https://studio.genlayer.com/api';
export const EXPLORER = 'https://explorer-studio.genlayer.com';
export const pendingKey = 'pulsep:pending:61999';
export const lastTxKey = 'pulsep:last:61999';

const reader = createClient({ chain: chains.studionet });
const hashPattern = /^0x[0-9a-fA-F]{64}$/;

export function formatError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const value = error as Record<string, unknown>;
    for (const key of ['shortMessage', 'message', 'reason', 'details']) {
      if (typeof value[key] === 'string' && value[key]) return value[key] as string;
    }
    if (value.error) return formatError(value.error);
  }
  return 'Unknown wallet or network error.';
}

export function discoverInjectedProviders(): Eip1193Provider[] {
  if (typeof window === 'undefined') return [];
  const eth = (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
  if (!eth) return [];
  const list = eth.providers?.length ? eth.providers : [eth];
  return [...new Set(list)];
}

export async function connectInjected(provider?: Eip1193Provider): Promise<WalletSession> {
  const selected = provider ?? discoverInjectedProviders()[0];
  if (!selected) throw new Error('No injected EVM wallet was detected. Install or unlock MetaMask, Rabby, or another injected wallet.');
  await selected.request({ method: 'eth_requestAccounts' });
  const chainId = Number(await selected.request({ method: 'eth_chainId' }));
  if (chainId !== CHAIN_ID) {
    try {
      await selected.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }] });
    } catch (error) {
      const code = (error as { code?: number })?.code;
      if (code !== 4902) throw error;
      await selected.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${CHAIN_ID.toString(16)}`,
          chainName: 'GenLayer Studionet',
          nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
          rpcUrls: [RPC_URL],
          blockExplorerUrls: [EXPLORER],
        }],
      });
    }
  }
  const accounts = await selected.request({ method: 'eth_accounts' }) as string[];
  const first = accounts?.[0];
  if (!/^0x[0-9a-fA-F]{40}$/.test(first ?? '')) throw new Error('No wallet account is selected.');
  return { address: first.toLowerCase() as `0x${string}`, provider: selected };
}

export async function verifyWallet(session: WalletSession) {
  const [accounts, rawChain] = await Promise.all([
    session.provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
    session.provider.request({ method: 'eth_chainId' }),
  ]);
  if (accounts?.[0]?.toLowerCase() !== session.address) throw new Error('Wallet account changed. Reconnect before signing.');
  if (Number(rawChain) !== CHAIN_ID) throw new Error('Wrong network. Switch back to GenLayer Studionet (61999).');
}

export async function readContract<T>(deployment: Deployment, functionName: string, args: unknown[] = []): Promise<T> {
  if (!deployment.verified || !deployment.address) throw new Error('Pulsep does not have a verified Studionet deployment yet.');
  const result = await reader.readContract({
    address: deployment.address as `0x${string}`,
    functionName,
    args: args as never[],
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
  });
  return JSON.parse(JSON.stringify(result, (_, value) => typeof value === 'bigint' ? Number(value) : value)) as T;
}

export async function verifyDeployment(deployment: Deployment) {
  if (!deployment.verified || !deployment.address || deployment.chainId !== CHAIN_ID || deployment.network !== 'studionet' || deployment.version !== 'pulsep.v0.3') {
    throw new Error('Live signing is locked until the stable Studionet deployment is verified.');
  }
  const config = await readContract<{ version: string; network_scope: string; admin: null; assessment_cooldown_seconds: number; evidence_maturity_seconds: number }>(deployment, 'get_config');
  if (config.version !== deployment.version || config.network_scope !== 'studionet-only' || config.admin !== null || config.assessment_cooldown_seconds !== 300 || config.evidence_maturity_seconds !== 300) {
    throw new Error('Deployed Pulsep policy does not match this frontend release.');
  }
  if (deployment.sourceSha256) {
    const source = await reader.getContractCode(deployment.address as `0x${string}`);
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source.replaceAll('\r\n', '\n')));
    const actual = [...new Uint8Array(bytes)].map(x => x.toString(16).padStart(2, '0')).join('');
    if (actual !== deployment.sourceSha256) throw new Error('Onchain source hash does not match the verified Pulsep release.');
  }
}

function savePending(value: PendingTx | null) {
  if (typeof localStorage === 'undefined') return;
  if (value) localStorage.setItem(pendingKey, JSON.stringify(value));
  else localStorage.removeItem(pendingKey);
}

export function loadPending(): PendingTx | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const value = JSON.parse(localStorage.getItem(pendingKey) || 'null');
    return value && hashPattern.test(value.hash) ? value as PendingTx : null;
  } catch { return null; }
}

export async function writeContract(deployment: Deployment, session: WalletSession, functionName: string, args: unknown[], value = 0n, pactId = '') {
  await verifyDeployment(deployment);
  await verifyWallet(session);
  if (loadPending()) throw new Error('A Pulsep transaction is already pending. Resolve it before signing another action.');

  let walletRequested = false;
  let knownHash: `0x${string}` | null = null;
  const guarded: Eip1193Provider = {
    request: async request => {
      const isWrite = ['eth_sendTransaction', 'eth_sendRawTransaction', 'eth_signTransaction'].includes(request.method);
      if (isWrite) {
        if (walletRequested) throw new Error('A duplicate wallet submission was blocked. Check the pending transaction before retrying.');
        walletRequested = true;
      }
      const result = await session.provider.request(request);
      if (isWrite && request.method !== 'eth_signTransaction' && typeof result === 'string' && hashPattern.test(result)) {
        knownHash = result as `0x${string}`;
        savePending({ hash: knownHash, method: functionName, pactId, account: session.address, submittedAt: Date.now() });
      }
      return result;
    },
  };

  const writer = createClient({ chain: chains.studionet, account: session.address, provider: guarded as never });
  try {
    const hash = await writer.writeContract({
      address: deployment.address as `0x${string}`,
      functionName,
      args: args as never[],
      value,
    });
    if (typeof hash !== 'string' || !hashPattern.test(hash)) throw new Error('Wallet returned no valid transaction hash.');
    knownHash = hash as `0x${string}`;
    const pending = { hash: knownHash, method: functionName, pactId, account: session.address, submittedAt: Date.now() } satisfies PendingTx;
    savePending(pending);
    return pending;
  } catch (error) {
    if (knownHash) throw new Error(`A transaction hash was received (${knownHash}). Do not resubmit. Check its final execution result. ${formatError(error)}`);
    if (walletRequested) throw new Error(`The wallet was asked to submit but no reliable hash is known. Check wallet Activity and the explorer before retrying. ${formatError(error)}`);
    throw error;
  }
}

export function receiptOutcome(receipt: unknown): 'pending' | 'success' | 'error' {
  if (!receipt || typeof receipt !== 'object') return 'pending';
  const r = receipt as Record<string, unknown>;
  const status = String(r.statusName ?? r.status_name ?? r.status ?? '').toUpperCase();
  if (['CANCELED', 'CANCELLED', 'DROPPED'].includes(status)) return 'error';
  if (status !== 'FINALIZED') return 'pending';
  const consensus = (r.consensusData ?? r.consensus_data) as Record<string, unknown> | undefined;
  const raw = consensus?.leaderReceipt ?? consensus?.leader_receipt;
  const leader = (Array.isArray(raw) ? [...raw].reverse().find(x => x?.mode === 'leader') ?? raw.at(-1) : raw) as Record<string, unknown> | undefined;
  const execution = String(leader?.execution_result ?? leader?.executionResult ?? '').toUpperCase();
  const normalized = String(r.txExecutionResultName ?? r.tx_execution_result_name ?? '').toUpperCase();
  if (['ERROR', 'FAILURE', 'VM_ERROR'].includes(execution) || normalized === 'FINISHED_WITH_ERROR') return 'error';
  if (execution === 'SUCCESS' || normalized === 'FINISHED_WITH_RETURN') return 'success';
  return 'pending';
}

export async function checkPending(pending: PendingTx) {
  if (!hashPattern.test(pending.hash)) throw new Error('Invalid pending transaction hash.');
  const receipt = await reader.getTransaction({ hash: pending.hash as Hash });
  const outcome = receiptOutcome(receipt);
  if (outcome !== 'pending' && typeof localStorage !== 'undefined') {
    localStorage.setItem(lastTxKey, JSON.stringify({ ...pending, outcome, checkedAt: Date.now() }));
    savePending(null);
  }
  return outcome;
}
