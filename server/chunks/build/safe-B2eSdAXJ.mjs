function safeHttpsUrl(url) {
  if (!url || !url.startsWith("https://")) return null;
  try {
    return new URL(url).toString();
  } catch {
    return null;
  }
}
function safeRedirect(target, fallback = "") {
  if (typeof target !== "string") return fallback;
  if (!target.startsWith("/") || target.startsWith("//") || target.includes("\\")) return fallback;
  return target;
}
function jsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export { safeHttpsUrl as a, jsonLd as j, safeRedirect as s };
//# sourceMappingURL=safe-B2eSdAXJ.mjs.map
