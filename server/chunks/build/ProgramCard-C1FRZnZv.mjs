import { _ as _sfc_main$1 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$2 } from './Badge-PdKIsny2.mjs';
import { u as useI18n, c as useLocalePath, e as __nuxt_component_0, z as formatDay } from './server.mjs';
import { defineComponent, computed, mergeProps, withCtx, createTextVNode, toDisplayString, unref, createVNode, openBlock, createBlock, createCommentVNode, Fragment, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { f as formatMoney } from './money-CRo_itTF.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ProgramCard",
  __ssrInlineRender: true,
  props: {
    program: {},
    showMatch: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const { t, locale } = useI18n();
    const localePath = useLocalePath();
    const tuition = computed(() => {
      var _a;
      const x = props.program.tuition;
      if (!x || x.min == null && x.max == null) return null;
      const f = (n) => formatMoney(n, x.currency, locale.value);
      return x.min != null && x.max != null && x.min !== x.max ? `${f(x.min)}\u2013${f(x.max)}` : f((_a = x.min) != null ? _a : x.max);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiCard = _sfc_main$1;
      const _component_UiBadge = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      _push(ssrRenderComponent(_component_UiCard, mergeProps({
        as: "article",
        class: "relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a, _b, _c, _d;
          if (_push2) {
            _push2(`<div class="flex flex-wrap items-center gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(__props.program.degree_level_label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.program.degree_level_label), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UiBadge, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(__props.program.field_label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.program.field_label), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UiBadge, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(__props.program.instruction_language_label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.program.instruction_language_label), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            if (__props.showMatch && ((_a = __props.program.match) == null ? void 0 : _a.score) != null) {
              _push2(ssrRenderComponent(_component_UiBadge, { tone: "success" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("study.matchPercent", { value: __props.program.match.score }))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("study.matchPercent", { value: __props.program.match.score })), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><h2 class="text-lg font-bold"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: unref(localePath)(`/study/programs/${__props.program.slug}`),
              class: "after:absolute after:inset-0 after:content-['']"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(__props.program.title)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.program.title), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</h2><p class="text-ink-soft"${_scopeId}>${ssrInterpolate(__props.program.university.name)}`);
            if (__props.program.university.city) {
              _push2(`<!--[--> \xB7 ${ssrInterpolate(__props.program.university.city.name)}<!--]-->`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</p>`);
            if (__props.program.summary) {
              _push2(`<p class="line-clamp-3 text-ink-soft"${_scopeId}>${ssrInterpolate(__props.program.summary)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<dl class="mt-auto grid grid-cols-2 gap-x-3 gap-y-1 pt-2 text-sm"${_scopeId}><div${_scopeId}><dt class="text-muted"${_scopeId}>${ssrInterpolate(unref(t)("study.tuition"))}</dt><dd class="font-medium tabular-nums"${_scopeId}><bdi${_scopeId}>${ssrInterpolate((_b = unref(tuition)) != null ? _b : unref(t)("study.notStated"))}</bdi></dd></div><div${_scopeId}><dt class="text-muted"${_scopeId}>${ssrInterpolate(unref(t)("study.deadline"))}</dt><dd class="font-medium"${_scopeId}>${ssrInterpolate(__props.program.deadline.date ? unref(formatDay)(__props.program.deadline.date, unref(locale)) : unref(t)("study.notStated"))}`);
            if (__props.program.deadline.status === "passed") {
              _push2(`<span class="text-danger"${_scopeId}> \xB7 ${ssrInterpolate(unref(t)("study.passed"))}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</dd></div></dl>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-wrap items-center gap-2" }, [
                createVNode(_component_UiBadge, { tone: "primary" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(__props.program.degree_level_label), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_UiBadge, null, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(__props.program.field_label), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_UiBadge, null, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(__props.program.instruction_language_label), 1)
                  ]),
                  _: 1
                }),
                __props.showMatch && ((_c = __props.program.match) == null ? void 0 : _c.score) != null ? (openBlock(), createBlock(_component_UiBadge, {
                  key: 0,
                  tone: "success"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("study.matchPercent", { value: __props.program.match.score })), 1)
                  ]),
                  _: 1
                })) : createCommentVNode("", true)
              ]),
              createVNode("h2", { class: "text-lg font-bold" }, [
                createVNode(_component_NuxtLink, {
                  to: unref(localePath)(`/study/programs/${__props.program.slug}`),
                  class: "after:absolute after:inset-0 after:content-['']"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(__props.program.title), 1)
                  ]),
                  _: 1
                }, 8, ["to"])
              ]),
              createVNode("p", { class: "text-ink-soft" }, [
                createTextVNode(toDisplayString(__props.program.university.name), 1),
                __props.program.university.city ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                  createTextVNode(" \xB7 " + toDisplayString(__props.program.university.city.name), 1)
                ], 64)) : createCommentVNode("", true)
              ]),
              __props.program.summary ? (openBlock(), createBlock("p", {
                key: 0,
                class: "line-clamp-3 text-ink-soft"
              }, toDisplayString(__props.program.summary), 1)) : createCommentVNode("", true),
              createVNode("dl", { class: "mt-auto grid grid-cols-2 gap-x-3 gap-y-1 pt-2 text-sm" }, [
                createVNode("div", null, [
                  createVNode("dt", { class: "text-muted" }, toDisplayString(unref(t)("study.tuition")), 1),
                  createVNode("dd", { class: "font-medium tabular-nums" }, [
                    createVNode("bdi", null, toDisplayString((_d = unref(tuition)) != null ? _d : unref(t)("study.notStated")), 1)
                  ])
                ]),
                createVNode("div", null, [
                  createVNode("dt", { class: "text-muted" }, toDisplayString(unref(t)("study.deadline")), 1),
                  createVNode("dd", { class: "font-medium" }, [
                    createTextVNode(toDisplayString(__props.program.deadline.date ? unref(formatDay)(__props.program.deadline.date, unref(locale)) : unref(t)("study.notStated")), 1),
                    __props.program.deadline.status === "passed" ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: "text-danger"
                    }, " \xB7 " + toDisplayString(unref(t)("study.passed")), 1)) : createCommentVNode("", true)
                  ])
                ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/study/ProgramCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=ProgramCard-C1FRZnZv.mjs.map
