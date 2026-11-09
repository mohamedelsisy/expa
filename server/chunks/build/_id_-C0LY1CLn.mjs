import { _ as _sfc_main$2 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$3 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, g as useApi, c as useLocalePath, j as isApiError, o as createError, i as _sfc_main$2$1, _ as _sfc_main$3$1, d as _sfc_main$5$1, z as formatDay, h as formatDateTime, n as navigateTo, A as isConsentRequired, l as fieldErrors } from './server.mjs';
import { _ as _sfc_main$4 } from './StatusBadge-DdQOB3xC.mjs';
import { _ as _sfc_main$5 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$6 } from './Form-BvHcw3NH.mjs';
import { _ as _sfc_main$7 } from './ConfirmInline-sG5Cp32P.mjs';
import { _ as _sfc_main$8 } from './Gate-CrfDaJ02.mjs';
import { _ as _sfc_main$9 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$a } from './FileInput-CgCeuTL_.mjs';
import { defineComponent, computed, withAsyncContext, ref, watch, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { f as formatBytes, A as ACCEPT, v as validateUpload } from './documents-DL9ve8rH.mjs';
import { u as useToast } from './useToast-BX2bodPv.mjs';
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
import './Badge-PdKIsny2.mjs';
import './Select-BjjHKxeN.mjs';
import './TextInput-BI4efS3_.mjs';
import './Textarea-C8QsGxT0.mjs';
import './Checkbox-PDAPbGXG.mjs';
import './Alert-D-zfMDy5.mjs';
import './Links-BHP4RLan.mjs';
import './legal-vAxOkaZS.mjs';
import 'perfect-debounce';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Attachments",
  __ssrInlineRender: true,
  props: {
    doc: {}
  },
  emits: ["changed"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { t, locale } = useI18n();
    const { request, download } = useApi();
    const toast = useToast();
    const picked = ref(null);
    const problem = ref(null);
    const serverError = ref(null);
    const uploading = ref(false);
    const needConsent = ref(false);
    const fileInput = ref(null);
    const confirmId = ref(null);
    const deleting = ref(false);
    const downloading = ref(null);
    function onPick(e) {
      var _a, _b;
      const f = (_b = (_a = e.target.files) == null ? void 0 : _a[0]) != null ? _b : null;
      serverError.value = null;
      picked.value = null;
      problem.value = null;
      if (!f) return;
      const p = validateUpload(f);
      if (p) {
        problem.value = t(`documents.upload.${p}`);
        return;
      }
      picked.value = f;
    }
    async function upload() {
      var _a, _b;
      if (!picked.value) return;
      uploading.value = true;
      serverError.value = null;
      const fd = new FormData();
      fd.append("file", picked.value);
      try {
        const res = await request(`my-documents/${props.doc.id}/attachments`, { method: "POST", body: fd, timeoutMs: 6e4 });
        toast.success(t("documents.upload.done"));
        picked.value = null;
        (_a = fileInput.value) == null ? void 0 : _a.reset();
        emit("changed", res.data);
      } catch (e) {
        if (isConsentRequired(e, "document_storage")) needConsent.value = true;
        else {
          const fe = fieldErrors(e);
          serverError.value = (_b = fe.file) != null ? _b : isApiError(e) ? e.status === 413 ? t("documents.upload.too_large") : e.message : t("errors.generic");
        }
      } finally {
        uploading.value = false;
      }
    }
    async function get(a) {
      downloading.value = a.id;
      try {
        const blob = await download(`my-documents/${props.doc.id}/attachments/${a.id}`);
        const url = URL.createObjectURL(blob);
        const link = (void 0).createElement("a");
        link.href = url;
        link.download = a.name;
        link.rel = "noopener";
        (void 0).body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1e4);
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        downloading.value = null;
      }
    }
    async function remove(id) {
      deleting.value = true;
      try {
        await request(`my-documents/${props.doc.id}/attachments/${id}`, { method: "DELETE" });
        toast.success(t("documents.attachments.deleted"));
        confirmId.value = null;
        const res = await request(`my-documents/${props.doc.id}`);
        emit("changed", res.data);
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        deleting.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiConfirmInline = _sfc_main$7;
      const _component_ConsentGate = _sfc_main$8;
      const _component_UiFormField = _sfc_main$9;
      const _component_UiFileInput = _sfc_main$a;
      _push(`<section${ssrRenderAttrs(mergeProps({
        "aria-labelledby": "att-h",
        class: "space-y-4"
      }, _attrs))}><h2 id="att-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("documents.attachments.title"))}</h2><p class="flex items-start gap-2 text-sm text-ink-soft">`);
      _push(ssrRenderComponent(_component_UiIcon, {
        name: "lock",
        size: 16,
        class: "mt-0.5"
      }, null, _parent));
      _push(`${ssrInterpolate(unref(t)("documents.attachments.privacy"))}</p>`);
      if (!__props.doc.attachments.length) {
        _push(`<p class="text-muted">${ssrInterpolate(unref(t)("documents.attachments.empty"))}</p>`);
      } else {
        _push(`<ul class="divide-y divide-line rounded-md border border-line bg-surface"><!--[-->`);
        ssrRenderList(__props.doc.attachments, (a) => {
          _push(`<li class="space-y-2 p-3"><div class="flex flex-wrap items-center justify-between gap-2"><div class="min-w-0"><p class="truncate font-medium" dir="auto">${ssrInterpolate(a.name)}</p><p class="flex flex-wrap gap-x-2 text-xs text-muted"><bdi dir="ltr">${ssrInterpolate(unref(formatBytes)(a.size, unref(locale)))}</bdi><span aria-hidden="true">\xB7</span><bdi dir="ltr">${ssrInterpolate(unref(formatDateTime)(a.created_at, unref(locale)))}</bdi></p></div><div class="flex gap-2">`);
          _push(ssrRenderComponent(_component_UiButton, {
            variant: "secondary",
            loading: unref(downloading) === a.id,
            "aria-label": `${unref(t)("documents.attachments.download")}: ${a.name}`,
            onClick: ($event) => get(a)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "download",
                  size: 16
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(unref(t)("documents.attachments.download"))}`);
              } else {
                return [
                  createVNode(_component_UiIcon, {
                    name: "download",
                    size: 16
                  }),
                  createTextVNode(toDisplayString(unref(t)("documents.attachments.download")), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(ssrRenderComponent(_component_UiButton, {
            variant: "ghost",
            "aria-label": `${unref(t)("common.delete")}: ${a.name}`,
            onClick: ($event) => confirmId.value = a.id
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "trash",
                  size: 16
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(unref(t)("common.delete"))}`);
              } else {
                return [
                  createVNode(_component_UiIcon, {
                    name: "trash",
                    size: 16
                  }),
                  createTextVNode(toDisplayString(unref(t)("common.delete")), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div></div>`);
          if (unref(confirmId) === a.id) {
            _push(ssrRenderComponent(_component_UiConfirmInline, {
              message: unref(t)("documents.attachments.deleteConfirm"),
              "confirm-label": unref(t)("common.delete"),
              loading: unref(deleting),
              onConfirm: ($event) => remove(a.id),
              onCancel: ($event) => confirmId.value = null
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      }
      if (unref(needConsent)) {
        _push(ssrRenderComponent(_component_ConsentGate, {
          purpose: "document_storage",
          onGranted: ($event) => {
            needConsent.value = false;
            upload();
          }
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<form class="space-y-3 rounded-md border border-dashed border-line-strong p-4" novalidate>`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("documents.upload.label"),
        hint: unref(t)("documents.upload.hint"),
        error: (_b = (_a = unref(problem)) != null ? _a : unref(serverError)) != null ? _b : void 0
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiFileInput, {
              ref_key: "fileInput",
              ref: fileInput,
              accept: unref(ACCEPT),
              onChange: onPick
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiFileInput, {
                ref_key: "fileInput",
                ref: fileInput,
                accept: unref(ACCEPT),
                onChange: onPick
              }, null, 8, ["accept"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiButton, {
        type: "submit",
        loading: unref(uploading),
        disabled: !unref(picked)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "upload",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("documents.upload.button"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "upload",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("documents.upload.button")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</form></section>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/documents/Attachments.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b;
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const { request } = useApi();
    const toast = useToast();
    const localePath = useLocalePath();
    const id = computed(() => String(route.params.id));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(() => `document-${id.value}`, async () => {
      const [doc2, types] = await Promise.all([request(`my-documents/${encodeURIComponent(id.value)}`), request("document-types")]);
      return { doc: doc2.data, types: types.data };
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    const doc = ref((_b = (_a = data.value) == null ? void 0 : _a.doc) != null ? _b : null);
    watch(data, (d) => {
      if (d) doc.value = d.doc;
    });
    useSeo(() => {
      var _a2, _b2;
      return { title: (_b2 = (_a2 = doc.value) == null ? void 0 : _a2.display_name) != null ? _b2 : t("documents.title"), description: t("documents.subtitle"), noindex: true };
    });
    const editing = ref(false);
    const confirmDelete = ref(false);
    const deleting = ref(false);
    const crumbs = computed(() => {
      var _a2, _b2;
      return [{ label: t("documents.title"), to: "/documents" }, { label: (_b2 = (_a2 = doc.value) == null ? void 0 : _a2.display_name) != null ? _b2 : "" }];
    });
    function saved(d) {
      doc.value = d;
      editing.value = false;
    }
    async function remove() {
      deleting.value = true;
      try {
        await request(`my-documents/${id.value}`, { method: "DELETE" });
        toast.success(t("documents.deleted"));
        await navigateTo(localePath("/documents"));
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        deleting.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$2;
      const _component_UiSkeleton = _sfc_main$3;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_DocumentsStatusBadge = _sfc_main$4;
      const _component_UiCard = _sfc_main$5;
      const _component_DocumentsForm = _sfc_main$6;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_DocumentsAttachments = _sfc_main$1;
      const _component_UiConfirmInline = _sfc_main$7;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      if (unref(status) === "pending" && !unref(doc)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 4
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(doc) || !unref(data)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          "heading-level": 1,
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<div class="space-y-8"><header class="space-y-3">`);
        _push(ssrRenderComponent(_component_DocumentsStatusBadge, {
          status: unref(doc).status,
          days: unref(doc).days_remaining
        }, null, _parent));
        _push(`<h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(doc).display_name)}</h1>`);
        if (unref(doc).label) {
          _push(`<p class="text-ink-soft">${ssrInterpolate(unref(doc).type.name)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</header>`);
        if (unref(editing)) {
          _push(ssrRenderComponent(_component_UiCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_DocumentsForm, {
                  doc: unref(doc),
                  types: unref(data).types,
                  onSaved: saved
                }, null, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "ghost",
                  class: "mt-3",
                  onClick: ($event) => editing.value = false
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
              } else {
                return [
                  createVNode(_component_DocumentsForm, {
                    doc: unref(doc),
                    types: unref(data).types,
                    onSaved: saved
                  }, null, 8, ["doc", "types"]),
                  createVNode(_component_UiButton, {
                    variant: "ghost",
                    class: "mt-3",
                    onClick: ($event) => editing.value = false
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("common.cancel")), 1)
                    ]),
                    _: 1
                  }, 8, ["onClick"])
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(ssrRenderComponent(_component_UiCard, {
            as: "section",
            "aria-labelledby": "det-h",
            class: "space-y-4"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex items-center justify-between gap-3"${_scopeId}><h2 id="det-h" class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("documents.details"))}</h2>`);
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "secondary",
                  onClick: ($event) => editing.value = true
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UiIcon, {
                        name: "edit",
                        size: 16
                      }, null, _parent3, _scopeId2));
                      _push3(`${ssrInterpolate(unref(t)("documents.edit"))}`);
                    } else {
                      return [
                        createVNode(_component_UiIcon, {
                          name: "edit",
                          size: 16
                        }),
                        createTextVNode(toDisplayString(unref(t)("documents.edit")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</div><dl class="grid gap-4 sm:grid-cols-2"${_scopeId}><div${_scopeId}><dt class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("documents.form.issue"))}</dt><dd class="font-medium"${_scopeId}>${ssrInterpolate(unref(doc).issue_date ? unref(formatDay)(unref(doc).issue_date, unref(locale)) : "\u2013")}</dd></div><div${_scopeId}><dt class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("documents.form.expiry"))}</dt><dd class="font-medium"${_scopeId}>${ssrInterpolate(unref(doc).expiry_date ? unref(formatDay)(unref(doc).expiry_date, unref(locale)) : unref(t)("documents.status.no_expiry"))}</dd></div>`);
                if (unref(doc).notes) {
                  _push2(`<div class="sm:col-span-2"${_scopeId}><dt class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("documents.form.notes"))}</dt><dd class="prose-plain" dir="auto"${_scopeId}>${ssrInterpolate(unref(doc).notes)}</dd></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</dl><div${_scopeId}><h3 class="font-bold"${_scopeId}>${ssrInterpolate(unref(t)("documents.reminders"))}</h3>`);
                if (!unref(doc).reminders_enabled) {
                  _push2(`<p class="text-muted"${_scopeId}>${ssrInterpolate(unref(t)("documents.remindersOff"))}</p>`);
                } else if (!unref(doc).expiry_date) {
                  _push2(`<p class="text-muted"${_scopeId}>${ssrInterpolate(unref(t)("documents.remindersNeedExpiry"))}</p>`);
                } else if (unref(doc).upcoming_reminders.length) {
                  _push2(`<ul class="mt-1 space-y-1" data-testid="upcoming-reminders"${_scopeId}><!--[-->`);
                  ssrRenderList(unref(doc).upcoming_reminders, (r) => {
                    _push2(`<li class="flex items-center gap-2"${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_UiIcon, {
                      name: "bell",
                      size: 16,
                      class: "text-muted"
                    }, null, _parent2, _scopeId));
                    _push2(`<time${ssrRenderAttr("datetime", r.on)}${_scopeId}>${ssrInterpolate(unref(formatDay)(r.on, unref(locale)))}</time>`);
                    if (r.kind === "before" && r.offset_days !== null && r.offset_days >= 0) {
                      _push2(`<span class="text-sm text-muted"${_scopeId}>(${ssrInterpolate(unref(t)("documents.daysBefore", { count: r.offset_days }))})</span>`);
                    } else if (r.kind === "expired") {
                      _push2(`<span class="text-sm text-muted"${_scopeId}>(${ssrInterpolate(unref(t)("documents.afterExpiry"))})</span>`);
                    } else {
                      _push2(`<!---->`);
                    }
                    _push2(`</li>`);
                  });
                  _push2(`<!--]--></ul>`);
                } else {
                  _push2(`<p class="text-muted"${_scopeId}>${ssrInterpolate(unref(t)("documents.noUpcoming"))}</p>`);
                }
                _push2(`</div>`);
              } else {
                return [
                  createVNode("div", { class: "flex items-center justify-between gap-3" }, [
                    createVNode("h2", {
                      id: "det-h",
                      class: "text-xl font-bold"
                    }, toDisplayString(unref(t)("documents.details")), 1),
                    createVNode(_component_UiButton, {
                      variant: "secondary",
                      onClick: ($event) => editing.value = true
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiIcon, {
                          name: "edit",
                          size: 16
                        }),
                        createTextVNode(toDisplayString(unref(t)("documents.edit")), 1)
                      ]),
                      _: 1
                    }, 8, ["onClick"])
                  ]),
                  createVNode("dl", { class: "grid gap-4 sm:grid-cols-2" }, [
                    createVNode("div", null, [
                      createVNode("dt", { class: "text-sm text-muted" }, toDisplayString(unref(t)("documents.form.issue")), 1),
                      createVNode("dd", { class: "font-medium" }, toDisplayString(unref(doc).issue_date ? unref(formatDay)(unref(doc).issue_date, unref(locale)) : "\u2013"), 1)
                    ]),
                    createVNode("div", null, [
                      createVNode("dt", { class: "text-sm text-muted" }, toDisplayString(unref(t)("documents.form.expiry")), 1),
                      createVNode("dd", { class: "font-medium" }, toDisplayString(unref(doc).expiry_date ? unref(formatDay)(unref(doc).expiry_date, unref(locale)) : unref(t)("documents.status.no_expiry")), 1)
                    ]),
                    unref(doc).notes ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "sm:col-span-2"
                    }, [
                      createVNode("dt", { class: "text-sm text-muted" }, toDisplayString(unref(t)("documents.form.notes")), 1),
                      createVNode("dd", {
                        class: "prose-plain",
                        dir: "auto"
                      }, toDisplayString(unref(doc).notes), 1)
                    ])) : createCommentVNode("", true)
                  ]),
                  createVNode("div", null, [
                    createVNode("h3", { class: "font-bold" }, toDisplayString(unref(t)("documents.reminders")), 1),
                    !unref(doc).reminders_enabled ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "text-muted"
                    }, toDisplayString(unref(t)("documents.remindersOff")), 1)) : !unref(doc).expiry_date ? (openBlock(), createBlock("p", {
                      key: 1,
                      class: "text-muted"
                    }, toDisplayString(unref(t)("documents.remindersNeedExpiry")), 1)) : unref(doc).upcoming_reminders.length ? (openBlock(), createBlock("ul", {
                      key: 2,
                      class: "mt-1 space-y-1",
                      "data-testid": "upcoming-reminders"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(doc).upcoming_reminders, (r) => {
                        return openBlock(), createBlock("li", {
                          key: r.on + r.kind,
                          class: "flex items-center gap-2"
                        }, [
                          createVNode(_component_UiIcon, {
                            name: "bell",
                            size: 16,
                            class: "text-muted"
                          }),
                          createVNode("time", {
                            datetime: r.on
                          }, toDisplayString(unref(formatDay)(r.on, unref(locale))), 9, ["datetime"]),
                          r.kind === "before" && r.offset_days !== null && r.offset_days >= 0 ? (openBlock(), createBlock("span", {
                            key: 0,
                            class: "text-sm text-muted"
                          }, "(" + toDisplayString(unref(t)("documents.daysBefore", { count: r.offset_days })) + ")", 1)) : r.kind === "expired" ? (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-sm text-muted"
                          }, "(" + toDisplayString(unref(t)("documents.afterExpiry")) + ")", 1)) : createCommentVNode("", true)
                        ]);
                      }), 128))
                    ])) : (openBlock(), createBlock("p", {
                      key: 3,
                      class: "text-muted"
                    }, toDisplayString(unref(t)("documents.noUpcoming")), 1))
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
        }
        _push(ssrRenderComponent(_component_UiCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_DocumentsAttachments, {
                doc: unref(doc),
                onChanged: ($event) => doc.value = $event
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_DocumentsAttachments, {
                  doc: unref(doc),
                  onChanged: ($event) => doc.value = $event
                }, null, 8, ["doc", "onChanged"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div>`);
        if (!unref(confirmDelete)) {
          _push(ssrRenderComponent(_component_UiButton, {
            variant: "ghost",
            class: "text-danger",
            onClick: ($event) => confirmDelete.value = true
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "trash",
                  size: 16
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(unref(t)("documents.delete"))}`);
              } else {
                return [
                  createVNode(_component_UiIcon, {
                    name: "trash",
                    size: 16
                  }),
                  createTextVNode(toDisplayString(unref(t)("documents.delete")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(ssrRenderComponent(_component_UiConfirmInline, {
            message: unref(t)("documents.deleteConfirm"),
            "confirm-label": unref(t)("documents.delete"),
            loading: unref(deleting),
            onConfirm: remove,
            onCancel: ($event) => confirmDelete.value = false
          }, null, _parent));
        }
        _push(`</div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/documents/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-C0LY1CLn.mjs.map
