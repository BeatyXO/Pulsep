'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ExternalLink, RefreshCw, ShieldAlert, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Shell from './Shell';
import { EXPLORER, checkPending, formatError, loadPending, readContract, writeContract } from '@/lib/chain';
import { classificationLabel, formatDate, formatGEN, shortAddress } from '@/lib/format';
import type { Deployment, Pact, PendingTx, Period, WalletSession } from '@/lib/types';

export default function ViewPactClient(){
  const search=useSearchParams();const pactId=search.get('id')||'';
  const [wallet,setWallet]=useState<WalletSession|null>(null),[deployment,setDeployment]=useState<Deployment|null>(null),[pact,setPact]=useState<Pact|null>(null),[period,setPeriod]=useState<Period|null>(null),[pending,setPending]=useState<PendingTx|null>(null),[credit,setCredit]=useState('0'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  useEffect(()=>{setPending(loadPending());fetch('/deployment.json',{cache:'no-store'}).then(r=>r.json()).then(setDeployment).catch(()=>setError('Deployment configuration unavailable.'));},[]);
  async function refresh(){if(!deployment?.verified||!pactId)return;setError('');try{const detail=await readContract<Pact>(deployment,'get_pact',[pactId]);setPact(detail);if(detail.period_count>0)setPeriod(await readContract<Period>(deployment,'get_current_period',[pactId]));else setPeriod(null);if(wallet)setCredit((await readContract<{claimable:string}>(deployment,'get_accounting',[wallet.address])).claimable);}catch(e){setError(formatError(e));}}
  useEffect(()=>{void refresh();},[deployment,pactId,wallet?.address]);
  const role=useMemo(()=>!wallet||!pact?'observer':wallet.address===pact.customer?'customer':wallet.address===pact.provider?'provider':'observer',[wallet,pact]);
  async function transact(method:string,args:unknown[],value=0n){if(!deployment||!wallet)throw new Error('Connect the required wallet.');setBusy(true);setError('');setMessage('');try{const p=await writeContract(deployment,wallet,method,args,value,pactId);setPending(p);setMessage('Transaction submitted. Do not repeat the action until the transaction finalizes with successful execution.');}catch(e){setError(formatError(e));}finally{setBusy(false);}}
  async function check(){if(!pending)return;setBusy(true);try{const outcome=await checkPending(pending);if(outcome==='pending')setMessage('Transaction is still pending or awaiting finality.');else{setPending(loadPending());setMessage(outcome==='success'?'Transaction finalized successfully. Refreshing contract state.':'Transaction finalized without successful execution.');await refresh();}}catch(e){setError(formatError(e));}finally{setBusy(false);}}
  const nowSeconds=Date.now()/1000;const ended=period?nowSeconds>=period.assessment_opens_at:false;const cooldownReady=period?period.status!=='INCONCLUSIVE'||nowSeconds>=period.last_assessment_at+300:false;const expired=period?nowSeconds>=period.evidence_deadline:false;const terminal=period&&['SETTLED','EXPIRED_UNRESOLVED'].includes(period.status);
  return <Shell wallet={wallet} onWallet={setWallet}><main className="content-page"><Link href="/" className="ghost" style={{marginBottom:24}}><ArrowLeft size={14}/>All pacts</Link>
    {!pactId&&<div className="error">No pact ID was supplied.</div>}{error&&<div className="error" style={{marginBottom:14}}>{error}</div>}{message&&<div className="success" style={{marginBottom:14}}>{message}</div>}
    {pending&&<div className="notice" style={{marginBottom:14}}><div className="actions"><span>Pending {pending.method} · <a href={`${EXPLORER}/transactions/${pending.hash}`} target="_blank" rel="noreferrer" className="mono">{pending.hash.slice(0,12)}… <ExternalLink size={11} style={{display:'inline'}}/></a></span><button className="secondary" disabled={busy} onClick={()=>void check()}><RefreshCw size={13}/>Check result</button></div></div>}
    {!deployment?.verified&&<div className="notice">Live detail is unavailable until a verified Studionet deployment is configured.</div>}
    {deployment?.verified&&!pact&&<div className="empty"><h3>Reading pact…</h3><p>Finalized contract state only.</p></div>}
    {pact&&<>
      <div className="page-title"><div><div className="eyebrow">{pact.id} · {pact.status}</div><h1>{pact.title}</h1><p>{pact.service} · provider {shortAddress(pact.provider)} · customer {shortAddress(pact.customer)}</p></div><div className="actions"><button className="secondary" onClick={()=>void refresh()}><RefreshCw size={14}/>Refresh</button></div></div>
      <div className="two-col"><div className="stack">
        {period&&<div className="panel"><div className="eyebrow">Period {period.index} · {period.status}</div><div className={`classification ${String(period.classification||'').toLowerCase()}`}>{period.classification?classificationLabel[period.classification]:period.status==='FUNDED'?'Service period active':'Awaiting assessment'}</div><p>{period.assessment?.reason||'The bond is locked while this period follows the frozen SLA and evidence policy.'}</p>
          <div className="meta"><span>Started</span><strong>{formatDate(period.started_at)}</strong></div><div className="meta"><span>Ends</span><strong>{formatDate(period.ends_at)}</strong></div><div className="meta"><span>Assessment opens</span><strong>{formatDate(period.assessment_opens_at)}</strong></div><div className="meta"><span>Evidence deadline</span><strong>{formatDate(period.evidence_deadline)}</strong></div><div className="meta"><span>Bond</span><strong>{formatGEN(period.bond)} simulated GEN</strong></div><div className="meta"><span>Assessments</span><strong>{period.assessment_attempts} · 5 minute retry cooldown</strong></div>
        </div>}
        {period?.assessment&&<><div className="panel"><h2>Evidence timeline</h2>{period.assessment.timeline.length?<div className="timeline">{period.assessment.timeline.map((event,i)=><div className="timeline-item" key={`${event.source_id}-${i}`}><small>{event.at} · {event.source_id}</small><strong>{event.event}</strong></div>)}</div>:<p>No normalized timeline was needed for this assessment.</p>}</div>
          <div className="panel"><h2>Source findings</h2>{period.assessment.source_findings.map(f=><div key={f.id} className="meta" style={{gridTemplateColumns:'130px 1fr'}}><span>{f.id}<br/><b>{f.state}</b></span><div><strong>{f.reason}</strong>{f.quote&&<blockquote style={{margin:'9px 0 0',color:'var(--muted)'}}>“{f.quote}”</blockquote>}</div></div>)}</div></>}
        <div className="panel"><h2>Frozen SLA</h2><p>{pact.service_scope}</p>{pact.sla_clauses?.map((c,i)=><div className="meta" key={i}><span>Clause {i+1}</span><strong>{c}</strong></div>)}<div className="meta"><span>Terms hash</span><code className="mono">{pact.terms_hash}</code></div></div>
        <div className="panel"><h2>Evidence authority</h2>{pact.sources?.map(source=><div className="meta" key={source.id}><span>{source.role}<br/>{source.id}</span><div><a href={source.url} target="_blank" rel="noreferrer">{source.url} <ExternalLink size={11} style={{display:'inline'}}/></a><p style={{margin:'4px 0'}}>{source.scope}</p></div></div>)}</div>
      </div>
      <aside className="stack"><div className="panel"><h2>Next action</h2><p>Connected role: <strong>{role}</strong>. Pulsep never treats a wallet prompt or an Accepted consensus as final settlement by itself.</p><div className="actions" style={{marginTop:16}}>
        {pact.status==='PROPOSED'&&role==='provider'&&<button className="primary" disabled={busy} onClick={()=>void transact('accept_and_fund',[pact.id],BigInt(pact.bond))}>Accept + fund first period</button>}
        {pact.status==='PROPOSED'&&role==='customer'&&<button className="secondary" disabled={busy} onClick={()=>void transact('cancel_proposal',[pact.id])}>Cancel proposal</button>}
        {pact.status==='ACTIVE'&&period&&!terminal&&ended&&!expired&&cooldownReady&&<button className="primary" disabled={busy} onClick={()=>void transact('assess_period',[pact.id,period.index])}>{period.status==='INCONCLUSIVE'?'Reassess period':'Assess period'}</button>}
        {pact.status==='ACTIVE'&&period?.status==='INCONCLUSIVE'&&!terminal&&!expired&&!cooldownReady&&<p>Reassessment cooldown is active until {formatDate(period.last_assessment_at+300)}. Bond remains locked.</p>}
        {pact.status==='ACTIVE'&&period&&!terminal&&!ended&&<p>Evidence matures before assessment opens at {formatDate(period.assessment_opens_at)}.</p>}
        {pact.status==='ACTIVE'&&period&&!terminal&&expired&&<button className="secondary" disabled={busy} onClick={()=>void transact('expire_unresolved',[pact.id,period.index])}>Expire unresolved period</button>}
        {pact.status==='ACTIVE'&&period&&terminal&&role==='provider'&&<button className="primary" disabled={busy} onClick={()=>void transact('fund_next_period',[pact.id],BigInt(pact.bond))}>Fund next period</button>}
        {pact.status==='ACTIVE'&&period&&terminal&&['customer','provider'].includes(role)&&<button className="secondary" disabled={busy} onClick={()=>void transact('close_pact',[pact.id])}>Close future renewal</button>}
        {BigInt(credit||0)>0n&&<button className="secondary" disabled={busy} onClick={()=>void transact('withdraw',[])}><WalletCards size={14}/>Withdraw {formatGEN(credit)} GEN</button>}
      </div>{!wallet&&<p><ShieldAlert size={13} style={{display:'inline'}}/> Connect a wallet to reveal role-authorized writes.</p>}</div>
      <div className="panel"><h2>Settlement map</h2><div className="meta"><span>No breach</span><strong>Provider 100%</strong></div><div className="meta"><span>Minor</span><strong>Customer {(pact.customer_bps?.minor||0)/100}%</strong></div><div className="meta"><span>Major</span><strong>Customer {(pact.customer_bps?.major||0)/100}%</strong></div><div className="meta"><span>Severe</span><strong>Customer {(pact.customer_bps?.severe||0)/100}%</strong></div><p><CheckCircle2 size={13} style={{display:'inline'}}/> These percentages were frozen before provider acceptance.</p></div>
      </aside></div>
    </>}
  </main></Shell>;
}
