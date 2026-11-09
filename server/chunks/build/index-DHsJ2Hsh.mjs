import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { u as useI18n, f as useRoute, a as useAuthStore, c as useLocalePath, g as useApi, o as createError, _ as _sfc_main$3, d as _sfc_main$5, i as _sfc_main$2$1, j as isApiError, e as __nuxt_component_0, k as formatDate, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$4 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$6 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$7 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$8 } from './Checkbox-PDAPbGXG.mjs';
import { _ as _sfc_main$9 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$a } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$b } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$c } from './Labels-BzdhD_w4.mjs';
import { _ as _sfc_main$d } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$e } from './Pagination-DA28GIFv.mjs';
import { defineComponent, withAsyncContext, computed, ref, watch, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, isRef, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { u as useCommunityMeta } from './useCommunity-pk23xdcX.mjs';
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
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const auth = useAuthStore();
    const localePath = useLocalePath();
    const { request } = useApi();
    const community = useCommunityMeta();
    const meta = ([__temp, __restore] = withAsyncContext(() => community.load()), __temp = await __temp, __restore(), __temp);
    if (!meta) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    useSeo(() => ({ title: t("community.seo.title"), description: t("community.seo.description") }));
    const get = (k) => typeof route.query[k] === "string" ? route.query[k] : "";
    const q = computed(() => get("q"));
    const topic = computed(() => get("topic"));
    const city = computed(() => get("city"));
    const sort = computed(() => get("sort"));
    const answered = computed(() => get("answered"));
    const mine = computed(() => get("mine"));
    const page = computed(() => Math.max(1, Number(route.query.page) || 1));
    const search = ref(q.value);
    watch(q, (v) => {
      search.value = v;
    });
    const { data: cities } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("community-cities", async () => (await request("cities")).data.map((c) => ({ value: c.slug, label: c.name })), { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const topicOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = community.meta.value) == null ? void 0 : _a.topics) != null ? _b : []).map((x) => ({ value: x.value, label: x.label }));
    });
    const sortOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = community.meta.value) == null ? void 0 : _a.sorts) != null ? _b : []).map((v) => ({ value: v, label: t(`community.sort.${v}`) }));
    });
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("community-questions", () => request("community/questions", { query: { q: q.value, topic: topic.value, city: city.value, sort: sort.value, answered: answered.value, mine: mine.value, page: page.value, per_page: 15 } }), { watch: [q, topic, city, sort, answered, mine, page, locale] })), __temp = await __temp, __restore(), __temp);
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const pm = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    const hasFilters = computed(() => !!(q.value || topic.value || city.value || sort.value || answered.value || mine.value));
    function setQuery(patch) {
      const merged = { q: q.value, topic: topic.value, city: city.value, sort: sort.value, answered: answered.value, mine: mine.value, ...patch };
      const next = {};
      for (const [k, v] of Object.entries(merged)) if (v !== "" && v !== void 0 && v !== null) next[k] = String(v);
      if (!("page" in patch)) delete next.page;
      return navigateTo({ path: route.path, query: next });
    }
    const clear = () => {
      search.value = "";
      return navigateTo({ path: route.path });
    };
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/" }, { label: t("community.title") }]);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiAlert = _sfc_main$2;
      const _component_UiFormField = _sfc_main$4;
      const _component_UiTextInput = _sfc_main$6;
      const _component_UiSelect = _sfc_main$7;
      const _component_UiCheckbox = _sfc_main$8;
      const _component_UiCard = _sfc_main$9;
      const _component_UiSkeleton = _sfc_main$a;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$b;
      const _component_CommunityLabels = _sfc_main$c;
      const _component_UiBadge = _sfc_main$d;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiPagination = _sfc_main$e;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-4xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-6 flex flex-wrap items-end justify-between gap-3"><div class="max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("community.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("community.subtitle"))}</p></div>`);
      if (unref(auth).isAuthenticated) {
        _push(`<div class="flex flex-wrap gap-2">`);
        _push(ssrRenderComponent(_component_UiButton, {
          variant: "ghost",
          to: "/community/blocked"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("community.blocks.title"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("community.blocks.title")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, { to: "/community/ask" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "plus",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("community.ask"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "plus",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("community.ask")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(ssrRenderComponent(_component_UiButton, {
          to: `/login?redirect=${encodeURIComponent(unref(localePath)("/community"))}`,
          variant: "secondary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("community.loginToAsk"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("community.loginToAsk")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</header>`);
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "warning",
        class: "mb-6",
        "data-testid": "community-notice"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b2;
          if (_push2) {
            _push2(`${ssrInterpolate((_a2 = unref(community).meta.value) == null ? void 0 : _a2.notice)}`);
          } else {
            return [
              createTextVNode(toDisplayString((_b2 = unref(community).meta.value) == null ? void 0 : _b2.notice), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<form role="search" class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3">`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("guides.search"),
        class: "sm:col-span-2 lg:col-span-3"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(search),
              "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
              type: "search",
              inputmode: "search",
              maxlength: 100,
              placeholder: unref(t)("community.searchPlaceholder")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(search),
                "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
                type: "search",
                inputmode: "search",
                maxlength: 100,
                placeholder: unref(t)("community.searchPlaceholder")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("community.topic")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(topic),
              options: unref(topicOptions),
              placeholder: unref(t)("community.allTopics"),
              "onUpdate:modelValue": ($event) => setQuery({ topic: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(topic),
                options: unref(topicOptions),
                placeholder: unref(t)("community.allTopics"),
                "onUpdate:modelValue": ($event) => setQuery({ topic: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("guides.city")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b2;
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(city),
              options: (_a2 = unref(cities)) != null ? _a2 : [],
              placeholder: unref(t)("guides.allCities"),
              "onUpdate:modelValue": ($event) => setQuery({ city: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(city),
                options: (_b2 = unref(cities)) != null ? _b2 : [],
                placeholder: unref(t)("guides.allCities"),
                "onUpdate:modelValue": ($event) => setQuery({ city: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("articles.sortBy")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(sort),
              options: unref(sortOptions),
              placeholder: unref(t)("community.sort.default"),
              "onUpdate:modelValue": ($event) => setQuery({ sort: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(sort),
                options: unref(sortOptions),
                placeholder: unref(t)("community.sort.default"),
                "onUpdate:modelValue": ($event) => setQuery({ sort: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex flex-col justify-end">`);
      _push(ssrRenderComponent(_component_UiCheckbox, {
        "model-value": unref(answered) === "1",
        label: unref(t)("community.onlyAnswered"),
        "onUpdate:modelValue": ($event) => setQuery({ answered: $event ? "1" : "" })
      }, null, _parent));
      if (unref(auth).isAuthenticated) {
        _push(ssrRenderComponent(_component_UiCheckbox, {
          "model-value": unref(mine) === "1",
          label: unref(t)("community.onlyMine"),
          "onUpdate:modelValue": ($event) => setQuery({ mine: $event ? "1" : "" })
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex items-end gap-2">`);
      _push(ssrRenderComponent(_component_UiButton, { type: "submit" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "search",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("guides.searchButton"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "search",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("guides.searchButton")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(hasFilters)) {
        _push(ssrRenderComponent(_component_UiButton, {
          variant: "ghost",
          onClick: clear
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("guides.clear"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("guides.clear")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div></form>`);
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<ul class="space-y-3" aria-busy="true"><!--[-->`);
        ssrRenderList(4, (n) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiSkeleton, { lines: 3 }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiSkeleton, { lines: 3 })
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!unref(items).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(hasFilters) ? unref(t)("guides.noResultsTitle") : unref(t)("community.emptyTitle"),
          description: unref(hasFilters) ? unref(t)("guides.noResults") : unref(t)("community.empty"),
          icon: "help"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(hasFilters)) {
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "secondary",
                  onClick: clear
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("guides.clear"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("guides.clear")), 1)
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
                unref(hasFilters) ? (openBlock(), createBlock(_component_UiButton, {
                  key: 0,
                  variant: "secondary",
                  onClick: clear
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("guides.clear")), 1)
                  ]),
                  _: 1
                })) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!--[--><ul class="space-y-3"><!--[-->`);
        ssrRenderList(unref(items), (x) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, {
            as: "article",
            class: "relative space-y-2 hover:shadow-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex flex-wrap items-center gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_CommunityLabels, {
                  label: x.label,
                  status: x.status,
                  mine: x.mine
                }, null, _parent2, _scopeId));
                if (x.topic_label) {
                  _push2(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(x.topic_label)}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(x.topic_label), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                if (x.answered) {
                  _push2(ssrRenderComponent(_component_UiBadge, { tone: "success" }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(ssrRenderComponent(_component_UiIcon, {
                          name: "check",
                          size: 14
                        }, null, _parent3, _scopeId2));
                        _push3(`${ssrInterpolate(unref(t)("community.answered"))}`);
                      } else {
                        return [
                          createVNode(_component_UiIcon, {
                            name: "check",
                            size: 14
                          }),
                          createTextVNode(toDisplayString(unref(t)("community.answered")), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div><h2 class="text-lg font-bold"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: unref(localePath)(`/community/${x.id}`),
                  class: "after:absolute after:inset-0 after:content-['']",
                  dir: "auto"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(x.title)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(x.title), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</h2>`);
                if (x.excerpt) {
                  _push2(`<p class="line-clamp-2 text-ink-soft" dir="auto"${_scopeId}>${ssrInterpolate(x.excerpt)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<p class="flex flex-wrap gap-x-3 text-sm text-muted"${_scopeId}><span${_scopeId}>${ssrInterpolate(unref(t)("community.votes", { count: x.votes }))}</span><span${_scopeId}>${ssrInterpolate(unref(t)("community.answersCount", { count: x.answers_count }))}</span>`);
                if (x.city) {
                  _push2(`<span${_scopeId}>${ssrInterpolate(x.city.name)}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                if (x.created_at) {
                  _push2(`<time${ssrRenderAttr("datetime", x.created_at)}${_scopeId}>${ssrInterpolate(unref(formatDate)(x.created_at, unref(locale)))}</time>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</p>`);
              } else {
                return [
                  createVNode("div", { class: "flex flex-wrap items-center gap-2" }, [
                    createVNode(_component_CommunityLabels, {
                      label: x.label,
                      status: x.status,
                      mine: x.mine
                    }, null, 8, ["label", "status", "mine"]),
                    x.topic_label ? (openBlock(), createBlock(_component_UiBadge, {
                      key: 0,
                      tone: "primary"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(x.topic_label), 1)
                      ]),
                      _: 2
                    }, 1024)) : createCommentVNode("", true),
                    x.answered ? (openBlock(), createBlock(_component_UiBadge, {
                      key: 1,
                      tone: "success"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiIcon, {
                          name: "check",
                          size: 14
                        }),
                        createTextVNode(toDisplayString(unref(t)("community.answered")), 1)
                      ]),
                      _: 1
                    })) : createCommentVNode("", true)
                  ]),
                  createVNode("h2", { class: "text-lg font-bold" }, [
                    createVNode(_component_NuxtLink, {
                      to: unref(localePath)(`/community/${x.id}`),
                      class: "after:absolute after:inset-0 after:content-['']",
                      dir: "auto"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(x.title), 1)
                      ]),
                      _: 2
                    }, 1032, ["to"])
                  ]),
                  x.excerpt ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "line-clamp-2 text-ink-soft",
                    dir: "auto"
                  }, toDisplayString(x.excerpt), 1)) : createCommentVNode("", true),
                  createVNode("p", { class: "flex flex-wrap gap-x-3 text-sm text-muted" }, [
                    createVNode("span", null, toDisplayString(unref(t)("community.votes", { count: x.votes })), 1),
                    createVNode("span", null, toDisplayString(unref(t)("community.answersCount", { count: x.answers_count })), 1),
                    x.city ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(x.city.name), 1)) : createCommentVNode("", true),
                    x.created_at ? (openBlock(), createBlock("time", {
                      key: 1,
                      datetime: x.created_at
                    }, toDisplayString(unref(formatDate)(x.created_at, unref(locale))), 9, ["datetime"])) : createCommentVNode("", true)
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul><div class="mt-8">`);
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_b = (_a = unref(pm)) == null ? void 0 : _a.page) != null ? _b : 1,
          "last-page": (_d = (_c = unref(pm)) == null ? void 0 : _c.last_page) != null ? _d : 1,
          onChange: ($event) => setQuery({ page: $event })
        }, null, _parent));
        _push(`</div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/community/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DHsJ2Hsh.mjs.map
