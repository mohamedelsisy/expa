import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, a as useAuthStore, g as useApi, j as isApiError, o as createError, c as useLocalePath, i as _sfc_main$2$1, h as formatDateTime, _ as _sfc_main$3$1, d as _sfc_main$5$1 } from './server.mjs';
import { _ as _sfc_main$3 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$4 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$5 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$6 } from './MatchReasons-CqNfUzGS.mjs';
import { defineComponent, computed, withAsyncContext, ref, watch, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, Fragment, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { a as formatSalary } from './money-CRo_itTF.mjs';
import { a as safeHttpsUrl } from './safe-B2eSdAXJ.mjs';
import { u as useToast } from './useToast-BX2bodPv.mjs';
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
import './ScoreRing-D5NDFTYF.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const auth = useAuthStore();
    const { request } = useApi();
    const toast = useToast();
    const id = computed(() => String(route.params.id));
    const { data: job, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(() => `job-${id.value}`, async () => (await request(`jobs/${encodeURIComponent(id.value)}`)).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    useSeo(() => {
      var _a, _b;
      return { title: job.value ? `${job.value.title} | EXPA` : t("jobs.title"), description: job.value ? `${(_a = job.value.company) != null ? _a : ""} ${(_b = job.value.location) != null ? _b : ""}`.trim() || t("jobs.subtitle") : t("jobs.subtitle"), type: "article" };
    });
    const crumbs = computed(() => {
      var _a, _b;
      return [{ label: t("jobs.title"), to: "/jobs" }, { label: (_b = (_a = job.value) == null ? void 0 : _a.title) != null ? _b : "" }];
    });
    const saved = ref(false);
    watch(job, (j) => {
      saved.value = !!(j == null ? void 0 : j.saved);
    }, { immediate: true });
    const saving = ref(false);
    async function toggleSave() {
      saving.value = true;
      const next = !saved.value;
      try {
        await request(`jobs/${id.value}/save`, { method: next ? "POST" : "DELETE" });
        saved.value = next;
        toast.success(next ? t("jobs.savedToast") : t("jobs.unsavedToast"));
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        saving.value = false;
      }
    }
    const applyUrl = ref(null);
    const applyNotice = ref(null);
    const applying = ref(false);
    const applyError = ref(null);
    async function apply() {
      applying.value = true;
      applyError.value = null;
      try {
        const res = await request(`jobs/${id.value}/apply-click`, { method: "POST" });
        applyNotice.value = res.data.notice;
        const url = safeHttpsUrl(res.data.apply_url);
        if (!url) {
          applyError.value = t("jobs.noApplyLink");
          return;
        }
        applyUrl.value = url;
        (void 0).open(url, "_blank", "noopener,noreferrer");
      } catch (e) {
        applyError.value = isApiError(e) ? e.message : t("errors.generic");
      } finally {
        applying.value = false;
      }
    }
    const salary = computed(() => {
      var _a;
      return formatSalary((_a = job.value) == null ? void 0 : _a.salary, locale.value, (p) => t(`jobs.period.${p}`));
    });
    const localePath = useLocalePath();
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiBadge = _sfc_main$3;
      const _component_UiCard = _sfc_main$4;
      const _component_UiAlert = _sfc_main$5;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_JobsMatchReasons = _sfc_main$6;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-4xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      if (unref(status) === "pending" && !unref(job)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 6
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(job)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          "heading-level": 1,
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]"><article class="min-w-0 space-y-6"><header class="space-y-3"><div class="flex flex-wrap gap-2">`);
        _push(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(job).category_label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(job).category_label), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiBadge, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(job).employment_type_label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(job).employment_type_label), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiBadge, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(job).remote_mode_label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(job).remote_mode_label), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><h1 class="text-3xl font-bold">${ssrInterpolate(unref(job).title)}</h1><p class="text-lg text-ink-soft">${ssrInterpolate(unref(job).company)}`);
        if (unref(job).city || unref(job).location) {
          _push(`<!--[--> \xB7 ${ssrInterpolate((_b = (_a = unref(job).city) == null ? void 0 : _a.name) != null ? _b : unref(job).location)}<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</p>`);
        if (unref(job).source) {
          _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("jobs.via", { source: unref(job).source }))}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(job).published_at) {
          _push(`<p class="text-sm text-muted"><time${ssrRenderAttr("datetime", unref(job).published_at)}>${ssrInterpolate(unref(formatDateTime)(unref(job).published_at, unref(locale)))}</time></p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</header><dl class="grid gap-3 sm:grid-cols-2">`);
        if (unref(salary)) {
          _push(`<div><dt class="text-sm text-muted">${ssrInterpolate(unref(t)("jobs.salary"))}</dt><dd class="font-semibold tabular-nums" data-testid="job-salary"><bdi>${ssrInterpolate(unref(salary))}</bdi></dd></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div><dt class="text-sm text-muted">${ssrInterpolate(unref(t)("jobs.visa"))}</dt><dd class="font-semibold" data-testid="visa-label">${ssrInterpolate(unref(job).visa_sponsorship.label)}</dd></div>`);
        if (unref(job).italian_level) {
          _push(`<div><dt class="text-sm text-muted">${ssrInterpolate(unref(t)("jobs.italianRequired"))}</dt><dd class="font-semibold">${ssrInterpolate(unref(job).italian_level.toUpperCase())}</dd></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(job).english_level) {
          _push(`<div><dt class="text-sm text-muted">${ssrInterpolate(unref(t)("jobs.englishRequired"))}</dt><dd class="font-semibold">${ssrInterpolate(unref(job).english_level.toUpperCase())}</dd></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(job).experience_years != null) {
          _push(`<div><dt class="text-sm text-muted">${ssrInterpolate(unref(t)("jobs.experience"))}</dt><dd class="font-semibold">${ssrInterpolate(unref(t)("jobs.years", { count: unref(job).experience_years }))}</dd></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</dl>`);
        if (unref(job).skills.length) {
          _push(`<section aria-labelledby="sk-h"><h2 id="sk-h" class="mb-2 text-xl font-bold">${ssrInterpolate(unref(t)("jobs.skills"))}</h2><ul class="flex flex-wrap gap-2"><!--[-->`);
          ssrRenderList(unref(job).skills, (s) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_UiBadge, null, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(s)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(s), 1)
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
        if (unref(job).description) {
          _push(`<section aria-labelledby="ds-h"><h2 id="ds-h" class="mb-2 text-xl font-bold">${ssrInterpolate(unref(t)("jobs.description"))}</h2><p class="prose-plain text-lg" dir="auto">${ssrInterpolate(unref(job).description)}</p></section>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</article><aside class="space-y-5 lg:sticky lg:top-24 lg:self-start">`);
        _push(ssrRenderComponent(_component_UiCard, { class: "space-y-3" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiAlert, {
                tone: "info",
                "data-testid": "apply-notice"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(job).apply_notice)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(job).apply_notice), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              if (unref(auth).isAuthenticated) {
                _push2(`<!--[-->`);
                _push2(ssrRenderComponent(_component_UiButton, {
                  block: "",
                  size: "lg",
                  loading: unref(applying),
                  "data-testid": "apply-btn",
                  onClick: apply
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UiIcon, {
                        name: "external",
                        size: 18
                      }, null, _parent3, _scopeId2));
                      _push3(`${ssrInterpolate(unref(t)("jobs.apply"))}`);
                    } else {
                      return [
                        createVNode(_component_UiIcon, {
                          name: "external",
                          size: 18
                        }),
                        createTextVNode(toDisplayString(unref(t)("jobs.apply")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                if (unref(applyUrl)) {
                  _push2(`<p class="text-sm"${_scopeId}><a${ssrRenderAttr("href", unref(applyUrl))} target="_blank" rel="noopener noreferrer" class="inline-flex min-h-touch items-center gap-1 font-medium text-primary-strong underline underline-offset-4" data-testid="apply-link"${_scopeId}>${ssrInterpolate(unref(t)("jobs.openOriginal"))}<span class="sr-only"${_scopeId}>${ssrInterpolate(unref(t)("a11y.opensNewTab"))}</span></a></p>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(applyError)) {
                  _push2(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(applyError))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(applyError)), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(ssrRenderComponent(_component_UiButton, {
                  block: "",
                  variant: "secondary",
                  loading: unref(saving),
                  "aria-pressed": unref(saved),
                  onClick: toggleSave
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UiIcon, {
                        name: "bookmark",
                        size: 18
                      }, null, _parent3, _scopeId2));
                      _push3(`${ssrInterpolate(unref(saved) ? unref(t)("jobs.unsave") : unref(t)("jobs.save"))}`);
                    } else {
                      return [
                        createVNode(_component_UiIcon, {
                          name: "bookmark",
                          size: 18
                        }),
                        createTextVNode(toDisplayString(unref(saved) ? unref(t)("jobs.unsave") : unref(t)("jobs.save")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`<!--]-->`);
              } else {
                _push2(ssrRenderComponent(_component_UiButton, {
                  block: "",
                  to: `/login?redirect=${encodeURIComponent(unref(localePath)(`/jobs/${unref(job).id}`))}`,
                  variant: "secondary"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("jobs.loginToApply"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("jobs.loginToApply")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              }
            } else {
              return [
                createVNode(_component_UiAlert, {
                  tone: "info",
                  "data-testid": "apply-notice"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(job).apply_notice), 1)
                  ]),
                  _: 1
                }),
                unref(auth).isAuthenticated ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                  createVNode(_component_UiButton, {
                    block: "",
                    size: "lg",
                    loading: unref(applying),
                    "data-testid": "apply-btn",
                    onClick: apply
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UiIcon, {
                        name: "external",
                        size: 18
                      }),
                      createTextVNode(toDisplayString(unref(t)("jobs.apply")), 1)
                    ]),
                    _: 1
                  }, 8, ["loading"]),
                  unref(applyUrl) ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "text-sm"
                  }, [
                    createVNode("a", {
                      href: unref(applyUrl),
                      target: "_blank",
                      rel: "noopener noreferrer",
                      class: "inline-flex min-h-touch items-center gap-1 font-medium text-primary-strong underline underline-offset-4",
                      "data-testid": "apply-link"
                    }, [
                      createTextVNode(toDisplayString(unref(t)("jobs.openOriginal")), 1),
                      createVNode("span", { class: "sr-only" }, toDisplayString(unref(t)("a11y.opensNewTab")), 1)
                    ], 8, ["href"])
                  ])) : createCommentVNode("", true),
                  unref(applyError) ? (openBlock(), createBlock(_component_UiAlert, {
                    key: 1,
                    tone: "warning"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(applyError)), 1)
                    ]),
                    _: 1
                  })) : createCommentVNode("", true),
                  createVNode(_component_UiButton, {
                    block: "",
                    variant: "secondary",
                    loading: unref(saving),
                    "aria-pressed": unref(saved),
                    onClick: toggleSave
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UiIcon, {
                        name: "bookmark",
                        size: 18
                      }),
                      createTextVNode(toDisplayString(unref(saved) ? unref(t)("jobs.unsave") : unref(t)("jobs.save")), 1)
                    ]),
                    _: 1
                  }, 8, ["loading", "aria-pressed"])
                ], 64)) : (openBlock(), createBlock(_component_UiButton, {
                  key: 1,
                  block: "",
                  to: `/login?redirect=${encodeURIComponent(unref(localePath)(`/jobs/${unref(job).id}`))}`,
                  variant: "secondary"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("jobs.loginToApply")), 1)
                  ]),
                  _: 1
                }, 8, ["to"]))
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(auth).isAuthenticated) {
          _push(ssrRenderComponent(_component_UiCard, { class: "space-y-3" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                if (unref(job).match) {
                  _push2(ssrRenderComponent(_component_JobsMatchReasons, {
                    match: unref(job).match
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<p class="text-muted"${_scopeId}>${ssrInterpolate(unref(t)("jobs.match.noScore"))}</p>`);
                }
                _push2(ssrRenderComponent(_component_UiButton, {
                  to: "/jobs/preferences",
                  variant: "ghost"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("jobs.improveMatch"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("jobs.improveMatch")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                return [
                  unref(job).match ? (openBlock(), createBlock(_component_JobsMatchReasons, {
                    key: 0,
                    match: unref(job).match
                  }, null, 8, ["match"])) : (openBlock(), createBlock("p", {
                    key: 1,
                    class: "text-muted"
                  }, toDisplayString(unref(t)("jobs.match.noScore")), 1)),
                  createVNode(_component_UiButton, {
                    to: "/jobs/preferences",
                    variant: "ghost"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("jobs.improveMatch")), 1)
                    ]),
                    _: 1
                  })
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/jobs/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-KlAAqv-v.mjs.map
