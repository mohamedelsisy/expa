import { d as defineEventHandler, c as createError, f as readBody, v as verifyEmail } from '../../../nitro/nitro.mjs';
import { s as sameOrigin, b as baseOptions, r as respond } from '../../../_/handle.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const verifyEmail_post = defineEventHandler(async (event) => {
  if (!sameOrigin(event)) throw createError({ statusCode: 403 });
  const body = await readBody(event);
  const o = baseOptions(event);
  return respond(event, await verifyEmail({ fetcher: o.fetcher, base: o.base, timeoutMs: o.timeoutMs, lang: o.lang, url: typeof (body == null ? void 0 : body.url) === "string" ? body.url : "" }));
});

export { verifyEmail_post as default };
//# sourceMappingURL=verify-email.post.mjs.map
