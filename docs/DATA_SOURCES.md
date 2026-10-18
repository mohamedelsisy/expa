# Real data sources and import commands

Every dataset below comes from an official publisher, is imported by an idempotent command, and is traceable in `data_import_runs` (`php artisan expa:import-runs`). Nothing is invented: where no legitimate public dataset exists the table stays empty (see `data-sources/INVENTORY.md` for every table, its counts and the reason).

| Dataset | Tables | Official source | Licence (as published) | Command | Result (local, 2026-10-11) |
|---|---|---|---|---|---|
| Municipalities / regions | `cities`, `city_translations`, `regions.istat_code` | ISTAT — Elenco dei comuni italiani (21/02/2026) | CC BY 4.0 (istat.it/note-legali) | `expa:import:istat-comuni` (`--all` for every comune) | 119 province capitals (7,894 comuni available with `--all`) |
| Universities & degree courses | `universities`, `study_programs` (+translations) | MUR Open Data (dati-ustat.mur.gov.it): Atenei, Offerta formativa 2025 | IODL 2.0 | `expa:import:study` | 92 universities, 5,988 courses (7 rejected: language "Altro") |
| Public offices | `government_offices` (+translations) | IndicePA open data (AgID): Enti + Unità Organizzative | CC BY 4.0 | `expa:import:ipa-offices` (`--category=comuni` opt-in) | 135 live (118 ASL, 16 Questura immigration offices, 1 Prefettura) |
| Appointment guides | `appointment_guides` | Official booking pages (Interno CIE, Agenzia delle Entrate, INPS, Roma Capitale, Milano, Portale Immigrazione) | EXPA text paraphrasing the cited pages | `expa:import:appointment-guides` | 6 guides (ar/en/it); EXPA never books |
| Tax reference | `tax_tables`, `tax_rates` | Agenzia delle Entrate (IRPEF, IVA), INPS circulars | No reuse licence stated: numeric legal facts + short quotes with attribution | `expa:import:tax-reference` (`--verify-sources`) | IRPEF 2025 + 2026 tables, IVA 22% |
| Patente categories | `patente_categories` | Ministero dei Trasporti — Portale dell'Automobilista | No reuse licence stated: public legal facts with attribution | `expa:import:patente-categories` (`--verify-source`) | 15 categories (no exam questions: copyrighted) |
| Job links | `job_listings` (status) | the employers' own listing URLs | n/a (link check only, no content copied) | `expa:jobs-verify-links` | 11 resolve, 5 expired (HTTP 404) |

## Run everything
```
php artisan expa:import:all                 # all importers in dependency order (geography first)
php artisan expa:import:all --dry-run       # validate and report, write nothing
php artisan expa:import:all --with-jobs-check
php artisan expa:import-runs                # what ran, from where, under which licence, with counts
php artisan expa:data-inventory             # row count of every table
```
Each importer also accepts `--file=` (use a downloaded file) and `--dry-run`. Per-dataset detail: `docs/data-sources/*.md`.

## Lifecycle, safety and updates
- **Local/testing:** imported content is published so the app is usable. **Staging/production:** it enters `review` and needs the normal approval; four-eyes is never bypassed. Registry rows (Italian only) require only Italian to be approved; curated content still requires Arabic.
- After a real import in local, search and AI indexes rebuild automatically.
- Bulk imports write one audit entry per run (`data.import`) instead of one per row.
- Downloads are https-only, host allow-listed (`config/dataimport.php`), size-capped, streamed to disk, hashed (SHA-256) and kept on the private disk.
- **Scheduled updates are off by default.** Enable with `DATAIMPORT_SCHEDULE=true` (see `routes/console.php`; monthly ISTAT/MUR, weekly IPA, link checks daily).
- Never run `migrate:fresh` against a database you want to keep. The migration is additive.

## Known limits
- Cities default to province capitals: `GET /cities` is unpaginated and capped at 1000. `--all` needs a typeahead/paginated city API first.
- The MUR file has no tuition, deadlines, duration or course URLs: those fields stay empty (the Study Finder reports them as unknown).
- Questure/Prefetture are only partly in IPA (immigration offices only); the Sportello Unico per l'Immigrazione is not in IPA.
- Tax estimator is a simplified estimate (no regional/municipal surcharges or detrazioni).
- No legitimate reuse-licensed job feed exists for EXPA today (EURES, Greenhouse/Lever, Adzuna evaluated in `data-sources/jobs-review.md`).
