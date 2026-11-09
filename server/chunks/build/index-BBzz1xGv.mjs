import { u as useAdminSeo, _ as _sfc_main$1 } from './useAdminSeo-DuRYEU0h.mjs';
import { u as useI18n, g as useApi, _ as _sfc_main$3, d as _sfc_main$5, i as _sfc_main$2$1, j as isApiError, l as fieldErrors } from './server.mjs';
import { _ as _sfc_main$2 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$4 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$6 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$7 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$8 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$9 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$a } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$b } from './DataTable--nNCrVdv.mjs';
import { _ as _sfc_main$c } from './Pagination-DA28GIFv.mjs';
import { _ as _sfc_main$d } from './Dialog-D35kg5aY.mjs';
import { _ as _sfc_main$e } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$f } from './ConfirmInline-sG5Cp32P.mjs';
import { defineComponent, ref, computed, withAsyncContext, reactive, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, isRef, withModifiers, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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
import './permissions-CcyNKBx7.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const LOCALES = ["ar", "en", "it"];
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    const { can } = usePermissions();
    useAdminSeo(() => t("admin.geo.title"));
    const regionFilter = ref("");
    const q = ref("");
    const page = ref(1);
    const query = computed(() => ({ page: page.value, per_page: 50, ...regionFilter.value ? { region_id: regionFilter.value } : {}, ...q.value.trim() ? { q: q.value.trim() } : {} }));
    const { data: regionData } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("admin-regions", async () => {
      try {
        return (await request("admin/regions")).data;
      } catch {
        return [];
      }
    })), __temp = await __temp, __restore(), __temp);
    const regions = computed(() => {
      var _a;
      return (_a = regionData.value) != null ? _a : [];
    });
    const { data, error, refresh, status: st } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("admin-cities", () => request("admin/cities", { query: query.value }), { watch: [query] })), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    const nameOf = (tr) => {
      var _a, _b, _c, _d;
      return (_d = (_c = (_b = (_a = tr[locale.value]) != null ? _a : tr.en) != null ? _b : tr.ar) != null ? _c : Object.values(tr)[0]) != null ? _d : "";
    };
    const regionName = (id) => {
      const r = regions.value.find((x) => x.id === id);
      return r ? nameOf(r.translations) || r.slug : String(id);
    };
    const columns = computed(() => [
      { key: "name", label: t("admin.geo.name") },
      { key: "slug", label: t("admin.geo.slug") },
      { key: "region", label: t("admin.geo.region") },
      ...can("cities.update") || can("cities.delete") ? [{ key: "actions", label: t("admin.common.actions") }] : []
    ]);
    const editing = ref(null);
    const form = reactive({ slug: "", region_id: "", names: { ar: "", en: "", it: "" } });
    const errors = ref({});
    const failure = ref("");
    const busy = ref(false);
    function open(c) {
      var _a;
      editing.value = c;
      errors.value = {};
      failure.value = "";
      form.slug = c === "new" ? "" : c.slug;
      form.region_id = c === "new" ? "" : String(c.region_id);
      for (const l of LOCALES) form.names[l] = c === "new" ? "" : (_a = c.translations[l]) != null ? _a : "";
    }
    async function save() {
      errors.value = {};
      failure.value = "";
      if (!form.region_id) {
        errors.value = { region_id: t("admin.geo.regionRequired") };
        return;
      }
      if (!form.names.ar.trim()) {
        errors.value = { "translations.ar": t("admin.geo.arabicRequired") };
        return;
      }
      busy.value = true;
      const translations = Object.fromEntries(LOCALES.filter((l) => form.names[l].trim()).map((l) => [l, { name: form.names[l].trim() }]));
      try {
        const body = { slug: form.slug.trim(), region_id: Number(form.region_id), translations };
        if (editing.value === "new") await request("admin/cities", { method: "POST", body });
        else await request(`admin/cities/${editing.value.id}`, { method: "PUT", body });
        toast.success(t("admin.geo.saved"));
        editing.value = null;
        await refresh();
      } catch (e) {
        errors.value = fieldErrors(e);
        failure.value = isApiError(e) && e.status === 403 ? t("admin.common.forbidden") : !Object.keys(errors.value).length ? isApiError(e) ? e.message : t("errors.generic") : "";
      } finally {
        busy.value = false;
      }
    }
    const removing = ref(null);
    const removeError = ref("");
    async function remove() {
      if (!removing.value) return;
      busy.value = true;
      removeError.value = "";
      try {
        await request(`admin/cities/${removing.value.id}`, { method: "DELETE" });
        toast.success(t("admin.geo.deleted"));
        removing.value = null;
        await refresh();
      } catch (e) {
        removeError.value = isApiError(e) && e.code === "city_in_use" ? t("admin.geo.inUse") : isApiError(e) && e.status === 403 ? t("admin.common.forbidden") : isApiError(e) ? e.message : t("errors.generic");
      } finally {
        busy.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiBadge = _sfc_main$2;
      const _component_UiFormField = _sfc_main$4;
      const _component_UiTextInput = _sfc_main$6;
      const _component_UiSelect = _sfc_main$7;
      const _component_UiCard = _sfc_main$8;
      const _component_UiSkeleton = _sfc_main$9;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$a;
      const _component_AdminDataTable = _sfc_main$b;
      const _component_UiPagination = _sfc_main$c;
      const _component_AdminDialog = _sfc_main$d;
      const _component_UiAlert = _sfc_main$e;
      const _component_UiConfirmInline = _sfc_main$f;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)("admin.geo.title"),
        description: unref(t)("admin.geo.help"),
        crumbs: [{ label: unref(t)("admin.title"), to: "/admin" }, { label: unref(t)("admin.geo.title") }]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(can)("cities.create")) {
              _push2(ssrRenderComponent(_component_UiButton, {
                onClick: ($event) => open("new")
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiIcon, {
                      name: "plus",
                      size: 18
                    }, null, _parent3, _scopeId2));
                    _push3(`${ssrInterpolate(unref(t)("admin.geo.add"))}`);
                  } else {
                    return [
                      createVNode(_component_UiIcon, {
                        name: "plus",
                        size: 18
                      }),
                      createTextVNode(toDisplayString(unref(t)("admin.geo.add")), 1)
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
              unref(can)("cities.create") ? (openBlock(), createBlock(_component_UiButton, {
                key: 0,
                onClick: ($event) => open("new")
              }, {
                default: withCtx(() => [
                  createVNode(_component_UiIcon, {
                    name: "plus",
                    size: 18
                  }),
                  createTextVNode(toDisplayString(unref(t)("admin.geo.add")), 1)
                ]),
                _: 1
              }, 8, ["onClick"])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(regions).length) {
        _push(`<section aria-labelledby="reg-h" class="mb-8"><h2 id="reg-h" class="mb-2 text-xl font-bold">${ssrInterpolate(unref(t)("admin.geo.regions"))}</h2><ul class="flex flex-wrap gap-2"><!--[-->`);
        ssrRenderList(unref(regions), (r) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiBadge, { tone: "neutral" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span dir="auto"${_scopeId}>${ssrInterpolate(nameOf(r.translations) || r.slug)}</span> <span class="text-muted" dir="ltr"${_scopeId}>(${ssrInterpolate(r.cities)})</span>`);
              } else {
                return [
                  createVNode("span", { dir: "auto" }, toDisplayString(nameOf(r.translations) || r.slug), 1),
                  createTextVNode(),
                  createVNode("span", {
                    class: "text-muted",
                    dir: "ltr"
                  }, "(" + toDisplayString(r.cities) + ")", 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul></section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="mb-6 grid gap-4 sm:grid-cols-2">`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("admin.common.search")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(q),
              "onUpdate:modelValue": [($event) => isRef(q) ? q.value = $event : null, ($event) => page.value = 1],
              type: "search"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(q),
                "onUpdate:modelValue": [($event) => isRef(q) ? q.value = $event : null, ($event) => page.value = 1],
                type: "search"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("admin.geo.region")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(regionFilter),
              options: unref(regions).map((r) => ({ value: String(r.id), label: nameOf(r.translations) || r.slug })),
              placeholder: unref(t)("admin.common.all"),
              "onUpdate:modelValue": ($event) => {
                regionFilter.value = $event;
                page.value = 1;
              }
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(regionFilter),
                options: unref(regions).map((r) => ({ value: String(r.id), label: nameOf(r.translations) || r.slug })),
                placeholder: unref(t)("admin.common.all"),
                "onUpdate:modelValue": ($event) => {
                  regionFilter.value = $event;
                  page.value = 1;
                }
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
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
          icon: "map"
        }, null, _parent));
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_AdminDataTable, {
          columns: unref(columns),
          rows: unref(rows),
          "row-key": "id",
          caption: unref(t)("admin.geo.title")
        }, {
          "cell-name": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span dir="auto"${_scopeId}>${ssrInterpolate(nameOf(row.translations))}</span>`);
            } else {
              return [
                createVNode("span", { dir: "auto" }, toDisplayString(nameOf(row.translations)), 1)
              ];
            }
          }),
          "cell-slug": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span dir="ltr"${_scopeId}>${ssrInterpolate(row.slug)}</span>`);
            } else {
              return [
                createVNode("span", { dir: "ltr" }, toDisplayString(row.slug), 1)
              ];
            }
          }),
          "cell-region": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span dir="auto"${_scopeId}>${ssrInterpolate(regionName(row.region_id))}</span>`);
            } else {
              return [
                createVNode("span", { dir: "auto" }, toDisplayString(regionName(row.region_id)), 1)
              ];
            }
          }),
          "cell-actions": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="flex flex-wrap gap-2"${_scopeId}>`);
              if (unref(can)("cities.update")) {
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "secondary",
                  onClick: ($event) => open(row)
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("admin.common.edit"))}<span class="sr-only"${_scopeId2}>${ssrInterpolate(nameOf(row.translations))}</span>`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("admin.common.edit")), 1),
                        createVNode("span", { class: "sr-only" }, toDisplayString(nameOf(row.translations)), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(can)("cities.delete")) {
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "danger",
                  onClick: ($event) => {
                    removing.value = row;
                    removeError.value = "";
                  }
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("admin.geo.delete"))}<span class="sr-only"${_scopeId2}>${ssrInterpolate(nameOf(row.translations))}</span>`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("admin.geo.delete")), 1),
                        createVNode("span", { class: "sr-only" }, toDisplayString(nameOf(row.translations)), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</span>`);
            } else {
              return [
                createVNode("span", { class: "flex flex-wrap gap-2" }, [
                  unref(can)("cities.update") ? (openBlock(), createBlock(_component_UiButton, {
                    key: 0,
                    variant: "secondary",
                    onClick: ($event) => open(row)
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("admin.common.edit")), 1),
                      createVNode("span", { class: "sr-only" }, toDisplayString(nameOf(row.translations)), 1)
                    ]),
                    _: 2
                  }, 1032, ["onClick"])) : createCommentVNode("", true),
                  unref(can)("cities.delete") ? (openBlock(), createBlock(_component_UiButton, {
                    key: 1,
                    variant: "danger",
                    onClick: ($event) => {
                      removing.value = row;
                      removeError.value = "";
                    }
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("admin.geo.delete")), 1),
                      createVNode("span", { class: "sr-only" }, toDisplayString(nameOf(row.translations)), 1)
                    ]),
                    _: 2
                  }, 1032, ["onClick"])) : createCommentVNode("", true)
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="mt-4">`);
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_b = (_a = unref(meta)) == null ? void 0 : _a.page) != null ? _b : 1,
          "last-page": (_d = (_c = unref(meta)) == null ? void 0 : _c.last_page) != null ? _d : 1,
          onChange: ($event) => page.value = $event
        }, null, _parent));
        _push(`</div><!--]-->`);
      }
      _push(ssrRenderComponent(_component_AdminDialog, {
        open: !!unref(editing),
        title: unref(editing) === "new" ? unref(t)("admin.geo.add") : unref(t)("admin.geo.edit"),
        onClose: ($event) => editing.value = null
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form class="space-y-4" novalidate${_scopeId}><div aria-live="polite"${_scopeId}>`);
            if (unref(failure)) {
              _push2(ssrRenderComponent(_component_UiAlert, { tone: "danger" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(failure))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(failure)), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
            _push2(ssrRenderComponent(_component_UiFormField, {
              label: unref(t)("admin.geo.slug"),
              hint: unref(t)("admin.geo.slugHint"),
              required: "",
              error: unref(errors).slug
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UiTextInput, {
                    modelValue: unref(form).slug,
                    "onUpdate:modelValue": ($event) => unref(form).slug = $event,
                    ltr: "",
                    maxlength: 80
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UiTextInput, {
                      modelValue: unref(form).slug,
                      "onUpdate:modelValue": ($event) => unref(form).slug = $event,
                      ltr: "",
                      maxlength: 80
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UiFormField, {
              label: unref(t)("admin.geo.region"),
              required: "",
              error: unref(errors).region_id
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UiSelect, {
                    modelValue: unref(form).region_id,
                    "onUpdate:modelValue": ($event) => unref(form).region_id = $event,
                    options: unref(regions).map((r) => ({ value: String(r.id), label: nameOf(r.translations) || r.slug })),
                    placeholder: unref(t)("common.choose")
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UiSelect, {
                      modelValue: unref(form).region_id,
                      "onUpdate:modelValue": ($event) => unref(form).region_id = $event,
                      options: unref(regions).map((r) => ({ value: String(r.id), label: nameOf(r.translations) || r.slug })),
                      placeholder: unref(t)("common.choose")
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<!--[-->`);
            ssrRenderList(LOCALES, (l) => {
              _push2(ssrRenderComponent(_component_UiFormField, {
                key: l,
                label: `${unref(t)("admin.geo.name")} (${unref(t)(`languages.${l}`)})`,
                required: l === "ar",
                optional: l !== "ar",
                error: unref(errors)[`translations.${l}.name`] || unref(errors)[`translations.${l}`] || (l === "ar" ? unref(errors).translations || unref(errors)["translations.ar"] : void 0)
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiTextInput, {
                      modelValue: unref(form).names[l],
                      "onUpdate:modelValue": ($event) => unref(form).names[l] = $event,
                      maxlength: 120,
                      dir: l === "ar" ? "rtl" : "ltr"
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiTextInput, {
                        modelValue: unref(form).names[l],
                        "onUpdate:modelValue": ($event) => unref(form).names[l] = $event,
                        maxlength: 120,
                        dir: l === "ar" ? "rtl" : "ltr"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "dir"])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            });
            _push2(`<!--]--><div class="flex flex-wrap gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiButton, {
              type: "submit",
              loading: unref(busy)
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(t)("common.save"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("common.save")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UiButton, {
              variant: "secondary",
              onClick: ($event) => editing.value = null
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
          } else {
            return [
              createVNode("form", {
                class: "space-y-4",
                novalidate: "",
                onSubmit: withModifiers(save, ["prevent"])
              }, [
                createVNode("div", { "aria-live": "polite" }, [
                  unref(failure) ? (openBlock(), createBlock(_component_UiAlert, {
                    key: 0,
                    tone: "danger"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(failure)), 1)
                    ]),
                    _: 1
                  })) : createCommentVNode("", true)
                ]),
                createVNode(_component_UiFormField, {
                  label: unref(t)("admin.geo.slug"),
                  hint: unref(t)("admin.geo.slugHint"),
                  required: "",
                  error: unref(errors).slug
                }, {
                  default: withCtx(() => [
                    createVNode(_component_UiTextInput, {
                      modelValue: unref(form).slug,
                      "onUpdate:modelValue": ($event) => unref(form).slug = $event,
                      ltr: "",
                      maxlength: 80
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  _: 1
                }, 8, ["label", "hint", "error"]),
                createVNode(_component_UiFormField, {
                  label: unref(t)("admin.geo.region"),
                  required: "",
                  error: unref(errors).region_id
                }, {
                  default: withCtx(() => [
                    createVNode(_component_UiSelect, {
                      modelValue: unref(form).region_id,
                      "onUpdate:modelValue": ($event) => unref(form).region_id = $event,
                      options: unref(regions).map((r) => ({ value: String(r.id), label: nameOf(r.translations) || r.slug })),
                      placeholder: unref(t)("common.choose")
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
                  ]),
                  _: 1
                }, 8, ["label", "error"]),
                (openBlock(), createBlock(Fragment, null, renderList(LOCALES, (l) => {
                  return createVNode(_component_UiFormField, {
                    key: l,
                    label: `${unref(t)("admin.geo.name")} (${unref(t)(`languages.${l}`)})`,
                    required: l === "ar",
                    optional: l !== "ar",
                    error: unref(errors)[`translations.${l}.name`] || unref(errors)[`translations.${l}`] || (l === "ar" ? unref(errors).translations || unref(errors)["translations.ar"] : void 0)
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UiTextInput, {
                        modelValue: unref(form).names[l],
                        "onUpdate:modelValue": ($event) => unref(form).names[l] = $event,
                        maxlength: 120,
                        dir: l === "ar" ? "rtl" : "ltr"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "dir"])
                    ]),
                    _: 2
                  }, 1032, ["label", "required", "optional", "error"]);
                }), 64)),
                createVNode("div", { class: "flex flex-wrap gap-2" }, [
                  createVNode(_component_UiButton, {
                    type: "submit",
                    loading: unref(busy)
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("common.save")), 1)
                    ]),
                    _: 1
                  }, 8, ["loading"]),
                  createVNode(_component_UiButton, {
                    variant: "secondary",
                    onClick: ($event) => editing.value = null
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("common.cancel")), 1)
                    ]),
                    _: 1
                  }, 8, ["onClick"])
                ])
              ], 32)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_AdminDialog, {
        open: !!unref(removing),
        title: unref(t)("admin.geo.delete"),
        onClose: ($event) => removing.value = null
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(removing)) {
              _push2(`<div class="space-y-4"${_scopeId}><div aria-live="polite"${_scopeId}>`);
              if (unref(removeError)) {
                _push2(ssrRenderComponent(_component_UiAlert, { tone: "danger" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(removeError))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(removeError)), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
              _push2(ssrRenderComponent(_component_UiConfirmInline, {
                message: unref(t)("admin.geo.deleteConfirm", { name: nameOf(unref(removing).translations) }),
                "confirm-label": unref(t)("admin.geo.delete"),
                loading: unref(busy),
                onCancel: ($event) => removing.value = null,
                onConfirm: remove
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(removing) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "space-y-4"
              }, [
                createVNode("div", { "aria-live": "polite" }, [
                  unref(removeError) ? (openBlock(), createBlock(_component_UiAlert, {
                    key: 0,
                    tone: "danger"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(removeError)), 1)
                    ]),
                    _: 1
                  })) : createCommentVNode("", true)
                ]),
                createVNode(_component_UiConfirmInline, {
                  message: unref(t)("admin.geo.deleteConfirm", { name: nameOf(unref(removing).translations) }),
                  "confirm-label": unref(t)("admin.geo.delete"),
                  loading: unref(busy),
                  onCancel: ($event) => removing.value = null,
                  onConfirm: remove
                }, null, 8, ["message", "confirm-label", "loading", "onCancel"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/geography/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BBzz1xGv.mjs.map
