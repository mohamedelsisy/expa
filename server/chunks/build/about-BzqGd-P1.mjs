import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { u as useI18n, b as useRuntimeConfig, c as useLocalePath, _ as _sfc_main$3 } from './server.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, Fragment, renderList, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "about",
  __ssrInlineRender: true,
  setup(__props) {
    var _a;
    const { t, locale } = useI18n();
    const siteUrl = String((_a = useRuntimeConfig().public.siteUrl) != null ? _a : "").replace(/\/$/, "");
    const localePath = useLocalePath();
    useSeo(() => ({
      title: t("about.seo.title"),
      description: t("about.seo.description"),
      jsonLdData: { "@context": "https://schema.org", "@type": "AboutPage", name: t("about.title"), description: t("about.seo.description"), url: siteUrl + localePath("/about"), inLanguage: locale.value }
    }));
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/" }, { label: t("about.title") }]);
    const does = ["guides", "assistant", "tracking", "learning"];
    const doesNot = ["government", "legal", "booking", "guarantee", "providers"];
    const trust = ["sources", "verified", "labels", "privacy"];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiAlert = _sfc_main$2;
      const _component_UiButton = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-8 max-w-2xl space-y-3"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("about.title"))}</h1><p class="text-lg text-ink-soft">${ssrInterpolate(unref(t)("about.lead"))}</p></header><div class="grid max-w-4xl gap-6"><section aria-labelledby="about-mission-h" class="space-y-2"><h2 id="about-mission-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("about.mission.title"))}</h2><p class="max-w-prose text-ink-soft">${ssrInterpolate(unref(t)("about.mission.body"))}</p></section><section aria-labelledby="about-does-h" class="space-y-2"><h2 id="about-does-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("about.does.title"))}</h2><ul class="list-disc space-y-1 ps-5 text-ink-soft"><!--[-->`);
      ssrRenderList(does, (k) => {
        _push(`<li>${ssrInterpolate(unref(t)(`about.does.items.${k}`))}</li>`);
      });
      _push(`<!--]--></ul></section><section aria-labelledby="about-not-h" class="space-y-3"><h2 id="about-not-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("about.doesNot.title"))}</h2>`);
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "warning",
        "data-testid": "about-no-claims"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<ul class="list-disc space-y-1 ps-5"${_scopeId}><!--[-->`);
            ssrRenderList(doesNot, (k) => {
              _push2(`<li${_scopeId}>${ssrInterpolate(unref(t)(`about.doesNot.items.${k}`))}</li>`);
            });
            _push2(`<!--]--></ul>`);
          } else {
            return [
              createVNode("ul", { class: "list-disc space-y-1 ps-5" }, [
                (openBlock(), createBlock(Fragment, null, renderList(doesNot, (k) => {
                  return createVNode("li", { key: k }, toDisplayString(unref(t)(`about.doesNot.items.${k}`)), 1);
                }), 64))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</section><section aria-labelledby="about-trust-h" class="space-y-2"><h2 id="about-trust-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("about.trust.title"))}</h2><ul class="list-disc space-y-1 ps-5 text-ink-soft"><!--[-->`);
      ssrRenderList(trust, (k) => {
        _push(`<li>${ssrInterpolate(unref(t)(`about.trust.items.${k}`))}</li>`);
      });
      _push(`<!--]--></ul></section><p class="flex flex-wrap gap-3">`);
      _push(ssrRenderComponent(_component_UiButton, {
        to: "/explore",
        size: "lg"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("about.explore"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("about.explore")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiButton, {
        to: "/privacy",
        variant: "secondary",
        size: "lg"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("footer.links.privacy"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("footer.links.privacy")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/about.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=about-BzqGd-P1.mjs.map
