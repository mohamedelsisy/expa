import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, c as useLocalePath, i as _sfc_main$2$1, j as isApiError, _ as _sfc_main$3$1, e as __nuxt_component_0, h as formatDateTime } from './server.mjs';
import { _ as _sfc_main$3 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$4 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$5 } from './ConfirmInline-sG5Cp32P.mjs';
import { defineComponent, withAsyncContext, ref, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
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
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "my-requests",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    const localePath = useLocalePath();
    useSeo(() => ({ title: t("services.mine.title"), description: t("services.mine.subtitle"), noindex: true }));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("my-requests", async () => {
      const [leads, reviews] = await Promise.all([request("my/provider-leads"), request("my/provider-reviews")]);
      return { leads: leads.data, reviews: reviews.data };
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const confirmId = ref(null);
    const busy = ref(false);
    async function removeReview(id) {
      busy.value = true;
      try {
        await request(`my/provider-reviews/${id}`, { method: "DELETE" });
        toast.success(t("services.mine.reviewDeleted"));
        confirmId.value = null;
        await refresh();
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busy.value = false;
      }
    }
    const crumbs = computed(() => [{ label: t("services.title"), to: "/services" }, { label: t("services.mine.title") }]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$3;
      const _component_UiButton = _sfc_main$3$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiBadge = _sfc_main$4;
      const _component_UiConfirmInline = _sfc_main$5;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-6"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("services.mine.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("services.mine.subtitle"))}</p></header>`);
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 5
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(data)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<div class="space-y-10"><section aria-labelledby="ml-h" class="space-y-3"><h2 id="ml-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("services.mine.requests"))}</h2><p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("services.lead.notBooking"))}</p>`);
        if (!unref(data).leads.length) {
          _push(ssrRenderComponent(_component_UiEmptyState, {
            title: unref(t)("services.mine.noRequestsTitle"),
            description: unref(t)("services.mine.noRequests"),
            icon: "send"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiButton, {
                  to: "/services",
                  variant: "secondary"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("services.title"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("services.title")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiButton, {
                    to: "/services",
                    variant: "secondary"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("services.title")), 1)
                    ]),
                    _: 1
                  })
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<ul class="space-y-3"><!--[-->`);
          ssrRenderList(unref(data).leads, (l) => {
            _push(`<li class="space-y-1 rounded-md border border-line bg-surface p-4"><p class="flex flex-wrap items-center gap-2">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: unref(localePath)(`/services/${l.provider.slug}`),
              class: "font-semibold text-primary-strong underline underline-offset-4",
              dir: "auto"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(l.provider.display_name)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(l.provider.display_name), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UiBadge, null, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)(`services.leadStatus.${l.status}`))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)(`services.leadStatus.${l.status}`)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</p><p class="line-clamp-3 text-ink-soft" dir="auto">${ssrInterpolate(l.message)}</p><p class="text-sm text-muted"><bdi>${ssrInterpolate(unref(formatDateTime)(l.created_at, unref(locale)))}</bdi></p></li>`);
          });
          _push(`<!--]--></ul>`);
        }
        _push(`</section><section aria-labelledby="mr-h" class="space-y-3"><h2 id="mr-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("services.mine.reviews"))}</h2>`);
        if (!unref(data).reviews.length) {
          _push(ssrRenderComponent(_component_UiEmptyState, {
            title: unref(t)("services.mine.noReviewsTitle"),
            description: unref(t)("services.mine.noReviews"),
            icon: "list"
          }, null, _parent));
        } else {
          _push(`<ul class="space-y-3"><!--[-->`);
          ssrRenderList(unref(data).reviews, (r) => {
            _push(`<li class="space-y-2 rounded-md border border-line bg-surface p-4"><p class="flex flex-wrap items-center gap-2">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: unref(localePath)(`/services/${r.provider.slug}`),
              class: "font-semibold text-primary-strong underline underline-offset-4",
              dir: "auto"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(r.provider.display_name)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(r.provider.display_name), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UiBadge, {
              tone: r.status === "approved" ? "success" : r.status === "rejected" ? "danger" : "info"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)(`services.reviewStatus.${r.status}`))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)(`services.reviewStatus.${r.status}`)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<span class="tabular-nums"><bdi>${ssrInterpolate(unref(t)("services.review.outOf", { rating: r.rating }))}</bdi></span></p>`);
            if (r.body) {
              _push(`<p class="prose-plain" dir="auto">${ssrInterpolate(r.body)}</p>`);
            } else {
              _push(`<!---->`);
            }
            if (r.moderation_reason) {
              _push(`<p class="text-sm text-warning">${ssrInterpolate(unref(t)("services.mine.reason", { reason: r.moderation_reason }))}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "ghost",
              onClick: ($event) => confirmId.value = r.id
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("common.delete"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("common.delete")), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            if (unref(confirmId) === r.id) {
              _push(ssrRenderComponent(_component_UiConfirmInline, {
                message: unref(t)("services.mine.deleteConfirm"),
                "confirm-label": unref(t)("common.delete"),
                loading: unref(busy),
                onConfirm: ($event) => removeReview(r.id),
                onCancel: ($event) => confirmId.value = null
              }, null, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(`</li>`);
          });
          _push(`<!--]--></ul>`);
        }
        _push(`</section></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/my-requests.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=my-requests-Cqxo-ARx.mjs.map
