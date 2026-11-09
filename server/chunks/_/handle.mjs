import { o as originAllowed, n as getRequestHeader, h as getHeader, s as setCookie, T as TOKEN_COOKIE, C as CHALLENGE_COOKIE, p as deleteCookie, q as setHeader, u as setResponseStatus, w as getCookie, x as useRuntimeConfig, y as TOKEN_MAX_AGE } from '../nitro/nitro.mjs';

const ANALYTICS_COOKIE = "expa_analytics";
function getChallengeToken(event) {
  return getCookie(event, CHALLENGE_COOKIE) || null;
}
function getToken(event) {
  return getCookie(event, TOKEN_COOKIE) || null;
}
function apiConfig(event) {
  const cfg = useRuntimeConfig(event);
  return { base: cfg.apiBaseUrl, timeoutMs: cfg.apiTimeoutMs };
}
function langOf(event) {
  return getHeader(event, "accept-language") || null;
}
function baseOptions(event) {
  var _a;
  const { base, timeoutMs } = apiConfig(event);
  return { fetcher: fetch, base, timeoutMs, lang: langOf(event), token: getToken(event), clientIp: (_a = event.context.clientIp) != null ? _a : null, analyticsConsent: getCookie(event, ANALYTICS_COOKIE) === "granted" };
}
function sameOrigin(event) {
  return originAllowed(getHeader(event, "origin"), getHeader(event, "host"), {
    forwardedHost: getRequestHeader(event, "x-forwarded-host"),
    fetchSite: getRequestHeader(event, "sec-fetch-site")
  });
}
function cookieSecure(event) {
  var _a;
  const mode = String((_a = useRuntimeConfig(event).cookieSecure) != null ? _a : "auto");
  if (mode === "true") return true;
  if (mode === "false") return false;
  return true;
}
function respond(event, result) {
  var _a, _b;
  if (result.setToken) {
    setCookie(event, TOKEN_COOKIE, result.setToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: cookieSecure(event),
      path: "/",
      maxAge: TOKEN_MAX_AGE
    });
  }
  const challengeCookie = { httpOnly: true, sameSite: "lax", secure: cookieSecure(event), path: "/api/auth" };
  if (result.setChallenge) setCookie(event, CHALLENGE_COOKIE, result.setChallenge.token, { ...challengeCookie, maxAge: result.setChallenge.maxAge });
  if (result.clearChallenge) deleteCookie(event, CHALLENGE_COOKIE, challengeCookie);
  if (result.clearToken) {
    deleteCookie(event, TOKEN_COOKIE, { path: "/", httpOnly: true, sameSite: "lax", secure: true });
  }
  for (const [k, v] of Object.entries(result.headers)) setHeader(event, k, v);
  setHeader(event, "cache-control", "no-store");
  setResponseStatus(event, result.status);
  return (_b = (_a = result.stream) != null ? _a : result.body) != null ? _b : "";
}

export { baseOptions as b, getChallengeToken as g, respond as r, sameOrigin as s };
//# sourceMappingURL=handle.mjs.map
