import { _ as _sfc_main$1 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$2 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$3 } from './SourceBadge-4_eAChkr.mjs';
import { u as useI18n, c as useLocalePath, e as __nuxt_component_0, d as _sfc_main$5 } from './server.mjs';
import { _ as _sfc_main$4 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$6 } from './BookingBlock-DOKLO1aP.mjs';
import { _ as _sfc_main$7 } from './FallbackNotice-CwHuyozE.mjs';
import { _ as _sfc_main$8 } from './GuideSource-B-ek0Kys.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, toDisplayString, unref, createVNode, openBlock, createBlock, Fragment, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
import { a as safeHttpsUrl } from './safe-B2eSdAXJ.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "OfficeCard",
  __ssrInlineRender: true,
  props: {
    office: {},
    link: { type: Boolean }
  },
  setup(__props) {
    const { t } = useI18n();
    const localePath = useLocalePath();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiCard = _sfc_main$1;
      const _component_UiBadge = _sfc_main$2;
      const _component_UiSourceBadge = _sfc_main$3;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiAutoItalian = _sfc_main$4;
      const _component_UiIcon = _sfc_main$5;
      const _component_GovBookingBlock = _sfc_main$6;
      const _component_GuideFallbackNotice = _sfc_main$7;
      const _component_GuideSource = _sfc_main$8;
      _push(ssrRenderComponent(_component_UiCard, mergeProps({
        as: "article",
        class: "space-y-3"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-wrap items-center gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(__props.office.office_type_label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.office.office_type_label), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UiSourceBadge, {
              type: __props.office.source.type
            }, null, _parent2, _scopeId));
            _push2(`</div><h3 class="text-lg font-bold"${_scopeId}>`);
            if (__props.link) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: unref(localePath)(`/government/offices/${__props.office.slug}`),
                class: "underline-offset-4 hover:underline"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiAutoItalian, {
                      text: __props.office.name
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiAutoItalian, {
                        text: __props.office.name
                      }, null, 8, ["text"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(ssrRenderComponent(_component_UiAutoItalian, {
                text: __props.office.name
              }, null, _parent2, _scopeId));
            }
            _push2(`</h3><ul class="space-y-1 text-ink-soft"${_scopeId}>`);
            if (__props.office.address) {
              _push2(`<li class="flex items-start gap-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "map",
                size: 16,
                class: "mt-1"
              }, null, _parent2, _scopeId));
              _push2(`<span dir="auto"${_scopeId}>${ssrInterpolate(__props.office.address)}`);
              if (__props.office.postal_code) {
                _push2(`<!--[--> \xB7 ${ssrInterpolate(__props.office.postal_code)}<!--]-->`);
              } else {
                _push2(`<!---->`);
              }
              if (__props.office.city) {
                _push2(`<!--[--> \xB7 ${ssrInterpolate(__props.office.city.name)}<!--]-->`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</span></li>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.office.phone) {
              _push2(`<li class="flex items-center gap-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "phone",
                size: 16
              }, null, _parent2, _scopeId));
              _push2(`<a${ssrRenderAttr("href", `tel:${__props.office.phone.replace(/[^+\d]/g, "")}`)} dir="ltr" class="underline underline-offset-4"${_scopeId}>${ssrInterpolate(__props.office.phone)}</a></li>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.office.email) {
              _push2(`<li class="flex items-center gap-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "mail",
                size: 16
              }, null, _parent2, _scopeId));
              _push2(`<a${ssrRenderAttr("href", `mailto:${__props.office.email}`)} dir="ltr" class="break-all underline underline-offset-4"${_scopeId}>${ssrInterpolate(__props.office.email)}</a></li>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.office.opening_hours) {
              _push2(`<li class="flex items-start gap-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "clock",
                size: 16,
                class: "mt-1"
              }, null, _parent2, _scopeId));
              _push2(`<span class="prose-plain"${_scopeId}>${ssrInterpolate(__props.office.opening_hours)}</span></li>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</ul>`);
            if (unref(safeHttpsUrl)(__props.office.official_url)) {
              _push2(`<a${ssrRenderAttr("href", unref(safeHttpsUrl)(__props.office.official_url))} target="_blank" rel="noopener noreferrer" class="inline-flex min-h-touch items-center gap-2 font-medium text-primary-strong underline underline-offset-4"${_scopeId}>${ssrInterpolate(unref(t)("gov.officialSite"))}`);
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "external",
                size: 16
              }, null, _parent2, _scopeId));
              _push2(`<span class="sr-only"${_scopeId}>${ssrInterpolate(unref(t)("a11y.opensNewTab"))}</span></a>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(_component_GovBookingBlock, {
              booking: __props.office.booking,
              subject: __props.office.slug
            }, null, _parent2, _scopeId));
            if (__props.office.notes) {
              _push2(`<p class="prose-plain text-sm text-ink-soft"${_scopeId}>${ssrInterpolate(__props.office.notes)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.office.fallback) {
              _push2(ssrRenderComponent(_component_GuideFallbackNotice, {
                locale: __props.office.locale
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(_component_GuideSource, {
              source: __props.office.source
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode("div", { class: "flex flex-wrap items-center gap-2" }, [
                createVNode(_component_UiBadge, { tone: "primary" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(__props.office.office_type_label), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_UiSourceBadge, {
                  type: __props.office.source.type
                }, null, 8, ["type"])
              ]),
              createVNode("h3", { class: "text-lg font-bold" }, [
                __props.link ? (openBlock(), createBlock(_component_NuxtLink, {
                  key: 0,
                  to: unref(localePath)(`/government/offices/${__props.office.slug}`),
                  class: "underline-offset-4 hover:underline"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_UiAutoItalian, {
                      text: __props.office.name
                    }, null, 8, ["text"])
                  ]),
                  _: 1
                }, 8, ["to"])) : (openBlock(), createBlock(_component_UiAutoItalian, {
                  key: 1,
                  text: __props.office.name
                }, null, 8, ["text"]))
              ]),
              createVNode("ul", { class: "space-y-1 text-ink-soft" }, [
                __props.office.address ? (openBlock(), createBlock("li", {
                  key: 0,
                  class: "flex items-start gap-2"
                }, [
                  createVNode(_component_UiIcon, {
                    name: "map",
                    size: 16,
                    class: "mt-1"
                  }),
                  createVNode("span", { dir: "auto" }, [
                    createTextVNode(toDisplayString(__props.office.address), 1),
                    __props.office.postal_code ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                      createTextVNode(" \xB7 " + toDisplayString(__props.office.postal_code), 1)
                    ], 64)) : createCommentVNode("", true),
                    __props.office.city ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                      createTextVNode(" \xB7 " + toDisplayString(__props.office.city.name), 1)
                    ], 64)) : createCommentVNode("", true)
                  ])
                ])) : createCommentVNode("", true),
                __props.office.phone ? (openBlock(), createBlock("li", {
                  key: 1,
                  class: "flex items-center gap-2"
                }, [
                  createVNode(_component_UiIcon, {
                    name: "phone",
                    size: 16
                  }),
                  createVNode("a", {
                    href: `tel:${__props.office.phone.replace(/[^+\d]/g, "")}`,
                    dir: "ltr",
                    class: "underline underline-offset-4"
                  }, toDisplayString(__props.office.phone), 9, ["href"])
                ])) : createCommentVNode("", true),
                __props.office.email ? (openBlock(), createBlock("li", {
                  key: 2,
                  class: "flex items-center gap-2"
                }, [
                  createVNode(_component_UiIcon, {
                    name: "mail",
                    size: 16
                  }),
                  createVNode("a", {
                    href: `mailto:${__props.office.email}`,
                    dir: "ltr",
                    class: "break-all underline underline-offset-4"
                  }, toDisplayString(__props.office.email), 9, ["href"])
                ])) : createCommentVNode("", true),
                __props.office.opening_hours ? (openBlock(), createBlock("li", {
                  key: 3,
                  class: "flex items-start gap-2"
                }, [
                  createVNode(_component_UiIcon, {
                    name: "clock",
                    size: 16,
                    class: "mt-1"
                  }),
                  createVNode("span", { class: "prose-plain" }, toDisplayString(__props.office.opening_hours), 1)
                ])) : createCommentVNode("", true)
              ]),
              unref(safeHttpsUrl)(__props.office.official_url) ? (openBlock(), createBlock("a", {
                key: 0,
                href: unref(safeHttpsUrl)(__props.office.official_url),
                target: "_blank",
                rel: "noopener noreferrer",
                class: "inline-flex min-h-touch items-center gap-2 font-medium text-primary-strong underline underline-offset-4"
              }, [
                createTextVNode(toDisplayString(unref(t)("gov.officialSite")), 1),
                createVNode(_component_UiIcon, {
                  name: "external",
                  size: 16
                }),
                createVNode("span", { class: "sr-only" }, toDisplayString(unref(t)("a11y.opensNewTab")), 1)
              ], 8, ["href"])) : createCommentVNode("", true),
              createVNode(_component_GovBookingBlock, {
                booking: __props.office.booking,
                subject: __props.office.slug
              }, null, 8, ["booking", "subject"]),
              __props.office.notes ? (openBlock(), createBlock("p", {
                key: 1,
                class: "prose-plain text-sm text-ink-soft"
              }, toDisplayString(__props.office.notes), 1)) : createCommentVNode("", true),
              __props.office.fallback ? (openBlock(), createBlock(_component_GuideFallbackNotice, {
                key: 2,
                locale: __props.office.locale
              }, null, 8, ["locale"])) : createCommentVNode("", true),
              createVNode(_component_GuideSource, {
                source: __props.office.source
              }, null, 8, ["source"])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/gov/OfficeCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=OfficeCard-D7gQkLPp.mjs.map
