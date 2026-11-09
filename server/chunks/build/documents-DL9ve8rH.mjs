const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIMES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const EXT_TO_MIME = { pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp";
function validateUpload(file) {
  var _a, _b;
  if (!file.size) return "empty";
  if (file.size > MAX_UPLOAD_BYTES) return "too_large";
  const ext = (_b = (_a = file.name.split(".").pop()) == null ? void 0 : _a.toLowerCase()) != null ? _b : "";
  const mime = (file.type || EXT_TO_MIME[ext] || "").toLowerCase();
  if (!ALLOWED_MIMES.includes(mime)) return "type";
  return null;
}
function formatBytes(n, locale = "en") {
  const [value, unit] = n < 1024 ? [n, "byte"] : n < 1024 * 1024 ? [n / 1024, "kilobyte"] : [n / 1024 / 1024, "megabyte"];
  return new Intl.NumberFormat(locale === "ar" ? "ar-u-nu-latn" : locale, { style: "unit", unit, unitDisplay: "short", maximumFractionDigits: unit === "megabyte" ? 1 : 0 }).format(value);
}
const STATUS_TONE = {
  valid: "success",
  expiring_soon: "warning",
  expired: "danger",
  no_expiry: "neutral"
};
const STATUS_ICON = { valid: "check", expiring_soon: "clock", expired: "alert", no_expiry: "info" };

export { ACCEPT as A, STATUS_TONE as S, STATUS_ICON as a, formatBytes as f, validateUpload as v };
//# sourceMappingURL=documents-DL9ve8rH.mjs.map
