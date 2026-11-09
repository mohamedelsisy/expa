import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Disclaimer-ByrpdAjg.mjs';
import { _ as _sfc_main$3 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, i as _sfc_main$2$1, j as isApiError, _ as _sfc_main$3$1 } from './server.mjs';
import { _ as _sfc_main$4 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$5 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$6 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$7 } from './ListenButton-BzYdaHKB.mjs';
import { _ as _sfc_main$8 } from './ReviewedNotice-RpV3jHT3.mjs';
import { defineComponent, withAsyncContext, ref, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import './safe-B2eSdAXJ.mjs';
import './Alert-D-zfMDy5.mjs';
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
import './Badge-PdKIsny2.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "glossary",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    useSeo(() => ({ title: t("patente.glossary.seo.title"), description: t("patente.glossary.seo.description") }));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("patente-glossary", async () => (await request("patente/glossary")).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const q = ref("");
    const items = computed(() => {
      var _a;
      const term = q.value.trim().toLowerCase();
      const all = (_a = data.value) != null ? _a : [];
      return term ? all.filter((v) => {
        var _a2;
        return v.lemma.toLowerCase().includes(term) || ((_a2 = v.gloss) != null ? _a2 : "").toLowerCase().includes(term);
      }) : all;
    });
    const crumbs = computed(() => [{ label: t("patente.title"), to: "/patente" }, { label: t("patente.glossary.title") }]);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_PatenteDisclaimer = _sfc_main$2;
      const _component_UiSkeleton = _sfc_main$3;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$4;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiFormField = _sfc_main$5;
      const _component_UiTextInput = _sfc_main$6;
      const _component_LearnListenButton = _sfc_main$7;
      const _component_LearnReviewedNotice = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<h1 class="mb-2 text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("patente.glossary.title"))}</h1><p class="mb-6 text-ink-soft">${ssrInterpolate(unref(t)("patente.glossary.subtitle"))}</p>`);
      _push(ssrRenderComponent(_component_PatenteDisclaimer, { class: "mb-6" }, null, _parent));
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 5
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!((_a = unref(data)) == null ? void 0 : _a.length)) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("patente.glossary.emptyTitle"),
          description: unref(t)("patente.glossary.empty"),
          icon: "car"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiButton, {
                to: "/patente",
                variant: "secondary"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("patente.title"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("patente.title")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiButton, {
                  to: "/patente",
                  variant: "secondary"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("patente.title")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("patente.glossary.filter"),
          class: "mb-4 max-w-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: unref(q),
                "onUpdate:modelValue": ($event) => isRef(q) ? q.value = $event : null,
                type: "search",
                inputmode: "search",
                maxlength: 60
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: unref(q),
                  "onUpdate:modelValue": ($event) => isRef(q) ? q.value = $event : null,
                  type: "search",
                  inputmode: "search",
                  maxlength: 60
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        if (!unref(items).length) {
          _push(`<p class="text-muted" data-testid="glossary-none">${ssrInterpolate(unref(t)("guides.noResults"))}</p>`);
        } else {
          _push(`<ul class="divide-y divide-line rounded-lg border border-line bg-surface" data-testid="glossary-list"><!--[-->`);
          ssrRenderList(unref(items), (v) => {
            _push(`<li class="space-y-1 p-4"><div class="flex flex-wrap items-center gap-2"><span class="text-lg font-bold" lang="it" dir="ltr">${ssrInterpolate(v.lemma)}</span>`);
            _push(ssrRenderComponent(_component_LearnListenButton, {
              text: v.lemma
            }, null, _parent));
            _push(ssrRenderComponent(_component_LearnReviewedNotice, {
              item: v,
              compact: ""
            }, null, _parent));
            _push(`</div>`);
            if (v.gloss) {
              _push(`<p dir="auto">${ssrInterpolate(v.gloss)}</p>`);
            } else {
              _push(`<!---->`);
            }
            if (v.example_it) {
              _push(`<p class="text-sm text-ink-soft"><span lang="it" dir="ltr">${ssrInterpolate(v.example_it)}</span>`);
              if (v.example_gloss) {
                _push(`<!--[--> \u2014 <span dir="auto">${ssrInterpolate(v.example_gloss)}</span><!--]-->`);
              } else {
                _push(`<!---->`);
              }
              _push(`</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</li>`);
          });
          _push(`<!--]--></ul>`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/patente/glossary.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=glossary-BL2bIKsS.mjs.map
