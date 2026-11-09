import { _ as _sfc_main$1 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$2 } from './Links-BHP4RLan.mjs';
import { u as useI18n, g as useApi, _ as _sfc_main$3, j as isApiError } from './server.mjs';
import { defineComponent, withAsyncContext, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Gate",
  __ssrInlineRender: true,
  props: {
    purpose: {}
  },
  emits: ["granted"],
  async setup(__props, { emit: __emit }) {
    let __temp, __restore;
    const props = __props;
    const emit = __emit;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    const { data } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(() => `purposes-${props.purpose}-${locale.value}`, async () => {
      var _a;
      try {
        const res = await request("privacy/purposes");
        return (_a = res.data.purposes.find((p) => p.key === props.purpose)) != null ? _a : null;
      } catch {
        return null;
      }
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const granting = ref(false);
    async function grant() {
      granting.value = true;
      try {
        await request("profile/consents", { method: "PUT", body: { consents: { [props.purpose]: true } } });
        toast.success(t("consentGate.granted"));
        emit("granted");
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        granting.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_UiAlert = _sfc_main$1;
      const _component_LegalLinks = _sfc_main$2;
      const _component_UiButton = _sfc_main$3;
      _push(ssrRenderComponent(_component_UiAlert, mergeProps({
        tone: "info",
        title: (_b = (_a = unref(data)) == null ? void 0 : _a.title) != null ? _b : unref(t)("consentGate.title"),
        "data-testid": "consent-gate"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b2, _c, _d, _e, _f;
          if (_push2) {
            _push2(`<p${_scopeId}>${ssrInterpolate((_b2 = (_a2 = unref(data)) == null ? void 0 : _a2.why) != null ? _b2 : unref(t)(`consentGate.why.${__props.purpose}`))}</p>`);
            if ((_c = unref(data)) == null ? void 0 : _c.data) {
              _push2(`<details class="mt-2 text-sm"${_scopeId}><summary class="inline-flex min-h-touch cursor-pointer items-center font-medium text-primary-strong"${_scopeId}>${ssrInterpolate(unref(t)("privacy.dataCollected"))}</summary><p class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(data).data)}</p></details>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<p class="mt-2 text-sm text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("consentGate.withdraw"))}</p>`);
            _push2(ssrRenderComponent(_component_LegalLinks, { class: "mt-2" }, null, _parent2, _scopeId));
            _push2(`<div class="mt-3 flex flex-wrap gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiButton, {
              loading: unref(granting),
              onClick: grant
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(t)("consentGate.allow"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("consentGate.allow")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UiButton, {
              to: "/privacy-settings",
              variant: "secondary"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(t)("nav.privacy"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("nav.privacy")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("p", null, toDisplayString((_e = (_d = unref(data)) == null ? void 0 : _d.why) != null ? _e : unref(t)(`consentGate.why.${__props.purpose}`)), 1),
              ((_f = unref(data)) == null ? void 0 : _f.data) ? (openBlock(), createBlock("details", {
                key: 0,
                class: "mt-2 text-sm"
              }, [
                createVNode("summary", { class: "inline-flex min-h-touch cursor-pointer items-center font-medium text-primary-strong" }, toDisplayString(unref(t)("privacy.dataCollected")), 1),
                createVNode("p", { class: "text-ink-soft" }, toDisplayString(unref(data).data), 1)
              ])) : createCommentVNode("", true),
              createVNode("p", { class: "mt-2 text-sm text-ink-soft" }, toDisplayString(unref(t)("consentGate.withdraw")), 1),
              createVNode(_component_LegalLinks, { class: "mt-2" }),
              createVNode("div", { class: "mt-3 flex flex-wrap gap-2" }, [
                createVNode(_component_UiButton, {
                  loading: unref(granting),
                  onClick: grant
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("consentGate.allow")), 1)
                  ]),
                  _: 1
                }, 8, ["loading"]),
                createVNode(_component_UiButton, {
                  to: "/privacy-settings",
                  variant: "secondary"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("nav.privacy")), 1)
                  ]),
                  _: 1
                })
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/consent/Gate.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Gate-CrfDaJ02.mjs.map
