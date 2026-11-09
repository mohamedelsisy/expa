import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { promises, existsSync } from 'node:fs';
import { resolve as resolve$1, dirname as dirname$1, join } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
const ENC_ENC_SLASH_RE = /%252f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return encode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F").replace(ENC_ENC_SLASH_RE, "%2F").replace(AMPERSAND_RE, "%26").replace(PLUS_RE, "%2B");
}
function decode$1(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode$1(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/");
  }
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/") ? input : input + "/";
  }
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    const nextChar = input[_base.length];
    if (!nextChar || nextChar === "/" || nextChar === "?") {
      return input;
    }
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const nextChar = input[_base.length];
  if (nextChar && nextChar !== "/" && nextChar !== "?") {
    return input;
  }
  const trimmed = input.slice(_base.length).replace(/^\/+/, "");
  return "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery$1(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function joinRelativeURL(..._input) {
  const JOIN_SEGMENT_SPLIT_RE = /\/(?!\/)/;
  const input = _input.filter(Boolean);
  const segments = [];
  let segmentsDepth = 0;
  for (const i of input) {
    if (!i || i === "/") {
      continue;
    }
    for (const [sindex, s] of i.split(JOIN_SEGMENT_SPLIT_RE).entries()) {
      if (!s || s === ".") {
        continue;
      }
      if (s === "..") {
        if (segments.length === 1 && hasProtocol(segments[0])) {
          continue;
        }
        segments.pop();
        segmentsDepth--;
        continue;
      }
      if (sindex === 1 && segments[segments.length - 1]?.endsWith(":/")) {
        segments[segments.length - 1] += "/" + s;
        continue;
      }
      segments.push(s);
      segmentsDepth++;
    }
  }
  let url = segments.join("/");
  if (segmentsDepth >= 0) {
    if (input[0]?.startsWith("/") && !url.startsWith("/")) {
      url = "/" + url;
    } else if (input[0]?.startsWith("./") && !url.startsWith("./")) {
      url = "./" + url;
    }
  } else {
    url = "../".repeat(-1 * segmentsDepth) + url;
  }
  if (input[input.length - 1]?.endsWith("/") && !url.endsWith("/")) {
    url += "/";
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const NullObject = /* @__PURE__ */ (() => {
  const C = function() {
  };
  C.prototype = /* @__PURE__ */ Object.create(null);
  return C;
})();
function parse$1(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = new NullObject();
  const opt = {};
  const dec = opt.decode || decode;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function decode(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}

const fieldContentRegExp = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
function serialize$2(name, value, options) {
  const opt = options || {};
  const enc = opt.encode || encodeURIComponent;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  const encodedValue = enc(value);
  if (encodedValue && !fieldContentRegExp.test(encodedValue)) {
    throw new TypeError("argument val is invalid");
  }
  let str = name + "=" + encodedValue;
  if (void 0 !== opt.maxAge && opt.maxAge !== null) {
    const maxAge = opt.maxAge - 0;
    if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    if (!isDate(opt.expires) || Number.isNaN(opt.expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.priority) {
    const priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
    switch (priority) {
      case "low": {
        str += "; Priority=Low";
        break;
      }
      case "medium": {
        str += "; Priority=Medium";
        break;
      }
      case "high": {
        str += "; Priority=High";
        break;
      }
      default: {
        throw new TypeError("option priority is invalid");
      }
    }
  }
  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true: {
        str += "; SameSite=Strict";
        break;
      }
      case "lax": {
        str += "; SameSite=Lax";
        break;
      }
      case "strict": {
        str += "; SameSite=Strict";
        break;
      }
      case "none": {
        str += "; SameSite=None";
        break;
      }
      default: {
        throw new TypeError("option sameSite is invalid");
      }
    }
  }
  if (opt.partitioned) {
    str += "; Partitioned";
  }
  return str;
}
function isDate(val) {
  return Object.prototype.toString.call(val) === "[object Date]" || val instanceof Date;
}

function parseSetCookie(setCookieValue, options) {
  const parts = (setCookieValue || "").split(";").filter((str) => typeof str === "string" && !!str.trim());
  const nameValuePairStr = parts.shift() || "";
  const parsed = _parseNameValuePair(nameValuePairStr);
  const name = parsed.name;
  let value = parsed.value;
  try {
    value = options?.decode === false ? value : (options?.decode || decodeURIComponent)(value);
  } catch {
  }
  const cookie = {
    name,
    value
  };
  for (const part of parts) {
    const sides = part.split("=");
    const partKey = (sides.shift() || "").trimStart().toLowerCase();
    const partValue = sides.join("=");
    switch (partKey) {
      case "expires": {
        cookie.expires = new Date(partValue);
        break;
      }
      case "max-age": {
        cookie.maxAge = Number.parseInt(partValue, 10);
        break;
      }
      case "secure": {
        cookie.secure = true;
        break;
      }
      case "httponly": {
        cookie.httpOnly = true;
        break;
      }
      case "samesite": {
        cookie.sameSite = partValue;
        break;
      }
      default: {
        cookie[partKey] = partValue;
      }
    }
  }
  return cookie;
}
function _parseNameValuePair(nameValuePairStr) {
  let name = "";
  let value = "";
  const nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift();
    value = nameValueArr.join("=");
  } else {
    value = nameValuePairStr;
  }
  return { name, value };
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = { ...defaults };
  for (const key of Object.keys(baseObject)) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function o(n){throw new Error(`${n} is not implemented yet!`)}let i$1 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o("Readable.asyncIterator")}iterator(e){throw o("Readable.iterator")}map(e,t){throw o("Readable.map")}filter(e,t){throw o("Readable.filter")}forEach(e,t){throw o("Readable.forEach")}reduce(e,t,r){throw o("Readable.reduce")}find(e,t){throw o("Readable.find")}findIndex(e,t){throw o("Readable.findIndex")}some(e,t){throw o("Readable.some")}toArray(e){throw o("Readable.toArray")}every(e,t){throw o("Readable.every")}flatMap(e,t){throw o("Readable.flatMap")}drop(e,t){throw o("Readable.drop")}take(e,t){throw o("Readable.take")}asIndexedPairs(e){throw o("Readable.asIndexedPairs")}};let l$1 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),s&&s(),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c=class{allowHalfOpen=true;_destroy;constructor(e=new i$1,t=new l$1){Object.assign(this,e),Object.assign(this,t),this._destroy=m(e._destroy,t._destroy);}};function _(){return Object.assign(c.prototype,i$1.prototype),Object.assign(c.prototype,l$1.prototype),c}function m(...n){return function(...e){for(const t of n)t(...e);}}const g=_();class A extends g{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}}class y extends i$1{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}}function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}class w extends l$1{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}}const E=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R(n={}){const e=new E,t=Array.isArray(n)||H(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H(n){return typeof n?.entries=="function"}function v(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S=new Set([101,204,205,304]);async function b(n,e){const t=new y,r=new w(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C(n,e,t={}){try{const r=await b(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function getQuery(event) {
  return getQuery$1(event.path || "");
}
function getRouterParams(event, opts = {}) {
  let params = event.context.params || {};
  if (opts.decode) {
    params = { ...params };
    for (const key in params) {
      params[key] = decode$1(params[key]);
    }
  }
  return params;
}
function getRouterParam(event, name, opts = {}) {
  const params = getRouterParams(event, opts);
  return params[name];
}
function getMethod(event, defaultMethod = "GET") {
  return (event.node.req.method || defaultMethod).toUpperCase();
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
const getHeader = getRequestHeader;
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}

const RawBodySymbol = Symbol.for("h3RawBody");
const ParsedBodySymbol = Symbol.for("h3ParsedBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !/\bchunked\b/i.test(
    String(event.node.req.headers["transfer-encoding"] ?? "")
  )) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
async function readBody$1(event, options = {}) {
  const request = event.node.req;
  if (hasProp(request, ParsedBodySymbol)) {
    return request[ParsedBodySymbol];
  }
  const contentType = request.headers["content-type"] || "";
  const body = await readRawBody(event);
  let parsed;
  if (contentType === "application/json") {
    parsed = _parseJSON(body, options.strict ?? true);
  } else if (contentType.startsWith("application/x-www-form-urlencoded")) {
    parsed = _parseURLEncodedBody(body);
  } else if (contentType.startsWith("text/")) {
    parsed = body;
  } else {
    parsed = _parseJSON(body, options.strict ?? false);
  }
  request[ParsedBodySymbol] = parsed;
  return parsed;
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}
function _parseJSON(body = "", strict) {
  if (!body) {
    return void 0;
  }
  try {
    return destr(body, { strict });
  } catch {
    throw createError$1({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid JSON body"
    });
  }
}
function _parseURLEncodedBody(body) {
  const form = new URLSearchParams(body);
  const parsedForm = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of form.entries()) {
    if (hasProp(parsedForm, key)) {
      if (!Array.isArray(parsedForm[key])) {
        parsedForm[key] = [parsedForm[key]];
      }
      parsedForm[key].push(value);
    } else {
      parsedForm[key] = value;
    }
  }
  return parsedForm;
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}

function getDistinctCookieKey(name, opts) {
  return [name, opts.domain || "", opts.path || "/"].join(";");
}

function parseCookies(event) {
  return parse$1(event.node.req.headers.cookie || "");
}
function getCookie(event, name) {
  return parseCookies(event)[name];
}
function setCookie(event, name, value, serializeOptions = {}) {
  if (!serializeOptions.path) {
    serializeOptions = { path: "/", ...serializeOptions };
  }
  const newCookie = serialize$2(name, value, serializeOptions);
  const currentCookies = splitCookiesString(
    event.node.res.getHeader("set-cookie")
  );
  if (currentCookies.length === 0) {
    event.node.res.setHeader("set-cookie", newCookie);
    return;
  }
  const newCookieKey = getDistinctCookieKey(name, serializeOptions);
  event.node.res.removeHeader("set-cookie");
  for (const cookie of currentCookies) {
    const parsed = parseSetCookie(cookie);
    const key = getDistinctCookieKey(parsed.name, parsed);
    if (key === newCookieKey) {
      continue;
    }
    event.node.res.appendHeader("set-cookie", cookie);
  }
  event.node.res.appendHeader("set-cookie", newCookie);
}
function deleteCookie(event, name, serializeOptions) {
  setCookie(event, name, "", {
    ...serializeOptions,
    maxAge: 0
  });
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send$1(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send$1(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
const setHeader = setResponseHeader;
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _rawReqUrl = event.node.req.url || "/";
    const _reqPath = _decodePath(event._path || _rawReqUrl);
    event._path = _reqPath;
    const _needsRawUrl = _reqPath !== _rawReqUrl;
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _needsRawUrl ? layer.route.length > 1 ? _rawReqUrl.slice(layer.route.length) || "/" : _rawReqUrl : _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send$1(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send$1(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send$1(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send$1(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send$1(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function _decodePath(url) {
  const qIndex = url.indexOf("?");
  const path = qIndex === -1 ? url : url.slice(0, qIndex);
  const query = qIndex === -1 ? "" : url.slice(qIndex);
  const decodedPath = path.includes("%25") ? decodePath(path.replace(/%25/g, "%2525")) : decodePath(path);
  return decodedPath + query;
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s=globalThis.Headers,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (contentType === "text/event-stream") {
    return "stream";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
      if (!(context.options.headers instanceof Headers)) {
        context.options.headers = new Headers(
          context.options.headers || {}
          /* compat */
        );
      }
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        const contentType = context.options.headers.get("content-type");
        if (typeof context.options.body !== "string") {
          context.options.body = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(
            context.options.body
          ).toString() : JSON.stringify(context.options.body);
        }
        if (!contentType) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s;
const AbortController = globalThis.AbortController || i;
const ofetch = createFetch({ fetch, Headers: Headers$1, AbortController });
const $fetch = ofetch;

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.keys = nsStorage.getKeys;
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$1(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

function serialize$1(input) {
	if (typeof input === "string") return `'${input}'`;
	return new Serializer().serialize(input);
}
const asciiOrder = " _-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$0123456789abcdefghijklmnopqrstuvwxyz";
const asciiWeights = /*@__PURE__*/ (function() {
	const weights = /* @__PURE__ */ new Uint8Array(128);
	for (let i = 0; i < 69; i++) weights[asciiOrder.charCodeAt(i)] = i + 1;
	for (let code = 65; code <= 90; code++) weights[code] = weights[code + 32];
	return weights;
})();
function compareStrings(a, b) {
	if (a === b) return 0;
	const length = Math.min(a.length, b.length);
	let tieBreaker = 0;
	for (let i = 0; i < length; i++) {
		const codeA = a.charCodeAt(i);
		const codeB = b.charCodeAt(i);
		if (codeA === codeB) continue;
		const weightA = codeA < 128 && asciiWeights[codeA] ? asciiWeights[codeA] : codeA + 128;
		const weightB = codeB < 128 && asciiWeights[codeB] ? asciiWeights[codeB] : codeB + 128;
		if (weightA !== weightB) return weightA < weightB ? -1 : 1;
		if (tieBreaker === 0) tieBreaker = codeA > codeB ? -1 : 1;
	}
	if (a.length !== b.length) return a.length < b.length ? -1 : 1;
	return tieBreaker;
}
const Serializer = /*@__PURE__*/ (function() {
	class Serializer {
		#context = /* @__PURE__ */ new Map();
		compare(a, b) {
			const typeA = typeof a;
			const typeB = typeof b;
			if (typeA === "string" && typeB === "string") return compareStrings(a, b);
			if (typeA === "number" && typeB === "number") return a - b;
			return compareStrings(this.serialize(a, true), this.serialize(b, true));
		}
		serialize(value, noQuotes) {
			if (value === null) return "null";
			switch (typeof value) {
				case "string": return noQuotes ? value : `'${value}'`;
				case "bigint": return `${value}n`;
				case "object": return this.$object(value);
				case "function": return this.$function(value);
			}
			return String(value);
		}
		serializeObject(object) {
			const objString = Object.prototype.toString.call(object);
			if (objString !== "[object Object]") return this.serializeBuiltInType(objString.length < 10 ? `unknown:${objString}` : objString.slice(8, -1), object);
			const constructor = object.constructor;
			const objName = constructor === Object || constructor === void 0 ? "" : constructor.name;
			if (objName !== "" && globalThis[objName] === constructor) return this.serializeBuiltInType(objName, object);
			if ("toJSON" in object && typeof object.toJSON === "function") {
				const json = object.toJSON();
				return objName + (json !== null && typeof json === "object" ? this.$object(json) : `(${this.serialize(json)})`);
			}
			const keys = Object.keys(object).sort(compareStrings);
			let content = `${objName}{`;
			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];
				content += `${key}:${this.serialize(object[key])}`;
				if (i < keys.length - 1) content += ",";
			}
			return content + "}";
		}
		serializeBuiltInType(type, object) {
			const handler = this["$" + type];
			if (handler) return handler.call(this, object);
			if (typeof object.entries === "function") return this.serializeObjectEntries(type, object.entries());
			throw new Error(`Cannot serialize ${type}`);
		}
		serializeObjectEntries(type, entries) {
			const sortedEntries = Array.from(entries).sort((a, b) => this.compare(a[0], b[0]));
			let content = `${type}{`;
			for (let i = 0; i < sortedEntries.length; i++) {
				const [key, value] = sortedEntries[i];
				content += `${this.serialize(key, true)}:${this.serialize(value)}`;
				if (i < sortedEntries.length - 1) content += ",";
			}
			return content + "}";
		}
		$object(object) {
			let content = this.#context.get(object);
			if (content === void 0) {
				this.#context.set(object, `#${this.#context.size}`);
				content = this.serializeObject(object);
				this.#context.set(object, content);
			}
			return content;
		}
		$function(fn) {
			const fnStr = Function.prototype.toString.call(fn);
			if (fnStr.slice(-15) === "[native code] }") return `${fn.name || ""}()[native]`;
			return `${fn.name}(${fn.length})${fnStr.replace(/\s*\n\s*/g, "")}`;
		}
		$Array(arr) {
			let content = "[";
			for (let i = 0; i < arr.length; i++) {
				content += this.serialize(arr[i]);
				if (i < arr.length - 1) content += ",";
			}
			return content + "]";
		}
		$Date(date) {
			try {
				return `Date(${date.toISOString()})`;
			} catch {
				return `Date(null)`;
			}
		}
		$ArrayBuffer(arr) {
			return `ArrayBuffer[${new Uint8Array(arr).join(",")}]`;
		}
		$Set(set) {
			return `Set${this.$Array(Array.from(set).sort((a, b) => this.compare(a, b)))}`;
		}
		$Map(map) {
			return this.serializeObjectEntries("Map", map.entries());
		}
	}
	for (const type of [
		"Error",
		"RegExp",
		"URL"
	]) Serializer.prototype["$" + type] = function(val) {
		return `${type}(${val})`;
	};
	for (const type of [
		"Int8Array",
		"Uint8Array",
		"Uint8ClampedArray",
		"Int16Array",
		"Uint16Array",
		"Int32Array",
		"Uint32Array",
		"Float32Array",
		"Float64Array"
	]) Serializer.prototype["$" + type] = function(arr) {
		return `${type}[${arr.join(",")}]`;
	};
	for (const type of ["BigInt64Array", "BigUint64Array"]) Serializer.prototype["$" + type] = function(arr) {
		return `${type}[${arr.join("n,")}${arr.length > 0 ? "n" : ""}]`;
	};
	return Serializer;
})();
function isEqual(object1, object2) {
	if (object1 === object2) return true;
	if (serialize$1(object1) === serialize$1(object2)) return true;
	return false;
}

const fastHash = /*@__PURE__*/ (() => globalThis.process?.getBuiltinModule?.("crypto")?.hash)();
const algorithm = "sha256";
const encoding = "base64url";
function digest(data) {
	if (fastHash) return fastHash(algorithm, data, encoding);
	const h = createHash(algorithm).update(data);
	return globalThis.process?.versions?.webcontainer ? h.digest().toString(encoding) : h.digest(encoding);
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const inlineAppConfig = {
  "nuxt": {}
};



const appConfig = defuFn(inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "bcad80bf-796e-4e3c-b3c7-6a2822122ffd",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/api/**": {
        "headers": {
          "cache-control": "no-store"
        }
      },
      "/ar/admin/**": {
        "headers": {
          "cache-control": "no-store"
        }
      },
      "/en/admin/**": {
        "headers": {
          "cache-control": "no-store"
        }
      },
      "/it/admin/**": {
        "headers": {
          "cache-control": "no-store"
        }
      },
      "/ar/patente/run/**": {
        "ssr": false,
        "headers": {
          "cache-control": "no-store"
        }
      },
      "/en/patente/run/**": {
        "ssr": false,
        "headers": {
          "cache-control": "no-store"
        }
      },
      "/it/patente/run/**": {
        "ssr": false,
        "headers": {
          "cache-control": "no-store"
        }
      },
      "/ar/patente/results/**": {
        "ssr": false,
        "headers": {
          "cache-control": "no-store"
        }
      },
      "/en/patente/results/**": {
        "ssr": false,
        "headers": {
          "cache-control": "no-store"
        }
      },
      "/it/patente/results/**": {
        "ssr": false,
        "headers": {
          "cache-control": "no-store"
        }
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      },
      "/_nuxt/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      }
    }
  },
  "public": {
    "siteUrl": "",
    "i18n": {
      "baseUrl": "",
      "defaultLocale": "ar",
      "defaultDirection": "ltr",
      "strategy": "prefix",
      "lazy": true,
      "rootRedirect": "",
      "routesNameSeparator": "___",
      "defaultLocaleRouteNameSuffix": "default",
      "skipSettingLocaleOnNavigate": false,
      "differentDomains": false,
      "trailingSlash": false,
      "locales": [
        {
          "code": "ar",
          "language": "ar",
          "dir": "rtl",
          "name": "العربية",
          "files": [
            {
              "path": "/Applications/XAMPP/xamppfiles/htdocs/expa/web/i18n/locales/ar.json",
              "cache": ""
            }
          ]
        },
        {
          "code": "en",
          "language": "en",
          "dir": "ltr",
          "name": "English",
          "files": [
            {
              "path": "/Applications/XAMPP/xamppfiles/htdocs/expa/web/i18n/locales/en.json",
              "cache": ""
            }
          ]
        },
        {
          "code": "it",
          "language": "it",
          "dir": "ltr",
          "name": "Italiano",
          "files": [
            {
              "path": "/Applications/XAMPP/xamppfiles/htdocs/expa/web/i18n/locales/it.json",
              "cache": ""
            }
          ]
        }
      ],
      "detectBrowserLanguage": false,
      "experimental": {
        "localeDetector": "",
        "switchLocalePathLinkSSR": false,
        "autoImportTranslationFunctions": false,
        "typedPages": true,
        "typedOptionsAndMessages": false,
        "generatedLocaleFilePathFormat": "absolute",
        "alternateLinkCanonicalQueries": false,
        "hmr": true
      },
      "multiDomainLocales": false,
      "domainLocales": {
        "ar": {
          "domain": ""
        },
        "en": {
          "domain": ""
        },
        "it": {
          "domain": ""
        }
      }
    }
  },
  "apiBaseUrl": "",
  "apiTimeoutMs": 10000,
  "trustedProxyHops": 0,
  "cookieSecure": "auto",
  "security": {
    "hsts": false
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
function executeAsync(function_) {
  const restores = [];
  for (const leaveHandler of asyncHandlers) {
    const restore2 = leaveHandler();
    if (restore2) {
      restores.push(restore2);
    }
  }
  const restore = () => {
    for (const restore2 of restores) {
      restore2();
    }
  };
  let awaitable = function_();
  if (awaitable && typeof awaitable === "object" && "catch" in awaitable) {
    awaitable = awaitable.catch((error) => {
      restore();
      throw error;
    });
  }
  return [awaitable, restore];
}

getContext("nitro-app", {
  asyncContext: false,
  AsyncLocalStorage: void 0
});

function isPathInScope(pathname, base) {
  let canonical;
  try {
    const pre = pathname.replace(/%2f/gi, "/").replace(/%5c/gi, "\\");
    canonical = new URL(pre, "http://_").pathname;
  } catch {
    return false;
  }
  return !base || canonical === base || canonical.startsWith(base + "/");
}

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError$1({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError$1({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function isJsonRequest(event) {
	
	if (hasReqHeader(event, "accept", "text/html")) {
		return false;
	}
	return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
	const value = getRequestHeader(event, name);
	return !!(value && typeof value === "string" && value.toLowerCase().includes(includes));
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
	if (event.handled || isJsonRequest(event)) {
		
		return;
	}
	
	const defaultRes = await defaultHandler(error, event, { json: true });
	
	const status = error.status || error.statusCode || 500;
	if (status === 404 && defaultRes.status === 302) {
		setResponseHeaders(event, defaultRes.headers);
		setResponseStatus(event, defaultRes.status, defaultRes.statusText);
		return send$1(event, JSON.stringify(defaultRes.body, null, 2));
	}
	const errorObject = defaultRes.body;
	
	const url = new URL(errorObject.url);
	errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
	
	errorObject.message = error.unhandled ? errorObject.message || "Server Error" : error.message || errorObject.message || "Server Error";
	
	errorObject.data ||= error.data;
	errorObject.statusText ||= error.statusText || error.statusMessage;
	delete defaultRes.headers["content-type"];
	delete defaultRes.headers["content-security-policy"];
	setResponseHeaders(event, defaultRes.headers);
	
	const reqHeaders = getRequestHeaders(event);
	
	const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"] || !!event.context.nuxt?.["~rendering-error"];
	if (!isRenderingError) {
		event.context.nuxt ||= {};
		event.context.nuxt["~rendering-error"] = true;
	}
	
	const res = isRenderingError ? null : await useNitroApp().localFetch(withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject), {
		headers: {
			...reqHeaders,
			"x-nuxt-error": "true"
		},
		redirect: "manual"
	}).catch(() => null);
	if (event.handled) {
		return;
	}
	
	if (!res) {
		const { template } = await import('../_/error-500.mjs');
		setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
		return send$1(event, template(errorObject));
	}
	const html = await res.text();
	for (const [header, value] of res.headers.entries()) {
		if (header === "set-cookie") {
			appendResponseHeader(event, header, value);
			continue;
		}
		setResponseHeader(event, header, value);
	}
	setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
	return send$1(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send$1(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

function defineNitroPlugin(def) {
  return def;
}

function inlineScriptHashes(html) {
  var _a, _b, _c, _d;
  const out = /* @__PURE__ */ new Set();
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while (m = re.exec(html)) {
    const attrs = (_a = m[1]) != null ? _a : "";
    const body = (_b = m[2]) != null ? _b : "";
    if (/\bsrc\s*=/.test(attrs) || !body.trim()) continue;
    const type = (_d = (_c = /\btype\s*=\s*["']?([^"'\s>]+)/i.exec(attrs)) == null ? void 0 : _c[1]) == null ? void 0 : _d.toLowerCase();
    if (type && type !== "text/javascript" && type !== "module") continue;
    out.add(`'sha256-${createHash("sha256").update(body).digest("base64")}'`);
  }
  return [...out];
}
function buildCsp(html, upgradeInsecure = false) {
  const scripts = ["'self'", ...inlineScriptHashes(html)].join(" ");
  return [
    "default-src 'self'",
    `script-src ${scripts}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...upgradeInsecure ? ["upgrade-insecure-requests"] : []
  ].join("; ");
}
function securityHeaders(o) {
  const h = {
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    "cross-origin-opener-policy": "same-origin"
  };
  if (o.hsts) h["strict-transport-security"] = "max-age=31536000; includeSubDomains";
  return h;
}

const _zjGU9jJNOSef7zuYpt0SCFFv3LOOLEuFxNtFYOtX4LQ = defineNitroPlugin((nitro) => {
  nitro.hooks.hook("render:response", (response, { event }) => {
    if (typeof response.body !== "string") return;
    const cfg = useRuntimeConfig(event);
    const hsts = cfg.security.hsts === true || String(cfg.security.hsts) === "true";
    {
      response.headers = { ...response.headers, "content-security-policy": buildCsp(response.body, hsts) };
    }
    if (response.headers) delete response.headers["x-powered-by"];
  });
  nitro.hooks.hook("beforeResponse", (event) => {
    var _a, _b;
    (_b = (_a = event.node.res).removeHeader) == null ? void 0 : _b.call(_a, "x-powered-by");
  });
});

const LOCAL = /^(localhost|127\.\d+\.\d+\.\d+|\[?::1\]?|0\.0\.0\.0)$/i;
function parse(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:" ? u : null;
  } catch {
    return null;
  }
}
function runtimeConfigProblems(i) {
  const problems = [];
  const check = (name, env, value) => {
    if (!value) return problems.push(`${name} is empty: set ${env} at container start (it cannot be baked in at build time).`);
    const u = parse(value);
    if (!u) return problems.push(`${name} is not a valid http(s) URL: "${value}" (${env}).`);
    if (!i.allowLocal && LOCAL.test(u.hostname)) problems.push(`${name} points at "${u.hostname}" (${env}). Set the real origin, or EXPA_ALLOW_LOCAL=1 for local runs.`);
  };
  check("apiBaseUrl", "NUXT_API_BASE_URL", i.apiBaseUrl);
  check("siteUrl", "NUXT_PUBLIC_SITE_URL", i.siteUrl);
  return problems;
}

const _5f7c8k9KAsqSRBuzZRhEhYa5TIkxr7apxYJHEVcxqw = defineNitroPlugin(() => {
  var _a, _b;
  const cfg = useRuntimeConfig();
  const problems = runtimeConfigProblems({
    apiBaseUrl: String((_a = cfg.apiBaseUrl) != null ? _a : ""),
    siteUrl: String((_b = cfg.public.siteUrl) != null ? _b : ""),
    allowLocal: process.env.EXPA_ALLOW_LOCAL === "1"
  });
  if (problems.length) throw new Error(`Invalid EXPA web configuration:
 - ${problems.join("\n - ")}`);
});

const plugins = [
  _zjGU9jJNOSef7zuYpt0SCFFv3LOOLEuFxNtFYOtX4LQ,
_5f7c8k9KAsqSRBuzZRhEhYa5TIkxr7apxYJHEVcxqw
];

const assets = {
  "/favicon.svg": {
    "type": "image/svg+xml",
    "etag": "\"d1-sGjQ4ugpzH6lmiQk4RwHVEzTPeY\"",
    "mtime": "2026-10-18T08:18:16.231Z",
    "size": 209,
    "path": "../public/favicon.svg"
  },
  "/og-image.png": {
    "type": "image/png",
    "etag": "\"27b1-8Jj3yJy6S60nuItoNv44ZeROK5Y\"",
    "mtime": "2026-10-18T08:18:16.231Z",
    "size": 10161,
    "path": "../public/og-image.png"
  },
  "/_nuxt/-8DrEQZX.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"21a8-zCXbmqzvCl/ACogX/MW8Haq5I7k\"",
    "mtime": "2026-10-18T08:18:16.229Z",
    "size": 8616,
    "path": "../public/_nuxt/-8DrEQZX.js"
  },
  "/_nuxt/-8DrEQZX.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"b56-aeCF3MDgX3MyOnMJ+FrBKPzwQvw\"",
    "mtime": "2026-10-18T08:18:16.250Z",
    "size": 2902,
    "path": "../public/_nuxt/-8DrEQZX.js.br"
  },
  "/_nuxt/-8DrEQZX.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"c8b-HQMNdXdJPSE7F7rOR30jD7FhrHo\"",
    "mtime": "2026-10-18T08:18:16.243Z",
    "size": 3211,
    "path": "../public/_nuxt/-8DrEQZX.js.gz"
  },
  "/_nuxt/-YBtiJ_9.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"6a7-Ge6CKs1471WhJex0cpgGTpZeGpo\"",
    "mtime": "2026-10-18T08:18:16.229Z",
    "size": 1703,
    "path": "../public/_nuxt/-YBtiJ_9.js"
  },
  "/_nuxt/-YBtiJ_9.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2d1-n5CbnIttzGhCBGYtsfar45o7xgk\"",
    "mtime": "2026-10-18T08:18:16.243Z",
    "size": 721,
    "path": "../public/_nuxt/-YBtiJ_9.js.br"
  },
  "/_nuxt/26ctqpwV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3dd-iySm12CmI6gaJSuiCk19DoUjZL8\"",
    "mtime": "2026-10-18T08:18:16.191Z",
    "size": 989,
    "path": "../public/_nuxt/26ctqpwV.js"
  },
  "/_nuxt/2i_7kN91.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a0-AgopshQ8wmhJEXSc/Lo9epOD2RU\"",
    "mtime": "2026-10-18T08:18:16.191Z",
    "size": 672,
    "path": "../public/_nuxt/2i_7kN91.js"
  },
  "/_nuxt/-YBtiJ_9.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"345-5mIYkErbDp4NSUXkrZI8FVWaVVk\"",
    "mtime": "2026-10-18T08:18:16.243Z",
    "size": 837,
    "path": "../public/_nuxt/-YBtiJ_9.js.gz"
  },
  "/_nuxt/318bcMy_.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"afd-mqtI0HkuQRUkCgjivp885lcDREg\"",
    "mtime": "2026-10-18T08:18:16.191Z",
    "size": 2813,
    "path": "../public/_nuxt/318bcMy_.js"
  },
  "/_nuxt/318bcMy_.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4d2-/qMiswq4+NpsQFqo5jqd9ePv4DI\"",
    "mtime": "2026-10-18T08:18:16.243Z",
    "size": 1234,
    "path": "../public/_nuxt/318bcMy_.js.br"
  },
  "/_nuxt/088EB2qs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"226-SLBIdIw7GDO1eq+jGzsNYZJsxz0\"",
    "mtime": "2026-10-18T08:18:16.191Z",
    "size": 550,
    "path": "../public/_nuxt/088EB2qs.js"
  },
  "/_nuxt/318bcMy_.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"55e-mNxoWu5NvEHa2vmPZQwBtGWXmCM\"",
    "mtime": "2026-10-18T08:18:16.243Z",
    "size": 1374,
    "path": "../public/_nuxt/318bcMy_.js.gz"
  },
  "/_nuxt/3m8QLgP_.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"b62-z72rgq8PS10dApTSCs7xBw9fFDU\"",
    "mtime": "2026-10-18T08:18:16.193Z",
    "size": 2914,
    "path": "../public/_nuxt/3m8QLgP_.js"
  },
  "/_nuxt/3m8QLgP_.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"46f-SDB3A8Zd0zx1SwfChpgwZcEUZus\"",
    "mtime": "2026-10-18T08:18:16.243Z",
    "size": 1135,
    "path": "../public/_nuxt/3m8QLgP_.js.br"
  },
  "/_nuxt/3m8QLgP_.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4f5-m8VhmBSuBprwa7rvfbpjda+K+uU\"",
    "mtime": "2026-10-18T08:18:16.243Z",
    "size": 1269,
    "path": "../public/_nuxt/3m8QLgP_.js.gz"
  },
  "/_nuxt/4IpSWfew.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"218-RchxQL2enbsTkIFCqhS8mP92ELY\"",
    "mtime": "2026-10-18T08:18:16.246Z",
    "size": 536,
    "path": "../public/_nuxt/4IpSWfew.js.br"
  },
  "/_nuxt/4IpSWfew.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"257-OJXz3gKAXVzGZmKOwgptHOL9Ho8\"",
    "mtime": "2026-10-18T08:18:16.243Z",
    "size": 599,
    "path": "../public/_nuxt/4IpSWfew.js.gz"
  },
  "/_nuxt/4i0xbQIj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"380-76AEWGHsiT5x87++PXm1PNhpZwU\"",
    "mtime": "2026-10-18T08:18:16.191Z",
    "size": 896,
    "path": "../public/_nuxt/4i0xbQIj.js"
  },
  "/_nuxt/4lihaqku.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1db-hYFQ763hj1zFkIurKQhD1cJ1vQg\"",
    "mtime": "2026-10-18T08:18:16.193Z",
    "size": 475,
    "path": "../public/_nuxt/4lihaqku.js"
  },
  "/_nuxt/4IpSWfew.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"42e-lTf3iR2IKMkvNj2qe5D9s5dJe+I\"",
    "mtime": "2026-10-18T08:18:16.192Z",
    "size": 1070,
    "path": "../public/_nuxt/4IpSWfew.js"
  },
  "/_nuxt/5kUNMzmo.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"486-ruzBHGd8RAOP/1P6E21MzNhDbBs\"",
    "mtime": "2026-10-18T08:18:16.193Z",
    "size": 1158,
    "path": "../public/_nuxt/5kUNMzmo.js"
  },
  "/_nuxt/5kUNMzmo.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2ce-0X9CqsbJaAVcsCTZ8C3OlPokQ0A\"",
    "mtime": "2026-10-18T08:18:16.246Z",
    "size": 718,
    "path": "../public/_nuxt/5kUNMzmo.js.gz"
  },
  "/_nuxt/5kUNMzmo.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"27e-QvgoBQHp+D8g68DUKVApnUXdztc\"",
    "mtime": "2026-10-18T08:18:16.246Z",
    "size": 638,
    "path": "../public/_nuxt/5kUNMzmo.js.br"
  },
  "/_nuxt/7NwlBC8f.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"12a4-hpz3JLW+beF4PUvYeRzciVB6qyk\"",
    "mtime": "2026-10-18T08:18:16.193Z",
    "size": 4772,
    "path": "../public/_nuxt/7NwlBC8f.js"
  },
  "/_nuxt/7NwlBC8f.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"693-1yBgyxv9Gd6GHQRtgICXc1ZwCnw\"",
    "mtime": "2026-10-18T08:18:16.251Z",
    "size": 1683,
    "path": "../public/_nuxt/7NwlBC8f.js.br"
  },
  "/_nuxt/7NwlBC8f.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"773-RP/zrlOfZPSa9rTlQ4/wRviuCyQ\"",
    "mtime": "2026-10-18T08:18:16.246Z",
    "size": 1907,
    "path": "../public/_nuxt/7NwlBC8f.js.gz"
  },
  "/_nuxt/7ivQ76Ii.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"4a7-2lD9mULRW9ecHCBGVACqoy27eyU\"",
    "mtime": "2026-10-18T08:18:16.193Z",
    "size": 1191,
    "path": "../public/_nuxt/7ivQ76Ii.js"
  },
  "/_nuxt/7ivQ76Ii.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"19c-DLGT8x+3PLGZsVwmSCMwWWgDLpk\"",
    "mtime": "2026-10-18T08:18:16.246Z",
    "size": 412,
    "path": "../public/_nuxt/7ivQ76Ii.js.br"
  },
  "/_nuxt/7ivQ76Ii.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"267-CiBb9s2rFDNBPOabGWDc7+vgWSk\"",
    "mtime": "2026-10-18T08:18:16.246Z",
    "size": 615,
    "path": "../public/_nuxt/7ivQ76Ii.js.gz"
  },
  "/_nuxt/7jldwhx8.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"c99-VP5REdrWBOag1g/jYynZARfWso4\"",
    "mtime": "2026-10-18T08:18:16.193Z",
    "size": 3225,
    "path": "../public/_nuxt/7jldwhx8.js"
  },
  "/_nuxt/7jldwhx8.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"51b-pZty4ozJWtUEgD4xELmwRqqLHFM\"",
    "mtime": "2026-10-18T08:18:16.257Z",
    "size": 1307,
    "path": "../public/_nuxt/7jldwhx8.js.br"
  },
  "/_nuxt/7jldwhx8.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5bb-IA3nV6YzYat16pWH8LWW6r7B2kw\"",
    "mtime": "2026-10-18T08:18:16.249Z",
    "size": 1467,
    "path": "../public/_nuxt/7jldwhx8.js.gz"
  },
  "/_nuxt/9bxM2THf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3ac-21Mc37F/UkimCXCXhBKNZJ9wwEo\"",
    "mtime": "2026-10-18T08:18:16.193Z",
    "size": 940,
    "path": "../public/_nuxt/9bxM2THf.js"
  },
  "/_nuxt/9qeHiBCB.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"16fe-vkP3xm0AgUzYv5tk9V7+bX73IQ0\"",
    "mtime": "2026-10-18T08:18:16.193Z",
    "size": 5886,
    "path": "../public/_nuxt/9qeHiBCB.js"
  },
  "/_nuxt/9qeHiBCB.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"7cb-+kNVmp4lJ55EqItGyrNUXAGWqV4\"",
    "mtime": "2026-10-18T08:18:16.257Z",
    "size": 1995,
    "path": "../public/_nuxt/9qeHiBCB.js.br"
  },
  "/_nuxt/9qeHiBCB.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"8d8-hy+MKLAdtkzO9kZLZ5yf2dX6Bqs\"",
    "mtime": "2026-10-18T08:18:16.250Z",
    "size": 2264,
    "path": "../public/_nuxt/9qeHiBCB.js.gz"
  },
  "/_nuxt/AjNiV0xM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"236-wr5mQTFrf7O1YgQ111WwzrrTdlw\"",
    "mtime": "2026-10-18T08:18:16.193Z",
    "size": 566,
    "path": "../public/_nuxt/AjNiV0xM.js"
  },
  "/_nuxt/B1kz6K1Z.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"10ab-N0cHe6fNgeiDrn8RpMYqe4pb0uM\"",
    "mtime": "2026-10-18T08:18:16.193Z",
    "size": 4267,
    "path": "../public/_nuxt/B1kz6K1Z.js"
  },
  "/_nuxt/B1kz6K1Z.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"64d-lCuNMI7qKKFnaQnOyNjBSWzgC+E\"",
    "mtime": "2026-10-18T08:18:16.257Z",
    "size": 1613,
    "path": "../public/_nuxt/B1kz6K1Z.js.br"
  },
  "/_nuxt/B1kz6K1Z.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"715-Xj783CB7jlSI7T3bVyUe2jg+pEk\"",
    "mtime": "2026-10-18T08:18:16.251Z",
    "size": 1813,
    "path": "../public/_nuxt/B1kz6K1Z.js.gz"
  },
  "/_nuxt/B2IKgR8K.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"299-X1NaetU77veBqBpcNa4CaYdCozs\"",
    "mtime": "2026-10-18T08:18:16.193Z",
    "size": 665,
    "path": "../public/_nuxt/B2IKgR8K.js"
  },
  "/_nuxt/B36IP3fL.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1654-OCgCN4Ag/IDMVKLoo16pfEkYHhU\"",
    "mtime": "2026-10-18T08:18:16.194Z",
    "size": 5716,
    "path": "../public/_nuxt/B36IP3fL.js"
  },
  "/_nuxt/B36IP3fL.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"84c-u4n4zq11Kbrl9yA4SerCBtcztWo\"",
    "mtime": "2026-10-18T08:18:16.267Z",
    "size": 2124,
    "path": "../public/_nuxt/B36IP3fL.js.br"
  },
  "/_nuxt/B36IP3fL.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"95c-U2NYrBffpC46jvd9Ens2uWHVs/c\"",
    "mtime": "2026-10-18T08:18:16.257Z",
    "size": 2396,
    "path": "../public/_nuxt/B36IP3fL.js.gz"
  },
  "/_nuxt/B8TsWWrP.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1f06-kVjT3ckKE8qFm7QviFwZkaRPOfI\"",
    "mtime": "2026-10-18T08:18:16.193Z",
    "size": 7942,
    "path": "../public/_nuxt/B8TsWWrP.js"
  },
  "/_nuxt/B8TsWWrP.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"994-XVXZ9R9e/Jk5UJhVOR3fcXHy9QY\"",
    "mtime": "2026-10-18T08:18:16.267Z",
    "size": 2452,
    "path": "../public/_nuxt/B8TsWWrP.js.br"
  },
  "/_nuxt/B8TsWWrP.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"ad0-8eD/J/Owr9ejJHFgMes1XolVfcc\"",
    "mtime": "2026-10-18T08:18:16.257Z",
    "size": 2768,
    "path": "../public/_nuxt/B8TsWWrP.js.gz"
  },
  "/_nuxt/BA0GfcWy.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"24f2-jH6kzaIxWo2o5WLBTmontKQU9so\"",
    "mtime": "2026-10-18T08:18:16.194Z",
    "size": 9458,
    "path": "../public/_nuxt/BA0GfcWy.js"
  },
  "/_nuxt/BA0GfcWy.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"b5e-CrYSTiMhflQNbpRl20sKjWtaejk\"",
    "mtime": "2026-10-18T08:18:16.267Z",
    "size": 2910,
    "path": "../public/_nuxt/BA0GfcWy.js.br"
  },
  "/_nuxt/BA0GfcWy.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"cda-pLp9ASTcOhpqHB8xTIdDsfe/0Gg\"",
    "mtime": "2026-10-18T08:18:16.257Z",
    "size": 3290,
    "path": "../public/_nuxt/BA0GfcWy.js.gz"
  },
  "/_nuxt/BAm9LcIp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"192-lB9jboh66CeY1KagOZDrkQ+ohCs\"",
    "mtime": "2026-10-18T08:18:16.193Z",
    "size": 402,
    "path": "../public/_nuxt/BAm9LcIp.js"
  },
  "/_nuxt/BAz4hE9E.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"44-mgfbOMygqb7RJ6R/hQRaErMa4Jg\"",
    "mtime": "2026-10-18T08:18:16.194Z",
    "size": 68,
    "path": "../public/_nuxt/BAz4hE9E.js"
  },
  "/_nuxt/BB1_4h9i.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"12d6-//hLRI0cszpsvt6H+fgjnV07tqU\"",
    "mtime": "2026-10-18T08:18:16.194Z",
    "size": 4822,
    "path": "../public/_nuxt/BB1_4h9i.js"
  },
  "/_nuxt/BB1_4h9i.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"876-TyGsUyhHCGXHYbtBfXlZbNs3a7k\"",
    "mtime": "2026-10-18T08:18:16.267Z",
    "size": 2166,
    "path": "../public/_nuxt/BB1_4h9i.js.gz"
  },
  "/_nuxt/BBbqg-ps.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1a77-k8HaQ4Ly5pBHw10YU0MRLYJALnQ\"",
    "mtime": "2026-10-18T08:18:16.194Z",
    "size": 6775,
    "path": "../public/_nuxt/BBbqg-ps.js"
  },
  "/_nuxt/BB1_4h9i.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"7a0-dZCD3y+4d5TrXh65mnOORQhUidM\"",
    "mtime": "2026-10-18T08:18:16.267Z",
    "size": 1952,
    "path": "../public/_nuxt/BB1_4h9i.js.br"
  },
  "/_nuxt/BBbqg-ps.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"9c2-eNkMuwnZWMJWgdcL8Xx2wZCw4Tk\"",
    "mtime": "2026-10-18T08:18:16.269Z",
    "size": 2498,
    "path": "../public/_nuxt/BBbqg-ps.js.br"
  },
  "/_nuxt/BBbqg-ps.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"af8-cQvcWzY8d7W9cQdj298tTUXqyck\"",
    "mtime": "2026-10-18T08:18:16.267Z",
    "size": 2808,
    "path": "../public/_nuxt/BBbqg-ps.js.gz"
  },
  "/_nuxt/BE0vrYoP.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2c82-QzbLU7GOIQtwXiiNJ14kylWKjdE\"",
    "mtime": "2026-10-18T08:18:16.194Z",
    "size": 11394,
    "path": "../public/_nuxt/BE0vrYoP.js"
  },
  "/_nuxt/BE0vrYoP.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"dbc-cbkk0XIwFQ9GLMdmePmtI95UyS4\"",
    "mtime": "2026-10-18T08:18:16.278Z",
    "size": 3516,
    "path": "../public/_nuxt/BE0vrYoP.js.br"
  },
  "/_nuxt/BE0vrYoP.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"f64-gz5YxrfHtUw9mELhqZEb8R3bkH8\"",
    "mtime": "2026-10-18T08:18:16.267Z",
    "size": 3940,
    "path": "../public/_nuxt/BE0vrYoP.js.gz"
  },
  "/_nuxt/BEVk08-9.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"e7a-t01vrRdG6cyzZC1wpLS8nbp0PNk\"",
    "mtime": "2026-10-18T08:18:16.194Z",
    "size": 3706,
    "path": "../public/_nuxt/BEVk08-9.js"
  },
  "/_nuxt/BEVk08-9.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5ed-NmuW3+D0eeVJQb0d2cwT/VRXmVY\"",
    "mtime": "2026-10-18T08:18:16.272Z",
    "size": 1517,
    "path": "../public/_nuxt/BEVk08-9.js.br"
  },
  "/_nuxt/BEVk08-9.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"6a2-NtL4MAxWXjAlg+v/P/d4TCr92bs\"",
    "mtime": "2026-10-18T08:18:16.267Z",
    "size": 1698,
    "path": "../public/_nuxt/BEVk08-9.js.gz"
  },
  "/_nuxt/BFftKN3_.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"44ca-qArQqiM/AUCoQ9lAcNJ9a37mkJ0\"",
    "mtime": "2026-10-18T08:18:16.194Z",
    "size": 17610,
    "path": "../public/_nuxt/BFftKN3_.js"
  },
  "/_nuxt/BFftKN3_.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"db3-lw4MIZvWrtPxSLaQOuXJCxrR0yQ\"",
    "mtime": "2026-10-18T08:18:16.292Z",
    "size": 3507,
    "path": "../public/_nuxt/BFftKN3_.js.br"
  },
  "/_nuxt/BFftKN3_.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"101f-X72kJu1x2Gz9ZfSElMW+jrjgp9c\"",
    "mtime": "2026-10-18T08:18:16.272Z",
    "size": 4127,
    "path": "../public/_nuxt/BFftKN3_.js.gz"
  },
  "/_nuxt/BGFlb3To.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"cfa-56+dx4vpB7j+e/5Kd02t4Qazmx8\"",
    "mtime": "2026-10-18T08:18:16.194Z",
    "size": 3322,
    "path": "../public/_nuxt/BGFlb3To.js"
  },
  "/_nuxt/BGFlb3To.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"51c-kfyBblf/s5MnUKMMdPMCcayKPoY\"",
    "mtime": "2026-10-18T08:18:16.272Z",
    "size": 1308,
    "path": "../public/_nuxt/BGFlb3To.js.br"
  },
  "/_nuxt/BGFlb3To.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5d1-zGYWzvKZkhM370FjyUnmW/gZmxI\"",
    "mtime": "2026-10-18T08:18:16.272Z",
    "size": 1489,
    "path": "../public/_nuxt/BGFlb3To.js.gz"
  },
  "/_nuxt/BGR1f1mC.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"779-0e22nlVsIUEosCQwRYkLWFhyTSM\"",
    "mtime": "2026-10-18T08:18:16.195Z",
    "size": 1913,
    "path": "../public/_nuxt/BGR1f1mC.js"
  },
  "/_nuxt/BGR1f1mC.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"362-swbZnnn81GQo8yqW7sTnzmX9vLU\"",
    "mtime": "2026-10-18T08:18:16.277Z",
    "size": 866,
    "path": "../public/_nuxt/BGR1f1mC.js.br"
  },
  "/_nuxt/BGR1f1mC.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3fb-v3Lm25r6PS+xbuGzUVNDXaVCzdo\"",
    "mtime": "2026-10-18T08:18:16.272Z",
    "size": 1019,
    "path": "../public/_nuxt/BGR1f1mC.js.gz"
  },
  "/_nuxt/BIVduEmk.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"5c1-RpUknxCnGb1wY7z8ZPBRkVAln+s\"",
    "mtime": "2026-10-18T08:18:16.195Z",
    "size": 1473,
    "path": "../public/_nuxt/BIVduEmk.js"
  },
  "/_nuxt/BIVduEmk.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2e4-KVYPyJLj0dxM0sOk3DoNnR7b760\"",
    "mtime": "2026-10-18T08:18:16.278Z",
    "size": 740,
    "path": "../public/_nuxt/BIVduEmk.js.br"
  },
  "/_nuxt/BMvo01Yr.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"49d-FfIi1r9hGbSKFMG9ObD2WsXUqyE\"",
    "mtime": "2026-10-18T08:18:16.194Z",
    "size": 1181,
    "path": "../public/_nuxt/BMvo01Yr.js"
  },
  "/_nuxt/BMvo01Yr.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"204-SIfT6bt7rUiqJQ1XHWJqeMqZTT0\"",
    "mtime": "2026-10-18T08:18:16.281Z",
    "size": 516,
    "path": "../public/_nuxt/BMvo01Yr.js.br"
  },
  "/_nuxt/BIVduEmk.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"348-kp+gisDi4dx7X9ig/xevL7wfe78\"",
    "mtime": "2026-10-18T08:18:16.277Z",
    "size": 840,
    "path": "../public/_nuxt/BIVduEmk.js.gz"
  },
  "/_nuxt/BOrhmFeI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ce-1ud0KFHvK2xDQHRm5wG/2yxlXuA\"",
    "mtime": "2026-10-18T08:18:16.194Z",
    "size": 462,
    "path": "../public/_nuxt/BOrhmFeI.js"
  },
  "/_nuxt/BMvo01Yr.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"24e-BeGOUqAf3+Aa0W12g5TCae7HaM4\"",
    "mtime": "2026-10-18T08:18:16.277Z",
    "size": 590,
    "path": "../public/_nuxt/BMvo01Yr.js.gz"
  },
  "/_nuxt/BR1XC4Sy.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"13da-8c8m2yejJQIb4wWqkEJWnrIa32g\"",
    "mtime": "2026-10-18T08:18:16.195Z",
    "size": 5082,
    "path": "../public/_nuxt/BR1XC4Sy.js"
  },
  "/_nuxt/BR1XC4Sy.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"7a7-ALLbVTGfZqiZjXOfimL3gp+X1Qw\"",
    "mtime": "2026-10-18T08:18:16.292Z",
    "size": 1959,
    "path": "../public/_nuxt/BR1XC4Sy.js.br"
  },
  "/_nuxt/BR1XC4Sy.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"895-iYksr+6UmwbWX2pQXDJH2gYcBzA\"",
    "mtime": "2026-10-18T08:18:16.278Z",
    "size": 2197,
    "path": "../public/_nuxt/BR1XC4Sy.js.gz"
  },
  "/_nuxt/BUTQPEdg.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"6a9-3xkFncct0EWIH6MO8WhvppSoYKY\"",
    "mtime": "2026-10-18T08:18:16.195Z",
    "size": 1705,
    "path": "../public/_nuxt/BUTQPEdg.js"
  },
  "/_nuxt/BUTQPEdg.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"309-nfwhWcqVv+7zDq1+soyyQgtiQDQ\"",
    "mtime": "2026-10-18T08:18:16.281Z",
    "size": 777,
    "path": "../public/_nuxt/BUTQPEdg.js.br"
  },
  "/_nuxt/BUTQPEdg.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"372-8+/+51oZsCaP15v2LQAIwmZQIMk\"",
    "mtime": "2026-10-18T08:18:16.281Z",
    "size": 882,
    "path": "../public/_nuxt/BUTQPEdg.js.gz"
  },
  "/_nuxt/BYHgbEdt.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"a83-2KM45yfTsDVJVzy44nRqlnRkYMs\"",
    "mtime": "2026-10-18T08:18:16.195Z",
    "size": 2691,
    "path": "../public/_nuxt/BYHgbEdt.js"
  },
  "/_nuxt/BYHgbEdt.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3bb-FcSzpqw7kU9MDAVASrX0XYVGWeI\"",
    "mtime": "2026-10-18T08:18:16.283Z",
    "size": 955,
    "path": "../public/_nuxt/BYHgbEdt.js.br"
  },
  "/_nuxt/BYHgbEdt.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"45e-nk22xaGOUyBx4WV8is7tQed2W+Q\"",
    "mtime": "2026-10-18T08:18:16.281Z",
    "size": 1118,
    "path": "../public/_nuxt/BYHgbEdt.js.gz"
  },
  "/_nuxt/BZ5k90NU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14d-fBYPduUjgqIG53LOa91A0jdWBwo\"",
    "mtime": "2026-10-18T08:18:16.195Z",
    "size": 333,
    "path": "../public/_nuxt/BZ5k90NU.js"
  },
  "/_nuxt/BZGd5cRH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"db-h0OG8WdTFTOgI4Ldm9kJdDeKbNo\"",
    "mtime": "2026-10-18T08:18:16.195Z",
    "size": 219,
    "path": "../public/_nuxt/BZGd5cRH.js"
  },
  "/_nuxt/B_WI2Vnv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"121-2AvGmqKjLUD6sEd4X4m6y4W6VOM\"",
    "mtime": "2026-10-18T08:18:16.195Z",
    "size": 289,
    "path": "../public/_nuxt/B_WI2Vnv.js"
  },
  "/_nuxt/B_trXEPW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a7-aFRRplkV1bVfa6ijJOriDSDGMGI\"",
    "mtime": "2026-10-18T08:18:16.195Z",
    "size": 423,
    "path": "../public/_nuxt/B_trXEPW.js"
  },
  "/_nuxt/BakueR6p.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"22e-9yVoEgLVxX4veQGw18EoZqNcNTo\"",
    "mtime": "2026-10-18T08:18:16.196Z",
    "size": 558,
    "path": "../public/_nuxt/BakueR6p.js"
  },
  "/_nuxt/BaLQIikX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"171-aa0f32++FOCaA1yz0wi7RYy6iI8\"",
    "mtime": "2026-10-18T08:18:16.196Z",
    "size": 369,
    "path": "../public/_nuxt/BaLQIikX.js"
  },
  "/_nuxt/Bc-epMHt.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"521-CeRbPYFl1htaEw3WTQXVqPkhRmQ\"",
    "mtime": "2026-10-18T08:18:16.196Z",
    "size": 1313,
    "path": "../public/_nuxt/Bc-epMHt.js"
  },
  "/_nuxt/Bc-epMHt.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"23c-X1q9oJrePtfQjfrCMC8d+35OPTg\"",
    "mtime": "2026-10-18T08:18:16.292Z",
    "size": 572,
    "path": "../public/_nuxt/Bc-epMHt.js.br"
  },
  "/_nuxt/Bc-epMHt.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"298-PEx+S9JXb9LYuKbo+r72aSQHJDw\"",
    "mtime": "2026-10-18T08:18:16.283Z",
    "size": 664,
    "path": "../public/_nuxt/Bc-epMHt.js.gz"
  },
  "/_nuxt/BczkZF6e.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"103-8lIlIVeUNFo1t8Ii1zTt1izo7t0\"",
    "mtime": "2026-10-18T08:18:16.196Z",
    "size": 259,
    "path": "../public/_nuxt/BczkZF6e.js"
  },
  "/_nuxt/BdaqtTam.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"395-BitI295KPk6QX9aF13YT78Vmd0M\"",
    "mtime": "2026-10-18T08:18:16.196Z",
    "size": 917,
    "path": "../public/_nuxt/BdaqtTam.js"
  },
  "/_nuxt/BdgP8VdK.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"44e-dvvvHxPHb5nrDiEqQsXyMko5edE\"",
    "mtime": "2026-10-18T08:18:16.196Z",
    "size": 1102,
    "path": "../public/_nuxt/BdgP8VdK.js"
  },
  "/_nuxt/BdgP8VdK.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"214-t5B9bi95zpIQnbQnxbgProKoLPM\"",
    "mtime": "2026-10-18T08:18:16.292Z",
    "size": 532,
    "path": "../public/_nuxt/BdgP8VdK.js.br"
  },
  "/_nuxt/BdgP8VdK.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"261-p2fqn8+vBKSIDlr4tEWkv1TKnbQ\"",
    "mtime": "2026-10-18T08:18:16.292Z",
    "size": 609,
    "path": "../public/_nuxt/BdgP8VdK.js.gz"
  },
  "/_nuxt/BeHa7CGY.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1905-tC/UpR4JZ+9I5dqjFQ5xC8W2xo0\"",
    "mtime": "2026-10-18T08:18:16.196Z",
    "size": 6405,
    "path": "../public/_nuxt/BeHa7CGY.js"
  },
  "/_nuxt/BeHa7CGY.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"84d-QsnpVaOsKWtd1iDTKqquVAxaMfo\"",
    "mtime": "2026-10-18T08:18:16.293Z",
    "size": 2125,
    "path": "../public/_nuxt/BeHa7CGY.js.br"
  },
  "/_nuxt/BeHa7CGY.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"95d-rtSM0ZoZIAVcqCpIEoXNXvAJILw\"",
    "mtime": "2026-10-18T08:18:16.292Z",
    "size": 2397,
    "path": "../public/_nuxt/BeHa7CGY.js.gz"
  },
  "/_nuxt/BeTYVdZ9.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"cdb-G8s4T4ahHtc0y+P4lpneH+KeicM\"",
    "mtime": "2026-10-18T08:18:16.302Z",
    "size": 3291,
    "path": "../public/_nuxt/BeTYVdZ9.js.br"
  },
  "/_nuxt/BgUeAoYv.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"cee-0XVBZQbJhsY0ZcfPC/uH2ynDIGw\"",
    "mtime": "2026-10-18T08:18:16.196Z",
    "size": 3310,
    "path": "../public/_nuxt/BgUeAoYv.js"
  },
  "/_nuxt/BeTYVdZ9.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"e87-XdDzKuKlSOE/Fb+eOV3abpMpvBs\"",
    "mtime": "2026-10-18T08:18:16.292Z",
    "size": 3719,
    "path": "../public/_nuxt/BeTYVdZ9.js.gz"
  },
  "/_nuxt/BeTYVdZ9.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"25a4-kIwlfuprDxLDaDgwXxDmTtKwmIw\"",
    "mtime": "2026-10-18T08:18:16.196Z",
    "size": 9636,
    "path": "../public/_nuxt/BeTYVdZ9.js"
  },
  "/_nuxt/Bg_C-HVR.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"4b0-Ne0laORordfKgFV0zx9rl/8i5NA\"",
    "mtime": "2026-10-18T08:18:16.196Z",
    "size": 1200,
    "path": "../public/_nuxt/Bg_C-HVR.js"
  },
  "/_nuxt/BgUeAoYv.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"621-41IZ4PRE4hW3kbp1/Jv9nIu6eXA\"",
    "mtime": "2026-10-18T08:18:16.292Z",
    "size": 1569,
    "path": "../public/_nuxt/BgUeAoYv.js.gz"
  },
  "/_nuxt/Bg_C-HVR.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"230-7PFzRD811HqSqQVdk3OsDcu+JZg\"",
    "mtime": "2026-10-18T08:18:16.301Z",
    "size": 560,
    "path": "../public/_nuxt/Bg_C-HVR.js.br"
  },
  "/_nuxt/BhzXxI5p.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"169-MTUdCE7W7QDeBN5YfzlERtBPipc\"",
    "mtime": "2026-10-18T08:18:16.197Z",
    "size": 361,
    "path": "../public/_nuxt/BhzXxI5p.js"
  },
  "/_nuxt/Bg_C-HVR.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"266-31IhBobIkSlSdDW8p1llgKtkpcw\"",
    "mtime": "2026-10-18T08:18:16.293Z",
    "size": 614,
    "path": "../public/_nuxt/Bg_C-HVR.js.gz"
  },
  "/_nuxt/BiRYfN5n.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"18aa-lnoLk9/cu56orx7d4nLgRSPROHs\"",
    "mtime": "2026-10-18T08:18:16.196Z",
    "size": 6314,
    "path": "../public/_nuxt/BiRYfN5n.js"
  },
  "/_nuxt/BgUeAoYv.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"576-vWvkoGszxh8HoOeOt5/iXjLbsrU\"",
    "mtime": "2026-10-18T08:18:16.293Z",
    "size": 1398,
    "path": "../public/_nuxt/BgUeAoYv.js.br"
  },
  "/_nuxt/BiRYfN5n.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a4b-nVgMe+EAWe74BYlHPza8J7+rk6E\"",
    "mtime": "2026-10-18T08:18:16.296Z",
    "size": 2635,
    "path": "../public/_nuxt/BiRYfN5n.js.gz"
  },
  "/_nuxt/BiRYfN5n.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"956-BMJxBwIL+2PMewRMFNB1M2QudZA\"",
    "mtime": "2026-10-18T08:18:16.306Z",
    "size": 2390,
    "path": "../public/_nuxt/BiRYfN5n.js.br"
  },
  "/_nuxt/Bn1r5vUh.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"327-KVPAun0I7QFJ9033SwWawYnElLE\"",
    "mtime": "2026-10-18T08:18:16.302Z",
    "size": 807,
    "path": "../public/_nuxt/Bn1r5vUh.js.br"
  },
  "/_nuxt/Bn1r5vUh.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"973-jjMdcTjz/zADKVwxO5Izako8G38\"",
    "mtime": "2026-10-18T08:18:16.197Z",
    "size": 2419,
    "path": "../public/_nuxt/Bn1r5vUh.js"
  },
  "/_nuxt/Bn1r5vUh.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3d1-YsFcPY/qMfBm/KMsQnAfLtNH8/I\"",
    "mtime": "2026-10-18T08:18:16.300Z",
    "size": 977,
    "path": "../public/_nuxt/Bn1r5vUh.js.gz"
  },
  "/_nuxt/Bn_mV5cH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"169-l2Vye0Qn3tANUAb0aQ/jT8iNuX4\"",
    "mtime": "2026-10-18T08:18:16.197Z",
    "size": 361,
    "path": "../public/_nuxt/Bn_mV5cH.js"
  },
  "/_nuxt/BoEK_Hy_.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1b56-Ef/gqwIo2jR+Dfq0hjL/0q7jZow\"",
    "mtime": "2026-10-18T08:18:16.197Z",
    "size": 6998,
    "path": "../public/_nuxt/BoEK_Hy_.js"
  },
  "/_nuxt/BoEK_Hy_.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"a07-qXHNpc7qgrFX+8h4Xra0Tf7f67g\"",
    "mtime": "2026-10-18T08:18:16.306Z",
    "size": 2567,
    "path": "../public/_nuxt/BoEK_Hy_.js.br"
  },
  "/_nuxt/BoEK_Hy_.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"b54-rcW69M1PZ8ZRxzXx3kND0gma6Dk\"",
    "mtime": "2026-10-18T08:18:16.302Z",
    "size": 2900,
    "path": "../public/_nuxt/BoEK_Hy_.js.gz"
  },
  "/_nuxt/BoqU0z90.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3d2-cOLG0ztBFlUaRN2Ph9MNVepBEOs\"",
    "mtime": "2026-10-18T08:18:16.197Z",
    "size": 978,
    "path": "../public/_nuxt/BoqU0z90.js"
  },
  "/_nuxt/BsISEAm9.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"13c0-9i65vZllxp8I/CtHJUl1kmVdv7I\"",
    "mtime": "2026-10-18T08:18:16.197Z",
    "size": 5056,
    "path": "../public/_nuxt/BsISEAm9.js"
  },
  "/_nuxt/BsISEAm9.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"6bf-XJ1zrnDOmyoZzq51fMxVf7qj53c\"",
    "mtime": "2026-10-18T08:18:16.306Z",
    "size": 1727,
    "path": "../public/_nuxt/BsISEAm9.js.br"
  },
  "/_nuxt/BsISEAm9.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"7ba-GxGxwHKM0exzWCvFMGqnVt/LjGI\"",
    "mtime": "2026-10-18T08:18:16.302Z",
    "size": 1978,
    "path": "../public/_nuxt/BsISEAm9.js.gz"
  },
  "/_nuxt/BulKijRm.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"cb9-apWq3dDLiB8FFPA0ofTAlp1wMuM\"",
    "mtime": "2026-10-18T08:18:16.197Z",
    "size": 3257,
    "path": "../public/_nuxt/BulKijRm.js"
  },
  "/_nuxt/BulKijRm.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"51e-aVW/X3HaI9APs795JF3typiRmKg\"",
    "mtime": "2026-10-18T08:18:16.309Z",
    "size": 1310,
    "path": "../public/_nuxt/BulKijRm.js.br"
  },
  "/_nuxt/BulKijRm.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5c9-XAjH6BzzWBGnqRa8K395rfSuXgk\"",
    "mtime": "2026-10-18T08:18:16.306Z",
    "size": 1481,
    "path": "../public/_nuxt/BulKijRm.js.gz"
  },
  "/_nuxt/Bv4Qhl-Z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"233-4cJ0enS8DIAxerLbY/3RRYAmRSk\"",
    "mtime": "2026-10-18T08:18:16.198Z",
    "size": 563,
    "path": "../public/_nuxt/Bv4Qhl-Z.js"
  },
  "/_nuxt/BxSntCM7.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2041-0mDfdxKFuG0WDSpl17YtRmS0DD8\"",
    "mtime": "2026-10-18T08:18:16.198Z",
    "size": 8257,
    "path": "../public/_nuxt/BxSntCM7.js"
  },
  "/_nuxt/BxSntCM7.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"d13-zv+OBjryrIrQ0XguedixwQ/vlrQ\"",
    "mtime": "2026-10-18T08:18:16.306Z",
    "size": 3347,
    "path": "../public/_nuxt/BxSntCM7.js.gz"
  },
  "/_nuxt/BxSntCM7.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"bbb-xRrJaIqH7rrfyRDg/gKUUlV07pI\"",
    "mtime": "2026-10-18T08:18:16.316Z",
    "size": 3003,
    "path": "../public/_nuxt/BxSntCM7.js.br"
  },
  "/_nuxt/Bz975va_.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"680-bFJ+sysZWMQZK+jucigmxEvCiuM\"",
    "mtime": "2026-10-18T08:18:16.310Z",
    "size": 1664,
    "path": "../public/_nuxt/Bz975va_.js.br"
  },
  "/_nuxt/Bz975va_.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1041-Dq1SQCJeT4vMAm/T7Z7eAreNMJE\"",
    "mtime": "2026-10-18T08:18:16.199Z",
    "size": 4161,
    "path": "../public/_nuxt/Bz975va_.js"
  },
  "/_nuxt/Bz975va_.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"73f-3ga3HQPc3T4ZtsfU62S7eoWa9dc\"",
    "mtime": "2026-10-18T08:18:16.306Z",
    "size": 1855,
    "path": "../public/_nuxt/Bz975va_.js.gz"
  },
  "/_nuxt/C-Jk0-7t.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"839-kkR6BTGPeWUp04zqORnDlXrCBDQ\"",
    "mtime": "2026-10-18T08:18:16.316Z",
    "size": 2105,
    "path": "../public/_nuxt/C-Jk0-7t.js.br"
  },
  "/_nuxt/C-Jk0-7t.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"922-pa5NCeyiFNJV1unQzcmTPH8Xm2E\"",
    "mtime": "2026-10-18T08:18:16.309Z",
    "size": 2338,
    "path": "../public/_nuxt/C-Jk0-7t.js.gz"
  },
  "/_nuxt/C-Jk0-7t.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"13cd-JFEq1OrkWeEgZobK+y03StY79vE\"",
    "mtime": "2026-10-18T08:18:16.198Z",
    "size": 5069,
    "path": "../public/_nuxt/C-Jk0-7t.js"
  },
  "/_nuxt/C-lz6RjD.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"5b7-kTmkS0AvKrkMdn78TJTJmX63nS0\"",
    "mtime": "2026-10-18T08:18:16.198Z",
    "size": 1463,
    "path": "../public/_nuxt/C-lz6RjD.js"
  },
  "/_nuxt/C-lz6RjD.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2b9-zlIz0hBmACdBesg3IOqJcwvIKVc\"",
    "mtime": "2026-10-18T08:18:16.310Z",
    "size": 697,
    "path": "../public/_nuxt/C-lz6RjD.js.br"
  },
  "/_nuxt/C-lz6RjD.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"304-Bcni3s1vIyfV6Ixr467T/3SOctI\"",
    "mtime": "2026-10-18T08:18:16.310Z",
    "size": 772,
    "path": "../public/_nuxt/C-lz6RjD.js.gz"
  },
  "/_nuxt/C023fC2O.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1855-5pzFfztlWOuYRqf3JFmxx31kuDM\"",
    "mtime": "2026-10-18T08:18:16.198Z",
    "size": 6229,
    "path": "../public/_nuxt/C023fC2O.js"
  },
  "/_nuxt/C023fC2O.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"949-GHLjYW/QgkefzlkSFi9/9TuWF4U\"",
    "mtime": "2026-10-18T08:18:16.318Z",
    "size": 2377,
    "path": "../public/_nuxt/C023fC2O.js.br"
  },
  "/_nuxt/C023fC2O.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a6e-zXLamaTY9MDcdvmt51fiuy3ChTo\"",
    "mtime": "2026-10-18T08:18:16.310Z",
    "size": 2670,
    "path": "../public/_nuxt/C023fC2O.js.gz"
  },
  "/_nuxt/C0viB9yF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"121-M2SeWJPC8W6Jl39Z6pQyFybX/Xo\"",
    "mtime": "2026-10-18T08:18:16.198Z",
    "size": 289,
    "path": "../public/_nuxt/C0viB9yF.js"
  },
  "/_nuxt/C353yrJd.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"602-KWXxsoDLhkXjvT8Ba3h1zAtQEP8\"",
    "mtime": "2026-10-18T08:18:16.198Z",
    "size": 1538,
    "path": "../public/_nuxt/C353yrJd.js"
  },
  "/_nuxt/C353yrJd.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"30b-qgCYmAx2wvTYdNZSNhM9d9DA8bI\"",
    "mtime": "2026-10-18T08:18:16.318Z",
    "size": 779,
    "path": "../public/_nuxt/C353yrJd.js.br"
  },
  "/_nuxt/C353yrJd.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"35e-+Zc/HirMVpOhUGTSPZ8wLCeQQ4I\"",
    "mtime": "2026-10-18T08:18:16.316Z",
    "size": 862,
    "path": "../public/_nuxt/C353yrJd.js.gz"
  },
  "/_nuxt/C4KDyS6y.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3de-7NXgpagM/dnUO/1yP7glA6F6Oic\"",
    "mtime": "2026-10-18T08:18:16.318Z",
    "size": 990,
    "path": "../public/_nuxt/C4KDyS6y.js.br"
  },
  "/_nuxt/C4KDyS6y.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"829-rlESaSvOjcspZGjs9V292RwkWuw\"",
    "mtime": "2026-10-18T08:18:16.198Z",
    "size": 2089,
    "path": "../public/_nuxt/C4KDyS6y.js"
  },
  "/_nuxt/C4KDyS6y.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"45e-dlkUPyak9BYdVwonoHP1wALb3sg\"",
    "mtime": "2026-10-18T08:18:16.317Z",
    "size": 1118,
    "path": "../public/_nuxt/C4KDyS6y.js.gz"
  },
  "/_nuxt/C5m7fYKW.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"857-J9ejtHxTpeotnG83lcsEM9e3Dd0\"",
    "mtime": "2026-10-18T08:18:16.318Z",
    "size": 2135,
    "path": "../public/_nuxt/C5m7fYKW.js.gz"
  },
  "/_nuxt/C6Okmfw8.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1243-IJSROs4WRGD2jyWXdtHqGVZVqII\"",
    "mtime": "2026-10-18T08:18:16.199Z",
    "size": 4675,
    "path": "../public/_nuxt/C6Okmfw8.js"
  },
  "/_nuxt/C5m7fYKW.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"760-jyLwBaUN2o+a1hiFHp1Vx/s2kA8\"",
    "mtime": "2026-10-18T08:18:16.320Z",
    "size": 1888,
    "path": "../public/_nuxt/C5m7fYKW.js.br"
  },
  "/_nuxt/C5m7fYKW.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1405-Bo87mbSCP6tnnKqbMhQtV095rb8\"",
    "mtime": "2026-10-18T08:18:16.198Z",
    "size": 5125,
    "path": "../public/_nuxt/C5m7fYKW.js"
  },
  "/_nuxt/C6Okmfw8.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"7a9-L4eWu5UbSv4ZQUsaAENnAB/bDy4\"",
    "mtime": "2026-10-18T08:18:16.320Z",
    "size": 1961,
    "path": "../public/_nuxt/C6Okmfw8.js.br"
  },
  "/_nuxt/C71G4DLU.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"54f-WxB7voSdDXiMFHlu00OfgEATzUE\"",
    "mtime": "2026-10-18T08:18:16.199Z",
    "size": 1359,
    "path": "../public/_nuxt/C71G4DLU.js"
  },
  "/_nuxt/C6Okmfw8.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"881-jsQr+gKyBQogZMjFzv3XGK01h0A\"",
    "mtime": "2026-10-18T08:18:16.318Z",
    "size": 2177,
    "path": "../public/_nuxt/C6Okmfw8.js.gz"
  },
  "/_nuxt/C71G4DLU.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"273-OOKcTt+8FElBM8XiIqDgCr3PUnI\"",
    "mtime": "2026-10-18T08:18:16.321Z",
    "size": 627,
    "path": "../public/_nuxt/C71G4DLU.js.br"
  },
  "/_nuxt/C8cTQkXv.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"435-jNA8tMz5wK+Qis6qZpmFBIZiKjg\"",
    "mtime": "2026-10-18T08:18:16.199Z",
    "size": 1077,
    "path": "../public/_nuxt/C8cTQkXv.js"
  },
  "/_nuxt/C71G4DLU.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2b5-63clCIqyeiwPze+emXwubxtFscA\"",
    "mtime": "2026-10-18T08:18:16.320Z",
    "size": 693,
    "path": "../public/_nuxt/C71G4DLU.js.gz"
  },
  "/_nuxt/C8cTQkXv.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"246-Wi80AGbL67ClYJomb69SLSGO7Q4\"",
    "mtime": "2026-10-18T08:18:16.321Z",
    "size": 582,
    "path": "../public/_nuxt/C8cTQkXv.js.br"
  },
  "/_nuxt/C8cTQkXv.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"26a-gZH+0Hp/QgGcyhjRtNinvuc9OSs\"",
    "mtime": "2026-10-18T08:18:16.320Z",
    "size": 618,
    "path": "../public/_nuxt/C8cTQkXv.js.gz"
  },
  "/_nuxt/C91OTWI8.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1657-NlW+9vk2w7Uv2jB37anPtewR+6k\"",
    "mtime": "2026-10-18T08:18:16.199Z",
    "size": 5719,
    "path": "../public/_nuxt/C91OTWI8.js"
  },
  "/_nuxt/C91OTWI8.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"818-akNNI5nKFOUoBzuQY4NJArno9tQ\"",
    "mtime": "2026-10-18T08:18:16.332Z",
    "size": 2072,
    "path": "../public/_nuxt/C91OTWI8.js.br"
  },
  "/_nuxt/C91OTWI8.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"91a-RxmW3a2sIpWzQ8ZheuLCw/a9R5Q\"",
    "mtime": "2026-10-18T08:18:16.320Z",
    "size": 2330,
    "path": "../public/_nuxt/C91OTWI8.js.gz"
  },
  "/_nuxt/CA4zea-l.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"a854-/6mmG54Fe7YWrCvb8QAC4TnN/ts\"",
    "mtime": "2026-10-18T08:18:16.199Z",
    "size": 43092,
    "path": "../public/_nuxt/CA4zea-l.js"
  },
  "/_nuxt/CA4zea-l.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"29ff-OSOGa/kRb76kCWAcL9UtlER20ZI\"",
    "mtime": "2026-10-18T08:18:16.366Z",
    "size": 10751,
    "path": "../public/_nuxt/CA4zea-l.js.br"
  },
  "/_nuxt/CA4zea-l.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2ea6-UBHJlvsRNlgLFuTu7KqVO2r49FM\"",
    "mtime": "2026-10-18T08:18:16.332Z",
    "size": 11942,
    "path": "../public/_nuxt/CA4zea-l.js.gz"
  },
  "/_nuxt/CC1OhtdO.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1188-es3RYirKb544tUgCaTJWGS9uyIg\"",
    "mtime": "2026-10-18T08:18:16.199Z",
    "size": 4488,
    "path": "../public/_nuxt/CC1OhtdO.js"
  },
  "/_nuxt/CC1OhtdO.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4b8-oNwnclimvwGKZzlW4FGZqc29Wm4\"",
    "mtime": "2026-10-18T08:18:16.332Z",
    "size": 1208,
    "path": "../public/_nuxt/CC1OhtdO.js.br"
  },
  "/_nuxt/CC1OhtdO.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"559-LnrVUNKGx7/A5BREnpKh5qqquKA\"",
    "mtime": "2026-10-18T08:18:16.332Z",
    "size": 1369,
    "path": "../public/_nuxt/CC1OhtdO.js.gz"
  },
  "/_nuxt/CFILFORh.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2658-3E/4gGKscDtRz4OWtwvluTF6xy8\"",
    "mtime": "2026-10-18T08:18:16.199Z",
    "size": 9816,
    "path": "../public/_nuxt/CFILFORh.js"
  },
  "/_nuxt/CFILFORh.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"c53-WoImUFzLQQAsjFJ4qHpoaDh10Nw\"",
    "mtime": "2026-10-18T08:18:16.332Z",
    "size": 3155,
    "path": "../public/_nuxt/CFILFORh.js.br"
  },
  "/_nuxt/CFILFORh.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"dd7-ihGfDDGMR1u96f+oLywjvWEDrvg\"",
    "mtime": "2026-10-18T08:18:16.332Z",
    "size": 3543,
    "path": "../public/_nuxt/CFILFORh.js.gz"
  },
  "/_nuxt/CFsHd0ru.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1617-3B3LVd/LPDdUS+ODnshEFJUzy2w\"",
    "mtime": "2026-10-18T08:18:16.199Z",
    "size": 5655,
    "path": "../public/_nuxt/CFsHd0ru.js"
  },
  "/_nuxt/CFsHd0ru.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"82e-HxPTK/jNMk4nS+3R1kC6FuZJXK8\"",
    "mtime": "2026-10-18T08:18:16.333Z",
    "size": 2094,
    "path": "../public/_nuxt/CFsHd0ru.js.br"
  },
  "/_nuxt/CFsHd0ru.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"90a-pyKT6rqvR+JNUj9pbIQAVJN+JeY\"",
    "mtime": "2026-10-18T08:18:16.332Z",
    "size": 2314,
    "path": "../public/_nuxt/CFsHd0ru.js.gz"
  },
  "/_nuxt/CGCBo0BP.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"32a2-GCypRkyJXY9APynCqZ7paekwytc\"",
    "mtime": "2026-10-18T08:18:16.199Z",
    "size": 12962,
    "path": "../public/_nuxt/CGCBo0BP.js"
  },
  "/_nuxt/CGCBo0BP.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"fdd-/mtCkz7ZkBH9BEKGJ6PGm4+C7Os\"",
    "mtime": "2026-10-18T08:18:16.332Z",
    "size": 4061,
    "path": "../public/_nuxt/CGCBo0BP.js.gz"
  },
  "/_nuxt/CGCBo0BP.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"e2e-PlT19W4rfB2iDfCRETJY66KNfAs\"",
    "mtime": "2026-10-18T08:18:16.339Z",
    "size": 3630,
    "path": "../public/_nuxt/CGCBo0BP.js.br"
  },
  "/_nuxt/CJ46B4Xw.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4cc-c0WtECZu7K3ULksvAsVk5Iq24wk\"",
    "mtime": "2026-10-18T08:18:16.336Z",
    "size": 1228,
    "path": "../public/_nuxt/CJ46B4Xw.js.gz"
  },
  "/_nuxt/CJXOiOZ7.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"cfb-rJtyR+cy1i4j4qOaaEfTAsMwhGc\"",
    "mtime": "2026-10-18T08:18:16.200Z",
    "size": 3323,
    "path": "../public/_nuxt/CJXOiOZ7.js"
  },
  "/_nuxt/CJXOiOZ7.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"591-GWY70FAHEIStnotyVGDZoX8nopc\"",
    "mtime": "2026-10-18T08:18:16.339Z",
    "size": 1425,
    "path": "../public/_nuxt/CJXOiOZ7.js.br"
  },
  "/_nuxt/CJXOiOZ7.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"628-rnomLnUqdyiO2BC0uql1DuXnBgk\"",
    "mtime": "2026-10-18T08:18:16.337Z",
    "size": 1576,
    "path": "../public/_nuxt/CJXOiOZ7.js.gz"
  },
  "/_nuxt/CJ46B4Xw.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"b60-V8D72HezmWQTl8WrUO/Um4O6I8k\"",
    "mtime": "2026-10-18T08:18:16.199Z",
    "size": 2912,
    "path": "../public/_nuxt/CJ46B4Xw.js"
  },
  "/_nuxt/CK8xxGdi.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"a7f-T/GKgVgvdU+TmjnKmIZbMRpO9OQ\"",
    "mtime": "2026-10-18T08:18:16.350Z",
    "size": 2687,
    "path": "../public/_nuxt/CK8xxGdi.js.br"
  },
  "/_nuxt/CK8xxGdi.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1db2-e33dHVOiw1s8HrKzuOIDr1TlbTc\"",
    "mtime": "2026-10-18T08:18:16.200Z",
    "size": 7602,
    "path": "../public/_nuxt/CK8xxGdi.js"
  },
  "/_nuxt/CK8xxGdi.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"bbb-LTprL/ff0FEW2JptMcj+SZ3/qBI\"",
    "mtime": "2026-10-18T08:18:16.339Z",
    "size": 3003,
    "path": "../public/_nuxt/CK8xxGdi.js.gz"
  },
  "/_nuxt/CKOMBMAx.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"11bb-QNSvl5uNRSOadfPLULPQDhFJi1Q\"",
    "mtime": "2026-10-18T08:18:16.200Z",
    "size": 4539,
    "path": "../public/_nuxt/CKOMBMAx.js"
  },
  "/_nuxt/CJ46B4Xw.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"448-LBFOGYd+F/0kQG+NA9aHP4EGirs\"",
    "mtime": "2026-10-18T08:18:16.336Z",
    "size": 1096,
    "path": "../public/_nuxt/CJ46B4Xw.js.br"
  },
  "/_nuxt/CKOMBMAx.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"67f-aC7VoeN6fuBchnkuHHnL+edt6J4\"",
    "mtime": "2026-10-18T08:18:16.347Z",
    "size": 1663,
    "path": "../public/_nuxt/CKOMBMAx.js.br"
  },
  "/_nuxt/CKOMBMAx.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"74e-lmENm6NwVIuAgeHjHOpcO0BNhsY\"",
    "mtime": "2026-10-18T08:18:16.339Z",
    "size": 1870,
    "path": "../public/_nuxt/CKOMBMAx.js.gz"
  },
  "/_nuxt/CKpuEmq3.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2d25-f1t971M72/3HeBkZCvNxUUQbZxI\"",
    "mtime": "2026-10-18T08:18:16.200Z",
    "size": 11557,
    "path": "../public/_nuxt/CKpuEmq3.js"
  },
  "/_nuxt/CKpuEmq3.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"e06-2MFmxoWny9t/ThY2aZTBK3W3Vjo\"",
    "mtime": "2026-10-18T08:18:16.350Z",
    "size": 3590,
    "path": "../public/_nuxt/CKpuEmq3.js.br"
  },
  "/_nuxt/CKpuEmq3.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"f7b-8H2JvEC3tAtcY26jg4JDgdrJQec\"",
    "mtime": "2026-10-18T08:18:16.347Z",
    "size": 3963,
    "path": "../public/_nuxt/CKpuEmq3.js.gz"
  },
  "/_nuxt/CM19BhDi.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"12f9-wuXEPkRpxwk9VNVRa1k37C3e+Uo\"",
    "mtime": "2026-10-18T08:18:16.200Z",
    "size": 4857,
    "path": "../public/_nuxt/CM19BhDi.js"
  },
  "/_nuxt/CM19BhDi.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"77b-fQ+C5KxmHd/+AfDMvDxfzvHWMbY\"",
    "mtime": "2026-10-18T08:18:16.350Z",
    "size": 1915,
    "path": "../public/_nuxt/CM19BhDi.js.br"
  },
  "/_nuxt/CM19BhDi.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"85d-EanbQzumvj+vw0Ldri1QF/azQIs\"",
    "mtime": "2026-10-18T08:18:16.350Z",
    "size": 2141,
    "path": "../public/_nuxt/CM19BhDi.js.gz"
  },
  "/_nuxt/CMSy_Zas.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"186c-oXLHOdrTminDdDEiSZl8aj9fxs4\"",
    "mtime": "2026-10-18T08:18:16.201Z",
    "size": 6252,
    "path": "../public/_nuxt/CMSy_Zas.js"
  },
  "/_nuxt/CMSy_Zas.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"8f5-ztrEHY6fkJBfsNs6ds+WSNMaD60\"",
    "mtime": "2026-10-18T08:18:16.359Z",
    "size": 2293,
    "path": "../public/_nuxt/CMSy_Zas.js.br"
  },
  "/_nuxt/CWm3bTSA.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"ad3-E9BSUvzNC081F6FjqBgd/KdZens\"",
    "mtime": "2026-10-18T08:18:16.201Z",
    "size": 2771,
    "path": "../public/_nuxt/CWm3bTSA.js"
  },
  "/_nuxt/CMSy_Zas.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a04-bL9yeDHMi4qb7LojJjj5hsacZTM\"",
    "mtime": "2026-10-18T08:18:16.350Z",
    "size": 2564,
    "path": "../public/_nuxt/CMSy_Zas.js.gz"
  },
  "/_nuxt/CWm3bTSA.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"440-pyG5o8jvuQoApxMRrCYUL11EBjw\"",
    "mtime": "2026-10-18T08:18:16.351Z",
    "size": 1088,
    "path": "../public/_nuxt/CWm3bTSA.js.br"
  },
  "/_nuxt/CWm3bTSA.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4d0-8R0+OTQTxD8kjYiaKbHb1Xj0zJU\"",
    "mtime": "2026-10-18T08:18:16.350Z",
    "size": 1232,
    "path": "../public/_nuxt/CWm3bTSA.js.gz"
  },
  "/_nuxt/CZEfNzdv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3ca-9tBd57DO93qGzeZq0Eg2mOdRetw\"",
    "mtime": "2026-10-18T08:18:16.201Z",
    "size": 970,
    "path": "../public/_nuxt/CZEfNzdv.js"
  },
  "/_nuxt/CZrwcjLX.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1d49-/nlvUNDc6hs/rRKu5kU9zVn5Kwg\"",
    "mtime": "2026-10-18T08:18:16.201Z",
    "size": 7497,
    "path": "../public/_nuxt/CZrwcjLX.js"
  },
  "/_nuxt/CZrwcjLX.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"a35-RtVD+linxM1KOCcP1VfGAlUjSA8\"",
    "mtime": "2026-10-18T08:18:16.365Z",
    "size": 2613,
    "path": "../public/_nuxt/CZrwcjLX.js.br"
  },
  "/_nuxt/CZrwcjLX.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"b73-aC2V6lHXVUT/bK2KPNreSh+bHzk\"",
    "mtime": "2026-10-18T08:18:16.359Z",
    "size": 2931,
    "path": "../public/_nuxt/CZrwcjLX.js.gz"
  },
  "/_nuxt/CZwxYgPp.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"627-mtk9hrZLPED+RbHKJW/aI3BsvTo\"",
    "mtime": "2026-10-18T08:18:16.362Z",
    "size": 1575,
    "path": "../public/_nuxt/CZwxYgPp.js.br"
  },
  "/_nuxt/CZwxYgPp.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"ea8-eLvlxJhUOlXOSsN5tvJ89edzkgM\"",
    "mtime": "2026-10-18T08:18:16.202Z",
    "size": 3752,
    "path": "../public/_nuxt/CZwxYgPp.js"
  },
  "/_nuxt/CZwxYgPp.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"6e3-gbi6JkfT1cXaqZJKunX3zARl7jA\"",
    "mtime": "2026-10-18T08:18:16.362Z",
    "size": 1763,
    "path": "../public/_nuxt/CZwxYgPp.js.gz"
  },
  "/_nuxt/CZyt2MAh.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"833d-OR+AMG3h34QaV5OnOiI9WjVAVW4\"",
    "mtime": "2026-10-18T08:18:16.700Z",
    "size": 33597,
    "path": "../public/_nuxt/CZyt2MAh.js.br"
  },
  "/_nuxt/Cb8KQg7u.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"b54-2O4tFVjgqJuMTMTxoL/gM6Mky2k\"",
    "mtime": "2026-10-18T08:18:16.202Z",
    "size": 2900,
    "path": "../public/_nuxt/Cb8KQg7u.js"
  },
  "/_nuxt/CZyt2MAh.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a348-I5Y/wzMLgHdKM5O6QgC5hR7zBsA\"",
    "mtime": "2026-10-18T08:18:16.367Z",
    "size": 41800,
    "path": "../public/_nuxt/CZyt2MAh.js.gz"
  },
  "/_nuxt/CZyt2MAh.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2df2b-q5yQQ8M56aM7BeO5dU63G3YlVsk\"",
    "mtime": "2026-10-18T08:18:16.205Z",
    "size": 188203,
    "path": "../public/_nuxt/CZyt2MAh.js"
  },
  "/_nuxt/Cb8KQg7u.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"442-6MUnq7myc/4B52royfaKgZbjQV8\"",
    "mtime": "2026-10-18T08:18:16.366Z",
    "size": 1090,
    "path": "../public/_nuxt/Cb8KQg7u.js.br"
  },
  "/_nuxt/Cb8KQg7u.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4ea-l7XpJ+3uficABCm0R2C8Nf+vdLw\"",
    "mtime": "2026-10-18T08:18:16.366Z",
    "size": 1258,
    "path": "../public/_nuxt/Cb8KQg7u.js.gz"
  },
  "/_nuxt/CbNrcX3z.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"5a7b8-03YWaUggy59RI9ET/c2/L3/QmdA\"",
    "mtime": "2026-10-18T08:18:16.208Z",
    "size": 370616,
    "path": "../public/_nuxt/CbNrcX3z.js"
  },
  "/_nuxt/CbNrcX3z.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"1943e-lXh0xmejMhxkzf6l8YJD6v45DpQ\"",
    "mtime": "2026-10-18T08:18:17.340Z",
    "size": 103486,
    "path": "../public/_nuxt/CbNrcX3z.js.br"
  },
  "/_nuxt/CbNrcX3z.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1d2e0-KLTd8FUK1Ia7NDLOb8H33cf/Ads\"",
    "mtime": "2026-10-18T08:18:16.395Z",
    "size": 119520,
    "path": "../public/_nuxt/CbNrcX3z.js.gz"
  },
  "/_nuxt/CbOX36ik.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"477-miY7cw1p5oD0WwL+Ecowk69OIrE\"",
    "mtime": "2026-10-18T08:18:16.202Z",
    "size": 1143,
    "path": "../public/_nuxt/CbOX36ik.js"
  },
  "/_nuxt/CbOX36ik.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"245-XjR3dnAJZgmX8qVCy6Mqq6v+zQk\"",
    "mtime": "2026-10-18T08:18:16.368Z",
    "size": 581,
    "path": "../public/_nuxt/CbOX36ik.js.br"
  },
  "/_nuxt/CfCFRaJj.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"4d1-tuDngv/EDlNlVeLbF410ZwcKvHY\"",
    "mtime": "2026-10-18T08:18:16.203Z",
    "size": 1233,
    "path": "../public/_nuxt/CfCFRaJj.js"
  },
  "/_nuxt/CeqJbM-O.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3fe-Zd4xnofM9S39o3i/axuCWsltpoc\"",
    "mtime": "2026-10-18T08:18:16.202Z",
    "size": 1022,
    "path": "../public/_nuxt/CeqJbM-O.js"
  },
  "/_nuxt/CcCL35Av.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"22d-FYBSj1HsKQewLXpOy4NXsr9Kd4U\"",
    "mtime": "2026-10-18T08:18:16.202Z",
    "size": 557,
    "path": "../public/_nuxt/CcCL35Av.js"
  },
  "/_nuxt/CbOX36ik.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"293-WZ/Jt+0OW+/8ozsRngeiD1/JcLQ\"",
    "mtime": "2026-10-18T08:18:16.366Z",
    "size": 659,
    "path": "../public/_nuxt/CbOX36ik.js.gz"
  },
  "/_nuxt/CfPVT-fK.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1780-Q0p1/v3HeuhLn0gM6M/wPiaaI2o\"",
    "mtime": "2026-10-18T08:18:16.380Z",
    "size": 6016,
    "path": "../public/_nuxt/CfPVT-fK.js.gz"
  },
  "/_nuxt/Cg4dz60P.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"9ea-RLHetCdcPPKj/6QC0eUhJiD4zlo\"",
    "mtime": "2026-10-18T08:18:16.204Z",
    "size": 2538,
    "path": "../public/_nuxt/Cg4dz60P.js"
  },
  "/_nuxt/Cg4dz60P.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"498-45aWU+hHqEthow7zAsuWM1kWiFw\"",
    "mtime": "2026-10-18T08:18:16.389Z",
    "size": 1176,
    "path": "../public/_nuxt/Cg4dz60P.js.br"
  },
  "/_nuxt/Cg4dz60P.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"513-Njyg0FbudB9QyUFqVGsgjTkIrxg\"",
    "mtime": "2026-10-18T08:18:16.389Z",
    "size": 1299,
    "path": "../public/_nuxt/Cg4dz60P.js.gz"
  },
  "/_nuxt/CfCFRaJj.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"296-Gi/mJWsCTq1lPuhNjE+a2EA0SXs\"",
    "mtime": "2026-10-18T08:18:16.376Z",
    "size": 662,
    "path": "../public/_nuxt/CfCFRaJj.js.gz"
  },
  "/_nuxt/CfPVT-fK.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"14e2-m7T3lsC/0YdwnznnC4hWjkrK8mw\"",
    "mtime": "2026-10-18T08:18:16.392Z",
    "size": 5346,
    "path": "../public/_nuxt/CfPVT-fK.js.br"
  },
  "/_nuxt/CfCFRaJj.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"24e-d1Ii7J26tShDxVfYnz0nwisvBUc\"",
    "mtime": "2026-10-18T08:18:16.380Z",
    "size": 590,
    "path": "../public/_nuxt/CfCFRaJj.js.br"
  },
  "/_nuxt/Cgm8mmxW.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"bce-EyMTlRUEwmq3UkKSukRWUWoAFcs\"",
    "mtime": "2026-10-18T08:18:16.203Z",
    "size": 3022,
    "path": "../public/_nuxt/Cgm8mmxW.js"
  },
  "/_nuxt/Cgm8mmxW.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"533-mFJq5va6Tt6BJYz5pGD2HdHHtt8\"",
    "mtime": "2026-10-18T08:18:16.392Z",
    "size": 1331,
    "path": "../public/_nuxt/Cgm8mmxW.js.br"
  },
  "/_nuxt/CfPVT-fK.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"4ec5-Iwrcc+6nazhkbObswJdz8RGTzv4\"",
    "mtime": "2026-10-18T08:18:16.203Z",
    "size": 20165,
    "path": "../public/_nuxt/CfPVT-fK.js"
  },
  "/_nuxt/Cgm8mmxW.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5eb-mA6gc75YjhnO5eC+G8sVzQz5pq4\"",
    "mtime": "2026-10-18T08:18:16.392Z",
    "size": 1515,
    "path": "../public/_nuxt/Cgm8mmxW.js.gz"
  },
  "/_nuxt/ChVlALn1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3aa-O15v+vVW0JA3G3W0RqJR2nGvdDc\"",
    "mtime": "2026-10-18T08:18:16.205Z",
    "size": 938,
    "path": "../public/_nuxt/ChVlALn1.js"
  },
  "/_nuxt/CjBnENqF.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1258-XEsRy4FBn0m7dOwffT4f+q4QTT8\"",
    "mtime": "2026-10-18T08:18:16.204Z",
    "size": 4696,
    "path": "../public/_nuxt/CjBnENqF.js"
  },
  "/_nuxt/CjBnENqF.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"6f7-zTeASrnE6TAKzI8GQWtGOS3CgOk\"",
    "mtime": "2026-10-18T08:18:16.392Z",
    "size": 1783,
    "path": "../public/_nuxt/CjBnENqF.js.br"
  },
  "/_nuxt/CjBnENqF.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"7c6-N2jxmWMePtfo/zb18XT0ljU1S38\"",
    "mtime": "2026-10-18T08:18:16.392Z",
    "size": 1990,
    "path": "../public/_nuxt/CjBnENqF.js.gz"
  },
  "/_nuxt/CjZQ0ZXP.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"6db-dqcMU56GJZeQj7wgaa/yMUMB6uI\"",
    "mtime": "2026-10-18T08:18:16.205Z",
    "size": 1755,
    "path": "../public/_nuxt/CjZQ0ZXP.js"
  },
  "/_nuxt/CjZQ0ZXP.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"38e-HliAXw/SvXRHX43ZZpDyP63lDC4\"",
    "mtime": "2026-10-18T08:18:16.393Z",
    "size": 910,
    "path": "../public/_nuxt/CjZQ0ZXP.js.br"
  },
  "/_nuxt/CjZQ0ZXP.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3f3-dIQLHWqHT4JgE9UZdlvomUooL5M\"",
    "mtime": "2026-10-18T08:18:16.392Z",
    "size": 1011,
    "path": "../public/_nuxt/CjZQ0ZXP.js.gz"
  },
  "/_nuxt/CjpkyUN4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29b-7fxRc3QjIkk7JMieI2ckZPbPT/Y\"",
    "mtime": "2026-10-18T08:18:16.205Z",
    "size": 667,
    "path": "../public/_nuxt/CjpkyUN4.js"
  },
  "/_nuxt/CjpJFqxM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"330-ArI7L5aXZmFsXkvK0o9LibD1VyY\"",
    "mtime": "2026-10-18T08:18:16.205Z",
    "size": 816,
    "path": "../public/_nuxt/CjpJFqxM.js"
  },
  "/_nuxt/Cn0Rg6aw.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"5b1-MmgRj9fv8zZB7XseJdWtn4eyKHc\"",
    "mtime": "2026-10-18T08:18:16.206Z",
    "size": 1457,
    "path": "../public/_nuxt/Cn0Rg6aw.js"
  },
  "/_nuxt/Cn0Rg6aw.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2a4-gH98i6M7Ht/YkKTZNnE9xxWS4pE\"",
    "mtime": "2026-10-18T08:18:16.403Z",
    "size": 676,
    "path": "../public/_nuxt/Cn0Rg6aw.js.br"
  },
  "/_nuxt/Cn0Rg6aw.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2f5-/u2kJTA1meyfWutVRzL/sT/GOBI\"",
    "mtime": "2026-10-18T08:18:16.403Z",
    "size": 757,
    "path": "../public/_nuxt/Cn0Rg6aw.js.gz"
  },
  "/_nuxt/CnDhhkbR.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"a88-W+qmYIFim8k1trzT684N4uzN5Wg\"",
    "mtime": "2026-10-18T08:18:16.206Z",
    "size": 2696,
    "path": "../public/_nuxt/CnDhhkbR.js"
  },
  "/_nuxt/CnDhhkbR.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"313-gLH0qzhLHoTWVwzDuICXFsNDoK8\"",
    "mtime": "2026-10-18T08:18:16.405Z",
    "size": 787,
    "path": "../public/_nuxt/CnDhhkbR.js.br"
  },
  "/_nuxt/CnDhhkbR.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"391-xLMRkS0DE8L7a+2qOi4wWm3zkNk\"",
    "mtime": "2026-10-18T08:18:16.403Z",
    "size": 913,
    "path": "../public/_nuxt/CnDhhkbR.js.gz"
  },
  "/_nuxt/CoBfUqKZ.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"f33-wH5Dr173rbmZpyoND2vBMFoCeIk\"",
    "mtime": "2026-10-18T08:18:16.206Z",
    "size": 3891,
    "path": "../public/_nuxt/CoBfUqKZ.js"
  },
  "/_nuxt/CoBfUqKZ.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5aa-nuN/jYajPs4MZp8F81BiVD5kxPE\"",
    "mtime": "2026-10-18T08:18:16.406Z",
    "size": 1450,
    "path": "../public/_nuxt/CoBfUqKZ.js.br"
  },
  "/_nuxt/CoBfUqKZ.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"667-Qa7jyYyzMUz707ImneDJKkGhy2E\"",
    "mtime": "2026-10-18T08:18:16.405Z",
    "size": 1639,
    "path": "../public/_nuxt/CoBfUqKZ.js.gz"
  },
  "/_nuxt/CoUFG1Y4.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"9f0-YPHPb3iZuU+rRHbZ6+oCVa45CQY\"",
    "mtime": "2026-10-18T08:18:16.206Z",
    "size": 2544,
    "path": "../public/_nuxt/CoUFG1Y4.js"
  },
  "/_nuxt/CoUFG1Y4.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"49e-z0wRW/TPTmTgP0xI6GIk2GkHLmI\"",
    "mtime": "2026-10-18T08:18:16.406Z",
    "size": 1182,
    "path": "../public/_nuxt/CoUFG1Y4.js.br"
  },
  "/_nuxt/CoUFG1Y4.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"52c-kV1NSuxPwsCdFu7qUVXTaTI3bRI\"",
    "mtime": "2026-10-18T08:18:16.406Z",
    "size": 1324,
    "path": "../public/_nuxt/CoUFG1Y4.js.gz"
  },
  "/_nuxt/Cos_ndwu.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"486-x45Ne1DL1B9xPZBo18IAvS0CqSQ\"",
    "mtime": "2026-10-18T08:18:16.206Z",
    "size": 1158,
    "path": "../public/_nuxt/Cos_ndwu.js"
  },
  "/_nuxt/Cos_ndwu.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"229-EgI7FDx40htKln8vOJhQKXaW+A8\"",
    "mtime": "2026-10-18T08:18:16.406Z",
    "size": 553,
    "path": "../public/_nuxt/Cos_ndwu.js.br"
  },
  "/_nuxt/Cos_ndwu.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"278-yu0tnqF6vJQLiQRPhHVNZWS2b5c\"",
    "mtime": "2026-10-18T08:18:16.406Z",
    "size": 632,
    "path": "../public/_nuxt/Cos_ndwu.js.gz"
  },
  "/_nuxt/Cot0vSW1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17a-iDQtd+aCT5GhA3CWQTlVHKNyMyU\"",
    "mtime": "2026-10-18T08:18:16.206Z",
    "size": 378,
    "path": "../public/_nuxt/Cot0vSW1.js"
  },
  "/_nuxt/Cr-ouCs-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"38e-6NhMgOuEz8jzKGYMq9Xu0bW97Tc\"",
    "mtime": "2026-10-18T08:18:16.206Z",
    "size": 910,
    "path": "../public/_nuxt/Cr-ouCs-.js"
  },
  "/_nuxt/CsWbVOQC.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"e2f-FAjtC4W1nzuAk6JKZqln0h+4xKg\"",
    "mtime": "2026-10-18T08:18:16.422Z",
    "size": 3631,
    "path": "../public/_nuxt/CsWbVOQC.js.br"
  },
  "/_nuxt/CsWbVOQC.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2fb6-yH+1rziaHRZ5l8r84R2sKjCUfz0\"",
    "mtime": "2026-10-18T08:18:16.207Z",
    "size": 12214,
    "path": "../public/_nuxt/CsWbVOQC.js"
  },
  "/_nuxt/CsWbVOQC.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"100a-aLyapkku2u2VCXk+qAy9cx9xNo0\"",
    "mtime": "2026-10-18T08:18:16.406Z",
    "size": 4106,
    "path": "../public/_nuxt/CsWbVOQC.js.gz"
  },
  "/_nuxt/CunF12yP.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"a4d-4o6JDZVVbwD+EiRli7IaHzr8gUc\"",
    "mtime": "2026-10-18T08:18:16.207Z",
    "size": 2637,
    "path": "../public/_nuxt/CunF12yP.js"
  },
  "/_nuxt/CunF12yP.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"457-nujc8/G8k2crKR4q1tQJ6CbpNLA\"",
    "mtime": "2026-10-18T08:18:16.421Z",
    "size": 1111,
    "path": "../public/_nuxt/CunF12yP.js.br"
  },
  "/_nuxt/CunF12yP.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4dd-fRaGr2aTx4zyb0YnS5BYeMx3y+M\"",
    "mtime": "2026-10-18T08:18:16.421Z",
    "size": 1245,
    "path": "../public/_nuxt/CunF12yP.js.gz"
  },
  "/_nuxt/CuqQ2tfY.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2091-UwJVqH0ZQu//BqcB+NmCaP8R6B4\"",
    "mtime": "2026-10-18T08:18:16.207Z",
    "size": 8337,
    "path": "../public/_nuxt/CuqQ2tfY.js"
  },
  "/_nuxt/CuqQ2tfY.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"a51-lJ4WWc/8o7Yooh8qcOFoyVtRMns\"",
    "mtime": "2026-10-18T08:18:16.433Z",
    "size": 2641,
    "path": "../public/_nuxt/CuqQ2tfY.js.br"
  },
  "/_nuxt/CuqQ2tfY.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"bb7-oCMmwub8jKWzO1osWJ3Yk6RTgZE\"",
    "mtime": "2026-10-18T08:18:16.421Z",
    "size": 2999,
    "path": "../public/_nuxt/CuqQ2tfY.js.gz"
  },
  "/_nuxt/CvDQaqqz.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"3ffa-orcpNsL4CrnvpUiSJzfhaDqRQ4w\"",
    "mtime": "2026-10-18T08:18:16.207Z",
    "size": 16378,
    "path": "../public/_nuxt/CvDQaqqz.js"
  },
  "/_nuxt/CvDQaqqz.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"12bb-HDlcZU3Xvpjy5B/mupfZiexo85s\"",
    "mtime": "2026-10-18T08:18:16.441Z",
    "size": 4795,
    "path": "../public/_nuxt/CvDQaqqz.js.br"
  },
  "/_nuxt/CvDQaqqz.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"154e-ZXPXEF7LtaW2LzMQtNGljtZu3KE\"",
    "mtime": "2026-10-18T08:18:16.433Z",
    "size": 5454,
    "path": "../public/_nuxt/CvDQaqqz.js.gz"
  },
  "/_nuxt/Cx8H8hLm.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"22ea-stVhWLLAIBdvGxcgkhYaog5hYZk\"",
    "mtime": "2026-10-18T08:18:16.207Z",
    "size": 8938,
    "path": "../public/_nuxt/Cx8H8hLm.js"
  },
  "/_nuxt/Cx8H8hLm.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"c10-6WdCY7jjUU1AiqV6CRle8jplGHw\"",
    "mtime": "2026-10-18T08:18:16.438Z",
    "size": 3088,
    "path": "../public/_nuxt/Cx8H8hLm.js.br"
  },
  "/_nuxt/Cx8H8hLm.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"d52-6577VXOnGvOGaetiQXD+sL8p2BQ\"",
    "mtime": "2026-10-18T08:18:16.438Z",
    "size": 3410,
    "path": "../public/_nuxt/Cx8H8hLm.js.gz"
  },
  "/_nuxt/Cx9Q0soI.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"5cb-0boc8hr9M4+FAAfqkV476ZqrlzA\"",
    "mtime": "2026-10-18T08:18:16.208Z",
    "size": 1483,
    "path": "../public/_nuxt/Cx9Q0soI.js"
  },
  "/_nuxt/Cx9Q0soI.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2ad-zt8wJeRszqmYdFefjXYN1gHRknM\"",
    "mtime": "2026-10-18T08:18:16.441Z",
    "size": 685,
    "path": "../public/_nuxt/Cx9Q0soI.js.br"
  },
  "/_nuxt/Cx9Q0soI.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"311-PfaXDBxAoZ0tRnoqEQcUt9c2zAE\"",
    "mtime": "2026-10-18T08:18:16.441Z",
    "size": 785,
    "path": "../public/_nuxt/Cx9Q0soI.js.gz"
  },
  "/_nuxt/D0tUuqWo.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1289-qK+k/lwJj8Y9RC+NRGOq8Ts+NDo\"",
    "mtime": "2026-10-18T08:18:16.208Z",
    "size": 4745,
    "path": "../public/_nuxt/D0tUuqWo.js"
  },
  "/_nuxt/D0tUuqWo.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"68a-kLQ3EULUNxRy2nUPytlR6eFHCVU\"",
    "mtime": "2026-10-18T08:18:16.441Z",
    "size": 1674,
    "path": "../public/_nuxt/D0tUuqWo.js.br"
  },
  "/_nuxt/D0tUuqWo.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"775-Z/dq6LvSDpBoi7qkujoWvNid5ng\"",
    "mtime": "2026-10-18T08:18:16.441Z",
    "size": 1909,
    "path": "../public/_nuxt/D0tUuqWo.js.gz"
  },
  "/_nuxt/D1P8p11I.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1cad-2Uxtosji0PVX+12WLfG/GuduJlI\"",
    "mtime": "2026-10-18T08:18:16.207Z",
    "size": 7341,
    "path": "../public/_nuxt/D1P8p11I.js"
  },
  "/_nuxt/D1P8p11I.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"ab8-gL0claedAAg4b9sb9RqdysXuLXE\"",
    "mtime": "2026-10-18T08:18:16.456Z",
    "size": 2744,
    "path": "../public/_nuxt/D1P8p11I.js.br"
  },
  "/_nuxt/D1P8p11I.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"c15-DuXqCjcN4whfjmGLfyKn1+B1LDw\"",
    "mtime": "2026-10-18T08:18:16.441Z",
    "size": 3093,
    "path": "../public/_nuxt/D1P8p11I.js.gz"
  },
  "/_nuxt/D2JfBwNc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"231-HP7W/RywZf1XDZF/BPEjl+bz3Ug\"",
    "mtime": "2026-10-18T08:18:16.208Z",
    "size": 561,
    "path": "../public/_nuxt/D2JfBwNc.js"
  },
  "/_nuxt/D2V8FtjF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d2-B7wnpfIpkvsXFeQwgJHEI1xPlzE\"",
    "mtime": "2026-10-18T08:18:16.208Z",
    "size": 466,
    "path": "../public/_nuxt/D2V8FtjF.js"
  },
  "/_nuxt/D2WcNqVR.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1671-djMIwj/VDdE0yLa6PhB4PA/DBb0\"",
    "mtime": "2026-10-18T08:18:16.208Z",
    "size": 5745,
    "path": "../public/_nuxt/D2WcNqVR.js"
  },
  "/_nuxt/D2WcNqVR.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"89e-fKmAOGg7bLpu7jGqd12gvhVx0nw\"",
    "mtime": "2026-10-18T08:18:16.457Z",
    "size": 2206,
    "path": "../public/_nuxt/D2WcNqVR.js.br"
  },
  "/_nuxt/D2WcNqVR.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"9a1-E2Di6vCRRvmbiCAb5RPnllFDSCA\"",
    "mtime": "2026-10-18T08:18:16.456Z",
    "size": 2465,
    "path": "../public/_nuxt/D2WcNqVR.js.gz"
  },
  "/_nuxt/D3RzrFi6.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"819-1RAxWAOy+w+omoCsOue9xYO11/g\"",
    "mtime": "2026-10-18T08:18:16.458Z",
    "size": 2073,
    "path": "../public/_nuxt/D3RzrFi6.js.br"
  },
  "/_nuxt/D3RzrFi6.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"937-YJHuh9/k5IaN5RHhyJWMxTxM4cE\"",
    "mtime": "2026-10-18T08:18:16.457Z",
    "size": 2359,
    "path": "../public/_nuxt/D3RzrFi6.js.gz"
  },
  "/_nuxt/D3RzrFi6.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"166f-jVwgF2ymJQvQzjB8p3zJrMid4aU\"",
    "mtime": "2026-10-18T08:18:16.209Z",
    "size": 5743,
    "path": "../public/_nuxt/D3RzrFi6.js"
  },
  "/_nuxt/D3bUAlKD.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"213e-qw1c2jwNHPtveGTsPHD0+PN68gE\"",
    "mtime": "2026-10-18T08:18:16.208Z",
    "size": 8510,
    "path": "../public/_nuxt/D3bUAlKD.js"
  },
  "/_nuxt/D3bUAlKD.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"b2c-nwn1Nh6LDsVg+I3SMxGaXvp9er8\"",
    "mtime": "2026-10-18T08:18:16.458Z",
    "size": 2860,
    "path": "../public/_nuxt/D3bUAlKD.js.br"
  },
  "/_nuxt/D3bUAlKD.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"c94-NiI0MWWnTMWiDnG8EaHgTkc7R6U\"",
    "mtime": "2026-10-18T08:18:16.458Z",
    "size": 3220,
    "path": "../public/_nuxt/D3bUAlKD.js.gz"
  },
  "/_nuxt/D3nD9Eb2.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"4df-z69iDu4usbPw5Bc4/vtmojchZF8\"",
    "mtime": "2026-10-18T08:18:16.208Z",
    "size": 1247,
    "path": "../public/_nuxt/D3nD9Eb2.js"
  },
  "/_nuxt/D3nD9Eb2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"26c-grYhomNj0n33iZb4+SfeDBbBD8U\"",
    "mtime": "2026-10-18T08:18:16.458Z",
    "size": 620,
    "path": "../public/_nuxt/D3nD9Eb2.js.br"
  },
  "/_nuxt/D3nD9Eb2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2bc-0AM116RF/JpkNJELpcqq6OKewZk\"",
    "mtime": "2026-10-18T08:18:16.458Z",
    "size": 700,
    "path": "../public/_nuxt/D3nD9Eb2.js.gz"
  },
  "/_nuxt/D5e3HCxn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"36f-UsKGJiZ7eWIZbdvCM85xblimFRM\"",
    "mtime": "2026-10-18T08:18:16.209Z",
    "size": 879,
    "path": "../public/_nuxt/D5e3HCxn.js"
  },
  "/_nuxt/D6zzd0Ux.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"37e-guVzpsqs5+myNVKBsWtCE5DitFA\"",
    "mtime": "2026-10-18T08:18:16.209Z",
    "size": 894,
    "path": "../public/_nuxt/D6zzd0Ux.js"
  },
  "/_nuxt/D7G5VOK4.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"17bc-MlkrDxk0EOqTPBgCNKKE2j1Udjs\"",
    "mtime": "2026-10-18T08:18:16.209Z",
    "size": 6076,
    "path": "../public/_nuxt/D7G5VOK4.js"
  },
  "/_nuxt/D7G5VOK4.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"7f9-kD7sQRRQsjwdjDBE3PVkso0+Z7U\"",
    "mtime": "2026-10-18T08:18:16.464Z",
    "size": 2041,
    "path": "../public/_nuxt/D7G5VOK4.js.br"
  },
  "/_nuxt/D7G5VOK4.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"8e7-Cdsz+bIk3N8o1TkgFJFGU7Ri27c\"",
    "mtime": "2026-10-18T08:18:16.458Z",
    "size": 2279,
    "path": "../public/_nuxt/D7G5VOK4.js.gz"
  },
  "/_nuxt/D85foZh1.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1ecf-orqXHlLvG80FvqpI69BWf7hMeXg\"",
    "mtime": "2026-10-18T08:18:16.209Z",
    "size": 7887,
    "path": "../public/_nuxt/D85foZh1.js"
  },
  "/_nuxt/D7khMT-N.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"341-bex7E+Awl8cNrZezmHs0TyoDIVE\"",
    "mtime": "2026-10-18T08:18:16.209Z",
    "size": 833,
    "path": "../public/_nuxt/D7khMT-N.js"
  },
  "/_nuxt/D85foZh1.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"ae2-zLULmNmMjVcXkpQ9I7JGKPrO1hY\"",
    "mtime": "2026-10-18T08:18:16.474Z",
    "size": 2786,
    "path": "../public/_nuxt/D85foZh1.js.br"
  },
  "/_nuxt/D85foZh1.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"c07-2AMm8Vzh57GLtUdXI6l3ZhsLFAI\"",
    "mtime": "2026-10-18T08:18:16.464Z",
    "size": 3079,
    "path": "../public/_nuxt/D85foZh1.js.gz"
  },
  "/_nuxt/DA3yxMRP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ec-4imJ30Mhj4cUkLoWksdRlVfefXs\"",
    "mtime": "2026-10-18T08:18:16.209Z",
    "size": 748,
    "path": "../public/_nuxt/DA3yxMRP.js"
  },
  "/_nuxt/DIxgi8n9.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"10dd-cpqRqPXegCT30jRlwGaI6wENM98\"",
    "mtime": "2026-10-18T08:18:16.210Z",
    "size": 4317,
    "path": "../public/_nuxt/DIxgi8n9.js"
  },
  "/_nuxt/DIxgi8n9.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"67a-2ZpoXa6IBwFOKdxZPf66ghKtjAo\"",
    "mtime": "2026-10-18T08:18:16.474Z",
    "size": 1658,
    "path": "../public/_nuxt/DIxgi8n9.js.br"
  },
  "/_nuxt/DIxgi8n9.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"75a-xPQVbnc4F3MmP2dDrv+px/Tdo4k\"",
    "mtime": "2026-10-18T08:18:16.474Z",
    "size": 1882,
    "path": "../public/_nuxt/DIxgi8n9.js.gz"
  },
  "/_nuxt/DJOjmj9f.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"43d-qp+LCPLdiCf50xbwpwLZ3z8RFjM\"",
    "mtime": "2026-10-18T08:18:16.209Z",
    "size": 1085,
    "path": "../public/_nuxt/DJOjmj9f.js"
  },
  "/_nuxt/DJOjmj9f.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"21d-Us1Sf938BUWQD1VrSMHNOJ6Qoys\"",
    "mtime": "2026-10-18T08:18:16.474Z",
    "size": 541,
    "path": "../public/_nuxt/DJOjmj9f.js.br"
  },
  "/_nuxt/DJOjmj9f.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"259-7JHS1u+DORDdpXyqhvui34Ee+AA\"",
    "mtime": "2026-10-18T08:18:16.474Z",
    "size": 601,
    "path": "../public/_nuxt/DJOjmj9f.js.gz"
  },
  "/_nuxt/DMnnQm54.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"bd2-O4Nj8JDBC348x+cmNdib8sKj9LM\"",
    "mtime": "2026-10-18T08:18:16.210Z",
    "size": 3026,
    "path": "../public/_nuxt/DMnnQm54.js"
  },
  "/_nuxt/DMnnQm54.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4c8-rPHr4koM/MvMCXxlyEFbQY2UknI\"",
    "mtime": "2026-10-18T08:18:16.474Z",
    "size": 1224,
    "path": "../public/_nuxt/DMnnQm54.js.br"
  },
  "/_nuxt/DMnnQm54.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"56b-uxDvK5VNon9eeMwk09nqcf3gLBk\"",
    "mtime": "2026-10-18T08:18:16.474Z",
    "size": 1387,
    "path": "../public/_nuxt/DMnnQm54.js.gz"
  },
  "/_nuxt/DQG__fol.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"70b-g91N3L8uTIain4qhK2Qi3crHti4\"",
    "mtime": "2026-10-18T08:18:16.210Z",
    "size": 1803,
    "path": "../public/_nuxt/DQG__fol.js"
  },
  "/_nuxt/DQG__fol.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"35d-ArgkcNAnxIDRWnShhGL1CT8QH0Q\"",
    "mtime": "2026-10-18T08:18:16.476Z",
    "size": 861,
    "path": "../public/_nuxt/DQG__fol.js.br"
  },
  "/_nuxt/DQG__fol.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3c6-L++aNdGBo9bEeE+sPXutiPBZKlI\"",
    "mtime": "2026-10-18T08:18:16.474Z",
    "size": 966,
    "path": "../public/_nuxt/DQG__fol.js.gz"
  },
  "/_nuxt/DQoFHsOT.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"893-DUo0XSkkyM0yc2ngJwlSB1F4pjU\"",
    "mtime": "2026-10-18T08:18:16.210Z",
    "size": 2195,
    "path": "../public/_nuxt/DQoFHsOT.js"
  },
  "/_nuxt/DQoFHsOT.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3a9-O8OvTrlB6WWgzGgCIwdPQS/slSw\"",
    "mtime": "2026-10-18T08:18:16.477Z",
    "size": 937,
    "path": "../public/_nuxt/DQoFHsOT.js.br"
  },
  "/_nuxt/DQoFHsOT.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"415-w0HiJR9hZFHxdBkKEv6h5wqwm6Y\"",
    "mtime": "2026-10-18T08:18:16.476Z",
    "size": 1045,
    "path": "../public/_nuxt/DQoFHsOT.js.gz"
  },
  "/_nuxt/DR0F7AcH.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"63f-Uv+yqdRjEkfAc4j2AsNpcHp/D9E\"",
    "mtime": "2026-10-18T08:18:16.210Z",
    "size": 1599,
    "path": "../public/_nuxt/DR0F7AcH.js"
  },
  "/_nuxt/DR0F7AcH.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2c0-YkuZjZHxK0zOTmOSWfoo/UL16eM\"",
    "mtime": "2026-10-18T08:18:16.478Z",
    "size": 704,
    "path": "../public/_nuxt/DR0F7AcH.js.br"
  },
  "/_nuxt/DRUFKhyD.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1299-l4E7/WnhBxnJYu231opDoUKZpCc\"",
    "mtime": "2026-10-18T08:18:16.210Z",
    "size": 4761,
    "path": "../public/_nuxt/DRUFKhyD.js"
  },
  "/_nuxt/DRUFKhyD.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"6d4-x13DWI0D5eCcbFtzvCjyZy2xapw\"",
    "mtime": "2026-10-18T08:18:16.502Z",
    "size": 1748,
    "path": "../public/_nuxt/DRUFKhyD.js.br"
  },
  "/_nuxt/DR0F7AcH.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"30b-TlWUXz04Z1ZWv3eNiEz1A3eHY6A\"",
    "mtime": "2026-10-18T08:18:16.477Z",
    "size": 779,
    "path": "../public/_nuxt/DR0F7AcH.js.gz"
  },
  "/_nuxt/DRUFKhyD.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"795-eVrN3jIVDm796/VIdsI6Arywrew\"",
    "mtime": "2026-10-18T08:18:16.478Z",
    "size": 1941,
    "path": "../public/_nuxt/DRUFKhyD.js.gz"
  },
  "/_nuxt/DRpEh2Vy.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"156f-Bw9JYILKbf4wnf3O51y8wrshAw0\"",
    "mtime": "2026-10-18T08:18:16.210Z",
    "size": 5487,
    "path": "../public/_nuxt/DRpEh2Vy.js"
  },
  "/_nuxt/DRpEh2Vy.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"82b-O/6Kt4eNW7gja2OVVhXkMWh1C3o\"",
    "mtime": "2026-10-18T08:18:16.504Z",
    "size": 2091,
    "path": "../public/_nuxt/DRpEh2Vy.js.br"
  },
  "/_nuxt/DRpEh2Vy.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"925-OwjiGWvH1r+MpjByDOY/fuFazZc\"",
    "mtime": "2026-10-18T08:18:16.501Z",
    "size": 2341,
    "path": "../public/_nuxt/DRpEh2Vy.js.gz"
  },
  "/_nuxt/DSk3wGe7.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"17ad-C8hgzLdQO8/rDqg1cJXytdB0NNg\"",
    "mtime": "2026-10-18T08:18:16.211Z",
    "size": 6061,
    "path": "../public/_nuxt/DSk3wGe7.js"
  },
  "/_nuxt/DSk3wGe7.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"8f4-/JfZdMCn8zbEgOYB1Cz/eQO+kN8\"",
    "mtime": "2026-10-18T08:18:16.505Z",
    "size": 2292,
    "path": "../public/_nuxt/DSk3wGe7.js.br"
  },
  "/_nuxt/DSk3wGe7.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"9d7-ft9x6OZn7zye+FekIwf9hKHmjtI\"",
    "mtime": "2026-10-18T08:18:16.504Z",
    "size": 2519,
    "path": "../public/_nuxt/DSk3wGe7.js.gz"
  },
  "/_nuxt/DSo6vjnI.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5b3-GXTimgklhBcrtgcqzU0eXkRFPFk\"",
    "mtime": "2026-10-18T08:18:16.505Z",
    "size": 1459,
    "path": "../public/_nuxt/DSo6vjnI.js.br"
  },
  "/_nuxt/DSo6vjnI.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"ce2-MHeb/5qSshfu/9mpbaY3nu2dgN0\"",
    "mtime": "2026-10-18T08:18:16.211Z",
    "size": 3298,
    "path": "../public/_nuxt/DSo6vjnI.js"
  },
  "/_nuxt/DSo6vjnI.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"64e-1ROMwJ1FtpCForFrnRk1LIt2KXE\"",
    "mtime": "2026-10-18T08:18:16.504Z",
    "size": 1614,
    "path": "../public/_nuxt/DSo6vjnI.js.gz"
  },
  "/_nuxt/DTcBusai.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"152b-T8N5M0N8q9ZIcCbMG12SwuHFxwA\"",
    "mtime": "2026-10-18T08:18:16.211Z",
    "size": 5419,
    "path": "../public/_nuxt/DTcBusai.js"
  },
  "/_nuxt/DTcBusai.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"816-gud1q0PM8YGJMnOtwp6yAJ/9XVo\"",
    "mtime": "2026-10-18T08:18:16.507Z",
    "size": 2070,
    "path": "../public/_nuxt/DTcBusai.js.br"
  },
  "/_nuxt/DTcBusai.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"8fc-IMyWozUcINJnkONLGPDCbFwU1Zc\"",
    "mtime": "2026-10-18T08:18:16.505Z",
    "size": 2300,
    "path": "../public/_nuxt/DTcBusai.js.gz"
  },
  "/_nuxt/DThro94a.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"a22-GwS9yLUL+MCe8weIzM5Gz6QWHgg\"",
    "mtime": "2026-10-18T08:18:16.211Z",
    "size": 2594,
    "path": "../public/_nuxt/DThro94a.js"
  },
  "/_nuxt/DThro94a.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4a3-mklPXl0loBgXKV1ddm23G7EbVN0\"",
    "mtime": "2026-10-18T08:18:16.505Z",
    "size": 1187,
    "path": "../public/_nuxt/DThro94a.js.br"
  },
  "/_nuxt/DThro94a.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"534-wdR0xdV2pwYDOCfH6yDMAWL7Txw\"",
    "mtime": "2026-10-18T08:18:16.505Z",
    "size": 1332,
    "path": "../public/_nuxt/DThro94a.js.gz"
  },
  "/_nuxt/DVV0jSJY.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"7a1-hnEWHwgi59CBqLGyHpA4fxcaDU4\"",
    "mtime": "2026-10-18T08:18:16.212Z",
    "size": 1953,
    "path": "../public/_nuxt/DVV0jSJY.js"
  },
  "/_nuxt/DVV0jSJY.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"361-Jj0DXsCxzdRnieVLW4T37ew8VC0\"",
    "mtime": "2026-10-18T08:18:16.516Z",
    "size": 865,
    "path": "../public/_nuxt/DVV0jSJY.js.br"
  },
  "/_nuxt/DVV0jSJY.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3ce-wmqFSIYeblVEJWgnav37p9CigFQ\"",
    "mtime": "2026-10-18T08:18:16.506Z",
    "size": 974,
    "path": "../public/_nuxt/DVV0jSJY.js.gz"
  },
  "/_nuxt/DWN53CId.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"31e-Qp57kBcH2liSzprh53llEjQI81E\"",
    "mtime": "2026-10-18T08:18:16.211Z",
    "size": 798,
    "path": "../public/_nuxt/DWN53CId.js"
  },
  "/_nuxt/DWXxYUfP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"33b-P23sauEcqjrSs22jl16XrViWyLI\"",
    "mtime": "2026-10-18T08:18:16.212Z",
    "size": 827,
    "path": "../public/_nuxt/DWXxYUfP.js"
  },
  "/_nuxt/DYAFsmpn.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"5f5-WnrJeaqfmBos9bt1QVzikFEnYfE\"",
    "mtime": "2026-10-18T08:18:16.212Z",
    "size": 1525,
    "path": "../public/_nuxt/DYAFsmpn.js"
  },
  "/_nuxt/DYAFsmpn.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2d6-HHoaVUNEyN08oQ7NCR22aWyRt5M\"",
    "mtime": "2026-10-18T08:18:16.516Z",
    "size": 726,
    "path": "../public/_nuxt/DYAFsmpn.js.br"
  },
  "/_nuxt/DYAFsmpn.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"330-J/TEtZQ3Nqh1eQFyCUEyPvknso4\"",
    "mtime": "2026-10-18T08:18:16.516Z",
    "size": 816,
    "path": "../public/_nuxt/DYAFsmpn.js.gz"
  },
  "/_nuxt/DYi58SXW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"40-HDC3pYUOQEtlPBlsZeW4H04DMfI\"",
    "mtime": "2026-10-18T08:18:16.212Z",
    "size": 64,
    "path": "../public/_nuxt/DYi58SXW.js"
  },
  "/_nuxt/DZ2k8sFR.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"bc4-KVfLhN3W1i1j2aRmxHDddfihlkI\"",
    "mtime": "2026-10-18T08:18:16.212Z",
    "size": 3012,
    "path": "../public/_nuxt/DZ2k8sFR.js"
  },
  "/_nuxt/DZ2k8sFR.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"536-Z15GZA0j/mrnzIztRO36i8FW/X0\"",
    "mtime": "2026-10-18T08:18:16.524Z",
    "size": 1334,
    "path": "../public/_nuxt/DZ2k8sFR.js.br"
  },
  "/_nuxt/DZ2k8sFR.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5db-pmkx1eeFWV6vzPVZWeMRqyjwNDk\"",
    "mtime": "2026-10-18T08:18:16.516Z",
    "size": 1499,
    "path": "../public/_nuxt/DZ2k8sFR.js.gz"
  },
  "/_nuxt/DZCDu6tu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"21b-+OCU/LNwDYkl4u5s7lMXKodpn/o\"",
    "mtime": "2026-10-18T08:18:16.212Z",
    "size": 539,
    "path": "../public/_nuxt/DZCDu6tu.js"
  },
  "/_nuxt/DZVp7SgD.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"d39-inO5eJBiwrYgIDekkJRitoISq+k\"",
    "mtime": "2026-10-18T08:18:16.212Z",
    "size": 3385,
    "path": "../public/_nuxt/DZVp7SgD.js"
  },
  "/_nuxt/DZVp7SgD.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5a9-48pNiUyCIW/WKsqsLZxX21klOjk\"",
    "mtime": "2026-10-18T08:18:16.552Z",
    "size": 1449,
    "path": "../public/_nuxt/DZVp7SgD.js.br"
  },
  "/_nuxt/DfUp9I86.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"3237-g16KNrEhqQUVcQXAIzKU5usM930\"",
    "mtime": "2026-10-18T08:18:16.213Z",
    "size": 12855,
    "path": "../public/_nuxt/DfUp9I86.js"
  },
  "/_nuxt/DZVp7SgD.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"65d-0nFqBqEFx5ceIn7pI/fTqgPYE6A\"",
    "mtime": "2026-10-18T08:18:16.524Z",
    "size": 1629,
    "path": "../public/_nuxt/DZVp7SgD.js.gz"
  },
  "/_nuxt/DfUp9I86.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"1204-Yu8uBqAdUUJj+qH77Jx35ZFPD+Y\"",
    "mtime": "2026-10-18T08:18:16.563Z",
    "size": 4612,
    "path": "../public/_nuxt/DfUp9I86.js.br"
  },
  "/_nuxt/DfUp9I86.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"13f4-D8+/qCfO4oOwGCtt5/gokR+qUxc\"",
    "mtime": "2026-10-18T08:18:16.562Z",
    "size": 5108,
    "path": "../public/_nuxt/DfUp9I86.js.gz"
  },
  "/_nuxt/DgAio0hb.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"30522-9VQsFVgEpFOTABYuh8WyrhcB5tI\"",
    "mtime": "2026-10-18T08:18:16.215Z",
    "size": 197922,
    "path": "../public/_nuxt/DgAio0hb.js"
  },
  "/_nuxt/DhFoNO59.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"14d6-2COinLWMx8WQZXrOyHE4FM6Le9I\"",
    "mtime": "2026-10-18T08:18:16.212Z",
    "size": 5334,
    "path": "../public/_nuxt/DhFoNO59.js"
  },
  "/_nuxt/DgAio0hb.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"ae8e-l3jY8otxJ0Jpy2BTkCv7lSBf1rw\"",
    "mtime": "2026-10-18T08:18:16.564Z",
    "size": 44686,
    "path": "../public/_nuxt/DgAio0hb.js.gz"
  },
  "/_nuxt/DhFoNO59.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"837-ntV1qA/MGMIp8kZdpLNBg/EWDf4\"",
    "mtime": "2026-10-18T08:18:16.563Z",
    "size": 2103,
    "path": "../public/_nuxt/DhFoNO59.js.br"
  },
  "/_nuxt/DgAio0hb.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"8fb4-vpUXV9qYmhj5TkLcaqeML4nX0bk\"",
    "mtime": "2026-10-18T08:18:16.838Z",
    "size": 36788,
    "path": "../public/_nuxt/DgAio0hb.js.br"
  },
  "/_nuxt/DhFoNO59.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"930-mLaOGQRc/9nX5GeYqdCREZYmsLo\"",
    "mtime": "2026-10-18T08:18:16.563Z",
    "size": 2352,
    "path": "../public/_nuxt/DhFoNO59.js.gz"
  },
  "/_nuxt/DhIidU4l.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"151d-J5Vf/dFVCHj4ioO0WcIb5DAXwJY\"",
    "mtime": "2026-10-18T08:18:16.213Z",
    "size": 5405,
    "path": "../public/_nuxt/DhIidU4l.js"
  },
  "/_nuxt/DhIidU4l.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"7dc-JVUDqeeXp3O/3JKeTfQv1rLcjZU\"",
    "mtime": "2026-10-18T08:18:16.563Z",
    "size": 2012,
    "path": "../public/_nuxt/DhIidU4l.js.br"
  },
  "/_nuxt/DhIidU4l.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"8c8-4rPzLKUWKimvW1357N6xPXLiKEk\"",
    "mtime": "2026-10-18T08:18:16.563Z",
    "size": 2248,
    "path": "../public/_nuxt/DhIidU4l.js.gz"
  },
  "/_nuxt/DhY3wEbg.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"4bf-LJ1Gd0AhfRiigqnCD29Nrz1NIhI\"",
    "mtime": "2026-10-18T08:18:16.213Z",
    "size": 1215,
    "path": "../public/_nuxt/DhY3wEbg.js"
  },
  "/_nuxt/DhY3wEbg.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"239-1gq62hacrv8RBxcsaa6MrX/lC0E\"",
    "mtime": "2026-10-18T08:18:16.586Z",
    "size": 569,
    "path": "../public/_nuxt/DhY3wEbg.js.br"
  },
  "/_nuxt/DhY3wEbg.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"292-IzaKKRAwel0Meel8F7yFe4mRtZc\"",
    "mtime": "2026-10-18T08:18:16.586Z",
    "size": 658,
    "path": "../public/_nuxt/DhY3wEbg.js.gz"
  },
  "/_nuxt/DhpxrMdH.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"97b-ooQPpk3hph9SYhu7SGcOthEMrXI\"",
    "mtime": "2026-10-18T08:18:16.586Z",
    "size": 2427,
    "path": "../public/_nuxt/DhpxrMdH.js.br"
  },
  "/_nuxt/DhpxrMdH.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1a5d-VOdwbeof4eyM/366LdCPUgOYlpo\"",
    "mtime": "2026-10-18T08:18:16.213Z",
    "size": 6749,
    "path": "../public/_nuxt/DhpxrMdH.js"
  },
  "/_nuxt/DhpxrMdH.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"aa4-O/DwsQRz56lNo38U1as8O9IHB+c\"",
    "mtime": "2026-10-18T08:18:16.586Z",
    "size": 2724,
    "path": "../public/_nuxt/DhpxrMdH.js.gz"
  },
  "/_nuxt/DihLQwbq.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1385-nkL4dfQ6kNmxlyzin3pVzg455Kc\"",
    "mtime": "2026-10-18T08:18:16.214Z",
    "size": 4997,
    "path": "../public/_nuxt/DihLQwbq.js"
  },
  "/_nuxt/DihLQwbq.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"8e7-mqCvehvnRKSmKnzuIR9/Xt0H+WU\"",
    "mtime": "2026-10-18T08:18:16.586Z",
    "size": 2279,
    "path": "../public/_nuxt/DihLQwbq.js.gz"
  },
  "/_nuxt/DjVRmSJj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"37d-z0QmMqyoxxyWqqQP5L1WjgI7LkE\"",
    "mtime": "2026-10-18T08:18:16.214Z",
    "size": 893,
    "path": "../public/_nuxt/DjVRmSJj.js"
  },
  "/_nuxt/Djs73B0W.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"83b-crk5ANsKv8ROmlAf1Hxz5J50ADE\"",
    "mtime": "2026-10-18T08:18:16.213Z",
    "size": 2107,
    "path": "../public/_nuxt/Djs73B0W.js"
  },
  "/_nuxt/DihLQwbq.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"7e3-mrcwFBKMWDCmafx7WUV9BPmBYrk\"",
    "mtime": "2026-10-18T08:18:16.587Z",
    "size": 2019,
    "path": "../public/_nuxt/DihLQwbq.js.br"
  },
  "/_nuxt/Djs73B0W.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3a3-G8GM4av3tC/73r5arfXT/Y4JHS4\"",
    "mtime": "2026-10-18T08:18:16.613Z",
    "size": 931,
    "path": "../public/_nuxt/Djs73B0W.js.br"
  },
  "/_nuxt/Djs73B0W.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"43f-EjgdjxoF875tbaEYGPq5J9FZ2WY\"",
    "mtime": "2026-10-18T08:18:16.613Z",
    "size": 1087,
    "path": "../public/_nuxt/Djs73B0W.js.gz"
  },
  "/_nuxt/Dl8n9tnb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"167-xAVgUqvym7KpTZaPEYj6e1QxMR4\"",
    "mtime": "2026-10-18T08:18:16.214Z",
    "size": 359,
    "path": "../public/_nuxt/Dl8n9tnb.js"
  },
  "/_nuxt/DlAUqK2U.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5b-eFCz/UrraTh721pgAl0VxBNR1es\"",
    "mtime": "2026-10-18T08:18:16.214Z",
    "size": 91,
    "path": "../public/_nuxt/DlAUqK2U.js"
  },
  "/_nuxt/Dn-0zur-.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"37c03-febRYFeLDR3IBV2xY2+wT7j54+A\"",
    "mtime": "2026-10-18T08:18:16.220Z",
    "size": 228355,
    "path": "../public/_nuxt/Dn-0zur-.js"
  },
  "/_nuxt/Dn-0zur-.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"92e4-OU+V06SHLnN8beGlyzpHTAwSTcM\"",
    "mtime": "2026-10-18T08:18:17.189Z",
    "size": 37604,
    "path": "../public/_nuxt/Dn-0zur-.js.br"
  },
  "/_nuxt/Dn-0zur-.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"bc60-0BfDuY510y/N04ntXDvCh+dQCWM\"",
    "mtime": "2026-10-18T08:18:16.700Z",
    "size": 48224,
    "path": "../public/_nuxt/Dn-0zur-.js.gz"
  },
  "/_nuxt/DqPfbvDK.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"6cd-y54qiH7pPit05ht9TAwNzfZJge8\"",
    "mtime": "2026-10-18T08:18:16.215Z",
    "size": 1741,
    "path": "../public/_nuxt/DqPfbvDK.js"
  },
  "/_nuxt/DqPfbvDK.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"345-HgHJZ4GtGEJ44OIOUBQtjZ5MlcY\"",
    "mtime": "2026-10-18T08:18:16.700Z",
    "size": 837,
    "path": "../public/_nuxt/DqPfbvDK.js.br"
  },
  "/_nuxt/DqPfbvDK.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3c8-uxN5XEgXb/Zq+fGBMwzWpqAfbK8\"",
    "mtime": "2026-10-18T08:18:16.700Z",
    "size": 968,
    "path": "../public/_nuxt/DqPfbvDK.js.gz"
  },
  "/_nuxt/DqnVBJMF.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"83f-NWFduRwcBGCBBB8YqtLd1dIExm8\"",
    "mtime": "2026-10-18T08:18:16.215Z",
    "size": 2111,
    "path": "../public/_nuxt/DqnVBJMF.js"
  },
  "/_nuxt/DqnVBJMF.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3cf-IBXriL6QJR8iCS4RRfwSQHJH+cA\"",
    "mtime": "2026-10-18T08:18:16.701Z",
    "size": 975,
    "path": "../public/_nuxt/DqnVBJMF.js.br"
  },
  "/_nuxt/DqnVBJMF.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"45a-NfT1HeRLVKOgSn5J2Ur1zN2cgMo\"",
    "mtime": "2026-10-18T08:18:16.701Z",
    "size": 1114,
    "path": "../public/_nuxt/DqnVBJMF.js.gz"
  },
  "/_nuxt/DqtJJwgW.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"58d3-OHtuuwgZRkcihMoCbTvY/Y7qCnM\"",
    "mtime": "2026-10-18T08:18:16.218Z",
    "size": 22739,
    "path": "../public/_nuxt/DqtJJwgW.js"
  },
  "/_nuxt/DqtJJwgW.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"175a-6BpUpC8O9hN7IQN80Xb6/M33OBs\"",
    "mtime": "2026-10-18T08:18:16.701Z",
    "size": 5978,
    "path": "../public/_nuxt/DqtJJwgW.js.br"
  },
  "/_nuxt/Drs0Mwp8.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1127-Byg5rY/hPnUuEVGO/kgrJBNw00k\"",
    "mtime": "2026-10-18T08:18:16.219Z",
    "size": 4391,
    "path": "../public/_nuxt/Drs0Mwp8.js"
  },
  "/_nuxt/Drs0Mwp8.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"76b-boxbqisWQhSYrJLNv7PsIiskUdk\"",
    "mtime": "2026-10-18T08:18:16.701Z",
    "size": 1899,
    "path": "../public/_nuxt/Drs0Mwp8.js.gz"
  },
  "/_nuxt/Drs0Mwp8.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"68b-R0XFNMNeLg1WCcvU0gx7TedYobk\"",
    "mtime": "2026-10-18T08:18:16.701Z",
    "size": 1675,
    "path": "../public/_nuxt/Drs0Mwp8.js.br"
  },
  "/_nuxt/DuOeM4OJ.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"70e-dqIzZnLMzHHAljnPilVREALRN1o\"",
    "mtime": "2026-10-18T08:18:16.216Z",
    "size": 1806,
    "path": "../public/_nuxt/DuOeM4OJ.js"
  },
  "/_nuxt/DuOeM4OJ.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"33d-s4GBTlSFzYzb58Ycx/0BpbD90/4\"",
    "mtime": "2026-10-18T08:18:16.701Z",
    "size": 829,
    "path": "../public/_nuxt/DuOeM4OJ.js.br"
  },
  "/_nuxt/DuOeM4OJ.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3a0-N869KvUxJ1GLWIKzgVviC8+sgMg\"",
    "mtime": "2026-10-18T08:18:16.701Z",
    "size": 928,
    "path": "../public/_nuxt/DuOeM4OJ.js.gz"
  },
  "/_nuxt/DqtJJwgW.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1ab6-8nbK+wiTOGxJVukwP/mTeBkUmwc\"",
    "mtime": "2026-10-18T08:18:16.701Z",
    "size": 6838,
    "path": "../public/_nuxt/DqtJJwgW.js.gz"
  },
  "/_nuxt/DxufAida.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"8fa-TodqBjFDkyD3ZeADT2IOIM135wo\"",
    "mtime": "2026-10-18T08:18:16.709Z",
    "size": 2298,
    "path": "../public/_nuxt/DxufAida.js.br"
  },
  "/_nuxt/DxufAida.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"9d9-R4xT7OQO7WRM7eusCNToPTW+qvM\"",
    "mtime": "2026-10-18T08:18:16.709Z",
    "size": 2521,
    "path": "../public/_nuxt/DxufAida.js.gz"
  },
  "/_nuxt/DxufAida.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"16da-7KyARpzM5sBvNWPhmMFAr5fHxeg\"",
    "mtime": "2026-10-18T08:18:16.217Z",
    "size": 5850,
    "path": "../public/_nuxt/DxufAida.js"
  },
  "/_nuxt/Dz9EDzBv.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2dd5-LNPWArHtyRz9eyVbzuFCvOhWcts\"",
    "mtime": "2026-10-18T08:18:16.218Z",
    "size": 11733,
    "path": "../public/_nuxt/Dz9EDzBv.js"
  },
  "/_nuxt/Dz9EDzBv.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"fc8-+rashbYiPDsKELbqKQDR9H0wR1U\"",
    "mtime": "2026-10-18T08:18:16.802Z",
    "size": 4040,
    "path": "../public/_nuxt/Dz9EDzBv.js.br"
  },
  "/_nuxt/Dz9EDzBv.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"11b4-Af/sF4iU13Gz1bPSMtiQtHn30KU\"",
    "mtime": "2026-10-18T08:18:16.802Z",
    "size": 4532,
    "path": "../public/_nuxt/Dz9EDzBv.js.gz"
  },
  "/_nuxt/Ekm3v8ad.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"41cf-c6OTz51X6NftUfSSipMIIO1yuKo\"",
    "mtime": "2026-10-18T08:18:16.218Z",
    "size": 16847,
    "path": "../public/_nuxt/Ekm3v8ad.js"
  },
  "/_nuxt/Ekm3v8ad.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"12b5-0foklVC69ueL5lvnwjGizuY4Q+k\"",
    "mtime": "2026-10-18T08:18:16.802Z",
    "size": 4789,
    "path": "../public/_nuxt/Ekm3v8ad.js.br"
  },
  "/_nuxt/Ekm3v8ad.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1504-2yLUySpqRpUGbK/bZKxohFbcnWw\"",
    "mtime": "2026-10-18T08:18:16.802Z",
    "size": 5380,
    "path": "../public/_nuxt/Ekm3v8ad.js.gz"
  },
  "/_nuxt/GeZk9d5-.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1a89-Z5bM6p9Ccie8QXhJGEoZ1uZpHmY\"",
    "mtime": "2026-10-18T08:18:16.218Z",
    "size": 6793,
    "path": "../public/_nuxt/GeZk9d5-.js"
  },
  "/_nuxt/GeZk9d5-.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"952-NYAj5L44ZZPJWKPkusbABBpYE/Q\"",
    "mtime": "2026-10-18T08:18:16.803Z",
    "size": 2386,
    "path": "../public/_nuxt/GeZk9d5-.js.br"
  },
  "/_nuxt/GeZk9d5-.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a7a-YJQu6a6yl3fZ8EB5FgHkq0Z90P4\"",
    "mtime": "2026-10-18T08:18:16.802Z",
    "size": 2682,
    "path": "../public/_nuxt/GeZk9d5-.js.gz"
  },
  "/_nuxt/GsVKBRsA.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"26ec-vmWAy2ORFKNkC9MvpZ53Ezs4RYk\"",
    "mtime": "2026-10-18T08:18:16.220Z",
    "size": 9964,
    "path": "../public/_nuxt/GsVKBRsA.js"
  },
  "/_nuxt/GsVKBRsA.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"cc1-WZuUbmUikH4Dvvt4FrSAbxsCrfk\"",
    "mtime": "2026-10-18T08:18:16.807Z",
    "size": 3265,
    "path": "../public/_nuxt/GsVKBRsA.js.br"
  },
  "/_nuxt/GsVKBRsA.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"e3e-QrPsIiFWSzlytptfE9AL3LICnpE\"",
    "mtime": "2026-10-18T08:18:16.807Z",
    "size": 3646,
    "path": "../public/_nuxt/GsVKBRsA.js.gz"
  },
  "/_nuxt/IJ1IrPte.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"2d18-atgoKyH/Y1AfbAhkGjE5QWag+Fg\"",
    "mtime": "2026-10-18T08:18:16.218Z",
    "size": 11544,
    "path": "../public/_nuxt/IJ1IrPte.js"
  },
  "/_nuxt/IJ1IrPte.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"dea-fwHSTcDGqHe9ROrVlfBPh+UfWQU\"",
    "mtime": "2026-10-18T08:18:16.807Z",
    "size": 3562,
    "path": "../public/_nuxt/IJ1IrPte.js.br"
  },
  "/_nuxt/IJ1IrPte.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"f73-zeciho/OCdooQ1sDWMn3WXkV5Qk\"",
    "mtime": "2026-10-18T08:18:16.807Z",
    "size": 3955,
    "path": "../public/_nuxt/IJ1IrPte.js.gz"
  },
  "/_nuxt/IaoC9txH.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"6e8-AwC9/9gtGYFJaEHjxJokQE6zaWI\"",
    "mtime": "2026-10-18T08:18:16.220Z",
    "size": 1768,
    "path": "../public/_nuxt/IaoC9txH.js"
  },
  "/_nuxt/IaoC9txH.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3bb-8hl4/y2bIgdsdpo/z3sYc/20pq0\"",
    "mtime": "2026-10-18T08:18:16.807Z",
    "size": 955,
    "path": "../public/_nuxt/IaoC9txH.js.gz"
  },
  "/_nuxt/IaoC9txH.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"351-mriRXv5TKXTF+wpNgKRFu+51oLg\"",
    "mtime": "2026-10-18T08:18:16.807Z",
    "size": 849,
    "path": "../public/_nuxt/IaoC9txH.js.br"
  },
  "/_nuxt/K67Zrf1_.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1931-Ml1QXalQY1DVelS50MCBFWCemf8\"",
    "mtime": "2026-10-18T08:18:16.219Z",
    "size": 6449,
    "path": "../public/_nuxt/K67Zrf1_.js"
  },
  "/_nuxt/K67Zrf1_.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"8bf-llbFk7VIh2Hohh4QD7vKhSyHITg\"",
    "mtime": "2026-10-18T08:18:16.814Z",
    "size": 2239,
    "path": "../public/_nuxt/K67Zrf1_.js.br"
  },
  "/_nuxt/KoZkAB_I.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"12ff-NgQ5Y2M9dp0oi3Au73SqmlZ5aTw\"",
    "mtime": "2026-10-18T08:18:16.220Z",
    "size": 4863,
    "path": "../public/_nuxt/KoZkAB_I.js"
  },
  "/_nuxt/KoZkAB_I.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"7c1-iMrZnkhZ2NvfgI6z+35IbOe/u04\"",
    "mtime": "2026-10-18T08:18:16.836Z",
    "size": 1985,
    "path": "../public/_nuxt/KoZkAB_I.js.gz"
  },
  "/_nuxt/MfVSjrJR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"32e-stLWikfyjDmKJpIpZfPGHsB9GBY\"",
    "mtime": "2026-10-18T08:18:16.220Z",
    "size": 814,
    "path": "../public/_nuxt/MfVSjrJR.js"
  },
  "/_nuxt/KoZkAB_I.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"703-5FCD4i7qW9b550+0Axcfyjm9Jes\"",
    "mtime": "2026-10-18T08:18:16.836Z",
    "size": 1795,
    "path": "../public/_nuxt/KoZkAB_I.js.br"
  },
  "/_nuxt/K67Zrf1_.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"9e4-qXrgx7Ygz/XOBfD8PsfZdMh/4Ek\"",
    "mtime": "2026-10-18T08:18:16.814Z",
    "size": 2532,
    "path": "../public/_nuxt/K67Zrf1_.js.gz"
  },
  "/_nuxt/OBYn6Gnc.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"27c-leQY8QjFalCj2uR0k0xPCfqJf2g\"",
    "mtime": "2026-10-18T08:18:16.837Z",
    "size": 636,
    "path": "../public/_nuxt/OBYn6Gnc.js.br"
  },
  "/_nuxt/OBYn6Gnc.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2b2-TMptF39Oioi6dyRCc/eWfUTj7cU\"",
    "mtime": "2026-10-18T08:18:16.836Z",
    "size": 690,
    "path": "../public/_nuxt/OBYn6Gnc.js.gz"
  },
  "/_nuxt/OBYn6Gnc.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"533-vwEDvNmpHbIea2Dx8TSXM32i3m0\"",
    "mtime": "2026-10-18T08:18:16.220Z",
    "size": 1331,
    "path": "../public/_nuxt/OBYn6Gnc.js"
  },
  "/_nuxt/PeLkZ5gi.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"101c-ZOT9RarkiIjrVC2kvKxWJRfNMi4\"",
    "mtime": "2026-10-18T08:18:16.220Z",
    "size": 4124,
    "path": "../public/_nuxt/PeLkZ5gi.js"
  },
  "/_nuxt/PeLkZ5gi.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"566-nuNencakjbjiyOYQ8FtROVDGoL8\"",
    "mtime": "2026-10-18T08:18:16.837Z",
    "size": 1382,
    "path": "../public/_nuxt/PeLkZ5gi.js.br"
  },
  "/_nuxt/PeLkZ5gi.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"62f-vZchPKODmrxSApPoZ7JTGTUtBvc\"",
    "mtime": "2026-10-18T08:18:16.837Z",
    "size": 1583,
    "path": "../public/_nuxt/PeLkZ5gi.js.gz"
  },
  "/_nuxt/QpbSpA-G.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"7c4-kGTp2M8QAGFpPVgLJvYIpKUseu8\"",
    "mtime": "2026-10-18T08:18:16.220Z",
    "size": 1988,
    "path": "../public/_nuxt/QpbSpA-G.js"
  },
  "/_nuxt/QpbSpA-G.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"390-t6dbGzlLszU/UQFG3ZJ0pIyS5Wg\"",
    "mtime": "2026-10-18T08:18:16.837Z",
    "size": 912,
    "path": "../public/_nuxt/QpbSpA-G.js.br"
  },
  "/_nuxt/QpbSpA-G.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"415-nG0cBj/mfRr+q9BKAxsta2qSbOY\"",
    "mtime": "2026-10-18T08:18:16.837Z",
    "size": 1045,
    "path": "../public/_nuxt/QpbSpA-G.js.gz"
  },
  "/_nuxt/TX-cH3Cm.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"f7a-ici5gzE04aN5uQ2/Pon7eUn5XwU\"",
    "mtime": "2026-10-18T08:18:16.998Z",
    "size": 3962,
    "path": "../public/_nuxt/TX-cH3Cm.js.br"
  },
  "/_nuxt/TX-cH3Cm.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"34b2-KU8+wSOv0RDH7dxQhs+ygp8ejR4\"",
    "mtime": "2026-10-18T08:18:16.220Z",
    "size": 13490,
    "path": "../public/_nuxt/TX-cH3Cm.js"
  },
  "/_nuxt/TX-cH3Cm.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1162-EuNtezhs4euI1Jf1yBmHWfTOiFo\"",
    "mtime": "2026-10-18T08:18:16.837Z",
    "size": 4450,
    "path": "../public/_nuxt/TX-cH3Cm.js.gz"
  },
  "/_nuxt/VgnkwQEI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24a-IU9XIt+NmrFZVrls1dDOPZqLEL4\"",
    "mtime": "2026-10-18T08:18:16.221Z",
    "size": 586,
    "path": "../public/_nuxt/VgnkwQEI.js"
  },
  "/_nuxt/WTorUhbX.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"64b-wlb0Vf3hAUBF6v1HQSXLVBGShCs\"",
    "mtime": "2026-10-18T08:18:16.916Z",
    "size": 1611,
    "path": "../public/_nuxt/WTorUhbX.js.br"
  },
  "/_nuxt/WTorUhbX.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"712-Qo4fHbAol+o5c97FW8yp3ef+GwA\"",
    "mtime": "2026-10-18T08:18:16.916Z",
    "size": 1810,
    "path": "../public/_nuxt/WTorUhbX.js.gz"
  },
  "/_nuxt/XcN4mYZJ.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"839-KzGH/SDpxPgcKTQjYB11jbGMz6Q\"",
    "mtime": "2026-10-18T08:18:16.221Z",
    "size": 2105,
    "path": "../public/_nuxt/XcN4mYZJ.js"
  },
  "/_nuxt/XcN4mYZJ.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3c6-d7lvCiaLFdWoYzczPSSp+X/stZQ\"",
    "mtime": "2026-10-18T08:18:16.990Z",
    "size": 966,
    "path": "../public/_nuxt/XcN4mYZJ.js.br"
  },
  "/_nuxt/XcN4mYZJ.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"441-gn3RoAVMMP+FfhamLJ333QBEBeA\"",
    "mtime": "2026-10-18T08:18:16.990Z",
    "size": 1089,
    "path": "../public/_nuxt/XcN4mYZJ.js.gz"
  },
  "/_nuxt/_HU8DnQu.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1bba-YS0FW+e1uogP1/aZwA+C74WQCxk\"",
    "mtime": "2026-10-18T08:18:16.221Z",
    "size": 7098,
    "path": "../public/_nuxt/_HU8DnQu.js"
  },
  "/_nuxt/_HU8DnQu.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"91b-M2iXEcW2oHgLAE/bNF7fiOe9/Js\"",
    "mtime": "2026-10-18T08:18:16.999Z",
    "size": 2331,
    "path": "../public/_nuxt/_HU8DnQu.js.br"
  },
  "/_nuxt/_HU8DnQu.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a53-qzqABl7aZsfwP4592fISmoyNdMA\"",
    "mtime": "2026-10-18T08:18:16.998Z",
    "size": 2643,
    "path": "../public/_nuxt/_HU8DnQu.js.gz"
  },
  "/_nuxt/WTorUhbX.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1171-5qq0bqfAoYTGTDo+4Ciywz96KG8\"",
    "mtime": "2026-10-18T08:18:16.221Z",
    "size": 4465,
    "path": "../public/_nuxt/WTorUhbX.js"
  },
  "/_nuxt/a3EfQ56u.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"13c3-eV+ku0KpAkTa0o60CW60cTN5Hik\"",
    "mtime": "2026-10-18T08:18:16.221Z",
    "size": 5059,
    "path": "../public/_nuxt/a3EfQ56u.js"
  },
  "/_nuxt/a3EfQ56u.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"70f-FkhMukToVatpZVfd+s5FPgWctZo\"",
    "mtime": "2026-10-18T08:18:17.008Z",
    "size": 1807,
    "path": "../public/_nuxt/a3EfQ56u.js.br"
  },
  "/_nuxt/a3EfQ56u.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"7f9-bFLuTvdOp2Ll/aUXVv/aubYuY28\"",
    "mtime": "2026-10-18T08:18:16.998Z",
    "size": 2041,
    "path": "../public/_nuxt/a3EfQ56u.js.gz"
  },
  "/_nuxt/bcESWAC_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"291-T1yVU8nlzAmGSBtZ1TXAnYK0Ex0\"",
    "mtime": "2026-10-18T08:18:16.221Z",
    "size": 657,
    "path": "../public/_nuxt/bcESWAC_.js"
  },
  "/_nuxt/cWYdV2dS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ee-8x3Hai9rGqjiZ0TImlKt9smRoVE\"",
    "mtime": "2026-10-18T08:18:16.221Z",
    "size": 494,
    "path": "../public/_nuxt/cWYdV2dS.js"
  },
  "/_nuxt/cz41DFi8.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"512-5/IKV/QvjmmDHrD/jrcxTjkIXBg\"",
    "mtime": "2026-10-18T08:18:16.221Z",
    "size": 1298,
    "path": "../public/_nuxt/cz41DFi8.js"
  },
  "/_nuxt/cz41DFi8.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"27b-ksLtPQ2LibrJcP+dWC7BAslYGNo\"",
    "mtime": "2026-10-18T08:18:16.999Z",
    "size": 635,
    "path": "../public/_nuxt/cz41DFi8.js.br"
  },
  "/_nuxt/cz41DFi8.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2cb-WbwNNFlMbenIpmclU231lLxC7Dk\"",
    "mtime": "2026-10-18T08:18:16.999Z",
    "size": 715,
    "path": "../public/_nuxt/cz41DFi8.js.gz"
  },
  "/_nuxt/d45PJy89.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"233-kibcPolUO3s+fGIwChuhB5GFhbo\"",
    "mtime": "2026-10-18T08:18:16.222Z",
    "size": 563,
    "path": "../public/_nuxt/d45PJy89.js"
  },
  "/_nuxt/gI981IL_.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1a28-dTpz/DhPS6YY+d9vfSTvoadbkQw\"",
    "mtime": "2026-10-18T08:18:16.222Z",
    "size": 6696,
    "path": "../public/_nuxt/gI981IL_.js"
  },
  "/_nuxt/gI981IL_.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"8e2-m16qdQTvfW4Ya6PFUYnPSFeWPvU\"",
    "mtime": "2026-10-18T08:18:17.015Z",
    "size": 2274,
    "path": "../public/_nuxt/gI981IL_.js.br"
  },
  "/_nuxt/gI981IL_.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"9d2-DyG7BMILCqgpTcmy3rVcjmfv2AQ\"",
    "mtime": "2026-10-18T08:18:17.008Z",
    "size": 2514,
    "path": "../public/_nuxt/gI981IL_.js.gz"
  },
  "/_nuxt/gR7gVh6c.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"907-9+Iz6xHiVSZ/VNFnWeKVLIT2cvc\"",
    "mtime": "2026-10-18T08:18:16.222Z",
    "size": 2311,
    "path": "../public/_nuxt/gR7gVh6c.js"
  },
  "/_nuxt/gR7gVh6c.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3ba-WUjh+tvkmNdRPZ0PpnM5wCIXF2I\"",
    "mtime": "2026-10-18T08:18:17.008Z",
    "size": 954,
    "path": "../public/_nuxt/gR7gVh6c.js.br"
  },
  "/_nuxt/gR7gVh6c.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"441-LPrlBN2eyAS5Nj31zHaQGfsGyBE\"",
    "mtime": "2026-10-18T08:18:17.008Z",
    "size": 1089,
    "path": "../public/_nuxt/gR7gVh6c.js.gz"
  },
  "/_nuxt/gZ9g5p83.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"151a-66Nu0CGU7LRMdz//1ys3Bqdn5EY\"",
    "mtime": "2026-10-18T08:18:16.222Z",
    "size": 5402,
    "path": "../public/_nuxt/gZ9g5p83.js"
  },
  "/_nuxt/gZ9g5p83.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"78d-LtJ5cl1QDd9RvkRouqjaZWhX6rY\"",
    "mtime": "2026-10-18T08:18:17.021Z",
    "size": 1933,
    "path": "../public/_nuxt/gZ9g5p83.js.br"
  },
  "/_nuxt/gZ9g5p83.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"877-a8bS40qEK9hjQGrlqG07X92znTI\"",
    "mtime": "2026-10-18T08:18:17.015Z",
    "size": 2167,
    "path": "../public/_nuxt/gZ9g5p83.js.gz"
  },
  "/_nuxt/ibm-plex-sans-arabic-arabic-400-normal.CyU-ddYS.woff2": {
    "type": "font/woff2",
    "etag": "\"a760-qc79yuVGdiEf5CknV05MAToa9Tg\"",
    "mtime": "2026-10-18T08:18:16.222Z",
    "size": 42848,
    "path": "../public/_nuxt/ibm-plex-sans-arabic-arabic-400-normal.CyU-ddYS.woff2"
  },
  "/_nuxt/ibm-plex-sans-arabic-arabic-400-normal.EA1o-u_Q.woff": {
    "type": "font/woff",
    "etag": "\"ac68-PYHeOt9kVOx1Z39lMxFLxgTp+sI\"",
    "mtime": "2026-10-18T08:18:16.222Z",
    "size": 44136,
    "path": "../public/_nuxt/ibm-plex-sans-arabic-arabic-400-normal.EA1o-u_Q.woff"
  },
  "/_nuxt/ibm-plex-sans-arabic-arabic-500-normal.C4MQITzh.woff2": {
    "type": "font/woff2",
    "etag": "\"b0f0-McuXkrH5gUmNoh1sPeVnFCxrKh4\"",
    "mtime": "2026-10-18T08:18:16.222Z",
    "size": 45296,
    "path": "../public/_nuxt/ibm-plex-sans-arabic-arabic-500-normal.C4MQITzh.woff2"
  },
  "/_nuxt/ibm-plex-sans-arabic-arabic-500-normal.DPXcppbm.woff": {
    "type": "font/woff",
    "etag": "\"b74c-b2T4FOWCziKDmZakhZwBObvTodk\"",
    "mtime": "2026-10-18T08:18:16.222Z",
    "size": 46924,
    "path": "../public/_nuxt/ibm-plex-sans-arabic-arabic-500-normal.DPXcppbm.woff"
  },
  "/_nuxt/ibm-plex-sans-arabic-arabic-700-normal.DrtBj6UE.woff2": {
    "type": "font/woff2",
    "etag": "\"acf8-J3ZduvJP84++aWrMS7GDuwKRAmQ\"",
    "mtime": "2026-10-18T08:18:16.223Z",
    "size": 44280,
    "path": "../public/_nuxt/ibm-plex-sans-arabic-arabic-700-normal.DrtBj6UE.woff2"
  },
  "/_nuxt/ibm-plex-sans-arabic-arabic-700-normal.9rXc6cUL.woff": {
    "type": "font/woff",
    "etag": "\"ad4c-BTFP9si7fMNFn9NpJBpsAamVIwI\"",
    "mtime": "2026-10-18T08:18:16.223Z",
    "size": 44364,
    "path": "../public/_nuxt/ibm-plex-sans-arabic-arabic-700-normal.9rXc6cUL.woff"
  },
  "/_nuxt/inter-latin-400-normal.C38fXH4l.woff2": {
    "type": "font/woff2",
    "etag": "\"5c70-aPZFxrb/EuJcVLE9TtEZ5jHcuyY\"",
    "mtime": "2026-10-18T08:18:16.223Z",
    "size": 23664,
    "path": "../public/_nuxt/inter-latin-400-normal.C38fXH4l.woff2"
  },
  "/_nuxt/inter-latin-500-normal.BL9OpVg8.woff": {
    "type": "font/woff",
    "etag": "\"7a34-RiJoWDij89wbmUrQ9vApTdR9iMs\"",
    "mtime": "2026-10-18T08:18:16.223Z",
    "size": 31284,
    "path": "../public/_nuxt/inter-latin-500-normal.BL9OpVg8.woff"
  },
  "/_nuxt/inter-latin-500-normal.Cerq10X2.woff2": {
    "type": "font/woff2",
    "etag": "\"5ed0-a2bHQb+Lw84kivBLIFGmSKODkdY\"",
    "mtime": "2026-10-18T08:18:16.223Z",
    "size": 24272,
    "path": "../public/_nuxt/inter-latin-500-normal.Cerq10X2.woff2"
  },
  "/_nuxt/inter-latin-400-normal.CyCys3Eg.woff": {
    "type": "font/woff",
    "etag": "\"77e8-SbvLwKxssThdk7eEO6Aafq1EDIA\"",
    "mtime": "2026-10-18T08:18:16.223Z",
    "size": 30696,
    "path": "../public/_nuxt/inter-latin-400-normal.CyCys3Eg.woff"
  },
  "/_nuxt/inter-latin-600-normal.LgqL8muc.woff2": {
    "type": "font/woff2",
    "etag": "\"5f84-4NYfbcUR1koHKy9NyU4VXs8btvY\"",
    "mtime": "2026-10-18T08:18:16.224Z",
    "size": 24452,
    "path": "../public/_nuxt/inter-latin-600-normal.LgqL8muc.woff2"
  },
  "/_nuxt/inter-latin-600-normal.CiBQ2DWP.woff": {
    "type": "font/woff",
    "etag": "\"7a1c-7yTNkhBBRpiqSdmpUeo8hP6GAv8\"",
    "mtime": "2026-10-18T08:18:16.223Z",
    "size": 31260,
    "path": "../public/_nuxt/inter-latin-600-normal.CiBQ2DWP.woff"
  },
  "/_nuxt/inter-latin-700-normal.BLAVimhd.woff": {
    "type": "font/woff",
    "etag": "\"7a58-cQvU1F9kXU/ZpvVIy7T98mV4J+E\"",
    "mtime": "2026-10-18T08:18:16.226Z",
    "size": 31320,
    "path": "../public/_nuxt/inter-latin-700-normal.BLAVimhd.woff"
  },
  "/_nuxt/inter-latin-700-normal.Yt3aPRUw.woff2": {
    "type": "font/woff2",
    "etag": "\"5f24-UZenrrIkVBEKofPvPtTJjKfvG6E\"",
    "mtime": "2026-10-18T08:18:16.225Z",
    "size": 24356,
    "path": "../public/_nuxt/inter-latin-700-normal.Yt3aPRUw.woff2"
  },
  "/_nuxt/inter-latin-ext-400-normal.77YHD8bZ.woff": {
    "type": "font/woff",
    "etag": "\"b9c8-Bhja6T6VCwLwb1wadgBSy3MfJBM\"",
    "mtime": "2026-10-18T08:18:16.227Z",
    "size": 47560,
    "path": "../public/_nuxt/inter-latin-ext-400-normal.77YHD8bZ.woff"
  },
  "/_nuxt/inter-latin-ext-400-normal.C1nco2VV.woff2": {
    "type": "font/woff2",
    "etag": "\"88b8-G/H4NxekwCldh2+r75P8W7SzF98\"",
    "mtime": "2026-10-18T08:18:16.226Z",
    "size": 35000,
    "path": "../public/_nuxt/inter-latin-ext-400-normal.C1nco2VV.woff2"
  },
  "/_nuxt/mmnQASJK.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"34e2-m8rm3kTb1BqCtebJRJNDakNGETo\"",
    "mtime": "2026-10-18T08:18:16.225Z",
    "size": 13538,
    "path": "../public/_nuxt/mmnQASJK.js"
  },
  "/_nuxt/mmnQASJK.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"11f9-am57tbsFn/3VgI7Wxhottfh+Y1Y\"",
    "mtime": "2026-10-18T08:18:17.050Z",
    "size": 4601,
    "path": "../public/_nuxt/mmnQASJK.js.br"
  },
  "/_nuxt/mmnQASJK.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"13e0-ILpWTkI3s0B9DzVP8BRnbVLQvLk\"",
    "mtime": "2026-10-18T08:18:17.021Z",
    "size": 5088,
    "path": "../public/_nuxt/mmnQASJK.js.gz"
  },
  "/_nuxt/my2fA6fy.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"14a6-7LkLEwgZwBde7WVo3VhCgryaAsA\"",
    "mtime": "2026-10-18T08:18:16.225Z",
    "size": 5286,
    "path": "../public/_nuxt/my2fA6fy.js"
  },
  "/_nuxt/my2fA6fy.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"77d-EB0dMNs4rXdpxVHdjrHIqca738g\"",
    "mtime": "2026-10-18T08:18:17.050Z",
    "size": 1917,
    "path": "../public/_nuxt/my2fA6fy.js.br"
  },
  "/_nuxt/my2fA6fy.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"855-Om31q33kz/wD/gv/Pg08SAEvrJE\"",
    "mtime": "2026-10-18T08:18:17.050Z",
    "size": 2133,
    "path": "../public/_nuxt/my2fA6fy.js.gz"
  },
  "/_nuxt/nWs8E7K5.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"446-q+9aZY1+U49W2mDioD8IuiYlO7c\"",
    "mtime": "2026-10-18T08:18:17.050Z",
    "size": 1094,
    "path": "../public/_nuxt/nWs8E7K5.js.br"
  },
  "/_nuxt/nWs8E7K5.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"8c2-6bsZx5QuHndA3zXee23PrTDuL6c\"",
    "mtime": "2026-10-18T08:18:16.226Z",
    "size": 2242,
    "path": "../public/_nuxt/nWs8E7K5.js"
  },
  "/_nuxt/nWs8E7K5.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4c1-YRFUwWCxH2VdJY8Ji6K6xKXtZhM\"",
    "mtime": "2026-10-18T08:18:17.050Z",
    "size": 1217,
    "path": "../public/_nuxt/nWs8E7K5.js.gz"
  },
  "/_nuxt/o-d6FpHK.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"f0a-qOFWvY8VJqC3TeG2fnx0uOu3HZQ\"",
    "mtime": "2026-10-18T08:18:16.227Z",
    "size": 3850,
    "path": "../public/_nuxt/o-d6FpHK.js"
  },
  "/_nuxt/o-d6FpHK.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5f0-6WBiN0fmMeo+Oq543ym5F2vhWgg\"",
    "mtime": "2026-10-18T08:18:17.050Z",
    "size": 1520,
    "path": "../public/_nuxt/o-d6FpHK.js.br"
  },
  "/_nuxt/o-d6FpHK.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"692-HflE6E/gAVnBH7nuPiJScQbnYfs\"",
    "mtime": "2026-10-18T08:18:17.050Z",
    "size": 1682,
    "path": "../public/_nuxt/o-d6FpHK.js.gz"
  },
  "/_nuxt/rA06ASx8.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"ca2-GV01oXwCJRfaidmayWILKAQMW2g\"",
    "mtime": "2026-10-18T08:18:16.227Z",
    "size": 3234,
    "path": "../public/_nuxt/rA06ASx8.js"
  },
  "/_nuxt/rA06ASx8.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"54c-4gE7DiKaMTwQvUX8Jro/PW5pEXE\"",
    "mtime": "2026-10-18T08:18:17.050Z",
    "size": 1356,
    "path": "../public/_nuxt/rA06ASx8.js.br"
  },
  "/_nuxt/rA06ASx8.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5f3-QFrBcEW2GJhU2XTfNdoJQGlnvBY\"",
    "mtime": "2026-10-18T08:18:17.050Z",
    "size": 1523,
    "path": "../public/_nuxt/rA06ASx8.js.gz"
  },
  "/_nuxt/sPLPtAt-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ed-ICI2IGIFIVcdgkNXsOSmu8mJqgE\"",
    "mtime": "2026-10-18T08:18:16.227Z",
    "size": 749,
    "path": "../public/_nuxt/sPLPtAt-.js"
  },
  "/_nuxt/srjbsazB.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"1c16-195vMQk+K9pXTNaaZNg2rkCGZRI\"",
    "mtime": "2026-10-18T08:18:16.227Z",
    "size": 7190,
    "path": "../public/_nuxt/srjbsazB.js"
  },
  "/_nuxt/srjbsazB.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"97a-H//YAoYtgSS0zrKbOkb69ojmsEs\"",
    "mtime": "2026-10-18T08:18:17.058Z",
    "size": 2426,
    "path": "../public/_nuxt/srjbsazB.js.br"
  },
  "/_nuxt/srjbsazB.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a93-QNXwyNEyvR2QclgfkGIa9MF7OXQ\"",
    "mtime": "2026-10-18T08:18:17.050Z",
    "size": 2707,
    "path": "../public/_nuxt/srjbsazB.js.gz"
  },
  "/_nuxt/ssPuCnCi.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"13df-GpfSiRKKEU3Fcid8zoeFKl7+/og\"",
    "mtime": "2026-10-18T08:18:16.228Z",
    "size": 5087,
    "path": "../public/_nuxt/ssPuCnCi.js"
  },
  "/_nuxt/ssPuCnCi.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"7ae-AgW//AhZBBtAIIphZq7TNTNjKOk\"",
    "mtime": "2026-10-18T08:18:17.059Z",
    "size": 1966,
    "path": "../public/_nuxt/ssPuCnCi.js.br"
  },
  "/_nuxt/ssPuCnCi.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"8a4-8F5od9ZDSwb/dQDv7ciyz/TmJjc\"",
    "mtime": "2026-10-18T08:18:17.057Z",
    "size": 2212,
    "path": "../public/_nuxt/ssPuCnCi.js.gz"
  },
  "/_nuxt/uVVQaGIN.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"169b-qioGcNHQJuo1+Ro1HCxH49kjPWk\"",
    "mtime": "2026-10-18T08:18:16.227Z",
    "size": 5787,
    "path": "../public/_nuxt/uVVQaGIN.js"
  },
  "/_nuxt/uVVQaGIN.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"7c9-L1G0V6GUoAeR5Yhrhbvk8QC3pak\"",
    "mtime": "2026-10-18T08:18:17.075Z",
    "size": 1993,
    "path": "../public/_nuxt/uVVQaGIN.js.br"
  },
  "/_nuxt/uVVQaGIN.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"8c4-f1XpgY2QrmEFUw2mV62icxeg7kY\"",
    "mtime": "2026-10-18T08:18:17.059Z",
    "size": 2244,
    "path": "../public/_nuxt/uVVQaGIN.js.gz"
  },
  "/_nuxt/uclWewKD.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"672-psCl0wGW+bKL8Q+zLuo+rEIAM/o\"",
    "mtime": "2026-10-18T08:18:16.228Z",
    "size": 1650,
    "path": "../public/_nuxt/uclWewKD.js"
  },
  "/_nuxt/uclWewKD.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2ec-UDc3gfaydNzyIOyvoYLX2B9C/Qw\"",
    "mtime": "2026-10-18T08:18:17.075Z",
    "size": 748,
    "path": "../public/_nuxt/uclWewKD.js.br"
  },
  "/_nuxt/uclWewKD.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"356-wpzJ2iCYyxQ6j1kUfW24bAeamzE\"",
    "mtime": "2026-10-18T08:18:17.075Z",
    "size": 854,
    "path": "../public/_nuxt/uclWewKD.js.gz"
  },
  "/_nuxt/ulHNQjPo.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"179f-3kF9G3LOIk99p29RLUU6VzKWMDk\"",
    "mtime": "2026-10-18T08:18:16.228Z",
    "size": 6047,
    "path": "../public/_nuxt/ulHNQjPo.js"
  },
  "/_nuxt/ulHNQjPo.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"83e-sEoS2g5IPXHNsvZ/lQj1CUXY5vU\"",
    "mtime": "2026-10-18T08:18:17.075Z",
    "size": 2110,
    "path": "../public/_nuxt/ulHNQjPo.js.br"
  },
  "/_nuxt/ulHNQjPo.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"949-aYQ8SdN9cZoQS/01y48kTrxxwKU\"",
    "mtime": "2026-10-18T08:18:17.075Z",
    "size": 2377,
    "path": "../public/_nuxt/ulHNQjPo.js.gz"
  },
  "/_nuxt/v4sBN_y2.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"19c3-ms13Udn0jM7aQeKA3zD8VUn5DxM\"",
    "mtime": "2026-10-18T08:18:16.228Z",
    "size": 6595,
    "path": "../public/_nuxt/v4sBN_y2.js"
  },
  "/_nuxt/v4sBN_y2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"8bf-zLkKx+k7B6tng/UzRfOp/9kQu8A\"",
    "mtime": "2026-10-18T08:18:17.089Z",
    "size": 2239,
    "path": "../public/_nuxt/v4sBN_y2.js.br"
  },
  "/_nuxt/v4sBN_y2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"9e0-bKAEutrxOeRTWHIBSDX7d0vR5bc\"",
    "mtime": "2026-10-18T08:18:17.075Z",
    "size": 2528,
    "path": "../public/_nuxt/v4sBN_y2.js.gz"
  },
  "/_nuxt/w-6GC2XJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"163-rbyw/UCaqdc2l6tqmJbJD8pC2oE\"",
    "mtime": "2026-10-18T08:18:16.228Z",
    "size": 355,
    "path": "../public/_nuxt/w-6GC2XJ.js"
  },
  "/_nuxt/x3DZY4Jn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ea-SqLXAJaGOuxzaihyUdVpK4B4TRY\"",
    "mtime": "2026-10-18T08:18:16.228Z",
    "size": 746,
    "path": "../public/_nuxt/x3DZY4Jn.js"
  },
  "/_nuxt/x9qR47Qt.js": {
    "type": "text/javascript; charset=utf-8",
    "encoding": null,
    "etag": "\"6df-8vHRgpr0X5l2j0sDNwysJw/R2Ng\"",
    "mtime": "2026-10-18T08:18:16.228Z",
    "size": 1759,
    "path": "../public/_nuxt/x9qR47Qt.js"
  },
  "/_nuxt/x9qR47Qt.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"35f-fG0AB6vu7PdgJ+3ywQFLxHyhcN4\"",
    "mtime": "2026-10-18T08:18:17.080Z",
    "size": 863,
    "path": "../public/_nuxt/x9qR47Qt.js.br"
  },
  "/_nuxt/x9qR47Qt.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3ca-rtgXARkeq6wbgFjLHSICitH0cJ4\"",
    "mtime": "2026-10-18T08:18:17.080Z",
    "size": 970,
    "path": "../public/_nuxt/x9qR47Qt.js.gz"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-m0n/jwx/dqXvkNNrmJh77nPJ4FE\"",
    "mtime": "2026-10-18T08:18:16.157Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
  },
  "/_nuxt/builds/meta/bcad80bf-796e-4e3c-b3c7-6a2822122ffd.json": {
    "type": "application/json",
    "etag": "\"58-DqDmUpPydXmIhVV0KeJGqMnmrIQ\"",
    "mtime": "2026-10-18T08:18:16.154Z",
    "size": 88,
    "path": "../public/_nuxt/builds/meta/bcad80bf-796e-4e3c-b3c7-6a2822122ffd.json"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1},"/_nuxt/":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _geGEi6 = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({ statusCode: 404 });
    }
    return;
  }
  if (asset.encoding !== void 0) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const TOKEN_COOKIE = "expa_token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 30;
const CHALLENGE_COOKIE = "expa_2fa";
const ALLOWED_METHODS = /* @__PURE__ */ new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);
const SEGMENT = /^[A-Za-z0-9._~-]+$/;
const BLOCKED_PREFIXES = ["auth/login", "auth/register", "auth/logout", "auth/verify-email", "auth/2fa/challenge"];
const MAX_BODY = 1e6;
const MAX_UPLOAD = 11 * 1024 * 1024;
const UPLOAD_PATH = /^(?:my-documents\/\d+\/attachments|documents\/explain|provider\/verification\/documents)$/;
const DOWNLOAD_PATH = /^(?:my-documents\/\d+\/attachments\/\d+|admin\/marketplace\/providers\/\d+\/evidence\/\d+)$/;
const BINARY_HEADERS = ["content-type", "content-disposition", "content-length", "x-content-type-options", "content-security-policy"];
const isUploadPath = (path) => UPLOAD_PATH.test(path);
const isDownloadPath = (path) => DOWNLOAD_PATH.test(path);
function errorResult(status, code, message) {
  return { status, body: { error: { code, message } }, headers: {} };
}
function normalizeBase(base) {
  return base.replace(/\/+$/, "");
}
function safePath(path) {
  const segs = path.split("/");
  if (!segs.length || segs.some((s) => s === "" || s === "." || s === ".." || !SEGMENT.test(s))) return null;
  return segs.join("/");
}
function isBlockedPath(path) {
  return BLOCKED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}
function originAllowed(origin, host, opts = {}) {
  var _a, _b;
  if (opts.fetchSite === "cross-site") return false;
  if (!origin) return true;
  try {
    const o = new URL(origin).host;
    const fwd = (_b = (_a = opts.forwardedHost) == null ? void 0 : _a.split(",")[0]) == null ? void 0 : _b.trim();
    return !!host && o === host || !!fwd && o === fwd;
  } catch {
    return false;
  }
}
const MAX_AUTH_BODY = 16e3;
async function readBody(res) {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
function passthroughHeaders(res) {
  const out = {};
  const retry = res.headers.get("retry-after");
  if (retry) out["retry-after"] = retry;
  return out;
}
async function send(opts, url, extra = {}) {
  var _a, _b, _c;
  const headers = { Accept: "application/json", "X-Client": "web" };
  if (opts.analyticsConsent) headers["X-Analytics-Consent"] = "granted";
  if (opts.lang) headers["Accept-Language"] = opts.lang;
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.clientIp) headers["X-Forwarded-For"] = opts.clientIp;
  if (opts.rawBody && opts.contentType) headers["Content-Type"] = opts.contentType;
  else if (opts.body) headers["Content-Type"] = "application/json";
  try {
    const res = await opts.fetcher(url, {
      method: opts.method,
      headers,
      body: (_a = opts.rawBody) != null ? _a : opts.body || void 0,
      redirect: "manual",
      signal: AbortSignal.timeout(opts.rawBody ? Math.max((_b = opts.timeoutMs) != null ? _b : 1e4, 3e4) : (_c = opts.timeoutMs) != null ? _c : 1e4),
      ...extra
    });
    return { res };
  } catch (e) {
    const name = e == null ? void 0 : e.name;
    if (name === "TimeoutError" || name === "AbortError") return { fail: errorResult(504, "upstream_timeout", "The service took too long to respond.") };
    return { fail: errorResult(502, "upstream_unavailable", "The service is unreachable.") };
  }
}
async function forwardRequest(opts) {
  var _a, _b;
  const method = opts.method.toUpperCase();
  if (!ALLOWED_METHODS.has(method)) return errorResult(405, "method_not_allowed", "Method not allowed.");
  const path = safePath(opts.path);
  if (!path) return errorResult(400, "bad_request", "Invalid path.");
  if (isBlockedPath(path)) return errorResult(404, "not_found", "Not found.");
  if (opts.body && opts.body.length > MAX_BODY) return errorResult(413, "payload_too_large", "Payload too large.");
  if (opts.rawBody) {
    if (method !== "POST" || !isUploadPath(path) || !/^multipart\/form-data;\s*boundary=/i.test((_a = opts.contentType) != null ? _a : "")) {
      return errorResult(415, "unsupported_media_type", "Unsupported content type.");
    }
    if (opts.rawBody.byteLength > MAX_UPLOAD) return errorResult(413, "payload_too_large", "Payload too large.");
  }
  const url = `${normalizeBase(opts.base)}/${path}${opts.search ? opts.search.startsWith("?") ? opts.search : `?${opts.search}` : ""}`;
  const sent = await send({ ...opts, method }, url);
  if ("fail" in sent) return sent.fail;
  const { res } = sent;
  const type = (_b = res.headers.get("content-type")) != null ? _b : "";
  if (method === "GET" && isDownloadPath(path) && res.ok && res.body && !/json/i.test(type)) {
    const headers = {};
    for (const h of BINARY_HEADERS) {
      const v = res.headers.get(h);
      if (v) headers[h] = v;
    }
    return { status: res.status, body: null, headers, stream: res.body };
  }
  const body = await readBody(res);
  const result = { status: res.status, body, headers: passthroughHeaders(res) };
  if (res.status === 401 && opts.token) result.clearToken = true;
  return result;
}
async function authenticate(opts, path) {
  var _a, _b, _c, _d;
  let payload;
  try {
    payload = JSON.parse(opts.body || "{}");
  } catch {
    return errorResult(400, "bad_request", "Invalid JSON.");
  }
  const body = JSON.stringify({ ...payload, device_name: "web" });
  const sent = await send({ ...opts, method: "POST", body, token: null }, `${normalizeBase(opts.base)}/${path}`);
  if ("fail" in sent) return sent.fail;
  const { res } = sent;
  const json = await readBody(res);
  const token = (_a = json == null ? void 0 : json.data) == null ? void 0 : _a.token;
  const d = json == null ? void 0 : json.data;
  if (path === "auth/login" && res.ok && (d == null ? void 0 : d.two_factor_required) === true) {
    if (typeof d.challenge_token !== "string" || !d.challenge_token) return errorResult(502, "upstream_unavailable", "Unexpected response from the service.");
    const ttl = Math.max(30, Math.min(900, Number(d.expires_in) || 300));
    return { status: 200, body: { data: { two_factor_required: true, expires_in: ttl }, meta: (_b = json == null ? void 0 : json.meta) != null ? _b : {} }, headers: {}, setChallenge: { token: d.challenge_token, maxAge: ttl } };
  }
  if (res.ok && typeof token === "string" && token) {
    return { status: res.status, body: { data: { user: (_c = json == null ? void 0 : json.data) == null ? void 0 : _c.user }, meta: (_d = json == null ? void 0 : json.meta) != null ? _d : {} }, headers: {}, setToken: token, clearChallenge: true };
  }
  if (res.ok) return errorResult(502, "upstream_unavailable", "Unexpected response from the service.");
  return { status: res.status, body: json, headers: passthroughHeaders(res) };
}
const login = (o) => authenticate(o, "auth/login");
const register = (o) => authenticate(o, "auth/register");
async function twoFactorChallenge(opts) {
  var _a, _b, _c, _d;
  let payload;
  try {
    payload = JSON.parse(opts.body || "{}");
  } catch {
    return errorResult(400, "bad_request", "Invalid JSON.");
  }
  if (!opts.challengeToken) return { ...errorResult(401, "invalid_challenge", "The sign-in attempt expired."), clearChallenge: true };
  const out = { challenge_token: opts.challengeToken };
  if (typeof payload.code === "string" && payload.code) out.code = payload.code;
  if (typeof payload.recovery_code === "string" && payload.recovery_code) out.recovery_code = payload.recovery_code;
  const sent = await send({ ...opts, method: "POST", body: JSON.stringify(out), token: null }, `${normalizeBase(opts.base)}/auth/2fa/challenge`);
  if ("fail" in sent) return sent.fail;
  const { res } = sent;
  const json = await readBody(res);
  const token = (_a = json == null ? void 0 : json.data) == null ? void 0 : _a.token;
  if (res.ok && typeof token === "string" && token) {
    return { status: 200, body: { data: { user: (_b = json == null ? void 0 : json.data) == null ? void 0 : _b.user, recovery_codes_remaining: (_c = json == null ? void 0 : json.data) == null ? void 0 : _c.recovery_codes_remaining }, meta: (_d = json == null ? void 0 : json.meta) != null ? _d : {} }, headers: {}, setToken: token, clearChallenge: true };
  }
  if (res.ok) return errorResult(502, "upstream_unavailable", "Unexpected response from the service.");
  const dead = res.status === 401 || res.status === 403;
  return { status: res.status, body: json, headers: passthroughHeaders(res), ...dead ? { clearChallenge: true } : {} };
}
async function logout(opts) {
  if (opts.token) {
    await send({ ...opts, method: "POST", path: "auth/logout", body: null }, `${normalizeBase(opts.base)}/auth/logout`);
  }
  return { status: 204, body: null, headers: {}, clearToken: true };
}
function isAllowedVerifyUrl(candidate, base) {
  let u;
  let b;
  try {
    u = new URL(candidate);
    b = new URL(normalizeBase(base));
  } catch {
    return false;
  }
  if (u.protocol !== b.protocol || u.host !== b.host || u.username || u.password) return false;
  const basePath = b.pathname.replace(/\/+$/, "");
  const re = new RegExp(`^${basePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/auth/verify-email/\\d+/[A-Fa-f0-9]{40}$`);
  return re.test(u.pathname);
}
async function verifyEmail(opts) {
  if (!isAllowedVerifyUrl(opts.url, opts.base)) {
    return errorResult(400, "invalid_verification_link", "The verification link is invalid.");
  }
  const sent = await send({ ...opts, method: "GET", path: "", body: null, token: null }, new URL(opts.url).toString());
  if ("fail" in sent) return sent.fail;
  const { res } = sent;
  return { status: res.status, body: await readBody(res), headers: passthroughHeaders(res) };
}

function resolveClientIp(socketIp, xForwardedFor, hops) {
  const clean = (v) => {
    const t = (v != null ? v : "").trim().replace(/^::ffff:/i, "");
    return /^[0-9A-Fa-f:.]{2,45}$/.test(t) ? t : null;
  };
  if (hops > 0 && xForwardedFor) {
    const parts = xForwardedFor.split(",").map((s) => s.trim()).filter(Boolean);
    const picked = clean(parts[Math.max(0, parts.length - hops)]);
    if (picked) return picked;
  }
  return clean(socketIp);
}

const _N1JFon = defineEventHandler((event) => {
  var _a;
  const cfg = useRuntimeConfig(event);
  const url = getRequestURL(event);
  if ((event.method === "GET" || event.method === "HEAD") && url.pathname.length > 1 && url.pathname.endsWith("/") && !url.pathname.startsWith("/api/")) {
    return sendRedirect(event, url.pathname.replace(/\/+$/, "") + url.search, 308);
  }
  if (!event.context.clientIp) {
    const socket = (_a = event.node.req.socket) == null ? void 0 : _a.remoteAddress;
    event.context.clientIp = resolveClientIp(socket, getRequestHeader(event, "x-forwarded-for"), Number(cfg.trustedProxyHops) || 0);
  }
  setResponseHeaders(event, securityHeaders({ hsts: cfg.security.hsts === true || String(cfg.security.hsts) === "true" }));
  if (getCookie(event, TOKEN_COOKIE)) {
    setResponseHeader(event, "cache-control", "private, no-store");
    setResponseHeader(event, "vary", "Cookie, Accept-Language");
  }
});

const _SxA8c9 = defineEventHandler(() => {});

const _lazy_K8KPZ9 = () => import('../routes/api/auth/login.post.mjs');
const _lazy_hX0opo = () => import('../routes/api/auth/logout.post.mjs');
const _lazy_uQw08e = () => import('../routes/api/auth/register.post.mjs');
const _lazy_zeePjy = () => import('../routes/api/auth/two-factor.post.mjs');
const _lazy_jeh0Gb = () => import('../routes/api/auth/verify-email.post.mjs');
const _lazy_O9__0Y = () => import('../routes/api/proxy/_...path_.mjs');
const _lazy_hleVXE = () => import('../routes/robots.txt.mjs');
const _lazy_UisopR = () => import('../routes/sitemap-ar.xml.mjs');
const _lazy_xBMOvA = () => import('../routes/sitemap-en.xml.mjs');
const _lazy_RQegsH = () => import('../routes/sitemap-it.xml.mjs');
const _lazy_TvN8nN = () => import('../routes/sitemap.xml.mjs');
const _lazy_PEe6Dk = () => import('../routes/renderer.mjs').then(function (n) { return n.r; });

const handlers = [
  { route: '', handler: _geGEi6, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _N1JFon, lazy: false, middleware: true, method: undefined },
  { route: '/api/auth/login', handler: _lazy_K8KPZ9, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/logout', handler: _lazy_hX0opo, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/register', handler: _lazy_uQw08e, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/two-factor', handler: _lazy_zeePjy, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/verify-email', handler: _lazy_jeh0Gb, lazy: true, middleware: false, method: "post" },
  { route: '/api/proxy/**:path', handler: _lazy_O9__0Y, lazy: true, middleware: false, method: undefined },
  { route: '/robots.txt', handler: _lazy_hleVXE, lazy: true, middleware: false, method: undefined },
  { route: '/sitemap-ar.xml', handler: _lazy_UisopR, lazy: true, middleware: false, method: undefined },
  { route: '/sitemap-en.xml', handler: _lazy_xBMOvA, lazy: true, middleware: false, method: undefined },
  { route: '/sitemap-it.xml', handler: _lazy_RQegsH, lazy: true, middleware: false, method: undefined },
  { route: '/sitemap.xml', handler: _lazy_TvN8nN, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_error', handler: _lazy_PEe6Dk, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_island/**', handler: _SxA8c9, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_PEe6Dk, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send$1(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send$1(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    debug("received shut down signal", signal);
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      debug("server shut down error occurred", error);
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    debug("Destroy Connections : " + (force ? "forced close" : "close"));
    let counter = 0;
    let secureCounter = 0;
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        counter++;
        destroy(socket);
      }
    }
    debug("Connections destroyed : " + counter);
    debug("Connection Counter    : " + connectionCounter);
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        secureCounter++;
        destroy(socket);
      }
    }
    debug("Secure Connections destroyed : " + secureCounter);
    debug("Secure Connection Counter    : " + secureConnectionCounter);
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
    debug("closed");
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      debug("Close http server");
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    debug("shutdown signal - " + sig);
    if (options.development) {
      debug("DEV-Mode - immediate forceful shutdown");
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          debug("executing finally()");
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      debug(`waitForReadyToShutDown... ${totalNumInterval}`);
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        debug("All connections closed. Continue to shutting down");
        return Promise.resolve(false);
      }
      debug("Schedule the next waitForReadyToShutdown");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    debug("shutting down");
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      debug("Do onShutdown now");
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      debug(errString);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

export { $fetch as $, defineCachedFunction as A, joinRelativeURL as B, CHALLENGE_COOKIE as C, encodePath as D, defineRenderHandler as E, getQuery as F, getRouteRules as G, getResponseStatusText as H, getResponseStatus as I, useNitroApp as J, klona as K, destr as L, MAX_AUTH_BODY as M, isEqual as N, sanitizeStatusCode as O, getContext as P, defu as Q, createHooks as R, getRequestProtocol as S, TOKEN_COOKIE as T, getRequestHeaders as U, executeAsync as V, nodeServer as W, logout as a, register as b, createError$1 as c, defineEventHandler as d, errorResult as e, readBody$1 as f, getMethod as g, getHeader as h, getRequestURL as i, getRouterParam as j, MAX_UPLOAD as k, login as l, forwardRequest as m, getRequestHeader as n, originAllowed as o, deleteCookie as p, setHeader as q, readRawBody as r, setCookie as s, twoFactorChallenge as t, setResponseStatus as u, verifyEmail as v, getCookie as w, useRuntimeConfig as x, TOKEN_MAX_AGE as y, setResponseHeader as z };
//# sourceMappingURL=nitro.mjs.map
