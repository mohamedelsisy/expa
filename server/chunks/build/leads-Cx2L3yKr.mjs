import { _ as _sfc_main$1 } from './Nav-CnBbBeUx.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$3 } from './EmptyState-N2xvHts8.mjs';
import { u as useI18n, g as useApi, j as isApiError, _ as _sfc_main$3$1, i as _sfc_main$2$1, h as formatDateTime } from './server.mjs';
import { _ as _sfc_main$4 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$5 } from './Pagination-DA28GIFv.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { L as LEAD_STATUS_TONE, l as languageName } from './services-h_WXKmjh.mjs';
import { u as useToast } from './useToast-BX2bodPv.mjs';
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
import './safe-B2eSdAXJ.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "leads",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    useSeo(() => ({ title: t("provider.leads.title"), description: t("provider.leads.intro"), noindex: true }));
    const page = ref(1);
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(() => `provider-leads-${page.value}`, () => request("provider/leads", { query: { page: page.value, per_page: 20 } }), { watch: [page] })), __temp = await __temp, __restore(), __temp);
    const notProvider = computed(() => isApiError(error.value) && (error.value.code === "provider_account_required" || error.value.status === 403));
    const busy = ref(null);
    async function mark(l, s) {
      busy.value = l.id;
      try {
        await request(`provider/leads/${l.id}`, { method: "PATCH", body: { status: s } });
        await refresh();
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busy.value = null;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_ProviderNav = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiEmptyState = _sfc_main$3;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiBadge = _sfc_main$4;
      const _component_UiPagination = _sfc_main$5;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}><h1 class="mb-6 text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("provider.leads.title"))}</h1>`);
      _push(ssrRenderComponent(_component_ProviderNav, null, null, _parent));
      _push(`<p class="mb-4 text-ink-soft">${ssrInterpolate(unref(t)("provider.leads.intro"))}</p>`);
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 4
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(notProvider)) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("provider.noListingTitle"),
          description: unref(t)("provider.noListing"),
          icon: "user"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiButton, { to: "/provider" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("provider.apply.title"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("provider.apply.title")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiButton, { to: "/provider" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("provider.apply.title")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!((_a = unref(data)) == null ? void 0 : _a.data.length)) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("provider.leads.emptyTitle"),
          description: unref(t)("provider.leads.empty"),
          icon: "send"
        }, null, _parent));
      } else {
        _push(`<!--[--><ul class="space-y-3"><!--[-->`);
        ssrRenderList(unref(data).data, (l) => {
          var _a2;
          _push(`<li class="space-y-2 rounded-md border border-line bg-surface p-4"><p class="flex flex-wrap items-center gap-2">`);
          _push(ssrRenderComponent(_component_UiBadge, {
            tone: (_a2 = unref(LEAD_STATUS_TONE)[l.status]) != null ? _a2 : "neutral"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)(`services.leadStatus.${l.status}`))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)(`services.leadStatus.${l.status}`)), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(ssrRenderComponent(_component_UiBadge, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a3, _b2;
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)(`services.lead.types.${(_a3 = l.request_type) != null ? _a3 : "contact"}`))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)(`services.lead.types.${(_b2 = l.request_type) != null ? _b2 : "contact"}`)), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<span class="text-sm text-muted"><bdi>${ssrInterpolate(unref(formatDateTime)(l.created_at, unref(locale)))}</bdi></span></p><p class="prose-plain" dir="auto">${ssrInterpolate(l.message)}</p><dl class="grid gap-2 text-sm sm:grid-cols-2">`);
          if (l.contact.name) {
            _push(`<div><dt class="text-muted">${ssrInterpolate(unref(t)("services.lead.name"))}</dt><dd dir="auto">${ssrInterpolate(l.contact.name)}</dd></div>`);
          } else {
            _push(`<!---->`);
          }
          if (l.contact.email) {
            _push(`<div><dt class="text-muted">${ssrInterpolate(unref(t)("services.lead.email"))}</dt><dd><a${ssrRenderAttr("href", `mailto:${l.contact.email}`)} dir="ltr" class="break-all underline underline-offset-4">${ssrInterpolate(l.contact.email)}</a></dd></div>`);
          } else {
            _push(`<!---->`);
          }
          if (l.contact.phone) {
            _push(`<div><dt class="text-muted">${ssrInterpolate(unref(t)("services.lead.phone"))}</dt><dd><a${ssrRenderAttr("href", `tel:${l.contact.phone.replace(/[^+\d]/g, "")}`)} dir="ltr" class="underline underline-offset-4">${ssrInterpolate(l.contact.phone)}</a></dd></div>`);
          } else {
            _push(`<!---->`);
          }
          if (l.preferred_language) {
            _push(`<div><dt class="text-muted">${ssrInterpolate(unref(t)("services.lead.language"))}</dt><dd>${ssrInterpolate(unref(languageName)(l.preferred_language, unref(locale)))}</dd></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</dl><p class="text-xs text-muted">${ssrInterpolate(unref(t)("provider.leads.consentNote"))}</p><div class="flex flex-wrap gap-2">`);
          if (l.status === "new") {
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "secondary",
              loading: unref(busy) === l.id,
              onClick: ($event) => mark(l, "seen")
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("provider.leads.markSeen"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("provider.leads.markSeen")), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          if (l.status !== "closed") {
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "ghost",
              loading: unref(busy) === l.id,
              onClick: ($event) => mark(l, "closed")
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("provider.leads.close"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("provider.leads.close")), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div></li>`);
        });
        _push(`<!--]--></ul><div class="mt-6">`);
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_b = unref(data).meta.page) != null ? _b : 1,
          "last-page": (_c = unref(data).meta.last_page) != null ? _c : 1,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/provider/leads.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=leads-Cx2L3yKr.mjs.map
