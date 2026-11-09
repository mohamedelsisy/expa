import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderClass } from 'vue/server-renderer';
import { _ as _sfc_main$1 } from './ScoreRing-D5NDFTYF.mjs';
import { u as useI18n } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MatchReasons",
  __ssrInlineRender: true,
  props: {
    match: {},
    compact: { type: Boolean },
    heading: {}
  },
  setup(__props) {
    const props = __props;
    const { t } = useI18n();
    const ICON = {
      match: { glyph: "\u2713", cls: "bg-success-soft text-success" },
      partial: { glyph: "\u25B3", cls: "bg-warning-soft text-warning" },
      mismatch: { glyph: "\u2717", cls: "bg-danger-soft text-danger" },
      unknown: { glyph: "?", cls: "bg-sunken text-muted" }
    };
    const low = computed(() => props.match.confidence < 40);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "space-y-3",
        "aria-label": (_a = __props.heading) != null ? _a : unref(t)("jobs.match.title"),
        "data-testid": "job-match"
      }, _attrs))}><div class="flex flex-wrap items-center gap-4">`);
      if (__props.match.score !== null) {
        _push(ssrRenderComponent(_sfc_main$1, {
          value: __props.match.score,
          label: unref(t)("jobs.match.label"),
          size: __props.compact ? 88 : 120
        }, null, _parent));
      } else {
        _push(`<p class="min-w-0 basis-full font-medium text-ink" data-testid="match-none">${ssrInterpolate(unref(t)("jobs.match.noScore"))}</p>`);
      }
      _push(`<p class="min-w-0 flex-1 basis-40 text-sm text-ink-soft" data-testid="match-confidence">${ssrInterpolate(unref(t)("jobs.match.confidence", { value: __props.match.confidence }))}`);
      if (low.value) {
        _push(`<!--[-->${ssrInterpolate(unref(t)("jobs.match.lowConfidence"))}<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</p></div><ul class="space-y-1.5"><!--[-->`);
      ssrRenderList(__props.match.reasons, (r) => {
        var _a2, _b, _c;
        _push(`<li class="flex items-start gap-2"${ssrRenderAttr("data-status", r.status)} data-testid="match-reason"><span class="${ssrRenderClass([(_b = (_a2 = ICON[r.status]) == null ? void 0 : _a2.cls) != null ? _b : ICON.unknown.cls, "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-sm font-bold"])}" aria-hidden="true">${ssrInterpolate(((_c = ICON[r.status]) != null ? _c : ICON.unknown).glyph)}</span><span class="sr-only">${ssrInterpolate(unref(t)(`jobs.match.status.${r.status}`))}:</span><span class="text-ink">${ssrInterpolate(r.label)}</span></li>`);
      });
      _push(`<!--]--></ul></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/jobs/MatchReasons.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=MatchReasons-CqNfUzGS.mjs.map
