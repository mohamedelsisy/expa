# Tax reference data (IRPEF brackets, INPS employee contribution, VAT)

Verified: 2026-10-11. Tables: `tax_tables` + `tax_table_translations`, `tax_rates`. Feeds `POST /api/v1/money/net-salary` and the web page `/{locale}/money/net-salary`.

## Sources actually read

| Figure | Official source (read 2026-10-11) | Sentence quoted in `database/data/tax_reference.php` |
|---|---|---|
| IRPEF brackets 2024 onward | Agenzia delle Entrate, "Aliquote e calcolo dell'Irpef" (page updated 13 Jan 2026) https://www.agenziaentrate.gov.it/portale/imposta-sul-reddito-delle-persone-fisiche-irpef-/aliquote-e-calcolo-dell-irpef | "Dall'anno 2024 l'imposta lorda si calcola applicando le seguenti aliquote": fino a 28.000 euro 23%; da 28.001 fino a 50.000 euro 35%; oltre 50.000 euro 43% |
| IRPEF second bracket 33% | same page | "la legge di Bilancio 2026 ha ridotto la seconda aliquota dell'Irpef dal 35 al 33 per cento ... per i redditi imponibili superiori a 50.000 euro, l'imposta dovuta è pari a 13.700 euro (non più 14.140) + il 43% sul reddito eccedente i 50.000 euro" |
| Employee INPS contribution 9,19% | INPS circolare n. 23 del 24/01/2007 (HTML, inps.it/bussola) | "per la generalità delle aziende, la contribuzione pensionistica si attesterà nella misura del 33% , di cui 9,19% a carico del lavoratore" |
| Massimale 2026 = 122.295 EUR | INPS news 2 Feb 2026 and INPS circolare n. 6 del 30/01/2026 par. 6 | "massimale annuo della base contributiva, che per il 2026 raggiunge i 122.295 euro"; circ.: "pari, per l'anno 2026, a 122.295,40 euro, che arrotondato ... a 122.295,00 euro" |
| Massimale 2025 = 120.607 EUR | INPS circolare n. 26 del 30/01/2025 par. 6 (PDF) | "pari, per l'anno 2025, a 120.606,90 euro, che arrotondato ... a 120.607,00 euro" |
| Ordinary VAT 22% | Agenzia delle Entrate, "Norme generali e aliquote" (page dated 12/12/2020) https://www.agenziaentrate.gov.it/portale/iva-regole-generali-aliquote-esenzioni-pagamento/norme-generali-e-aliquote | "In Italia l'aliquota ordinaria Iva è del 22%" |

HTML quotes are machine-checked against the live pages by `--verify-sources` (all passed on 2026-10-11). The two INPS PDFs were read by hand (`verify: false` in the definition).

## What was created

- `tax_tables`: `irpef-2026` (23/33/43, ceiling 122.295, rate 9,19) and `irpef-2025` (23/35/43, ceiling 120.607, rate 9,19); `deduction_flat = 0` (no official flat figure exists: detrazioni depend on the taxpayer). Source type `official`, source URL = the Agenzia delle Entrate IRPEF page, `source_id` `it-irpef-2026` / `it-irpef-2025`. Names are EXPA-authored labels in it/en/ar; notes (it) list what is NOT modelled.
- `tax_rates`: one row `IT / VAT / 22.00`, `valid_from = NULL` (the page states no start date; none was invented), `verified_at` = review date. It only affects invoices if `BILLING_TAX_COUNTRY=IT` is set (nothing sets it today).
- Not created: tax year 2024 (the Agenzia page gives the 2024 brackets, but no INPS 2024 circular was read; do not carry rates across years). Reduced VAT rates (4/5/10%) are not imported: the page read gives only the ordinary rate in the sentence quoted.

## Assumptions to review

1. The IRPEF page says the Budget Law 2026 reduced the second rate; it does not literally write "from tax year 2026". The 2026 table assumes the reduction applies to tax year 2026 (the law is named "2026"). The 2025 table is "Dall'anno 2024" brackets, unchanged by the page before the 2026 law.
2. The 9,19% comes from the 2007 INPS circular (the latest INPS text found stating the split explicitly; circ. 6/2026 does not change it). Smaller companies (no ex-GESCAL) can have 8,84% per the same circular: the estimator uses 9,19%.
3. The massimale applies by law to those first insured after 31/12/1995; the estimator applies it to everyone (matters only above ~120k EUR).

## Not modelled (the engine's disclaimer already says "estimate")

Regional/municipal surcharges, detrazioni (lavoro dipendente, family), the 1% additional INPS contribution above 56.224 EUR (2026) / 55.448 EUR (2025), the 2026 "sterilizzazione" above 200.000 EUR, bonus/trattamento integrativo.

## Licence

No reuse licence statement was found on the Agenzia delle Entrate "Privacy e note legali" page or the INPS pages. Only legal/numeric facts and short quoted sentences are stored (no page text reproduced), with name + URL attribution in `source_name`/`source_url`. If a stricter position is needed, ask Agenzia/INPS. Recorded as `source_license = "normative figures; no reuse licence stated on the pages"`.

## Commands

```
php artisan expa:import:tax-reference --dry-run --verify-sources   # validate + re-check quotes online, write nothing
php artisan expa:import:tax-reference                              # import (idempotent by source_id)
php artisan expa:import:tax-reference --verify-sources             # import and stamp last_verified_at = now
php artisan expa:import:tax-reference --file=/path/other.php       # alternative reviewed definition
```
Staging/production: content enters `review` (four-eyes). Re-read the official pages and update `read_on` before re-running. Suggested schedule: none automatic (figures change once a year); run `--dry-run --verify-sources` monthly from a scheduler to detect page changes, e.g. `Schedule::command('expa:import:tax-reference --dry-run --verify-sources')->monthly();`.

## Verification

Run 2026-10-11 on the local DB: tax_tables 0 -> 2, tax_rates 0 -> 1; second run 3 unchanged. `POST /api/v1/money/net-salary {"gross_annual":30000}` -> `available:true`, tax_year 2026, net 20.977,11 (1.748,09/month), source type official + URL, disclaimer present. Web `/en/money/net-salary` rendered (Chrome via Playwright): result table, source link, "Last verified" and "Up to date".
Test `TaxReferenceImportTest::test_net_salary_matches_the_hand_calculation_from_the_official_brackets`: gross 60.000, 2026 -> contributions 5.514,00, tax 15.628,98 (= official "13.700 + 43% of the excess over 50.000"), net 38.857,02; also official 13.700 (2026) / 14.140 (2025) on 50.000 and 6.440 on 28.000.
