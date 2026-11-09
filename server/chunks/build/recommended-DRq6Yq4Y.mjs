import { u as useI18n, g as useApi, _ as _sfc_main$3, i as _sfc_main$2$1, j as isApiError } from './server.mjs';
import { _ as _sfc_main$1 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$2 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$4 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$5 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$6 } from './JobCard-D1b5_h6j.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
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
import './money-CRo_itTF.mjs';
import './safe-B2eSdAXJ.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "recommended",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    useSeo(() => ({ title: t("jobs.recommended"), description: t("jobs.subtitle"), noindex: true }));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("jobs-recommended", () => request("jobs/recommended"), { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const jobs = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiButton = _sfc_main$3;
      const _component_UiAlert = _sfc_main$1;
      const _component_UiCard = _sfc_main$2;
      const _component_UiSkeleton = _sfc_main$4;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$5;
      const _component_JobsJobCard = _sfc_main$6;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}><header class="mb-6 flex flex-wrap items-end justify-between gap-3"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("jobs.recommended"))}</h1>`);
      _push(ssrRenderComponent(_component_UiButton, {
        to: "/jobs",
        variant: "secondary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("jobs.backToJobs"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("jobs.backToJobs")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header>`);
      if (unref(data) && unref(data).meta.personalized === false) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "info",
          class: "mb-6"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("jobs.recNeedsProfile"))}</p>`);
              _push2(ssrRenderComponent(_component_UiButton, {
                to: "/jobs/preferences",
                variant: "secondary",
                class: "mt-3"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("jobs.preferences"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("jobs.preferences")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode("p", null, toDisplayString(unref(t)("jobs.recNeedsProfile")), 1),
                createVNode(_component_UiButton, {
                  to: "/jobs/preferences",
                  variant: "secondary",
                  class: "mt-3"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("jobs.preferences")), 1)
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
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true"><!--[-->`);
        ssrRenderList(3, (n) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiSkeleton, { lines: 4 }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiSkeleton, { lines: 4 })
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!unref(jobs).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("jobs.recEmptyTitle"),
          description: unref(t)("jobs.recEmpty"),
          icon: "briefcase"
        }, null, _parent));
      } else {
        _push(`<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(unref(jobs), (j) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_JobsJobCard, { job: j }, null, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/jobs/recommended.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=recommended-DRq6Yq4Y.mjs.map
