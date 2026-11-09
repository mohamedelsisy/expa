import { _ as _sfc_main$1 } from './Nav-CnBbBeUx.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, i as _sfc_main$2$1, j as isApiError, _ as _sfc_main$3$1, d as _sfc_main$5$1, h as formatDateTime } from './server.mjs';
import { _ as _sfc_main$3 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$4 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$5 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$6 } from './ConfirmInline-sG5Cp32P.mjs';
import { _ as _sfc_main$7 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$8 } from './FileInput-CgCeuTL_.mjs';
import { defineComponent, withAsyncContext, ref, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { f as formatBytes } from './documents-DL9ve8rH.mjs';
import { E as EXPLAIN_ACCEPT, v as validateExplainFile } from './explain-B6AMfDd9.mjs';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useProviderPortal } from './useProviderPortal-BfW_CYQw.mjs';
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
import './routes-BNQ9Jhms.mjs';
import './safe-B2eSdAXJ.mjs';
import 'perfect-debounce';

const MAX_KB = 5 * 1024;
const MAX_FILES = 5;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "verification",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    useSeo(() => ({ title: t("provider.verify.title"), description: t("provider.verify.intro"), noindex: true }));
    const portal = useProviderPortal();
    const { data: docs, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("provider-evidence", async () => {
      await portal.load();
      if (portal.state.value !== "ready") return [];
      return (await request("provider/verification/documents")).data;
    })), __temp = await __temp, __restore(), __temp);
    const picked = ref(null);
    const fileError = ref();
    const uploading = ref(false);
    const fileInput = ref(null);
    const confirmId = ref(null);
    const busy = ref(false);
    const requesting = ref(false);
    const reqError = ref(null);
    function onPick(e) {
      var _a, _b;
      const f = (_b = (_a = e.target.files) == null ? void 0 : _a[0]) != null ? _b : null;
      picked.value = null;
      fileError.value = void 0;
      if (!f) return;
      const p2 = validateExplainFile(f, MAX_KB);
      if (p2) {
        fileError.value = t(`provider.verify.fileProblems.${p2}`, { size: formatBytes(MAX_KB * 1024, locale.value) });
        return;
      }
      picked.value = f;
    }
    async function remove(id) {
      busy.value = true;
      try {
        await request(`provider/verification/documents/${id}`, { method: "DELETE" });
        confirmId.value = null;
        toast.success(t("provider.verify.deleted"));
        await refresh();
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        busy.value = false;
      }
    }
    async function requestVerification() {
      requesting.value = true;
      reqError.value = null;
      try {
        portal.set((await request("provider/verification/request", { method: "POST" })).data);
        toast.success(t("provider.verify.requested"));
      } catch (e) {
        reqError.value = isApiError(e) && e.code === "verification_evidence_required" ? t("provider.verify.evidenceRequired") : isApiError(e) ? e.message : t("errors.generic");
      } finally {
        requesting.value = false;
      }
    }
    const p = computed(() => portal.profile.value);
    const vStatus = computed(() => {
      var _a, _b, _c, _d;
      return String((_d = (_c = (_a = p.value) == null ? void 0 : _a.effective_verification) != null ? _c : (_b = p.value) == null ? void 0 : _b.verification_status) != null ? _d : "unverified");
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_ProviderNav = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$3;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiAlert = _sfc_main$4;
      const _component_UiBadge = _sfc_main$5;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_UiConfirmInline = _sfc_main$6;
      const _component_UiFormField = _sfc_main$7;
      const _component_UiFileInput = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}><h1 class="mb-6 text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("provider.verify.title"))}</h1>`);
      _push(ssrRenderComponent(_component_ProviderNav, null, null, _parent));
      if (unref(status) === "pending" && !unref(docs)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 4
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (unref(portal).state.value !== "ready" || !unref(p)) {
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
      } else {
        _push(`<div class="space-y-8">`);
        _push(ssrRenderComponent(_component_UiAlert, { tone: "info" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("provider.verify.intro"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("provider.verify.intro")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<p class="flex flex-wrap items-center gap-2"><span class="font-medium">${ssrInterpolate(unref(t)("provider.overview.verification"))}:</span>`);
        _push(ssrRenderComponent(_component_UiBadge, { "data-testid": "verification-status" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)(`provider.verification.${unref(vStatus)}`))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)(`provider.verification.${unref(vStatus)}`)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</p><section aria-labelledby="ev-h" class="space-y-3"><h2 id="ev-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("provider.verify.documents"))}</h2><p class="flex items-start gap-2 text-sm text-ink-soft">`);
        _push(ssrRenderComponent(_component_UiIcon, {
          name: "lock",
          size: 16,
          class: "mt-0.5"
        }, null, _parent));
        _push(`${ssrInterpolate(unref(t)("provider.verify.privacy"))}</p>`);
        if (!((_a = unref(docs)) == null ? void 0 : _a.length)) {
          _push(`<p class="text-muted">${ssrInterpolate(unref(t)("provider.verify.noDocs"))}</p>`);
        } else {
          _push(`<ul class="divide-y divide-line rounded-md border border-line bg-surface"><!--[-->`);
          ssrRenderList(unref(docs), (d) => {
            _push(`<li class="space-y-2 p-3"><div class="flex flex-wrap items-center justify-between gap-2"><div class="min-w-0"><p class="truncate font-medium" dir="auto">${ssrInterpolate(d.original_name)}</p><p class="text-xs text-muted"><bdi>${ssrInterpolate(unref(formatBytes)(d.size, unref(locale)))}</bdi> \xB7 <bdi>${ssrInterpolate(unref(formatDateTime)(d.created_at, unref(locale)))}</bdi></p></div>`);
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "ghost",
              "aria-label": `${unref(t)("common.delete")}: ${d.original_name}`,
              onClick: ($event) => confirmId.value = d.id
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
            _push(`</div>`);
            if (unref(confirmId) === d.id) {
              _push(ssrRenderComponent(_component_UiConfirmInline, {
                message: unref(t)("provider.verify.deleteConfirm"),
                "confirm-label": unref(t)("common.delete"),
                loading: unref(busy),
                onConfirm: ($event) => remove(d.id),
                onCancel: ($event) => confirmId.value = null
              }, null, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(`</li>`);
          });
          _push(`<!--]--></ul>`);
        }
        _push(`<form class="space-y-3 rounded-md border border-dashed border-line-strong p-4" novalidate>`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("provider.verify.file"),
          hint: unref(t)("provider.verify.fileHint", { size: unref(formatBytes)(MAX_KB * 1024, unref(locale)), count: MAX_FILES }),
          error: unref(fileError)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiFileInput, {
                ref_key: "fileInput",
                ref: fileInput,
                accept: unref(EXPLAIN_ACCEPT),
                onChange: onPick
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiFileInput, {
                  ref_key: "fileInput",
                  ref: fileInput,
                  accept: unref(EXPLAIN_ACCEPT),
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
              _push2(`${ssrInterpolate(unref(t)("provider.verify.upload"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "upload",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("provider.verify.upload")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</form></section><section aria-labelledby="rq-h" class="space-y-3"><h2 id="rq-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("provider.verify.request"))}</h2><p class="text-ink-soft">${ssrInterpolate(unref(t)("provider.verify.requestNote"))}</p>`);
        if (unref(reqError)) {
          _push(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(reqError))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(reqError)), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UiButton, {
          loading: unref(requesting),
          disabled: !((_b = unref(docs)) == null ? void 0 : _b.length),
          onClick: requestVerification
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("provider.verify.requestButton"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("provider.verify.requestButton")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</section></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/provider/verification.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=verification-D6lcRf2Z.mjs.map
