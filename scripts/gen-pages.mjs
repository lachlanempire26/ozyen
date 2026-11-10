#!/usr/bin/env node
// Generates static pages (guides, legal, Japanese landing) into the project root so Vite can build them as entries.
import fs from 'node:fs';import path from 'node:path';
import {GUIDES,REVIEWED} from './guides.mjs';import {T} from '../src/text.js';
const S=JSON.parse(fs.readFileSync('config/site.json','utf8')),D=S.domain.replace(/\/$/,'');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const fmt=d=>new Date(d+'T00:00:00').toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'});
const analytics=S.analytics.plausibleDomain?`<script defer data-domain="${esc(S.analytics.plausibleDomain)}" src="https://plausible.io/js/script.js"></script>`:'';
const write=(f,c)=>{fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,c)};
const head=(o)=>`<!doctype html><html lang="en-AU" data-root="${o.root}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(o.title)} | OzYen</title><meta name="description" content="${esc(o.desc)}"><link rel="canonical" href="${D}${o.url}">${o.noindex?'<meta name="robots" content="noindex">':''}
<meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.desc)}"><meta property="og:type" content="article"><meta property="og:url" content="${D}${o.url}"><meta property="og:site_name" content="OzYen"><meta name="theme-color" content="#0d1530"><meta property="og:image" content="${D}/og.jpg"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="${o.root}favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="${o.root}apple-touch-icon.png">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" media="print" onload="this.media='all'"><link rel="stylesheet" href="/src/app.css">${o.ld?`<script type="application/ld+json">${JSON.stringify(o.ld)}</script>`:''}${analytics}</head>`;
const chrome=(root,body,crumbs)=>`<body class="doc"><header class="top"><div class="wrap bar"><a class="logo" href="${root}"><img class="mark" src="${root}favicon.svg" alt="" width="34" height="34"><span>Oz<b>Yen</b></span></a>
<nav class="nav" aria-label="Main"><a href="${root}#compare">Compare</a><a href="${root}guides/">Japan guides</a><a href="${root}#history">Rate history</a><a href="${root}#about">How we make money</a></nav>
<div class="lang"><a class="on" href="${root}" aria-current="true">EN</a><a href="${root}ja/">日本語</a></div></div></header>
<main class="wrap article">${crumbs?`<nav class="crumbs" aria-label="Breadcrumb">${crumbs}</nav>`:''}${body}</main>
<footer class="wrap foot"><div class="glass"><p><b>General information only, not financial advice.</b> OzYen does not consider your objectives or circumstances. Rates are indicative.</p><p>Some links are affiliate links (marked Sponsored). We may earn a commission. Ranking is by amount received, never by commission.</p><p>OzYen is a comparison site. It does not hold, move or exchange money.</p>
<p class="cr"><a href="${root}privacy/">Privacy</a> · <a href="${root}terms/">Terms</a> · © 2026 OzYen${S.abn?` · ABN ${esc(S.abn)}`:''}</p></div></footer></body></html>`;
// guides
for(const g of GUIDES){
 const url=`/guides/${g.slug}/`;
 const ld=[{'@context':'https://schema.org','@type':'Article',headline:g.title,description:g.desc,dateModified:REVIEWED,author:{'@type':'Organization',name:'OzYen'},publisher:{'@type':'Organization',name:'OzYen'},mainEntityOfPage:D+url},
  {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'OzYen',item:D+'/'},{'@type':'ListItem',position:2,name:'Japan guides',item:D+'/guides/'},{'@type':'ListItem',position:3,name:g.title,item:D+url}]}];
 write(`guides/${g.slug}/index.html`,head({title:g.title,desc:g.desc,url,root:'../../',ld})+chrome('../../',`<article class="glass doc-body"><h1>${esc(g.title)}</h1><p class="rev">Last reviewed ${fmt(REVIEWED)}</p>${g.body}
<h2>Sources</h2><ul class="src">${g.sources.map(([t,u])=>`<li><a href="${u}" rel="noopener" target="_blank">${esc(t)}</a></li>`).join('')}</ul><p class="note">General information only, not financial advice. Rules, fees and limits change. Check current details before you act.</p></article>
<aside class="glass ctabox"><div><b>Compare AUD to JPY</b><p>See what each provider would actually pay out for your amount.</p></div><a class="cta" href="../../#compare">Compare rates</a></aside>`,`<a href="../../">OzYen</a> › <a href="../">Japan guides</a> › ${esc(g.title)}`));
}
write('guides/index.html',head({title:'Japan money guides',desc:'Plain, factual notes for Australians travelling to Japan: yen, ATMs, cash, Suica and tax-free shopping.',url:'/guides/',root:'../'})+chrome('../',`<section class="glass doc-body"><h1>Japan money guides</h1><p>Plain, factual notes for Australians travelling to Japan. Each guide lists its sources and the date it was last reviewed.</p><div class="guides">${GUIDES.map(g=>`<article><b><a href="${g.slug}/">${esc(g.title)}</a></b><p>${esc(g.desc)}</p><small>Reviewed ${fmt(REVIEWED)}</small></article>`).join('')}</div></section>`,`<a href="../">OzYen</a> › Japan guides`));
// legal
const contact=S.contactEmail?`<p>Contact: <a href="mailto:${esc(S.contactEmail)}">${esc(S.contactEmail)}</a></p>`:'';
const op=`OzYen is operated by a sole trader${S.abn?` (ABN ${esc(S.abn)})`:''} in Australia.`;
write('privacy/index.html',head({title:'Privacy',desc:'How OzYen handles your information.',url:'/privacy/',root:'../'})+chrome('../',`<article class="glass doc-body"><h1>Privacy</h1><p class="rev">Last updated ${fmt(REVIEWED)}</p><p>${op}</p>
<h2>What we collect</h2><p>OzYen does not ask you to create an account. The amounts you type into the calculator stay in your browser and are not sent to us.</p>
<h2>Analytics</h2><p>${S.analytics.plausibleDomain?'We use Plausible, a privacy-focused analytics service that does not use cookies and does not collect personal information, to count visits and see which pages are used.':'We do not currently run analytics.'}</p>
<h2>Third parties</h2><p>The page loads fonts from Google Fonts, which receives your IP address when it serves them. The live exchange rate is requested from Frankfurter. When you click a provider link, you leave OzYen and that provider's own privacy policy applies. Some links are affiliate links, so the provider may tell us that you came from OzYen.</p>
<h2>Language preference</h2><p>OzYen may store your language choice in your browser (local storage). It is not sent to us.</p>
<h2>Your rights</h2><p>You can ask what personal information we hold about you, and ask us to correct or delete it. We do not sell personal information.</p>${contact}</article>`,`<a href="../">OzYen</a> › Privacy`));
write('terms/index.html',head({title:'Terms of use',desc:'The terms for using OzYen.',url:'/terms/',root:'../'})+chrome('../',`<article class="glass doc-body"><h1>Terms of use</h1><p class="rev">Last updated ${fmt(REVIEWED)}</p><p>${op}</p>
<h2>What OzYen is</h2><p>OzYen is a comparison website. It does not hold, move or exchange money, and it is not a bank, a money transfer provider or a financial adviser.</p>
<h2>General information only</h2><p>Everything on OzYen is general information. It does not take into account your objectives, financial situation or needs. Rates and fees are indicative, change often, and may differ from what a provider offers you. Check the provider's own site before you act.</p>
<h2>How we make money</h2><p>Some links are affiliate links, marked Sponsored. We may earn a commission if you sign up. Ranking is by the amount received for the amount you enter, never by commission. We also list options that pay us nothing, such as banks.</p>
<h2>Accuracy</h2><p>We take care with our data but cannot guarantee it is complete or current. Mid-market rates come from Frankfurter daily reference rates. Each provider figure shows the date we last verified it.</p>
<h2>Liability</h2><p>To the extent the law allows, we are not liable for loss from relying on this site. Nothing here limits rights you have under the Australian Consumer Law that cannot be excluded.</p>${contact}</article>`,`<a href="../">OzYen</a> › Terms`));
// Japanese landing page = home page, Japanese
let h=fs.readFileSync('index.html','utf8');
h=h.replace('<html lang="en-AU" data-root="./">','<html lang="ja" data-root="../">').replace(/<title>[^<]*<\/title>/,'<title>豪ドル→日本円 送金比較 | OzYen</title>').replace(/(<meta name="description" content=")[^"]*"/,'$1豪ドルと日本円の送金サービスを、実際の受取額で比較。比較サイトです。お金はお預かりしません。"')
 .replace('<!--CANON-->',`<link rel="canonical" href="${D}/ja/">`).replace(/href="(guides|privacy|terms)\//g,'href="../$1/').replace(/(src|href)="\.\/(favicon\.svg|apple-touch-icon\.png)"/g,'$1="../$2"');
write('ja/index.html',h);
