# Patente categories (AM ... DE)

Verified: 2026-10-11. Tables: `patente_categories` + `patente_category_translations` (15 rows x it/en/ar).

## Source

Ministero delle Infrastrutture e dei Trasporti, Portale dell'Automobilista: "Veicoli nell'unione: ottenimento e rinnovo di una patente di guida", https://www.ilportaledellautomobilista.it/SDG/C2IT.html (HTTP 200, "Ultimo aggiornamento 26 Giugno 2024 a cura del Ministero delle Infrastrutture e dei Trasporti"). Host `ilportaledellautomobilista.it` is in `config/content.php` official_domains (passes `PublishGuard::isOfficialHost`). The page reproduces the categories of directive 2006/126/CE: AM, A1, A2, A, B1, B, BE, C1, C1E, C, CE, D1, D1E, D, DE and, for each, the vehicles and the minimum age.

Each category in `database/data/patente_categories.php` carries the verbatim sentence from the page that states the minimum age (re-checked with `--verify-source`; all 15 passed).

## Mapping

| Column | Content |
|---|---|
| slug | lower-case code (`am`, `a1`, ... `de`); source_id `it-patente-<code>` |
| title | "Patente categoria B" / "Driving licence – category B" / "رخصة القيادة – الفئة B" |
| summary | the vehicles the category allows + "Età minima: N anni." |
| body | extra conditions stated on the page (A: two years on A2 or age 24; C/CE/D/DE: CQC; BE note) + source/last-updated note |
| source | official, the page above, last_verified_at = review date |

Italian paraphrases the page. English and Arabic are EXPA's own faithful renderings of the same statements (nothing added); this is flagged here for reviewer sign-off. The Arabic is needed because PublishGuard requires `ar` title+summary to publish.

Page quirks kept faithful: the BE paragraph says "L'età minima per la categoria B è fissata a 18 anni" (it names B); stored as 18 for BE with a note in the body. Category A: 20 (motorcycles) and 21 for tricycles above 15 kW.

Not imported: exam questions (copyrighted), validity/renewal, residence requirements, fees. Only facts stated on the page.

## Licence

No explicit reuse licence found on the portal. Content is public legal/regulatory fact (directive categories and ages); stored as short paraphrase with name, URL and "last updated 26 June 2024" attribution (`source_license = "public legal facts; no reuse licence stated on the page"`). Unconfirmed formally.

## Allow-list note

`ilportaledellautomobilista.it` is NOT in `config/dataimport.php` default allowed hosts (only `mit.gov.it`). The default import needs no download; `--verify-source` does, so for that run set `DATAIMPORT_ALLOWED_HOSTS` to include it (done at runtime for the verification here) or add it to the default list.

## Commands

```
php artisan expa:import:patente-categories --dry-run [--verify-source]
php artisan expa:import:patente-categories                 # idempotent by source_id
php artisan expa:import:patente-categories --file=other.php
```
Schedule suggestion: `Schedule::command('expa:import:patente-categories --dry-run --verify-source')->monthly();` (alerts only; text is reviewed by hand).

## Verification (local DB)

patente_categories 0 -> 15 (published locally; review elsewhere); rerun: 15 unchanged. `GET /api/v1/patente/categories` -> 15 items (ar/en/it, fallback false, source official); `/categories/a` returns body. Web `/en/patente` lists "Licence categories" with Official badges.
