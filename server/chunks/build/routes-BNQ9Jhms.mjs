const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._~-]*$/;
const ID = /^\d{1,12}$/;
const SIMPLE = /* @__PURE__ */ new Set([
  "dashboard",
  "tasks",
  "profile",
  "onboarding",
  "privacy-settings",
  "notifications",
  "ask",
  "explore",
  "guides",
  "government",
  "appointments",
  "documents",
  "learn-italian",
  "patente",
  "jobs",
  "search",
  "pricing",
  "cities",
  "articles",
  "housing",
  "healthcare",
  "money",
  "business",
  "family",
  "travel",
  "daily-life",
  "about",
  "recommendations"
]);
function mapApiRoute(target) {
  if (typeof target !== "string") return null;
  const raw = target;
  if (!raw || raw.length > 300 || /[\s\\\u0000-\u001f]/.test(raw)) return null;
  const [pathPart, query = ""] = raw.replace(/^\/+/, "").split("?", 2);
  if (raw.startsWith("//") || pathPart === "") return null;
  const seg = pathPart.split("/");
  if (!seg.every((s) => SEGMENT.test(s))) return null;
  const [a, b, c] = seg;
  const n = seg.length;
  if (a === "search" && n === 1) {
    const q = new URLSearchParams(query).get("q");
    return q && q.length <= 100 ? `/search?q=${encodeURIComponent(q)}` : "/search";
  }
  if (query) return null;
  if (n === 1) {
    if (a === "my-documents") return "/documents";
    if (a === "study") return "/study";
    return SIMPLE.has(a) ? `/${a}` : null;
  }
  if (a === "my-documents" && n === 2 && ID.test(b)) return `/documents/${b}`;
  if (a === "guides" && n === 2) return `/guides/${b}`;
  if (a === "government" && b === "services" && n === 3) return `/government/services/${c}`;
  if (a === "government" && b === "offices" && n === 3) return `/government/offices/${c}`;
  if (a === "appointments" && b === "guides" && n === 3) return `/appointments/${c}`;
  if (a === "learn-italian" && b === "daily" && n === 2) return "/learn-italian";
  if (a === "learn-italian" && b === "lessons" && n === 3) return `/learn-italian/lessons/${c}`;
  if (a === "patente" && b === "topics" && n === 3) return `/patente/topics/${c}`;
  if (a === "patente" && b === "categories" && n === 3) return "/patente";
  if (a === "study" && n === 2 && (b === "finder" || b === "programs" || b === "universities" || b === "scholarships")) return `/study/${b}`;
  if (a === "study" && n === 3 && (b === "programs" || b === "universities" || b === "scholarships")) return `/study/${b}/${c}`;
  if (a === "jobs" && n === 2 && ID.test(b)) return `/jobs/${b}`;
  if (a === "appointments" && b === "hub" && n === 2) return "/appointments";
  if (a === "money" && b === "net-salary" && n === 2) return "/money/net-salary";
  if (a === "travel" && b === "requirements" && n === 2) return "/travel/requirements";
  if (a === "housing" && b === "check" && n === 2) return "/housing/check";
  if (a === "documents" && b === "explain" && n === 2) return "/documents/explain";
  if (a === "articles" && n === 2) return `/articles/${b}`;
  if (a === "cities" && n === 2) return `/cities/${b}`;
  if (a === "providers" && n === 2) return `/services/${b}`;
  if (a === "patente" && n === 2 && b === "weak-topics") return "/patente/weak";
  if (a === "patente" && n === 2 && b === "glossary") return "/patente/glossary";
  if (a === "italian" && b === "practice" && n === 2) return "/learn-italian/practice";
  return null;
}
function mapApiAction(a) {
  if (!a || typeof a.target !== "string") return null;
  if (a.type === "guide") return SEGMENT.test(a.target) ? `/guides/${a.target}` : null;
  if (a.type === "route") return mapApiRoute(a.target);
  return null;
}

export { mapApiAction as a, mapApiRoute as m };
//# sourceMappingURL=routes-BNQ9Jhms.mjs.map
