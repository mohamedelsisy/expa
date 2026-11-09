import { u as useAdminSeo, _ as _sfc_main$3 } from './useAdminSeo-DuRYEU0h.mjs';
import { _ as _sfc_main$4 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, g as useApi, c as useLocalePath, j as isApiError, i as _sfc_main$2$1, h as formatDateTime, _ as _sfc_main$3$1, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$6 } from './Card-BxvVO_-_.mjs';
import { defineComponent, computed, withAsyncContext, unref, ref, mergeProps, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as usePermissions } from './usePermissions-C4HCMWJS.mjs';
import { _ as _sfc_main$7 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$5 } from './ContentForm-BY8XCqFs.mjs';
import { m as moduleByKey } from './modules-CgmwLVRo.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import './Breadcrumbs-C7SaJcTR.mjs';
import './useSeo-BU4sLOnV.mjs';
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
import './permissions-CcyNKBx7.mjs';
import './FreshnessBadge-C3EJLnMu.mjs';
import './Badge-PdKIsny2.mjs';
import './Dialog-D35kg5aY.mjs';
import './FormField-DFtov8VK.mjs';
import './TextInput-BI4efS3_.mjs';
import './Checkbox-PDAPbGXG.mjs';
import './Select-BjjHKxeN.mjs';
import './Textarea-C8QsGxT0.mjs';
import './ConfirmInline-sG5Cp32P.mjs';
import 'perfect-debounce';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "TeacherReview",
  __ssrInlineRender: true,
  props: {
    endpoint: {},
    id: {},
    reviewed: { type: Boolean },
    reviewedAt: {}
  },
  emits: ["changed"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    const { can } = usePermissions();
    const busy = ref(false);
    async function toggle() {
      busy.value = true;
      try {
        await request(`${props.endpoint}/${props.id}/teacher-review`, { method: props.reviewed ? "DELETE" : "POST" });
        toast.success(props.reviewed ? t("admin.teacher.cleared") : t("admin.teacher.marked"));
        emit("changed");
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busy.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiCard = _sfc_main$6;
      const _component_UiButton = _sfc_main$3$1;
      _push(ssrRenderComponent(_component_UiCard, mergeProps({
        as: "section",
        class: "flex flex-wrap items-center justify-between gap-3",
        "aria-labelledby": "tr-rev-h",
        "data-testid": "teacher-review"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div${_scopeId}><h2 id="tr-rev-h" class="font-bold"${_scopeId}>${ssrInterpolate(unref(t)("admin.teacher.title"))}</h2><p class="text-sm text-ink-soft"${_scopeId}>${ssrInterpolate(__props.reviewed ? unref(t)("admin.teacher.reviewedOn", { date: unref(formatDateTime)(__props.reviewedAt, unref(locale)) }) : unref(t)("admin.teacher.notReviewed"))}</p></div>`);
            if (unref(can)("italian_lessons.review") || unref(can)("italian_lessons.update")) {
              _push2(ssrRenderComponent(_component_UiButton, {
                variant: __props.reviewed ? "secondary" : "primary",
                loading: unref(busy),
                onClick: toggle
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(__props.reviewed ? unref(t)("admin.teacher.clear") : unref(t)("admin.teacher.mark"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(__props.reviewed ? unref(t)("admin.teacher.clear") : unref(t)("admin.teacher.mark")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", null, [
                createVNode("h2", {
                  id: "tr-rev-h",
                  class: "font-bold"
                }, toDisplayString(unref(t)("admin.teacher.title")), 1),
                createVNode("p", { class: "text-sm text-ink-soft" }, toDisplayString(__props.reviewed ? unref(t)("admin.teacher.reviewedOn", { date: unref(formatDateTime)(__props.reviewedAt, unref(locale)) }) : unref(t)("admin.teacher.notReviewed")), 1)
              ]),
              unref(can)("italian_lessons.review") || unref(can)("italian_lessons.update") ? (openBlock(), createBlock(_component_UiButton, {
                key: 0,
                variant: __props.reviewed ? "secondary" : "primary",
                loading: unref(busy),
                onClick: toggle
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(__props.reviewed ? unref(t)("admin.teacher.clear") : unref(t)("admin.teacher.mark")), 1)
                ]),
                _: 1
              }, 8, ["variant", "loading"])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/TeacherReview.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "PendingChanges",
  __ssrInlineRender: true,
  props: {
    endpoint: {},
    id: {}
  },
  emits: ["changed"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { t } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    const { can } = usePermissions();
    const busy = ref(null);
    async function decide(action) {
      busy.value = action;
      try {
        await request(`${props.endpoint}/${props.id}/changes`, { method: "POST", body: { action } });
        toast.success(t(`admin.pending.${action}Done`));
        emit("changed");
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busy.value = null;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiAlert = _sfc_main$7;
      const _component_UiButton = _sfc_main$3$1;
      _push(ssrRenderComponent(_component_UiAlert, mergeProps({
        tone: "warning",
        title: unref(t)("admin.pending.title"),
        "data-testid": "pending-changes"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("admin.pending.body"))}</p>`);
            if (unref(can)("providers.publish")) {
              _push2(`<div class="mt-3 flex flex-wrap gap-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiButton, {
                loading: unref(busy) === "approve",
                onClick: ($event) => decide("approve")
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("admin.pending.approve"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("admin.pending.approve")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UiButton, {
                variant: "secondary",
                loading: unref(busy) === "reject",
                onClick: ($event) => decide("reject")
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("admin.pending.reject"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("admin.pending.reject")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("p", null, toDisplayString(unref(t)("admin.pending.body")), 1),
              unref(can)("providers.publish") ? (openBlock(), createBlock("div", {
                key: 0,
                class: "mt-3 flex flex-wrap gap-2"
              }, [
                createVNode(_component_UiButton, {
                  loading: unref(busy) === "approve",
                  onClick: ($event) => decide("approve")
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("admin.pending.approve")), 1)
                  ]),
                  _: 1
                }, 8, ["loading", "onClick"]),
                createVNode(_component_UiButton, {
                  variant: "secondary",
                  loading: unref(busy) === "reject",
                  onClick: ($event) => decide("reject")
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("admin.pending.reject")), 1)
                  ]),
                  _: 1
                }, 8, ["loading", "onClick"])
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/PendingChanges.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const { request } = useApi();
    const m = computed(() => moduleByKey(route.params.module));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(`admin-item-${route.params.module}-${route.params.id}`, () => request(`${m.value.endpoint}/${route.params.id}`))), __temp = await __temp, __restore(), __temp);
    const item = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.data;
    });
    const title = computed(() => {
      var _a, _b, _c, _d, _e, _f, _g;
      return ((_b = (_a = item.value) == null ? void 0 : _a.titles) == null ? void 0 : _b[locale.value]) || ((_d = (_c = item.value) == null ? void 0 : _c.titles) == null ? void 0 : _d.ar) || ((_f = (_e = item.value) == null ? void 0 : _e.titles) == null ? void 0 : _f.en) || ((_g = item.value) == null ? void 0 : _g.slug) || "";
    });
    useAdminSeo(() => title.value || t("admin.content.edit"));
    const localePath = useLocalePath();
    const back = () => navigateTo(localePath(`/admin/content/${m.value.key}`));
    const notFound = computed(() => isApiError(error.value) && error.value.status === 404);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_AdminPageHeader = _sfc_main$3;
      const _component_UiSkeleton = _sfc_main$4;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_AdminTeacherReview = _sfc_main$2;
      const _component_AdminPendingChanges = _sfc_main$1;
      const _component_AdminContentForm = _sfc_main$5;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(title) || unref(t)("admin.content.edit"),
        crumbs: [{ label: unref(t)("admin.title"), to: "/admin" }, { label: unref(t)(`admin.modules.${unref(m).key}`), to: `/admin/content/${unref(m).key}` }, { label: unref(title) || unref(t)("admin.content.edit") }]
      }, null, _parent));
      if (unref(status) === "pending" && !unref(data)) {
        _push(ssrRenderComponent(_component_UiSkeleton, { lines: 8 }, null, _parent));
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          title: unref(notFound) ? unref(t)("errors.notFoundTitle") : void 0,
          message: unref(isApiError)(unref(error)) ? unref(error).message : void 0,
          retry: !unref(notFound),
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (unref(item)) {
        _push(`<!--[-->`);
        if (unref(m).teacherReview) {
          _push(ssrRenderComponent(_component_AdminTeacherReview, {
            class: "mb-6",
            endpoint: unref(m).endpoint,
            id: unref(item).id,
            reviewed: !!unref(item).reviewed,
            "reviewed-at": (_a = unref(item).reviewed_at) != null ? _a : null,
            onChanged: ($event) => unref(refresh)()
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(m).pendingChanges && unref(item).has_pending_changes) {
          _push(ssrRenderComponent(_component_AdminPendingChanges, {
            class: "mb-6",
            endpoint: unref(m).endpoint,
            id: unref(item).id,
            onChanged: ($event) => unref(refresh)()
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_AdminContentForm, {
          key: `${unref(m).key}-${unref(item).id}-${unref(item).updated_at}`,
          module: unref(m),
          initial: unref(item),
          onDeleted: back
        }, null, _parent));
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/content/[module]/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-CNpI9pjo.mjs.map
