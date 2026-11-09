import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, o as createError, i as _sfc_main$2$1, j as isApiError, k as formatDate, _ as _sfc_main$3$1 } from './server.mjs';
import { _ as _sfc_main$3 } from './EmptyState-N2xvHts8.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as useCommunityMeta } from './useCommunity-pk23xdcX.mjs';
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
  __name: "blocked",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    const community = useCommunityMeta();
    const meta = ([__temp, __restore] = withAsyncContext(() => community.load()), __temp = await __temp, __restore(), __temp);
    if (!meta) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    useSeo(() => ({ title: t("community.blocks.title"), description: t("community.blocks.help"), noindex: true }));
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/" }, { label: t("community.title"), to: "/community" }, { label: t("community.blocks.title") }]);
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("community-blocks", async () => (await request("community/blocks")).data)), __temp = await __temp, __restore(), __temp);
    const busy = ref(null);
    async function unblock(b) {
      busy.value = b.id;
      try {
        await request(`community/blocks/${b.id}`, { method: "DELETE" });
        toast.success(t("community.blocks.removed"));
        await refresh();
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busy.value = null;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$3;
      const _component_UiButton = _sfc_main$3$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("community.blocks.title"))}</h1><p class="mt-1 mb-6 text-ink-soft">${ssrInterpolate(unref(t)("community.blocks.help"))}</p>`);
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
          title: unref(t)("community.blocks.emptyTitle"),
          description: unref(t)("community.blocks.empty"),
          icon: "check"
        }, null, _parent));
      } else {
        _push(`<ul class="space-y-2"><!--[-->`);
        ssrRenderList(unref(data), (b, i) => {
          _push(`<li class="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-surface p-3"><p>${ssrInterpolate(unref(t)("community.blocks.member", { n: i + 1 }))}`);
          if (b.blocked_at) {
            _push(`<span class="text-sm text-muted"> \xB7 ${ssrInterpolate(unref(t)("community.blocks.since", { date: unref(formatDate)(b.blocked_at, unref(locale)) }))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</p>`);
          _push(ssrRenderComponent(_component_UiButton, {
            variant: "secondary",
            loading: unref(busy) === b.id,
            onClick: ($event) => unblock(b)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("community.blocks.unblock"))}<span class="sr-only"${_scopeId}>${ssrInterpolate(unref(t)("community.blocks.member", { n: i + 1 }))}</span>`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("community.blocks.unblock")), 1),
                  createVNode("span", { class: "sr-only" }, toDisplayString(unref(t)("community.blocks.member", { n: i + 1 })), 1)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/community/blocked.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=blocked-jqbL_WqD.mjs.map
