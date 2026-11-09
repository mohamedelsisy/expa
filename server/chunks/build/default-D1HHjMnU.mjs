import { u as useI18n, f as useRoute, c as useLocalePath, a as useAuthStore, H as useDropdown, d as _sfc_main$5$1, e as __nuxt_component_0, _ as _sfc_main$3$1, G as _sfc_main$4$1, F as _sfc_main$6$1, g as useApi, E as _sfc_main$7$1, j as isApiError, n as navigateTo } from './server.mjs';
import { useSSRContext, defineComponent, useId, computed, watch, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, ref } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrRenderAttr, ssrInterpolate, ssrRenderComponent, ssrRenderStyle, ssrRenderList, ssrRenderSlot } from 'vue/server-renderer';
import { E as EXPLORE_PREFIXES, u as usePersistLocale, a as useHeaderLinks, b as useNav, _ as _sfc_main$d } from './useNav-C30IWQ9P.mjs';
import { u as useExploreModules, a as activeModuleKey, _ as _sfc_main$b } from './useExploreModules-BaJST3ZI.mjs';
import { u as useNotifications } from './useNotifications-epL0jSED.mjs';
import { u as usePermissions } from './usePermissions-C4HCMWJS.mjs';
import { _ as _sfc_main$c } from './Alert-D-zfMDy5.mjs';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { a as useAnalyticsConsent } from './useAnalytics-Dh-8IvGy.mjs';
import { u as useCommunityMeta } from './useCommunity-pk23xdcX.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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

