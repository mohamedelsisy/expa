# Government offices (IPA) and appointment guides

Verified 2026-10-11.

## Part 1 — offices from IndicePA open data

- Publisher: AgID – Agenzia per l'Italia Digitale (IPA – Indice dei domicili digitali delle Pubbliche Amministrazioni e dei gestori di pubblici servizi).
- Dataset pages: https://indicepa.gov.it/ipa-dati/dataset/enti and https://indicepa.gov.it/ipa-dati/dataset/unita-organizzative
- Licence: CC BY 4.0 (CKAN metadata `license_id: CC-BY-4.0`, https://creativecommons.org/licenses/by/4.0/). The portal legal notes (https://indicepa.gov.it/ipa-portale/note-legali, client-rendered page) state that, unless otherwise indicated, the site content is CC-BY 3.0 and that using the downloaded data implies accepting the notes; the dataset-level licence is 4.0.
- Attribution wording stored in `data_import_runs.attribution`: "Fonte: IndicePA – Indice dei domicili digitali delle Pubbliche Amministrazioni e dei gestori di pubblici servizi (AgID), dati aperti, licenza CC BY 4.0."
- Update frequency: daily (dataset metadata "Frequenza aggiornamento: giornaliera"); administrations must update at least every six months.
- Resources (CKAN datastore dumps, CSV, UTF-8, comma-delimited, quoted):
  - Enti: `https://indicepa.gov.it/ipa-dati/datastore/dump/d09adf99-dc10-4349-8c53-27b1e5aa97b6?format=csv` (~7 MB, ~23.7k rows)
  - Unità Organizzative: `https://indicepa.gov.it/ipa-dati/datastore/dump/b0aa1f6c-f135-4c8a-b416-396fed4e1a5d?format=csv` (~34 MB, ~123k rows)
  - Municipality -> region lookup: ISTAT "Elenco comuni italiani" CSV `https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv` (semicolon, cp1252; col 5 = 6-digit comune code, col 1 = region code).
  The static `.../download/enti.xlsx` / `unita-organizzative.xlsx` files exist too; the CSV dumps avoid an XLSX parser.

### What is imported (decided from the data)

| `--category` | Source | Selection | office_type |
|---|---|---|---|
| `asl` (default) | Enti | category `L7` (Aziende sanitarie locali/USL/ASP) + `L8` entities named ASST; entities in liquidation (`Ente_in_liquidazione=S` or "liquidazione/liquidatoria" in the name) are skipped | `asl` |
| `questure` (default) | Unità Organizzative of Polizia di Stato (`XZR4RNHR`) | description starts with "Questura" and is an "Ufficio Immigrazione" / "Ufficio Polizia per l'Immigrazione" | `questura` |
| `prefetture` (default) | UO of Ministero dell'Interno (`m_it`) | description starts with "Prefettura" and mentions "immigrazione" | `prefettura` |
| `comuni` (opt-in) | UO of category L6 entities | description matches anagrafe / stato civile / servizi demografici | `anagrafe` |

Evidence for the choices: in IPA the Questure and Prefetture are not entities. Of ~885 Polizia di Stato units only 16 are Questura immigration offices (the rest are accounting, logistics, commissariati, traffic police...). The ~113 Prefettura units are accounting services ("Servizio contabilità e gestione finanziaria"), so presenting them as "the Prefettura" would be misleading; only one unit (L'Aquila, Area 4 "immigrazione, asilo") is explicitly about immigration. The Sportello Unico per l'Immigrazione is not listed in IPA. ~100 Questure and ~100 Prefetture therefore cannot be imported from this source.

### Field mapping

| Office column | IPA field |
|---|---|
| `source_id` | `Codice_IPA` (entities) / `Codice_uni_uo` (units) |
| `it` name | `Denominazione_ente` / `Descrizione_uo` (whitespace collapsed, case untouched) |
| `address`, `postal_code` | `Indirizzo`, `CAP` (5 digits else null) |
| `region_id` | ISTAT comune code -> ISTAT region code -> `regions.code`; falls back to the matching city's region |
| `city_id` | `cities.istat_code` = `Codice_comune_ISTAT` when such a city exists at import time, else null |
| `phone` | UO `Telefono` (first number, digits only; null if not a plausible number). The Enti dataset has no phone. |
| `email` | the first mailbox whose type is `Pec`; "Altro" mailboxes are never imported (often personal). A note (it) says it is a PEC. |
| `official_url` | UO `Url`, else the entity's `Sito_istituzionale`; bare hosts and `http://` are normalised to `https://` (PublishGuard requires https); invalid -> null |
| `booking_url` | never set (not in the source) ; `booking_method = unknown` |
| `source_name/url/type/license` | "IndicePA (AgID) — Enti / Unità Organizzative", the dataset page, `official`, `CC-BY-4.0` |
| `last_verified_at` | fetch date |

Personal data: staff names, responsible-person phones and e-mails (`Nome_responsabile`, `Cognome_responsabile`, `Mail_responsabile`, `Telefono_responsabile`) are never read into memory beyond the CSV row and never stored.

Lifecycle: local/testing -> `published`; any other environment -> `review` (four-eyes). Records that disappear from the source are set to `archived` (never deleted) unless more than half of the data set would vanish (incomplete download guard). A re-run only counts a row as updated when a value changed.

### Commands

```
php artisan expa:import:ipa-offices                       # asl, questure, prefetture
php artisan expa:import:ipa-offices --dry-run
php artisan expa:import:ipa-offices --category=comuni      # opt-in: municipal registry units
php artisan expa:import:ipa-offices --file=uo.csv --enti-file=enti.csv --istat-file=istat.csv
php artisan expa:import-runs                               # audit trail
```

Recommended schedule: weekly (e.g. `Schedule::command('expa:import:ipa-offices')->weeklyOn(1, '03:30')->withoutOverlapping()`), the source changes daily but offices rarely.

Note: the Unità Organizzative dump is ~34 MB and `SourceFetcher` keeps the body in memory; the importer raises `memory_limit` to 512M for the run.

### Counts (local database, 2026-10-11)

154 candidates read on the first run (asl 137, questure 16, prefetture 1); after excluding entities in liquidation: 135 offices (asl 118, questura 16, prefettura 1); 19 earlier rows were archived by the stale-marking path. `--category=comuni` dry-run: 1,516 registry units found, 1,513 valid, 3 rejected (not imported).

### Service <-> office links

`government_service_office` is only filled where the relationship is a stated fact: `permesso-di-soggiorno-roma` (its source page is the Prefettura di Roma "Permessi in Questura") <-> "Questura di Roma - Ufficio Immigrazione" (`YN7RCT`). Declared in `IpaOfficesImporter::SERVICE_OFFICE_LINKS`; nothing else is linked.

## Part 2 — appointment guides

Command: `php artisan expa:import:appointment-guides [--dry-run]` (idempotent by `source_id`; local published, other environments `review`). Text lives in `app/Domains/GovernmentImport/Content/AppointmentGuideContent.php`, `last_verified_at = 2026-10-11`; every page was read and returned HTTP 200 on that date.

| source_id | Official page read (source_url) | Booking channel (booking_portal_url) |
|---|---|---|
| appt-portale-immigrazione-permesso | portaleimmigrazione.it/ITA/ilportale.html (+ compilazioneRicevuta, ricercastrutture) | portaleimmigrazione.it/ITA/index.html |
| appt-cie-agenda-nazionale | cartaidentita.interno.gov.it/richiedi/rilascio-e-rinnovo-in-italia/ | prenotazionicie.interno.gov.it (Agenda CIE) |
| appt-roma-cie-agenda | comune.roma.it scheda-servizi INF173498 | prenotazionicie.interno.gov.it |
| appt-milano-cie | comune.milano.it/servizi/anagrafe/carta-d-identita | same page (booking button; the booking app requires login) |
| appt-agenzia-entrate | agenziaentrate.gov.it/portale/web/guest/prenota-un-appuntamento | same page |
| appt-inps-sportelli-di-sede | inps.it scheda 52562 "Sportelli di sede..." | inps.it/it/it/sedi-e-contatti/sedi/ricerca-sede.html |

All hosts pass `PublishGuard::isOfficialHost` (no host missing from the allow-list). Passport booking was deliberately left out: the Polizia di Stato page concerns Italian passports (not relevant to foreigners) and `passaportonline.poliziadistato.it` did not resolve from this machine. Offline verification: `tests/Feature/DataImport/AppointmentGuidesTest.php`.

Tests: `php artisan test tests/Feature/DataImport/IpaOfficesImportTest.php tests/Feature/DataImport/AppointmentGuidesTest.php` (fixtures in `tests/Fixtures/imports/ipa/FIXTURE-*`, never seeded).
