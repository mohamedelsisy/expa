import { d as defineEventHandler, x as useRuntimeConfig, z as setResponseHeader } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const robots_txt = defineEventHandler((event) => {
  const site = String(useRuntimeConfig(event).public.siteUrl).replace(/\/+$/, "");
  setResponseHeader(event, "content-type", "text/plain; charset=utf-8");
  setResponseHeader(event, "cache-control", "public, max-age=3600");
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /*/admin",
    "Disallow: /*/login",
    "Disallow: /*/register",
    "Disallow: /*/forgot-password",
    "Disallow: /*/reset-password",
    "Disallow: /*/verify-email",
    "Disallow: /*/dashboard",
    "Disallow: /*/profile",
    "Disallow: /*/onboarding",
    "Disallow: /*/tasks",
    "Disallow: /*/notifications",
    "Disallow: /*/documents",
    "Disallow: /*/privacy-settings",
    "Disallow: /*/search",
    "Disallow: /*/ask",
    "Disallow: /*/patente/run",
    "Disallow: /*/patente/results",
    "",
    `Sitemap: ${site}/sitemap.xml`,
    ""
  ].join("\n");
});

export { robots_txt as default };
//# sourceMappingURL=robots.txt.mjs.map
