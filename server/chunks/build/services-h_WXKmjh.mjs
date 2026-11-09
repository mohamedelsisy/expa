import { x as intlLocale } from './server.mjs';

const SERVICE_LANGUAGES = ["ar", "en", "it", "fr", "es", "de", "ro", "sq", "uk", "ru", "zh", "hi", "ur", "bn", "tl", "pt"];
const REPORT_REASONS = ["spam", "abuse", "misleading", "illegal", "personal_data", "other"];
const REVIEW_MAX = 5e3;
function languageName(code, locale) {
  var _a;
  try {
    return (_a = new Intl.DisplayNames([intlLocale(locale)], { type: "language" }).of(code)) != null ? _a : code;
  } catch {
    return code;
  }
}
function ratingLabel(average, count) {
  return { average: average === null || !count ? null : (Math.round(average * 10) / 10).toFixed(1), count };
}
const LEAD_STATUS_TONE = { new: "info", seen: "success", closed: "neutral" };

export { LEAD_STATUS_TONE as L, REPORT_REASONS as R, SERVICE_LANGUAGES as S, REVIEW_MAX as a, languageName as l, ratingLabel as r };
//# sourceMappingURL=services-h_WXKmjh.mjs.map
