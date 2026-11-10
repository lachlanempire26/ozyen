#!/usr/bin/env node
// Lists providers whose figures are unverified or older than staleDays. Exit 3 if any. Writes provider-report.md.
import fs from 'node:fs';
export function stale(provs,days,now=new Date()){return provs.filter(p=>!p.verified||(now-new Date(p.verified+'T00:00:00'))/864e5>days).map(p=>({name:p.name,verified:p.verified||null,ageDays:p.verified?Math.floor((now-new Date(p.verified+'T00:00:00'))/864e5):null}))}
if(import.meta.url===`file://${process.argv[1]}`){
 const P=JSON.parse(fs.readFileSync(process.env.PROVIDERS_FILE||'public/providers.json','utf8')),S=JSON.parse(fs.readFileSync('config/site.json','utf8'));
 const s=stale(P,S.staleDays);
 if(!s.length){console.log('all provider figures fresh');process.exit(0)}
 const md=`Provider figures need re-checking (older than ${S.staleDays} days, or never verified):\n\n`+s.map(x=>`- [ ] **${x.name}** — ${x.verified?`last verified ${x.verified} (${x.ageDays} days ago)`:'never verified'}`).join('\n')+`\n\nFor each: get a real quote for A$1,000 and A$5,000 to JPY, note margin and fee, then set \`verified\` (YYYY-MM-DD) and \`source\` in public/providers.json.\n`;
 fs.writeFileSync('provider-report.md',md);console.log(md);process.exit(3)}
