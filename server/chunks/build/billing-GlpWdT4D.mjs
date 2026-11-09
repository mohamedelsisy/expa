import { f as formatMoney } from './money-CRo_itTF.mjs';
import { x as intlLocale } from './server.mjs';

function formatMinor(minor, currency, locale) {
  const code = currency.toUpperCase();
  const digits = minor % 100 === 0 ? 0 : 2;
  try {
    if (/^[A-Z]{3}$/.test(code)) return new Intl.NumberFormat(intlLocale(locale), { style: "currency", currency: code, minimumFractionDigits: digits, maximumFractionDigits: 2 }).format(minor / 100);
  } catch {
  }
  return formatMoney(minor / 100, currency, locale, 2);
}
function formatPlanPrice(price, locale, labels) {
  if (!price.amount_minor) return labels.free;
  const amount = formatMinor(price.amount_minor, price.currency, locale);
  return price.interval && price.interval !== "none" ? `${amount} / ${labels.interval(price.interval)}` : amount;
}
const ARABIC_DIGITS = "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669";
function eurosToMinor(input) {
  var _a;
  const s = input.trim().replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d))).replace(/[٫,]/g, ".");
  const m = /^(\d{1,7})(?:\.(\d{1,2}))?$/.exec(s);
  if (!m) return null;
  return Number(m[1]) * 100 + Number(((_a = m[2]) != null ? _a : "").padEnd(2, "0") || "0");
}
function minorToEuros(minor) {
  const whole = Math.trunc(minor / 100);
  const cents = String(Math.abs(minor % 100)).padStart(2, "0");
  return `${whole}.${cents}`;
}
function checkoutErrorKey(e) {
  if ((e == null ? void 0 : e.status) === 503) return "pricing.errors.unavailable";
  if ((e == null ? void 0 : e.status) === 429) return "pricing.errors.tooMany";
  if ((e == null ? void 0 : e.status) === 409 && e.code === "already_subscribed") return "pricing.errors.alreadySubscribed";
  if ((e == null ? void 0 : e.status) === 422 && e.code === "plan_not_purchasable") return "pricing.errors.notPurchasable";
  return "errors.generic";
}

export { formatMinor as a, checkoutErrorKey as c, eurosToMinor as e, formatPlanPrice as f, minorToEuros as m };
//# sourceMappingURL=billing-GlpWdT4D.mjs.map
