import { _ as _sfc_main$3 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$4 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, a as useAuthStore, c as useLocalePath, g as useApi, o as createError, j as isApiError, i as _sfc_main$2$1, e as __nuxt_component_0, k as formatDate, _ as _sfc_main$3$1, d as _sfc_main$5$1, n as navigateTo } from './server.mjs';
import { o as officialGuidePath, _ as _sfc_main$5 } from './Labels-BzdhD_w4.mjs';
import { _ as _sfc_main$6 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$7 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$8 } from './ReportButton-C1jpQyo2.mjs';
import { _ as _sfc_main$9 } from './ConfirmInline-sG5Cp32P.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { _ as _sfc_main$a } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$b } from './Textarea-C8QsGxT0.mjs';
import { u as useCommunityMeta } from './useCommunity-pk23xdcX.mjs';
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
import './Select-BjjHKxeN.mjs';
import './services-h_WXKmjh.mjs';
import 'perfect-debounce';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "BlockButton",
  __ssrInlineRender: true,
  props: {
    type: {},
    id: {}
  },
  emits: ["blocked"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { t } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    const confirming = ref(false);
    const busy = ref(false);
    async function block() {
      busy.value = true;
      try {
        await request("community/blocks", { method: "POST", body: { type: props.type, id: props.id } });
        toast.success(t("community.blocks.done"));
        confirming.value = false;
        emit("blocked");
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busy.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_UiConfirmInline = _sfc_main$9;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_UiButton, {
        variant: "ghost",
        "aria-expanded": unref(confirming),
        onClick: ($event) => confirming.value = !unref(confirming)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "x-circle",
              size: 16
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("community.blocks.button"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "x-circle",
                size: 16
              }),
              createTextVNode(toDisplayString(unref(t)("community.blocks.button")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(confirming)) {
        _push(ssrRenderComponent(_component_UiConfirmInline, {
          class: "mt-2",
          message: unref(t)("community.blocks.confirm"),
          "confirm-label": unref(t)("community.blocks.button"),
          loading: unref(busy),
          onCancel: ($event) => confirming.value = false,
          onConfirm: block
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/community/BlockButton.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Comments",
  __ssrInlineRender: true,
  props: {
    questionId: {},
    answerId: {},
    comments: {},
    canPost: { type: Boolean }
  },
  emits: ["changed"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    const open = ref(false);
    const body = ref("");
    const err = ref();
    const sending = ref(false);
    const confirmId = ref(null);
    async function remove(id) {
      try {
        await request(`community/comments/${id}`, { method: "DELETE" });
        confirmId.value = null;
        emit("changed");
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_CommunityLabels = _sfc_main$5;
      const _component_UiButton = _sfc_main$3$1;
      const _component_ServicesReportButton = _sfc_main$8;
      const _component_UiConfirmInline = _sfc_main$9;
      const _component_UiFormField = _sfc_main$a;
      const _component_UiTextarea = _sfc_main$b;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-2" }, _attrs))}>`);
      if (__props.comments.length) {
        _push(`<ul class="space-y-2 border-s-2 border-line ps-3"><!--[-->`);
        ssrRenderList(__props.comments, (c) => {
          _push(`<li class="space-y-1 text-sm"><p dir="auto">${ssrInterpolate(c.body)}</p><p class="flex flex-wrap items-center gap-2 text-xs text-muted">`);
          _push(ssrRenderComponent(_component_CommunityLabels, {
            label: unref(t)("community.commentLabel"),
            status: c.status,
            mine: c.mine
          }, null, _parent));
          if (c.created_at) {
            _push(`<time${ssrRenderAttr("datetime", c.created_at)}>${ssrInterpolate(unref(formatDate)(c.created_at, unref(locale)))}</time>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</p><div class="flex flex-wrap gap-1">`);
          if (c.mine) {
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "ghost",
              onClick: ($event) => confirmId.value = c.id
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
          } else if (__props.canPost) {
            _push(ssrRenderComponent(_component_ServicesReportButton, {
              endpoint: `community/comment/${c.id}/report`
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          if (unref(confirmId) === c.id) {
            _push(ssrRenderComponent(_component_UiConfirmInline, {
              message: unref(t)("community.deleteConfirm"),
              "confirm-label": unref(t)("common.delete"),
              onConfirm: ($event) => remove(c.id),
              onCancel: ($event) => confirmId.value = null
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.canPost) {
        _push(`<!--[-->`);
        if (!unref(open)) {
          _push(ssrRenderComponent(_component_UiButton, {
            variant: "ghost",
            onClick: ($event) => open.value = true
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("community.addComment"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("community.addComment")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<form class="space-y-2" novalidate>`);
          _push(ssrRenderComponent(_component_UiFormField, {
            label: unref(t)("community.addComment"),
            error: unref(err),
            required: ""
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiTextarea, {
                  modelValue: unref(body),
                  "onUpdate:modelValue": ($event) => isRef(body) ? body.value = $event : null,
                  rows: 2,
                  maxlength: 5e3
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiTextarea, {
                    modelValue: unref(body),
                    "onUpdate:modelValue": ($event) => isRef(body) ? body.value = $event : null,
                    rows: 2,
                    maxlength: 5e3
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<div class="flex gap-2">`);
          _push(ssrRenderComponent(_component_UiButton, {
            type: "submit",
            loading: unref(sending)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("community.post"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("community.post")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_UiButton, {
            variant: "ghost",
            onClick: ($event) => open.value = false
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
            _: 1
          }, _parent));
          _push(`</div></form>`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/community/Comments.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const auth = useAuthStore();
    const localePath = useLocalePath();
    const { request } = useApi();
    const toast = useToast();
    const community = useCommunityMeta();
    if (!([__temp, __restore] = withAsyncContext(() => community.load()), __temp = await __temp, __restore(), __temp)) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    const id = computed(() => String(route.params.id));
    const { data: q, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(() => `community-${id.value}`, async () => (await request(`community/questions/${encodeURIComponent(id.value)}`)).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    useSeo(() => ({ title: q.value ? `${q.value.title} | EXPA` : t("community.title"), description: t("community.seo.description"), noindex: true }));
    const crumbs = computed(() => {
      var _a, _b;
      return [{ label: t("community.title"), to: "/community" }, { label: (_b = (_a = q.value) == null ? void 0 : _a.title) != null ? _b : "" }];
    });
    const canPost = computed(() => auth.isAuthenticated && auth.isVerified);
    const guidePath = computed(() => {
      var _a, _b;
      return officialGuidePath((_b = (_a = q.value) == null ? void 0 : _a.official_guide) == null ? void 0 : _b.path);
    });
    const answer = ref("");
    const answerErr = ref();
    const sending = ref(false);
    async function act(fn) {
      try {
        await fn();
        await refresh();
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      }
    }
    const vote = (type, itemId, voted) => act(() => request(`community/${type}/${itemId}/vote`, { method: voted ? "DELETE" : "PUT" }));
    const accept = (answerId, accepted) => act(() => request(`community/questions/${id.value}/accepted-answer`, accepted ? { method: "DELETE" } : { method: "PUT", body: { answer_id: answerId } }));
    const confirm = ref(null);
    const remove = (kind, itemId) => act(async () => {
      await request(`community/${kind}/${itemId}`, { method: "DELETE" });
      confirm.value = null;
      if (kind === "questions") await navigateTo(localePath("/community"));
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiBreadcrumbs = _sfc_main$3;
      const _component_UiSkeleton = _sfc_main$4;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_CommunityLabels = _sfc_main$5;
      const _component_UiBadge = _sfc_main$6;
      const _component_UiAlert = _sfc_main$7;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_ServicesReportButton = _sfc_main$8;
      const _component_CommunityBlockButton = _sfc_main$2;
      const _component_UiConfirmInline = _sfc_main$9;
      const _component_CommunityComments = _sfc_main$1;
      const _component_UiFormField = _sfc_main$a;
      const _component_UiTextarea = _sfc_main$b;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      if (!unref(q)) {
        _push(`<h1 class="sr-only">${ssrInterpolate(unref(t)("community.title"))}</h1>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(status) === "pending" && !unref(q)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 5
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(q)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<div class="space-y-8"><article class="space-y-3"><div class="flex flex-wrap items-center gap-2">`);
        _push(ssrRenderComponent(_component_CommunityLabels, {
          label: unref(q).label,
          status: unref(q).status,
          mine: unref(q).mine
        }, null, _parent));
        if (unref(q).topic_label) {
          _push(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(q).topic_label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(q).topic_label), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div><h1 class="text-2xl font-bold sm:text-3xl" dir="auto">${ssrInterpolate(unref(q).title)}</h1>`);
        if (unref(route).query.posted) {
          _push(ssrRenderComponent(_component_UiAlert, { tone: "success" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("community.postedPending"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("community.postedPending")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(q).notice) {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: "warning",
            "data-testid": "sensitive-notice"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(q).notice)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(q).notice), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(q).official_guide && unref(guidePath)) {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: "info",
            "data-testid": "official-guide"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("community.officialGuide"))} `);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: unref(localePath)(unref(guidePath)),
                  class: "font-medium underline underline-offset-4"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(q).official_guide.title)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(q).official_guide.title), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("community.officialGuide")) + " ", 1),
                  createVNode(_component_NuxtLink, {
                    to: unref(localePath)(unref(guidePath)),
                    class: "font-medium underline underline-offset-4"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(q).official_guide.title), 1)
                    ]),
                    _: 1
                  }, 8, ["to"])
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<p class="prose-plain" dir="auto">${ssrInterpolate(unref(q).body)}</p><p class="flex flex-wrap items-center gap-2 text-sm text-muted">`);
        if (unref(q).created_at) {
          _push(`<time${ssrRenderAttr("datetime", unref(q).created_at)}>${ssrInterpolate(unref(formatDate)(unref(q).created_at, unref(locale)))}</time>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(q).city) {
          _push(`<span>${ssrInterpolate(unref(q).city.name)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(q).tags, (tg) => {
          _push(`<span>#${ssrInterpolate(tg)}</span>`);
        });
        _push(`<!--]--></p><div class="flex flex-wrap gap-2">`);
        if (unref(canPost) && !unref(q).mine) {
          _push(ssrRenderComponent(_component_UiButton, {
            variant: "secondary",
            "aria-pressed": !!unref(q).voted,
            onClick: ($event) => vote("question", unref(q).id, !!unref(q).voted)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "check",
                  size: 16
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(unref(t)("community.vote", { count: unref(q).votes }))}`);
              } else {
                return [
                  createVNode(_component_UiIcon, {
                    name: "check",
                    size: 16
                  }),
                  createTextVNode(toDisplayString(unref(t)("community.vote", { count: unref(q).votes })), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<span class="inline-flex min-h-touch items-center text-sm text-muted">${ssrInterpolate(unref(t)("community.votes", { count: unref(q).votes }))}</span>`);
        }
        if (unref(canPost) && !unref(q).mine) {
          _push(ssrRenderComponent(_component_ServicesReportButton, {
            endpoint: `community/question/${unref(q).id}/report`
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(canPost) && !unref(q).mine) {
          _push(ssrRenderComponent(_component_CommunityBlockButton, {
            type: "question",
            id: unref(q).id,
            onBlocked: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(unref(localePath)("/community"))
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(q).mine) {
          _push(ssrRenderComponent(_component_UiButton, {
            variant: "ghost",
            onClick: ($event) => confirm.value = "q"
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
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(confirm) === "q") {
          _push(ssrRenderComponent(_component_UiConfirmInline, {
            message: unref(t)("community.deleteConfirm"),
            "confirm-label": unref(t)("common.delete"),
            onConfirm: ($event) => remove("questions", unref(q).id),
            onCancel: ($event) => confirm.value = null
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_CommunityComments, {
          "question-id": unref(q).id,
          comments: (_a = unref(q).comments) != null ? _a : [],
          "can-post": unref(canPost),
          onChanged: ($event) => unref(refresh)()
        }, null, _parent));
        _push(`</article><section aria-labelledby="an-h" class="space-y-4"><h2 id="an-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("community.answersCount", { count: (_c = (_b = unref(q).answers) == null ? void 0 : _b.length) != null ? _c : 0 }))}</h2>`);
        if (!((_d = unref(q).answers) == null ? void 0 : _d.length)) {
          _push(`<p class="text-muted">${ssrInterpolate(unref(t)("community.noAnswers"))}</p>`);
        } else {
          _push(`<ul class="space-y-4"><!--[-->`);
          ssrRenderList(unref(q).answers, (a) => {
            _push(`<li class="space-y-2 rounded-lg border border-line bg-surface p-4"><div class="flex flex-wrap items-center gap-2">`);
            _push(ssrRenderComponent(_component_CommunityLabels, {
              label: a.label,
              status: a.status,
              mine: a.mine
            }, null, _parent));
            if (a.accepted) {
              _push(ssrRenderComponent(_component_UiBadge, { tone: "success" }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(ssrRenderComponent(_component_UiIcon, {
                      name: "check",
                      size: 14
                    }, null, _parent2, _scopeId));
                    _push2(`${ssrInterpolate(unref(t)("community.accepted"))}`);
                  } else {
                    return [
                      createVNode(_component_UiIcon, {
                        name: "check",
                        size: 14
                      }),
                      createTextVNode(toDisplayString(unref(t)("community.accepted")), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(`</div><p class="prose-plain" dir="auto">${ssrInterpolate(a.body)}</p><div class="flex flex-wrap gap-2">`);
            if (unref(canPost) && !a.mine) {
              _push(ssrRenderComponent(_component_UiButton, {
                variant: "secondary",
                "aria-pressed": a.voted,
                onClick: ($event) => vote("answer", a.id, a.voted)
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(unref(t)("community.vote", { count: a.votes }))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("community.vote", { count: a.votes })), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<span class="inline-flex min-h-touch items-center text-sm text-muted">${ssrInterpolate(unref(t)("community.votes", { count: a.votes }))}</span>`);
            }
            if (unref(q).mine) {
              _push(ssrRenderComponent(_component_UiButton, {
                variant: "ghost",
                onClick: ($event) => accept(a.id, a.accepted)
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(a.accepted ? unref(t)("community.unaccept") : unref(t)("community.accept"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(a.accepted ? unref(t)("community.unaccept") : unref(t)("community.accept")), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<!---->`);
            }
            if (unref(canPost) && !a.mine) {
              _push(ssrRenderComponent(_component_ServicesReportButton, {
                endpoint: `community/answer/${a.id}/report`
              }, null, _parent));
            } else {
              _push(`<!---->`);
            }
            if (unref(canPost) && !a.mine) {
              _push(ssrRenderComponent(_component_CommunityBlockButton, {
                type: "answer",
                id: a.id,
                onBlocked: ($event) => unref(refresh)()
              }, null, _parent));
            } else {
              _push(`<!---->`);
            }
            if (a.mine) {
              _push(ssrRenderComponent(_component_UiButton, {
                variant: "ghost",
                onClick: ($event) => confirm.value = `a${a.id}`
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
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
            if (unref(confirm) === `a${a.id}`) {
              _push(ssrRenderComponent(_component_UiConfirmInline, {
                message: unref(t)("community.deleteConfirm"),
                "confirm-label": unref(t)("common.delete"),
                onConfirm: ($event) => remove("answers", a.id),
                onCancel: ($event) => confirm.value = null
              }, null, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(ssrRenderComponent(_component_CommunityComments, {
              "question-id": unref(q).id,
              "answer-id": a.id,
              comments: a.comments,
              "can-post": unref(canPost),
              onChanged: ($event) => unref(refresh)()
            }, null, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul>`);
        }
        if (unref(canPost)) {
          _push(`<form class="space-y-3" novalidate>`);
          _push(ssrRenderComponent(_component_UiFormField, {
            label: unref(t)("community.yourAnswer"),
            hint: unref(t)("community.moderationNote"),
            error: unref(answerErr),
            required: ""
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiTextarea, {
                  modelValue: unref(answer),
                  "onUpdate:modelValue": ($event) => isRef(answer) ? answer.value = $event : null,
                  rows: 5,
                  maxlength: 2e4
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiTextarea, {
                    modelValue: unref(answer),
                    "onUpdate:modelValue": ($event) => isRef(answer) ? answer.value = $event : null,
                    rows: 5,
                    maxlength: 2e4
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_UiButton, {
            type: "submit",
            loading: unref(sending)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("community.postAnswer"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("community.postAnswer")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</form>`);
        } else if (unref(auth).isAuthenticated) {
          _push(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("verify.neededBody"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("verify.neededBody")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(ssrRenderComponent(_component_UiButton, {
            to: `/login?redirect=${encodeURIComponent(unref(localePath)(`/community/${unref(id)}`))}`,
            variant: "secondary"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("community.loginToAnswer"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("community.loginToAnswer")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/community/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-jtIRe-XO.mjs.map
