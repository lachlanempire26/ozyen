import {T as T0} from './text.js';
import {calc as calcOne,rank,costPct,sweetSpot,ageDays,rateAgo} from './calc.js';
import {parse} from './parse-rates.js';
import RATES from '../public/rates.json';
import PROVIDERS from '../public/providers.json';
import SITE from '../config/site.json';
import {F} from './factual.js';
const FACT=typeof __FACT__!=='undefined'&&__FACT__;
const LIVE=typeof __LIVE__!=='undefined'&&__LIVE__;
const X={en:{noHold:"OzYen is a comparison site. It does not hold, move or exchange money.",chartLbl:"AUD to JPY mid-market rate chart",visitSite:"Visit site",pvP2:"We do not use tracking cookies and we do not sell personal information.",mvH:"Today against earlier rates",mvNow:"Today",mvP:"Previous day",mv7:"7 days ago",mv30:"30 days ago",mv90:"90 days ago",mvPer:"A$1,000 bought",mvNA:"Not enough history",swOk:"Good size: all-in cost about {p}% vs mid-market, close to the lowest available.",swLow:"Your amount costs about {p}% all-in. Around {a} it drops to about {t}%. Fixed fees weigh less on bigger transfers.",swNone:"",stale:"Rate is {n} days old. Check the live rate before you transfer.",auto:"Auto-refreshing · last check {t}",lPriv:"Privacy",lTerms:"Terms",verOn:"Verified {d}",emptyH:"Provider comparison launching soon",emptyP:"We only list providers whose figures we have checked ourselves. The first verified providers will appear here shortly.",fVer:"Provider figures last verified {d}. Chart data: real daily history to {e}.",g6:"How to compare travel cards for Japan",g6d:"A checklist for Wise, Revolut and other travel cards."},
ja:{noHold:"OzYenは比較サイトです。資金のお預かり、送金、両替は行いません。",chartLbl:"豪ドル/日本円 ミッドマーケットレートのチャート",visitSite:"公式サイトへ",pvP2:"トラッキングCookieは使用せず、個人情報の販売も行いません。",mvH:"今日と過去のレートの比較",mvNow:"今日",mvP:"前日",mv7:"7日前",mv30:"30日前",mv90:"90日前",mvPer:"当時は1,000豪ドルで",mvNA:"データ不足",swOk:"ちょうどよい金額です。ミッドマーケット比の総コストは約{p}%で、ほぼ最安です。",swLow:"この金額の総コストは約{p}%です。{a}前後で約{t}%まで下がります。固定手数料は金額が大きいほど影響が小さくなります。",swNone:"",stale:"レートは{n}日前のものです。送金前に最新レートを確認してください。",auto:"自動更新中 · 最終確認 {t}",lPriv:"プライバシー",lTerms:"利用規約",verOn:"{d}確認済み",emptyH:"サービス比較は近日公開",emptyP:"当サイトで数値を確認できたサービスのみ掲載します。確認が済み次第、ここに表示されます。",fVer:"各社の数値は{d}に確認済み。チャートは{e}までの実際の日次データです。",g6:"日本向けトラベルカードの比べ方",g6d:"WiseやRevolutなどを比べるためのチェックリスト。"}};
const T={en:{...T0.en,...X.en,...(FACT?F.en:{})},ja:{...T0.ja,...X.ja,...(FACT?F.ja:{})}};
const SLUGS=['best-way-to-get-yen-in-australia','japan-atm-fees-for-australians','how-much-cash-to-take-to-japan','suica-and-pasmo-top-ups','tax-free-shopping-in-japan','compare-travel-cards-for-japan'];
const $=id=>document.getElementById(id),Q=(s,r=document)=>[...r.querySelectorAll(s)];
const R=document.documentElement.dataset.root||'./';
let lang=document.documentElement.lang==='ja'?'ja':'en',dir='aud',flt='all',rng=90;const H={...RATES.rates};
const keys=()=>Object.keys(H).sort(),vals=()=>keys().map(k=>H[k]);
const P=()=>vals().at(-1),Pp=()=>vals().at(-2),D=()=>keys().at(-1);
const loc=()=>lang==='ja'?'ja-JP':'en-AU',nf=(v,d=0)=>v.toLocaleString(loc(),{minimumFractionDigits:d,maximumFractionDigits:d});
const fy=v=>'¥'+nf(v),fa=v=>'A$'+nf(v,2);
const fd=d=>new Date(d+'T00:00:00').toLocaleDateString(loc(),{day:'numeric',month:'short',year:'numeric'});
const tt=(k,o={})=>(T[lang][k]||k).replace(/\{(\w)\}/g,(_,x)=>o[x]??'');
const num=s=>+String(s).replace(/[^\d.]/g,'')||0;
const provs=()=>PROVIDERS.filter(p=>!LIVE||p.verified);
const pname=p=>p.id==='bank'?tt('bank'):p.id==='kiosk'?tt('kiosk'):p.name;
const kind=k=>tt(k==='tr'?'kTr':k==='cd'?'kCd':'kNl');
const money=v=>dir==='aud'?fy(v):fa(v);
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Australia/Brisbane'});let checked='';
const hasLink=p=>p.url&&p.url!=='#';

