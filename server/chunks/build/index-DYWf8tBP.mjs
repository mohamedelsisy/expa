import { u as useAdminSeo, _ as _sfc_main$1 } from './useAdminSeo-DuRYEU0h.mjs';
import { u as useI18n, g as useApi, a as useAuthStore, _ as _sfc_main$3, d as _sfc_main$5, i as _sfc_main$2$1, j as isApiError, h as formatDateTime } from './server.mjs';
import { u as useAdminList, _ as _sfc_main$2 } from './useAdminList-mIj2O5_R.mjs';
import { _ as _sfc_main$4 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$6 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$7 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$8 } from './DataTable--nNCrVdv.mjs';
import { _ as _sfc_main$9 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$a } from './Pagination-DA28GIFv.mjs';
import { _ as _sfc_main$b } from './Dialog-D35kg5aY.mjs';
import { _ as _sfc_main$c } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$d } from './ConfirmInline-sG5Cp32P.mjs';
import { _ as _sfc_main$e } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$f } from './Checkbox-PDAPbGXG.mjs';
import { _ as _sfc_main$g } from './TextInput-BI4efS3_.mjs';
import { defineComponent, withAsyncContext, computed, ref, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, Fragment, renderList, isRef, withModifiers, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as usePermissions } from './usePermissions-C4HCMWJS.mjs';
import { u as useRoles } from './useRoles-B6Nsc3f-.mjs';
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
import './Select-BjjHKxeN.mjs';
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
    const auth = useAuthStore();
    const { can, isSuperAdmin } = usePermissions();
    useAdminSeo(() => t("admin.users.title"));
    const list = useAdminList({ filterKeys: ["q", "status", "role"], defaultSort: "-id", sortable: ["id", "name", "email", "created_at", "last_login_at"], defaultPerPage: 20 });
    const { roles } = useRoles();
    const { data, error, refresh, status: st } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("admin-users", () => request("admin/users", { query: list.apiQuery.value }), { watch: [list.apiQuery] })), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    const fields = computed(() => {
      var _a;
      return [
        { key: "q", type: "search", label: t("admin.common.search"), placeholder: t("admin.users.searchPlaceholder") },
        { key: "status", type: "select", label: t("admin.fields.status"), options: ["active", "suspended", "pending_erasure"].map((v) => ({ value: v, label: t(`admin.users.status.${v}`) })) },
        { key: "role", type: "select", label: t("admin.users.role"), options: ((_a = roles.value) != null ? _a : []).map((r) => ({ value: r.key, label: r.label })) }
      ];
    });
    const columns = computed(() => [
      { key: "name", label: t("admin.fields.name"), sortable: true },
      { key: "email", label: t("admin.fields.email"), sortable: true },
      { key: "status", label: t("admin.fields.status") },
      { key: "roles", label: t("admin.users.roles") },
      { key: "last_login_at", label: t("admin.users.lastLogin"), sortable: true },
      { key: "created_at", label: t("admin.users.created"), sortable: true },
      { key: "actions", label: t("admin.common.actions") }
    ]);
    const tone = (s) => s === "active" ? "success" : s === "suspended" ? "danger" : "warning";
    const selected = ref(null);
    const busy = ref(false);
    const msgErr = ref("");
    const draftRoles = ref([]);
    const confirmSuspend = ref(false);
    function openUser(u) {
      erasing.value = false;
      typedEmail.value = "";
      selected.value = u;
      draftRoles.value = [...u.roles];
      msgErr.value = "";
      confirmSuspend.value = false;
    }
    const isSelf = computed(() => {
      var _a, _b;
      return ((_a = selected.value) == null ? void 0 : _a.id) === ((_b = auth.user) == null ? void 0 : _b.id);
    });
    const privilegedKeys = computed(() => {
      var _a;
      return ((_a = roles.value) != null ? _a : []).filter((r) => r.privileged).map((r) => r.key);
    });
    const targetPrivileged = computed(() => {
      var _a;
      return !!((_a = selected.value) == null ? void 0 : _a.roles.some((r) => privilegedKeys.value.includes(r)));
    });
    const escalationBlocked = computed(() => !isSuperAdmin.value && targetPrivileged.value);
    const canEditStatus = computed(() => {
      var _a;
      return can("users.update") && !isSelf.value && !escalationBlocked.value && ((_a = selected.value) == null ? void 0 : _a.status) !== "pending_erasure";
    });
    const canEditRoles = computed(() => can("roles.assign") && can("roles.view") && !isSelf.value && !escalationBlocked.value);
    const rolesChanged = computed(() => {
      var _a, _b;
      return [...draftRoles.value].sort().join() !== [...(_b = (_a = selected.value) == null ? void 0 : _a.roles) != null ? _b : []].sort().join();
    });
    function applyUpdate(u) {
      selected.value = u;
      draftRoles.value = [...u.roles];
      refresh();
    }
    function explain(e, kind) {
      if (isApiError(e) && e.status === 403) msgErr.value = `${t(kind === "roles" ? "admin.users.escalation" : "admin.users.statusForbidden")}`;
      else msgErr.value = isApiError(e) ? e.message : t("errors.generic");
    }
    async function setStatus(status) {
      if (!selected.value) return;
      busy.value = true;
      msgErr.value = "";
      try {
        applyUpdate((await request(`admin/users/${selected.value.id}`, { method: "PATCH", body: { status } })).data);
        toast.success(t("admin.users.statusUpdated"));
      } catch (e) {
        explain(e, "status");
      } finally {
        busy.value = false;
        confirmSuspend.value = false;
      }
    }
    async function saveRoles() {
      if (!selected.value) return;
      busy.value = true;
      msgErr.value = "";
      try {
        applyUpdate((await request(`admin/users/${selected.value.id}/roles`, { method: "PUT", body: { roles: draftRoles.value } })).data);
        toast.success(t("admin.users.rolesUpdated"));
      } catch (e) {
        explain(e, "roles");
      } finally {
        busy.value = false;
      }
    }
    const erasing = ref(false);
    const typedEmail = ref("");
    const canErase = computed(() => {
      var _a;
      return can("users.delete") && !isSelf.value && !escalationBlocked.value && ((_a = selected.value) == null ? void 0 : _a.status) !== "pending_erasure";
    });
    const erasureMatches = computed(() => {
      var _a, _b;
      return typedEmail.value.trim().toLowerCase() === ((_b = (_a = selected.value) == null ? void 0 : _a.email) != null ? _b : "").toLowerCase() && !!selected.value;
    });
    async function erase() {
      if (!selected.value || !erasureMatches.value) return;
      busy.value = true;
      msgErr.value = "";
      try {
        await request(`admin/users/${selected.value.id}`, { method: "DELETE" });
        toast.success(t("admin.users.erasureStarted"));
        erasing.value = false;
        typedEmail.value = "";
        selected.value = null;
        await refresh();
      } catch (e) {
        msgErr.value = isApiError(e) && e.status === 403 ? t("admin.users.eraseForbidden") : isApiError(e) && e.status === 422 ? t("admin.users.erasureNote") : isApiError(e) ? e.message : t("errors.generic");
      } finally {
        busy.value = false;
      }
    }
    const toggleRole = (k, on) => {
      draftRoles.value = on ? [...draftRoles.value, k] : draftRoles.value.filter((x) => x !== k);
    };
    const roleDisabled = (r) => !isSuperAdmin.value && r.privileged;
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g;
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_AdminFilters = _sfc_main$2;
      const _component_UiCard = _sfc_main$4;
      const _component_UiSkeleton = _sfc_main$6;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$7;
      const _component_AdminDataTable = _sfc_main$8;
      const _component_UiBadge = _sfc_main$9;
      const _component_UiPagination = _sfc_main$a;
      const _component_AdminDialog = _sfc_main$b;
      const _component_UiAlert = _sfc_main$c;
      const _component_UiConfirmInline = _sfc_main$d;
      const _component_UiFormField = _sfc_main$e;
      const _component_UiCheckbox = _sfc_main$f;
      const _component_UiTextInput = _sfc_main$g;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)("admin.users.title"),
        description: unref(t)("admin.users.subtitle"),
        crumbs: [{ label: unref(t)("admin.title"), to: "/admin" }, { label: unref(t)("admin.users.title") }]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(can)("roles.view")) {
              _push2(ssrRenderComponent(_component_UiButton, {
                variant: "secondary",
                to: "/admin/users/roles"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiIcon, {
                      name: "shield",
                      size: 18
                    }, null, _parent3, _scopeId2));
                    _push3(`${ssrInterpolate(unref(t)("admin.nav.roles"))}`);
                  } else {
                    return [
                      createVNode(_component_UiIcon, {
                        name: "shield",
                        size: 18
                      }),
                      createTextVNode(toDisplayString(unref(t)("admin.nav.roles")), 1)
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
              unref(can)("roles.view") ? (openBlock(), createBlock(_component_UiButton, {
                key: 0,
                variant: "secondary",
                to: "/admin/users/roles"
              }, {
                default: withCtx(() => [
                  createVNode(_component_UiIcon, {
                    name: "shield",
                    size: 18
                  }),
                  createTextVNode(toDisplayString(unref(t)("admin.nav.roles")), 1)
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
      if (unref(st) === "pending" && !unref(data)) {
        _push(`<ul aria-busy="true"><li>`);
        _push(ssrRenderComponent(_component_UiCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSkeleton, { lines: 5 }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSkeleton, { lines: 5 })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</li></ul>`);
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
          icon: "user"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(list).hasFilters.value) {
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "secondary",
                  onClick: ($event) => unref(list).clear()
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("admin.common.clear"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("admin.common.clear")), 1)
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
                unref(list).hasFilters.value ? (openBlock(), createBlock(_component_UiButton, {
                  key: 0,
                  variant: "secondary",
                  onClick: ($event) => unref(list).clear()
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("admin.common.clear")), 1)
                  ]),
                  _: 1
                }, 8, ["onClick"])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_AdminDataTable, {
          columns: unref(columns),
          rows: unref(rows),
          "row-key": "id",
          caption: unref(t)("admin.users.title"),
          sort: unref(list).state.value.sort,
          onSort: unref(list).setSort
        }, {
          "cell-name": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span dir="auto"${_scopeId}>${ssrInterpolate(row.name)}</span>`);
            } else {
              return [
                createVNode("span", { dir: "auto" }, toDisplayString(row.name), 1)
              ];
            }
          }),
          "cell-email": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span dir="ltr" class="text-sm"${_scopeId}>${ssrInterpolate(row.email)}</span>`);
            } else {
              return [
                createVNode("span", {
                  dir: "ltr",
                  class: "text-sm"
                }, toDisplayString(row.email), 1)
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
                    _push3(`${ssrInterpolate(unref(t)(`admin.users.status.${row.status}`))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)(`admin.users.status.${row.status}`)), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiBadge, {
                  tone: tone(row.status)
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)(`admin.users.status.${row.status}`)), 1)
                  ]),
                  _: 2
                }, 1032, ["tone"])
              ];
            }
          }),
          "cell-roles": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (!row.roles.length) {
                _push2(`<span class="text-muted"${_scopeId}>\u2014</span>`);
              } else {
                _push2(`<span class="flex flex-wrap gap-1"${_scopeId}><!--[-->`);
                ssrRenderList(row.roles, (r) => {
                  _push2(ssrRenderComponent(_component_UiBadge, {
                    key: r,
                    tone: "primary"
                  }, {
                    default: withCtx((_, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(r)}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(r), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                });
                _push2(`<!--]--></span>`);
              }
            } else {
              return [
                !row.roles.length ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "text-muted"
                }, "\u2014")) : (openBlock(), createBlock("span", {
                  key: 1,
                  class: "flex flex-wrap gap-1"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(row.roles, (r) => {
                    return openBlock(), createBlock(_component_UiBadge, {
                      key: r,
                      tone: "primary"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(r), 1)
                      ]),
                      _: 2
                    }, 1024);
                  }), 128))
                ]))
              ];
            }
          }),
          "cell-last_login_at": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-sm"${_scopeId}>${ssrInterpolate(row.last_login_at ? unref(formatDateTime)(row.last_login_at, unref(locale)) : "\u2014")}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-sm" }, toDisplayString(row.last_login_at ? unref(formatDateTime)(row.last_login_at, unref(locale)) : "\u2014"), 1)
              ];
            }
          }),
          "cell-created_at": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-sm"${_scopeId}>${ssrInterpolate(unref(formatDateTime)(row.created_at, unref(locale)))}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-sm" }, toDisplayString(unref(formatDateTime)(row.created_at, unref(locale))), 1)
              ];
            }
          }),
          "cell-actions": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiButton, {
                variant: "secondary",
                onClick: ($event) => openUser(row)
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("admin.common.details"))}<span class="sr-only"${_scopeId2}>${ssrInterpolate(row.email)}</span>`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("admin.common.details")), 1),
                      createVNode("span", { class: "sr-only" }, toDisplayString(row.email), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiButton, {
                  variant: "secondary",
                  onClick: ($event) => openUser(row)
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("admin.common.details")), 1),
                    createVNode("span", { class: "sr-only" }, toDisplayString(row.email), 1)
                  ]),
                  _: 2
                }, 1032, ["onClick"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="mt-4 space-y-2 text-center">`);
        if (((_a = unref(meta)) == null ? void 0 : _a.total) !== void 0) {
          _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("admin.common.results", { count: unref(meta).total }))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_c = (_b = unref(meta)) == null ? void 0 : _b.page) != null ? _c : 1,
          "last-page": (_e = (_d = unref(meta)) == null ? void 0 : _d.last_page) != null ? _e : 1,
          onChange: unref(list).setPage
        }, null, _parent));
        _push(`</div><!--]-->`);
      }
      _push(ssrRenderComponent(_component_AdminDialog, {
        open: !!unref(selected),
        variant: "drawer",
        title: (_g = (_f = unref(selected)) == null ? void 0 : _f.name) != null ? _g : "",
        onClose: ($event) => selected.value = null
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(selected)) {
              _push2(`<div class="space-y-5"${_scopeId}><dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2"${_scopeId}><dt class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("admin.fields.email"))}</dt><dd dir="ltr" class="text-start"${_scopeId}>${ssrInterpolate(unref(selected).email)}</dd><dt class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("admin.fields.status"))}</dt><dd${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiBadge, {
                tone: tone(unref(selected).status)
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)(`admin.users.status.${unref(selected).status}`))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)(`admin.users.status.${unref(selected).status}`)), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</dd><dt class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("admin.users.verified"))}</dt><dd${_scopeId}>${ssrInterpolate(unref(t)(unref(selected).email_verified ? "admin.common.true" : "admin.common.false"))}</dd><dt class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("admin.users.language"))}</dt><dd${_scopeId}>${ssrInterpolate(unref(t)(`languages.${unref(selected).locale}`))}</dd><dt class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("admin.users.lastLogin"))}</dt><dd${_scopeId}>${ssrInterpolate(unref(selected).last_login_at ? unref(formatDateTime)(unref(selected).last_login_at, unref(locale)) : "\u2014")}</dd><dt class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("admin.users.created"))}</dt><dd${_scopeId}>${ssrInterpolate(unref(formatDateTime)(unref(selected).created_at, unref(locale)))}</dd></dl><div aria-live="polite"${_scopeId}>`);
              if (unref(msgErr)) {
                _push2(ssrRenderComponent(_component_UiAlert, {
                  tone: "danger",
                  title: unref(t)("admin.common.forbiddenTitle")
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(msgErr))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(msgErr)), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
              if (unref(isSelf)) {
                _push2(ssrRenderComponent(_component_UiAlert, { tone: "info" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("admin.users.selfNote"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("admin.users.selfNote")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else if (unref(escalationBlocked)) {
                _push2(ssrRenderComponent(_component_UiAlert, { tone: "info" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("admin.users.privilegedNote"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("admin.users.privilegedNote")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(can)("users.update")) {
                _push2(`<section aria-labelledby="st-h" class="space-y-2"${_scopeId}><h3 id="st-h" class="font-bold"${_scopeId}>${ssrInterpolate(unref(t)("admin.users.accountStatus"))}</h3>`);
                if (unref(selected).status === "pending_erasure") {
                  _push2(`<p class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("admin.users.erasureNote"))}</p>`);
                } else if (unref(selected).status === "active") {
                  _push2(`<!--[-->`);
                  if (!unref(confirmSuspend)) {
                    _push2(ssrRenderComponent(_component_UiButton, {
                      variant: "danger",
                      disabled: !unref(canEditStatus),
                      onClick: ($event) => confirmSuspend.value = true
                    }, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(`${ssrInterpolate(unref(t)("admin.users.suspend"))}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(unref(t)("admin.users.suspend")), 1)
                          ];
                        }
                      }),
                      _: 1
                    }, _parent2, _scopeId));
                  } else {
                    _push2(ssrRenderComponent(_component_UiConfirmInline, {
                      message: unref(t)("admin.users.confirmSuspend"),
                      "confirm-label": unref(t)("admin.users.suspend"),
                      loading: unref(busy),
                      onCancel: ($event) => confirmSuspend.value = false,
                      onConfirm: ($event) => setStatus("suspended")
                    }, null, _parent2, _scopeId));
                  }
                  _push2(`<!--]-->`);
                } else {
                  _push2(ssrRenderComponent(_component_UiButton, {
                    loading: unref(busy),
                    disabled: !unref(canEditStatus),
                    onClick: ($event) => setStatus("active")
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("admin.users.activate"))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("admin.users.activate")), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                }
                _push2(`</section>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(can)("roles.assign")) {
                _push2(`<section aria-labelledby="rl-h" class="space-y-2"${_scopeId}><h3 id="rl-h" class="font-bold"${_scopeId}>${ssrInterpolate(unref(t)("admin.users.roles"))}</h3><p class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("admin.users.escalationRules"))}</p>`);
                _push2(ssrRenderComponent(_component_UiFormField, {
                  group: "",
                  label: unref(t)("admin.users.roles")
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    var _a2, _b2;
                    if (_push3) {
                      _push3(`<!--[-->`);
                      ssrRenderList((_a2 = unref(roles)) != null ? _a2 : [], (r) => {
                        _push3(ssrRenderComponent(_component_UiCheckbox, {
                          key: r.key,
                          "model-value": unref(draftRoles).includes(r.key),
                          disabled: !unref(canEditRoles) || roleDisabled(r),
                          label: r.label,
                          description: r.privileged ? unref(t)("admin.users.privilegedRole") : void 0,
                          "onUpdate:modelValue": ($event) => toggleRole(r.key, $event)
                        }, null, _parent3, _scopeId2));
                      });
                      _push3(`<!--]-->`);
                    } else {
                      return [
                        (openBlock(true), createBlock(Fragment, null, renderList((_b2 = unref(roles)) != null ? _b2 : [], (r) => {
                          return openBlock(), createBlock(_component_UiCheckbox, {
                            key: r.key,
                            "model-value": unref(draftRoles).includes(r.key),
                            disabled: !unref(canEditRoles) || roleDisabled(r),
                            label: r.label,
                            description: r.privileged ? unref(t)("admin.users.privilegedRole") : void 0,
                            "onUpdate:modelValue": ($event) => toggleRole(r.key, $event)
                          }, null, 8, ["model-value", "disabled", "label", "description", "onUpdate:modelValue"]);
                        }), 128))
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UiButton, {
                  loading: unref(busy),
                  disabled: !unref(canEditRoles) || !unref(rolesChanged) || !unref(draftRoles).length,
                  onClick: saveRoles
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("admin.users.saveRoles"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("admin.users.saveRoles")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</section>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(can)("users.delete")) {
                _push2(`<section aria-labelledby="er-h" class="space-y-2 border-t border-line pt-4"${_scopeId}><h3 id="er-h" class="font-bold"${_scopeId}>${ssrInterpolate(unref(t)("admin.users.eraseTitle"))}</h3><p class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("admin.users.eraseHelp"))}</p>`);
                if (!unref(erasing)) {
                  _push2(ssrRenderComponent(_component_UiButton, {
                    variant: "danger",
                    disabled: !unref(canErase),
                    onClick: ($event) => erasing.value = true
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("admin.users.erase"))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("admin.users.erase")), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<form class="space-y-3 rounded-md border border-danger bg-danger-soft p-4"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiFormField, {
                    label: unref(t)("admin.users.eraseType", { email: unref(selected).email }),
                    required: ""
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(ssrRenderComponent(_component_UiTextInput, {
                          modelValue: unref(typedEmail),
                          "onUpdate:modelValue": ($event) => isRef(typedEmail) ? typedEmail.value = $event : null,
                          type: "email",
                          autocomplete: "off",
                          ltr: "",
                          "data-autofocus": ""
                        }, null, _parent3, _scopeId2));
                      } else {
                        return [
                          createVNode(_component_UiTextInput, {
                            modelValue: unref(typedEmail),
                            "onUpdate:modelValue": ($event) => isRef(typedEmail) ? typedEmail.value = $event : null,
                            type: "email",
                            autocomplete: "off",
                            ltr: "",
                            "data-autofocus": ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                  _push2(`<div class="flex flex-wrap gap-2"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiButton, {
                    type: "submit",
                    variant: "danger",
                    disabled: !unref(erasureMatches),
                    loading: unref(busy)
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("admin.users.eraseConfirm"))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("admin.users.eraseConfirm")), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                  _push2(ssrRenderComponent(_component_UiButton, {
                    variant: "secondary",
                    onClick: ($event) => {
                      erasing.value = false;
                      typedEmail.value = "";
                    }
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
                  _push2(`</div></form>`);
                }
                _push2(`</section>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(selected) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "space-y-5"
              }, [
                createVNode("dl", { class: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-2" }, [
                  createVNode("dt", { class: "text-ink-soft" }, toDisplayString(unref(t)("admin.fields.email")), 1),
                  createVNode("dd", {
                    dir: "ltr",
                    class: "text-start"
                  }, toDisplayString(unref(selected).email), 1),
                  createVNode("dt", { class: "text-ink-soft" }, toDisplayString(unref(t)("admin.fields.status")), 1),
                  createVNode("dd", null, [
                    createVNode(_component_UiBadge, {
                      tone: tone(unref(selected).status)
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)(`admin.users.status.${unref(selected).status}`)), 1)
                      ]),
                      _: 1
                    }, 8, ["tone"])
                  ]),
                  createVNode("dt", { class: "text-ink-soft" }, toDisplayString(unref(t)("admin.users.verified")), 1),
                  createVNode("dd", null, toDisplayString(unref(t)(unref(selected).email_verified ? "admin.common.true" : "admin.common.false")), 1),
                  createVNode("dt", { class: "text-ink-soft" }, toDisplayString(unref(t)("admin.users.language")), 1),
                  createVNode("dd", null, toDisplayString(unref(t)(`languages.${unref(selected).locale}`)), 1),
                  createVNode("dt", { class: "text-ink-soft" }, toDisplayString(unref(t)("admin.users.lastLogin")), 1),
                  createVNode("dd", null, toDisplayString(unref(selected).last_login_at ? unref(formatDateTime)(unref(selected).last_login_at, unref(locale)) : "\u2014"), 1),
                  createVNode("dt", { class: "text-ink-soft" }, toDisplayString(unref(t)("admin.users.created")), 1),
                  createVNode("dd", null, toDisplayString(unref(formatDateTime)(unref(selected).created_at, unref(locale))), 1)
                ]),
                createVNode("div", { "aria-live": "polite" }, [
                  unref(msgErr) ? (openBlock(), createBlock(_component_UiAlert, {
                    key: 0,
                    tone: "danger",
                    title: unref(t)("admin.common.forbiddenTitle")
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(msgErr)), 1)
                    ]),
                    _: 1
                  }, 8, ["title"])) : createCommentVNode("", true)
                ]),
                unref(isSelf) ? (openBlock(), createBlock(_component_UiAlert, {
                  key: 0,
                  tone: "info"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("admin.users.selfNote")), 1)
                  ]),
                  _: 1
                })) : unref(escalationBlocked) ? (openBlock(), createBlock(_component_UiAlert, {
                  key: 1,
                  tone: "info"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("admin.users.privilegedNote")), 1)
                  ]),
                  _: 1
                })) : createCommentVNode("", true),
                unref(can)("users.update") ? (openBlock(), createBlock("section", {
                  key: 2,
                  "aria-labelledby": "st-h",
                  class: "space-y-2"
                }, [
                  createVNode("h3", {
                    id: "st-h",
                    class: "font-bold"
                  }, toDisplayString(unref(t)("admin.users.accountStatus")), 1),
                  unref(selected).status === "pending_erasure" ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "text-sm text-muted"
                  }, toDisplayString(unref(t)("admin.users.erasureNote")), 1)) : unref(selected).status === "active" ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                    !unref(confirmSuspend) ? (openBlock(), createBlock(_component_UiButton, {
                      key: 0,
                      variant: "danger",
                      disabled: !unref(canEditStatus),
                      onClick: ($event) => confirmSuspend.value = true
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("admin.users.suspend")), 1)
                      ]),
                      _: 1
                    }, 8, ["disabled", "onClick"])) : (openBlock(), createBlock(_component_UiConfirmInline, {
                      key: 1,
                      message: unref(t)("admin.users.confirmSuspend"),
                      "confirm-label": unref(t)("admin.users.suspend"),
                      loading: unref(busy),
                      onCancel: ($event) => confirmSuspend.value = false,
                      onConfirm: ($event) => setStatus("suspended")
                    }, null, 8, ["message", "confirm-label", "loading", "onCancel", "onConfirm"]))
                  ], 64)) : (openBlock(), createBlock(_component_UiButton, {
                    key: 2,
                    loading: unref(busy),
                    disabled: !unref(canEditStatus),
                    onClick: ($event) => setStatus("active")
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("admin.users.activate")), 1)
                    ]),
                    _: 1
                  }, 8, ["loading", "disabled", "onClick"]))
                ])) : createCommentVNode("", true),
                unref(can)("roles.assign") ? (openBlock(), createBlock("section", {
                  key: 3,
                  "aria-labelledby": "rl-h",
                  class: "space-y-2"
                }, [
                  createVNode("h3", {
                    id: "rl-h",
                    class: "font-bold"
                  }, toDisplayString(unref(t)("admin.users.roles")), 1),
                  createVNode("p", { class: "text-sm text-muted" }, toDisplayString(unref(t)("admin.users.escalationRules")), 1),
                  createVNode(_component_UiFormField, {
                    group: "",
                    label: unref(t)("admin.users.roles")
                  }, {
                    default: withCtx(() => {
                      var _a2;
                      return [
                        (openBlock(true), createBlock(Fragment, null, renderList((_a2 = unref(roles)) != null ? _a2 : [], (r) => {
                          return openBlock(), createBlock(_component_UiCheckbox, {
                            key: r.key,
                            "model-value": unref(draftRoles).includes(r.key),
                            disabled: !unref(canEditRoles) || roleDisabled(r),
                            label: r.label,
                            description: r.privileged ? unref(t)("admin.users.privilegedRole") : void 0,
                            "onUpdate:modelValue": ($event) => toggleRole(r.key, $event)
                          }, null, 8, ["model-value", "disabled", "label", "description", "onUpdate:modelValue"]);
                        }), 128))
                      ];
                    }),
                    _: 1
                  }, 8, ["label"]),
                  createVNode(_component_UiButton, {
                    loading: unref(busy),
                    disabled: !unref(canEditRoles) || !unref(rolesChanged) || !unref(draftRoles).length,
                    onClick: saveRoles
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("admin.users.saveRoles")), 1)
                    ]),
                    _: 1
                  }, 8, ["loading", "disabled"])
                ])) : createCommentVNode("", true),
                unref(can)("users.delete") ? (openBlock(), createBlock("section", {
                  key: 4,
                  "aria-labelledby": "er-h",
                  class: "space-y-2 border-t border-line pt-4"
                }, [
                  createVNode("h3", {
                    id: "er-h",
                    class: "font-bold"
                  }, toDisplayString(unref(t)("admin.users.eraseTitle")), 1),
                  createVNode("p", { class: "text-sm text-muted" }, toDisplayString(unref(t)("admin.users.eraseHelp")), 1),
                  !unref(erasing) ? (openBlock(), createBlock(_component_UiButton, {
                    key: 0,
                    variant: "danger",
                    disabled: !unref(canErase),
                    onClick: ($event) => erasing.value = true
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("admin.users.erase")), 1)
                    ]),
                    _: 1
                  }, 8, ["disabled", "onClick"])) : (openBlock(), createBlock("form", {
                    key: 1,
                    class: "space-y-3 rounded-md border border-danger bg-danger-soft p-4",
                    onSubmit: withModifiers(erase, ["prevent"])
                  }, [
                    createVNode(_component_UiFormField, {
                      label: unref(t)("admin.users.eraseType", { email: unref(selected).email }),
                      required: ""
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiTextInput, {
                          modelValue: unref(typedEmail),
                          "onUpdate:modelValue": ($event) => isRef(typedEmail) ? typedEmail.value = $event : null,
                          type: "email",
                          autocomplete: "off",
                          ltr: "",
                          "data-autofocus": ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }, 8, ["label"]),
                    createVNode("div", { class: "flex flex-wrap gap-2" }, [
                      createVNode(_component_UiButton, {
                        type: "submit",
                        variant: "danger",
                        disabled: !unref(erasureMatches),
                        loading: unref(busy)
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(t)("admin.users.eraseConfirm")), 1)
                        ]),
                        _: 1
                      }, 8, ["disabled", "loading"]),
                      createVNode(_component_UiButton, {
                        variant: "secondary",
                        onClick: ($event) => {
                          erasing.value = false;
                          typedEmail.value = "";
                        }
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(t)("common.cancel")), 1)
                        ]),
                        _: 1
                      }, 8, ["onClick"])
                    ])
                  ], 32))
                ])) : createCommentVNode("", true)
              ])) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/users/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DYWf8tBP.mjs.map
