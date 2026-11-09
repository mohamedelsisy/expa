import { _ as _sfc_main$3 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$4 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, a as useAuthStore, c as useLocalePath, g as useApi, j as isApiError, o as createError, i as _sfc_main$2$1, d as _sfc_main$5$1, z as formatDay, _ as _sfc_main$3$1 } from './server.mjs';
import { _ as _sfc_main$5 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$1$1, a as _sfc_main$6 } from './Rating-BFS29wss.mjs';
import { _ as _sfc_main$7 } from './FallbackNotice-CwHuyozE.mjs';
import { _ as _sfc_main$8 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$9 } from './ReportButton-C1jpQyo2.mjs';
import { _ as _sfc_main$a } from './Pagination-DA28GIFv.mjs';
import { _ as _sfc_main$b } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$c } from './VerifyNeeded-mxk-8UjC.mjs';
import { _ as _sfc_main$d } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$e } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$f } from './Textarea-C8QsGxT0.mjs';
import { _ as _sfc_main$g } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$h } from './Checkbox-PDAPbGXG.mjs';
import { defineComponent, computed, withAsyncContext, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, reactive, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseEqual } from 'vue/server-renderer';
import { l as languageName, S as SERVICE_LANGUAGES, a as REVIEW_MAX } from './services-h_WXKmjh.mjs';
import { f as formatMoney } from './money-CRo_itTF.mjs';
import { a as safeHttpsUrl } from './safe-B2eSdAXJ.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
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
import './useToast-BX2bodPv.mjs';
import 'perfect-debounce';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "LeadForm",
  __ssrInlineRender: true,
  props: {
    slug: {},
    name: {}
  },
  setup(__props) {
    const { t, locale } = useI18n();
    useApi();
    const form = reactive({ message: "", request_type: "contact", preferred_language: "", contact_name: "", contact_email: "", contact_phone: "", consent: false });
    const errors = ref({});
    const submitting = ref(false);
    const needVerify = ref(false);
    const notice = ref(null);
    const sent = ref(null);
    const langOptions = computed(() => SERVICE_LANGUAGES.map((l) => ({ value: l, label: languageName(l, locale.value) })));
    const typeOptions = computed(() => ["contact", "booking"].map((v) => ({ value: v, label: t(`services.lead.types.${v}`) })));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiAlert = _sfc_main$8;
      const _component_UiButton = _sfc_main$3$1;
      const _component_AuthVerifyNeeded = _sfc_main$c;
      const _component_UiFormField = _sfc_main$d;
      const _component_UiSelect = _sfc_main$e;
      const _component_UiTextarea = _sfc_main$f;
      const _component_UiTextInput = _sfc_main$g;
      const _component_UiCheckbox = _sfc_main$h;
      const _component_UiIcon = _sfc_main$5$1;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "space-y-3",
        "aria-labelledby": "ld-h",
        "data-testid": "lead-section"
      }, _attrs))}><h3 id="ld-h" class="text-lg font-bold">${ssrInterpolate(unref(t)("services.lead.title", { name: __props.name }))}</h3>`);
      if (unref(sent)) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "success",
          title: unref(t)("services.lead.sentTitle"),
          "data-testid": "lead-sent"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a, _b;
            if (_push2) {
              _push2(`<p${_scopeId}>${ssrInterpolate((_a = unref(sent).notice) != null ? _a : unref(t)("services.lead.sentBody"))}</p><p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(unref(t)("services.lead.notBooking"))}</p>`);
              _push2(ssrRenderComponent(_component_UiButton, {
                to: "/my-requests",
                variant: "secondary",
                class: "mt-2"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("services.myRequests"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("services.myRequests")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode("p", null, toDisplayString((_b = unref(sent).notice) != null ? _b : unref(t)("services.lead.sentBody")), 1),
                createVNode("p", { class: "mt-1 text-sm" }, toDisplayString(unref(t)("services.lead.notBooking")), 1),
                createVNode(_component_UiButton, {
                  to: "/my-requests",
                  variant: "secondary",
                  class: "mt-2"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("services.myRequests")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<form class="space-y-4" novalidate>`);
        _push(ssrRenderComponent(_component_UiAlert, { tone: "info" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("services.lead.notBooking"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("services.lead.notBooking")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(needVerify)) {
          _push(ssrRenderComponent(_component_AuthVerifyNeeded, null, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("services.lead.type")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSelect, {
                modelValue: unref(form).request_type,
                "onUpdate:modelValue": ($event) => unref(form).request_type = $event,
                options: unref(typeOptions)
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSelect, {
                  modelValue: unref(form).request_type,
                  "onUpdate:modelValue": ($event) => unref(form).request_type = $event,
                  options: unref(typeOptions)
                }, null, 8, ["modelValue", "onUpdate:modelValue", "options"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("services.lead.message"),
          error: unref(errors).message,
          required: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextarea, {
                modelValue: unref(form).message,
                "onUpdate:modelValue": ($event) => unref(form).message = $event,
                rows: 5,
                maxlength: 5100
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextarea, {
                  modelValue: unref(form).message,
                  "onUpdate:modelValue": ($event) => unref(form).message = $event,
                  rows: 5,
                  maxlength: 5100
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="grid gap-4 sm:grid-cols-2">`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("services.lead.name"),
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: unref(form).contact_name,
                "onUpdate:modelValue": ($event) => unref(form).contact_name = $event,
                autocomplete: "name",
                maxlength: 120
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: unref(form).contact_name,
                  "onUpdate:modelValue": ($event) => unref(form).contact_name = $event,
                  autocomplete: "name",
                  maxlength: 120
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("services.lead.language"),
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSelect, {
                modelValue: unref(form).preferred_language,
                "onUpdate:modelValue": ($event) => unref(form).preferred_language = $event,
                options: unref(langOptions),
                placeholder: unref(t)("services.anyLanguage")
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSelect, {
                  modelValue: unref(form).preferred_language,
                  "onUpdate:modelValue": ($event) => unref(form).preferred_language = $event,
                  options: unref(langOptions),
                  placeholder: unref(t)("services.anyLanguage")
                }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("services.lead.email"),
          error: unref(errors).contact_email,
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: unref(form).contact_email,
                "onUpdate:modelValue": ($event) => unref(form).contact_email = $event,
                type: "email",
                autocomplete: "email",
                ltr: "",
                maxlength: 190
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: unref(form).contact_email,
                  "onUpdate:modelValue": ($event) => unref(form).contact_email = $event,
                  type: "email",
                  autocomplete: "email",
                  ltr: "",
                  maxlength: 190
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("services.lead.phone"),
          error: unref(errors).contact_phone,
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: unref(form).contact_phone,
                "onUpdate:modelValue": ($event) => unref(form).contact_phone = $event,
                type: "tel",
                autocomplete: "tel",
                ltr: "",
                maxlength: 25
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: unref(form).contact_phone,
                  "onUpdate:modelValue": ($event) => unref(form).contact_phone = $event,
                  type: "tel",
                  autocomplete: "tel",
                  ltr: "",
                  maxlength: 25
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="rounded-md border border-line bg-sunken p-3">`);
        _push(ssrRenderComponent(_component_UiCheckbox, {
          modelValue: unref(form).consent,
          "onUpdate:modelValue": ($event) => unref(form).consent = $event,
          invalid: !!unref(errors).consent,
          label: unref(t)("services.lead.consent", { name: __props.name }),
          description: unref(t)("services.lead.consentHint")
        }, null, _parent));
        if (unref(errors).consent) {
          _push(`<p class="text-sm text-danger" role="alert" data-testid="consent-error">${ssrInterpolate(unref(errors).consent)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(notice)) {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: unref(notice).tone
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(notice).text)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(notice).text), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UiButton, {
          type: "submit",
          loading: unref(submitting)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "send",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("services.lead.submit"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "send",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("services.lead.submit")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</form>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/services/LeadForm.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ReviewForm",
  __ssrInlineRender: true,
  props: {
    slug: {}
  },
  setup(__props) {
    const { t } = useI18n();
    useApi();
    const rating = ref(0);
    const body = ref("");
    const errors = ref({});
    const submitting = ref(false);
    const needVerify = ref(false);
    const done = ref(false);
    const notice = ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiAlert = _sfc_main$8;
      const _component_AuthVerifyNeeded = _sfc_main$c;
      const _component_UiFormField = _sfc_main$d;
      const _component_UiTextarea = _sfc_main$f;
      const _component_UiButton = _sfc_main$3$1;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "space-y-3",
        "aria-labelledby": "wr-h"
      }, _attrs))}><h3 id="wr-h" class="text-lg font-bold">${ssrInterpolate(unref(t)("services.review.write"))}</h3>`);
      if (unref(done)) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "success",
          "data-testid": "review-pending"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("services.review.pending"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("services.review.pending")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<form class="space-y-4" novalidate>`);
        if (unref(needVerify)) {
          _push(ssrRenderComponent(_component_AuthVerifyNeeded, null, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<fieldset class="space-y-1"><legend class="font-medium">${ssrInterpolate(unref(t)("services.review.rating"))} <span class="text-danger" aria-hidden="true">*</span></legend><div class="flex flex-wrap gap-2" role="radiogroup"${ssrRenderAttr("aria-label", unref(t)("services.review.rating"))}><!--[-->`);
        ssrRenderList(5, (n) => {
          _push(`<label class="${ssrRenderClass([unref(rating) === n ? "border-primary bg-primary text-on-primary" : "border-line-strong bg-surface", "inline-flex min-h-touch min-w-touch cursor-pointer items-center justify-center gap-1 rounded-md border px-3 font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"])}"><input${ssrIncludeBooleanAttr(ssrLooseEqual(unref(rating), n)) ? " checked" : ""} type="radio" name="rating"${ssrRenderAttr("value", n)} class="sr-only"><span aria-hidden="true">${ssrInterpolate(n)}</span><span class="sr-only">${ssrInterpolate(unref(t)("services.review.stars", { count: n }))}</span></label>`);
        });
        _push(`<!--]--></div>`);
        if (unref(errors).rating) {
          _push(`<p class="text-sm text-danger" role="alert">${ssrInterpolate(unref(errors).rating)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</fieldset>`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("services.review.body"),
          hint: unref(t)("services.review.hint"),
          error: unref(errors).body,
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextarea, {
                modelValue: unref(body),
                "onUpdate:modelValue": ($event) => isRef(body) ? body.value = $event : null,
                rows: 4,
                maxlength: unref(REVIEW_MAX) + 100
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextarea, {
                  modelValue: unref(body),
                  "onUpdate:modelValue": ($event) => isRef(body) ? body.value = $event : null,
                  rows: 4,
                  maxlength: unref(REVIEW_MAX) + 100
                }, null, 8, ["modelValue", "onUpdate:modelValue", "maxlength"])
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(notice)) {
          _push(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(notice))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(notice)), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UiButton, {
          type: "submit",
          loading: unref(submitting)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("services.review.submit"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("services.review.submit")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</form>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/services/ReviewForm.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const auth = useAuthStore();
    const localePath = useLocalePath();
    const { request } = useApi();
    const slug = computed(() => String(route.params.slug));
    const { data: p, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(() => `provider-${slug.value}`, async () => (await request(`providers/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    useSeo(() => {
      var _a, _b, _c;
      return { title: p.value ? `${p.value.display_name} | EXPA` : t("services.title"), description: (_b = (_a = p.value) == null ? void 0 : _a.headline) != null ? _b : t("services.subtitle"), fallback: !!((_c = p.value) == null ? void 0 : _c.fallback) };
    });
    const crumbs = computed(() => {
      var _a, _b;
      return [{ label: t("nav.home"), to: "/" }, { label: t("services.title"), to: "/services" }, { label: (_b = (_a = p.value) == null ? void 0 : _a.display_name) != null ? _b : "" }];
    });
    const reviewPage = ref(1);
    const { data: reviews, error: reviewsError, refresh: refreshReviews, status: reviewsStatus } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(() => `provider-reviews-${slug.value}-${reviewPage.value}`, () => request(`providers/${encodeURIComponent(slug.value)}/reviews`, { query: { page: reviewPage.value, per_page: 10 } }), { watch: [reviewPage, locale] })), __temp = await __temp, __restore(), __temp);
    const reviewMeta = computed(() => {
      var _a;
      return (_a = reviews.value) == null ? void 0 : _a.meta;
    });
    const contact = computed(() => {
      var _a, _b, _c, _d, _e, _f;
      return { email: (_b = (_a = p.value) == null ? void 0 : _a.contact) == null ? void 0 : _b.email, phone: (_d = (_c = p.value) == null ? void 0 : _c.contact) == null ? void 0 : _d.phone, website: safeHttpsUrl((_f = (_e = p.value) == null ? void 0 : _e.contact) == null ? void 0 : _f.website) };
    });
    const loginTo = computed(() => `/login?redirect=${encodeURIComponent(localePath(`/services/${slug.value}`))}`);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      const _component_UiBreadcrumbs = _sfc_main$3;
      const _component_UiSkeleton = _sfc_main$4;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiBadge = _sfc_main$5;
      const _component_ServicesVerification = _sfc_main$1$1;
      const _component_ServicesRating = _sfc_main$6;
      const _component_GuideFallbackNotice = _sfc_main$7;
      const _component_UiAlert = _sfc_main$8;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_ServicesReportButton = _sfc_main$9;
      const _component_UiPagination = _sfc_main$a;
      const _component_UiCard = _sfc_main$b;
      const _component_ServicesLeadForm = _sfc_main$2;
      const _component_UiButton = _sfc_main$3$1;
      const _component_ServicesReviewForm = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-5xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      if (!unref(p)) {
        _push(`<h1 class="sr-only">${ssrInterpolate(unref(t)("services.title"))}</h1>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(status) === "pending" && !unref(p)) {
        _push(`<div aria-busy="true" class="space-y-6">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 2
        }, null, _parent));
        _push(ssrRenderComponent(_component_UiSkeleton, { lines: 6 }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(p)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]"><article class="min-w-0 space-y-8"><header class="space-y-3"><div class="flex flex-wrap items-center gap-2">`);
        _push(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(p).category_label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(p).category_label), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_ServicesVerification, {
          verification: unref(p).verification,
          detail: ""
        }, null, _parent));
        _push(ssrRenderComponent(_component_UiBadge, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("services.thirdParty"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("services.thirdParty")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><h1 class="text-3xl font-bold sm:text-4xl" dir="auto">${ssrInterpolate(unref(p).display_name)}</h1>`);
        if (unref(p).headline) {
          _push(`<p class="text-lg text-ink-soft" dir="auto">${ssrInterpolate(unref(p).headline)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_ServicesRating, {
          average: unref(p).rating.average,
          count: unref(p).rating.count
        }, null, _parent));
        if (unref(p).fallback) {
          _push(ssrRenderComponent(_component_GuideFallbackNotice, {
            locale: unref(p).locale
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</header>`);
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "warning",
          "data-testid": "provider-notice"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(p).notice)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(p).notice), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(p).description) {
          _push(`<section aria-labelledby="pd-h" class="space-y-2"><h2 id="pd-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("services.about"))}</h2><p class="prose-plain" dir="auto">${ssrInterpolate(unref(p).description)}</p></section>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(p).services.length) {
          _push(`<section aria-labelledby="ps-h" class="space-y-3"><h2 id="ps-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("services.offered"))}</h2><ul class="divide-y divide-line rounded-md border border-line bg-surface"><!--[-->`);
          ssrRenderList(unref(p).services, (s, i) => {
            _push(`<li class="space-y-1 p-3"><p class="font-semibold" dir="auto">${ssrInterpolate(s.name)}</p>`);
            if (s.description) {
              _push(`<p class="text-ink-soft" dir="auto">${ssrInterpolate(s.description)}</p>`);
            } else {
              _push(`<!---->`);
            }
            if (s.price_from_eur !== null) {
              _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("services.priceFrom", { price: unref(formatMoney)(s.price_from_eur, "EUR", unref(locale)) }))}<span> \xB7 ${ssrInterpolate(unref(t)("services.priceNote"))}</span></p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</li>`);
          });
          _push(`<!--]--></ul></section>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<section aria-labelledby="pw-h" class="space-y-2"><h2 id="pw-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("services.where"))}</h2><ul class="space-y-1 text-ink-soft">`);
        if (unref(p).city || unref(p).region) {
          _push(`<li class="flex items-center gap-2">`);
          _push(ssrRenderComponent(_component_UiIcon, {
            name: "map",
            size: 16
          }, null, _parent));
          _push(`${ssrInterpolate((_c = (_a = unref(p).city) == null ? void 0 : _a.name) != null ? _c : (_b = unref(p).region) == null ? void 0 : _b.name)}</li>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(p).areas, (a, i) => {
          var _a2, _b2, _c2;
          _push(`<li class="flex items-center gap-2">`);
          _push(ssrRenderComponent(_component_UiIcon, {
            name: "map",
            size: 16
          }, null, _parent));
          _push(`${ssrInterpolate((_c2 = (_a2 = a.city) == null ? void 0 : _a2.name) != null ? _c2 : (_b2 = a.region) == null ? void 0 : _b2.name)}</li>`);
        });
        _push(`<!--]-->`);
        if (unref(p).serves_online) {
          _push(`<li class="flex items-center gap-2">`);
          _push(ssrRenderComponent(_component_UiIcon, {
            name: "globe",
            size: 16
          }, null, _parent));
          _push(`${ssrInterpolate(unref(t)("services.online"))}</li>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(p).languages.length) {
          _push(`<li class="flex items-center gap-2">`);
          _push(ssrRenderComponent(_component_UiIcon, {
            name: "user",
            size: 16
          }, null, _parent));
          _push(`<bdi>${ssrInterpolate(unref(p).languages.map((l) => unref(languageName)(l, unref(locale))).join(" \xB7 "))}</bdi></li>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</ul>`);
        if (unref(p).availability_note) {
          _push(`<p class="text-ink-soft" dir="auto">${ssrInterpolate(unref(p).availability_note)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section><section aria-labelledby="pr-h" class="space-y-4"><h2 id="pr-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("services.reviews"))}</h2><p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("services.reviewsNote"))}</p>`);
        if (unref(reviewsStatus) === "pending" && !unref(reviews)) {
          _push(`<div aria-busy="true">`);
          _push(ssrRenderComponent(_component_UiSkeleton, { lines: 3 }, null, _parent));
          _push(`</div>`);
        } else if (unref(reviewsError)) {
          _push(ssrRenderComponent(_component_UiErrorState, {
            message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(reviewsError)) ? unref(reviewsError).message : void 0,
            retry: "",
            onRetry: ($event) => unref(refreshReviews)()
          }, null, _parent));
        } else if (!((_d = unref(reviews)) == null ? void 0 : _d.data.length)) {
          _push(`<p class="text-muted" data-testid="no-reviews">${ssrInterpolate(unref(t)("services.noReviews"))}</p>`);
        } else {
          _push(`<ul class="space-y-3"><!--[-->`);
          ssrRenderList(unref(reviews).data, (r) => {
            _push(`<li class="space-y-2 rounded-md border border-line bg-surface p-4"><p class="flex flex-wrap items-center gap-2"><span class="font-semibold tabular-nums"><bdi>${ssrInterpolate(unref(t)("services.review.outOf", { rating: r.rating }))}</bdi></span>`);
            _push(ssrRenderComponent(_component_UiBadge, null, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(r.label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(r.label), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
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
              _push(`<div class="rounded-md bg-sunken p-3"><p class="text-sm font-semibold">${ssrInterpolate(unref(t)("services.review.reply"))}</p><p class="prose-plain" dir="auto">${ssrInterpolate(r.reply.body)}</p></div>`);
            } else {
              _push(`<!---->`);
            }
            if (unref(auth).isAuthenticated) {
              _push(ssrRenderComponent(_component_ServicesReportButton, {
                endpoint: `provider-reviews/${r.id}/report`,
                label: unref(t)("services.review.report")
              }, null, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(`</li>`);
          });
          _push(`<!--]--></ul>`);
        }
        if (((_f = (_e = unref(reviewMeta)) == null ? void 0 : _e.last_page) != null ? _f : 1) > 1) {
          _push(ssrRenderComponent(_component_UiPagination, {
            page: (_h = (_g = unref(reviewMeta)) == null ? void 0 : _g.page) != null ? _h : 1,
            "last-page": (_j = (_i = unref(reviewMeta)) == null ? void 0 : _i.last_page) != null ? _j : 1,
            onChange: ($event) => reviewPage.value = $event
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</section></article><aside class="space-y-6 lg:sticky lg:top-24 lg:self-start">`);
        if (unref(contact).email || unref(contact).phone || unref(contact).website) {
          _push(ssrRenderComponent(_component_UiCard, {
            class: "space-y-2",
            as: "section",
            "aria-labelledby": "pc-h"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<h2 id="pc-h" class="text-lg font-bold"${_scopeId}>${ssrInterpolate(unref(t)("services.contact"))}</h2><p class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("services.contactNote"))}</p><ul class="space-y-1"${_scopeId}>`);
                if (unref(contact).email) {
                  _push2(`<li class="flex items-center gap-2"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiIcon, {
                    name: "mail",
                    size: 16
                  }, null, _parent2, _scopeId));
                  _push2(`<a${ssrRenderAttr("href", `mailto:${unref(contact).email}`)} dir="ltr" class="break-all underline underline-offset-4"${_scopeId}>${ssrInterpolate(unref(contact).email)}</a></li>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(contact).phone) {
                  _push2(`<li class="flex items-center gap-2"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiIcon, {
                    name: "phone",
                    size: 16
                  }, null, _parent2, _scopeId));
                  _push2(`<a${ssrRenderAttr("href", `tel:${unref(contact).phone.replace(/[^+\d]/g, "")}`)} dir="ltr" class="underline underline-offset-4"${_scopeId}>${ssrInterpolate(unref(contact).phone)}</a></li>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(contact).website) {
                  _push2(`<li class="flex items-center gap-2"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiIcon, {
                    name: "external",
                    size: 16
                  }, null, _parent2, _scopeId));
                  _push2(`<a${ssrRenderAttr("href", unref(contact).website)} target="_blank" rel="noopener noreferrer" dir="ltr" class="break-all underline underline-offset-4"${_scopeId}>${ssrInterpolate(unref(contact).website)}<span class="sr-only"${_scopeId}>${ssrInterpolate(unref(t)("a11y.opensNewTab"))}</span></a></li>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</ul>`);
              } else {
                return [
                  createVNode("h2", {
                    id: "pc-h",
                    class: "text-lg font-bold"
                  }, toDisplayString(unref(t)("services.contact")), 1),
                  createVNode("p", { class: "text-sm text-muted" }, toDisplayString(unref(t)("services.contactNote")), 1),
                  createVNode("ul", { class: "space-y-1" }, [
                    unref(contact).email ? (openBlock(), createBlock("li", {
                      key: 0,
                      class: "flex items-center gap-2"
                    }, [
                      createVNode(_component_UiIcon, {
                        name: "mail",
                        size: 16
                      }),
                      createVNode("a", {
                        href: `mailto:${unref(contact).email}`,
                        dir: "ltr",
                        class: "break-all underline underline-offset-4"
                      }, toDisplayString(unref(contact).email), 9, ["href"])
                    ])) : createCommentVNode("", true),
                    unref(contact).phone ? (openBlock(), createBlock("li", {
                      key: 1,
                      class: "flex items-center gap-2"
                    }, [
                      createVNode(_component_UiIcon, {
                        name: "phone",
                        size: 16
                      }),
                      createVNode("a", {
                        href: `tel:${unref(contact).phone.replace(/[^+\d]/g, "")}`,
                        dir: "ltr",
                        class: "underline underline-offset-4"
                      }, toDisplayString(unref(contact).phone), 9, ["href"])
                    ])) : createCommentVNode("", true),
                    unref(contact).website ? (openBlock(), createBlock("li", {
                      key: 2,
                      class: "flex items-center gap-2"
                    }, [
                      createVNode(_component_UiIcon, {
                        name: "external",
                        size: 16
                      }),
                      createVNode("a", {
                        href: unref(contact).website,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        dir: "ltr",
                        class: "break-all underline underline-offset-4"
                      }, [
                        createTextVNode(toDisplayString(unref(contact).website), 1),
                        createVNode("span", { class: "sr-only" }, toDisplayString(unref(t)("a11y.opensNewTab")), 1)
                      ], 8, ["href"])
                    ])) : createCommentVNode("", true)
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(auth).isAuthenticated) {
          _push(ssrRenderComponent(_component_UiCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_ServicesLeadForm, {
                  slug: unref(p).slug,
                  name: unref(p).display_name
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_ServicesLeadForm, {
                    slug: unref(p).slug,
                    name: unref(p).display_name
                  }, null, 8, ["slug", "name"])
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(ssrRenderComponent(_component_UiCard, { class: "space-y-3" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<h2 class="text-lg font-bold"${_scopeId}>${ssrInterpolate(unref(t)("services.lead.loginTitle"))}</h2><p class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("services.lead.loginBody"))}</p>`);
                _push2(ssrRenderComponent(_component_UiButton, { to: unref(loginTo) }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("auth.login"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("auth.login")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                return [
                  createVNode("h2", { class: "text-lg font-bold" }, toDisplayString(unref(t)("services.lead.loginTitle")), 1),
                  createVNode("p", { class: "text-ink-soft" }, toDisplayString(unref(t)("services.lead.loginBody")), 1),
                  createVNode(_component_UiButton, { to: unref(loginTo) }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("auth.login")), 1)
                    ]),
                    _: 1
                  }, 8, ["to"])
                ];
              }
            }),
            _: 1
          }, _parent));
        }
        if (unref(auth).isAuthenticated) {
          _push(ssrRenderComponent(_component_UiCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_ServicesReviewForm, {
                  slug: unref(p).slug
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_ServicesReviewForm, {
                    slug: unref(p).slug
                  }, null, 8, ["slug"])
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</aside></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/services/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-bnyK84ao.mjs.map
