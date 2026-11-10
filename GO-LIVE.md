# OzYen go-live (about 30 min)

0. Site is live at https://lachlanempire26.github.io/ozyen. When you own the domain, set `domain` back to `https://ozyen.com.au` in config/site.json.
1. **Domain** - buy ozyen.com.au (needs your ABN; ~A$20/yr, e.g. VentraIP, Crazy Domains). Keep DNS panel open.
2. **GitHub** - create free account, new repo `ozyen`, upload this folder (unzip, then drag all files incl. `.github`). Branch must be `main`.
3. **Edit `config/site.json`** in GitHub: set `abn`, `contactEmail`, `domainConfirmed:true`.
4. **Pages** - repo Settings > Pages > Source: **GitHub Actions**. Then Actions tab > "Update rates and deploy" > Run workflow. First run pulls live rates + provider quotes and deploys.
5. **DNS** - at your registrar: 4 `A` records on `@` -> 185.199.108.153, .109.153, .110.153, .111.153; `CNAME` `www` -> `<your-github-username>.github.io`. Then Settings > Pages > Custom domain `ozyen.com.au`, tick Enforce HTTPS (can take up to a few hours).
6. **Check** - open the site; "last check" time should be fresh; all 5 providers shown with dates.
7. **Later**: analytics (Plausible, put domain in `analytics.plausibleDomain`), affiliate links (put in `public/providers.json` `url`), ads (`features.adSlots:true` after AdSense approves), Search Console + submit `/sitemap.xml`.

Auto-updates after this: rates + provider quotes every 6 hours. Monthly issue reminds you to re-check providers.
Ads and affiliate links are OFF by default until you add them.
