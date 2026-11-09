import { u as useI18n, f as useRoute, a as useAuthStore, c as useLocalePath, D as useTwoFactorGate, E as _sfc_main$7, d as _sfc_main$5, F as _sfc_main$6, G as _sfc_main$4, e as __nuxt_component_0, _ as _sfc_main$3, n as navigateTo } from './server.mjs';
import { defineComponent, ref, computed, watch, nextTick, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr, ssrRenderSlot } from 'vue/server-renderer';
import { u as usePersistLocale, _ as _sfc_main$2 } from './useNav-C30IWQ9P.mjs';
import { v as visibleNav } from './nav-BcPwSH6h.mjs';
import { u as usePermissions } from './usePermissions-C4HCMWJS.mjs';
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
import './useToast-BX2bodPv.mjs';
import './modules-CgmwLVRo.mjs';
import './permissions-CcyNKBx7.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TwoFactorGate",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiIcon = _sfc_main$5;
      const _component_UiButton = _sfc_main$3;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "mx-auto max-w-xl py-10 text-center",
        "data-testid": "two-factor-gate",
        "aria-labelledby": "tf-gate-h"
      }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiIcon, {
        name: "lock",
        size: 40,
        class: "mx-auto text-primary-strong"
      }, null, _parent));
      _push(`<h1 id="tf-gate-h" tabindex="-1" class="mt-4 text-2xl font-bold outline-none sm:text-3xl">${ssrInterpolate(unref(t)("twoFactor.gate.title"))}</h1><p class="mt-3 text-ink-soft">${ssrInterpolate(unref(t)("twoFactor.gate.body"))}</p>`);
      _push(ssrRenderComponent(_component_UiButton, {
        to: "/settings/two-factor",
        size: "lg",
        class: "mt-6",
        "data-testid": "two-factor-gate-cta"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("twoFactor.gate.cta"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("twoFactor.gate.cta")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</section>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/auth/TwoFactorGate.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "admin",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const route = useRoute();
    const auth = useAuthStore();
    const localePath = useLocalePath();
    const persist = usePersistLocale();
    const { canAny } = usePermissions();
    const open = ref(false);
    const gate = useTwoFactorGate();
    const groups = computed(() => visibleNav(canAny));
    const isActive = (to, exact) => {
      const full = localePath(to);
      return exact ? route.path === full || route.path === `${full}/` : route.path === full || route.path.startsWith(`${full}/`);
    };
    const activeKey = computed(() => {
      var _a;
      const items = groups.value.flatMap((g) => g.items).filter((i) => isActive(i.to, i.exact));
      return (_a = items.sort((a, b) => b.to.length - a.to.length)[0]) == null ? void 0 : _a.key;
    });
    watch(() => route.fullPath, () => {
      open.value = false;
    });
    const toggleEl = ref(null);
    const asideEl = ref(null);
    watch(open, async (isOpen, wasOpen) => {
      var _a, _b, _c;
      await nextTick();
      if (isOpen) (_b = (_a = asideEl.value) == null ? void 0 : _a.querySelector("a[href]")) == null ? void 0 : _b.focus();
      else if (wasOpen) (_c = toggleEl.value) == null ? void 0 : _c.focus();
    });
    async function logout() {
      await auth.logout();
      await navigateTo(localePath("/"));
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LayoutSkipLink = _sfc_main$7;
      const _component_UiIcon = _sfc_main$5;
      const _component_LayoutBrandLogo = _sfc_main$6;
      const _component_UiLanguageSwitcher = _sfc_main$4;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiButton = _sfc_main$3;
      const _component_AuthTwoFactorGate = _sfc_main$1;
      const _component_UiToastRegion = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex min-h-screen flex-col bg-canvas" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_LayoutSkipLink, null, null, _parent));
      _push(`<header class="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur"><div class="flex min-h-[64px] flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-1 sm:px-6"><div class="flex items-center gap-2"><button data-admin-toggle type="button" class="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md text-ink hover:bg-sunken md:hidden"${ssrRenderAttr("aria-expanded", unref(open))} aria-controls="admin-sidebar"${ssrRenderAttr("aria-label", unref(t)("admin.shell.menu"))}>`);
      _push(ssrRenderComponent(_component_UiIcon, {
        name: unref(open) ? "x" : "menu",
        size: 24
      }, null, _parent));
      _push(`</button>`);
      _push(ssrRenderComponent(_component_LayoutBrandLogo, null, null, _parent));
      _push(`<span class="hidden rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary-strong sm:inline">${ssrInterpolate(unref(t)("admin.shell.badge"))}</span></div><div class="flex items-center gap-1 sm:gap-2">`);
      _push(ssrRenderComponent(_component_UiLanguageSwitcher, {
        class: "hidden sm:flex",
        onSwitch: unref(persist)
      }, null, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(localePath)("/"),
        class: "hidden min-h-touch items-center gap-1 rounded-md px-3 font-medium text-primary-strong hover:bg-primary-soft sm:inline-flex"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "external",
              size: 16
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("admin.shell.backToSite"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "external",
                size: 16
              }),
              createTextVNode(toDisplayString(unref(t)("admin.shell.backToSite")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiButton, {
        variant: "ghost",
        class: "hidden md:inline-flex",
        onClick: logout
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "logout",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("auth.logout"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "logout",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("auth.logout")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></header><div class="flex flex-1">`);
      if (unref(open)) {
        _push(`<div class="fixed inset-0 z-30 bg-ink/50 md:hidden" aria-hidden="true"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<aside id="admin-sidebar" data-admin-drawer class="${ssrRenderClass([unref(open) ? "fixed inset-y-0 start-0 block pt-16 shadow-3" : "hidden", "z-30 w-72 shrink-0 overflow-y-auto border-e border-line bg-surface md:static md:block md:w-64"])}"><nav${ssrRenderAttr("aria-label", unref(t)("admin.shell.nav"))} class="space-y-5 p-3"><!--[-->`);
      ssrRenderList(unref(groups), (g) => {
        _push(`<div><p class="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">${ssrInterpolate(unref(t)(g.label))}</p><ul><!--[-->`);
        ssrRenderList(g.items, (i) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: unref(localePath)(i.to),
            class: ["flex min-h-touch items-center gap-3 rounded-md px-3 font-medium", unref(activeKey) === i.key ? "bg-primary-soft text-primary-strong" : "text-ink-soft hover:bg-sunken"],
            "aria-current": unref(activeKey) === i.key ? "page" : void 0
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: i.icon,
                  size: 20
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(unref(t)(i.label))}`);
              } else {
                return [
                  createVNode(_component_UiIcon, {
                    name: i.icon,
                    size: 20
                  }, null, 8, ["name"]),
                  createTextVNode(toDisplayString(unref(t)(i.label)), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul></div>`);
      });
      _push(`<!--]--><div class="space-y-1 border-t border-line pt-3 sm:hidden">`);
      _push(ssrRenderComponent(_component_UiLanguageSwitcher, { onSwitch: unref(persist) }, null, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(localePath)("/"),
        class: "flex min-h-touch items-center gap-3 rounded-md px-3 font-medium text-primary-strong"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "external",
              size: 20
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("admin.shell.backToSite"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "external",
                size: 20
              }),
              createTextVNode(toDisplayString(unref(t)("admin.shell.backToSite")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button type="button" class="flex min-h-touch w-full items-center gap-3 rounded-md px-3 text-start font-medium text-ink-soft">`);
      _push(ssrRenderComponent(_component_UiIcon, {
        name: "logout",
        size: 20
      }, null, _parent));
      _push(`${ssrInterpolate(unref(t)("auth.logout"))}</button></div></nav></aside><main id="main" tabindex="-1"${ssrIncludeBooleanAttr(unref(open) || void 0) ? " inert" : ""} class="min-w-0 flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8">`);
      if (unref(gate)) {
        _push(ssrRenderComponent(_component_AuthTwoFactorGate, null, null, _parent));
      } else {
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      }
      _push(`</main></div>`);
      _push(ssrRenderComponent(_component_UiToastRegion, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/admin.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=admin-Cmpe5bRz.mjs.map
