import { d as defineEventHandler } from '../nitro/nitro.mjs';
import { l as localeSitemap } from '../_/sitemapRoute.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../_/sitemap.mjs';

const sitemapEn_xml = defineEventHandler((event) => localeSitemap(event, "en"));

export { sitemapEn_xml as default };
//# sourceMappingURL=sitemap-en.xml.mjs.map
