import { d as defineEventHandler, z as setResponseHeader, x as useRuntimeConfig } from '../nitro/nitro.mjs';
import { a as buildSitemapIndex } from '../_/sitemap.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const sitemap_xml = defineEventHandler((event) => {
  setResponseHeader(event, "content-type", "application/xml; charset=utf-8");
  setResponseHeader(event, "cache-control", "public, max-age=3600");
  return buildSitemapIndex(String(useRuntimeConfig(event).public.siteUrl).replace(/\/+$/, ""));
});

export { sitemap_xml as default };
//# sourceMappingURL=sitemap.xml.mjs.map
