import { d as defineEventHandler, c as createError, r as readRawBody, M as MAX_AUTH_BODY, l as login, e as errorResult } from '../../../nitro/nitro.mjs';
import { s as sameOrigin, r as respond, b as baseOptions } from '../../../_/handle.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const login_post = defineEventHandler(async (event) => {
  var _a;
  if (!sameOrigin(event)) throw createError({ statusCode: 403 });
  const body = (_a = await readRawBody(event)) != null ? _a : "";
  if (body.length > MAX_AUTH_BODY) return respond(event, errorResult(413, "payload_too_large", "Payload too large."));
  return respond(event, await login({ ...baseOptions(event), method: "POST", path: "auth/login", body }));
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map
