#!/usr/bin/env node
// Fetch AUD->JPY daily rates, merge into public/rates.json. Tries Frankfurter v1 (ECB), then v2 ECB, then v2 blended.
import fs from 'node:fs';
const FILE=process.env.RATES_FILE||'public/rates.json';
const HOSTS=(process.env.FRANKFURTER_HOSTS||'https://api.frankfurter.dev').split(',');
import {parse} from '../src/parse-rates.js';
export {parse};
export function merge(old,add,{maxMove=.15}={}){const rates={...old};let n=0;const keys=Object.keys(add).sort();
 for(const d of keys){const v=add[d];if(!(v>20&&v<400))throw new Error(`implausible rate ${v} on ${d}`);
  const prev=Object.entries(rates).filter(([k])=>k<d).sort().at(-1);if(prev&&Math.abs(v/prev[1]-1)>maxMove)throw new Error(`rate jump >${maxMove*100}% on ${d}: ${prev[1]} -> ${v}`);
  if(rates[d]!==v){rates[d]=v;n++}}
 return{rates:Object.fromEntries(Object.entries(rates).sort()),changed:n}}
async function get(url,tries=3){let err;for(let i=0;i<tries;i++){try{const ac=new AbortController(),t=setTimeout(()=>ac.abort(),15000);const r=await fetch(url,{signal:ac.signal,headers:{'user-agent':'ozyen-rate-bot'}});clearTimeout(t);if(!r.ok)throw new Error('HTTP '+r.status);return await r.json()}catch(e){err=e;await new Promise(r=>setTimeout(r,i*1500))}}throw err}
export async function run(){
 const cur=JSON.parse(fs.readFileSync(FILE,'utf8')),last=Object.keys(cur.rates).sort().at(-1),d=new Date(last+'T00:00:00');d.setDate(d.getDate()-5);const from=d.toISOString().slice(0,10);
 const tries=[];for(const h of HOSTS)tries.push(`${h}/v1/${from}..?base=AUD&symbols=JPY`,`${h}/v2/providers/ecb/rates?base=AUD&quotes=JPY&from=${from}`,`${h}/v2/rates?base=AUD&quotes=JPY&from=${from}`);
 let add=null,used='',errs=[];for(const u of tries){try{const o=parse(await get(u));if(Object.keys(o).length){add=o;used=u;break}errs.push(u+' -> no JPY data')}catch(e){errs.push(u+' -> '+e.message)}}
 if(!add){console.error('All sources failed:\n'+errs.join('\n'));process.exit(1)}
 let m;try{m=merge(cur.rates,add)}catch(e){console.error('REFUSED: '+e.message);process.exit(2)}
 const keys=Object.keys(m.rates);cur.rates=m.rates;cur.updated=keys.at(-1);
 if(m.changed){fs.writeFileSync(FILE+'.tmp',JSON.stringify(cur,null,1));fs.renameSync(FILE+'.tmp',FILE)}
 console.log(`ok: ${m.changed} new/changed, latest ${cur.updated}, source ${used.split('?')[0]}`);return m.changed}
if(import.meta.url===`file://${process.argv[1]}`)run();
