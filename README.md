# OzYen

AUD to JPY rate comparison site. Static site (Vite). Comparison only: it never holds or moves money.

## Daily life
- **Rates** update themselves: the deploy workflow runs weekdays, fetches Frankfurter, commits `public/rates.json`, rebuilds and deploys.
- **Provider fees** are manual. Edit `public/providers.json`: set `margin`, `fee`, `verified` (YYYY-MM-DD), `source`, and the affiliate `url`. The monthly workflow opens an issue when figures are older than `staleDays`.
- Live builds (`OZ_LIVE=1`) show **only verified providers**. Preview builds show all, marked unverified, and are `noindex`.

## Go live
1. `npm run launch-check` and fix every blocker.
2. Get legal advice on whether ranking FX providers needs an AFSL.
3. Register the business name, then the domain; set `domain`, `domainConfirmed`, `abn`, `contactEmail` in `config/site.json`.
4. Push to GitHub, enable Pages (source: GitHub Actions), add the custom domain.
5. Apply to affiliate programs; paste tracked links into `providers.json`.
6. Add the site to Google Search Console and submit `/sitemap.xml`.

## Commands
`npm test` · `npm run build` · `OZ_LIVE=1 npm run build` · `npm run update-rates` · `npm run check-providers` · `npm run launch-check`
