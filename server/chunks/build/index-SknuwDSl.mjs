import { u as useI18n, f as useRoute, g as useApi, c as useLocalePath, _ as _sfc_main$3, d as _sfc_main$5, i as _sfc_main$2$1, j as isApiError, n as navigateTo, e as __nuxt_component_0, z as formatDay } from './server.mjs';
import { _ as _sfc_main$1 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$2 } from './Chips-BU8ln322.mjs';
import { _ as _sfc_main$4 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$6 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$7 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$8 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$9 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$a } from './StatusBadge-DdQOB3xC.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
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
import './documents-DL9ve8rH.mjs';
import './Badge-PdKIsny2.mjs';
import './safe-B2eSdAXJ.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const { request } = useApi();
    useSeo(() => ({ title: t("documents.title"), description: t("documents.subtitle"), noindex: true }));
    const status = computed(() => typeof route.query.status === "string" ? route.query.status : "");
    const type = computed(() => typeof route.query.type === "string" ? route.query.type : "");
    const { data: types } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("document-types", async () => (await request("document-types")).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const { data, error, refresh, status: st } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("documents", () => request("my-documents", {
      query: { "filter[status]": status.value, "filter[type]": type.value, per_page: 100 }
    }), { watch: [status, type, locale] })), __temp = await __temp, __restore(), __temp);
    const docs = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const hasFilters = computed(() => !!(status.value || type.value));
    const setQ = (patch) => {
      const q = { status: status.value, type: type.value, ...patch };
      return navigateTo({ path: route.path, query: Object.fromEntries(Object.entries(q).filter(([, v]) => v)) });
    };
    const statusChips = computed(() => ["", "valid", "expiring_soon", "expired", "no_expiry"].map((v) => ({ value: v, label: v ? t(`documents.status.${v}`) : t("documents.allStatuses") })));
    const typeOptions = computed(() => {
      var _a;
      return ((_a = types.value) != null ? _a : []).map((x) => ({ value: x.key, label: x.name }));
    });
    const localePath = useLocalePath();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiAlert = _sfc_main$1;
      const _component_UiChips = _sfc_main$2;
      const _component_UiFormField = _sfc_main$4;
      const _component_UiSelect = _sfc_main$6;
      const _component_UiCard = _sfc_main$7;
      const _component_UiSkeleton = _sfc_main$8;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$9;
      const _component_DocumentsStatusBadge = _sfc_main$a;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}><header class="mb-6 flex flex-wrap items-end justify-between gap-3"><div class="max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("documents.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("documents.subtitle"))}</p></div><div class="flex flex-wrap gap-2">`);
      _push(ssrRenderComponent(_component_UiButton, {
        to: "/documents/explain",
        variant: "secondary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "file",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("explain.title"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "file",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("explain.title")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiButton, { to: "/documents/new" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "plus",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("documents.new"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "plus",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("documents.new")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></header>`);
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "info",
        class: "mb-6"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "lock",
              size: 16,
              class: "me-1 inline"
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("documents.privacy"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "lock",
                size: 16,
                class: "me-1 inline"
              }),
              createTextVNode(toDisplayString(unref(t)("documents.privacy")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="mb-6 grid gap-4 rounded-lg border border-line bg-surface p-4 md:grid-cols-[2fr_1fr] md:items-end">`);
      _push(ssrRenderComponent(_component_UiChips, {
        "model-value": unref(status),
        options: unref(statusChips),
        label: unref(t)("documents.filterStatus"),
        "onUpdate:modelValue": ($event) => setQ({ status: $event })
      }, null, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("documents.filterType")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(type),
              options: unref(typeOptions),
              placeholder: unref(t)("documents.allTypes"),
              "onUpdate:modelValue": ($event) => setQ({ type: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(type),
                options: unref(typeOptions),
                placeholder: unref(t)("documents.allTypes"),
                "onUpdate:modelValue": ($event) => setQ({ type: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (unref(st) === "pending" && !unref(data)) {
        _push(`<ul aria-busy="true" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(3, (n) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiSkeleton, { lines: 3 }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiSkeleton, { lines: 3 })
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!unref(docs).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(hasFilters) ? unref(t)("documents.noResultsTitle") : unref(t)("documents.emptyTitle"),
          description: unref(hasFilters) ? unref(t)("documents.noResults") : unref(t)("documents.empty"),
          icon: "file"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (!unref(hasFilters)) {
                _push2(ssrRenderComponent(_component_UiButton, { to: "/documents/new" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("documents.new"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("documents.new")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "secondary",
                  onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))({ path: unref(route).path })
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("guides.clear"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("guides.clear")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              }
            } else {
              return [
                !unref(hasFilters) ? (openBlock(), createBlock(_component_UiButton, {
                  key: 0,
                  to: "/documents/new"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("documents.new")), 1)
                  ]),
                  _: 1
                })) : (openBlock(), createBlock(_component_UiButton, {
                  key: 1,
                  variant: "secondary",
                  onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))({ path: unref(route).path })
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("guides.clear")), 1)
                  ]),
                  _: 1
                }, 8, ["onClick"]))
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(unref(docs), (d) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, {
            as: "article",
            class: "relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_DocumentsStatusBadge, {
                  status: d.status,
                  days: d.days_remaining
                }, null, _parent2, _scopeId));
                _push2(`<h2 class="text-lg font-bold"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: unref(localePath)(`/documents/${d.id}`),
                  class: "after:absolute after:inset-0 after:content-['']"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(d.display_name)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(d.display_name), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</h2>`);
                if (d.label) {
                  _push2(`<p class="text-sm text-muted"${_scopeId}>${ssrInterpolate(d.type.name)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<p class="mt-auto flex items-center gap-1.5 text-sm text-ink-soft"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "calendar",
                  size: 16
                }, null, _parent2, _scopeId));
                if (d.expiry_date) {
                  _push2(`<span${_scopeId}>${ssrInterpolate(unref(t)("documents.expiresOn"))}: <time${ssrRenderAttr("datetime", d.expiry_date)}${_scopeId}>${ssrInterpolate(unref(formatDay)(d.expiry_date, unref(locale)))}</time></span>`);
                } else {
                  _push2(`<span${_scopeId}>${ssrInterpolate(unref(t)("documents.status.no_expiry"))}</span>`);
                }
                _push2(`</p>`);
                if (d.attachments.length) {
                  _push2(`<p class="flex items-center gap-1.5 text-sm text-muted"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiIcon, {
                    name: "file",
                    size: 16
                  }, null, _parent2, _scopeId));
                  _push2(`${ssrInterpolate(unref(t)("documents.filesCount", { count: d.attachments.length }))}</p>`);
                } else {
                  _push2(`<!---->`);
                }
              } else {
                return [
                  createVNode(_component_DocumentsStatusBadge, {
                    status: d.status,
                    days: d.days_remaining
                  }, null, 8, ["status", "days"]),
                  createVNode("h2", { class: "text-lg font-bold" }, [
                    createVNode(_component_NuxtLink, {
                      to: unref(localePath)(`/documents/${d.id}`),
                      class: "after:absolute after:inset-0 after:content-['']"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(d.display_name), 1)
                      ]),
                      _: 2
                    }, 1032, ["to"])
                  ]),
                  d.label ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "text-sm text-muted"
                  }, toDisplayString(d.type.name), 1)) : createCommentVNode("", true),
                  createVNode("p", { class: "mt-auto flex items-center gap-1.5 text-sm text-ink-soft" }, [
                    createVNode(_component_UiIcon, {
                      name: "calendar",
                      size: 16
                    }),
                    d.expiry_date ? (openBlock(), createBlock("span", { key: 0 }, [
                      createTextVNode(toDisplayString(unref(t)("documents.expiresOn")) + ": ", 1),
                      createVNode("time", {
                        datetime: d.expiry_date
                      }, toDisplayString(unref(formatDay)(d.expiry_date, unref(locale))), 9, ["datetime"])
                    ])) : (openBlock(), createBlock("span", { key: 1 }, toDisplayString(unref(t)("documents.status.no_expiry")), 1))
                  ]),
                  d.attachments.length ? (openBlock(), createBlock("p", {
                    key: 1,
                    class: "flex items-center gap-1.5 text-sm text-muted"
                  }, [
                    createVNode(_component_UiIcon, {
                      name: "file",
                      size: 16
                    }),
                    createTextVNode(toDisplayString(unref(t)("documents.filesCount", { count: d.attachments.length })), 1)
                  ])) : createCommentVNode("", true)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/documents/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-SknuwDSl.mjs.map
