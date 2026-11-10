import json,re,sys
from playwright.sync_api import sync_playwright
PREV,LIVE0,LIVE1='http://localhost:8765/','http://localhost:8766/','http://localhost:8767/'
res=[];errs=[]
RATE=list(json.load(open('public/rates.json'))['rates'].values())[-1]
EXP5='¥'+format(round(4990*RATE*0.9955),',')
def ok(name,cond,info=''):
    res.append((name,bool(cond)));print(('PASS ' if cond else 'FAIL ')+name+(' | '+str(info) if info and not cond else ''))
def no3d(pg): pg.route(re.compile(r'.*/scenes-.*\.js'),lambda r:r.abort())
def noise(m): return 'Failed to load resource' in m or 'ERR_' in m or 'frankfurter' in m or 'fonts.g' in m
def mk(b,w=1366,h=800,mob=False):
    c=b.new_context(viewport={'width':w,'height':h},is_mobile=mob,has_touch=mob);pg=c.new_page()
    pg.on('pageerror',lambda e:errs.append('pageerror: '+str(e)));pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and not noise(m.text) else None);return c,pg
def setamt(pg,v): pg.evaluate("v=>{const e=document.querySelector('#amt');e.value=v;e.dispatchEvent(new Event('input'))}",v)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    # ---------- preview, desktop, EN ----------
    c,pg=mk(b);no3d(pg);pg.goto(PREV);pg.wait_for_timeout(800)
    ok('EN h1 shows',pg.inner_text('h1')=='See what you would really receive.')
    setamt(pg,'5000');ok('best payout calc A$5,000',pg.inner_text('#best').count(EXP5)==1,pg.inner_text('#best'))
    setamt(pg,'100');ok('smart amount: small amount gets recommendation',re.search(r'Around A\$[\d,]+ it drops to about',pg.inner_text('#sweet')) is not None,pg.inner_text('#sweet'))
    setamt(pg,'20000');ok('smart amount: big amount is a good size',pg.inner_text('#sweet').startswith('Good size'),pg.inner_text('#sweet'))
    ok('rate not flagged stale (fresh data)','days old' not in pg.inner_text('#fresh'),pg.inner_text('#fresh'))
    setamt(pg,'5000')
    ok('provider rows (5)',pg.locator('#list li').count()==5)
    ok('unverified shown in preview',pg.locator('text=not yet verified').count()>=5)
    ok('no affiliate link: plain site link only, never marked sponsored',pg.locator('#list a.cta').count()==1 and pg.get_attribute('#list a.cta','rel')=='noopener nofollow' and pg.locator('#list .tag.s').count()==0)
    pg.evaluate("document.querySelector('#dJpy').click()");setamt(pg,'100000');ok('JPY->AUD calc',re.search(r'A\$\d',pg.inner_text('#best')) is not None,pg.inner_text('#best'))
    pg.evaluate("document.querySelector('#dAud').click()")
    pg.evaluate("document.querySelector('button[data-f=nl]').click()");ok('filter bank & cash = 2 rows',pg.locator('#list li').count()==2);pg.evaluate("document.querySelector('button[data-f=all]').click()")
    pg.evaluate("document.querySelector('button[data-r=\"30\"]').click()");ok('chart 30d redraws',pg.locator('#svg path').count()>=2)
    pg.hover('#svg',position={'x':200,'y':100});pg.wait_for_timeout(200);ok('chart tooltip appears',re.search(r'¥\d',pg.inner_text('#tip')) is not None,pg.inner_text('#tip'))
    pg.evaluate("document.querySelector('#trD').value='20,000';document.querySelector('#trD').dispatchEvent(new Event('input'))");ok('trip budget updates',pg.inner_text('#trOut').startswith('A$'))
    ok('alerts hidden (no backend)',pg.locator('#alF').count()==0)
    ok('no horizontal scroll (desktop)',not pg.evaluate("document.documentElement.scrollWidth>innerWidth"))
    # guides link + page
    href=pg.get_attribute('#gl a','href');ok('guide cards link to pages',href and href.startswith('./guides/'),href)
    pg.goto(PREV+'guides/tax-free-shopping-in-japan/');ok('guide page renders',pg.inner_text('h1').startswith('Tax-free shopping'));ok('guide shows sources',pg.locator('.src li').count()>=3)
    pg.click('.crumbs a:nth-child(2)');pg.wait_for_timeout(300);ok('breadcrumb to hub',pg.url.endswith('/guides/') and pg.locator('.guides article').count()==6,pg.url)
    for u,t in [('privacy/','Privacy'),('terms/','Terms of use')]:
        pg.goto(PREV+u);ok(u+' page',pg.inner_text('h1')==t)
    # language switch
    pg.goto(PREV);pg.evaluate("document.querySelector('button[data-l=ja]').click()");pg.wait_for_url('**/ja/');pg.wait_for_timeout(500)
    ok('EN->JA navigates to /ja/',pg.url.endswith('/ja/'));ok('JA h1',pg.inner_text('h1').startswith('実際に'));ok('JA logo image loads',pg.evaluate("document.querySelector('.logo img').naturalWidth>0"));ok('JA lang attr',pg.get_attribute('html','lang')=='ja')
    ok('JA calc label',pg.inner_text('#amtL')=='送金する金額(豪ドル)');ok('JA guide link goes up a level',pg.get_attribute('#gl a','href').startswith('../guides/'),pg.get_attribute('#gl a','href'))
    pg.evaluate("document.querySelector('button[data-l=en]').click()");pg.wait_for_url(PREV);ok('JA->EN back to /',pg.url==PREV)
    c.close()
    # ---------- fresh-rate fallback ----------
    c,pg=mk(b);no3d(pg)
    pg.route('**/api.frankfurter.dev/v1/**',lambda r:r.fulfill(status=404,body='{}'))
    pg.route('**/api.frankfurter.dev/v2/**',lambda r:r.fulfill(status=200,content_type='application/json',body=json.dumps([{'date':'2026-12-31','base':'AUD','quote':'JPY','rate':112.5}])))
    pg.goto(PREV);pg.wait_for_timeout(1500);ok('v1 gone -> v2 used, rate updates to 112.50',pg.inner_text('#rateNow')=='¥112.50',pg.inner_text('#rateNow'));c.close()
    c,pg=mk(b);no3d(pg);pg.route('**/api.frankfurter.dev/**',lambda r:r.abort());pg.goto(PREV);pg.wait_for_timeout(1200)
    ok('API down -> page still shows build rate',re.match(r'¥\d{3}\.\d\d',pg.inner_text('#rateNow')) is not None);c.close()
    c,pg=mk(b);no3d(pg);pg.route('**/api.frankfurter.dev/**',lambda r:r.fulfill(status=200,content_type='application/json',body='{"date":"2026-11-06","rates":{"JPY":1.5}}'))
    pg.goto(PREV);pg.wait_for_timeout(1200);ok('absurd live rate ignored',pg.inner_text('#rateNow')!='¥1.50');c.close()
    # ---------- LIVE: no verified providers ----------
    c,pg=mk(b);no3d(pg);pg.goto(LIVE0);pg.wait_for_timeout(600)
    ok('live+0 verified: empty state shown',pg.locator('#list .empty').count()==1)
    ok('live+0 verified: no fake provider names',not re.search(r'Wise|Revolut|OFX',pg.inner_text('#list')))
    ok('live+0 verified: best box + sticky bar hidden',pg.is_hidden('#best') and pg.is_hidden('#sticky'))
    ok('live: robots allows, no noindex',('Allow: /' in pg.evaluate("fetch('robots.txt').then(r=>r.text())")) and 'noindex' not in pg.content());c.close()
    # ---------- LIVE: one verified provider ----------
    c,pg=mk(b);no3d(pg);pg.goto(LIVE1);pg.wait_for_timeout(600);setamt(pg,'1000')
    ok('live+1 verified: only that provider listed',pg.locator('#list li').count()==1 and 'Wise' in pg.inner_text('#list'))
    ok('verified date shown','Verified 5 Nov 2026' in pg.inner_text('#list small'))
    ok('affiliate link has rel=sponsored noopener + Sponsored tag',pg.get_attribute('#list a.cta','rel')=='sponsored noopener' and pg.locator('#list .tag.s').count()==1)
    ok('footer says verified, not prototype','last verified' in pg.inner_text('#fProto') and 'Prototype' not in pg.inner_text('body'),pg.inner_text('#fProto'));c.close()
    # ---------- REAL data build ----------
    c,pg=mk(b);no3d(pg);pg.goto('http://localhost:8768/');pg.wait_for_timeout(700)
    ok('real: 5 verified providers, each with a note',pg.locator('#list li').count()==5 and pg.locator('#list .pnote').count()==5)
    ok('real: 3 site links, none sponsored yet',pg.locator('#list a.cta').count()==3 and pg.locator('#list .tag.s').count()==0)
    ok('real: no unverified wording','not yet verified' not in pg.inner_text('body'))
    ok('real: og image + icons present','og.jpg' in pg.content() and pg.evaluate("fetch('og.jpg').then(r=>r.ok)") and pg.evaluate("fetch('favicon.svg').then(r=>r.ok)"))
    ok('real: backdrop art loads',pg.evaluate("getComputedStyle(document.getElementById('bg')).backgroundImage").startswith('url('))
    pg.goto('http://localhost:8768/guides/');ok('real: guide hub has logo image',pg.locator('.logo img').count()==1);c.close()
    # ---------- phone ----------
    c,pg=mk(b,390,844,True);no3d(pg);pg.goto(PREV);pg.wait_for_timeout(800)
    ok('phone: no horizontal scroll',not pg.evaluate("document.documentElement.scrollWidth>innerWidth"))
    ok('phone: sticky bar appears after scrolling past calculator',(pg.evaluate("scrollTo(0,1400)") or True) and (pg.wait_for_timeout(500) or True) and 'on' in pg.get_attribute('#sticky','class'))
    for u in ['guides/suica-and-pasmo-top-ups/','ja/']:
        pg.goto(PREV+u);pg.wait_for_timeout(400);ok('phone: no hscroll '+u,not pg.evaluate("document.documentElement.scrollWidth>innerWidth"))
    c.close()
    # runtime providers.json refresh changes the recommendation
    c,pg=mk(b);no3d(pg)
    pg.route(re.compile(r'.*/providers\.json'),lambda r:r.fulfill(status=200,content_type='application/json',body='[{"id":"x","name":"X","kind":"tr","margin":0.5,"fee":200,"aff":false,"url":"","verified":"2026-11-05","source":""}]'))
    pg.goto(PREV);pg.wait_for_timeout(1500);setamt(pg,'1000')
    ok('smart amount reacts to fresh provider data',pg.locator('#list li').count()==1 and 'drops to about' in pg.inner_text('#sweet'),pg.inner_text('#sweet'))
    bad_=pg.route(re.compile(r'.*/providers\.json'),lambda r:r.fulfill(status=200,content_type='application/json',body='[{"id":"x","margin":99,"fee":-1}]'))
    c.close()
    # ---------- 3D scene mounts ----------
    c,pg=mk(b);pg.goto(PREV+'?scene=1');pg.wait_for_timeout(5000);ok('3D scene canvas mounted',pg.locator('#bg canvas').count()==1);c.close()
    b.close()
ok('no JS errors in any run',not errs,errs[:4])
bad=[n for n,v in res if not v];print(f"\n{len(res)-len(bad)}/{len(res)} passed");sys.exit(1 if bad else 0)
