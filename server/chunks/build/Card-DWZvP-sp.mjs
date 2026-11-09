import { _ as _sfc_main$1 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$2 } from './Badge-PdKIsny2.mjs';
import { u as useI18n, c as useLocalePath, e as __nuxt_component_0, w as contentLang, k as formatDate, d as _sfc_main$5 } from './server.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, toDisplayString, unref, createVNode, openBlock, createBlock, createCommentVNode, Fragment, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttrs, ssrRenderAttr } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Card",
  __ssrInlineRender: true,
  props: {
    article: {}
  },
  setup(__props) {
    const { t, locale } = useI18n();
    const localePath = useLocalePath();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiCard = _sfc_main$1;
      const _component_UiBadge = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiIcon = _sfc_main$5;
      _push(ssrRenderComponent(_component_UiCard, mergeProps({
        as: "article",
        class: "relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-wrap items-center gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(__props.article.category_label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.article.category_label), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UiBadge, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(t)("articles.editorial"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("articles.editorial")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><h2 class="text-lg font-bold"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtLink, mergeProps({
              to: unref(localePath)(`/articles/${__props.article.slug}`)
            }, unref(contentLang)(__props.article), { class: "after:absolute after:inset-0 after:content-['']" }), {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(__props.article.title)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.article.title), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</h2>`);
            if (__props.article.excerpt) {
              _push2(`<p${ssrRenderAttrs(mergeProps({ class: "line-clamp-3 text-ink-soft" }, unref(contentLang)(__props.article)))}${_scopeId}>${ssrInterpolate(__props.article.excerpt)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="mt-auto space-y-1 pt-2 text-sm text-muted"${_scopeId}>`);
            if (__props.article.published_at) {
              _push2(`<p${_scopeId}><time${ssrRenderAttr("datetime", __props.article.published_at)}${_scopeId}>${ssrInterpolate(unref(formatDate)(__props.article.published_at, unref(locale)))}</time>`);
              if (__props.article.reading_minutes) {
                _push2(`<!--[--> \xB7 ${ssrInterpolate(unref(t)("articles.readingMinutes", { count: __props.article.reading_minutes }))}<!--]-->`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</p>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.article.city) {
              _push2(`<p class="flex items-center gap-1.5"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "map",
                size: 16
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(__props.article.city.name)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.article.fallback) {
              _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("guides.shownIn", { language: unref(t)(`languages.${__props.article.locale}`) }))}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-wrap items-center gap-2" }, [
                createVNode(_component_UiBadge, { tone: "primary" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(__props.article.category_label), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_UiBadge, null, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("articles.editorial")), 1)
                  ]),
                  _: 1
                })
              ]),
              createVNode("h2", { class: "text-lg font-bold" }, [
                createVNode(_component_NuxtLink, mergeProps({
                  to: unref(localePath)(`/articles/${__props.article.slug}`)
                }, unref(contentLang)(__props.article), { class: "after:absolute after:inset-0 after:content-['']" }), {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(__props.article.title), 1)
                  ]),
                  _: 1
                }, 16, ["to"])
              ]),
              __props.article.excerpt ? (openBlock(), createBlock("p", mergeProps({
                key: 0,
                class: "line-clamp-3 text-ink-soft"
              }, unref(contentLang)(__props.article)), toDisplayString(__props.article.excerpt), 17)) : createCommentVNode("", true),
              createVNode("div", { class: "mt-auto space-y-1 pt-2 text-sm text-muted" }, [
                __props.article.published_at ? (openBlock(), createBlock("p", { key: 0 }, [
                  createVNode("time", {
                    datetime: __props.article.published_at
                  }, toDisplayString(unref(formatDate)(__props.article.published_at, unref(locale))), 9, ["datetime"]),
                  __props.article.reading_minutes ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                    createTextVNode(" \xB7 " + toDisplayString(unref(t)("articles.readingMinutes", { count: __props.article.reading_minutes })), 1)
                  ], 64)) : createCommentVNode("", true)
                ])) : createCommentVNode("", true),
                __props.article.city ? (openBlock(), createBlock("p", {
                  key: 1,
                  class: "flex items-center gap-1.5"
                }, [
                  createVNode(_component_UiIcon, {
                    name: "map",
                    size: 16
                  }),
                  createTextVNode(toDisplayString(__props.article.city.name), 1)
                ])) : createCommentVNode("", true),
                __props.article.fallback ? (openBlock(), createBlock("p", { key: 2 }, toDisplayString(unref(t)("guides.shownIn", { language: unref(t)(`languages.${__props.article.locale}`) })), 1)) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/articles/Card.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Card-DWZvP-sp.mjs.map
