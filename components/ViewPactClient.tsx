'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ExternalLink, RefreshCw, ShieldAlert, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Shell from './Shell';
import { EXPLORER, checkPending, formatError, loadPending, readContract, writeContract } from '@/lib/chain';
import { classificationLabel, formatDate, formatGEN, shortAddress } from '@/lib/format';
import type { Deployment, Pact, PendingTx, Period, Revision, RevisionEvent, SlaPolicy, SlaVersion, WalletSession } from '@/lib/types';

const initialPolicy: SlaPolicy = {
  service: '', service_scope: '', sla_clauses: [],
  tier_rules: { minor: '', major: '', severe: '' }, sources: [],
};

export default function ViewPactClient() {
  const search = useSearchParams();
  const pactId = search.get('id') || '';
  const [wallet, setWallet] = useState<WalletSession | null>(null);
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [pact, setPact] = useState<Pact | null>(null);
  const [period, setPeriod] = useState<Period | null>(null);
  const [versions, setVersions] = useState<SlaVersion[]>([]);
  const [events, setEvents] = useState<RevisionEvent[]>([]);
  const [draft, setDraft] = useState<SlaPolicy>(initialPolicy);
  const [draftReady, setDraftReady] = useState(false);
  const [draftDirty, setDraftDirty] = useState(false);
  const [clausesText, setClausesText] = useState('');
  const [sourcesText, setSourcesText] = useState('[]');
  const [pending, setPending] = useState<PendingTx | null>(null);
  const [credit, setCredit] = useState('0');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setPending(loadPending());
    fetch('/deployment.json', { cache: 'no-store' }).then(r => r.json()).then(setDeployment).catch(() => setError('Deployment configuration unavailable.'));
  }, []);

  async function refresh() {
    if (!deployment?.verified || !pactId) return;
    setError('');
    try {
      const [detail, history, revisionHistory] = await Promise.all([
        readContract<Pact>(deployment, 'get_pact', [pactId]),
        readContract<SlaVersion[]>(deployment, 'get_sla_versions', [pactId, 0, 8]),
        readContract<RevisionEvent[]>(deployment, 'get_revision_history', [pactId, 0, 20]),
      ]);
      setPact(detail);
      setVersions(history);
      setEvents(revisionHistory);
      if (!draftReady && history.length) {
        const policy = history[history.length - 1].policy;
        setDraft(policy);
        setClausesText(policy.sla_clauses.join('\n'));
        setSourcesText(JSON.stringify(policy.sources, null, 2));
        setDraftReady(true);
      }
      setPeriod(detail.period_count > 0 ? await readContract<Period>(deployment, 'get_current_period', [pactId]) : null);
      if (wallet) setCredit((await readContract<{ claimable: string }>(deployment, 'get_accounting', [wallet.address])).claimable);
    } catch (e) { setError(formatError(e)); }
  }

  useEffect(() => { void refresh(); }, [deployment, pactId, wallet?.address]);

  const role = useMemo(() => !wallet || !pact ? 'observer' : wallet.address === pact.customer ? 'customer' : wallet.address === pact.provider ? 'provider' : 'observer', [wallet, pact]);
  const currentVersion = pact?.active_sla_version || 1;
  const currentRecord = versions.find(v => v.version === currentVersion) || versions[0];
  const pendingRevision: Revision | null = pact?.pending_revision || null;
  const terminal = Boolean(period && ['SETTLED', 'EXPIRED_UNRESOLVED'].includes(period.status));
  const nowSeconds = Date.now() / 1000;
  const ended = Boolean(period && nowSeconds >= period.assessment_opens_at);
  const cooldownReady = Boolean(period && (period.status !== 'INCONCLUSIVE' || nowSeconds >= period.last_assessment_at + 300));
  const expired = Boolean(period && nowSeconds >= period.evidence_deadline);
  const proposalExpired = Boolean(pendingRevision && nowSeconds >= pendingRevision.expires_at);

  useEffect(() => {
    if (!draftDirty && currentRecord) {
      setDraft(currentRecord.policy);
      setClausesText(currentRecord.policy.sla_clauses.join('\n'));
      setSourcesText(JSON.stringify(currentRecord.policy.sources, null, 2));
      setDraftReady(true);
    }
  }, [currentRecord?.version, draftDirty]);

  async function transact(method: string, args: unknown[], value = 0n) {
    if (!deployment || !wallet) { setError('Connect the required party wallet.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      const tx = await writeContract(deployment, wallet, method, args, value, pactId);
      setPending(tx);
      setMessage('Transaction submitted. Wait for finalization and successful execution before relying on the updated pact state.');
    } catch (e) { setError(formatError(e)); } finally { setBusy(false); }
  }

  async function check() {
    if (!pending) return;
    setBusy(true);
    try {
      const outcome = await checkPending(pending);
      if (outcome === 'pending') setMessage('Transaction is still pending or awaiting finality.');
      else {
        setPending(loadPending());
        setMessage(outcome === 'success' ? 'Transaction finalized successfully. Refreshing canonical contract state.' : 'Transaction finalized without successful execution.');
        if (outcome === 'success') { setDraftReady(false); setDraftDirty(false); await refresh(); }
      }
    } catch (e) { setError(formatError(e)); } finally { setBusy(false); }
  }

  async function proposeRevision() {
    try {
      const sources = JSON.parse(sourcesText) as SlaPolicy['sources'];
      const policy = { service_scope: draft.service_scope.trim(), sla_clauses: clausesText.split('\n').map(x => x.trim()).filter(Boolean), tier_rules: draft.tier_rules, sources };
      if (!policy.service_scope || !policy.sla_clauses.length || !Array.isArray(sources)) throw new Error('Enter a scope, at least one clause, and a valid source list.');
      await transact('propose_revision', [pactId, JSON.stringify(policy)]);
    } catch (e) { setError(e instanceof Error ? e.message : 'Revision source JSON is invalid.'); }
  }

  const changeDraft = (update: Partial<SlaPolicy>) => { setDraftDirty(true); setDraft(value => ({ ...value, ...update })); };

  return <Shell wallet={wallet} onWallet={setWallet}><main className="content-page">
    <Link href="/" className="ghost" style={{ marginBottom: 24 }}><ArrowLeft size={14} />All pacts</Link>
    {!pactId && <div className="error">No pact ID was supplied.</div>}
    {error && <div className="error" style={{ marginBottom: 14 }}>{error}</div>}
    {message && <div className="success" style={{ marginBottom: 14 }}>{message}</div>}
    {pending && <div className="notice" style={{ marginBottom: 14 }}><div className="actions"><span>Pending {pending.method} · <a href={`${EXPLORER}/transactions/${pending.hash}`} target="_blank" rel="noreferrer" className="mono">{pending.hash.slice(0, 12)}… <ExternalLink size={11} style={{ display: 'inline' }} /></a></span><button className="secondary" disabled={busy} onClick={() => void check()}><RefreshCw size={13} />Check result</button></div></div>}
    {!deployment?.verified && <div className="notice">Live detail is unavailable until a verified Studionet deployment is configured.</div>}
    {deployment?.verified && !pact && <div className="empty"><h3>Reading pact…</h3><p>Finalized contract state only.</p></div>}
    {pact && <>
      <div className="page-title"><div><div className="eyebrow">{pact.id} · {pact.status}</div><h1>{pact.title}</h1><p>{pact.service} · provider {shortAddress(pact.provider)} · customer {shortAddress(pact.customer)}</p></div><div className="actions"><button className="secondary" onClick={() => { setDraftReady(false); void refresh(); }}><RefreshCw size={14} />Refresh</button></div></div>
      <div className="two-col"><div className="stack">
        {period && <div className="panel"><div className="eyebrow">Period {period.index} · {period.status}</div><div className="classification">SLA version {period.sla_version} · {period.terms_digest.slice(0, 12)}…</div><div className={`classification ${String(period.classification || '').toLowerCase()}`}>{period.classification ? classificationLabel[period.classification] : period.status === 'FUNDED' ? 'Service period active' : 'Awaiting assessment'}</div><p>{period.assessment?.reason || 'The bond is locked while this period follows the SLA version and evidence policy bound when it was funded.'}</p>
          <div className="meta"><span>Started</span><strong>{formatDate(period.started_at)}</strong></div><div className="meta"><span>Ends</span><strong>{formatDate(period.ends_at)}</strong></div><div className="meta"><span>Assessment opens</span><strong>{formatDate(period.assessment_opens_at)}</strong></div><div className="meta"><span>Evidence deadline</span><strong>{formatDate(period.evidence_deadline)}</strong></div><div className="meta"><span>Bond</span><strong>{formatGEN(period.bond)} simulated GEN</strong></div><div className="meta"><span>Assessments</span><strong>{period.assessment_attempts} · 5 minute retry cooldown</strong></div>
        </div>}
        {period?.assessment && <><div className="panel"><h2>Evidence timeline · version {period.assessment.sla_version}</h2>{period.assessment.timeline.length ? <div className="timeline">{period.assessment.timeline.map((event, i) => <div className="timeline-item" key={`${event.source_id}-${i}`}><small>{event.at} · {event.source_id}</small><strong>{event.event}</strong></div>)}</div> : <p>No normalized timeline was needed for this assessment.</p>}</div>
          <div className="panel"><h2>Source findings</h2>{period.assessment.source_findings.map(f => <div key={f.id} className="meta" style={{ gridTemplateColumns: '130px 1fr' }}><span>{f.id}<br /><b>{f.state}</b></span><div><strong>{f.reason}</strong>{f.quote && <blockquote style={{ margin: '9px 0 0', color: 'var(--muted)' }}>“{f.quote}”</blockquote>}</div></div>)}</div></>}
        {period && <PolicyPanel title={`Policy governing period ${period.index} · SLA v${period.sla_version}`} policy={period.policy} digest={period.terms_digest} />}
        <div className="panel"><h2>Current active SLA · version {currentVersion}</h2><p>New revisions apply only when a later period is funded. A funded period and its evidence policy are immutable.</p>{currentRecord && <PolicyPanel title={`SLA v${currentRecord.version}`} policy={currentRecord.policy} digest={currentRecord.digest} compact />}</div>
        <div className="panel"><h2>Immutable version history</h2>{versions.map((version, index) => <div key={version.version} className="timeline-item"><small>Version {version.version} · {version.version === currentVersion ? 'active' : 'historical'} · activated {version.activated_at ? formatDate(version.activated_at) : 'not activated'} · digest {version.digest}</small><strong>{version.policy.service_scope}</strong><p>{version.policy.sla_clauses.join(' · ')}</p>{index > 0 && <details><summary>Compare with version {version.version - 1}</summary><PolicyDiff before={versions[index - 1].policy} after={version.policy} /></details>}</div>)}</div>
        <div className="panel"><h2>Revision audit trail</h2>{events.length ? events.map(event => <div className="meta" key={event.sequence}><span>#{event.sequence} · {event.event}<br />{formatDate(event.timestamp)}</span><div><strong>v{event.base_version} → v{event.next_version} · {shortAddress(event.actor)}</strong><code className="mono">{event.proposal_id}</code></div></div>) : <p>No revisions have been proposed.</p>}</div>
      </div>
      <aside className="stack"><div className="panel"><h2>Next action</h2><p>Connected role: <strong>{role}</strong>. Pulsep requires successful finalized execution and then refreshes from contract state.</p><div className="actions" style={{ marginTop: 16 }}>
        {pact.status === 'PROPOSED' && role === 'provider' && <button className="primary" disabled={busy} onClick={() => void transact('accept_and_fund', [pact.id], BigInt(pact.bond))}>Accept + fund first period</button>}
        {pact.status === 'PROPOSED' && role === 'customer' && <button className="secondary" disabled={busy} onClick={() => void transact('cancel_proposal', [pact.id])}>Cancel proposal</button>}
        {pact.status === 'ACTIVE' && period && !terminal && ended && !expired && cooldownReady && <button className="primary" disabled={busy} onClick={() => void transact('assess_period', [pact.id, period.index])}>{period.status === 'INCONCLUSIVE' ? 'Reassess period' : 'Assess period'}</button>}
        {pact.status === 'ACTIVE' && period?.status === 'INCONCLUSIVE' && !terminal && !expired && !cooldownReady && <p>Reassessment cooldown is active until {formatDate(period.last_assessment_at + 300)}. Bond remains locked.</p>}
        {pact.status === 'ACTIVE' && period && !terminal && !ended && <p>Evidence matures before assessment opens at {formatDate(period.assessment_opens_at)}.</p>}
        {pact.status === 'ACTIVE' && period && !terminal && expired && <button className="secondary" disabled={busy} onClick={() => void transact('expire_unresolved', [pact.id, period.index])}>Expire unresolved period</button>}
        {pact.status === 'ACTIVE' && period && terminal && role === 'provider' && <button className="primary" disabled={busy} onClick={() => void transact('fund_next_period', [pact.id], BigInt(pact.bond))}>Fund next period · SLA v{pendingRevision?.status === 'APPROVED' && !proposalExpired ? pendingRevision.next_version : currentVersion}</button>}
        {pendingRevision && <div className="notice"><b>Pending v{pendingRevision.next_version} · {proposalExpired ? 'EXPIRED' : pendingRevision.status}</b><p>{shortAddress(pendingRevision.proposer)} proposed · expires {formatDate(pendingRevision.expires_at)}</p><p>Digest: <code className="mono">{pendingRevision.digest}</code></p><p>Only the exact counterparty can approve this proposal ID and digest.</p>
          {pendingRevision.status === 'PENDING' && !proposalExpired && role === (pendingRevision.proposer === pact.customer ? 'provider' : 'customer') && <button className="primary" disabled={busy} onClick={() => void transact('approve_revision', [pact.id, pendingRevision.proposal_id, pendingRevision.base_version, pendingRevision.digest])}>Approve exact revision</button>}
          {role === (pendingRevision.proposer === pact.customer ? 'customer' : 'provider') && <button className="secondary" disabled={busy} onClick={() => void transact('cancel_revision', [pact.id, pendingRevision.proposal_id])}>Cancel pending revision</button>}
          {proposalExpired && <button className="secondary" disabled={busy} onClick={() => void transact('expire_revision', [pact.id])}>Clear expired proposal</button>}
          {pendingRevision.status === 'APPROVED' && !proposalExpired && <p>Approved policy will activate atomically only when the provider funds the next period.</p>}
          {currentRecord && <PolicyDiff before={currentRecord.policy} after={pendingRevision.policy} />}
        </div>}
        {pact.status === 'ACTIVE' && ['customer', 'provider'].includes(role) && currentVersion < 8 && <RevisionEditor draft={draft} clausesText={clausesText} sourcesText={sourcesText} setClausesText={value => { setDraftDirty(true); setClausesText(value); }} setSourcesText={value => { setDraftDirty(true); setSourcesText(value); }} update={changeDraft} disabled={busy} onPropose={() => void proposeRevision()} />}
        {pact.status === 'ACTIVE' && period && terminal && ['customer', 'provider'].includes(role) && <button className="secondary" disabled={busy} onClick={() => void transact('close_pact', [pact.id])}>Close future renewal</button>}
        {BigInt(credit || 0) > 0n && <button className="secondary" disabled={busy} onClick={() => void transact('withdraw', [])}><WalletCards size={14} />Withdraw {formatGEN(credit)} GEN</button>}
      </div>{!wallet && <p><ShieldAlert size={13} style={{ display: 'inline' }} /> Connect a wallet to reveal role-authorized writes.</p>}</div>
      <div className="panel"><h2>Settlement map</h2><div className="meta"><span>No breach</span><strong>Provider 100%</strong></div><div className="meta"><span>Minor</span><strong>Customer {(pact.customer_bps?.minor || 0) / 100}%</strong></div><div className="meta"><span>Major</span><strong>Customer {(pact.customer_bps?.major || 0) / 100}%</strong></div><div className="meta"><span>Severe</span><strong>Customer {(pact.customer_bps?.severe || 0) / 100}%</strong></div><p><CheckCircle2 size={13} style={{ display: 'inline' }} /> Settlement percentages and wallets remain frozen across every SLA revision.</p></div>
      </aside></div>
    </>}
  </main></Shell>;
}

function PolicyPanel({ title, policy, digest, compact = false }: { title: string; policy: SlaPolicy; digest: string; compact?: boolean }) {
  return <div className={compact ? '' : 'panel'}><h2>{title}</h2><p>{policy.service_scope}</p><div className="meta"><span>Policy digest</span><code className="mono">{digest}</code></div>{policy.sla_clauses.map((clause, i) => <div className="meta" key={`${clause}-${i}`}><span>Clause {i + 1}</span><strong>{clause}</strong></div>)}{Object.entries(policy.tier_rules).map(([tier, rule]) => <div className="meta" key={tier}><span>{tier.toUpperCase()} tier</span><strong>{rule}</strong></div>)}{policy.sources.map(source => <div className="meta" key={source.id}><span>{source.role} · {source.id}</span><div><a href={source.url} target="_blank" rel="noreferrer">{source.url} <ExternalLink size={11} style={{ display: 'inline' }} /></a><p>{source.scope}</p></div></div>)}</div>;
}

function PolicyDiff({ before, after }: { before: SlaPolicy; after: SlaPolicy }) {
  return <div className="meta"><div><b>Before</b><p>{before.service_scope}</p>{before.sla_clauses.map((x, i) => <p key={i}>{x}</p>)}{Object.entries(before.tier_rules).map(([k, v]) => <p key={k}>{k}: {v}</p>)}{before.sources.map(x => <p key={x.id}>{x.role} · {x.id} · {x.url}</p>)}</div><div><b>After</b><p>{after.service_scope}</p>{after.sla_clauses.map((x, i) => <p key={i}>{x}</p>)}{Object.entries(after.tier_rules).map(([k, v]) => <p key={k}>{k}: {v}</p>)}{after.sources.map(x => <p key={x.id}>{x.role} · {x.id} · {x.url}</p>)}</div></div>;
}

function RevisionEditor({ draft, clausesText, sourcesText, setClausesText, setSourcesText, update, disabled, onPropose }: { draft: SlaPolicy; clausesText: string; sourcesText: string; setClausesText: (value: string) => void; setSourcesText: (value: string) => void; update: (value: Partial<SlaPolicy>) => void; disabled: boolean; onPropose: () => void }) {
  return <details className="notice"><summary>Propose future SLA revision</summary><p>Only service scope, SLA clauses, tier meanings, and provider/independent source policy can change. Bond, parties, and payout basis points remain fixed. Current funded period stays on its bound version.</p>
    <label>Service scope<textarea value={draft.service_scope} onChange={e => update({ service_scope: e.target.value })} rows={3} /></label>
    <label>SLA clauses · one per line<textarea value={clausesText} onChange={e => setClausesText(e.target.value)} rows={4} /></label>
    <label>MINOR rule<textarea value={draft.tier_rules.minor} onChange={e => update({ tier_rules: { ...draft.tier_rules, minor: e.target.value } })} rows={2} /></label>
    <label>MAJOR rule<textarea value={draft.tier_rules.major} onChange={e => update({ tier_rules: { ...draft.tier_rules, major: e.target.value } })} rows={2} /></label>
    <label>SEVERE rule<textarea value={draft.tier_rules.severe} onChange={e => update({ tier_rules: { ...draft.tier_rules, severe: e.target.value } })} rows={2} /></label>
    <label>Evidence sources · JSON array<textarea value={sourcesText} onChange={e => setSourcesText(e.target.value)} rows={8} spellCheck={false} /></label>
    <PolicyDiff before={draft} after={{ ...draft, sla_clauses: clausesText.split('\n').map(x => x.trim()).filter(Boolean), sources: (() => { try { return JSON.parse(sourcesText); } catch { return []; } })() }} />
    <button className="primary" disabled={disabled} onClick={onPropose}>Propose / replace pending revision</button>
  </details>;
}
