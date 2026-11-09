import { _ as _sfc_main$1 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$2 } from './Badge-PdKIsny2.mjs';
import { u as useI18n, c as useLocalePath, e as __nuxt_component_0 } from './server.mjs';
import { defineComponent, computed, mergeProps, withCtx, createTextVNode, toDisplayString, unref, createVNode, openBlock, createBlock, createCommentVNode, Fragment, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { a as formatSalary } from './money-CRo_itTF.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "JobCard",
  __ssrInlineRender: true,
  props: {
    job: {}
  },
  setup(__props) {
    const props = __props;
    const { t, locale } = useI18n();
    const localePath = useLocalePath();
    const salary = computed(() => formatSalary(props.job.salary, locale.value, (p) => t(`jobs.period.${p}`)));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiCard = _sfc_main$1;
      const _component_UiBadge = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
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
                  _push3(`${ssrInterpolate(__props.job.category_label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.job.category_label), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UiBadge, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(__props.job.employment_type_label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.job.employment_type_label), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UiBadge, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(__props.job.remote_mode_label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.job.remote_mode_label), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            if (((_a = __props.job.match) == null ? void 0 : _a.score) != null) {
              _push2(ssrRenderComponent(_component_UiBadge, { tone: "success" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("jobs.matchPercent", { value: __props.job.match.score }))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("jobs.matchPercent", { value: __props.job.match.score })), 1)
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
              to: unref(localePath)(`/jobs/${__props.job.id}`),
              class: "after:absolute after:inset-0 after:content-['']"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(__props.job.title)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.job.title), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</h2><p class="text-ink-soft"${_scopeId}>${ssrInterpolate(__props.job.company)}`);
            if (__props.job.city || __props.job.location) {
              _push2(`<!--[--> \xB7 ${ssrInterpolate((_c = (_b = __props.job.city) == null ? void 0 : _b.name) != null ? _c : __props.job.location)}<!--]-->`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</p>`);
            if (unref(salary)) {
              _push2(`<p class="text-sm font-medium tabular-nums"${_scopeId}><bdi${_scopeId}>${ssrInterpolate(unref(salary))}</bdi></p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<p class="mt-auto text-sm text-muted"${_scopeId}>${ssrInterpolate(__props.job.visa_sponsorship.label)}`);
            if (__props.job.source) {
              _push2(`<!--[--> \xB7 ${ssrInterpolate(unref(t)("jobs.via", { source: __props.job.source }))}<!--]-->`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</p>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-wrap items-center gap-2" }, [
                createVNode(_component_UiBadge, { tone: "primary" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(__props.job.category_label), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_UiBadge, null, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(__props.job.employment_type_label), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_UiBadge, null, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(__props.job.remote_mode_label), 1)
                  ]),
                  _: 1
                }),
                ((_d = __props.job.match) == null ? void 0 : _d.score) != null ? (openBlock(), createBlock(_component_UiBadge, {
                  key: 0,
                  tone: "success"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("jobs.matchPercent", { value: __props.job.match.score })), 1)
                  ]),
                  _: 1
                })) : createCommentVNode("", true)
              ]),
              createVNode("h2", { class: "text-lg font-bold" }, [
                createVNode(_component_NuxtLink, {
                  to: unref(localePath)(`/jobs/${__props.job.id}`),
                  class: "after:absolute after:inset-0 after:content-['']"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(__props.job.title), 1)
                  ]),
                  _: 1
                }, 8, ["to"])
              ]),
              createVNode("p", { class: "text-ink-soft" }, [
                createTextVNode(toDisplayString(__props.job.company), 1),
                __props.job.city || __props.job.location ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                  createTextVNode(" \xB7 " + toDisplayString((_f = (_e = __props.job.city) == null ? void 0 : _e.name) != null ? _f : __props.job.location), 1)
                ], 64)) : createCommentVNode("", true)
              ]),
              unref(salary) ? (openBlock(), createBlock("p", {
                key: 0,
                class: "text-sm font-medium tabular-nums"
              }, [
                createVNode("bdi", null, toDisplayString(unref(salary)), 1)
              ])) : createCommentVNode("", true),
              createVNode("p", { class: "mt-auto text-sm text-muted" }, [
                createTextVNode(toDisplayString(__props.job.visa_sponsorship.label), 1),
                __props.job.source ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                  createTextVNode(" \xB7 " + toDisplayString(unref(t)("jobs.via", { source: __props.job.source })), 1)
                ], 64)) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/jobs/JobCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=JobCard-D1b5_h6j.mjs.map
