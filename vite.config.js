import fs from 'node:fs';import path from 'node:path';
import {T as T0} from './src/text.js';import {F} from './src/factual.js';
const FACT=process.env.OZ_FACT==='1',T=FACT?{en:{...T0.en,...F.en},ja:{...T0.ja,...F.ja}}:T0;
const S=JSON.parse(fs.readFileSync('./config/site.json','utf8')),LIVE=process.env.OZ_LIVE==='1',D=S.domain.replace(/\/$/,'');
const X={en:{noHold:"OzYen is a comparison site. It does not hold, move or exchange money.",lPriv:"Privacy",lTerms:"Terms",emptyH:"",emptyP:""},ja:{noHold:"OzYenは比較サイトです。資金のお預かり、送金、両替は行いません。",lPriv:"プライバシー",lTerms:"利用規約"}};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const dirs=d=>fs.existsSync(d)?fs.readdirSync(d).filter(x=>fs.existsSync(path.join(d,x,'index.html'))):[];
const pages=['index.html','ja/index.html','guides/index.html','privacy/index.html','terms/index.html',...dirs('guides').map(g=>`guides/${g}/index.html`)].filter(f=>fs.existsSync(f));
const urls=['/','/ja/','/guides/',...dirs('guides').map(g=>`/guides/${g}/`),'/privacy/','/terms/'];
export default {base:'./',define:{__LIVE__:JSON.stringify(LIVE),__FACT__:JSON.stringify(FACT)},build:{assetsInlineLimit:0,rollupOptions:{input:pages}},
 plugins:[{name:'ozyen',
  transformIndexHtml:{order:'pre',handler(h,ctx){const ja=/\/ja\/index\.html$/.test(ctx.filename||''),L=ja?'ja':'en',tx=T[L];
   h=h.replace(/data-t="(\w+)"([^>]*)><\/(\w+)>/g,(m,k,rest,tag)=>`data-t="${k}"${rest}>${esc(String(tx[k]??X[L][k]??'').replace(/\{\w\}/g,''))}</${tag}>`);
   if(process.env.OZ_ADS==='1'||S.features.adSlots){const slot='<aside class="adslot" aria-label="Advertisement"><small>Advertisement</small><div>Ad space (example)</div></aside>';
    if(/\/guides\/[^/]+\/index\.html$/.test(ctx.filename||'')){let n=0;h=h.replace(/<h2>/g,m=>(++n===2||n===4)?slot+m:m).replace('<aside class="glass ctabox">',slot+'<aside class="glass ctabox">')}
    else if(/index\.html$/.test(ctx.filename||'')&&!/guides\/index|privacy|terms/.test(ctx.filename||''))h=h.replace('<section class="wrap sec" id="guides">','<div class="wrap">'+slot+'</div><section class="wrap sec" id="guides">')}
   if(!S.features.alerts)h=h.replace(/<!--ALERTS-->[\s\S]*?<!--\/ALERTS-->/,'');else h=h.replace(/<!--\/?ALERTS-->/g,'');
   h=h.replace('<span id="abn"></span>',S.abn?` · ABN ${esc(S.abn)}`:'<span id="abn"></span>').replace('<!--CANON-->',`<link rel="canonical" href="${D}/">`);
   const faq=[1,2,3,4].map(i=>({'@type':'Question',name:tx['q'+i],acceptedAnswer:{'@type':'Answer',text:tx['a'+i]}}));
   const ld=[{'@context':'https://schema.org','@type':'WebSite',name:'OzYen',url:D+'/',inLanguage:['en-AU','ja']},{'@context':'https://schema.org','@type':'FAQPage',inLanguage:L==='ja'?'ja':'en-AU',mainEntity:faq}];
   const seo=`<link rel="alternate" hreflang="en-AU" href="${D}/"><link rel="alternate" hreflang="ja" href="${D}/ja/"><link rel="alternate" hreflang="x-default" href="${D}/">
<meta property="og:type" content="website"><meta property="og:site_name" content="OzYen"><meta property="og:title" content="${esc(ja?'豪ドル→日本円 送金比較 | OzYen':'OzYen · Compare AUD to JPY')}"><meta property="og:url" content="${D}${ja?'/ja/':'/'}"><meta property="og:locale" content="${ja?'ja_JP':'en_AU'}"><meta property="og:image" content="${D}/og.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:description" content="${esc(ja?'豪ドルから日本円へ。各サービスで実際に受け取れる金額を比較。':'Compare what actually lands in yen across Wise, Revolut, OFX, banks and cash.')}"><meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(ld)}</script>${S.analytics.plausibleDomain?`<script defer data-domain="${esc(S.analytics.plausibleDomain)}" src="https://plausible.io/js/script.js"></script>`:''}${LIVE?'':'<meta name="robots" content="noindex">'}`;
   return h.replace('<!--SEO-->',seo)}},
  generateBundle(){const day=new Date().toISOString().slice(0,10);
   this.emitFile({type:'asset',fileName:'sitemap.xml',source:`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`<url><loc>${D}${u}</loc><lastmod>${S.reviewed||day}</lastmod></url>`).join('\n')}\n</urlset>\n`});
   this.emitFile({type:'asset',fileName:'robots.txt',source:LIVE?`User-agent: *\nAllow: /\nSitemap: ${D}/sitemap.xml\n`:`User-agent: *\nDisallow: /\n`});
   if(LIVE&&S.domainConfirmed)this.emitFile({type:'asset',fileName:'CNAME',source:new URL(D).hostname+'\n'});
   this.emitFile({type:'asset',fileName:'.nojekyll',source:''})}}]};
