# Universities and degree courses (MUR open data)

- Publisher: MUR (Ministero dell'Universita e della Ricerca), Ufficio di Statistica - portal https://dati-ustat.mur.gov.it/
- Dataset: "Metadati" - https://dati-ustat.mur.gov.it/dataset/bed0c71e-9f86-4a0f-a266-963b6f7bbbd2 (author: MUR - Ufficio di Statistica; maintainer: MIUR - Ufficio Gestione Patrimonio Informativo e Statistica)
  - Resource "Atenei" (`01_atenei.csv`, modified 2026-09-01): .../resource/820aefe6-0662-4656-84ec-d8859a2a3b7e
  - Resource "Offerta formativa 2010-2025" (`03_offertaformativa-corsidilaurea_2010-2025.csv`, modified 2026-09-01): .../resource/c0e63906-7190-4568-892b-0cf399f56071
- Licence: IODL 2.0 (Italian Open Data License v2.0) - http://www.dati.gov.it/content/italian-open-data-license-v20 (as declared in the CKAN metadata, `license_id: IODL-2.0`). Reuse allowed with attribution.
- Attribution: "MUR - Ufficio di Statistica (Ministero dell'Universita e della Ricerca), dati-ustat.mur.gov.it, dataset Metadati, licenza IODL 2.0".
- Update frequency: yearly (new academic-year offering), irregular; check monthly.

## Files
- Both CSV, delimiter `;`, CRLF. Atenei: UTF-8 with BOM. Offerta formativa: Windows-1252 (the importer detects/converts per field).
- Atenei columns: COD_Ateneo, NomeEsteso, NomeOperativo, Status, Descrizione, StataleLibera, Indirizzo, CITTA, PROVINCIA, REGIONE, NOME_REGIONE_MACRO.
- Offerta columns: ANNO, Ateneo (= Atenei.NomeOperativo), Area, GruppoDisciplinare, TipoCorso, Classe, NomeClasse, Corso, SedeCorso_Provincia, SedeCorso_Comune, ACCESSO, DIDATTICA, LINGUA. No course code, no ISTAT codes, no website, no tuition, no duration, no deadlines.

## Mapping
- Universities (only those with at least one course in the imported year): `source_id = mur-ateneo:<COD_Ateneo>`, name (it) = NomeEsteso, kind = StataleLibera S -> public, L -> private; summary (it) is assembled from Descrizione + Indirizzo/CITTA/PROVINCIA/REGIONE. `website` stays NULL (not in source). `region_id` via the ISTAT region code (= regions.code) derived from the REGIONE name; `city_id` only when the source CITTA matches exactly one existing `cities` name (the source has no ISTAT city code) - re-run the import after the geography data grows and `city_id` is attached by the normal update path.
- Courses: `source_id = mur-corso:<sha1(24)>` over (Ateneo, Corso, Classe, SedeCorso_Comune, LINGUA, DIDATTICA, ACCESSO) - the year is deliberately not part of the key. degree_level: Laurea -> bachelor; Laurea Magistrale and Laurea Magistrale Ciclo Unico -> master. field: GruppoDisciplinare -> StudyField (Medico-Sanitario -> medicine, Scientifico -> sciences, Ingegneria industriale e dell'informazione -> engineering, Economico -> economics, Letterario-Umanistico -> humanities, Architettura e Ingegneria civile -> architecture, Arte e Design -> arts_design, Linguistico -> languages, Giuridico -> law, Educazione e Formazione -> education, Informatica e ICT -> computer_science; all others (Politico-Sociale e Comunicazione, Psicologico, Agrario-Forestale e Veterinario, Scienze motorie) -> other). instruction_language: Italiano -> it, Inglese -> en, contains both -> both; other combos keep `it`/`en` by the languages present; the exact LINGUA string is kept in the notes. Rows whose LINGUA is only "Altro" are rejected (no supported value).
- Always NULL (not in source): duration_years, tuition_*, required_*_level, application_deadline, program_url, admission_requirements.
- Translations: Italian only (official names). Course titles are stored exactly as published (some are ALL CAPS or contain typos upstream).
- source_url: the MUR resource page (host dati-ustat.mur.gov.it, passes PublishGuard::isOfficialHost via mur.gov.it); source_type official; source_license IODL-2.0; last_verified_at = fetch date (also refreshed for unchanged records).
- Lifecycle: published in local/testing, `review` elsewhere (four-eyes). Records missing from a newer full run are set to `archived` (hidden), never deleted; reappearing records are restored.
- Scholarships: not imported. MUR DSU datasets (diritto-allo-studio-universitario) are aggregate regional statistics, not lists of individual scholarships.

## Commands
```
php artisan expa:import:study                       # download + import latest year
php artisan expa:import:study --dry-run
php artisan expa:import:study --file=of.csv --atenei-file=atenei.csv
php artisan expa:import:study --year=2025 --limit=100   # --limit disables stale-marking
php artisan expa:import-runs --dataset=study
```
Recommended schedule: monthly (`->monthlyOn(5, '03:30')`), output logged.

## Counts (verified 2026-10-11, offering year 2025)
- Atenei file: 112 rows; 92 have courses in 2025 and were imported. Offering 2025: 5,995 rows -> 5,988 courses imported, 7 rejected (LINGUA "Altro"). 92 universities, 5,988 courses, all published locally, 92/92 with region, 78 with city (name match).

## Limitations
- "ANNO" is not defined in the dataset documentation; it is shown as "Anno dell'offerta formativa: 2025" (not converted to an academic-year string).
- No tuition, deadlines, English/Italian requirements, durations or links: the Study Finder reports these as unknown. Users are told to verify on the university's official page.
