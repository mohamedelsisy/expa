import { u as useAdminSeo, _ as _sfc_main$2 } from './useAdminSeo-DuRYEU0h.mjs';
import { u as useI18n, f as useRoute, _ as _sfc_main$3, d as _sfc_main$5, g as useApi, c as useLocalePath, j as isApiError, i as _sfc_main$2$1, h as formatDateTime, e as __nuxt_component_0 } from './server.mjs';
import { u as useAdminList, _ as _sfc_main$4 } from './useAdminList-mIj2O5_R.mjs';
import { _ as _sfc_main$6 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$7 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$8 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$9 } from './DataTable--nNCrVdv.mjs';
import { f as useRelationOptions, S as STATUSES, _ as _sfc_main$b, b as _sfc_main$1$1 } from './FreshnessBadge-C3EJLnMu.mjs';
import { _ as _sfc_main$a } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$c } from './Pagination-DA28GIFv.mjs';
import { defineComponent, computed, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, withAsyncContext, createSlots, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { m as moduleByKey, E as ENUMS } from './modules-CgmwLVRo.mjs';
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
import './FormField-DFtov8VK.mjs';
import './TextInput-BI4efS3_.mjs';
import './Select-BjjHKxeN.mjs';
import './Checkbox-PDAPbGXG.mjs';
import './permissions-CcyNKBx7.mjs';
import 'perfect-debounce';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ContentList",
  __ssrInlineRender: true,
  props: {
    module: {}
  },
  async setup(__props) {
    let __temp, __restore;
    const props = __props;
    const m = props.module;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const { can } = usePermissions();
    const localePath = useLocalePath();
    const filterKeys = ["q", "status", "stale", ...m.filters.map((f) => f.key)];
    const list = useAdminList({ filterKeys, defaultSort: "-updated_at", sortable: m.sortable, defaultPerPage: 20 });
    const rels = Object.fromEntries(m.filters.filter((f) => f.relation).map((f) => [f.key, useRelationOptions(f.relation)]));
    const { data, error, refresh, status: st } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(`admin-list-${m.key}`, () => request(m.endpoint, { query: list.apiQuery.value }), { watch: [list.apiQuery] })), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    const enumOpts = (e) => ENUMS[e].map((v) => ({ value: v, label: t(`admin.enums.${e}.${v}`) }));
    const fields = computed(() => [
      { key: "q", type: "search", label: t("admin.common.search"), placeholder: t("admin.content.searchPlaceholder") },
      { key: "status", type: "select", label: t("admin.fields.status"), options: STATUSES.map((v) => ({ value: v, label: t(`admin.status.${v}`) })) },
      ...m.filters.map((f) => {
        var _a, _b;
        return { key: f.key, type: "select", label: t(`admin.fields.${f.key}`), options: f.enum ? enumOpts(f.enum) : (_b = (_a = rels[f.key]) == null ? void 0 : _a.options.value) != null ? _b : [] };
      }),
      { key: "stale", type: "checkbox", label: t("admin.content.staleOnly") }
    ]);
    const columns = computed(() => [
      { key: "title", label: t(`admin.fields.${m.primary}`) },
      { key: "slug", label: t("admin.fields.slug"), sortable: true },
      { key: "status", label: t("admin.fields.status"), sortable: true },
      ...m.columns.map((c) => ({ key: c, label: t(`admin.fields.${c}`), sortable: m.sortable.includes(c) })),
      { key: "freshness", label: t("admin.fields.freshness"), sortable: true },
      { key: "missing", label: t("admin.translation.missing") },
      { key: "updated_at", label: t("admin.fields.updated_at"), sortable: true }
    ]);
    const onSort = (c) => list.setSort(c === "freshness" ? "last_verified_at" : c);
    const sortForTable = computed(() => list.state.value.sort.replace("last_verified_at", "freshness"));
    const titleOf = (r) => {
      var _a, _b, _c, _d;
      return ((_a = r.titles) == null ? void 0 : _a[locale.value]) || ((_b = r.titles) == null ? void 0 : _b.ar) || ((_c = r.titles) == null ? void 0 : _c.en) || ((_d = r.titles) == null ? void 0 : _d.it) || r.slug;
    };
    const cell = (r, c) => {
      var _a;
      const v = r[c];
      if (v === true || v === false) return t(v ? "admin.common.true" : "admin.common.false");
      const enumKey = (_a = m.attributes.find((a) => a.key === c)) == null ? void 0 : _a.enum;
      return enumKey && v ? t(`admin.enums.${enumKey}.${v}`) : v != null ? v : "\u2014";
    };
    const errMsg = computed(() => isApiError(error.value) ? error.value.message : void 0);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f;
      const _component_AdminFilters = _sfc_main$4;
      const _component_UiCard = _sfc_main$6;
      const _component_UiSkeleton = _sfc_main$7;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$8;
      const _component_UiButton = _sfc_main$3;
      const _component_AdminDataTable = _sfc_main$9;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AdminStatusBadge = _sfc_main$1$1;
      const _component_AdminFreshnessBadge = _sfc_main$b;
      const _component_UiBadge = _sfc_main$a;
      const _component_UiPagination = _sfc_main$c;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminFilters, {
        fields: fields.value,
        filters: unref(list).state.value.filters,
        label: unref(t)("admin.common.filters"),
        onSet: unref(list).setFilter,
        onClear: unref(list).clear
      }, null, _parent));
      _push(`<div aria-live="polite" class="sr-only">${ssrInterpolate(((_a = meta.value) == null ? void 0 : _a.total) !== void 0 ? unref(t)("admin.common.results", { count: meta.value.total }) : "")}</div>`);
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
          message: errMsg.value,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!rows.value.length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(list).hasFilters.value ? unref(t)("admin.common.noResults") : unref(t)("admin.content.emptyTitle"),
          description: unref(list).hasFilters.value ? unref(t)("admin.common.noResultsHelp") : unref(t)("admin.content.empty"),
          icon: "file"
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
              } else if (unref(can)(`${unref(m).permission}.create`)) {
                _push2(ssrRenderComponent(_component_UiButton, {
                  to: `/admin/content/${unref(m).key}/new`
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("admin.content.new"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("admin.content.new")), 1)
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
                }, 8, ["onClick"])) : unref(can)(`${unref(m).permission}.create`) ? (openBlock(), createBlock(_component_UiButton, {
                  key: 1,
                  to: `/admin/content/${unref(m).key}/new`
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("admin.content.new")), 1)
                  ]),
                  _: 1
                }, 8, ["to"])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_AdminDataTable, {
          columns: columns.value,
          rows: rows.value,
          "row-key": "id",
          caption: unref(t)(`admin.modules.${unref(m).key}`),
          sort: sortForTable.value,
          onSort
        }, createSlots({
          "cell-title": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: unref(localePath)(`/admin/content/${unref(m).key}/${row.id}`),
                class: "inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4",
                dir: "auto"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(titleOf(row))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(titleOf(row)), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_NuxtLink, {
                  to: unref(localePath)(`/admin/content/${unref(m).key}/${row.id}`),
                  class: "inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4",
                  dir: "auto"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(titleOf(row)), 1)
                  ]),
                  _: 2
                }, 1032, ["to"])
              ];
            }
          }),
          "cell-slug": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span dir="ltr" class="text-sm text-ink-soft"${_scopeId}>${ssrInterpolate(row.slug)}</span>`);
            } else {
              return [
                createVNode("span", {
                  dir: "ltr",
                  class: "text-sm text-ink-soft"
                }, toDisplayString(row.slug), 1)
              ];
            }
          }),
          "cell-status": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_AdminStatusBadge, {
                status: row.status
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_AdminStatusBadge, {
                  status: row.status
                }, null, 8, ["status"])
              ];
            }
          }),
          "cell-freshness": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            var _a2, _b2, _c2, _d2;
            if (_push2) {
              _push2(ssrRenderComponent(_component_AdminFreshnessBadge, {
                freshness: (_b2 = (_a2 = row.source) == null ? void 0 : _a2.freshness) != null ? _b2 : "unverified"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_AdminFreshnessBadge, {
                  freshness: (_d2 = (_c2 = row.source) == null ? void 0 : _c2.freshness) != null ? _d2 : "unverified"
                }, null, 8, ["freshness"])
              ];
            }
          }),
          "cell-missing": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            var _a2, _b2;
            if (_push2) {
              if (!((_a2 = row.missing_locales) == null ? void 0 : _a2.length)) {
                _push2(`<span class="text-muted"${_scopeId}>\u2014</span>`);
              } else {
                _push2(`<span class="flex flex-wrap gap-1"${_scopeId}><!--[-->`);
                ssrRenderList(row.missing_locales, (l) => {
                  _push2(ssrRenderComponent(_component_UiBadge, {
                    key: l,
                    tone: "warning"
                  }, {
                    default: withCtx((_, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(l.toUpperCase())}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(l.toUpperCase()), 1)
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
                !((_b2 = row.missing_locales) == null ? void 0 : _b2.length) ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "text-muted"
                }, "\u2014")) : (openBlock(), createBlock("span", {
                  key: 1,
                  class: "flex flex-wrap gap-1"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(row.missing_locales, (l) => {
                    return openBlock(), createBlock(_component_UiBadge, {
                      key: l,
                      tone: "warning"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(l.toUpperCase()), 1)
                      ]),
                      _: 2
                    }, 1024);
                  }), 128))
                ]))
              ];
            }
          }),
          "cell-updated_at": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<time${ssrRenderAttr("datetime", row.updated_at)} class="text-sm text-ink-soft"${_scopeId}>${ssrInterpolate(unref(formatDateTime)(row.updated_at, unref(locale)))}</time>`);
            } else {
              return [
                createVNode("time", {
                  datetime: row.updated_at,
                  class: "text-sm text-ink-soft"
                }, toDisplayString(unref(formatDateTime)(row.updated_at, unref(locale))), 9, ["datetime"])
              ];
            }
          }),
          _: 2
        }, [
          renderList(unref(m).columns, (c) => {
            return {
              name: `cell-${c}`,
              fn: withCtx(({ row }, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(cell(row, c))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(cell(row, c)), 1)
                  ];
                }
              })
            };
          })
        ]), _parent));
        _push(`<div class="mt-4 space-y-2 text-center">`);
        if (((_b = meta.value) == null ? void 0 : _b.total) !== void 0) {
          _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("admin.common.results", { count: meta.value.total }))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_d = (_c = meta.value) == null ? void 0 : _c.page) != null ? _d : 1,
          "last-page": (_f = (_e = meta.value) == null ? void 0 : _e.last_page) != null ? _f : 1,
          onChange: unref(list).setPage
        }, null, _parent));
        _push(`</div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/ContentList.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const route = useRoute();
    const { can } = usePermissions();
    const m = computed(() => moduleByKey(route.params.module));
    useAdminSeo(() => t(`admin.modules.${m.value.key}`));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$2;
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_AdminContentList = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)(`admin.modules.${unref(m).key}`),
        crumbs: [{ label: unref(t)("admin.title"), to: "/admin" }, { label: unref(t)(`admin.modules.${unref(m).key}`) }]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(can)(`${unref(m).permission}.create`)) {
              _push2(ssrRenderComponent(_component_UiButton, {
                to: `/admin/content/${unref(m).key}/new`
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiIcon, {
                      name: "plus",
                      size: 18
                    }, null, _parent3, _scopeId2));
                    _push3(`${ssrInterpolate(unref(t)("admin.content.new"))}`);
                  } else {
                    return [
                      createVNode(_component_UiIcon, {
                        name: "plus",
                        size: 18
                      }),
                      createTextVNode(toDisplayString(unref(t)("admin.content.new")), 1)
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
              unref(can)(`${unref(m).permission}.create`) ? (openBlock(), createBlock(_component_UiButton, {
                key: 0,
                to: `/admin/content/${unref(m).key}/new`
              }, {
                default: withCtx(() => [
                  createVNode(_component_UiIcon, {
                    name: "plus",
                    size: 18
                  }),
                  createTextVNode(toDisplayString(unref(t)("admin.content.new")), 1)
                ]),
                _: 1
              }, 8, ["to"])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_AdminContentList, {
        key: unref(m).key,
        module: unref(m)
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/content/[module]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-5nu0X32_.mjs.map
