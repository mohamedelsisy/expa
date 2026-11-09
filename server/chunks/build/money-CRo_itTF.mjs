import { x as intlLocale } from './server.mjs';

const PERIODS = ["year", "month", "week", "day", "hour"];
const ISO = /^[A-Z]{3}$/;
function formatMoney(amount, currency, locale, maxFraction = 0) {
  const code = (currency != null ? currency : "").toUpperCase();
  try {
    if (ISO.test(code)) return new Intl.NumberFormat(intlLocale(locale), { style: "currency", currency: code, maximumFractionDigits: maxFraction, minimumFractionDigits: 0 }).format(amount);
  } catch {
  }
  return `${new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: maxFraction }).format(amount)}${code ? ` ${code}` : ""}`;
}
function formatSalary(s, locale, periodLabel) {
  var _a;
  if (!s || s.min == null && s.max == null) return null;
  const f = (n) => formatMoney(n, s.currency, locale);
  const range = s.min != null && s.max != null && s.min !== s.max ? `${f(s.min)}\u2013${f(s.max)}` : f((_a = s.min) != null ? _a : s.max);
  const period = s.period && PERIODS.includes(s.period) ? ` / ${periodLabel(s.period)}` : "";
  return `${range}${period}`;
}

export { formatSalary as a, formatMoney as f };
//# sourceMappingURL=money-CRo_itTF.mjs.map
