import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './VerifyNotice-j4MOQa_K.mjs';
import { _ as _sfc_main$3 } from './Card-BxvVO_-_.mjs';
import { u as useI18n, g as useApi, c as useLocalePath, d as _sfc_main$5, e as __nuxt_component_0 } from './server.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import './safe-B2eSdAXJ.mjs';
import './Alert-D-zfMDy5.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const localePath = useLocalePath();
    useSeo(() => ({ title: t("study.seo.title"), description: t("study.seo.description") }));
    const { data: meta } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("study-meta", async () => (await request("study/meta")).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const tiles = [
      { to: "/study/finder", key: "finder", icon: "sparkle" },
      { to: "/study/programs", key: "programs", icon: "book" },
      { to: "/study/universities", key: "universities", icon: "building" },
      { to: "/study/scholarships", key: "scholarships", icon: "euro" }
    ];
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/" }, { label: t("study.title") }]);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_StudyVerifyNotice = _sfc_main$2;
      const _component_UiCard = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-6 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("study.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("study.subtitle"))}</p></header>`);
      _push(ssrRenderComponent(_component_StudyVerifyNotice, {
        text: (_a = unref(meta)) == null ? void 0 : _a.verify_notice,
        class: "mb-6"
      }, null, _parent));
      _push(`<ul class="grid gap-4 sm:grid-cols-2"><!--[-->`);
      ssrRenderList(tiles, (x) => {
        _push(`<li>`);
        _push(ssrRenderComponent(_component_UiCard, {
          as: "article",
          class: "relative flex h-full flex-col gap-2 transition-shadow focus-within:shadow-3 hover:shadow-2"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="grid size-11 place-items-center rounded-md bg-primary-soft text-primary-strong"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: x.icon,
                size: 24
              }, null, _parent2, _scopeId));
              _push2(`</span><h2 class="text-lg font-bold"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: unref(localePath)(x.to),
                class: "after:absolute after:inset-0 after:content-['']"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)(`study.tiles.${x.key}.title`))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)(`study.tiles.${x.key}.title`)), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</h2><p class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)(`study.tiles.${x.key}.body`))}</p>`);
            } else {
              return [
                createVNode("span", { class: "grid size-11 place-items-center rounded-md bg-primary-soft text-primary-strong" }, [
                  createVNode(_component_UiIcon, {
                    name: x.icon,
                    size: 24
                  }, null, 8, ["name"])
                ]),
                createVNode("h2", { class: "text-lg font-bold" }, [
                  createVNode(_component_NuxtLink, {
                    to: unref(localePath)(x.to),
                    class: "after:absolute after:inset-0 after:content-['']"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)(`study.tiles.${x.key}.title`)), 1)
                    ]),
                    _: 2
                  }, 1032, ["to"])
                ]),
                createVNode("p", { class: "text-ink-soft" }, toDisplayString(unref(t)(`study.tiles.${x.key}.body`)), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/study/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CoLJYiYz.mjs.map
