import { _ as _sfc_main$1 } from './Nav-CnBbBeUx.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$3 } from './EmptyState-N2xvHts8.mjs';
import { u as useI18n, g as useApi, j as isApiError, _ as _sfc_main$3$1, i as _sfc_main$2$1, z as formatDay } from './server.mjs';
import { _ as _sfc_main$4 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$5 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$6 } from './Textarea-C8QsGxT0.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
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
import './safe-B2eSdAXJ.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "reviews",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    useToast();
    useSeo(() => ({ title: t("provider.reviews.title"), description: t("provider.reviews.intro"), noindex: true }));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("provider-reviews", async () => (await request("provider/reviews")).data)), __temp = await __temp, __restore(), __temp);
    const notProvider = computed(() => isApiError(error.value) && (error.value.code === "provider_account_required" || error.value.status === 403));
    const replying = ref(null);
    const text = ref("");
    const err = ref();
    const sending = ref(false);
    function open(id) {
      replying.value = id;
      text.value = "";
      err.value = void 0;
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_ProviderNav = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiEmptyState = _sfc_main$3;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiBadge = _sfc_main$4;
      const _component_UiFormField = _sfc_main$5;
      const _component_UiTextarea = _sfc_main$6;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}><h1 class="mb-6 text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("provider.reviews.title"))}</h1>`);
      _push(ssrRenderComponent(_component_ProviderNav, null, null, _parent));
      _push(`<p class="mb-4 text-ink-soft">${ssrInterpolate(unref(t)("provider.reviews.intro"))}</p>`);
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 4
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(notProvider)) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("provider.noListingTitle"),
          description: unref(t)("provider.noListing"),
          icon: "user"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiButton, { to: "/provider" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("provider.apply.title"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("provider.apply.title")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiButton, { to: "/provider" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("provider.apply.title")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!((_a = unref(data)) == null ? void 0 : _a.length)) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("provider.reviews.emptyTitle"),
          description: unref(t)("provider.reviews.empty"),
          icon: "list"
        }, null, _parent));
      } else {
        _push(`<ul class="space-y-3"><!--[-->`);
        ssrRenderList(unref(data), (r) => {
          _push(`<li class="space-y-2 rounded-md border border-line bg-surface p-4"><p class="flex flex-wrap items-center gap-2"><span class="font-semibold tabular-nums"><bdi>${ssrInterpolate(unref(t)("services.review.outOf", { rating: r.rating }))}</bdi></span>`);
          if (r.created_at) {
            _push(`<span class="text-sm text-muted"><bdi>${ssrInterpolate(unref(formatDay)(r.created_at, unref(locale)))}</bdi></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</p>`);
          if (r.body) {
            _push(`<p class="prose-plain" dir="auto">${ssrInterpolate(r.body)}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (r.reply) {
            _push(`<div class="rounded-md bg-sunken p-3"><p class="flex flex-wrap items-center gap-2 text-sm font-semibold">${ssrInterpolate(unref(t)("services.review.reply"))}`);
            _push(ssrRenderComponent(_component_UiBadge, {
              tone: r.reply_status === "approved" ? "success" : "info"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                var _a2, _b;
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)(`provider.reviews.replyStatus.${(_a2 = r.reply_status) != null ? _a2 : "pending"}`))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)(`provider.reviews.replyStatus.${(_b = r.reply_status) != null ? _b : "pending"}`)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</p><p class="prose-plain" dir="auto">${ssrInterpolate(r.reply)}</p></div>`);
          } else {
            _push(`<!---->`);
          }
          if (!r.reply) {
            _push(`<!--[-->`);
            if (unref(replying) !== r.id) {
              _push(ssrRenderComponent(_component_UiButton, {
                variant: "secondary",
                onClick: ($event) => open(r.id)
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(unref(t)("provider.reviews.reply"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("provider.reviews.reply")), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<form class="space-y-3" novalidate>`);
              _push(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("provider.reviews.replyLabel"),
                hint: unref(t)("provider.reviews.replyHint"),
                error: unref(err),
                required: ""
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(ssrRenderComponent(_component_UiTextarea, {
                      modelValue: unref(text),
                      "onUpdate:modelValue": ($event) => isRef(text) ? text.value = $event : null,
                      rows: 3,
                      maxlength: 3e3
                    }, null, _parent2, _scopeId));
                  } else {
                    return [
                      createVNode(_component_UiTextarea, {
                        modelValue: unref(text),
                        "onUpdate:modelValue": ($event) => isRef(text) ? text.value = $event : null,
                        rows: 3,
                        maxlength: 3e3
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(`<div class="flex gap-2">`);
              _push(ssrRenderComponent(_component_UiButton, {
                type: "submit",
                loading: unref(sending)
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(unref(t)("provider.reviews.send"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("provider.reviews.send")), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(ssrRenderComponent(_component_UiButton, {
                variant: "ghost",
                onClick: ($event) => replying.value = null
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(unref(t)("common.cancel"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("common.cancel")), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(`</div></form>`);
            }
            _push(`<!--]-->`);
          } else {
            _push(`<!---->`);
          }
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/provider/reviews.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=reviews-C5LFP47u.mjs.map
