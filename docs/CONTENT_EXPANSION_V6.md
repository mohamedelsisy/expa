# EXPA Content Expansion V6

Date: 2026-10-10  
Status: proposed content; not merged or production-published.

V6 adds one practical guide to each of the major gaps and core sections, with Arabic, English and Italian translations:

| Category | Guide | Official starting point |
|---|---|---|
| Immigration | Residence-permit renewal preparation checklist | Portale Immigrazione |
| Documents | Requesting or correcting Codice Fiscale | Agenzia delle Entrate |
| Driving | Patente B exam roadmap | Portale dell'Automobilista / MIT |
| Healthcare | Choosing a family doctor | Ministry of Health / local ASL |
| Daily life | Registering or changing residence | ANPR |
| Study | University scholarships and student support | University and regional scholarship calls; Universitaly for course discovery |
| Work | Reading and checking a payslip | Ministry of Labour; case-specific support from payroll professionals |
| Money | Starting a Partita IVA | Agenzia delle Entrate |
| Family | Marriage document checklist for foreign nationals | Municipality Ufficio di Stato Civile and relevant consulate |
| Housing | Rental viewing and pre-signing checklist | Agenzia delle Entrate for tax/registration questions |
| Daily life / language | Choosing an Italian course by CEFR level | Local schools, CPIA and universities |

## Content and publishing safeguards

- Every guide has Arabic, English and Italian text.
- Each record uses an idempotent `Guide::updateOrCreate` keyed by slug.
- The source is recorded as official and a verification date is stored; broad institutional homepages are starting points, not proof that every local requirement is identical.
- Local/testing seed content is published for development. Other environments keep it in review and require the normal review/publish workflow.
- The guidance deliberately avoids guaranteeing fees, processing times or eligibility when they vary by status, municipality, region or academic year.
- Before production publication, review each URL and its current instructions, validate legal/administrative accuracy, and have the Italian and Arabic wording reviewed by fluent reviewers.

## Remaining work for genuinely complete coverage

This is a coverage expansion, not a claim that every possible user journey is finished. Continue auditing each category against the current UI and data model, especially:
- immigration: family reunification updates, work-permit conversion eligibility, appointment/receipt tracking;
- documents: CIE appointment process and SPID/CIE recovery;
- healthcare: Tessera Sanitaria renewal, exemptions and local ASL services;
- work: NASpI eligibility, TFR, contract types, leave and workplace rights;
- money: tax return, family benefits, ISEE variations and contribution deadlines;
- housing: registration, deposit return, utilities and municipal housing support;
- family: school enrolment, childcare, birth registration and family benefits;
- study: admission, pre-enrolment, regional scholarships and foreign-document requirements;
- driving: officially licensed study material and current examination rules;
- daily life: Rome-specific services and verified guides for other cities.

No production data is changed by adding this seeder alone.