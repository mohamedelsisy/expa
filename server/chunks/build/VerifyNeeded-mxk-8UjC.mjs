import { _ as _sfc_main$1 } from './Alert-D-zfMDy5.mjs';
import { u as useI18n, g as useApi, _ as _sfc_main$3, j as isApiError } from './server.mjs';
import { defineComponent, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "VerifyNeeded",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    const sending = ref(false);
    async function resend() {
      sending.value = true;
      try {
        await request("auth/resend-verification", { method: "POST" });
        toast.success(t("verify.resent"));
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        sending.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiAlert = _sfc_main$1;
      const _component_UiButton = _sfc_main$3;
      _push(ssrRenderComponent(_component_UiAlert, mergeProps({
        tone: "warning",
        title: unref(t)("verify.neededTitle"),
        "data-testid": "verify-needed"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("verify.neededBody"))}</p>`);
            _push2(ssrRenderComponent(_component_UiButton, {
              variant: "secondary",
              class: "mt-3",
              loading: unref(sending),
              onClick: resend
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(t)("verify.resend"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("verify.resend")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("p", null, toDisplayString(unref(t)("verify.neededBody")), 1),
              createVNode(_component_UiButton, {
                variant: "secondary",
                class: "mt-3",
                loading: unref(sending),
                onClick: resend
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(t)("verify.resend")), 1)
                ]),
                _: 1
              }, 8, ["loading"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/auth/VerifyNeeded.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=VerifyNeeded-mxk-8UjC.mjs.map
