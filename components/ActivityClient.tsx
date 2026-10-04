'use client';

import { ExternalLink, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import Shell from './Shell';
import { EXPLORER, checkPending, lastTxKey, loadPending } from '@/lib/chain';
import { shortAddress } from '@/lib/format';
import type { PendingTx, WalletSession } from '@/lib/types';

type LastTx = PendingTx & { outcome: 'success'|'error'; checkedAt: number };
export default function ActivityClient(){
  const [wallet,setWallet]=useState<WalletSession|null>(null),[pending,setPending]=useState<PendingTx|null>(null),[last,setLast]=useState<LastTx|null>(null),[message,setMessage]=useState('');
  function reload(){setPending(loadPending());try{setLast(JSON.parse(localStorage.getItem(lastTxKey)||'null'));}catch{setLast(null)}}
  useEffect(()=>reload(),[]);
  async function check(){if(!pending)return;const result=await checkPending(pending);setMessage(result==='pending'?'Still pending / awaiting finality.':result==='success'?'Finalized with successful execution.':'Finalized without successful execution.');reload();}
  return <Shell wallet={wallet} onWallet={setWallet}><main className="content-page"><div className="page-title"><div><div className="eyebrow">Transaction recovery</div><h1>Activity</h1><p>Local transaction memory is a convenience only. Final truth comes from the Studionet receipt and contract state.</p></div></div>{message&&<div className="notice" style={{marginBottom:14}}>{message}</div>}
    <div className="two-col"><div className="stack"><div className="panel"><h2>Pending transaction</h2>{pending?<><div className="meta"><span>Action</span><strong>{pending.method}</strong></div><div className="meta"><span>Pact</span><strong>{pending.pactId||'—'}</strong></div><div className="meta"><span>Account</span><strong>{shortAddress(pending.account)}</strong></div><div className="meta"><span>Hash</span><a className="mono" href={`${EXPLORER}/transactions/${pending.hash}`} target="_blank" rel="noreferrer">{pending.hash} <ExternalLink size={11} style={{display:'inline'}}/></a></div><button className="secondary" onClick={()=>void check()}><RefreshCw size={14}/>Check finalized result</button></>:<p>No locally remembered pending Pulsep transaction.</p>}</div>
      <div className="panel"><h2>Last resolved transaction</h2>{last?<><div className="meta"><span>Outcome</span><strong>{last.outcome==='success'?'Successful execution':'Execution failed / cancelled'}</strong></div><div className="meta"><span>Action</span><strong>{last.method}</strong></div><div className="meta"><span>Hash</span><a className="mono" href={`${EXPLORER}/transactions/${last.hash}`} target="_blank" rel="noreferrer">{last.hash}</a></div></>:<p>No resolved transaction stored in this browser yet.</p>}</div></div>
    <aside className="stack"><div className="panel"><h2>Why this exists</h2><p>If the wallet returned a transaction hash and the page reloads, Pulsep retains that hash so the user does not accidentally resubmit an uncertain action.</p></div><div className="panel"><h2>What it does not mean</h2><p>Browser storage is not canonical product state. Removing this local record cannot change a pact, a period, a validator decision or a credit.</p></div></aside></div>
  </main></Shell>;
}
