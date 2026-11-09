import { d as defineEventHandler, c as createError, a as logout } from '../../../nitro/nitro.mjs';
import { s as sameOrigin, r as respond, b as baseOptions } from '../../../_/handle.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const logout_post = defineEventHandler(async (event) => {
  if (!sameOrigin(event)) throw createError({ statusCode: 403 });
  return respond(event, await logout(baseOptions(event)));
});

export { logout_post as default };
//# sourceMappingURL=logout.post.mjs.map
