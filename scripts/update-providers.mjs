// Refresh Wise/OFX/major-bank rows in public/providers.json from Wise's public comparison feed.
// Never throws on bad data: leaves the file untouched and exits 0 so deploys continue.
import fs from 'node:fs';
const F='public/providers.json', AMT=1000;
const URL=process.env.OZ_PROV_URL||`https://wise.com/gateway/v4/comparisons?sourceCurrency=AUD&targetCurrency=JPY&sendAmount=${AMT}`;
const BANKS={'national-australia-bank':'NAB','anz':'ANZ','commonwealth-bank-of-australia':'CBA','westpac':'Westpac'};
const ok=(n,lo,hi)=>Number.isFinite(n)&&n>=lo&&n<=hi;
let q={};
try{
 const r=await fetch(URL,{headers:{accept:'application/json'}});
 if(!r.ok)throw new Error('HTTP '+r.status);
 const j=await r.json();
 q={};for(const p of j.providers||[]){const x=p.quotes?.[0];if(x)q[p.alias]={...x,name:p.name};}
 const prov=JSON.parse(fs.readFileSync(F,'utf8'));
 const get=id=>prov.find(p=>p.id===id);
 const day=s=>String(s).slice(0,10);
 let n=0;
 const w=q.wise;
 if(w&&w.isConsideredMidMarketRate&&ok(w.fee,0,50)&&get('wise')){
  Object.assign(get('wise'),{margin:+(w.fee/AMT*100).toFixed(2),fee:0,verified:day(w.dateCollected),
   source:`Wise public comparison feed, A$${AMT} to JPY: Wise fee A$${w.fee} at mid-market rate (modelled as % of amount).`});n++;}
 const o=q.ofx;
 if(o&&ok(o.markup,0,10)&&ok(o.fee,0,100)&&get('ofx')){
  Object.assign(get('ofx'),{margin:+o.markup.toFixed(2),fee:o.fee,verified:day(o.dateCollected),
   source:`Wise public comparison feed, A$${AMT} to JPY: OFX rate markup ${o.markup.toFixed(2)}% + A$${o.fee} fee.`});n++;}
 const b=Object.keys(BANKS).filter(k=>q[k]&&ok(q[k].markup,0,15)&&ok(q[k].fee,0,100));
 if(b.length>=2&&get('bank')){
  const m=b.reduce((s,k)=>s+q[k].markup,0)/b.length, f=b.reduce((s,k)=>s+q[k].fee,0)/b.length;
  const d=b.map(k=>day(q[k].dateCollected)).sort()[0];
  Object.assign(get('bank'),{margin:+m.toFixed(2),fee:+f.toFixed(2),verified:d,
   source:`Average of ${b.map(k=>BANKS[k]+' '+q[k].markup.toFixed(2)+'%').join(', ')} (Wise public comparison feed, A$${AMT} to JPY, bank transfer). Other banks not listed.`});n++;}
 if(n)fs.writeFileSync(F,JSON.stringify(prov,null,1)+'\n');
 console.log('providers updated:',n);
}catch(e){console.log('providers not updated:',e.message);}


// Best-effort: Travelex online cash JPY rate (row "kiosk") vs Wise mid-market. Skips silently if page has no rate.
try{
 const mid=q.wise?.rate; const kk=JSON.parse(fs.readFileSync(F,'utf8'));
 const t=await (await fetch('https://www.travelex.com.au/',{headers:{'user-agent':'Mozilla/5.0'}})).text();
 const m=t.match(/Japanese\s*Yen[\s\S]{0,300}?([0-9]{2,3}\.[0-9]+)\s*JPY/i);
 if(m&&mid&&ok(mid,50,200)){const r=+m[1],mg=(mid-r)/mid*100;
  const row=kk.find(p=>p.id==='kiosk');
  if(row&&ok(mg,0.5,15)){Object.assign(row,{margin:+mg.toFixed(2),fee:0,verified:new Date().toISOString().slice(0,10),source:`Travelex AU online cash rate ${r} JPY per A$ vs mid ${mid} (Wise feed) = ${mg.toFixed(1)}%. Online is Travelex best rate; in-store/airport is higher.`});fs.writeFileSync(F,JSON.stringify(kk,null,1)+'\n');console.log('kiosk updated');}}
}catch(e){console.log('kiosk not updated:',e.message);}
