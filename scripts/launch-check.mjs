#!/usr/bin/env node
// Go-live gate. Lists blockers (must fix) and warnings. Exit 1 on blockers when --strict.
import fs from 'node:fs';
const S=JSON.parse(fs.readFileSync('config/site.json','utf8')),P=JSON.parse(fs.readFileSync('public/providers.json','utf8')),R=JSON.parse(fs.readFileSync('public/rates.json','utf8'));
const B=[],W=[];
if(!S.domainConfirmed)B.push('Domain not confirmed. Register it, then set domainConfirmed:true in config/site.json.');
if(!S.abn)B.push('ABN missing in config/site.json (shown in footer + legal pages).');
if(!S.contactEmail)B.push('contactEmail missing in config/site.json (needed on privacy page).');
const ver=P.filter(p=>p.verified);if(!ver.length)B.push('No provider has verified figures. Live build hides unverified providers, so the list is empty.');
else if(ver.length<P.length)W.push(`${P.length-ver.length} of ${P.length} providers unverified (hidden in live build).`);
const noLink=P.filter(p=>p.aff&&!p.url);if(noLink.length)W.push('No affiliate link yet: '+noLink.map(p=>p.name).join(', ')+' (shown as "link coming soon").');
if(!S.analytics.plausibleDomain)W.push('No analytics set (analytics.plausibleDomain).');
const age=(Date.now()-new Date(R.updated+'T00:00:00'))/864e5;if(age>5)W.push(`Rates are ${Math.floor(age)} days old.`);
console.log(B.length?'BLOCKERS:\n'+B.map(x=>' x '+x).join('\n'):'No blockers.');if(W.length)console.log('WARNINGS:\n'+W.map(x=>' ! '+x).join('\n'));
console.log('\nLEGAL (not checkable by code): get advice on whether ranking FX providers needs an AFSL (or authorised-rep arrangement) before launch.');
if(B.length&&process.argv.includes('--strict'))process.exit(1);
