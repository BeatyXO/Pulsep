'use client';

import Link from 'next/link';
import { Activity, ArrowUpRight, Clock3, DatabaseZap, Plus, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import Shell from './Shell';
import HoverCard from './HoverCard';
import { readContract } from '@/lib/chain';
import { formatGEN, shortAddress } from '@/lib/format';
import type { Deployment, Pact, WalletSession } from '@/lib/types';

export default function HomeClient() {
  const [wallet, setWallet] = useState<WalletSession | null>(null);
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [pacts, setPacts] = useState<Pact[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/deployment.json', { cache: 'no-store' }).then(r => r.json()).then(setDeployment).catch(() => setError('Deployment configuration could not be loaded.'));
  }, []);
  useEffect(() => {
    if (!deployment?.verified) { setLoading(false); return; }
    setLoading(true);
    readContract<Pact[]>(deployment, 'list_pacts', [0, 50]).then(setPacts).catch(e => setError(e instanceof Error ? e.message : String(e))).finally(() => setLoading(false));
  }, [deployment]);

  return <Shell wallet={wallet} onWallet={setWallet}>
    <section className="hero">
      <div>
        <div className="eyebrow">Recurring reliability · independent judgment</div>
        <h1>When service promises <span>meet evidence.</span></h1>
        <p className="hero-copy">Pulsep turns a frozen SLA, a funded period bond and pre-authorized public evidence into a GenLayer-settled reliability pact. Validators decide the breach tier; deterministic rules decide the money.</p>
        <div className="hero-actions"><Link className="primary" href="/pacts/new/"><Plus size={16}/>Create a pact</Link><a className="secondary" href="#protocol"><ShieldCheck size={16}/>See the protocol</a></div>
      </div>
      <div className="signal-panel" aria-label="Evidence consensus illustration">
        <div className="orbit one"/><div className="orbit two"/><div className="orbit three"/><div className="pulse-core"/>
        <span className="evidence-node node-a">Provider status</span><span className="evidence-node node-b">Independent monitor</span><span className="evidence-node node-c">Maintenance record</span>
        <div className="panel-caption"><strong>61999</strong><span>Stable Studionet · consensus settlement</span></div>
      </div>
    </section>

    <section className="section" id="protocol">
      <div className="section-head"><div><div className="eyebrow">Protocol shape</div><h2>One pact. Repeated periods.</h2></div><p>The service relationship stays intact while each funded period gets its own evidence window, validator assessment and terminal settlement.</p></div>
      <div className="grid">
        <HoverCard><div className="card-number">01 / FREEZE</div><h3>Bind the promise first</h3><p>Service scope, SLA clauses, tier rules, payout basis points and evidence URLs are fixed before a provider accepts.</p></HoverCard>
        <HoverCard><div className="card-number">02 / JUDGE</div><h3>Validators inspect the world</h3><p>Provider-controlled and independent sources are fetched directly during GenLayer execution. Source text is untrusted data, not instruction.</p></HoverCard>
        <HoverCard><div className="card-number">03 / SETTLE</div><h3>Classification, not discretion</h3><p>The model chooses NO_BREACH, MINOR, MAJOR, SEVERE or INCONCLUSIVE. Frozen contract math allocates the bond.</p></HoverCard>
      </div>
    </section>

    <section className="section">
      <div className="section-head"><div><div className="eyebrow">Live contract state</div><h2>Your pacts</h2></div><p>Read-only access does not require a wallet. Signing stays disabled until a verified deployment matches this release.</p></div>
      {error && <div className="error" style={{marginBottom:14}}>{error}</div>}
      {!deployment?.verified && <div className="notice" style={{marginBottom:14}}>Live mode is intentionally locked: <code>public/deployment.json</code> has not yet been replaced with a source-verified Studionet deployment. No simulated pact is being presented as chain evidence.</div>}
      <div className="app-panel">
        <div className="app-head"><strong>Reliability pacts</strong><small>{deployment?.verified ? 'Finalized contract reads' : 'Awaiting verified deployment'}</small></div>
        <div className="pact-list">
          {pacts.map(pact => <Link className="pact-row" key={pact.id} href={`/pacts/view/?id=${encodeURIComponent(pact.id)}`}>
            <div><strong>{pact.title}</strong><br/><span>{pact.service} · {pact.id}</span></div>
            <span>{shortAddress(pact.provider)}</span><span>{formatGEN(pact.bond)} GEN / period</span><span className="status">{pact.status}</span>
          </Link>)}
          {!pacts.length && <div className="empty"><Activity size={28}/><h3>{loading ? 'Reading finalized state…' : 'No live pacts to show yet'}</h3><p>{deployment?.verified ? 'Create the first pact from a connected customer wallet.' : 'The frontend will populate only after Codex deploys and verifies Pulsep on stable Studionet.'}</p></div>}
        </div>
      </div>
    </section>

    <section className="section"><div className="grid">
      <HoverCard><DatabaseZap size={19}/><h3 style={{marginTop:24}}>No application backend</h3><p>Canonical product state lives in the Intelligent Contract. Public evidence is retrieved by validators, not by a private decision server.</p></HoverCard>
      <HoverCard><Clock3 size={19}/><h3 style={{marginTop:24}}>Uncertainty is real state</h3><p>Unavailable or irreconcilable evidence becomes INCONCLUSIVE. The bond remains locked for bounded reassessment instead of forcing a verdict.</p></HoverCard>
      <HoverCard><ArrowUpRight size={19}/><h3 style={{marginTop:24}}>Built for verification</h3><p>Every consequential action is intended to finish with a finalized transaction, execution result, explorer link and reproducible evidence record.</p></HoverCard>
    </div></section>
  </Shell>;
}
