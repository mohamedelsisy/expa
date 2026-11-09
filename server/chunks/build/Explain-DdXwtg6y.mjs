import { u as useI18n, g as useApi, a as useAuthStore, f as useRoute, d as _sfc_main$5, _ as _sfc_main$3, j as isApiError } from './server.mjs';
import { _ as _sfc_main$1 } from './VerifyNeeded-mxk-8UjC.mjs';
import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { a as explainErrorHint, _ as _sfc_main$4, e as explainBody } from './patenteExplain-CPOOCBVz.mjs';
import { defineComponent, ref, computed, mergeProps, createVNode, resolveDynamicComponent, withCtx, unref, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderVNode, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Explain",
  __ssrInlineRender: true,
  props: {
    kind: {},
    slug: {},
    title: {},
    level: { default: 2 }
  },
  setup(__props) {
    const props = __props;
    const { t } = useI18n();
    const { request } = useApi();
    const auth = useAuthStore();
    const route = useRoute();
    const loading = ref(false);
    const answer = ref(null);
    const conversationId = ref(null);
    const remaining = ref(null);
    const err = ref(null);
    const hint = computed(() => err.value ? explainErrorHint(err.value.code) : null);
    const loginTo = computed(() => `/login?redirect=${encodeURIComponent(route.fullPath)}`);
    const msgKey = computed(() => `explain-${props.kind}-${props.slug}`);
    async function run() {
      var _a, _b;
      const body = explainBody(props.kind, props.slug, t(props.kind === "topic" ? "patente.explain.askTopic" : "patente.explain.askQuestion", { title: props.title }));
      if (!body) return;
      loading.value = true;
      err.value = null;
      try {
        const res = await request("ai/ask", { method: "POST", body, timeoutMs: 4e4 });
        answer.value = { ...res.data.message, degraded: res.data.message.degraded || !!res.meta.degraded };
        conversationId.value = res.data.conversation_id;
        remaining.value = (_b = (_a = res.data.usage) == null ? void 0 : _a.remaining) != null ? _b : null;
      } catch (e) {
        err.value = isApiError(e) ? { code: e.code, message: e.message } : { code: "error", message: t("errors.generic") };
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiButton = _sfc_main$3;
      const _component_AuthVerifyNeeded = _sfc_main$1;
      const _component_UiAlert = _sfc_main$2;
      const _component_AskMessage = _sfc_main$4;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "space-y-3 rounded-lg border border-line bg-surface p-5",
        "aria-labelledby": `${msgKey.value}-h`,
        "data-testid": "patente-explain"
      }, _attrs))}>`);
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(`h${__props.level}`), {
        id: `${msgKey.value}-h`,
        class: "flex items-center gap-2 text-lg font-bold"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "sparkle",
              size: 20
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("patente.explain.title"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "sparkle",
                size: 20
              }),
              createTextVNode(toDisplayString(unref(t)("patente.explain.title")), 1)
            ];
          }
        }),
        _: 1
      }), _parent);
      _push(`<p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("patente.explain.intro"))}</p>`);
      if (!unref(auth).isAuthenticated) {
        _push(ssrRenderComponent(_component_UiButton, {
          to: loginTo.value,
          variant: "secondary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("patente.explain.login"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("patente.explain.login")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UiButton, {
          variant: "secondary",
          loading: loading.value,
          disabled: loading.value,
          "data-testid": "explain-btn",
          onClick: run
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "sparkle",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(answer.value ? unref(t)("patente.explain.again") : unref(t)("patente.explain.button"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "sparkle",
                  size: 18
                }),
                createTextVNode(toDisplayString(answer.value ? unref(t)("patente.explain.again") : unref(t)("patente.explain.button")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (remaining.value !== null) {
          _push(`<p class="text-xs text-muted" data-testid="explain-remaining">${ssrInterpolate(unref(t)("patente.explain.remaining", { n: remaining.value }))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      if (((_a = err.value) == null ? void 0 : _a.code) === "email_not_verified") {
        _push(ssrRenderComponent(_component_AuthVerifyNeeded, null, null, _parent));
      } else if (err.value) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "danger",
          title: err.value.code === "ai_limit_reached" ? unref(t)("ask.limitTitle") : unref(t)("ask.errorTitle"),
          "data-testid": "explain-error"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p${_scopeId}>${ssrInterpolate(err.value.message)}</p>`);
              if (hint.value === "limit") {
                _push2(`<p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(unref(t)("ask.limitHint"))}</p>`);
              } else if (hint.value === "slow") {
                _push2(`<p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(unref(t)("ask.slowDownHint"))}</p>`);
              } else if (hint.value === "network") {
                _push2(`<p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(unref(t)("ask.networkHint"))}</p>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode("p", null, toDisplayString(err.value.message), 1),
                hint.value === "limit" ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "mt-1 text-sm"
                }, toDisplayString(unref(t)("ask.limitHint")), 1)) : hint.value === "slow" ? (openBlock(), createBlock("p", {
                  key: 1,
                  class: "mt-1 text-sm"
                }, toDisplayString(unref(t)("ask.slowDownHint")), 1)) : hint.value === "network" ? (openBlock(), createBlock("p", {
                  key: 2,
                  class: "mt-1 text-sm"
                }, toDisplayString(unref(t)("ask.networkHint")), 1)) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (answer.value) {
        _push(`<div class="space-y-3 rounded-lg border border-line bg-canvas p-4" aria-live="polite" data-testid="explain-answer">`);
        _push(ssrRenderComponent(_component_AskMessage, {
          message: answer.value,
          "msg-key": msgKey.value,
          "fallback-query": __props.title
        }, null, _parent));
        _push(`<p class="text-xs text-muted">${ssrInterpolate(unref(t)("patente.explain.note"))}</p>`);
        if (conversationId.value) {
          _push(ssrRenderComponent(_component_UiButton, {
            to: `/ask?c=${conversationId.value}`,
            variant: "ghost"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("patente.explain.continue"))}`);
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "arrow-end",
                  size: 16
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("patente.explain.continue")), 1),
                  createVNode(_component_UiIcon, {
                    name: "arrow-end",
                    size: 16
                  })
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/patente/Explain.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Explain-DdXwtg6y.mjs.map
