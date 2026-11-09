import { m as mapApiRoute } from './routes-BNQ9Jhms.mjs';

const EXPLAIN_MIMES = ["application/pdf", "image/jpeg", "image/png"];
const EXPLAIN_ACCEPT = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";
const EXT = { pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png" };
const DEFAULT_MAX_FILE_KB = 8 * 1024;
const DEFAULT_MAX_TEXT = 15e3;
const MIN_TEXT = 15;
function validateExplainFile(file, maxKb = DEFAULT_MAX_FILE_KB) {
  var _a, _b;
  if (!file.size) return "empty";
  if (file.size > maxKb * 1024) return "too_large";
  const ext = (_b = (_a = file.name.split(".").pop()) == null ? void 0 : _a.toLowerCase()) != null ? _b : "";
  const mime = (file.type || EXT[ext] || "").toLowerCase();
  return EXPLAIN_MIMES.includes(mime) ? null : "type";
}
function confidencePercent(c) {
  if (typeof c !== "number" || !Number.isFinite(c) || c < 0) return null;
  return Math.round(c <= 1 ? c * 100 : Math.min(c, 100));
}
function keyDateViews(dates) {
  return dates.map((d) => {
    var _a;
    return { label: d.label, date: d.date || null, text: (_a = d.text) != null ? _a : null, unclear: !d.date, past: !!d.past, yearMissing: !!d.year_missing };
  });
}
function actionViews(actions) {
  return actions.map((a) => {
    var _a;
    return { type: a.type, label: a.label, date: (_a = a.date) != null ? _a : null, path: mapApiRoute(a.target) };
  });
}

export { DEFAULT_MAX_FILE_KB as D, EXPLAIN_ACCEPT as E, MIN_TEXT as M, DEFAULT_MAX_TEXT as a, actionViews as b, confidencePercent as c, keyDateViews as k, validateExplainFile as v };
//# sourceMappingURL=explain-B6AMfDd9.mjs.map
