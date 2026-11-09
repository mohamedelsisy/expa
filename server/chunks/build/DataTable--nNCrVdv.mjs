import { defineComponent, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrRenderSlot } from 'vue/server-renderer';
import { u as useI18n } from './server.mjs';

const first = (v) => {
  var _a;
  return Array.isArray(v) ? String((_a = v[0]) != null ? _a : "") : typeof v === "string" ? v : "";
};
function parseListQuery(query, cfg) {
  const page = Number.parseInt(first(query.page), 10);
  let sort = first(query.sort) || cfg.defaultSort;
  if (cfg.sortable && !cfg.sortable.includes(sort.replace(/^-/, ""))) sort = cfg.defaultSort;
  const filters = {};
  for (const k of cfg.filterKeys) {
    const v = first(query[k]).trim();
    if (v) filters[k] = v;
  }
  return { page: Number.isFinite(page) && page > 0 ? page : 1, sort, filters };
}
function toRouteQuery(state, cfg) {
  const out = {};
  for (const [k, v] of Object.entries(state.filters)) if (v) out[k] = v;
  if (state.sort !== cfg.defaultSort) out.sort = state.sort;
  if (state.page > 1) out.page = String(state.page);
  return out;
}
function toApiQuery(state, cfg) {
  const out = { page: state.page, sort: state.sort };
  if (cfg.defaultPerPage) out.per_page = cfg.defaultPerPage;
  for (const [k, v] of Object.entries(state.filters)) if (v) out[`filter[${k}]`] = v;
  return out;
}
function nextSort(current, column) {
  return current === column ? `-${column}` : column;
}
function sortDirection(current, column) {
  if (current === column) return "ascending";
  if (current === `-${column}`) return "descending";
  return "none";
}
function withFilter(state, key, value) {
  const filters = { ...state.filters };
  if (value) filters[key] = value;
  else delete filters[key];
  return { ...state, filters, page: 1 };
}
const withSort = (state, column) => ({ ...state, sort: nextSort(state.sort, column), page: 1 });
const withPage = (state, page) => ({ ...state, page: Math.max(1, page) });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "DataTable",
  __ssrInlineRender: true,
  props: {
    columns: {},
    rows: {},
    rowKey: {},
    caption: {},
    sort: {}
  },
  emits: ["sort"],
  setup(__props, { emit: __emit }) {
    const { t } = useI18n();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "relative overflow-x-auto rounded-lg border border-line bg-surface shadow-1",
        role: "region",
        "aria-label": __props.caption,
        tabindex: "0"
      }, _attrs))}><table class="w-full min-w-[40rem] border-collapse text-start"><caption class="sr-only">${ssrInterpolate(__props.caption)}</caption><thead class="bg-sunken text-sm text-ink-soft"><tr><!--[-->`);
      ssrRenderList(__props.columns, (c) => {
        _push(`<th scope="col" class="${ssrRenderClass([c.class, "px-3 py-2 text-start font-semibold"])}"${ssrRenderAttr("aria-sort", c.sortable && __props.sort ? unref(sortDirection)(__props.sort, c.key) : void 0)}>`);
        if (c.sortable) {
          _push(`<button type="button" class="inline-flex min-h-touch items-center gap-1 font-semibold hover:text-ink"${ssrRenderAttr("aria-label", unref(t)("admin.common.sortBy", { column: c.label }))}>${ssrInterpolate(c.label)} <span aria-hidden="true" class="text-xs">${ssrInterpolate(__props.sort === c.key ? "\u25B2" : __props.sort === `-${c.key}` ? "\u25BC" : "\u2195")}</span></button>`);
        } else {
          _push(`<!--[-->${ssrInterpolate(c.label)}<!--]-->`);
        }
        _push(`</th>`);
      });
      _push(`<!--]--></tr></thead><tbody class="divide-y divide-line"><!--[-->`);
      ssrRenderList(__props.rows, (row) => {
        _push(`<tr class="align-top hover:bg-canvas"><!--[-->`);
        ssrRenderList(__props.columns, (c, i) => {
          _push(`<!--[-->`);
          if (i === 0) {
            _push(`<th scope="row" class="${ssrRenderClass([c.class, "px-3 py-2 text-start font-medium"])}">`);
            ssrRenderSlot(_ctx.$slots, `cell-${c.key}`, { row }, () => {
              _push(`${ssrInterpolate(row[c.key])}`);
            }, _push, _parent);
            _push(`</th>`);
          } else {
            _push(`<td class="${ssrRenderClass([c.class, "px-3 py-2"])}">`);
            ssrRenderSlot(_ctx.$slots, `cell-${c.key}`, { row }, () => {
              _push(`${ssrInterpolate(row[c.key])}`);
            }, _push, _parent);
            _push(`</td>`);
          }
          _push(`<!--]-->`);
        });
        _push(`<!--]--></tr>`);
      });
      _push(`<!--]--></tbody></table></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/DataTable.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _, withSort as a, withFilter as b, toRouteQuery as c, nextSort as n, parseListQuery as p, toApiQuery as t, withPage as w };
//# sourceMappingURL=DataTable--nNCrVdv.mjs.map