const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "ExploreMenu",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const route = useRoute();
    const localePath = useLocalePath();
    const auth = useAuthStore();
    const { modules, groups, community } = useExploreModules();
    const { open, root } = useDropdown();
    const panelId = useId();
    const active = computed(() => EXPLORE_PREFIXES.some((p) => {
      const full = localePath(p);
      return route.path === full || route.path.startsWith(`${full}/`);
    }));
    const currentKey = computed(() => activeModuleKey(route.path, modules.value, localePath));
    watch(open, (v) => {
      if (v) community.load();
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiIcon = _sfc_main$5$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "root",
        ref: root
      }, _attrs))}><button type="button" data-dropdown-trigger class="${ssrRenderClass([unref(active) || unref(open) ? "bg-primary-soft text-primary-strong" : "text-ink-soft hover:bg-sunken hover:text-ink", "inline-flex min-h-touch items-center gap-1.5 rounded-md px-3 font-medium transition-colors motion-reduce:transition-none"])}"${ssrRenderAttr("aria-expanded", unref(open))}${ssrRenderAttr("aria-controls", unref(panelId))}>${ssrInterpolate(unref(t)("nav.explore"))} `);
      _push(ssrRenderComponent(_component_UiIcon, {
        name: "chevron-down",
        size: 16,
        class: ["transition-transform duration-150 motion-reduce:transition-none", unref(open) ? "rotate-180" : ""]
      }, null, _parent));
      _push(`</button><div${ssrRenderAttr("id", unref(panelId))} class="absolute inset-x-0 top-full z-50 mt-2 max-h-[calc(100vh-5.5rem)] overflow-y-auto rounded-lg border border-line bg-surface p-5 shadow-3" data-testid="explore-menu" style="${ssrRenderStyle(unref(open) ? null : { display: "none" })}"><div class="mb-3 flex items-center justify-between gap-4 px-2"><p class="text-base font-bold text-ink">${ssrInterpolate(unref(t)("nav.exploreTitle"))}</p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(localePath)("/explore"),
        class: "inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-primary-strong hover:bg-primary-soft"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("nav.allSections"))}`);
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "arrow-end",
              size: 16
            }, null, _parent2, _scopeId));
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("nav.allSections")), 1),
              createVNode(_component_UiIcon, {
                name: "arrow-end",
                size: 16
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="grid grid-cols-4 gap-x-4"><!--[-->`);
      ssrRenderList(unref(groups), (g) => {
        _push(`<section${ssrRenderAttr("aria-labelledby", `${unref(panelId)}-${g.key}`)}><h2${ssrRenderAttr("id", `${unref(panelId)}-${g.key}`)} class="mb-1 px-2 text-xs font-bold uppercase tracking-wide text-muted">${ssrInterpolate(unref(t)(`explore.groups.${g.key}`))}</h2><ul><!--[-->`);
        ssrRenderList(g.items, (m) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: unref(localePath)(m.to),
            class: ["group flex min-h-[2.5rem] items-center gap-2.5 rounded-md px-2 py-0.5 text-sm transition-colors motion-reduce:transition-none", unref(currentKey) === m.key ? "bg-primary-soft font-semibold text-primary-strong" : "text-ink hover:bg-sunken"],
            "aria-current": unref(currentKey) === m.key ? "page" : void 0
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="${ssrRenderClass([unref(currentKey) === m.key ? "bg-surface" : "", "grid size-8 shrink-0 place-items-center rounded-md bg-primary-soft text-primary-strong transition-colors group-hover:bg-surface motion-reduce:transition-none"])}"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: m.icon,
                  size: 18
                }, null, _parent2, _scopeId));
                _push2(`</span><span class="min-w-0 flex-1 truncate"${_scopeId}>${ssrInterpolate(unref(t)(`explore.modules.${m.key}.title`))}</span>`);
                if (m.auth && !unref(auth).isAuthenticated) {
                  _push2(ssrRenderComponent(_component_UiIcon, {
                    name: "lock",
                    size: 14,
                    class: "shrink-0 text-muted",
                    "aria-label": unref(t)("explore.needsAccount"),
                    role: "img"
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
              } else {
                return [
                  createVNode("span", {
                    class: ["grid size-8 shrink-0 place-items-center rounded-md bg-primary-soft text-primary-strong transition-colors group-hover:bg-surface motion-reduce:transition-none", unref(currentKey) === m.key ? "bg-surface" : ""]
                  }, [
                    createVNode(_component_UiIcon, {
                      name: m.icon,
                      size: 18
                    }, null, 8, ["name"])
                  ], 2),
                  createVNode("span", { class: "min-w-0 flex-1 truncate" }, toDisplayString(unref(t)(`explore.modules.${m.key}.title`)), 1),
                  m.auth && !unref(auth).isAuthenticated ? (openBlock(), createBlock(_component_UiIcon, {
                    key: 0,
                    name: "lock",
                    size: 14,
                    class: "shrink-0 text-muted",
                    "aria-label": unref(t)("explore.needsAccount"),
                    role: "img"
                  }, null, 8, ["aria-label"])) : createCommentVNode("", true)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul></section>`);
      });
      _push(`<!--]--></div></div></div>`);
    };
  }
});
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/ExploreMenu.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "NotificationBell",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const localePath = useLocalePath();
    const { unread } = useNotifications();
    const label = computed(() => unread.value > 0 ? t("notifications.bellUnread", { count: unread.value }) : t("notifications.bell"));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiIcon = _sfc_main$5$1;
      _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
        to: unref(localePath)("/notifications"),
        class: "relative inline-flex min-h-touch min-w-touch items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sunken hover:text-ink motion-reduce:transition-none",
        "aria-label": unref(label),
        "data-testid": "notification-bell"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "bell",
              size: 22
            }, null, _parent2, _scopeId));
            if (unref(unread) > 0) {
              _push2(`<span aria-hidden="true" class="absolute end-2.5 top-2.5 size-2.5 rounded-full bg-accent ring-2 ring-surface" data-testid="notification-dot"${_scopeId}></span>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "bell",
                size: 22
              }),
              unref(unread) > 0 ? (openBlock(), createBlock("span", {
                key: 0,
                "aria-hidden": "true",
                class: "absolute end-2.5 top-2.5 size-2.5 rounded-full bg-accent ring-2 ring-surface",
                "data-testid": "notification-dot"
              })) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/NotificationBell.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
function initialsOf(name, fallback = "") {
  var _a, _b;
  const words = (name != null ? name : "").trim().split(/\s+/).filter(Boolean);
  const source = words.length ? words : [fallback.trim()].filter(Boolean);
  if (!source.length) return "";
  const first = (_a = [...source[0]][0]) != null ? _a : "";
  const last = source.length > 1 ? (_b = [...source[source.length - 1]][0]) != null ? _b : "" : "";
  const sep = /[\u0600-\u06FF]/.test(first) && last ? "\u200C" : "";
  return (first + sep + last).toLocaleUpperCase();
}
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "UserAvatar",
  __ssrInlineRender: true,
  props: {
    name: {},
    email: {},
    size: { default: "sm" }
  },
  setup(__props) {
    const props = __props;
    const initials = computed(() => {
      var _a;
      return initialsOf(props.name, (_a = props.email) != null ? _a : "");
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiIcon = _sfc_main$5$1;
      _push(`<span${ssrRenderAttrs(mergeProps({
        class: ["grid shrink-0 select-none place-items-center rounded-full bg-primary font-bold text-on-primary", __props.size === "lg" ? "size-11 text-base" : "size-9 text-sm"],
        "aria-hidden": "true"
      }, _attrs))}>`);
      if (unref(initials)) {
        _push(`<!--[-->${ssrInterpolate(unref(initials))}<!--]-->`);
      } else {
        _push(ssrRenderComponent(_component_UiIcon, {
          name: "user",
          size: __props.size === "lg" ? 22 : 18
        }, null, _parent));
      }
      _push(`</span>`);
    };
  }
});
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/UserAvatar.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
function useAccountLinks() {
  const { t } = useI18n();
  const auth = useAuthStore();
  const localePath = useLocalePath();
  const { hasAdminAccess } = usePermissions();
  const links = computed(() => [
    { key: "profile", to: "/profile", icon: "user", label: t("nav.profile") },
    { key: "tasks", to: "/tasks", icon: "tasks", label: t("nav.tasks") },
    { key: "security", to: "/settings/security", icon: "lock", label: t("nav.security") },
    { key: "twoFactor", to: "/settings/two-factor", icon: "shield", label: t("nav.twoFactor") },
    { key: "billing", to: "/settings/billing", icon: "euro", label: t("nav.billing") },
    ...hasAdminAccess.value ? [{ key: "admin", to: "/admin", icon: "building", label: t("nav.admin") }] : []
  ]);
  const displayName = computed(() => {
    var _a, _b;
    return ((_b = (_a = auth.user) == null ? void 0 : _a.name) == null ? void 0 : _b.trim()) || t("nav.account");
  });
  async function signOut() {
    await auth.logout();
    await navigateTo(localePath("/"));
  }
  return { links, displayName, signOut };
}
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "AccountMenu",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const auth = useAuthStore();
    const localePath = useLocalePath();
    const { open, root } = useDropdown();
    const { links, displayName } = useAccountLinks();
    const panelId = useId();
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      const _component_LayoutUserAvatar = _sfc_main$8;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "root",
        ref: root,
        class: "relative"
      }, _attrs))}><button type="button" data-dropdown-trigger class="${ssrRenderClass([unref(open) ? "bg-sunken" : "", "inline-flex min-h-touch items-center gap-1 rounded-full py-1 pe-2 ps-1 text-ink-soft transition-colors hover:bg-sunken motion-reduce:transition-none"])}"${ssrRenderAttr("aria-expanded", unref(open))}${ssrRenderAttr("aria-controls", unref(panelId))}${ssrRenderAttr("aria-label", `${unref(t)("nav.account")}: ${unref(displayName)}`)}>`);
      _push(ssrRenderComponent(_component_LayoutUserAvatar, {
        name: (_a = unref(auth).user) == null ? void 0 : _a.name,
        email: (_b = unref(auth).user) == null ? void 0 : _b.email
      }, null, _parent));
      _push(ssrRenderComponent(_component_UiIcon, {
        name: "chevron-down",
        size: 14,
        class: ["transition-transform duration-150 motion-reduce:transition-none", unref(open) ? "rotate-180" : ""]
      }, null, _parent));
      _push(`</button><div${ssrRenderAttr("id", unref(panelId))} class="absolute end-0 top-full z-50 mt-2 w-72 rounded-lg border border-line bg-surface p-2 shadow-3" data-testid="account-menu" style="${ssrRenderStyle(unref(open) ? null : { display: "none" })}"><div class="mb-1 flex items-center gap-3 rounded-md bg-sunken/70 p-3">`);
      _push(ssrRenderComponent(_component_LayoutUserAvatar, {
        name: (_c = unref(auth).user) == null ? void 0 : _c.name,
        email: (_d = unref(auth).user) == null ? void 0 : _d.email,
        size: "lg"
      }, null, _parent));
      _push(`<div class="min-w-0"><p class="truncate font-semibold text-ink"><bdi>${ssrInterpolate(unref(displayName))}</bdi></p><p class="truncate text-sm text-muted"><bdi>${ssrInterpolate((_e = unref(auth).user) == null ? void 0 : _e.email)}</bdi></p></div></div><ul><!--[-->`);
      ssrRenderList(unref(links), (l) => {
        _push(`<li>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(localePath)(l.to),
          class: "flex min-h-touch items-center gap-3 rounded-md px-3 text-ink transition-colors hover:bg-sunken motion-reduce:transition-none"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: l.icon,
                size: 18,
                class: "shrink-0 text-ink-soft"
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(l.label)}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: l.icon,
                  size: 18,
                  class: "shrink-0 text-ink-soft"
                }, null, 8, ["name"]),
                createTextVNode(toDisplayString(l.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul><div class="mt-1 border-t border-line pt-1"><button type="button" class="flex min-h-touch w-full items-center gap-3 rounded-md px-3 text-start text-ink transition-colors hover:bg-sunken motion-reduce:transition-none">`);
      _push(ssrRenderComponent(_component_UiIcon, {
        name: "logout",
        size: 18,
        class: "shrink-0 text-ink-soft"
      }, null, _parent));
      _push(`${ssrInterpolate(unref(t)("auth.logout"))}</button></div></div></div>`);
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/AccountMenu.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const tile = "grid size-8 shrink-0 place-items-center rounded-md bg-primary-soft text-primary-strong";
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "MobileMenu",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const localePath = useLocalePath();
    const auth = useAuthStore();
    const route = useRoute();
    const persist = usePersistLocale();
    const headerLinks = useHeaderLinks();
    const { modules, groups, community } = useExploreModules();
    const { links: accountLinks, displayName } = useAccountLinks();
    const { open, root } = useDropdown();
    const panelId = useId();
    const currentKey = computed(() => activeModuleKey(route.path, modules.value, localePath));
    const expanded = ref(/* @__PURE__ */ new Set());
    function toggleGroup(key) {
      const next = new Set(expanded.value);
      if (!next.delete(key)) next.add(key);
      expanded.value = next;
    }
    watch(open, (v) => {
      if (v) {
        community.load();
        const g = groups.value.find((x) => x.items.some((m) => m.key === currentKey.value));
        if (g && !expanded.value.has(g.key)) toggleGroup(g.key);
      }
      (void 0).documentElement.style.overflow = v ? "hidden" : "";
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_LayoutUserAvatar = _sfc_main$8;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiLanguageSwitcher = _sfc_main$4$1;
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "root",
        ref: root,
        class: "lg:hidden"
      }, _attrs))}><button type="button" data-dropdown-trigger data-testid="mobile-menu-button" class="${ssrRenderClass([unref(open) ? "bg-sunken" : "", "inline-flex min-h-touch min-w-touch items-center justify-center rounded-full text-ink transition-colors hover:bg-sunken motion-reduce:transition-none"])}"${ssrRenderAttr("aria-expanded", unref(open))}${ssrRenderAttr("aria-controls", unref(panelId))}${ssrRenderAttr("aria-label", unref(open) ? unref(t)("nav.closeMenu") : unref(t)("nav.openMenu"))}>`);
      _push(ssrRenderComponent(_component_UiIcon, {
        name: unref(open) ? "x" : "menu",
        size: 24
      }, null, _parent));
      _push(`</button><div class="absolute inset-x-0 top-full z-40 h-screen bg-ink/30" aria-hidden="true" style="${ssrRenderStyle(unref(open) ? null : { display: "none" })}"></div><div${ssrRenderAttr("id", unref(panelId))} data-testid="mobile-menu" class="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-4.5rem-var(--bottom-nav-h))] overflow-y-auto overscroll-contain border-b border-line bg-surface px-4 pb-6 pt-2 shadow-3 sm:px-6" style="${ssrRenderStyle(unref(open) ? null : { display: "none" })}"><section${ssrRenderAttr("aria-labelledby", `${unref(panelId)}-explore`)} class="py-2"><div class="flex items-center justify-between gap-3"><h2${ssrRenderAttr("id", `${unref(panelId)}-explore`)} class="text-xs font-bold uppercase tracking-wide text-muted">${ssrInterpolate(unref(t)("nav.explore"))}</h2>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(localePath)("/explore"),
        class: "inline-flex min-h-touch items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-primary-strong"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("nav.allSections"))}`);
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "arrow-end",
              size: 16
            }, null, _parent2, _scopeId));
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("nav.allSections")), 1),
              createVNode(_component_UiIcon, {
                name: "arrow-end",
                size: 16
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><!--[-->`);
      ssrRenderList(unref(groups), (g) => {
        _push(`<div class="border-t border-line first:border-t-0"><h3 class="text-base"><button type="button" class="flex min-h-touch w-full items-center justify-between gap-3 rounded-md px-2 text-start font-semibold text-ink"${ssrRenderAttr("aria-expanded", unref(expanded).has(g.key))}${ssrRenderAttr("aria-controls", `${unref(panelId)}-${g.key}`)}>${ssrInterpolate(unref(t)(`explore.groups.${g.key}`))} `);
        _push(ssrRenderComponent(_component_UiIcon, {
          name: "chevron-down",
          size: 18,
          class: ["text-muted transition-transform duration-150 motion-reduce:transition-none", unref(expanded).has(g.key) ? "rotate-180" : ""]
        }, null, _parent));
        _push(`</button></h3><ul${ssrRenderAttr("id", `${unref(panelId)}-${g.key}`)} class="grid grid-cols-1 gap-x-2 pb-2 min-[480px]:grid-cols-2" style="${ssrRenderStyle(unref(expanded).has(g.key) ? null : { display: "none" })}"><!--[-->`);
        ssrRenderList(g.items, (m) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: unref(localePath)(m.to),
            class: ["flex min-h-touch items-center gap-2.5 rounded-md px-2 text-sm", unref(currentKey) === m.key ? "bg-primary-soft font-semibold text-primary-strong" : "text-ink"],
            "aria-current": unref(currentKey) === m.key ? "page" : void 0
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="${ssrRenderClass(tile)}"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: m.icon,
                  size: 18
                }, null, _parent2, _scopeId));
                _push2(`</span><span class="min-w-0 flex-1 truncate"${_scopeId}>${ssrInterpolate(unref(t)(`explore.modules.${m.key}.title`))}</span>`);
                if (m.auth && !unref(auth).isAuthenticated) {
                  _push2(ssrRenderComponent(_component_UiIcon, {
                    name: "lock",
                    size: 14,
                    class: "shrink-0 text-muted",
                    "aria-label": unref(t)("explore.needsAccount"),
                    role: "img"
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
              } else {
                return [
                  createVNode("span", { class: tile }, [
                    createVNode(_component_UiIcon, {
                      name: m.icon,
                      size: 18
                    }, null, 8, ["name"])
                  ]),
                  createVNode("span", { class: "min-w-0 flex-1 truncate" }, toDisplayString(unref(t)(`explore.modules.${m.key}.title`)), 1),
                  m.auth && !unref(auth).isAuthenticated ? (openBlock(), createBlock(_component_UiIcon, {
                    key: 0,
                    name: "lock",
                    size: 14,
                    class: "shrink-0 text-muted",
                    "aria-label": unref(t)("explore.needsAccount"),
                    role: "img"
                  }, null, 8, ["aria-label"])) : createCommentVNode("", true)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul></div>`);
      });
      _push(`<!--]--></section><ul class="mt-1 grid gap-1 border-t border-line pt-3"><!--[-->`);
      ssrRenderList(unref(headerLinks), (l) => {
        _push(`<li>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: l.to,
          class: ["flex min-h-touch items-center gap-3 rounded-md px-2 font-semibold", l.active ? "bg-primary-soft text-primary-strong" : l.key === "ask" ? "bg-primary-soft/60 text-primary-strong" : "text-ink"],
          "aria-current": l.active ? "page" : void 0
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="${ssrRenderClass(tile)}"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: l.icon,
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`</span><span class="min-w-0 flex-1 truncate"${_scopeId}>${ssrInterpolate(l.label)}</span>`);
              if (l.key === "ask") {
                _push2(`<span aria-hidden="true" class="rounded-full bg-primary px-1.5 text-[10px] font-bold leading-4 text-on-primary"${_scopeId}>${ssrInterpolate(unref(t)("nav.aiTag"))}</span>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode("span", { class: tile }, [
                  createVNode(_component_UiIcon, {
                    name: l.icon,
                    size: 18
                  }, null, 8, ["name"])
                ]),
                createVNode("span", { class: "min-w-0 flex-1 truncate" }, toDisplayString(l.label), 1),
                l.key === "ask" ? (openBlock(), createBlock("span", {
                  key: 0,
                  "aria-hidden": "true",
                  class: "rounded-full bg-primary px-1.5 text-[10px] font-bold leading-4 text-on-primary"
                }, toDisplayString(unref(t)("nav.aiTag")), 1)) : createCommentVNode("", true)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul><section${ssrRenderAttr("aria-label", unref(t)("nav.account"))} class="mt-3 border-t border-line pt-3">`);
      if (unref(auth).isAuthenticated) {
        _push(`<!--[--><div class="mb-1 flex items-center gap-3 px-2 py-1">`);
        _push(ssrRenderComponent(_component_LayoutUserAvatar, {
          name: (_a = unref(auth).user) == null ? void 0 : _a.name,
          email: (_b = unref(auth).user) == null ? void 0 : _b.email,
          size: "lg"
        }, null, _parent));
        _push(`<div class="min-w-0"><p class="truncate font-semibold text-ink"><bdi>${ssrInterpolate(unref(displayName))}</bdi></p><p class="truncate text-sm text-muted"><bdi>${ssrInterpolate((_c = unref(auth).user) == null ? void 0 : _c.email)}</bdi></p></div></div><ul class="grid grid-cols-1 min-[480px]:grid-cols-2 min-[480px]:gap-x-2"><!--[-->`);
        ssrRenderList(unref(accountLinks), (l) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: unref(localePath)(l.to),
            class: "flex min-h-touch items-center gap-3 rounded-md px-2 text-sm text-ink"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: l.icon,
                  size: 18,
                  class: "shrink-0 text-ink-soft"
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(l.label)}`);
              } else {
                return [
                  createVNode(_component_UiIcon, {
                    name: l.icon,
                    size: 18,
                    class: "shrink-0 text-ink-soft"
                  }, null, 8, ["name"]),
                  createTextVNode(toDisplayString(l.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--><li><button type="button" class="flex min-h-touch w-full items-center gap-3 rounded-md px-2 text-start text-sm text-ink">`);
        _push(ssrRenderComponent(_component_UiIcon, {
          name: "logout",
          size: 18,
          class: "shrink-0 text-ink-soft"
        }, null, _parent));
        _push(`${ssrInterpolate(unref(t)("auth.logout"))}</button></li></ul><!--]-->`);
      } else {
        _push(`<div class="grid grid-cols-2 gap-2">`);
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/login",
          variant: "secondary",
          block: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("auth.login"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("auth.login")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/register",
          block: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("auth.register"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("auth.register")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
      _push(`</section><div class="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">`);
      _push(ssrRenderComponent(_component_UiLanguageSwitcher, { onSwitch: unref(persist) }, null, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/MobileMenu.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
function useScrolled(threshold = 8) {
  const scrolled = ref(false);
  return scrolled;
}
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "AppHeader",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const auth = useAuthStore();
    const persist = usePersistLocale();
    const localePath = useLocalePath();
    const headerLinks = useHeaderLinks();
    const scrolled = useScrolled();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LayoutBrandLogo = _sfc_main$6$1;
      const _component_LayoutExploreMenu = _sfc_main$a;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_SearchBox = _sfc_main$b;
      const _component_LayoutNotificationBell = _sfc_main$9;
      const _component_UiLanguageSwitcher = _sfc_main$4$1;
      const _component_LayoutAccountMenu = _sfc_main$7;
      const _component_UiButton = _sfc_main$3$1;
      const _component_LayoutMobileMenu = _sfc_main$6;
      _push(`<header${ssrRenderAttrs(mergeProps({
        class: ["sticky top-0 z-40 border-b bg-surface transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none", unref(scrolled) ? "border-line-strong shadow-2" : "border-line shadow-none"],
        "data-scrolled": unref(scrolled) ? "true" : "false"
      }, _attrs))}><div class="container-page flex min-h-[64px] flex-wrap items-center gap-x-2 gap-y-1 py-1 lg:relative lg:gap-x-4">`);
      _push(ssrRenderComponent(_component_LayoutBrandLogo, { class: "shrink-0" }, null, _parent));
      _push(`<nav${ssrRenderAttr("aria-label", unref(t)("nav.primary"))} class="hidden lg:block"><ul class="flex items-center gap-1"><li>`);
      _push(ssrRenderComponent(_component_LayoutExploreMenu, null, null, _parent));
      _push(`</li><!--[-->`);
      ssrRenderList(unref(headerLinks), (item) => {
        _push(`<li>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: item.to,
          class: ["inline-flex min-h-touch items-center gap-2 rounded-md px-3 transition-colors motion-reduce:transition-none", [
            item.active ? "bg-primary-soft text-primary-strong" : item.key === "ask" ? "bg-primary-soft/50 text-primary-strong hover:bg-primary-soft" : "text-ink-soft hover:bg-sunken hover:text-ink",
            item.key === "ask" ? "font-semibold" : "font-medium"
          ]],
          "aria-current": item.active ? "page" : void 0
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: item.icon,
                size: item.key === "ask" ? 18 : 17
              }, null, _parent2, _scopeId));
              _push2(` ${ssrInterpolate(item.label)} `);
              if (item.key === "ask") {
                _push2(`<span aria-hidden="true" class="rounded-full bg-primary px-1.5 text-[10px] font-bold leading-4 text-on-primary"${_scopeId}>${ssrInterpolate(unref(t)("nav.aiTag"))}</span>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: item.icon,
                  size: item.key === "ask" ? 18 : 17
                }, null, 8, ["name", "size"]),
                createTextVNode(" " + toDisplayString(item.label) + " ", 1),
                item.key === "ask" ? (openBlock(), createBlock("span", {
                  key: 0,
                  "aria-hidden": "true",
                  class: "rounded-full bg-primary px-1.5 text-[10px] font-bold leading-4 text-on-primary"
                }, toDisplayString(unref(t)("nav.aiTag")), 1)) : createCommentVNode("", true)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul></nav><div class="hidden min-w-[9rem] max-w-xs flex-1 xl:block">`);
      _push(ssrRenderComponent(_component_SearchBox, null, null, _parent));
      _push(`</div><div class="ms-auto flex min-w-0 items-center gap-0.5 sm:gap-1">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(localePath)("/search"),
        class: "hidden min-h-touch min-w-touch items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sunken hover:text-ink motion-reduce:transition-none sm:inline-flex xl:hidden",
        "aria-label": unref(t)("search.title")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "search",
              size: 22
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "search",
                size: 22
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(auth).isAuthenticated) {
        _push(ssrRenderComponent(_component_LayoutNotificationBell, null, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UiLanguageSwitcher, {
        variant: "menu",
        class: "hidden lg:block",
        onSwitch: unref(persist)
      }, null, _parent));
      if (unref(auth).isAuthenticated) {
        _push(ssrRenderComponent(_component_LayoutAccountMenu, { class: "hidden lg:block" }, null, _parent));
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/login",
          variant: "ghost",
          class: "!px-3 sm:!px-5"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("auth.login"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("auth.login")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/register",
          class: "hidden lg:inline-flex"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("auth.register"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("auth.register")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      }
      _push(ssrRenderComponent(_component_LayoutMobileMenu, null, null, _parent));
      _push(`</div></div></header>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/AppHeader.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "VerificationBanner",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const auth = useAuthStore();
    const { request } = useApi();
    const toast = useToast();
    const sending = ref(false);
    async function resend() {
      var _a, _b;
      sending.value = true;
      try {
        const res = await request("auth/resend-verification", { method: "POST" });
        toast.success((_b = (_a = res.data) == null ? void 0 : _a.message) != null ? _b : t("verify.resent"));
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        sending.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiAlert = _sfc_main$c;
      const _component_UiButton = _sfc_main$3$1;
      if (unref(auth).user && !unref(auth).user.email_verified) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page pt-4" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "warning",
          title: unref(t)("verify.pendingTitle")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("verify.pendingBody", { email: unref(auth).user.email }))}</p>`);
              _push2(ssrRenderComponent(_component_UiButton, {
                variant: "secondary",
                class: "mt-3",
                loading: unref(sending),
                onClick: resend
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("verify.resend"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("verify.resend")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode("p", null, toDisplayString(unref(t)("verify.pendingBody", { email: unref(auth).user.email })), 1),
                createVNode(_component_UiButton, {
                  variant: "secondary",
                  class: "mt-3",
                  loading: unref(sending),
                  onClick: resend
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("verify.resend")), 1)
                  ]),
                  _: 1
                }, 8, ["loading"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/VerificationBanner.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "AnalyticsConsent",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const auth = useAuthStore();
    const consent = useAnalyticsConsent();
    const localePath = useLocalePath();
    const visible = computed(() => !auth.isAuthenticated && consent.value !== "granted" && consent.value !== "denied");
    const decide = (v) => {
      consent.value = v;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiAlert = _sfc_main$c;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiButton = _sfc_main$3$1;
      if (unref(visible)) {
        _push(`<section${ssrRenderAttrs(mergeProps({
          "aria-label": unref(t)("analyticsConsent.title"),
          class: "container-page pt-4",
          "data-testid": "analytics-consent"
        }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "info",
          title: unref(t)("analyticsConsent.title")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("analyticsConsent.body"))}</p><p class="mt-1 text-sm text-ink-soft"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: unref(localePath)("/cookies"),
                class: "inline-flex min-h-touch items-center underline underline-offset-4"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("analyticsConsent.more"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("analyticsConsent.more")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</p><div class="mt-2 flex flex-wrap gap-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiButton, {
                variant: "secondary",
                "data-testid": "analytics-allow",
                onClick: ($event) => decide("granted")
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("analyticsConsent.allow"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("analyticsConsent.allow")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UiButton, {
                variant: "secondary",
                "data-testid": "analytics-deny",
                onClick: ($event) => decide("denied")
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("analyticsConsent.deny"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("analyticsConsent.deny")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              return [
                createVNode("p", null, toDisplayString(unref(t)("analyticsConsent.body")), 1),
                createVNode("p", { class: "mt-1 text-sm text-ink-soft" }, [
                  createVNode(_component_NuxtLink, {
                    to: unref(localePath)("/cookies"),
                    class: "inline-flex min-h-touch items-center underline underline-offset-4"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("analyticsConsent.more")), 1)
                    ]),
                    _: 1
                  }, 8, ["to"])
                ]),
                createVNode("div", { class: "mt-2 flex flex-wrap gap-2" }, [
                  createVNode(_component_UiButton, {
                    variant: "secondary",
                    "data-testid": "analytics-allow",
                    onClick: ($event) => decide("granted")
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("analyticsConsent.allow")), 1)
                    ]),
                    _: 1
                  }, 8, ["onClick"]),
                  createVNode(_component_UiButton, {
                    variant: "secondary",
                    "data-testid": "analytics-deny",
                    onClick: ($event) => decide("denied")
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("analyticsConsent.deny")), 1)
                    ]),
                    _: 1
                  }, 8, ["onClick"])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/AnalyticsConsent.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const OWNER_NAME = "Mohamed Elsisy";
const WHATSAPP_E164 = "393290869818";
const WHATSAPP_DISPLAY = "+39 329 086 9818";
const whatsappUrl = () => `https://wa.me/${WHATSAPP_E164}`;
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "AppFooter",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const community = useCommunityMeta();
    const base = [
      { to: "/guides", key: "guides" },
      { to: "/government", key: "government" },
      { to: "/jobs", key: "jobs" },
      { to: "/study", key: "study" },
      { to: "/housing", key: "housing" },
      { to: "/cities", key: "cities" },
      { to: "/articles", key: "articles" },
      { to: "/services", key: "services" },
      { to: "/healthcare", key: "healthcare" },
      { to: "/money", key: "money" },
      { to: "/money/net-salary", key: "netSalary" },
      { to: "/business", key: "business" },
      { to: "/family", key: "family" },
      { to: "/travel", key: "travel" },
      { to: "/travel/requirements", key: "travelRequirements" },
      { to: "/daily-life", key: "dailyLife" },
      { to: "/about", key: "about" }
    ];
    const explore = computed(() => [...base, ...community.enabled.value ? [{ to: "/community", key: "community" }] : [], { to: "/pricing", key: "pricing" }]);
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const legal = [{ to: "/privacy", key: "privacy" }, { to: "/terms", key: "terms" }, { to: "/cookies", key: "cookies" }, { to: "/privacy-settings", key: "settings" }];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5$1;
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "border-t border-line bg-surface" }, _attrs))}><div class="container-page space-y-4 pb-24 pt-6 text-sm text-muted lg:pb-6"><div class="grid gap-4 sm:grid-cols-2"><nav${ssrRenderAttr("aria-label", unref(t)("footer.exploreNav"))}><ul class="flex flex-wrap gap-x-4"><!--[-->`);
      ssrRenderList(unref(explore), (l) => {
        _push(`<li>`);
        _push(ssrRenderComponent(_component_UiButton, {
          to: l.to,
          variant: "ghost",
          class: "!min-h-touch !px-2"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)(`footer.links.${l.key}`))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)(`footer.links.${l.key}`)), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul></nav><nav${ssrRenderAttr("aria-label", unref(t)("footer.legalNav"))}><ul class="flex flex-wrap gap-x-4 sm:justify-end"><!--[-->`);
      ssrRenderList(legal, (l) => {
        _push(`<li>`);
        _push(ssrRenderComponent(_component_UiButton, {
          to: l.to,
          variant: "ghost",
          class: "!min-h-touch !px-2"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)(`footer.links.${l.key}`))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)(`footer.links.${l.key}`)), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul></nav></div><p>${ssrInterpolate(unref(t)("footer.disclaimer"))}</p><div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line pt-4"><p data-testid="footer-copyright">${ssrInterpolate(unref(t)("footer.copyright", { year: unref(year), name: unref(OWNER_NAME) }))}</p><a${ssrRenderAttr("href", unref(whatsappUrl)())} target="_blank" rel="noopener noreferrer" class="inline-flex min-h-touch items-center gap-2 rounded-md px-2 font-medium text-primary-strong underline-offset-4 hover:underline" data-testid="footer-whatsapp"${ssrRenderAttr("aria-label", unref(t)("footer.whatsappLabel", { number: unref(WHATSAPP_DISPLAY) }))}>`);
      _push(ssrRenderComponent(_component_UiIcon, {
        name: "phone",
        size: 18
      }, null, _parent));
      _push(`${ssrInterpolate(unref(t)("footer.whatsapp"))}<span dir="ltr" class="text-muted">${ssrInterpolate(unref(WHATSAPP_DISPLAY))}</span></a></div></div></footer>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/AppFooter.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "BottomNav",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const nav = useNav();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiIcon = _sfc_main$5$1;
      _push(`<nav${ssrRenderAttrs(mergeProps({
        "aria-label": unref(t)("nav.primary"),
        class: "pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface lg:hidden"
      }, _attrs))}><ul class="grid h-bottom-nav grid-cols-5"><!--[-->`);
      ssrRenderList(unref(nav), (item) => {
        _push(`<li>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: item.to,
          class: ["flex h-full min-w-0 flex-col items-center justify-center gap-0.5 px-1 text-xs font-medium", item.active ? "text-primary-strong" : "text-ink-soft"],
          "aria-current": item.active ? "page" : void 0
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="${ssrRenderClass([item.active ? "bg-primary-soft" : "", "grid h-7 w-12 place-items-center rounded-full"])}"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: item.icon,
                size: 22
              }, null, _parent2, _scopeId));
              _push2(`</span><span class="max-w-full truncate leading-tight"${_scopeId}>${ssrInterpolate(item.label)}</span>`);
            } else {
              return [
                createVNode("span", {
                  class: ["grid h-7 w-12 place-items-center rounded-full", item.active ? "bg-primary-soft" : ""]
                }, [
                  createVNode(_component_UiIcon, {
                    name: item.icon,
                    size: 22
                  }, null, 8, ["name"])
                ], 2),
                createVNode("span", { class: "max-w-full truncate leading-tight" }, toDisplayString(item.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul></nav>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/BottomNav.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_LayoutSkipLink = _sfc_main$7$1;
  const _component_LayoutAppHeader = _sfc_main$5;
  const _component_LayoutVerificationBanner = _sfc_main$4;
  const _component_LayoutAnalyticsConsent = _sfc_main$3;
  const _component_LayoutAppFooter = _sfc_main$2;
  const _component_LayoutBottomNav = _sfc_main$1;
  const _component_UiToastRegion = _sfc_main$d;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex min-h-screen flex-col" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LayoutSkipLink, null, null, _parent));
  _push(ssrRenderComponent(_component_LayoutAppHeader, null, null, _parent));
  _push(ssrRenderComponent(_component_LayoutVerificationBanner, null, null, _parent));
  _push(ssrRenderComponent(_component_LayoutAnalyticsConsent, null, null, _parent));
  _push(`<main id="main" tabindex="-1" class="flex-1 pb-[calc(var(--bottom-nav-h)+1.5rem)] outline-none lg:pb-12">`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</main>`);
  _push(ssrRenderComponent(_component_LayoutAppFooter, null, null, _parent));
  _push(ssrRenderComponent(_component_LayoutBottomNav, null, null, _parent));
  _push(ssrRenderComponent(_component_UiToastRegion, null, null, _parent));
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { _default as default };
//# sourceMappingURL=default-D1HHjMnU.mjs.map
