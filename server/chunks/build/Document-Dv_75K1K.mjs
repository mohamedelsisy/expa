import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, j as isApiError, i as _sfc_main$2$1, _ as _sfc_main$3$1, k as formatDate } from './server.mjs';
import { _ as _sfc_main$3 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$4 } from './Inline-DiRQe8hf.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, resolveDynamicComponent, openBlock, createBlock, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderVNode, ssrRenderAttr } from 'vue/server-renderer';
import { n as normalizeLegal } from './legal-vAxOkaZS.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Document",
  __ssrInlineRender: true,
  props: {
    slug: {}
  },
  async setup(__props) {
    let __temp, __restore;
    const props = __props;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(
      () => `legal-${props.slug}`,
      async () => {
        try {
          return normalizeLegal((await request(`legal/${props.slug}`, { handle401: false })).data);
        } catch (e) {
          if (isApiError(e) && (e.status === 404 || e.status === 410)) return null;
          throw e;
        }
      },
      { watch: [locale] }
    )), __temp = await __temp, __restore(), __temp);
    const doc = computed(() => data.value);
    const notPublished = computed(() => status.value === "success" && !doc.value);
    useSeo(() => {
      var _a, _b;
      return {
        title: (_b = (_a = doc.value) == null ? void 0 : _a.title) != null ? _b : t(`legal.${props.slug}.title`),
        description: t(`legal.${props.slug}.description`),
        noindex: !doc.value
      };
    });
    const crumbs = computed(() => {
      var _a, _b;
      return [{ label: t("nav.home"), to: "/" }, { label: (_b = (_a = doc.value) == null ? void 0 : _a.title) != null ? _b : t(`legal.${props.slug}.title`) }];
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiAlert = _sfc_main$3;
      const _component_UiButton = _sfc_main$3$1;
      const _component_LegalInline = _sfc_main$4;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      if (!unref(doc)) {
        _push(`<h1 class="text-3xl font-bold">${ssrInterpolate(unref(t)(`legal.${__props.slug}.title`))}</h1>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(status) === "pending" && !unref(doc)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 6
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (unref(notPublished)) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "info",
          title: unref(t)("legal.notPublishedTitle"),
          "data-testid": "legal-unpublished"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("legal.notPublished"))}</p><p class="mt-2"${_scopeId}>${ssrInterpolate(unref(t)("legal.contactHint"))}</p>`);
              _push2(ssrRenderComponent(_component_UiButton, {
                to: "/",
                variant: "secondary",
                class: "mt-3"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("errors.backHome"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("errors.backHome")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode("p", null, toDisplayString(unref(t)("legal.notPublished")), 1),
                createVNode("p", { class: "mt-2" }, toDisplayString(unref(t)("legal.contactHint")), 1),
                createVNode(_component_UiButton, {
                  to: "/",
                  variant: "secondary",
                  class: "mt-3"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("errors.backHome")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (unref(doc)) {
        _push(`<article data-testid="legal-document"><header class="mb-6"><h1 class="text-3xl font-bold">${ssrInterpolate(unref(doc).title)}</h1><p class="mt-2 text-sm text-muted">`);
        if (unref(doc).version) {
          _push(`<span>${ssrInterpolate(unref(t)("legal.version", { version: unref(doc).version }))}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(doc).version && unref(doc).published_at) {
          _push(`<span> \xB7 </span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(doc).published_at) {
          _push(`<span>${ssrInterpolate(unref(t)("legal.publishedOn", { date: unref(formatDate)(unref(doc).published_at, unref(locale)) }))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</p></header><div class="space-y-4 leading-relaxed"><!--[-->`);
        ssrRenderList(unref(doc).blocks, (b, i) => {
          _push(`<!--[-->`);
          if (b.type === "h") {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(`h${b.level}`), { class: "pt-2 text-xl font-bold" }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_LegalInline, {
                    text: b.text
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_LegalInline, {
                      text: b.text
                    }, null, 8, ["text"])
                  ];
                }
              }),
              _: 2
            }), _parent);
          } else if (b.type === "p") {
            _push(`<p>`);
            _push(ssrRenderComponent(_component_LegalInline, {
              text: b.text
            }, null, _parent));
            _push(`</p>`);
          } else {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(b.type), {
              class: ["space-y-1 ps-6", b.type === "ul" ? "list-disc" : "list-decimal"]
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<!--[-->`);
                  ssrRenderList(b.items, (it, j) => {
                    _push2(`<li${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_LegalInline, { text: it }, null, _parent2, _scopeId));
                    _push2(`</li>`);
                  });
                  _push2(`<!--]-->`);
                } else {
                  return [
                    (openBlock(true), createBlock(Fragment, null, renderList(b.items, (it, j) => {
                      return openBlock(), createBlock("li", { key: j }, [
                        createVNode(_component_LegalInline, { text: it }, null, 8, ["text"])
                      ]);
                    }), 128))
                  ];
                }
              }),
              _: 2
            }), _parent);
          }
          _push(`<!--]-->`);
        });
        _push(`<!--]--></div>`);
        if ((_a = unref(doc).source) == null ? void 0 : _a.url) {
          _push(`<p class="mt-8 text-sm text-muted">${ssrInterpolate(unref(t)("legal.source"))}: <a${ssrRenderAttr("href", unref(doc).source.url)} rel="noopener noreferrer" class="text-primary-strong underline underline-offset-4">${ssrInterpolate((_b = unref(doc).source.name) != null ? _b : unref(doc).source.url)}</a></p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</article>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/legal/Document.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Document-Dv_75K1K.mjs.map
