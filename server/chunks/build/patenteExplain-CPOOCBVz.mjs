import { u as useI18n, c as useLocalePath, d as _sfc_main$5, _ as _sfc_main$3, e as __nuxt_component_0 } from './server.mjs';
import { defineComponent, computed, mergeProps, withCtx, createVNode, createTextVNode, toDisplayString, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { a as mapApiAction, m as mapApiRoute } from './routes-BNQ9Jhms.mjs';
import { a as safeHttpsUrl } from './safe-B2eSdAXJ.mjs';
import { _ as _sfc_main$1 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$4 } from './SourceBadge-4_eAChkr.mjs';
import { _ as _sfc_main$6 } from './FreshnessIndicator-B5-_pVo1.mjs';

const CITE = /\[(\d{1,2})\]/g;
function tokenizeLine(line, validNumbers) {
  var _a;
  const out = [];
  let last = 0;
  for (const m of line.matchAll(CITE)) {
    const n = Number(m[1]);
    if (!validNumbers.has(n)) continue;
    const i = (_a = m.index) != null ? _a : 0;
    if (i > last) out.push({ kind: "text", text: line.slice(last, i) });
    out.push({ kind: "cite", n });
    last = i + m[0].length;
  }
  if (last < line.length) out.push({ kind: "text", text: line.slice(last) });
  return out;
}
function parseMessage(content, sourceNumbers) {
  const valid = new Set(sourceNumbers);
  return (content != null ? content : "").replace(/\r\n?/g, "\n").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p) => p.split("\n").map((l) => tokenizeLine(l, valid)));
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Message",
  __ssrInlineRender: true,
  props: {
    message: {},
    msgKey: {},
    fallbackQuery: {}
  },
  setup(__props) {
    const props = __props;
    const { t } = useI18n();
    const localePath = useLocalePath();
    const LABELS = {
      official: { tone: "success", icon: "shield" },
      general_guidance: { tone: "info", icon: "info" },
      ai_explanation: { tone: "accent", icon: "sparkle" },
      third_party: { tone: "warning", icon: "alert" }
    };
    const label = computed(() => props.message.label && LABELS[props.message.label] ? props.message.label : null);
    const labelText = computed(() => props.message.label_text || (label.value ? t(`ask.labels.${label.value}`) : ""));
    const sources = computed(() => {
      var _a;
      return (_a = props.message.sources) != null ? _a : [];
    });
    const paragraphs = computed(() => parseMessage(props.message.content, sources.value.map((s) => s.n)));
    const disclaimerIdx = computed(() => {
      var _a, _b;
      const last = paragraphs.value.length - 1;
      const first = (_b = (_a = paragraphs.value[last]) == null ? void 0 : _a[0]) == null ? void 0 : _b[0];
      return first && first.kind === "text" && first.text.trimStart().startsWith("\u26A0") ? last : -1;
    });
    const actions = computed(() => {
      var _a;
      return ((_a = props.message.actions) != null ? _a : []).map((a) => ({ ...a, path: mapApiAction(a) })).filter((a) => !!a.path);
    });
    const searchPath = computed(() => {
      var _a;
      const found = actions.value.find((a) => a.path.startsWith("/search"));
      if (found) return found.path;
      const q = ((_a = props.fallbackQuery) != null ? _a : "").trim().slice(0, 100);
      return q.length >= 2 ? `/search?q=${encodeURIComponent(q)}` : "/search";
    });
    const otherActions = computed(() => props.message.degraded ? actions.value.filter((a) => !a.path.startsWith("/search")) : actions.value);
    const srcId = (n) => `src-${props.msgKey}-${n}`;
    const sourceRoute = (s) => {
      var _a;
      return mapApiRoute((_a = s.ref) == null ? void 0 : _a.route);
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<article${ssrRenderAttrs(mergeProps({
        class: "space-y-3",
        "data-label": (_a = label.value) != null ? _a : void 0,
        "data-degraded": __props.message.degraded ? "true" : void 0
      }, _attrs))}>`);
      if (label.value) {
        _push(ssrRenderComponent(_sfc_main$1, {
          tone: LABELS[label.value].tone,
          "data-testid": "ai-label"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_sfc_main$5, {
                name: LABELS[label.value].icon,
                size: 14
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(labelText.value)}`);
            } else {
              return [
                createVNode(_sfc_main$5, {
                  name: LABELS[label.value].icon,
                  size: 14
                }, null, 8, ["name"]),
                createTextVNode(toDisplayString(labelText.value), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (__props.message.degraded) {
        _push(ssrRenderComponent(_sfc_main$2, {
          tone: "warning",
          title: unref(t)("ask.degradedTitle"),
          "data-testid": "ai-degraded"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("ask.degradedBody"))}</p>`);
              _push2(ssrRenderComponent(_sfc_main$3, {
                to: searchPath.value,
                variant: "secondary",
                class: "mt-3",
                "data-testid": "ai-degraded-search"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_sfc_main$5, {
                      name: "search",
                      size: 18
                    }, null, _parent3, _scopeId2));
                    _push3(`${ssrInterpolate(unref(t)("ask.searchInstead"))}`);
                  } else {
                    return [
                      createVNode(_sfc_main$5, {
                        name: "search",
                        size: 18
                      }),
                      createTextVNode(toDisplayString(unref(t)("ask.searchInstead")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode("p", null, toDisplayString(unref(t)("ask.degradedBody")), 1),
                createVNode(_sfc_main$3, {
                  to: searchPath.value,
                  variant: "secondary",
                  class: "mt-3",
                  "data-testid": "ai-degraded-search"
                }, {
                  default: withCtx(() => [
                    createVNode(_sfc_main$5, {
                      name: "search",
                      size: 18
                    }),
                    createTextVNode(toDisplayString(unref(t)("ask.searchInstead")), 1)
                  ]),
                  _: 1
                }, 8, ["to"])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="space-y-3 text-ink" data-testid="ai-text"><!--[-->`);
      ssrRenderList(paragraphs.value, (p, pi) => {
        _push(`<!--[-->`);
        if (pi === disclaimerIdx.value) {
          _push(`<p dir="auto" class="rounded-md border border-warning bg-warning-soft p-3 text-sm text-ink" data-testid="ai-disclaimer"><!--[-->`);
          ssrRenderList(p, (line, li) => {
            _push(`<!--[-->`);
            if (li > 0) {
              _push(`<br>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<!--[-->`);
            ssrRenderList(line, (tok, ti) => {
              _push(`<!--[-->`);
              if (tok.kind === "text") {
                _push(`<span>${ssrInterpolate(tok.text)}</span>`);
              } else {
                _push(`<a${ssrRenderAttr("href", `#${srcId(tok.n)}`)} class="font-semibold text-primary-strong underline" data-cite>[${ssrInterpolate(tok.n)}]</a>`);
              }
              _push(`<!--]-->`);
            });
            _push(`<!--]--><!--]-->`);
          });
          _push(`<!--]--></p>`);
        } else {
          _push(`<p dir="auto" class="leading-relaxed"><!--[-->`);
          ssrRenderList(p, (line, li) => {
            _push(`<!--[-->`);
            if (li > 0) {
              _push(`<br>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<!--[-->`);
            ssrRenderList(line, (tok, ti) => {
              _push(`<!--[-->`);
              if (tok.kind === "text") {
                _push(`<span>${ssrInterpolate(tok.text)}</span>`);
              } else {
                _push(`<a${ssrRenderAttr("href", `#${srcId(tok.n)}`)} class="inline-flex min-h-6 items-center px-0.5 font-semibold text-primary-strong underline" data-cite${ssrRenderAttr("aria-label", unref(t)("ask.citation", { n: tok.n }))}>[${ssrInterpolate(tok.n)}]</a>`);
              }
              _push(`<!--]-->`);
            });
            _push(`<!--]--><!--]-->`);
          });
          _push(`<!--]--></p>`);
        }
        _push(`<!--]-->`);
      });
      _push(`<!--]--></div>`);
      if (__props.message.disclaimer) {
        _push(`<p dir="auto" class="rounded-md border border-warning bg-warning-soft p-3 text-sm text-ink" data-testid="ai-disclaimer-field">${ssrInterpolate(__props.message.disclaimer)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (sources.value.length) {
        _push(`<section${ssrRenderAttr("aria-label", unref(t)("ask.sources"))} class="space-y-2" data-testid="ai-sources"><h3 class="text-sm font-bold text-ink-soft">${ssrInterpolate(unref(t)("ask.sources"))}</h3><ol class="space-y-2"><!--[-->`);
        ssrRenderList(sources.value, (s) => {
          var _a2, _b, _c, _d, _e;
          _push(`<li${ssrRenderAttr("id", srcId(s.n))} tabindex="-1" class="flex gap-3 rounded-md border border-line bg-sunken p-3 text-sm outline-none focus-visible:ring-2" data-testid="ai-source"><span class="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft font-bold text-primary-strong tabular-nums" aria-hidden="true">${ssrInterpolate(s.n)}</span><div class="min-w-0 space-y-1.5"><p class="font-semibold text-ink">`);
          if (sourceRoute(s)) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: unref(localePath)(sourceRoute(s)),
              class: "underline underline-offset-4"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(s.title)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(s.title), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<span>${ssrInterpolate(s.title)}</span>`);
          }
          _push(`</p><p class="flex flex-wrap items-center gap-2">`);
          _push(ssrRenderComponent(_sfc_main$4, {
            type: (_b = (_a2 = s.source) == null ? void 0 : _a2.type) != null ? _b : null
          }, null, _parent));
          if ((_c = s.source) == null ? void 0 : _c.name) {
            _push(`<span class="text-ink-soft">${ssrInterpolate(s.source.name)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</p>`);
          if (unref(safeHttpsUrl)((_d = s.source) == null ? void 0 : _d.url)) {
            _push(`<a${ssrRenderAttr("href", unref(safeHttpsUrl)((_e = s.source) == null ? void 0 : _e.url))} target="_blank" rel="noopener noreferrer" class="inline-flex min-h-touch items-center gap-1.5 font-medium text-primary-strong underline underline-offset-4" data-testid="ai-source-link">${ssrInterpolate(unref(t)("source.open"))}`);
            _push(ssrRenderComponent(_sfc_main$5, {
              name: "external",
              size: 14
            }, null, _parent));
            _push(`<span class="sr-only">${ssrInterpolate(unref(t)("a11y.opensNewTab"))}</span></a>`);
          } else {
            _push(`<!---->`);
          }
          if (s.source) {
            _push(ssrRenderComponent(_sfc_main$6, {
              "last-verified-at": s.source.last_verified_at,
              freshness: s.source.freshness
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div></li>`);
        });
        _push(`<!--]--></ol></section>`);
      } else {
        _push(`<!---->`);
      }
      if (otherActions.value.length) {
        _push(`<nav${ssrRenderAttr("aria-label", unref(t)("ask.actions"))} class="flex flex-wrap gap-2"><!--[-->`);
        ssrRenderList(otherActions.value, (a) => {
          _push(ssrRenderComponent(_sfc_main$3, {
            key: `${a.type}-${a.target}`,
            to: a.path,
            variant: "secondary",
            "data-testid": "ai-action"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(a.label)}`);
                _push2(ssrRenderComponent(_sfc_main$5, {
                  name: "arrow-end",
                  size: 16
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createTextVNode(toDisplayString(a.label), 1),
                  createVNode(_sfc_main$5, {
                    name: "arrow-end",
                    size: 16
                  })
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></nav>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.message.label === "ai_explanation" || __props.message.label === "third_party") {
        _push(`<p class="text-xs text-muted">${ssrInterpolate(unref(t)("ask.verifyNote"))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</article>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ask/Message.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function explainBody(kind, slug, message) {
  if (!SLUG.test(slug) || slug.length > 120) return null;
  const text = message.trim().slice(0, 300);
  if (text.length < 2) return null;
  return kind === "topic" ? { message: text, patente_topic: slug } : { message: text, patente_question: slug };
}
function explainErrorHint(code) {
  if (code === "ai_limit_reached") return "limit";
  if (code === "too_many_requests") return "slow";
  if (code === "network" || code === "timeout") return "network";
  return null;
}

export { _sfc_main as _, explainErrorHint as a, explainBody as e };
//# sourceMappingURL=patenteExplain-CPOOCBVz.mjs.map