function render(){const amt=num($('amt').value),r=P();
 Q('[data-t]').forEach(e=>e.textContent=tt(e.dataset.t==='pvP'&&!SITE.features.alerts?'pvP2':e.dataset.t));
 Q('.lang button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.l===lang));
 if(FACT){const e=document.querySelector('[data-t=affNote]');if(e)e.textContent=tt('affNote',{n:provs().length})}
 $('amtL').textContent=tt(dir==='aud'?'inAud':'inJpy');$('cur').textContent=dir==='aud'?'A$':'¥';
 $('dAud').setAttribute('aria-selected',dir==='aud');$('dJpy').setAttribute('aria-selected',dir==='jpy');
 $('chips').innerHTML=(dir==='aud'?[500,1000,2500,5000,10000]:[50000,100000,300000,1000000]).map(v=>`<button type="button" data-v="${v}">${dir==='aud'?'A$':'¥'}${nf(v)}</button>`).join('');
 $('midLbl').textContent=tt(dir==='aud'?'aqA':'aqJ',{a:nf(amt)});$('midOut').textContent=dir==='aud'?fy(amt*r):fa(amt/r);
 const L=provs(),all=FACT?rank(L,amt,r,dir).sort((x,y)=>pname(x.p).localeCompare(pname(y.p))):rank(L,amt,r,dir),top=FACT?null:all[0],bank=all.find(x=>x.p.id==='bank'),sticky=$('sticky');
 if(top){$('best').innerHTML=`${tt('bestOf',{p:pname(top.p),x:''}).replace(/[,、:]?\s*$/,'')}<b>${money(top.c.rec)}</b>`;$('best').hidden=false;
  $('save').textContent=bank&&top!==bank&&amt>0?tt('saveTxt',{x:money(top.c.rec-bank.c.rec)}):'';$('stB').textContent=pname(top.p)+' · '+money(top.c.rec);sticky.hidden=false}
 else{$('best').hidden=true;$('save').textContent='';sticky.hidden=true}
 if(FACT){document.documentElement.classList.add('fxon');if(amt>0){$('best').innerHTML=`${tt('fact_mid')}<b>${money(dir==='aud'?amt*r:amt/r)}</b>`;$('best').hidden=false}}
 if(FACT&&all.length&&amt>0){const v=all.map(x=>x.c.rec);$('save').textContent=tt('fact_range',{a:money(Math.min(...v)),b:money(Math.max(...v))})}
 const sw=amt>0?sweetSpot(L,r,dir):null,cur=top&&amt>0?costPct(top.p,amt,r,dir):0;
 $('sweet').textContent=!sw?'':FACT?(amt>=sw.amount?'':tt('fact_sweet',{a:(dir==='aud'?'A$':'¥')+nf(sw.amount)})):amt>=sw.amount||cur<=sw.target?tt('swOk',{p:nf(cur,2)}):tt('swLow',{p:nf(cur,2),a:(dir==='aud'?'A$':'¥')+nf(sw.amount),t:nf(sw.pct,2)});
 const age=ageDays(D(),today());$('fresh').textContent=age>4?tt('stale',{n:age}):checked?tt('auto',{t:checked}):'';$('fresh').className='fresh'+(age>4?' warn':'');
 $('rateNow').textContent='¥'+nf(r,2);const ch=(r/Pp()-1)*100;$('rateChg').textContent=(ch>=0?'▲ ':'▼ ')+nf(Math.abs(ch),2)+'% '+tt('vsPrev');$('rateChg').className=ch>=0?'up':'dn';$('rateDate').textContent=tt('stamp',{d:fd(D())});
 $('stamp').textContent=tt('stamp',{d:fd(D())});
 const unver=L.filter(p=>!p.verified).length,vd=L.map(p=>p.verified).filter(Boolean).sort().at(-1);
 $('phNote').textContent=unver?tt('phNote',{d:fd(D())}):'';$('phNote').hidden=!unver;
 $('fProto').textContent=unver?tt('fProto',{d:fd(D())}):L.length?tt('fVer',{d:fd(vd),e:fd(D())}):'';
 Q('#flt button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.f===flt));
 const minFee=Math.min(...L.map(p=>p.fee)),minM=Math.min(...L.map(p=>p.margin)),one=(k,v)=>L.filter(p=>p[k]===v).length===1;
 $('list').innerHTML=!L.length?`<li class="empty"><b>${tt('emptyH')}</b><p>${tt('emptyP')}</p></li>`:all.map((x,i)=>({...x,rank:i+1})).filter(x=>flt==='all'||x.p.kind===flt).map(x=>{const p=x.p,c=x.c,t1=x.rank===1;
  const tags=FACT?(p.fee===0?`<span class="tag">${tt('none')}</span>`:''):(t1?`<span class="tag">${tt('vTop')}</span>`:'')+(p.fee===minFee&&one('fee',minFee)?`<span class="tag">${tt('vFee')}</span>`:'')+(p.margin===minM&&one('margin',minM)?`<span class="tag">${tt('vMargin')}</span>`:'')+(p.aff&&hasLink(p)?`<span class="tag s">${tt('spons')}</span>`:'');
  const fee=p.fee?fa(p.fee):tt('none'),ver=p.verified?tt('verOn',{d:fd(p.verified)}):tt('unver');
  const act=FACT?'':hasLink(p)?`<a class="cta" href="${p.url}" rel="sponsored noopener" target="_blank" aria-label="${tt('visit')} ${pname(p)}">${tt('visit')}</a>`:p.site?`<a class="cta alt" href="${p.site}" rel="noopener nofollow" target="_blank" aria-label="${tt('visitSite')}: ${pname(p)}">${tt('visitSite')} ↗</a>`:'<span class="nocta"></span>';
  return `<li class="pv${t1&&!FACT?' top':''}${FACT?' fx':''}"><span class="rk">${FACT?pname(p)[0]:x.rank}</span><div class="pn"><b>${pname(p)}</b><small>${kind(p.kind)} · ${ver}</small><div>${tags}</div>${p.note&&p.note[lang]?`<small class="pnote">${p.note[lang]}</small>`:''}${FACT?`<div class="pbar"><i style="width:${Math.max(2,Math.min(100,c.ideal?c.rec/c.ideal*100:0)).toFixed(1)}%"></i></div><small>${tt('fact_pct',{p:nf(c.ideal?c.rec/c.ideal*100:0,1)})}</small>`:''}</div>
  <div class="v rec"><small>${tt('thRec')}</small><b>${money(c.rec)}</b></div><div class="v"><small>${tt('thEff')}</small><b>¥${nf(c.eff,2)}</b></div><div class="v"><small>${tt('thLoss')}</small><b class="loss">${money(c.loss)}</b></div><div class="v"><small>${tt('thFee')}</small><b>${fee}</b></div>${act}</li>`}).join('');
 chart();moves();
 $('qc').innerHTML=[100,500,1000,2000,5000].map(a=>`<tr><td>A$${nf(a)}</td><td>${fy(a*r)}</td></tr>`).join('')+[1000,10000,100000].map(y=>`<tr><td>${fy(y)}</td><td>${fa(y/r)}</td></tr>`).join('');$('qcN').textContent=tt('qcN',{d:fd(D())});
 const td=num($('trD').value),tn=num($('trN').value);$('trOut').textContent=fa(td*tn/r);$('trSub').textContent=tt('trSub',{y:nf(td*tn),n:nf(tn)});
 if($('alT')&&!$('alT').value)$('alT').value=nf(Math.ceil(r+1));
 $('gl').innerHTML=SLUGS.map((s,i)=>`<article><b><a href="${R}guides/${s}/">${tt('g'+(i+1))}</a></b><p>${tt('g'+(i+1)+'d')}</p><small>${tt('rev')} ${fd(SITE.reviewed)}</small></article>`).join('');
 $('faq').innerHTML=[1,2,3,4].map(i=>`<details><summary>${tt('q'+i)}</summary><p>${tt('a'+i)}</p></details>`).join('');}

function moves(){const now=P(),d0=D(),rows=[['mvP',null],['mv7',7],['mv30',30],['mv90',90]];
 const prev=vals().at(-2),pd=keys().at(-2);
 const cell=(k,rate,date)=>{if(!rate)return`<div class="mv na"><small>${tt(k)}</small><b>—</b><span>${tt('mvNA')}</span></div>`;const ch=(now/rate-1)*100,up=ch>=0,diff=(now-rate)*1000;
  return`<div class="mv"><small>${tt(k)}</small><b>¥${nf(rate,2)}</b><span class="${up?'up':'dn'}">${up?'▲':'▼'} ${nf(Math.abs(ch),2)}%</span><em>${fd(date)}</em><i>${tt('mvPer')} ¥${nf(Math.abs(diff))} ${lang==='ja'?(up?'少ない':'多い'):(up?'less':'more')}</i></div>`};
 $('moves').innerHTML=`<h3>${tt('mvH')}</h3><div class="mvg"><div class="mv now"><small>${tt('mvNow')}</small><b>¥${nf(now,2)}</b><em>${fd(d0)}</em></div>`+rows.map(([k,n])=>{if(n===null)return cell(k,prev,pd);const r=rateAgo(H,n,d0);return cell(k,r&&r.rate,r&&r.date)}).join('')+'</div>'}

function chart(){const K=keys(),V=vals(),cut=new Date(D()+'T00:00:00Z');cut.setUTCDate(cut.getUTCDate()-rng);const c0=cut.toISOString().slice(0,10);
 const idx=K.map((k,i)=>i).filter(i=>K[i]>=c0),k=idx.map(i=>K[i]),v=idx.map(i=>V[i]);const svg=$('svg'),W=svg.clientWidth||600,Hh=svg.clientHeight||260,pl=44,pr=10,pt=10,pb=26;
 const hi=Math.max(...v),lo=Math.min(...v),av=v.reduce((a,b)=>a+b,0)/v.length,pad=(hi-lo)*.12||1,y0=lo-pad,y1=hi+pad;
 const X_=i=>pl+(W-pl-pr)*i/Math.max(1,v.length-1),Y=x=>pt+(Hh-pt-pb)*(1-(x-y0)/(y1-y0));
 const line=v.map((x,i)=>(i?'L':'M')+X_(i).toFixed(1)+' '+Y(x).toFixed(1)).join(''),grid=[0,1,2,3].map(j=>y0+(y1-y0)*(j+.5)/4);
 const lab=[0,Math.floor(v.length/2),v.length-1].map(i=>`<text x="${X_(i)}" y="${Hh-6}" text-anchor="${i?i===v.length-1?'end':'middle':'start'}">${new Date(k[i]+'T00:00:00').toLocaleDateString(loc(),{day:'numeric',month:'short'})}</text>`).join('');
 svg.setAttribute('viewBox',`0 0 ${W} ${Hh}`);svg.setAttribute('aria-label',tt('chartLbl'));
 svg.innerHTML=`<defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a50" stop-opacity=".45"/><stop offset="1" stop-color="#ff7a50" stop-opacity="0"/></linearGradient></defs>
 <g fill="rgba(255,255,255,.6)" font-size="11" font-family="Inter,sans-serif">${grid.map(g=>`<line x1="${pl}" x2="${W-pr}" y1="${Y(g)}" y2="${Y(g)}" stroke="rgba(255,255,255,.1)"/><text x="${pl-8}" y="${Y(g)+4}" text-anchor="end">${nf(g,1)}</text>`).join('')}${lab}</g>
 <line x1="${pl}" x2="${W-pr}" y1="${Y(av)}" y2="${Y(av)}" stroke="rgba(255,255,255,.55)" stroke-dasharray="4 5"/><text x="${W-pr}" y="${Y(av)-6}" text-anchor="end" fill="rgba(255,255,255,.75)" font-size="11">${tt('avgL')} ${nf(av,2)}</text>
 <path d="${line}L${X_(v.length-1)} ${Hh-pb}L${pl} ${Hh-pb}Z" fill="url(#ga)"/><path d="${line}" fill="none" stroke="#ffb27a" stroke-width="2.4" stroke-linejoin="round"/>
 <circle cx="${X_(v.length-1)}" cy="${Y(v.at(-1))}" r="4.5" fill="#fff" stroke="#ff5a36" stroke-width="2.5"/><line id="cx" y1="${pt}" y2="${Hh-pb}" stroke="rgba(255,255,255,.5)" opacity="0"/><circle id="cd" r="5" fill="#fff" opacity="0"/>`;
 const tip=$('tip'),mv=e=>{const b=svg.getBoundingClientRect(),x=(e.touches?e.touches[0]:e).clientX-b.left,i=Math.max(0,Math.min(v.length-1,Math.round((x/b.width*W-pl)/(W-pl-pr)*(v.length-1))));const px=X_(i),py=Y(v[i]);$('cx').setAttribute('x1',px);$('cx').setAttribute('x2',px);$('cx').setAttribute('opacity',1);$('cd').setAttribute('cx',px);$('cd').setAttribute('cy',py);$('cd').setAttribute('opacity',1);tip.style.left=px/W*100+'%';tip.style.top=py/Hh*100+'%';tip.textContent=fd(k[i])+' · ¥'+nf(v[i],2);tip.style.opacity=1};
 svg.onpointermove=mv;svg.onpointerleave=()=>{tip.style.opacity=0;$('cx').setAttribute('opacity',0);$('cd').setAttribute('opacity',0)};
 let m=0;for(let i=1;i<v.length;i++)m+=Math.abs(v[i]/v[i-1]-1);m=m/(v.length-1)*100;
 const d90=(()=>{const c=new Date(D()+'T00:00:00');c.setDate(c.getDate()-90);const s=c.toISOString().slice(0,10),w=K.map((x,i)=>x>=s?V[i]:null).filter(x=>x!==null);return w.reduce((a,b)=>a+b,0)/w.length})(),dv=(P()/d90-1)*100;
 $('ctx').textContent=Math.abs(dv)<.1?tt('ctxC'):tt(dv>0?'ctxA':'ctxB',{x:nf(Math.abs(dv),1)});
 $('stats').innerHTML=[['sHigh','¥'+nf(hi,2)],['sLow','¥'+nf(lo,2)],['sAvg','¥'+nf(av,2)],['sMove',nf(m,2)+'%']].map(([a,b])=>`<div><small>${tt(a)}</small><b>${b}</b></div>`).join('');
 Q('.rng button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.r===rng));}

const fmtIn=el=>{const p=el.selectionStart,len=el.value.length,n=String(el.value).replace(/[^\d.]/g,''),[a,b]=n.split('.');el.value=(a?(+a).toLocaleString('en-AU'):'')+(b!==undefined?'.'+b.slice(0,2):'');const np=p+(el.value.length-len);try{el.setSelectionRange(np,np)}catch(e){}};
['amt','trD','trN'].forEach(id=>$(id).addEventListener('input',e=>{fmtIn(e.target);render()}));
$('chips').addEventListener('click',e=>{const v=e.target.dataset.v;if(v){$('amt').value=(+v).toLocaleString('en-AU');render()}});
$('dAud').onclick=()=>{if(dir!=='aud'){dir='aud';$('amt').value='1,000';render()}};$('dJpy').onclick=()=>{if(dir!=='jpy'){dir='jpy';$('amt').value='100,000';render()}};
Q('.lang button').forEach(b=>b.onclick=()=>{if(b.dataset.l!==lang)location.href=R+(b.dataset.l==='ja'?'ja/':'')});
$('flt').onclick=e=>{if(e.target.dataset.f){flt=e.target.dataset.f;render()}};
Q('.rng button').forEach(b=>b.onclick=()=>{rng=+b.dataset.r;chart()});
const alF=$('alF');if(alF)alF.onsubmit=e=>{e.preventDefault();$('alOk').textContent=tt('alOk',{r:$('alT').value})};
addEventListener('resize',()=>chart());
const io=new IntersectionObserver(e=>$('sticky').classList.toggle('on',!e[0].isIntersecting),{threshold:0});io.observe(document.querySelector('.calc'));
render();
// Fresher-than-build rate: same-origin rates.json first, then Frankfurter (v1, then v2). Failures are ignored; the build's rates stay.
const getJ=(u,ms=6000)=>{const ac=new AbortController();setTimeout(()=>ac.abort(),ms);return fetch(u,{signal:ac.signal,cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject())};
const apply=o=>{let ch=false;for(const[d,v]of Object.entries(o)){if(d>=D()&&v>20&&v<400&&H[d]!==v){H[d]=v;ch=true}}if(ch)render()};
const okProv=a=>Array.isArray(a)&&a.length&&a.every(p=>p&&typeof p.id==='string'&&p.margin>=0&&p.margin<10&&p.fee>=0&&p.fee<500);
const refresh=()=>{
 getJ(R+'rates.json').then(j=>{apply(j.rates||{});stamp()}).catch(()=>{});
 getJ(R+'providers.json').then(a=>{if(okProv(a)){PROVIDERS.splice(0,PROVIDERS.length,...a);render()}}).catch(()=>{});
 getJ('https://api.frankfurter.dev/v1/latest?base=AUD&symbols=JPY').then(j=>{apply(parse(j));stamp()}).catch(()=>getJ('https://api.frankfurter.dev/v2/rates?base=AUD&quotes=JPY').then(j=>{apply(parse(j));stamp()}).catch(()=>{}))};
const stamp=()=>{checked=new Date().toLocaleTimeString(loc(),{hour:'2-digit',minute:'2-digit'});render()};
refresh();setInterval(refresh,30*60*1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
const bg=$('bg');const soft=()=>{try{const g=document.createElement('canvas').getContext('webgl');const e=g&&g.getExtension('WEBGL_debug_renderer_info');return !g||(e&&/swiftshader|llvmpipe|software/i.test(g.getParameter(e.UNMASKED_RENDERER_WEBGL)))}catch(x){return true}};
const lite=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||navigator.connection?.saveData||(navigator.hardwareConcurrency||4)<=2||soft();
const go=()=>lite()&&!/[?&]scene=1/.test(location.search)?0:import('./scenes.js').then(m=>m.mountGL(bg,'ftorii')).catch(()=>{});('requestIdleCallback' in window)?requestIdleCallback(go,{timeout:600}):setTimeout(go,50);
