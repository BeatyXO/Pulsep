'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Shell from './Shell';
import { formatError, writeContract } from '@/lib/chain';
import { parseGEN } from '@/lib/format';
import type { Deployment, EvidenceSource, WalletSession } from '@/lib/types';

const emptySource = (index:number): EvidenceSource => ({ id: index === 0 ? 'provider_status' : 'independent_monitor', role: index === 0 ? 'PROVIDER' : 'INDEPENDENT', url: '', scope: '' });

export default function NewPactClient(){
  const [wallet,setWallet]=useState<WalletSession|null>(null),[deployment,setDeployment]=useState<Deployment|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  const [id,setId]=useState('PULSE-'),[title,setTitle]=useState(''),[service,setService]=useState(''),[scope,setScope]=useState(''),[provider,setProvider]=useState(''),[periodHours,setPeriodHours]=useState('24'),[bond,setBond]=useState('0.01');
  const [clauses,setClauses]=useState(''),[minor,setMinor]=useState('Short, material degradation that breaches the SLA but remains below the major threshold.'),[major,setMajor]=useState('A sustained outage or degradation that crosses the pact\'s major threshold.'),[severe,setSevere]=useState('A critical or extended outage that crosses the pact\'s severe threshold.');
  const [minorPct,setMinorPct]=useState('20'),[majorPct,setMajorPct]=useState('60'),[severePct,setSeverePct]=useState('100');
  const [sources,setSources]=useState<EvidenceSource[]>([emptySource(0),emptySource(1)]);
  useEffect(()=>{fetch('/deployment.json',{cache:'no-store'}).then(r=>r.json()).then(setDeployment).catch(()=>setError('Deployment configuration unavailable.'));},[]);
  const canSubmit=useMemo(()=>!!wallet&&!!deployment?.verified&&!busy,[wallet,deployment,busy]);
  const updateSource=(i:number,patch:Partial<EvidenceSource>)=>setSources(all=>all.map((s,n)=>n===i?{...s,...patch}:s));
  async function submit(){
    setError('');setMessage('');
    try{
      if(!wallet||!deployment) throw new Error('Connect the customer wallet after deployment is verified.');
      const periodSeconds=Math.round(Number(periodHours)*3600); if(!Number.isInteger(periodSeconds)||periodSeconds<900) throw new Error('Period length must be at least 15 minutes.');
      const clauseList=clauses.split('\n').map(x=>x.trim()).filter(Boolean); if(!clauseList.length) throw new Error('Add at least one SLA clause, one per line.');
      const pct=[Number(minorPct),Number(majorPct),Number(severePct)]; if(pct.some(x=>!Number.isInteger(x*100)||x<=0||x>100)||!(pct[0]<pct[1]&&pct[1]<pct[2])) throw new Error('Customer payout percentages must increase from minor to major to severe.');
      if(sources.some(s=>!s.id||!s.url||!s.scope)) throw new Error('Complete every evidence source.');
      const terms={id,title,service,service_scope:scope,provider,period_seconds:periodSeconds,bond_wei:parseGEN(bond),sla_clauses:clauseList,tier_rules:{minor,major,severe},customer_bps:{minor:Math.round(pct[0]*100),major:Math.round(pct[1]*100),severe:Math.round(pct[2]*100)},sources};
      setBusy(true);const pending=await writeContract(deployment,wallet,'propose_pact',[JSON.stringify(terms)],0n,id);setMessage(`Proposal submitted: ${pending.hash}. Wait for final execution success before asking the provider to fund it.`);
    }catch(e){setError(formatError(e));}finally{setBusy(false);}
  }
  return <Shell wallet={wallet} onWallet={setWallet}><main className="content-page">
    <div className="page-title"><div><div className="eyebrow">New reliability pact</div><h1>Freeze the rules first.</h1><p>The customer proposes. The provider must accept and fund the first period before the pact becomes active.</p></div></div>
    {error&&<div className="error" style={{marginBottom:14}}>{error}</div>}{message&&<div className="success" style={{marginBottom:14}}>{message}</div>}
    {!deployment?.verified&&<div className="notice" style={{marginBottom:14}}>Creation is locked until <code>deployment.json</code> points to a verified Pulsep deployment on Studionet 61999.</div>}
    <div className="two-col"><div className="panel"><div className="form">
      <div className="field-grid"><div className="field"><label>Pact ID</label><input value={id} onChange={e=>setId(e.target.value.toUpperCase())}/><small>Format: PULSE-… and immutable once proposed.</small></div><div className="field"><label>Provider wallet</label><input value={provider} onChange={e=>setProvider(e.target.value)} placeholder="0x…"/></div></div>
      <div className="field"><label>Title</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Production API reliability pact"/></div>
      <div className="field-grid"><div className="field"><label>Service</label><input value={service} onChange={e=>setService(e.target.value)} placeholder="Acme Production API"/></div><div className="field"><label>Period length (hours)</label><input value={periodHours} onChange={e=>setPeriodHours(e.target.value)} inputMode="decimal"/></div></div>
      <div className="field"><label>Covered service scope</label><textarea value={scope} onChange={e=>setScope(e.target.value)} placeholder="Describe the production endpoint/component covered by this pact and what is explicitly outside scope."/></div>
      <div className="field"><label>SLA clauses · one per line</label><textarea value={clauses} onChange={e=>setClauses(e.target.value)} placeholder={'Production endpoint should remain available throughout the funded period.\nMaintenance is excluded only when publicly announced before the incident begins.'}/></div>
      <div className="field"><label>Minor tier rule</label><textarea value={minor} onChange={e=>setMinor(e.target.value)}/></div><div className="field"><label>Major tier rule</label><textarea value={major} onChange={e=>setMajor(e.target.value)}/></div><div className="field"><label>Severe tier rule</label><textarea value={severe} onChange={e=>setSevere(e.target.value)}/></div>
      <div className="field-grid"><div className="field"><label>Period bond (simulated GEN)</label><input value={bond} onChange={e=>setBond(e.target.value)}/></div><div className="field"><label>Customer payout % · minor / major / severe</label><div className="field-grid"><input value={minorPct} onChange={e=>setMinorPct(e.target.value)}/><input value={majorPct} onChange={e=>setMajorPct(e.target.value)}/></div><input style={{marginTop:8}} value={severePct} onChange={e=>setSeverePct(e.target.value)}/></div></div>
      <div className="field"><label>Frozen public evidence sources</label><small>V1 requires at least one provider-controlled source and one independent source. New URLs cannot be introduced after the outcome is known.</small></div>
      {sources.map((source,i)=><div className="source-box" key={`${source.id}-${i}`}><header><strong>Source {i+1}</strong>{sources.length>2&&<button className="remove" onClick={()=>setSources(all=>all.filter((_,n)=>n!==i))}><Trash2 size={14}/></button>}</header><div className="field-grid"><div className="field"><label>ID</label><input value={source.id} onChange={e=>updateSource(i,{id:e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g,'')})}/></div><div className="field"><label>Role</label><select value={source.role} onChange={e=>updateSource(i,{role:e.target.value as EvidenceSource['role']})}><option>PROVIDER</option><option>INDEPENDENT</option><option>MAINTENANCE</option></select></div></div><div className="field"><label>HTTPS URL</label><input value={source.url} onChange={e=>updateSource(i,{url:e.target.value})} placeholder="https://status.example.com/history"/></div><div className="field"><label>Scope</label><input value={source.scope} onChange={e=>updateSource(i,{scope:e.target.value})} placeholder="Incident history for the covered production API"/></div></div>)}
      {sources.length<4&&<button className="ghost" onClick={()=>setSources(all=>[...all,emptySource(all.length)])}><Plus size={14}/>Add source</button>}
      <div className="actions"><button className="primary" disabled={!canSubmit} onClick={()=>void submit()}>{busy?'Preparing wallet…':'Propose pact'}</button></div>
    </div></div>
    <aside className="stack"><div className="panel"><h2>Trust boundary</h2><p>The frontend does not fetch evidence or compute a breach. It only prepares contract writes and renders finalized contract state.</p></div><div className="panel"><h2>Settlement boundary</h2><p>Validators classify the period. They never choose recipients or amounts. Your frozen basis points are applied deterministically.</p></div><div className="panel"><h2>Uncertainty</h2><p>If provider and independent evidence cannot support a reliable conclusion, Pulsep records INCONCLUSIVE and keeps the bond locked for reassessment after a five-minute cooldown until the evidence deadline.</p></div></aside>
    </div>
  </main></Shell>;
}
