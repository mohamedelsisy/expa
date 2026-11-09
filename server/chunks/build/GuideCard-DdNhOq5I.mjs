import { _ as _sfc_main$1 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$2 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$3 } from './SourceBadge-4_eAChkr.mjs';
import { a as _sfc_main$1$1, _ as _sfc_main$4 } from './AutoItalian-BD4PyQ-n.mjs';
import { u as useI18n, c as useLocalePath, e as __nuxt_component_0, w as contentLang, d as _sfc_main$5 } from './server.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, toDisplayString, unref, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttrs, ssrRenderClass } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "GuideCard",
  __ssrInlineRender: true,
  props: {
    guide: {}
  },
  setup(__props) {
    const { t } = useI18n();
    const localePath = useLocalePath();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiCard = _sfc_main$1;
      const _component_UiBadge = _sfc_main$2;
      const _component_UiSourceBadge = _sfc_main$3;
      const _component_UiItalianTerm = _sfc_main$1$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiAutoItalian = _sfc_main$4;
      const _component_UiIcon = _sfc_main$5;
      _push(ssrRenderComponent(_component_UiCard, mergeProps({
        as: "article",
        class: "relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a, _b, _c, _d, _e, _f;
          if (_push2) {
            _push2(`<div class="flex flex-wrap items-center gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(__props.guide.category_label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.guide.category_label), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UiSourceBadge, {
              type: __props.guide.source.type
            }, null, _parent2, _scopeId));
            if (__props.guide.italian_term) {
              _push2(ssrRenderComponent(_component_UiItalianTerm, null, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(__props.guide.italian_term)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(__props.guide.italian_term), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><h2 class="text-lg font-bold"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtLink, mergeProps({
              to: unref(localePath)(`/guides/${__props.guide.slug}`)
            }, unref(contentLang)(__props.guide), { class: "after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-4" }), {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UiAutoItalian, {
                    text: __props.guide.title
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UiAutoItalian, {
                      text: __props.guide.title
                    }, null, 8, ["text"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</h2>`);
            if (__props.guide.summary) {
              _push2(`<p${ssrRenderAttrs(mergeProps({ class: "line-clamp-3 text-ink-soft" }, unref(contentLang)(__props.guide)))}${_scopeId}>${ssrInterpolate(__props.guide.summary)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="mt-auto space-y-1 pt-2 text-sm text-muted"${_scopeId}>`);
            if (__props.guide.city || __props.guide.region) {
              _push2(`<p class="flex items-center gap-1.5"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "map",
                size: 16
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate((_c = (_a = __props.guide.city) == null ? void 0 : _a.name) != null ? _c : (_b = __props.guide.region) == null ? void 0 : _b.name)}</p>`);
            } else {
              _push2(`<p class="flex items-center gap-1.5"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "map",
                size: 16
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("guides.national"))}</p>`);
            }
            if (__props.guide.source.freshness !== "fresh") {
              _push2(`<p class="${ssrRenderClass([__props.guide.source.freshness === "stale" ? "text-warning" : "text-danger", "font-medium"])}"${_scopeId}>${ssrInterpolate(unref(t)(`freshness.state.${__props.guide.source.freshness}`))}</p>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.guide.fallback) {
              _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("guides.shownIn", { language: unref(t)(`languages.${__props.guide.locale}`) }))}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-wrap items-center gap-2" }, [
                createVNode(_component_UiBadge, { tone: "primary" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(__props.guide.category_label), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_UiSourceBadge, {
                  type: __props.guide.source.type
                }, null, 8, ["type"]),
                __props.guide.italian_term ? (openBlock(), createBlock(_component_UiItalianTerm, { key: 0 }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(__props.guide.italian_term), 1)
                  ]),
                  _: 1
                })) : createCommentVNode("", true)
              ]),
              createVNode("h2", { class: "text-lg font-bold" }, [
                createVNode(_component_NuxtLink, mergeProps({
                  to: unref(localePath)(`/guides/${__props.guide.slug}`)
                }, unref(contentLang)(__props.guide), { class: "after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-4" }), {
                  default: withCtx(() => [
                    createVNode(_component_UiAutoItalian, {
                      text: __props.guide.title
                    }, null, 8, ["text"])
                  ]),
                  _: 1
                }, 16, ["to"])
              ]),
              __props.guide.summary ? (openBlock(), createBlock("p", mergeProps({
                key: 0,
                class: "line-clamp-3 text-ink-soft"
              }, unref(contentLang)(__props.guide)), toDisplayString(__props.guide.summary), 17)) : createCommentVNode("", true),
              createVNode("div", { class: "mt-auto space-y-1 pt-2 text-sm text-muted" }, [
                __props.guide.city || __props.guide.region ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "flex items-center gap-1.5"
                }, [
                  createVNode(_component_UiIcon, {
                    name: "map",
                    size: 16
                  }),
                  createTextVNode(toDisplayString((_f = (_d = __props.guide.city) == null ? void 0 : _d.name) != null ? _f : (_e = __props.guide.region) == null ? void 0 : _e.name), 1)
                ])) : (openBlock(), createBlock("p", {
                  key: 1,
                  class: "flex items-center gap-1.5"
                }, [
                  createVNode(_component_UiIcon, {
                    name: "map",
                    size: 16
                  }),
                  createTextVNode(toDisplayString(unref(t)("guides.national")), 1)
                ])),
                __props.guide.source.freshness !== "fresh" ? (openBlock(), createBlock("p", {
                  key: 2,
                  class: ["font-medium", __props.guide.source.freshness === "stale" ? "text-warning" : "text-danger"]
                }, toDisplayString(unref(t)(`freshness.state.${__props.guide.source.freshness}`)), 3)) : createCommentVNode("", true),
                __props.guide.fallback ? (openBlock(), createBlock("p", { key: 3 }, toDisplayString(unref(t)("guides.shownIn", { language: unref(t)(`languages.${__props.guide.locale}`) })), 1)) : createCommentVNode("", true)
              ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/guide/GuideCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=GuideCard-DdNhOq5I.mjs.map
