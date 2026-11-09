import { _ as _sfc_main$2 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$3 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, a as useAuthStore, i as _sfc_main$2$1, _ as _sfc_main$3$1, d as _sfc_main$5, k as formatDate, j as isApiError } from './server.mjs';
import { _ as _sfc_main$4 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$6 } from './Checkbox-PDAPbGXG.mjs';
import { _ as _sfc_main$7 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$8 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$a } from './PasswordInput-ClImJukS.mjs';
import { q as qrPath, g as groupSecret, r as recoveryFileText, _ as _sfc_main$b, a as retryAfterOf } from './twoFactor-TZ4hBhIH.mjs';
import { defineComponent, computed, withAsyncContext, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, isRef, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { _ as _sfc_main$9 } from './TextInput-BI4efS3_.mjs';
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
import 'uqr';
import 'perfect-debounce';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TwoFactorReauth",
  __ssrInlineRender: true,
  props: {
    kind: {}
  },
  emits: ["done", "cancel"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const { t } = useI18n();
    useApi();
    const password = ref("");
    const mode = ref("code");
    const value = ref("");
    const errors = ref({});
    const formError = ref("");
    const busy = ref(false);
    const fields = ref(null);
    const root = ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiAlert = _sfc_main$4;
      const _component_UiFormField = _sfc_main$8;
      const _component_UiPasswordInput = _sfc_main$a;
      const _component_AuthCodeOrRecovery = _sfc_main$b;
      const _component_UiButton = _sfc_main$3$1;
      _push(`<form${ssrRenderAttrs(mergeProps({
        ref_key: "root",
        ref: root,
        class: "space-y-5 rounded-lg border border-line bg-surface p-4 sm:p-5",
        novalidate: "",
        "aria-label": __props.kind === "disable" ? unref(t)("twoFactor.manage.disableTitle") : unref(t)("twoFactor.manage.regenTitle"),
        "data-testid": `two-factor-${__props.kind}`
      }, _attrs))}><p class="text-ink-soft">${ssrInterpolate(__props.kind === "disable" ? unref(t)("twoFactor.manage.disableHelp") : unref(t)("twoFactor.manage.regenHelp"))}</p>`);
      if (unref(formError)) {
        _push(ssrRenderComponent(_component_UiAlert, { tone: "danger" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(formError))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(formError)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("twoFactor.manage.password"),
        hint: unref(t)("twoFactor.manage.passwordHint"),
        error: unref(errors).password,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiPasswordInput, {
              modelValue: unref(password),
              "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null,
              autocomplete: "current-password"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiPasswordInput, {
                modelValue: unref(password),
                "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null,
                autocomplete: "current-password"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_AuthCodeOrRecovery, {
        ref_key: "fields",
        ref: fields,
        modelValue: unref(value),
        "onUpdate:modelValue": ($event) => isRef(value) ? value.value = $event : null,
        mode: unref(mode),
        "onUpdate:mode": ($event) => isRef(mode) ? mode.value = $event : null,
        error: unref(errors).code
      }, null, _parent));
      _push(`<div class="flex flex-wrap gap-2">`);
      _push(ssrRenderComponent(_component_UiButton, {
        type: "submit",
        variant: __props.kind === "disable" ? "danger" : "primary",
        loading: unref(busy)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(__props.kind === "disable" ? unref(t)("twoFactor.manage.disable") : unref(t)("twoFactor.manage.regen"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(__props.kind === "disable" ? unref(t)("twoFactor.manage.disable") : unref(t)("twoFactor.manage.regen")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiButton, {
        variant: "secondary",
        onClick: ($event) => emit("cancel")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("twoFactor.manage.close"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("twoFactor.manage.close")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></form>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/auth/TwoFactorReauth.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "two-factor",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const auth = useAuthStore();
    const toast = useToast();
    useSeo(() => ({ title: t("twoFactor.title"), description: t("twoFactor.subtitle"), noindex: true }));
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/" }, { label: t("profile.title"), to: "/profile" }, { label: t("twoFactor.title") }]);
    const { data: status, error, refresh, status: loadState } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("twofa-status", async () => (await request("auth/2fa/status")).data)), __temp = await __temp, __restore(), __temp);
    const setup = ref(null);
    const codes = ref(null);
    const savedAck = ref(false);
    const panel = ref(null);
    const busy = ref(null);
    const code = ref("");
    const codeError = ref("");
    const formError = ref("");
    const stepHeading = ref(null);
    const codesHeading = ref(null);
    const statusLive = ref("");
    ref(null);
    const qr = computed(() => setup.value ? qrPath(setup.value.otpauth_uri) : null);
    const enabled = computed(() => {
      var _a;
      return ((_a = status.value) == null ? void 0 : _a.enabled) === true;
    });
    function fail(e, target = "form") {
      const msg = !isApiError(e) ? t("errors.generic") : e.status === 429 ? retryAfterOf(e) ? t("twoFactor.errors.rateLimited", { seconds: retryAfterOf(e) }) : t("twoFactor.errors.rateLimitedLater") : e.code === "invalid_two_factor_code" ? t("twoFactor.errors.invalidCode") : e.code === "two_factor_already_enabled" ? t("twoFactor.errors.alreadyEnabled") : e.message;
      if (target === "code") codeError.value = msg;
      else formError.value = msg;
    }
    async function startSetup() {
      var _a;
      busy.value = "setup";
      formError.value = "";
      codeError.value = "";
      code.value = "";
      try {
        setup.value = (await request("auth/2fa/setup", { method: "POST" })).data;
        await nextTick();
        (_a = stepHeading.value) == null ? void 0 : _a.focus();
      } catch (e) {
        if (isApiError(e) && e.code === "two_factor_already_enabled") await refresh();
        fail(e);
      } finally {
        busy.value = null;
      }
    }
    function cancelSetup() {
      setup.value = null;
      code.value = "";
      codeError.value = "";
    }
    async function reauthDone(newCodes) {
      var _a, _b, _c;
      const kind = panel.value;
      panel.value = null;
      if (kind === "regen" && newCodes) {
        codes.value = newCodes;
        savedAck.value = false;
        await nextTick();
        (_a = codesHeading.value) == null ? void 0 : _a.focus();
      } else if (kind === "disable") {
        auth.setTwoFactor(false, (_c = (_b = status.value) == null ? void 0 : _b.required) != null ? _c : false);
        toast.success(t("twoFactor.manage.disabled"));
        statusLive.value = t("twoFactor.manage.disabled");
      }
      await refresh();
    }
    function finishCodes() {
      codes.value = null;
      savedAck.value = false;
      nextTick(() => {
        var _a;
        return (_a = (void 0).getElementById("tf-status-h")) == null ? void 0 : _a.focus();
      });
    }
    async function copy(text) {
      try {
        await (void 0).clipboard.writeText(text);
        toast.success(t("twoFactor.setup.copied"));
      } catch {
        toast.error(t("twoFactor.setup.copyFailed"));
      }
    }
    function download() {
      if (!codes.value) return;
      const url = URL.createObjectURL(new Blob([recoveryFileText(t("twoFactor.recovery.file"), codes.value)], { type: "text/plain" }));
      const a = (void 0).createElement("a");
      a.href = url;
      a.download = "expa-recovery-codes.txt";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1e3);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$2;
      const _component_UiSkeleton = _sfc_main$3;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiAlert = _sfc_main$4;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiCheckbox = _sfc_main$6;
      const _component_UiBadge = _sfc_main$7;
      const _component_AuthTwoFactorReauth = _sfc_main$1;
      const _component_UiFormField = _sfc_main$8;
      const _component_UiTextInput = _sfc_main$9;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("twoFactor.title"))}</h1><p class="mt-1 mb-6 text-ink-soft">${ssrInterpolate(unref(t)("twoFactor.subtitle"))}</p><p class="sr-only" role="status">${ssrInterpolate(unref(statusLive))}</p>`);
      if (unref(loadState) === "pending" && !unref(status)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 3
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: unref(t)("twoFactor.status.loadError"),
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (unref(status)) {
        _push(`<!--[-->`);
        if (unref(codes)) {
          _push(`<section aria-labelledby="tf-codes-h" class="space-y-4" data-testid="two-factor-codes"><h2 id="tf-codes-h" tabindex="-1" class="text-xl font-bold outline-none">${ssrInterpolate(unref(t)("twoFactor.recovery.title"))}</h2>`);
          _push(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("twoFactor.recovery.warning"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("twoFactor.recovery.warning")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<ol${ssrRenderAttr("aria-label", unref(t)("twoFactor.recovery.list"))} class="grid grid-cols-1 gap-2 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2"><!--[-->`);
          ssrRenderList(unref(codes), (c) => {
            _push(`<li dir="ltr" class="rounded-md bg-sunken px-3 py-2 text-start font-mono text-base tracking-wide">${ssrInterpolate(c)}</li>`);
          });
          _push(`<!--]--></ol><div class="flex flex-wrap gap-2">`);
          _push(ssrRenderComponent(_component_UiButton, {
            variant: "secondary",
            onClick: ($event) => copy(unref(codes).join("\n"))
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("twoFactor.recovery.copyAll"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("twoFactor.recovery.copyAll")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_UiButton, {
            variant: "secondary",
            onClick: download
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "download",
                  size: 18
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(unref(t)("twoFactor.recovery.download"))}`);
              } else {
                return [
                  createVNode(_component_UiIcon, {
                    name: "download",
                    size: 18
                  }),
                  createTextVNode(toDisplayString(unref(t)("twoFactor.recovery.download")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
          _push(ssrRenderComponent(_component_UiCheckbox, {
            modelValue: unref(savedAck),
            "onUpdate:modelValue": ($event) => isRef(savedAck) ? savedAck.value = $event : null,
            label: unref(t)("twoFactor.recovery.saved")
          }, null, _parent));
          _push(ssrRenderComponent(_component_UiButton, {
            disabled: !unref(savedAck),
            "data-testid": "two-factor-codes-done",
            onClick: finishCodes
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("twoFactor.recovery.done"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("twoFactor.recovery.done")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</section>`);
        } else {
          _push(`<!--[-->`);
          if (unref(status).required) {
            _push(ssrRenderComponent(_component_UiAlert, {
              tone: unref(enabled) ? "info" : "warning",
              title: unref(t)("twoFactor.status.requiredTitle"),
              class: "mb-6",
              "data-testid": "two-factor-required"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(enabled) ? unref(t)("twoFactor.status.requiredDoneBody") : unref(t)("twoFactor.status.requiredSetupBody"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(enabled) ? unref(t)("twoFactor.status.requiredDoneBody") : unref(t)("twoFactor.status.requiredSetupBody")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`<section aria-labelledby="tf-status-h" class="space-y-3 rounded-lg border border-line bg-surface p-4 sm:p-5"><div class="flex flex-wrap items-center justify-between gap-2"><h2 id="tf-status-h" tabindex="-1" class="text-xl font-bold outline-none">${ssrInterpolate(unref(t)("twoFactor.status.heading"))}</h2>`);
          _push(ssrRenderComponent(_component_UiBadge, {
            tone: unref(enabled) ? "success" : "neutral",
            "data-testid": "two-factor-state"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(enabled) ? unref(t)("twoFactor.status.on") : unref(t)("twoFactor.status.off"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(enabled) ? unref(t)("twoFactor.status.on") : unref(t)("twoFactor.status.off")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
          if (unref(enabled)) {
            _push(`<!--[-->`);
            if (unref(status).confirmed_at) {
              _push(`<p class="text-ink-soft">${ssrInterpolate(unref(t)("twoFactor.status.since", { date: unref(formatDate)(unref(status).confirmed_at, unref(locale)) }))}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<p class="${ssrRenderClass(unref(status).recovery_codes_remaining <= 2 ? "font-medium text-warning" : "text-ink-soft")}">${ssrInterpolate(unref(status).recovery_codes_remaining <= 2 ? unref(t)("twoFactor.status.remainingLow", { count: unref(status).recovery_codes_remaining }) : unref(t)("twoFactor.status.remaining", { count: unref(status).recovery_codes_remaining }))}</p><div class="flex flex-wrap gap-2 pt-1">`);
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "secondary",
              "aria-expanded": unref(panel) === "regen",
              onClick: ($event) => panel.value = unref(panel) === "regen" ? null : "regen"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("twoFactor.manage.regenTitle"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("twoFactor.manage.regenTitle")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "danger",
              "aria-expanded": unref(panel) === "disable",
              onClick: ($event) => panel.value = unref(panel) === "disable" ? null : "disable"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("twoFactor.manage.disableTitle"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("twoFactor.manage.disableTitle")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`</div>`);
            if (unref(panel) === "disable" && unref(status).required) {
              _push(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(unref(t)("twoFactor.manage.requiredCannotDisable"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("twoFactor.manage.requiredCannotDisable")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent));
            } else {
              _push(`<!---->`);
            }
            if (unref(panel)) {
              _push(ssrRenderComponent(_component_AuthTwoFactorReauth, {
                key: unref(panel),
                kind: unref(panel),
                onDone: reauthDone,
                onCancel: ($event) => panel.value = null
              }, null, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(`<!--]-->`);
          } else if (!unref(setup)) {
            _push(`<!--[-->`);
            if (unref(formError)) {
              _push(ssrRenderComponent(_component_UiAlert, { tone: "danger" }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(unref(formError))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(formError)), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(ssrRenderComponent(_component_UiButton, {
              loading: unref(busy) === "setup",
              "data-testid": "two-factor-start",
              onClick: startSetup
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(status).setup_pending ? unref(t)("twoFactor.setup.restart") : unref(t)("twoFactor.setup.start"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(status).setup_pending ? unref(t)("twoFactor.setup.restart") : unref(t)("twoFactor.setup.start")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`<!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`</section>`);
          if (unref(setup) && !unref(enabled)) {
            _push(`<section aria-labelledby="tf-step1-h" class="mt-6 space-y-5" data-testid="two-factor-setup"><div class="space-y-3 rounded-lg border border-line bg-surface p-4 sm:p-5"><h2 id="tf-step1-h" tabindex="-1" class="text-xl font-bold outline-none">${ssrInterpolate(unref(t)("twoFactor.setup.step1"))}</h2><p class="text-ink-soft">${ssrInterpolate(unref(t)("twoFactor.setup.scan"))}</p>`);
            if (unref(qr)) {
              _push(`<svg role="img"${ssrRenderAttr("aria-label", unref(t)("twoFactor.setup.qrLabel"))}${ssrRenderAttr("viewBox", `-4 -4 ${unref(qr).size + 8} ${unref(qr).size + 8}`)} class="size-56 max-w-full rounded-md border border-line bg-white" shape-rendering="crispEdges" data-testid="two-factor-qr"><path${ssrRenderAttr("d", unref(qr).path)} fill="#000"></path></svg>`);
            } else {
              _push(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(unref(t)("twoFactor.setup.qrFailed"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("twoFactor.setup.qrFailed")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent));
            }
            _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("twoFactor.setup.privacy"))}</p><details class="rounded-md border border-line p-3"><summary class="min-h-touch cursor-pointer py-2 font-medium">${ssrInterpolate(unref(t)("twoFactor.setup.manual"))}</summary><p class="mt-2 text-sm font-medium">${ssrInterpolate(unref(t)("twoFactor.setup.secretLabel"))}</p><p dir="ltr" class="mt-1 break-all rounded-md bg-sunken px-3 py-2 text-start font-mono" data-testid="two-factor-secret">${ssrInterpolate(unref(groupSecret)(unref(setup).secret))}</p><div class="mt-2 flex flex-wrap gap-2">`);
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "secondary",
              onClick: ($event) => copy(unref(setup).secret)
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("twoFactor.setup.copySecret"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("twoFactor.setup.copySecret")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "secondary",
              onClick: ($event) => copy(unref(setup).otpauth_uri)
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("twoFactor.setup.copyUri"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("twoFactor.setup.copyUri")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`</div></details></div><form class="space-y-4 rounded-lg border border-line bg-surface p-4 sm:p-5" novalidate aria-labelledby="tf-step2-h"><h2 id="tf-step2-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("twoFactor.setup.step2"))}</h2>`);
            if (unref(formError)) {
              _push(ssrRenderComponent(_component_UiAlert, { tone: "danger" }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(unref(formError))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(formError)), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(ssrRenderComponent(_component_UiFormField, {
              label: unref(t)("twoFactor.login.codeLabel"),
              hint: unref(t)("twoFactor.login.codeHint"),
              error: unref(codeError),
              required: ""
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UiTextInput, {
                    modelValue: unref(code),
                    "onUpdate:modelValue": ($event) => isRef(code) ? code.value = $event : null,
                    autocomplete: "one-time-code",
                    inputmode: "numeric",
                    maxlength: 8,
                    ltr: ""
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_UiTextInput, {
                      modelValue: unref(code),
                      "onUpdate:modelValue": ($event) => isRef(code) ? code.value = $event : null,
                      autocomplete: "one-time-code",
                      inputmode: "numeric",
                      maxlength: 8,
                      ltr: ""
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`<div class="flex flex-wrap gap-2">`);
            _push(ssrRenderComponent(_component_UiButton, {
              type: "submit",
              loading: unref(busy) === "confirm"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("twoFactor.setup.confirm"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("twoFactor.setup.confirm")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(ssrRenderComponent(_component_UiButton, {
              variant: "secondary",
              onClick: cancelSetup
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(t)("twoFactor.setup.cancel"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("twoFactor.setup.cancel")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`</div></form></section>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        }
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/settings/two-factor.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=two-factor-BrdFuwGA.mjs.map
