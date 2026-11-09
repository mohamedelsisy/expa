import { defineComponent, mergeProps, unref, useSSRContext, computed } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
import { a as useAuthStore, g as useApi, u as useI18n, d as _sfc_main$5, f as useRoute, c as useLocalePath } from './server.mjs';
import { u as useToast } from './useToast-BX2bodPv.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Toast",
  __ssrInlineRender: true,
  props: {
    message: {},
    tone: {}
  },
  emits: ["dismiss"],
  setup(__props, { emit: __emit }) {
    const { t } = useI18n();
    const styles = {
      success: "border-success bg-success-soft",
      danger: "border-danger bg-danger-soft",
      info: "border-info bg-info-soft"
    };
    const icons = { success: "check", danger: "alert", info: "info" };
    const iconTone = { success: "text-success", danger: "text-danger", info: "text-info" };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["pointer-events-auto flex items-start gap-3 rounded-md border border-s-4 p-3 text-ink shadow-3", styles[__props.tone]]
      }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$5, {
        name: icons[__props.tone],
        class: ["mt-0.5", iconTone[__props.tone]]
      }, null, _parent));
      _push(`<p class="min-w-0 flex-1">${ssrInterpolate(__props.message)}</p><button type="button" class="-m-2 grid min-h-touch min-w-touch place-items-center text-ink-soft"${ssrRenderAttr("aria-label", unref(t)("common.dismiss"))}>`);
      _push(ssrRenderComponent(_sfc_main$5, {
        name: "x",
        size: 18
      }, null, _parent));
      _push(`</button></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Toast.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ToastRegion",
  __ssrInlineRender: true,
  setup(__props) {
    const toast = useToast();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "pointer-events-none fixed inset-x-0 bottom-[calc(var(--bottom-nav-h)+0.75rem)] z-50 mx-auto flex max-w-md flex-col gap-2 px-4 lg:bottom-6" }, _attrs))}><div aria-live="polite" role="status" class="flex flex-col gap-2"><!--[-->`);
      ssrRenderList(unref(toast).items.value.filter((x) => x.tone !== "danger"), (i) => {
        _push(ssrRenderComponent(_sfc_main$1, {
          key: i.id,
          message: i.message,
          tone: i.tone,
          onDismiss: ($event) => unref(toast).dismiss(i.id)
        }, null, _parent));
      });
      _push(`<!--]--></div><div aria-live="assertive" role="alert" class="flex flex-col gap-2"><!--[-->`);
      ssrRenderList(unref(toast).items.value.filter((x) => x.tone === "danger"), (i) => {
        _push(ssrRenderComponent(_sfc_main$1, {
          key: i.id,
          message: i.message,
          tone: i.tone,
          onDismiss: ($event) => unref(toast).dismiss(i.id)
        }, null, _parent));
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/ToastRegion.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const EXPLORE_PREFIXES = ["/explore", "/guides", "/government", "/appointments", "/documents", "/learn-italian", "/patente", "/jobs", "/study", "/cities", "/pricing", "/search", "/housing", "/articles", "/services", "/provider", "/community", "/my-requests", "/healthcare", "/money", "/business", "/family", "/travel", "/daily-life", "/recommendations"];
function useNav() {
  const { t } = useI18n();
  const route = useRoute();
  const localePath = useLocalePath();
  const auth = useAuthStore();
  return computed(() => {
    const defs = [
      { key: "home", to: auth.isAuthenticated ? "/dashboard" : "/", icon: "home", label: t("nav.home") },
      { key: "explore", to: "/explore", icon: "compass", label: t("nav.explore") },
      { key: "ask", to: "/ask", icon: "sparkle", label: t("nav.ask") },
      { key: "tasks", to: "/tasks", icon: "tasks", label: t("nav.tasks") },
      { key: "profile", to: "/profile", icon: "user", label: t("nav.profile") }
    ];
    return defs.map((d) => {
      const target = localePath(d.to);
      const prefixes = d.key === "explore" ? EXPLORE_PREFIXES : [d.to];
      const active = d.to === "/" ? route.path === target || route.path === `${target}/` : prefixes.some((p) => {
        const full = localePath(p);
        return route.path === full || route.path.startsWith(`${full}/`);
      });
      return { ...d, to: target, active };
    });
  });
}
function usePersistLocale() {
  const auth = useAuthStore();
  const { request } = useApi();
  return async (code) => {
    var _a;
    if (!auth.isAuthenticated) return;
    try {
      const res = await request("profile", { method: "PATCH", body: { locale: code }, handle401: false });
      if ((_a = res.data) == null ? void 0 : _a.user) auth.setUser(res.data.user);
    } catch {
    }
  };
}
function useHeaderLinks() {
  const { t } = useI18n();
  const route = useRoute();
  const localePath = useLocalePath();
  const auth = useAuthStore();
  return computed(() => {
    const defs = [
      { key: "ask", to: "/ask", icon: "sparkle", label: t("nav.ask") },
      ...auth.isAuthenticated ? [{ key: "myItaly", to: "/dashboard", icon: "home", label: t("nav.myItaly") }] : []
    ];
    return defs.map((d) => {
      const target = localePath(d.to);
      return { ...d, to: target, active: route.path === target || route.path.startsWith(`${target}/`) };
    });
  });
}

export { EXPLORE_PREFIXES as E, _sfc_main as _, useHeaderLinks as a, useNav as b, usePersistLocale as u };
//# sourceMappingURL=useNav-C30IWQ9P.mjs.map
