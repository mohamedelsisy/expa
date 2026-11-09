import { d as defineEventHandler, g as getMethod, c as createError, h as getHeader, i as getRequestURL, j as getRouterParam, k as MAX_UPLOAD, r as readRawBody, m as forwardRequest, e as errorResult } from '../../../nitro/nitro.mjs';
import { s as sameOrigin, b as baseOptions, r as respond } from '../../../_/handle.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const ____path_ = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const method = getMethod(event);
  if (method !== "GET" && !sameOrigin(event)) {
    throw createError({ statusCode: 403 });
  }
  const contentType = (_a = getHeader(event, "content-type")) != null ? _a : "";
  const base = { ...baseOptions(event), method, path: (_b = getRouterParam(event, "path")) != null ? _b : "", search: getRequestURL(event).search };
  if (/^multipart\//i.test(contentType)) {
    if (Number((_c = getHeader(event, "content-length")) != null ? _c : 0) > MAX_UPLOAD) return respond(event, errorResult(413, "payload_too_large", "Payload too large."));
    const raw = await readRawBody(event, false);
    return respond(event, await forwardRequest({ ...base, rawBody: raw ? new Uint8Array(raw) : new Uint8Array(), contentType }));
  }
  const body = method === "GET" || method === "DELETE" && !getHeader(event, "content-length") ? null : await readRawBody(event);
  return respond(event, await forwardRequest({ ...base, body }));
});

export { ____path_ as default };
//# sourceMappingURL=_...path_.mjs.map
