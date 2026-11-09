import { u as useAdminSeo, _ as _sfc_main$1 } from './useAdminSeo-DuRYEU0h.mjs';
import { u as useI18n, g as useApi, c as useLocalePath, _ as _sfc_main$3, d as _sfc_main$5, e as __nuxt_component_0, y as formatNumber, j as isApiError } from './server.mjs';
import { _ as _sfc_main$2 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$4 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$6 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$7 } from './Card-BxvVO_-_.mjs';
import { defineComponent, ref, computed, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { C as CONTENT_MODULES } from './modules-CgmwLVRo.mjs';
import { u as usePermissions } from './usePermissions-C4HCMWJS.mjs';
import './Breadcrumbs-C7SaJcTR.mjs';
import './useSeo-BU4sLOnV.mjs';
import './safe-B2eSdAXJ.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'pinia';
import 'vue-router';
import './permissions-CcyNKBx7.mjs';

const READINESS_QUERIES = {
  total: {},
  published: { "filter[status]": "published" },
  draft: { "filter[status]": "draft" },
  /** Published items whose source was never verified or is older than the freshness window (API `filter[stale]`; the API validates it with Laravel's `boolean` rule, which accepts 1/0 but not the string "true" in a query string). */
  staleLive: { "filter[status]": "published", "filter[stale]": "1" }
};
function readinessOf(c) {
  if (c.total === 0) return "empty";
  if (c.published === 0) return "nothing_published";
  return c.staleLive > 0 ? "needs_attention" : "ready";
}
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}
function sumCounts(list) {
  return list.reduce((a, c) => c ? { total: a.total + c.total, published: a.published + c.published, draft: a.draft + c.draft, staleLive: a.staleLive + c.staleLive } : a, { total: 0, published: 0, draft: 0, staleLive: 0 });
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "readiness",
  __ssrInlineRender: true,
  setup(__props) {
    const { t, locale } = useI18n();
    const { request } = useApi();
    const { can } = usePermissions();
    const localePath = useLocalePath();
    useAdminSeo(() => t("admin.ready.title"));
    const rows = ref(CONTENT_MODULES.filter((m) => can(`${m.permission}.view`)).map((m) => ({ key: m.key, label: `admin.modules.${m.key}`, to: `/admin/content/${m.key}`, icon: m.icon, state: "pending", counts: null })));
    const loading = ref(false);
    const num = (n) => formatNumber(n, locale.value);
    async function loadRow(r) {
      const m = CONTENT_MODULES.find((x) => x.key === r.key);
      r.state = "pending";
      r.error = void 0;
      try {
        const keys = Object.keys(READINESS_QUERIES);
        const totals = await Promise.all(keys.map(async (k) => {
          var _a;
          return (_a = (await request(m.endpoint, { query: { per_page: 1, ...READINESS_QUERIES[k] } })).meta.total) != null ? _a : 0;
        }));
        r.counts = Object.fromEntries(keys.map((k, i) => [k, totals[i]]));
        r.state = "done";
      } catch (e) {
        r.state = "error";
        r.error = isApiError(e) ? e.message : t("errors.generic");
      }
    }
    const srcCounts = ref(null);
    const srcError = ref(null);
    async function loadSources() {
      if (!can("job_sources.view")) return;
      srcError.value = null;
      try {
        const list = (await request("admin/job-sources")).data;
        srcCounts.value = { total: list.length, active: list.filter((x) => x.active).length, failing: list.filter((x) => x.last_status === "failed" || x.consecutive_failures > 0).length };
      } catch (e) {
        srcError.value = isApiError(e) ? e.message : t("errors.generic");
      }
    }
    async function loadAll() {
      loading.value = true;
      void loadSources();
      await mapLimit(rows.value, 3, loadRow);
      loading.value = false;
    }
    const total = computed(() => sumCounts(rows.value.map((r) => r.counts)));
    const failed = computed(() => rows.value.filter((r) => r.state === "error").length);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiEmptyState = _sfc_main$2;
      const _component_UiAlert = _sfc_main$4;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiBadge = _sfc_main$6;
      const _component_UiCard = _sfc_main$7;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)("admin.ready.title"),
        description: unref(t)("admin.ready.description")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiButton, {
              variant: "secondary",
              loading: unref(loading),
              onClick: loadAll
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UiIcon, {
                    name: "refresh",
                    size: 18
                  }, null, _parent3, _scopeId2));
                  _push3(`${ssrInterpolate(unref(t)("admin.ready.refresh"))}`);
                } else {
                  return [
                    createVNode(_component_UiIcon, {
                      name: "refresh",
                      size: 18
                    }),
                    createTextVNode(toDisplayString(unref(t)("admin.ready.refresh")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiButton, {
                variant: "secondary",
                loading: unref(loading),
                onClick: loadAll
              }, {
                default: withCtx(() => [
                  createVNode(_component_UiIcon, {
                    name: "refresh",
                    size: 18
                  }),
                  createTextVNode(toDisplayString(unref(t)("admin.ready.refresh")), 1)
                ]),
                _: 1
              }, 8, ["loading"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (!unref(rows).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("admin.ready.noneTitle"),
          description: unref(t)("admin.ready.none"),
          icon: "shield"
        }, null, _parent));
      } else {
        _push(`<!--[-->`);
        if (unref(failed)) {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: "warning",
            class: "mb-4"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("admin.ready.someFailed", { n: unref(failed) }))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("admin.ready.someFailed", { n: unref(failed) })), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<dl class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="ready-totals"><!--[-->`);
        ssrRenderList(["total", "published", "draft", "staleLive"], (k) => {
          _push(`<div class="rounded-lg border border-line bg-surface p-4"><dt class="text-sm text-ink-soft">${ssrInterpolate(unref(t)(`admin.ready.cols.${k}`))}</dt><dd class="mt-1 text-2xl font-bold tabular-nums">${ssrInterpolate(num(unref(total)[k]))}</dd></div>`);
        });
        _push(`<!--]--></dl><p class="mb-3 text-sm text-muted">${ssrInterpolate(unref(t)("admin.ready.staleNote"))}</p><div class="overflow-x-auto rounded-lg border border-line" role="region" tabindex="0"${ssrRenderAttr("aria-label", unref(t)("admin.ready.title"))}><table class="w-full text-start" data-testid="ready-table"><caption class="sr-only">${ssrInterpolate(unref(t)("admin.ready.title"))}</caption><thead class="bg-sunken text-sm"><tr><th scope="col" class="px-3 py-2 text-start">${ssrInterpolate(unref(t)("admin.ready.module"))}</th><!--[-->`);
        ssrRenderList(["total", "published", "draft", "staleLive"], (k) => {
          _push(`<th scope="col" class="px-3 py-2 text-end">${ssrInterpolate(unref(t)(`admin.ready.cols.${k}`))}</th>`);
        });
        _push(`<!--]--><th scope="col" class="px-3 py-2 text-start">${ssrInterpolate(unref(t)("admin.ready.status"))}</th></tr></thead><tbody class="divide-y divide-line"><!--[-->`);
        ssrRenderList(unref(rows), (r) => {
          _push(`<tr${ssrRenderAttr("data-module", r.key)}><th scope="row" class="px-3 py-2 text-start font-medium">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: unref(localePath)(r.to),
            class: "underline-offset-4 hover:underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)(r.label))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)(r.label)), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</th>`);
          if (r.state === "done" && r.counts) {
            _push(`<!--[--><!--[-->`);
            ssrRenderList(["total", "published", "draft", "staleLive"], (k) => {
              _push(`<td class="px-3 py-2 text-end tabular-nums">${ssrInterpolate(num(r.counts[k]))}</td>`);
            });
            _push(`<!--]--><td class="px-3 py-2">`);
            _push(ssrRenderComponent(_component_UiBadge, {
              tone: { empty: "danger", nothing_published: "warning", needs_attention: "warning", ready: "success" }[unref(readinessOf)(r.counts)]
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)(`admin.ready.states.${unref(readinessOf)(r.counts)}`))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)(`admin.ready.states.${unref(readinessOf)(r.counts)}`)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</td><!--]-->`);
          } else if (r.state === "error") {
            _push(`<td colspan="5" class="px-3 py-2 text-danger">${ssrInterpolate(r.error)} <button type="button" class="inline-flex min-h-touch items-center font-medium underline">${ssrInterpolate(unref(t)("common.retry"))}</button></td>`);
          } else {
            _push(`<td colspan="5" class="px-3 py-2 text-muted" aria-busy="true">${ssrInterpolate(unref(t)("common.loading"))}</td>`);
          }
          _push(`</tr>`);
        });
        _push(`<!--]--></tbody></table></div><!--]-->`);
      }
      if (unref(can)("job_sources.view")) {
        _push(ssrRenderComponent(_component_UiCard, {
          as: "section",
          "aria-labelledby": "ready-src-h",
          class: "mt-6 space-y-2",
          "data-testid": "ready-sources"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h2 id="ready-src-h" class="text-lg font-bold"${_scopeId}>${ssrInterpolate(unref(t)("admin.ready.sources"))}</h2>`);
              if (unref(srcError)) {
                _push2(`<p class="text-danger"${_scopeId}>${ssrInterpolate(unref(srcError))}</p>`);
              } else if (unref(srcCounts)) {
                _push2(`<p class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("admin.ready.sourcesCounts", { total: num(unref(srcCounts).total), active: num(unref(srcCounts).active), failing: num(unref(srcCounts).failing) }))}</p>`);
              } else {
                _push2(`<p class="text-muted"${_scopeId}>${ssrInterpolate(unref(t)("common.loading"))}</p>`);
              }
              _push2(ssrRenderComponent(_component_UiButton, {
                to: "/admin/jobs",
                variant: "ghost"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("admin.ready.openJobs"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("admin.ready.openJobs")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode("h2", {
                  id: "ready-src-h",
                  class: "text-lg font-bold"
                }, toDisplayString(unref(t)("admin.ready.sources")), 1),
                unref(srcError) ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "text-danger"
                }, toDisplayString(unref(srcError)), 1)) : unref(srcCounts) ? (openBlock(), createBlock("p", {
                  key: 1,
                  class: "text-ink-soft"
                }, toDisplayString(unref(t)("admin.ready.sourcesCounts", { total: num(unref(srcCounts).total), active: num(unref(srcCounts).active), failing: num(unref(srcCounts).failing) })), 1)) : (openBlock(), createBlock("p", {
                  key: 2,
                  class: "text-muted"
                }, toDisplayString(unref(t)("common.loading")), 1)),
                createVNode(_component_UiButton, {
                  to: "/admin/jobs",
                  variant: "ghost"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("admin.ready.openJobs")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/readiness.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=readiness-wAx-x1e5.mjs.map
