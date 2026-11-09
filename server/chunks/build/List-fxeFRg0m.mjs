import { u as useI18n, c as useLocalePath, _ as _sfc_main$3, d as _sfc_main$5, e as __nuxt_component_0 } from './server.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, resolveDynamicComponent, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderVNode } from 'vue/server-renderer';
import { m as mapApiRoute } from './routes-BNQ9Jhms.mjs';
import { _ as _sfc_main$4 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$1 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$2 } from './EmptyState-N2xvHts8.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "List",
  __ssrInlineRender: true,
  props: {
    recs: {},
    headingLevel: {},
    idPrefix: {},
    notice: { type: Boolean, default: true }
  },
  setup(__props) {
    const props = __props;
    const { t } = useI18n();
    const localePath = useLocalePath();
    const H = computed(() => {
      var _a;
      return `h${(_a = props.headingLevel) != null ? _a : 2}`;
    });
    const pfx = computed(() => {
      var _a;
      return (_a = props.idPrefix) != null ? _a : "recs";
    });
    const sections = computed(() => [
      { key: "guides", icon: "book", items: props.recs.guides },
      { key: "lessons", icon: "sparkle", items: props.recs.lessons },
      { key: "services", icon: "user", items: props.recs.services },
      { key: "reminders", icon: "bell", items: props.recs.reminders }
    ]);
    const visible = computed(() => sections.value.filter((s) => s.items.length > 0));
    const empty = computed(() => visible.value.length === 0);
    const to = (route) => {
      const p = mapApiRoute(route);
      return p ? localePath(p) : null;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "space-y-6",
        "data-testid": "recs"
      }, _attrs))}>`);
      if (__props.notice && !__props.recs.personalization.enabled) {
        _push(ssrRenderComponent(_sfc_main$1, {
          tone: "info",
          title: unref(t)("recs.offTitle"),
          "data-testid": "recs-off"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("recs.off"))}</p>`);
              _push2(ssrRenderComponent(_sfc_main$3, {
                to: "/privacy-settings",
                variant: "secondary",
                class: "mt-3"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("recs.offCta"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("recs.offCta")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode("p", null, toDisplayString(unref(t)("recs.off")), 1),
                createVNode(_sfc_main$3, {
                  to: "/privacy-settings",
                  variant: "secondary",
                  class: "mt-3"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("recs.offCta")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (empty.value) {
        _push(ssrRenderComponent(_sfc_main$2, {
          title: unref(t)("recs.emptyTitle"),
          description: __props.recs.personalization.enabled ? unref(t)("recs.empty") : unref(t)("recs.emptyOff"),
          icon: "compass"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(visible.value, (s) => {
        _push(`<section${ssrRenderAttr("aria-labelledby", `${pfx.value}-${s.key}`)} class="space-y-3"${ssrRenderAttr("data-testid", `recs-${s.key}`)}>`);
        ssrRenderVNode(_push, createVNode(resolveDynamicComponent(H.value), {
          id: `${pfx.value}-${s.key}`,
          class: "flex items-center gap-2 text-lg font-bold"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="grid size-8 place-items-center rounded-full bg-primary-soft text-primary-strong"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$5, {
                name: s.icon,
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`</span>${ssrInterpolate(unref(t)(`recs.sections.${s.key}`))}`);
            } else {
              return [
                createVNode("span", { class: "grid size-8 place-items-center rounded-full bg-primary-soft text-primary-strong" }, [
                  createVNode(_sfc_main$5, {
                    name: s.icon,
                    size: 18
                  }, null, 8, ["name"])
                ]),
                createTextVNode(toDisplayString(unref(t)(`recs.sections.${s.key}`)), 1)
              ];
            }
          }),
          _: 2
        }), _parent);
        if (s.key === "services") {
          _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("recs.servicesNote"))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<ul class="grid gap-3 sm:grid-cols-2"><!--[-->`);
        ssrRenderList(s.items, (it) => {
          _push(`<li class="flex flex-col gap-2 rounded-lg border border-line bg-surface p-4" data-testid="rec-item"><p class="flex flex-wrap items-center gap-2 font-semibold">`);
          if (to(it.route)) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: to(it.route),
              class: "underline-offset-4 hover:underline",
              dir: "auto"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(it.title)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(it.title), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<span dir="auto">${ssrInterpolate(it.title)}</span>`);
          }
          if (it.type === "service") {
            _push(`<!--[-->`);
            _push(ssrRenderComponent(_sfc_main$4, {
              tone: "warning",
              "data-testid": "rec-third-party"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("recs.thirdParty"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("recs.thirdParty")), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_sfc_main$4, { tone: "neutral" }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)(`recs.verification.${it.verification}`))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)(`recs.verification.${it.verification}`)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`</p><p class="text-sm text-ink-soft" data-testid="rec-reason"><span class="font-medium">${ssrInterpolate(unref(t)("recs.why"))}:</span> ${ssrInterpolate(it.reason.text)}</p></li>`);
        });
        _push(`<!--]--></ul></section>`);
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/recs/List.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=List-fxeFRg0m.mjs.map
