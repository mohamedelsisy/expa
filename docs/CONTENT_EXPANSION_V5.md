# EXPA content expansion — V5 core guides

## What this pack adds

Seven practical, original guides in Arabic, English and Italian:

| Slug | Section | Primary source |
|---|---|---|
| `ssn-healthcare-registration-foreigners` | Healthcare | Ministry of Health |
| `isee-dsu-how-to-apply` | Money / benefits | INPS |
| `register-rental-contract-italy` | Housing | Agenzia delle Entrate, RLI form |
| `family-reunification-italy` | Family / immigration | Portale Integrazione Migranti |
| `study-finder-universitaly-international-students` | Study | Universitaly |
| `employment-contract-and-payslip-basics` | Work | Ministry of Labour |
| `open-partita-iva-first-steps` | Business / self-employment | Agenzia delle Entrate |

Each guide includes a localized title, summary, explanation, audience, document checklist, ordered steps, where to apply, cost caveat, timing caveat and practical notes. Content is paraphrased, not copied from source pages.

## Lifecycle and safety

- Seeder is idempotent and is registered in `DatabaseSeeder`.
- Local/testing content is published so developers can review the actual experience.
- Staging/production content enters `review`; it is not force-published.
- Official sources and a verification date are recorded on each guide.
- Costs and processing times are not invented where the rules depend on individual status, region or current programme details.
- Family reunification, taxation, employment and health eligibility must be checked by a qualified reviewer before production publication.

## Coverage still needed

This is the first expansion slice, not a claim that every EXPA section is now complete. Follow-up packs should add:

1. More guides and service records for immigration, identity documents and government services.
2. City-specific content for Rome and then other cities, with official local links per block.
3. More housing guides (tenant checklist, utilities, contract types and fraud prevention).
4. Healthcare navigation (ASL, family doctor, Tessera Sanitaria and regional variations).
5. Employment guides for NASpI, TFR, working hours, leave, payslips and contract types.
6. Money guides for taxes, ISEE-related benefits and annual eligibility changes.
7. Family guides for births, marriage registration, childcare and school enrolment.
8. Business guides for self-employed registrations, invoices, social contributions and obligations by activity.
9. A broader university, scholarship and admissions catalogue with institution-specific deadlines.
10. A structured Italian curriculum expansion with CEFR levels, exercises and teacher review.
11. Patente learning materials authored or properly licensed, with expert verification of current rules.
12. Verified jobs and provider listings only after the required licensing, moderation and legal checks.

## Verification rule

The `last_verified_at` date records the source review performed for this content pack. Editors must re-open the source, validate every procedural claim, and record a new date before approval if the source or rule has changed. Never treat a seed date alone as legal approval.
