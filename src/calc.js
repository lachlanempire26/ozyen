// Pure maths. dir 'aud' = user sends AUD, gets JPY. dir 'jpy' = user sends JPY, gets AUD.
export function calc(p,amt,r,dir){
 if(dir==='aud'){const ideal=amt*r,rec=Math.max(0,amt-p.fee)*r*(1-p.margin/100);return{rec,loss:ideal-rec,ideal,eff:amt?rec/amt:0}}
 const ideal=amt/r,rec=Math.max(0,ideal*(1-p.margin/100)-p.fee);return{rec,loss:ideal-rec,ideal,eff:rec?amt/rec:0}}
export const rank=(provs,amt,r,dir)=>provs.map(p=>({p,c:calc(p,amt,r,dir)})).sort((a,b)=>b.c.rec-a.c.rec);
export function stats(rates,days,today){const K=Object.keys(rates).sort(),last=today||K.at(-1),c=new Date(last+'T00:00:00Z');c.setUTCDate(c.getUTCDate()-days);const s=c.toISOString().slice(0,10),v=K.filter(k=>k>=s).map(k=>rates[k]);
 let m=0;for(let i=1;i<v.length;i++)m+=Math.abs(v[i]/v[i-1]-1);return{n:v.length,hi:Math.max(...v),lo:Math.min(...v),av:v.reduce((a,b)=>a+b,0)/v.length,mv:v.length>1?m/(v.length-1)*100:0}}

// All-in cost of a provider vs mid-market, as % of the ideal amount.
export function costPct(p,amt,r,dir){const c=calc(p,amt,r,dir);return c.ideal?c.loss/c.ideal*100:0}
// Smallest "nice" amount where the best provider's all-in cost is within `slack` % of its margin floor
// (fixed fees stop mattering). Recomputed from live rate + provider data, so it moves when either changes.
export function sweetSpot(provs,r,dir,slack=.25){
 if(!provs.length||!(r>0))return null;
 const floor=Math.min(...provs.map(p=>p.margin)),target=floor+slack,lo=dir==='aud'?100:10000,hi=dir==='aud'?500000:50000000;
 const nice=v=>{const s=v<1000?50:v<10000?100:v<50000?500:v<500000?5000:50000;return Math.ceil(v/s)*s};
 for(let a=lo;a<=hi;a*=1.05){const n=nice(a),best=rank(provs,n,r,dir)[0];if(best&&costPct(best.p,n,r,dir)<=target)return{amount:n,target,floor,pct:costPct(best.p,n,r,dir),by:best.p}}
 return null}
// Age in whole days of the newest rate date vs a given "today" (YYYY-MM-DD).
export const ageDays=(d,today)=>Math.round((new Date(today+'T00:00:00')-new Date(d+'T00:00:00'))/864e5);

// Latest rate on or before (today - days). Returns {date,rate} or null when history does not reach that far.
export function rateAgo(rates,days,today){const K=Object.keys(rates).sort();if(!K.length)return null;const last=today||K.at(-1),c=new Date(last+'T00:00:00Z');c.setUTCDate(c.getUTCDate()-days);const t=c.toISOString().slice(0,10);let hit=null;for(const k of K){if(k<=t)hit=k;else break}return hit?{date:hit,rate:rates[hit]}:null}
