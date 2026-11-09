import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, g as useApi, j as isApiError, o as createError, i as _sfc_main$2$1 } from './server.mjs';
import { _ as _sfc_main$3 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$4 } from './OfficeCard-D7gQkLPp.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import './safe-B2eSdAXJ.mjs';
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
import './Card-BxvVO_-_.mjs';
import './Badge-PdKIsny2.mjs';
import './SourceBadge-4_eAChkr.mjs';
import './BookingBlock-DOKLO1aP.mjs';
import './useAnalytics-Dh-8IvGy.mjs';
import './FallbackNotice-CwHuyozE.mjs';
import './Alert-D-zfMDy5.mjs';
import './GuideSource-B-ek0Kys.mjs';
import './FreshnessIndicator-B5-_pVo1.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const { request } = useApi();
    const slug = computed(() => String(route.params.slug));
    const { data: o, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(() => `gov-office-${slug.value}`, async () => (await request(`government/offices/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    useSeo(() => {
      var _a, _b;
      return { title: o.value ? `${o.value.name} | EXPA` : t("gov.title"), description: (_b = (_a = o.value) == null ? void 0 : _a.office_type_label) != null ? _b : t("gov.subtitle") };
    });
    const crumbs = computed(() => {
      var _a, _b;
      return [{ label: t("gov.title"), to: "/government" }, { label: (_b = (_a = o.value) == null ? void 0 : _a.name) != null ? _b : "" }];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiAutoItalian = _sfc_main$3;
      const _component_GovOfficeCard = _sfc_main$4;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      if (unref(status) === "pending" && !unref(o)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 5
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(o)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          "heading-level": 1,
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<div class="space-y-6"><h1 class="text-3xl font-bold">`);
        _push(ssrRenderComponent(_component_UiAutoItalian, {
          text: unref(o).name
        }, null, _parent));
        _push(`</h1>`);
        _push(ssrRenderComponent(_component_GovOfficeCard, { office: unref(o) }, null, _parent));
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/government/offices/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-DaogC8B_.mjs.map
