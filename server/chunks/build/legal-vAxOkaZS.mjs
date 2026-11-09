const LEGAL_SLUGS = ["privacy", "terms", "cookies"];
const SAFE_HREF = /^(https:\/\/|mailto:)[^\s]+$/i;
function parseInline(text) {
  const out = [];
  const re = new RegExp("\\*\\*([^*]+)\\*\\*|\\[([^\\]]+)\\]\\(([^)\\s]+)\\)|(?<![\\w*])[*_]([^*_]+)[*_](?![\\w*])", "g");
  let last = 0;
  let m;
  while (m = re.exec(text)) {
    if (m.index > last) out.push({ t: "text", v: text.slice(last, m.index) });
    if (m[1] !== void 0) out.push({ t: "strong", v: m[1] });
    else if (m[2] !== void 0 && m[3] !== void 0) out.push(SAFE_HREF.test(m[3]) ? { t: "link", v: m[2], href: m[3] } : { t: "text", v: m[2] });
    else if (m[4] !== void 0) out.push({ t: "em", v: m[4] });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ t: "text", v: text.slice(last) });
  return out;
}
function parseMarkdown(src) {
  const blocks = [];
  let para = [];
  let list = null;
  const flushPara = () => {
    if (para.length) blocks.push({ type: "p", text: para.join(" ") });
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };
  for (const raw of src.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    const h = /^(#{1,4})\s+(.+)$/.exec(line);
    const li = /^([-*+]|\d+[.)])\s+(.+)$/.exec(line);
    if (!line) {
      flushPara();
      flushList();
    } else if (h) {
      flushPara();
      flushList();
      blocks.push({ type: "h", level: Math.min(4, Math.max(2, h[1].length + 1)), text: h[2] });
    } else if (li) {
      flushPara();
      const type = /^\d/.test(li[1]) ? "ol" : "ul";
      if (list && list.type !== type) flushList();
      list != null ? list : list = { type, items: [] };
      list.items.push(li[2]);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks;
}
function normalizeBlocks(raw) {
  var _a;
  if (typeof raw === "string") return parseMarkdown(raw);
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const b of raw) {
    const type = String((_a = b == null ? void 0 : b.type) != null ? _a : "");
    const text = typeof (b == null ? void 0 : b.text) === "string" ? b.text : typeof (b == null ? void 0 : b.content) === "string" ? b.content : "";
    if (type === "heading" || type === "h") out.push({ type: "h", level: Math.min(4, Math.max(2, Number(b.level) || 2)), text });
    else if (type === "paragraph" || type === "p") out.push({ type: "p", text });
    else if ((type === "list" || type === "ul" || type === "ol") && Array.isArray(b.items)) {
      out.push({ type: b.ordered === true || type === "ol" ? "ol" : "ul", items: b.items.map(String) });
    }
  }
  return out.filter((b) => {
    if (b.type === "h" || b.type === "p") return b.text.length > 0;
    return b.items.length > 0;
  });
}
function normalizeLegal(data) {
  var _a, _b, _c;
  const d = data;
  if (!d || typeof d !== "object" || typeof d.title !== "string" || !d.title) return null;
  const blocks = normalizeBlocks((_b = (_a = d.body) != null ? _a : d.body_markdown) != null ? _b : d.blocks);
  if (!blocks.length) return null;
  const src = d.source;
  return {
    slug: String((_c = d.slug) != null ? _c : ""),
    title: d.title,
    version: typeof d.version === "string" || typeof d.version === "number" ? String(d.version) : null,
    published_at: typeof d.published_at === "string" ? d.published_at : null,
    source: src && typeof src === "object" ? { name: typeof src.name === "string" ? src.name : void 0, url: typeof src.url === "string" && src.url.startsWith("https://") ? src.url : void 0 } : null,
    blocks
  };
}

export { LEGAL_SLUGS as L, parseMarkdown as a, normalizeLegal as n, parseInline as p };
//# sourceMappingURL=legal-vAxOkaZS.mjs.map
