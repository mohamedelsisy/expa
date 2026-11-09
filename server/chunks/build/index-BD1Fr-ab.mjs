import { _ as _sfc_main$1 } from './Badge-PdKIsny2.mjs';
import { u as useI18n, a as useAuthStore, b as useRuntimeConfig, c as useLocalePath, _ as _sfc_main$3, d as _sfc_main$5, e as __nuxt_component_0 } from './server.mjs';
import { _ as _sfc_main$2 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$4 } from './ScoreRing-D5NDFTYF.mjs';
import { _ as _sfc_main$6 } from './ProgressBar-DvR1KKgW.mjs';
import { defineComponent, withAsyncContext, withCtx, unref, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
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
import './safe-B2eSdAXJ.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t } = useI18n();
    const auth = useAuthStore();
    [__temp, __restore] = withAsyncContext(() => auth.ensureLoaded()), await __temp, __restore();
    const siteUrl = useRuntimeConfig().public.siteUrl;
    const features = [
      { key: "guides", icon: "book", to: "/guides" },
      { key: "dashboard", icon: "shield", to: "/dashboard" },
      { key: "tasks", icon: "tasks", to: "/tasks" },
      { key: "privacy", icon: "lock", to: "/privacy-settings" },
      { key: "ask", icon: "sparkle", to: "/ask" },
      { key: "government", icon: "file", to: "/government" },
      { key: "appointments", icon: "calendar", to: "/appointments" },
      { key: "italian", icon: "globe", to: "/learn-italian" },
      { key: "jobs", icon: "euro", to: "/jobs" },
      { key: "patente", icon: "car", to: "/patente" },
      { key: "study", icon: "book", to: "/study" },
      { key: "housing", icon: "home", to: "/housing" },
      { key: "explainer", icon: "file", to: "/documents/explain" },
      { key: "cities", icon: "map", to: "/cities" },
      { key: "articles", icon: "list", to: "/articles" },
      { key: "services", icon: "user", to: "/services" }
    ];
    const localePath = useLocalePath();
    useSeo(() => ({
      title: t("landing.seo.title"),
      description: t("landing.seo.description"),
      jsonLdData: [
        { "@context": "https://schema.org", "@type": "Organization", name: "EXPA", url: siteUrl, logo: `${siteUrl}/og-image.png` },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "EXPA",
          url: siteUrl,
          description: t("landing.seo.description"),
          inLanguage: ["ar", "en", "it"],
          potentialAction: { "@type": "SearchAction", target: `${siteUrl}${localePath("/search")}?q={search_term_string}`, "query-input": "required name=search_term_string" }
        }
      ]
    }));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBadge = _sfc_main$1;
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiCard = _sfc_main$2;
      const _component_UiScoreRing = _sfc_main$4;
      const _component_UiProgressBar = _sfc_main$6;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}><section class="border-b border-line bg-gradient-to-b from-primary-soft to-canvas"><div class="container-page grid gap-8 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:py-24"><div class="space-y-6">`);
      _push(ssrRenderComponent(_component_UiBadge, { tone: "accent" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("landing.eyebrow"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("landing.eyebrow")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<h1 class="text-3xl font-bold sm:text-4xl lg:text-5xl">${ssrInterpolate(unref(t)("landing.hero.title"))}</h1><p class="max-w-prose text-lg text-ink-soft">${ssrInterpolate(unref(t)("landing.hero.subtitle"))}</p><div class="flex flex-col gap-3 sm:flex-row">`);
      if (!unref(auth).isAuthenticated) {
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/register",
          size: "lg",
          variant: "accent"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("landing.cta.register"))}`);
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "arrow-end",
                size: 20
              }, null, _parent2, _scopeId));
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("landing.cta.register")), 1),
                createVNode(_component_UiIcon, {
                  name: "arrow-end",
                  size: 20
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/dashboard",
          size: "lg",
          variant: "accent"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("landing.cta.dashboard"))}`);
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "arrow-end",
                size: 20
              }, null, _parent2, _scopeId));
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("landing.cta.dashboard")), 1),
                createVNode(_component_UiIcon, {
                  name: "arrow-end",
                  size: 20
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(ssrRenderComponent(_component_UiButton, {
        to: "/guides",
        size: "lg",
        variant: "secondary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("landing.cta.explore"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("landing.cta.explore")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><p class="text-sm text-muted">${ssrInterpolate(unref(t)("landing.hero.note"))}</p></div>`);
      _push(ssrRenderComponent(_component_UiCard, {
        elevated: "",
        class: "hidden space-y-4 lg:block",
        "aria-hidden": "true"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center gap-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiScoreRing, {
              value: 64,
              label: unref(t)("score.label"),
              size: 128
            }, null, _parent2, _scopeId));
            _push2(`<div class="min-w-0 flex-1 space-y-3"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiProgressBar, {
              value: 80,
              label: unref(t)("landing.preview.documents"),
              "show-value": ""
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UiProgressBar, {
              value: 50,
              label: unref(t)("landing.preview.healthcare"),
              "show-value": ""
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UiProgressBar, {
              value: 40,
              label: unref(t)("landing.preview.banking"),
              "show-value": ""
            }, null, _parent2, _scopeId));
            _push2(`</div></div><p class="text-xs text-muted"${_scopeId}>${ssrInterpolate(unref(t)("landing.preview.caption"))}</p>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center gap-4" }, [
                createVNode(_component_UiScoreRing, {
                  value: 64,
                  label: unref(t)("score.label"),
                  size: 128
                }, null, 8, ["label"]),
                createVNode("div", { class: "min-w-0 flex-1 space-y-3" }, [
                  createVNode(_component_UiProgressBar, {
                    value: 80,
                    label: unref(t)("landing.preview.documents"),
                    "show-value": ""
                  }, null, 8, ["label"]),
                  createVNode(_component_UiProgressBar, {
                    value: 50,
                    label: unref(t)("landing.preview.healthcare"),
                    "show-value": ""
                  }, null, 8, ["label"]),
                  createVNode(_component_UiProgressBar, {
                    value: 40,
                    label: unref(t)("landing.preview.banking"),
                    "show-value": ""
                  }, null, 8, ["label"])
                ])
              ]),
              createVNode("p", { class: "text-xs text-muted" }, toDisplayString(unref(t)("landing.preview.caption")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></section><section class="container-page py-12 sm:py-16"${ssrRenderAttr("aria-labelledby", "features-h")}><h2 id="features-h" class="mb-2 text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("landing.features.title"))}</h2><p class="mb-8 max-w-prose text-ink-soft">${ssrInterpolate(unref(t)("landing.features.subtitle"))}</p><ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
      ssrRenderList(features, (f) => {
        _push(`<li>`);
        _push(ssrRenderComponent(_component_UiCard, { class: "relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center justify-between"${_scopeId}><span class="grid size-11 place-items-center rounded-md bg-primary-soft text-primary-strong"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: f.icon,
                size: 24
              }, null, _parent2, _scopeId));
              _push2(`</span>`);
              _push2(ssrRenderComponent(_component_UiBadge, { tone: "success" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("landing.available"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("landing.available")), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</div><h3 class="text-lg font-bold"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: unref(localePath)(f.to),
                class: "after:absolute after:inset-0 after:content-['']"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)(`landing.features.${f.key}.title`))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)(`landing.features.${f.key}.title`)), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</h3><p class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)(`landing.features.${f.key}.body`))}</p>`);
            } else {
              return [
                createVNode("div", { class: "flex items-center justify-between" }, [
                  createVNode("span", { class: "grid size-11 place-items-center rounded-md bg-primary-soft text-primary-strong" }, [
                    createVNode(_component_UiIcon, {
                      name: f.icon,
                      size: 24
                    }, null, 8, ["name"])
                  ]),
                  createVNode(_component_UiBadge, { tone: "success" }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("landing.available")), 1)
                    ]),
                    _: 1
                  })
                ]),
                createVNode("h3", { class: "text-lg font-bold" }, [
                  createVNode(_component_NuxtLink, {
                    to: unref(localePath)(f.to),
                    class: "after:absolute after:inset-0 after:content-['']"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)(`landing.features.${f.key}.title`)), 1)
                    ]),
                    _: 2
                  }, 1032, ["to"])
                ]),
                createVNode("p", { class: "text-ink-soft" }, toDisplayString(unref(t)(`landing.features.${f.key}.body`)), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul></section><section class="container-page pb-16">`);
      _push(ssrRenderComponent(_component_UiCard, {
        tone: "soft",
        class: "flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div${_scopeId}><h2 class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("landing.trust.title"))}</h2><p class="mt-1 max-w-prose text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("landing.trust.body"))}</p></div>`);
            if (!unref(auth).isAuthenticated) {
              _push2(ssrRenderComponent(_component_UiButton, { to: "/register" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("landing.cta.register"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("landing.cta.register")), 1)
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
                createVNode("h2", { class: "text-xl font-bold" }, toDisplayString(unref(t)("landing.trust.title")), 1),
                createVNode("p", { class: "mt-1 max-w-prose text-ink-soft" }, toDisplayString(unref(t)("landing.trust.body")), 1)
              ]),
              !unref(auth).isAuthenticated ? (openBlock(), createBlock(_component_UiButton, {
                key: 0,
                to: "/register"
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(t)("landing.cta.register")), 1)
                ]),
                _: 1
              })) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BD1Fr-ab.mjs.map
