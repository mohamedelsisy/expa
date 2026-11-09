import { u as useExploreModules, _ as _sfc_main$1 } from './useExploreModules-BaJST3ZI.mjs';
import { _ as _sfc_main$2 } from './Card-BxvVO_-_.mjs';
import { u as useI18n, a as useAuthStore, c as useLocalePath, d as _sfc_main$5, e as __nuxt_component_0 } from './server.mjs';
import { _ as _sfc_main$3 } from './Badge-PdKIsny2.mjs';
import { defineComponent, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import './useCommunity-pk23xdcX.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "explore",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t } = useI18n();
    useSeo(() => ({ title: t("explore.title"), description: t("explore.subtitle") }));
    const auth = useAuthStore();
    const localePath = useLocalePath();
    const { modules, community } = useExploreModules();
    [__temp, __restore] = withAsyncContext(() => community.load()), await __temp, __restore();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SearchBox = _sfc_main$1;
      const _component_UiCard = _sfc_main$2;
      const _component_UiIcon = _sfc_main$5;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}><header class="mb-8 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("explore.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("explore.subtitle"))}</p></header><div class="mb-8 max-w-xl lg:hidden">`);
      _push(ssrRenderComponent(_component_SearchBox, null, null, _parent));
      _push(`</div><ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
      ssrRenderList(unref(modules), (m) => {
        _push(`<li>`);
        _push(ssrRenderComponent(_component_UiCard, {
          as: "article",
          class: "relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="grid size-12 place-items-center rounded-full bg-primary-soft text-primary-strong"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: m.icon,
                size: 24
              }, null, _parent2, _scopeId));
              _push2(`</span><h2 class="text-lg font-bold"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: unref(localePath)(m.to),
                class: "after:absolute after:inset-0 after:content-['']"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)(`explore.modules.${m.key}.title`))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)(`explore.modules.${m.key}.title`)), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</h2><p class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)(`explore.modules.${m.key}.body`))}</p>`);
              if (m.auth && !unref(auth).isAuthenticated) {
                _push2(ssrRenderComponent(_component_UiBadge, { class: "mt-auto self-start" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("explore.needsAccount"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("explore.needsAccount")), 1)
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
                createVNode("span", { class: "grid size-12 place-items-center rounded-full bg-primary-soft text-primary-strong" }, [
                  createVNode(_component_UiIcon, {
                    name: m.icon,
                    size: 24
                  }, null, 8, ["name"])
                ]),
                createVNode("h2", { class: "text-lg font-bold" }, [
                  createVNode(_component_NuxtLink, {
                    to: unref(localePath)(m.to),
                    class: "after:absolute after:inset-0 after:content-['']"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)(`explore.modules.${m.key}.title`)), 1)
                    ]),
                    _: 2
                  }, 1032, ["to"])
                ]),
                createVNode("p", { class: "text-ink-soft" }, toDisplayString(unref(t)(`explore.modules.${m.key}.body`)), 1),
                m.auth && !unref(auth).isAuthenticated ? (openBlock(), createBlock(_component_UiBadge, {
                  key: 0,
                  class: "mt-auto self-start"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("explore.needsAccount")), 1)
                  ]),
                  _: 1
                })) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/explore.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=explore-DD-9w3zq.mjs.map
