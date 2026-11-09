import { u as useAdminSeo, _ as _sfc_main$1 } from './useAdminSeo-DuRYEU0h.mjs';
import { u as useI18n, g as useApi, _ as _sfc_main$3, d as _sfc_main$5, i as _sfc_main$2$1, j as isApiError, z as formatDay } from './server.mjs';
import { _ as _sfc_main$2 } from './ConfirmInline-sG5Cp32P.mjs';
import { _ as _sfc_main$4 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$6 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$7 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$8 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$9 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$a } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$b } from './DataTable--nNCrVdv.mjs';
import { _ as _sfc_main$c } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$d } from './Pagination-DA28GIFv.mjs';
import { defineComponent, ref, computed, withAsyncContext, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
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
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "knowledge",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    useAdminSeo(() => t("admin.ai.knowledge.title"));
    const page = ref(1);
    const lang = ref("");
    const sourceType = ref("");
    const query = computed(() => ({ page: page.value, per_page: 25, ...lang.value ? { locale: lang.value } : {}, ...sourceType.value ? { source_type: sourceType.value } : {} }));
    const { data, error, refresh, status: st } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("admin-ai-knowledge", () => request("admin/ai/knowledge", { query: query.value }), { watch: [query] })), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    const columns = computed(() => [
      { key: "title", label: t("admin.ai.knowledge.item") },
      { key: "item_type", label: t("admin.ai.knowledge.type") },
      { key: "locale", label: t("admin.ai.knowledge.language") },
      { key: "source", label: t("admin.ai.knowledge.source") },
      { key: "last_verified_at", label: t("admin.ai.knowledge.verified") },
      { key: "chunks", label: t("admin.ai.knowledge.chunks") }
    ]);
    const stale = (c) => {
      var _a;
      return !c.last_verified_at || ((_a = meta.value) == null ? void 0 : _a.stale_after_days) != null && Date.now() - new Date(c.last_verified_at).getTime() > meta.value.stale_after_days * 864e5;
    };
    const confirming = ref(false);
    const busy = ref(false);
    const failure = ref("");
    async function reindex() {
      busy.value = true;
      failure.value = "";
      try {
        const res = await request("admin/ai/knowledge/reindex", { method: "POST" });
        toast.success(t("admin.ai.knowledge.reindexed", { count: res.data.chunks }));
        confirming.value = false;
        await refresh();
      } catch (e) {
        failure.value = isApiError(e) && e.status === 403 ? t("admin.common.forbidden") : isApiError(e) ? e.message : t("errors.generic");
      } finally {
        busy.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f;
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiConfirmInline = _sfc_main$2;
      const _component_UiAlert = _sfc_main$4;
      const _component_UiFormField = _sfc_main$6;
      const _component_UiSelect = _sfc_main$7;
      const _component_UiCard = _sfc_main$8;
      const _component_UiSkeleton = _sfc_main$9;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$a;
      const _component_AdminDataTable = _sfc_main$b;
      const _component_UiBadge = _sfc_main$c;
      const _component_UiPagination = _sfc_main$d;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)("admin.ai.knowledge.title"),
        description: unref(t)("admin.ai.knowledge.help"),
        crumbs: [{ label: unref(t)("admin.title"), to: "/admin" }, { label: unref(t)("admin.ai.knowledge.title") }]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (!unref(confirming)) {
              _push2(ssrRenderComponent(_component_UiButton, {
                variant: "secondary",
                onClick: ($event) => confirming.value = true
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiIcon, {
                      name: "refresh",
                      size: 18
                    }, null, _parent3, _scopeId2));
                    _push3(`${ssrInterpolate(unref(t)("admin.ai.knowledge.reindex"))}`);
                  } else {
                    return [
                      createVNode(_component_UiIcon, {
                        name: "refresh",
                        size: 18
                      }),
                      createTextVNode(toDisplayString(unref(t)("admin.ai.knowledge.reindex")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              !unref(confirming) ? (openBlock(), createBlock(_component_UiButton, {
                key: 0,
                variant: "secondary",
                onClick: ($event) => confirming.value = true
              }, {
                default: withCtx(() => [
                  createVNode(_component_UiIcon, {
                    name: "refresh",
                    size: 18
                  }),
                  createTextVNode(toDisplayString(unref(t)("admin.ai.knowledge.reindex")), 1)
                ]),
                _: 1
              }, 8, ["onClick"])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(confirming)) {
        _push(ssrRenderComponent(_component_UiConfirmInline, {
          class: "mb-6",
          message: unref(t)("admin.ai.knowledge.reindexConfirm"),
          "confirm-label": unref(t)("admin.ai.knowledge.reindex"),
          loading: unref(busy),
          onCancel: ($event) => confirming.value = false,
          onConfirm: reindex
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div aria-live="polite">`);
      if (unref(failure)) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "danger",
          class: "mb-4"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(failure))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(failure)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (((_a = unref(meta)) == null ? void 0 : _a.chunks_total) !== void 0) {
        _push(`<p class="mb-4 text-ink-soft" data-testid="knowledge-total">${ssrInterpolate(unref(t)("admin.ai.knowledge.total", { chunks: unref(meta).chunks_total, items: (_b = unref(meta).total) != null ? _b : 0 }))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="mb-6 grid gap-4 sm:grid-cols-2">`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("admin.ai.knowledge.language")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(lang),
              options: ["ar", "en", "it"].map((v) => ({ value: v, label: unref(t)(`languages.${v}`) })),
              placeholder: unref(t)("admin.common.all"),
              "onUpdate:modelValue": ($event) => {
                lang.value = $event;
                page.value = 1;
              }
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(lang),
                options: ["ar", "en", "it"].map((v) => ({ value: v, label: unref(t)(`languages.${v}`) })),
                placeholder: unref(t)("admin.common.all"),
                "onUpdate:modelValue": ($event) => {
                  lang.value = $event;
                  page.value = 1;
                }
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("admin.ai.knowledge.source")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(sourceType),
              options: ["official", "institutional", "verified_partner", "third_party"].map((v) => ({ value: v, label: unref(t)(`admin.ai.knowledge.sourceTypes.${v}`) })),
              placeholder: unref(t)("admin.common.all"),
              "onUpdate:modelValue": ($event) => {
                sourceType.value = $event;
                page.value = 1;
              }
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(sourceType),
                options: ["official", "institutional", "verified_partner", "third_party"].map((v) => ({ value: v, label: unref(t)(`admin.ai.knowledge.sourceTypes.${v}`) })),
                placeholder: unref(t)("admin.common.all"),
                "onUpdate:modelValue": ($event) => {
                  sourceType.value = $event;
                  page.value = 1;
                }
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (unref(st) === "pending" && !unref(data)) {
        _push(`<ul aria-busy="true"><li>`);
        _push(ssrRenderComponent(_component_UiCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSkeleton, { lines: 5 }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSkeleton, { lines: 5 })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</li></ul>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: unref(isApiError)(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!unref(rows).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("admin.ai.knowledge.empty"),
          description: unref(t)("admin.ai.knowledge.emptyHelp"),
          icon: "book"
        }, null, _parent));
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_AdminDataTable, {
          columns: unref(columns),
          rows: unref(rows),
          "row-key": "item_slug",
          caption: unref(t)("admin.ai.knowledge.title")
        }, {
          "cell-title": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            var _a2, _b2, _c2, _d2;
            if (_push2) {
              _push2(`<span dir="auto"${_scopeId}>${ssrInterpolate((_b2 = (_a2 = row.title) != null ? _a2 : row.item_slug) != null ? _b2 : row.item_id)}</span>`);
            } else {
              return [
                createVNode("span", { dir: "auto" }, toDisplayString((_d2 = (_c2 = row.title) != null ? _c2 : row.item_slug) != null ? _d2 : row.item_id), 1)
              ];
            }
          }),
          "cell-source": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            var _a2, _b2;
            if (_push2) {
              _push2(`<span class="text-sm"${_scopeId}><span dir="auto"${_scopeId}>${ssrInterpolate((_a2 = row.source_name) != null ? _a2 : "\u2014")}</span>`);
              if (row.source_type) {
                _push2(ssrRenderComponent(_component_UiBadge, {
                  class: "ms-2",
                  tone: "neutral"
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)(`admin.ai.knowledge.sourceTypes.${row.source_type}`))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)(`admin.ai.knowledge.sourceTypes.${row.source_type}`)), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</span>`);
            } else {
              return [
                createVNode("span", { class: "text-sm" }, [
                  createVNode("span", { dir: "auto" }, toDisplayString((_b2 = row.source_name) != null ? _b2 : "\u2014"), 1),
                  row.source_type ? (openBlock(), createBlock(_component_UiBadge, {
                    key: 0,
                    class: "ms-2",
                    tone: "neutral"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)(`admin.ai.knowledge.sourceTypes.${row.source_type}`)), 1)
                    ]),
                    _: 2
                  }, 1024)) : createCommentVNode("", true)
                ])
              ];
            }
          }),
          "cell-last_verified_at": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-sm"${_scopeId}>${ssrInterpolate(row.last_verified_at ? unref(formatDay)(row.last_verified_at, unref(locale)) : unref(t)("admin.ai.knowledge.never"))}</span>`);
              if (stale(row)) {
                _push2(ssrRenderComponent(_component_UiBadge, {
                  class: "ms-2",
                  tone: "warning"
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("admin.ai.knowledge.stale"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("admin.ai.knowledge.stale")), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode("span", { class: "text-sm" }, toDisplayString(row.last_verified_at ? unref(formatDay)(row.last_verified_at, unref(locale)) : unref(t)("admin.ai.knowledge.never")), 1),
                stale(row) ? (openBlock(), createBlock(_component_UiBadge, {
                  key: 0,
                  class: "ms-2",
                  tone: "warning"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("admin.ai.knowledge.stale")), 1)
                  ]),
                  _: 1
                })) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="mt-4">`);
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_d = (_c = unref(meta)) == null ? void 0 : _c.page) != null ? _d : 1,
          "last-page": (_f = (_e = unref(meta)) == null ? void 0 : _e.last_page) != null ? _f : 1,
          onChange: ($event) => page.value = $event
        }, null, _parent));
        _push(`</div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/ai/knowledge.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=knowledge-Bkq0vTJq.mjs.map
