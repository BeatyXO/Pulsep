'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { connectInjected, discoverInjectedProviders, formatError } from '@/lib/chain';
import { shortAddress } from '@/lib/format';
import type { WalletSession } from '@/lib/types';

export default function Shell({ children, wallet, onWallet }: { children: React.ReactNode; wallet?: WalletSession | null; onWallet?: (session: WalletSession | null) => void }) {
  const [localWallet, setLocalWallet] = useState<WalletSession | null>(wallet ?? null);
  const [error, setError] = useState('');
  const current = wallet === undefined ? localWallet : wallet;
  const setCurrent = (session: WalletSession | null) => { setLocalWallet(session); onWallet?.(session); };

  useEffect(() => {
    if (!current) return;
    const changed = () => setCurrent(null);
    current.provider.on?.('accountsChanged', changed);
    current.provider.on?.('chainChanged', changed);
    return () => {
      current.provider.removeListener?.('accountsChanged', changed);
      current.provider.removeListener?.('chainChanged', changed);
    };
  }, [current]);

  async function connect() {
    setError('');
    try { setCurrent(await connectInjected(discoverInjectedProviders()[0])); }
    catch (e) { setError(formatError(e)); }
  }

  return <div className="shell">
    <header className="topbar">
      <Link className="brand" href="/"><span className="brand-mark"/>Pulsep</Link>
      <nav className="nav"><Link href="/">Pacts</Link><Link href="/pacts/new/">Create pact</Link><Link href="/activity/">Activity</Link></nav>
      <button className="wallet-button" onClick={() => current ? setCurrent(null) : void connect()}><Wallet size={15}/>{current ? shortAddress(current.address) : 'Connect wallet'}</button>
    </header>
    {error && <div className="error" style={{marginTop:14}}>{error}</div>}
    {children}
    <footer className="footer"><span>Pulsep · evidence-bound reliability settlement</span><span>Stable Studionet · chain 61999 · simulated GEN</span></footer>
  </div>;
}
