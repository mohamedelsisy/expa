# Changelog

Format: Keep a Changelog. Unreleased changes at top.

## [Unreleased]
### Added
- T-002: Laravel 13.34 API scaffold in `backend/` with Sanctum; root `.gitignore`; EXPA `.env.example` (ar default locale, AI driver = fake).
- T-003: `/api/v1` routing, `ApiResponse` envelope, localized error rendering (401/403/404/422/429/500), `SetLocale` middleware (ar default; `?lang=` > Accept-Language q-values > default), `GET /api/v1/health`, `config/expa.php`, ar/en/it error strings. 14 feature tests passing, Pint clean.
- T-001: Planning documents (PRODUCT_SPEC, ARCHITECTURE, DATABASE, API_SPEC, DESIGN_SYSTEM, AI_SPEC, SECURITY, GDPR, QA), ROADMAP, TASKS.
