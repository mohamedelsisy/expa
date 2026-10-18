# Jobs review: link verification and source evaluation

Date: 2026-10-11. No job was added or edited.

## (a) `expa:jobs-verify-links`

Checks each published listing's `apply_url` with plain HTTP (one request per listing, `--delay=1` s between listings, user agent `EXPA-LinkCheck/1.0 (+https://github.com/mohamedelsisy/expa; one request per listing)`, https only, no private/IP hosts, redirects followed manually up to 4 hops and only over https, response body never read or stored).

Verdicts: `ok` (2xx); `gone` (404/410); `generic` (redirect to a home/locale-root/single-segment page); `unverified` (timeouts, 403, 429, 5xx, other codes, non-https). Only `gone`/`generic` set `status = expired` (the same mechanism and status value as `expa:jobs-expire`; `SearchIndexer::pruneJobs` runs afterwards). Content fields are never touched. A JSON report is written to `storage/app/private/jobs-verify/<timestamp>.json` and logged.

```
php artisan expa:jobs-verify-links --dry-run
php artisan expa:jobs-verify-links [--id=1 --id=2] [--delay=1]
```
Suggested schedule: daily, e.g. `Schedule::command('expa:jobs-verify-links')->dailyAt('04:30')` (the 16 curated listings carry expires_at 2026-10-24).

Limit: sites that return 200 for removed jobs (single-page apps) cannot be detected without reading content, which this command deliberately does not do.

### Result on the local DB (2026-10-11)

16 checked: 11 `ok` (200), 5 `gone` (HTTP 404) -> expired. No transient errors.

| id | company | listing | result |
|---|---|---|---|
| 1 | Amazon / AWS | Area Manager, FC Operations | 404, expired |
| 2-5 | Amazon / AWS | RME Automation Eng.; HR Specialist; Data Center Technician internship; Operations Manager | 200 ok |
| 6 | IKEA | Stage Supply Chain - IKEA Store | 404, expired |
| 7 | IKEA | Addetto/a alla Logistica | 404, expired |
| 8 | IKEA | Addetto/a alla Ristorazione | 200 ok |
| 9-13 | TSMG (Lever) | 5 listings | 200 ok |
| 14 | Amazon | Robotics Deployment Engineer | 200 ok |
| 15 | IKEA | Addetto/a al Servizio Clienti & Casse | 404, expired |
| 16 | IKEA | Addetto/a alla Vendita | 404, expired |

Public `/api/v1/jobs` now returns the 11 live listings.

## (b) Evaluation of reusable public vacancy sources (report only, nothing implemented)

JobSource requires (to be `active`) a `legal_basis` text of at least 20 characters (ContentReadiness); a source qualifies only if that text can truthfully cite an explicit permission.

| Candidate | Access | Terms found | Fits legal_basis? | Recommendation |
|---|---|---|---|---|
| EURES (ELA) https://eures.europa.eu | public search API (undocumented for third parties) | Reported on the EURES portal: "You are not permitted to use 'screen scraping' or any other automated or manual system to extract job vacancy data in order to further process or re-publish the information"; "Only EURES partner organisations, recognised by a EURES National Coordination Office, are allowed to extract data using our API". (Seen via search snippet of europa.eu/eures/portal; not reproducible in the raw HTML I fetched.) Legal notice: copyright ELA, reuse with attribution, no vacancy-specific licence. | No, unless EURES partner | Do not use. Possible path: apply for EURES partnership via the Italian National Coordination Office (Ministero del Lavoro). |
| Ministero del Lavoro open data / Cliclavoro (dati.lavoro.gov.it) | SPARQL/LOD, CSV/JSON | lavoro.gov.it Open Data page: data are "liberamente riutilizzabili ... senza restrizioni di copyright, brevetti o altre forme di controllo" (no named licence). The ontology has `OffertaAttiva`, but the endpoint on the access page is an internal host (`soaclustg01.rc.mlps.adm`) and I could not confirm any published per-vacancy dataset. | Would fit (explicit open reuse) if a vacancy dataset exists | Ask the Ministry/Cliclavoro whether individual active offers are published; no import until a dataset URL and licence are confirmed. ANPAL's historic portal is no longer updated. |
| inPA (public-sector concorsi) https://portale.inpa.gov.it | REST endpoints used by the site, not a documented public API | No reuse terms found; many notices are restricted to Italian/EU citizens, so low relevance for non-EU users | Not established | Not recommended now. If wanted, ask Dipartimento Funzione Pubblica for open-data terms. |
| Gazzetta Ufficiale 4a Serie Speciale (concorsi) | PDF/text on gazzettaufficiale.it | Reuse terms not confirmed | Not established | Not recommended (same relevance issue). |
| Lever Postings API `api.lever.co/v0/postings/<company>` (TSMG board answers 200) | public GET, no key | README: "This API is designed to help you create a job site."; unauthenticated GET supported; no licence/terms text | Only with the employer's written permission for its own board | Possible employer-by-employer, per signed permission (e.g. TSMG); not for blind aggregation. Note the endpoint returned the company's full board (~34 MB) so use per-company limits. |
| Greenhouse Job Board API | public GET | docs.greenhouse.io: "Job Board data is publicly available, so authentication is not required for any GET endpoints." Purpose: "build careers pages"; no third-party reuse terms | Employer permission needed | Same as Lever. |
| Personio XML feed `<company>.jobs.personio.com/xml` | public XML, enabled per company | Support docs: customers enable the XML interface to publish jobs on their site/job boards | Employer opt-in is explicit (they enable it) but redistribution terms unwritten | Reasonable for companies that ask EXPA to list them; get an email/ToS confirmation, store it in `legal_basis`. |
| Adzuna API (licensed aggregator) | API key | Terms: API "may be used for: 1. Publishing Adzuna ad listings 2. Publishing Jobsworth salary estimates 3. Personal research"; attribution "Adzuna" logo link; 25/min, 250/day; commercial use beyond that needs a licence agreement after a 14-day trial. Italy coverage not confirmed in the pages read. | Yes for the permitted purposes, with attribution (a signed key/ToS is the basis) | Best candidate for volume if Italy is supported: request a key, confirm `it` coverage and commercial terms in writing. |
| Employer career pages / Amazon / IKEA search | HTML/internal JSON | No API terms | No | Keep the current manual curation (minimal metadata + link) with the new link verifier; do not add scrapers. |

Recommendation: (1) keep manual curation with daily link verification; (2) pursue Adzuna (written terms + Italy check) and EURES partnership via the Ministero del Lavoro; (3) employer opt-in feeds (Personio/Lever/Greenhouse) only with documented consent per employer; (4) ask Ministero del Lavoro about a Cliclavoro vacancy open dataset.
