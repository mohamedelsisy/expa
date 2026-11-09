import { _ as _sfc_main$1 } from './CategoryLanding-BIMBXLF5.mjs';
import { _ as _sfc_main$2 } from './Card-BxvVO_-_.mjs';
import { u as useI18n, _ as _sfc_main$3, d as _sfc_main$5 } from './server.mjs';
import { defineComponent, mergeProps, withCtx, unref, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import './Breadcrumbs-C7SaJcTR.mjs';
import './useSeo-BU4sLOnV.mjs';
import './safe-B2eSdAXJ.mjs';
import './Alert-D-zfMDy5.mjs';
import './Skeleton-BTnKIEst.mjs';
import './EmptyState-N2xvHts8.mjs';
import './GuideCard-DdNhOq5I.mjs';
import './Badge-PdKIsny2.mjs';
import './SourceBadge-4_eAChkr.mjs';
import './AutoItalian-BD4PyQ-n.mjs';
import './Card-DWZvP-sp.mjs';
import './asyncData-bKJD5Wmv.mjs';
import 'perfect-debounce';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_GuideCategoryLanding = _sfc_main$1;
      const _component_UiCard = _sfc_main$2;
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      _push(ssrRenderComponent(_component_GuideCategoryLanding, mergeProps({
        area: "travel",
        category: "travel",
        "article-category": null,
        path: "/travel",
        icon: "globe"
      }, _attrs), {
        tools: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiCard, {
              as: "section",
              "aria-labelledby": "travel-tools-h",
              class: "flex flex-wrap items-center justify-between gap-4",
              "data-testid": "travel-tool"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="max-w-xl space-y-1"${_scopeId2}><h2 id="travel-tools-h" class="text-lg font-bold"${_scopeId2}>${ssrInterpolate(unref(t)("travel.title"))}</h2><p class="text-ink-soft"${_scopeId2}>${ssrInterpolate(unref(t)("travel.subtitle"))}</p></div>`);
                  _push3(ssrRenderComponent(_component_UiButton, { to: "/travel/requirements" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UiIcon, {
                          name: "globe",
                          size: 18
                        }, null, _parent4, _scopeId3));
                        _push4(`${ssrInterpolate(unref(t)("travel.open"))}`);
                      } else {
                        return [
                          createVNode(_component_UiIcon, {
                            name: "globe",
                            size: 18
                          }),
                          createTextVNode(toDisplayString(unref(t)("travel.open")), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode("div", { class: "max-w-xl space-y-1" }, [
                      createVNode("h2", {
                        id: "travel-tools-h",
                        class: "text-lg font-bold"
                      }, toDisplayString(unref(t)("travel.title")), 1),
                      createVNode("p", { class: "text-ink-soft" }, toDisplayString(unref(t)("travel.subtitle")), 1)
                    ]),
                    createVNode(_component_UiButton, { to: "/travel/requirements" }, {
                      default: withCtx(() => [
                        createVNode(_component_UiIcon, {
                          name: "globe",
                          size: 18
                        }),
                        createTextVNode(toDisplayString(unref(t)("travel.open")), 1)
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiCard, {
                as: "section",
                "aria-labelledby": "travel-tools-h",
                class: "flex flex-wrap items-center justify-between gap-4",
                "data-testid": "travel-tool"
              }, {
                default: withCtx(() => [
                  createVNode("div", { class: "max-w-xl space-y-1" }, [
                    createVNode("h2", {
                      id: "travel-tools-h",
                      class: "text-lg font-bold"
                    }, toDisplayString(unref(t)("travel.title")), 1),
                    createVNode("p", { class: "text-ink-soft" }, toDisplayString(unref(t)("travel.subtitle")), 1)
                  ]),
                  createVNode(_component_UiButton, { to: "/travel/requirements" }, {
                    default: withCtx(() => [
                      createVNode(_component_UiIcon, {
                        name: "globe",
                        size: 18
                      }),
                      createTextVNode(toDisplayString(unref(t)("travel.open")), 1)
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/travel/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BtItY4mp.mjs.map
