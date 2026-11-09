import { u as useAdminSeo, _ as _sfc_main$1 } from './useAdminSeo-DuRYEU0h.mjs';
import { u as useI18n, g as useApi, _ as _sfc_main$3, d as _sfc_main$5, i as _sfc_main$2$1, j as isApiError, h as formatDateTime, l as fieldErrors } from './server.mjs';
import { u as useAdminList, _ as _sfc_main$2 } from './useAdminList-mIj2O5_R.mjs';
import { _ as _sfc_main$4 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$6 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$7 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$8 } from './DataTable--nNCrVdv.mjs';
import { _ as _sfc_main$a } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$9 } from './ConfirmInline-sG5Cp32P.mjs';
import { _ as _sfc_main$b } from './Pagination-DA28GIFv.mjs';
import { _ as _sfc_main$c } from './Dialog-D35kg5aY.mjs';
import { _ as _sfc_main$d } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$e } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$f } from './Select-BjjHKxeN.mjs';
import { defineComponent, withAsyncContext, computed, ref, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, Fragment, isRef, withKeys, withModifiers, renderList, withDirectives, vModelRadio, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseEqual, ssrRenderAttr } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as usePermissions } from './usePermissions-C4HCMWJS.mjs';
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
import './Checkbox-PDAPbGXG.mjs';
import './permissions-CcyNKBx7.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    const { can } = usePermissions();
    useAdminSeo(() => t("admin.subs.title"));
    const list = useAdminList({ filterKeys: ["status", "plan"], defaultSort: "-id", defaultPerPage: 25 });
    const { data: plansData } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("admin-plans", () => request("billing/plans").catch(() => ({ data: [], meta: {} })))), __temp = await __temp, __restore(), __temp);
    const plans = computed(() => {
      var _a, _b;
      return (_b = (_a = plansData.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const { data, error, refresh, status: st } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("admin-subs", () => request("admin/subscriptions", { query: Object.fromEntries(Object.entries(list.apiQuery.value).filter(([k]) => k !== "sort")) }), { watch: [list.apiQuery] })), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    const fields = computed(() => [
      { key: "status", type: "select", label: t("admin.fields.status"), options: ["active", "trialing", "past_due", "canceled", "expired"].map((v) => ({ value: v, label: t(`admin.subs.status.${v}`) })) },
      { key: "plan", type: "select", label: t("admin.subs.plan"), options: plans.value.map((p) => ({ value: p.key, label: p.name || p.key })) }
    ]);
    const cols = computed(() => [
      { key: "id", label: "#" },
      { key: "user", label: t("admin.subs.user") },
      { key: "plan", label: t("admin.subs.plan") },
      { key: "status", label: t("admin.fields.status") },
      { key: "provider", label: t("admin.subs.provider") },
      { key: "current_period_end", label: t("admin.subs.periodEnd") },
      ...can("subscriptions.manage") ? [{ key: "actions", label: t("admin.common.actions") }] : []
    ]);
    const tone = (s) => s === "active" || s === "trialing" ? "success" : s === "past_due" ? "warning" : "neutral";
    const cancelId = ref(null);
    const err = ref("");
    async function cancel(id) {
      err.value = "";
      try {
        await request(`admin/subscriptions/${id}/cancel`, { method: "POST" });
        toast.success(t("admin.subs.canceled"));
        cancelId.value = null;
        refresh();
      } catch (e) {
        cancelId.value = null;
        err.value = isApiError(e) ? e.message : t("errors.generic");
      }
    }
    const grantOpen = ref(false);
    const q = ref("");
    const found = ref([]);
    const lookupMsg = ref("");
    const picked = ref(null);
    const manualId = ref("");
    const plan = ref("");
    const days = ref("30");
    const gErrors = ref({});
    const gErr = ref("");
    const busy = ref(false);
    const canLookup = computed(() => can("users.view"));
    function openGrant() {
      grantOpen.value = true;
      q.value = "";
      found.value = [];
      picked.value = null;
      manualId.value = "";
      plan.value = "";
      days.value = "30";
      gErrors.value = {};
      gErr.value = "";
      lookupMsg.value = "";
    }
    async function lookup() {
      lookupMsg.value = "";
      found.value = [];
      if (!q.value.trim()) return;
      try {
        found.value = (await request("admin/users", { query: { "filter[q]": q.value.trim(), per_page: 5 } })).data;
        if (!found.value.length) lookupMsg.value = t("admin.subs.noUser");
      } catch (e) {
        lookupMsg.value = isApiError(e) ? e.message : t("errors.generic");
      }
    }
    async function grant() {
      var _a, _b;
      gErrors.value = {};
      gErr.value = "";
      const userId = (_b = (_a = picked.value) == null ? void 0 : _a.id) != null ? _b : Number(manualId.value);
      if (!userId) {
        gErrors.value = { user_id: t("admin.subs.pickUser") };
        return;
      }
      busy.value = true;
      try {
        await request("admin/subscriptions/grant", { method: "POST", body: { user_id: userId, plan: plan.value, days: Number(days.value) } });
        toast.success(t("admin.subs.granted"));
        grantOpen.value = false;
        refresh();
      } catch (e) {
        if (isApiError(e)) {
          gErrors.value = fieldErrors(e);
          gErr.value = e.message;
        } else gErr.value = t("errors.generic");
      } finally {
        busy.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_AdminFilters = _sfc_main$2;
      const _component_UiAlert = _sfc_main$4;
      const _component_UiSkeleton = _sfc_main$6;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$7;
      const _component_AdminDataTable = _sfc_main$8;
      const _component_UiBadge = _sfc_main$a;
      const _component_UiConfirmInline = _sfc_main$9;
      const _component_UiPagination = _sfc_main$b;
      const _component_AdminDialog = _sfc_main$c;
      const _component_UiFormField = _sfc_main$d;
      const _component_UiTextInput = _sfc_main$e;
      const _component_UiSelect = _sfc_main$f;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)("admin.subs.title"),
        description: unref(t)("admin.subs.subtitle"),
        crumbs: [{ label: unref(t)("admin.title"), to: "/admin" }, { label: unref(t)("admin.subs.title") }]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(can)("subscriptions.manage")) {
              _push2(ssrRenderComponent(_component_UiButton, { onClick: openGrant }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiIcon, {
                      name: "plus",
                      size: 18
                    }, null, _parent3, _scopeId2));
                    _push3(`${ssrInterpolate(unref(t)("admin.subs.grant"))}`);
                  } else {
                    return [
                      createVNode(_component_UiIcon, {
                        name: "plus",
                        size: 18
                      }),
                      createTextVNode(toDisplayString(unref(t)("admin.subs.grant")), 1)
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
              unref(can)("subscriptions.manage") ? (openBlock(), createBlock(_component_UiButton, {
                key: 0,
                onClick: openGrant
              }, {
                default: withCtx(() => [
                  createVNode(_component_UiIcon, {
                    name: "plus",
                    size: 18
                  }),
                  createTextVNode(toDisplayString(unref(t)("admin.subs.grant")), 1)
                ]),
                _: 1
              })) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_AdminFilters, {
        fields: unref(fields),
        filters: unref(list).state.value.filters,
        onSet: unref(list).setFilter,
        onClear: unref(list).clear
      }, null, _parent));
      _push(`<div aria-live="polite">`);
      if (unref(err)) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "danger",
          class: "mb-3"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(err))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(err)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(st) === "pending" && !unref(data)) {
        _push(ssrRenderComponent(_component_UiSkeleton, { lines: 5 }, null, _parent));
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: unref(isApiError)(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!unref(rows).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("admin.common.noResults"),
          description: unref(t)("admin.common.noResultsHelp"),
          icon: "euro"
        }, null, _parent));
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_AdminDataTable, {
          columns: unref(cols),
          rows: unref(rows),
          "row-key": "id",
          caption: unref(t)("admin.subs.title")
        }, {
          "cell-user": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (row.user_email) {
                _push2(`<span dir="ltr" class="text-sm"${_scopeId}>${ssrInterpolate(row.user_email)}</span>`);
              } else {
                _push2(`<span class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("admin.subs.userId", { id: row.user_id }))}</span>`);
              }
            } else {
              return [
                row.user_email ? (openBlock(), createBlock("span", {
                  key: 0,
                  dir: "ltr",
                  class: "text-sm"
                }, toDisplayString(row.user_email), 1)) : (openBlock(), createBlock("span", {
                  key: 1,
                  class: "text-sm text-muted"
                }, toDisplayString(unref(t)("admin.subs.userId", { id: row.user_id })), 1))
              ];
            }
          }),
          "cell-status": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiBadge, {
                tone: tone(row.status)
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)(`admin.subs.status.${row.status}`))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)(`admin.subs.status.${row.status}`)), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              if (row.cancel_at_period_end) {
                _push2(`<span class="ms-1 text-xs text-muted"${_scopeId}>${ssrInterpolate(unref(t)("admin.subs.endsAtPeriod"))}</span>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode(_component_UiBadge, {
                  tone: tone(row.status)
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)(`admin.subs.status.${row.status}`)), 1)
                  ]),
                  _: 2
                }, 1032, ["tone"]),
                row.cancel_at_period_end ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "ms-1 text-xs text-muted"
                }, toDisplayString(unref(t)("admin.subs.endsAtPeriod")), 1)) : createCommentVNode("", true)
              ];
            }
          }),
          "cell-current_period_end": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-sm"${_scopeId}>${ssrInterpolate(row.current_period_end ? unref(formatDateTime)(row.current_period_end, unref(locale)) : "\u2014")}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-sm" }, toDisplayString(row.current_period_end ? unref(formatDateTime)(row.current_period_end, unref(locale)) : "\u2014"), 1)
              ];
            }
          }),
          "cell-actions": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (["active", "trialing", "past_due"].includes(row.status)) {
                _push2(`<!--[-->`);
                if (unref(cancelId) !== row.id) {
                  _push2(ssrRenderComponent(_component_UiButton, {
                    variant: "secondary",
                    onClick: ($event) => cancelId.value = row.id
                  }, {
                    default: withCtx((_, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("admin.subs.cancel"))}<span class="sr-only"${_scopeId2}> #${ssrInterpolate(row.id)}</span>`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("admin.subs.cancel")), 1),
                          createVNode("span", { class: "sr-only" }, " #" + toDisplayString(row.id), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(ssrRenderComponent(_component_UiConfirmInline, {
                    message: unref(t)("admin.subs.confirmCancel"),
                    "confirm-label": unref(t)("admin.subs.cancel"),
                    onCancel: ($event) => cancelId.value = null,
                    onConfirm: ($event) => cancel(row.id)
                  }, null, _parent2, _scopeId));
                }
                _push2(`<!--]-->`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                ["active", "trialing", "past_due"].includes(row.status) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                  unref(cancelId) !== row.id ? (openBlock(), createBlock(_component_UiButton, {
                    key: 0,
                    variant: "secondary",
                    onClick: ($event) => cancelId.value = row.id
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("admin.subs.cancel")), 1),
                      createVNode("span", { class: "sr-only" }, " #" + toDisplayString(row.id), 1)
                    ]),
                    _: 2
                  }, 1032, ["onClick"])) : (openBlock(), createBlock(_component_UiConfirmInline, {
                    key: 1,
                    message: unref(t)("admin.subs.confirmCancel"),
                    "confirm-label": unref(t)("admin.subs.cancel"),
                    onCancel: ($event) => cancelId.value = null,
                    onConfirm: ($event) => cancel(row.id)
                  }, null, 8, ["message", "confirm-label", "onCancel", "onConfirm"]))
                ], 64)) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="mt-4 text-center">`);
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_b = (_a = unref(meta)) == null ? void 0 : _a.page) != null ? _b : 1,
          "last-page": (_d = (_c = unref(meta)) == null ? void 0 : _c.last_page) != null ? _d : 1,
          onChange: unref(list).setPage
        }, null, _parent));
        _push(`</div><!--]-->`);
      }
      _push(ssrRenderComponent(_component_AdminDialog, {
        open: unref(grantOpen),
        title: unref(t)("admin.subs.grant"),
        onClose: ($event) => grantOpen.value = false
      }, {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiButton, {
              variant: "secondary",
              onClick: ($event) => grantOpen.value = false
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(t)("common.cancel"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("common.cancel")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UiButton, {
              type: "submit",
              loading: unref(busy),
              onClick: grant
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(t)("admin.subs.grant"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("admin.subs.grant")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiButton, {
                variant: "secondary",
                onClick: ($event) => grantOpen.value = false
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(t)("common.cancel")), 1)
                ]),
                _: 1
              }, 8, ["onClick"]),
              createVNode(_component_UiButton, {
                type: "submit",
                loading: unref(busy),
                onClick: grant
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(t)("admin.subs.grant")), 1)
                ]),
                _: 1
              }, 8, ["loading"])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form id="grant-form" class="space-y-4" novalidate${_scopeId}><div aria-live="polite"${_scopeId}>`);
            if (unref(gErr)) {
              _push2(ssrRenderComponent(_component_UiAlert, { tone: "danger" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(gErr))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(gErr)), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><fieldset class="space-y-2"${_scopeId}><legend class="font-medium"${_scopeId}>${ssrInterpolate(unref(t)("admin.subs.user"))}</legend>`);
            if (unref(canLookup)) {
              _push2(`<!--[--><div class="flex gap-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("admin.subs.lookup"),
                class: "flex-1"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiTextInput, {
                      modelValue: unref(q),
                      "onUpdate:modelValue": ($event) => isRef(q) ? q.value = $event : null,
                      type: "search",
                      ltr: "",
                      "data-autofocus": "",
                      onKeydown: lookup
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiTextInput, {
                        modelValue: unref(q),
                        "onUpdate:modelValue": ($event) => isRef(q) ? q.value = $event : null,
                        type: "search",
                        ltr: "",
                        "data-autofocus": "",
                        onKeydown: withKeys(withModifiers(lookup, ["prevent"]), ["enter"])
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "onKeydown"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UiButton, {
                variant: "secondary",
                class: "self-end",
                onClick: lookup
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("admin.common.search"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("admin.common.search")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
              if (unref(lookupMsg)) {
                _push2(`<p class="text-sm text-muted" role="status"${_scopeId}>${ssrInterpolate(unref(lookupMsg))}</p>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(found).length) {
                _push2(`<ul class="space-y-1"${_scopeId}><!--[-->`);
                ssrRenderList(unref(found), (u) => {
                  _push2(`<li${_scopeId}><label class="flex min-h-touch cursor-pointer items-center gap-3 rounded-md border border-line px-3"${_scopeId}><input${ssrIncludeBooleanAttr(ssrLooseEqual(unref(picked), u)) ? " checked" : ""} type="radio" name="user"${ssrRenderAttr("value", u)} class="size-5 accent-primary"${_scopeId}><span dir="auto"${_scopeId}>${ssrInterpolate(u.name)}</span><span dir="ltr" class="text-sm text-muted"${_scopeId}>${ssrInterpolate(u.email)}</span></label></li>`);
                });
                _push2(`<!--]--></ul>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(picked)) {
                _push2(`<p class="text-sm font-medium text-success"${_scopeId}>${ssrInterpolate(unref(t)("admin.subs.picked", { email: unref(picked).email }))}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<!--]-->`);
            } else {
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("admin.subs.userIdLabel"),
                hint: unref(t)("admin.subs.userIdHelp")
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiTextInput, {
                      modelValue: unref(manualId),
                      "onUpdate:modelValue": ($event) => isRef(manualId) ? manualId.value = $event : null,
                      type: "number",
                      inputmode: "numeric",
                      ltr: ""
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiTextInput, {
                        modelValue: unref(manualId),
                        "onUpdate:modelValue": ($event) => isRef(manualId) ? manualId.value = $event : null,
                        type: "number",
                        inputmode: "numeric",
                        ltr: ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            }
            if (unref(gErrors).user_id) {
              _push2(`<p class="font-medium text-danger" role="alert"${_scopeId}>${ssrInterpolate(unref(gErrors).user_id)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</fieldset>`);
            _push2(ssrRenderComponent(_component_UiFormField, {
              label: unref(t)("admin.subs.plan"),
              error: unref(gErrors).plan,
              required: ""
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UiSelect, {
                    modelValue: unref(plan),
                    "onUpdate:modelValue": ($event) => isRef(plan) ? plan.value = $event : null,
                    options: unref(plans).map((p) => ({ value: p.key, label: p.name || p.key })),
                    placeholder: unref(t)("admin.common.choose")
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UiSelect, {
                      modelValue: unref(plan),
                      "onUpdate:modelValue": ($event) => isRef(plan) ? plan.value = $event : null,
                      options: unref(plans).map((p) => ({ value: p.key, label: p.name || p.key })),
                      placeholder: unref(t)("admin.common.choose")
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UiFormField, {
              label: unref(t)("admin.subs.days"),
              hint: unref(t)("admin.subs.daysHelp"),
              error: unref(gErrors).days,
              required: ""
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UiTextInput, {
                    modelValue: unref(days),
                    "onUpdate:modelValue": ($event) => isRef(days) ? days.value = $event : null,
                    type: "number",
                    inputmode: "numeric",
                    ltr: ""
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UiTextInput, {
                      modelValue: unref(days),
                      "onUpdate:modelValue": ($event) => isRef(days) ? days.value = $event : null,
                      type: "number",
                      inputmode: "numeric",
                      ltr: ""
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</form>`);
          } else {
            return [
              createVNode("form", {
                id: "grant-form",
                class: "space-y-4",
                novalidate: "",
                onSubmit: withModifiers(grant, ["prevent"])
              }, [
                createVNode("div", { "aria-live": "polite" }, [
                  unref(gErr) ? (openBlock(), createBlock(_component_UiAlert, {
                    key: 0,
                    tone: "danger"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(gErr)), 1)
                    ]),
                    _: 1
                  })) : createCommentVNode("", true)
                ]),
                createVNode("fieldset", { class: "space-y-2" }, [
                  createVNode("legend", { class: "font-medium" }, toDisplayString(unref(t)("admin.subs.user")), 1),
                  unref(canLookup) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                    createVNode("div", { class: "flex gap-2" }, [
                      createVNode(_component_UiFormField, {
                        label: unref(t)("admin.subs.lookup"),
                        class: "flex-1"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UiTextInput, {
                            modelValue: unref(q),
                            "onUpdate:modelValue": ($event) => isRef(q) ? q.value = $event : null,
                            type: "search",
                            ltr: "",
                            "data-autofocus": "",
                            onKeydown: withKeys(withModifiers(lookup, ["prevent"]), ["enter"])
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "onKeydown"])
                        ]),
                        _: 1
                      }, 8, ["label"]),
                      createVNode(_component_UiButton, {
                        variant: "secondary",
                        class: "self-end",
                        onClick: lookup
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(t)("admin.common.search")), 1)
                        ]),
                        _: 1
                      })
                    ]),
                    unref(lookupMsg) ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "text-sm text-muted",
                      role: "status"
                    }, toDisplayString(unref(lookupMsg)), 1)) : createCommentVNode("", true),
                    unref(found).length ? (openBlock(), createBlock("ul", {
                      key: 1,
                      class: "space-y-1"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(found), (u) => {
                        return openBlock(), createBlock("li", {
                          key: u.id
                        }, [
                          createVNode("label", { class: "flex min-h-touch cursor-pointer items-center gap-3 rounded-md border border-line px-3" }, [
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => isRef(picked) ? picked.value = $event : null,
                              type: "radio",
                              name: "user",
                              value: u,
                              class: "size-5 accent-primary"
                            }, null, 8, ["onUpdate:modelValue", "value"]), [
                              [vModelRadio, unref(picked)]
                            ]),
                            createVNode("span", { dir: "auto" }, toDisplayString(u.name), 1),
                            createVNode("span", {
                              dir: "ltr",
                              class: "text-sm text-muted"
                            }, toDisplayString(u.email), 1)
                          ])
                        ]);
                      }), 128))
                    ])) : createCommentVNode("", true),
                    unref(picked) ? (openBlock(), createBlock("p", {
                      key: 2,
                      class: "text-sm font-medium text-success"
                    }, toDisplayString(unref(t)("admin.subs.picked", { email: unref(picked).email })), 1)) : createCommentVNode("", true)
                  ], 64)) : (openBlock(), createBlock(_component_UiFormField, {
                    key: 1,
                    label: unref(t)("admin.subs.userIdLabel"),
                    hint: unref(t)("admin.subs.userIdHelp")
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UiTextInput, {
                        modelValue: unref(manualId),
                        "onUpdate:modelValue": ($event) => isRef(manualId) ? manualId.value = $event : null,
                        type: "number",
                        inputmode: "numeric",
                        ltr: ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }, 8, ["label", "hint"])),
                  unref(gErrors).user_id ? (openBlock(), createBlock("p", {
                    key: 2,
                    class: "font-medium text-danger",
                    role: "alert"
                  }, toDisplayString(unref(gErrors).user_id), 1)) : createCommentVNode("", true)
                ]),
                createVNode(_component_UiFormField, {
                  label: unref(t)("admin.subs.plan"),
                  error: unref(gErrors).plan,
                  required: ""
                }, {
                  default: withCtx(() => [
                    createVNode(_component_UiSelect, {
                      modelValue: unref(plan),
                      "onUpdate:modelValue": ($event) => isRef(plan) ? plan.value = $event : null,
                      options: unref(plans).map((p) => ({ value: p.key, label: p.name || p.key })),
                      placeholder: unref(t)("admin.common.choose")
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
                  ]),
                  _: 1
                }, 8, ["label", "error"]),
                createVNode(_component_UiFormField, {
                  label: unref(t)("admin.subs.days"),
                  hint: unref(t)("admin.subs.daysHelp"),
                  error: unref(gErrors).days,
                  required: ""
                }, {
                  default: withCtx(() => [
                    createVNode(_component_UiTextInput, {
                      modelValue: unref(days),
                      "onUpdate:modelValue": ($event) => isRef(days) ? days.value = $event : null,
                      type: "number",
                      inputmode: "numeric",
                      ltr: ""
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  _: 1
                }, 8, ["label", "hint", "error"])
              ], 32)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/subscriptions/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BwB_27zk.mjs.map
