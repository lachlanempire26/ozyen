export function parse(j){const out={};const num=v=>typeof v==='number'&&isFinite(v);
 if(Array.isArray(j)){for(const r of j){const q=String(r.quote||r.target||r.to||'JPY').toUpperCase(),v=r.rate??r.value;if(r.date&&q==='JPY'&&num(v))out[r.date]=v}}
 else if(j&&j.rates&&typeof j.rates==='object'){const f=Object.values(j.rates)[0];
  if(f&&typeof f==='object'){for(const[d,r]of Object.entries(j.rates)){const v=r.JPY??r.jpy;if(num(v))out[d]=v}}
  else if(j.date&&num(j.rates.JPY))out[j.date]=j.rates.JPY}
 else if(j&&j.date&&num(j.rate))out[j.date]=j.rate;
 return out}
