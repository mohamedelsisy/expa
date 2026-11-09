import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, a as useAuthStore, c as useLocalePath, i as _sfc_main$2$1, j as isApiError, _ as _sfc_main$3$1, h as formatDateTime, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$3 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$4 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$5 } from './ConfirmInline-sG5Cp32P.mjs';
import { defineComponent, computed, withAsyncContext, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
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
  __name: "security",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const auth = useAuthStore();
    const toast = useToast();
    const localePath = useLocalePath();
    useSeo(() => ({ title: t("sessions.title"), description: t("sessions.subtitle"), noindex: true }));
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/" }, { label: t("profile.title"), to: "/profile" }, { label: t("sessions.title") }]);
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("auth-tokens", async () => (await request("auth/tokens")).data)), __temp = await __temp, __restore(), __temp);
    const busy = ref(null);
    const confirmAll = ref(false);
    async function endSession() {
      await auth.logout();
      await navigateTo(localePath("/login"));
    }
    async function revoke(d) {
      busy.value = d.id;
      try {
        await request(`auth/tokens/${d.id}`, { method: "DELETE" });
        if (d.current) {
          await endSession();
          return;
        }
        toast.success(t("sessions.revoked"));
        await refresh();
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busy.value = null;
      }
    }
    async function logoutAll() {
      busy.value = "all";
      try {
        await request("auth/logout-all", { method: "POST" });
        await endSession();
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
        busy.value = null;
      }
    }
    const label = (d) => d.name || t("sessions.unknownDevice");
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$3;
      const _component_UiBadge = _sfc_main$4;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiConfirmInline = _sfc_main$5;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("sessions.title"))}</h1><p class="mt-1 mb-6 text-ink-soft">${ssrInterpolate(unref(t)("sessions.subtitle"))}</p>`);
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 3
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: unref(isApiError)(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!((_a = unref(data)) == null ? void 0 : _a.length)) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("sessions.emptyTitle"),
          description: unref(t)("sessions.empty"),
          icon: "lock"
        }, null, _parent));
      } else {
        _push(`<!--[--><ul class="space-y-3"><!--[-->`);
        ssrRenderList(unref(data), (d) => {
          _push(`<li class="space-y-1 rounded-lg border border-line bg-surface p-4"${ssrRenderAttr("data-testid", `device-${d.id}`)}><div class="flex flex-wrap items-center justify-between gap-2"><p class="flex flex-wrap items-center gap-2 font-semibold"><span dir="auto">${ssrInterpolate(label(d))}</span>`);
          if (d.current) {
            _push(ssrRenderComponent(_component_UiBadge, { tone: "success" }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("sessions.thisDevice"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("sessions.thisDevice")), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</p>`);
          _push(ssrRenderComponent(_component_UiButton, {
            variant: "secondary",
            loading: unref(busy) === d.id,
            onClick: ($event) => revoke(d)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(d.current ? unref(t)("sessions.signOutHere") : unref(t)("sessions.revoke"))}<span class="sr-only"${_scopeId}>${ssrInterpolate(label(d))}</span>`);
              } else {
                return [
                  createTextVNode(toDisplayString(d.current ? unref(t)("sessions.signOutHere") : unref(t)("sessions.revoke")), 1),
                  createVNode("span", { class: "sr-only" }, toDisplayString(label(d)), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div><p class="text-sm text-muted">${ssrInterpolate(unref(t)("sessions.lastUsed", { date: d.last_used_at ? unref(formatDateTime)(d.last_used_at, unref(locale)) : unref(t)("sessions.never") }))}`);
          if (d.expires_at) {
            _push(`<span> \xB7 ${ssrInterpolate(unref(t)("sessions.expires", { date: unref(formatDateTime)(d.expires_at, unref(locale)) }))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</p></li>`);
        });
        _push(`<!--]--></ul><section aria-labelledby="all-h" class="mt-8 space-y-3"><h2 id="all-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("sessions.allTitle"))}</h2><p class="text-ink-soft">${ssrInterpolate(unref(t)("sessions.allHelp"))}</p>`);
        if (!unref(confirmAll)) {
          _push(ssrRenderComponent(_component_UiButton, {
            variant: "danger",
            onClick: ($event) => confirmAll.value = true
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("sessions.logoutAll"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("sessions.logoutAll")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(ssrRenderComponent(_component_UiConfirmInline, {
            message: unref(t)("sessions.logoutAllConfirm"),
            "confirm-label": unref(t)("sessions.logoutAll"),
            loading: unref(busy) === "all",
            onCancel: ($event) => confirmAll.value = false,
            onConfirm: logoutAll
          }, null, _parent));
        }
        _push(`</section><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/settings/security.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=security-DmSjf1Ab.mjs.map
