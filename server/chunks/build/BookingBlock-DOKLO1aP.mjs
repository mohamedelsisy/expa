import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
import { a as safeHttpsUrl } from './safe-B2eSdAXJ.mjs';
import { u as useI18n, d as _sfc_main$5 } from './server.mjs';
import { u as useAnalytics } from './useAnalytics-Dh-8IvGy.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "BookingBlock",
  __ssrInlineRender: true,
  props: {
    booking: {},
    subject: {}
  },
  setup(__props) {
    const props = __props;
    const { t } = useI18n();
    useAnalytics();
    const url = computed(() => safeHttpsUrl(props.booking.url));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "space-y-2 rounded-md border border-line bg-sunken p-3",
        "data-testid": "booking-block"
      }, _attrs))}><p class="flex flex-wrap items-center gap-2 font-medium">`);
      _push(ssrRenderComponent(_sfc_main$5, {
        name: "calendar",
        size: 16
      }, null, _parent));
      _push(`${ssrInterpolate(unref(t)("gov.bookingMethod"))}: <span data-testid="booking-method">${ssrInterpolate(__props.booking.method_label)}</span></p>`);
      if (url.value) {
        _push(`<a${ssrRenderAttr("href", url.value)} target="_blank" rel="noopener noreferrer" class="inline-flex min-h-touch items-center gap-2 font-medium text-primary-strong underline underline-offset-4" data-testid="booking-link">${ssrInterpolate(unref(t)("gov.bookingGo"))}`);
        _push(ssrRenderComponent(_sfc_main$5, {
          name: "external",
          size: 16
        }, null, _parent));
        _push(`<span class="sr-only">${ssrInterpolate(unref(t)("a11y.opensNewTab"))}</span></a>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<p class="flex items-start gap-2 text-sm text-ink" data-testid="booking-notice">`);
      _push(ssrRenderComponent(_sfc_main$5, {
        name: "info",
        size: 16,
        class: "mt-0.5 text-info"
      }, null, _parent));
      _push(`${ssrInterpolate(__props.booking.notice)}</p></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/gov/BookingBlock.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=BookingBlock-DOKLO1aP.mjs.map
