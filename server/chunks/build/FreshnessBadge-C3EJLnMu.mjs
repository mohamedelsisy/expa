import { g as useApi, s as useState, u as useI18n, j as isApiError } from './server.mjs';
import { ref, defineComponent, computed, mergeProps, withCtx, unref, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { _ as _sfc_main$2 } from './Badge-PdKIsny2.mjs';

const KNOWN = /* @__PURE__ */ new Set([
  "missing_translation",
  "missing_source_field",
  "source_domain_not_official",
  "invalid_source_url",
  "invalid_url",
  "university_not_published",
  "missing_rights_note",
  "verified_in_future"
]);
function extractProblems(err) {
  var _a;
  if (!isApiError(err)) return [];
  const raw = (_a = err.details) == null ? void 0 : _a.problems;
  if (!Array.isArray(raw)) return [];
  return raw.filter((p) => typeof p === "object" && p !== null && typeof p.code === "string").map((p) => ({
    code: String(p.code),
    ...typeof p.field === "string" ? { field: p.field } : {},
    ...typeof p.locale === "string" ? { locale: p.locale } : {}
  }));
}
function describeProblem(p, t, ctx) {
  const field = p.field ? ctx.fieldLabel(p.field) : "";
  const locale = p.locale ? ctx.localeLabel(p.locale) : "";
  if (!KNOWN.has(p.code)) {
    return {
      code: p.code,
      message: t("admin.problems.unknown", { code: p.code }),
      target: p.field ? { kind: "field", field: p.field } : { kind: "none" },
      known: false
    };
  }
  const message = t(`admin.problems.${p.code}`, { field, locale });
  if (p.code === "missing_translation" && p.locale) {
    return { code: p.code, message, known: true, target: { kind: "translation", locale: p.locale, field: ctx.firstRequiredField } };
  }
  if (p.field) return { code: p.code, message, known: true, target: { kind: "field", field: p.field } };
  return { code: p.code, message, known: true, target: { kind: "none" } };
}
const STATUSES = ["draft", "review", "approved", "published", "archived"];
function neededPermission(prefix, from, to) {
  if (from === "draft" && to === "review") return `${prefix}.update`;
  if (to === "published" || to === "archived" || from === "published") return `${prefix}.publish`;
  return `${prefix}.review`;
}
const TONE = {
  draft_review: "primary",
  review_approved: "primary",
  approved_published: "primary",
  review_draft: "secondary",
  approved_review: "secondary",
  published_approved: "secondary",
  archived_draft: "secondary",
  published_archived: "danger"
};
function workflowActions(i) {
  return i.allowedTransitions.filter((to) => STATUSES.includes(to)).map((to) => {
    var _a;
    const permission = neededPermission(i.prefix, i.status, to);
    return { to, permission, labelKey: `admin.workflow.action.${i.status}_${to}`, tone: (_a = TONE[`${i.status}_${to}`]) != null ? _a : "secondary" };
  }).filter((a) => i.can(a.permission));
}
const canSchedule = (i) => i.status === "approved" && i.can(`${i.prefix}.publish`);
function editState(status, prefix, can) {
  if (!can(`${prefix}.update`)) return "readonly";
  if ((status === "approved" || status === "published") && !can(`${prefix}.publish`)) return "locked";
  return "editable";
}
function editWarning(status, canPublish) {
  if (status === "review") return "review_reset";
  if ((status === "approved" || status === "published") && canPublish) return "live_revalidate";
  return null;
}
function classifyTransitionError(err, ctx) {
  const e = err;
  const message = typeof (e == null ? void 0 : e.message) === "string" ? e.message : "";
  if ((e == null ? void 0 : e.code) === "content_not_publishable") return { kind: "problems", problems: extractProblems(err), message };
  if ((e == null ? void 0 : e.code) === "content_locked") return { kind: "locked", message };
  if ((e == null ? void 0 : e.code) === "invalid_status_transition" || (e == null ? void 0 : e.code) === "invalid_schedule") return { kind: "invalid_transition", message };
  if ((e == null ? void 0 : e.status) === 403) {
    return ctx.to === "approved" && ctx.can(`${ctx.prefix}.review`) ? { kind: "four_eyes", message } : { kind: "forbidden", message };
  }
  return { kind: "other", message };
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "StatusBadge",
  __ssrInlineRender: true,
  props: {
    status: {}
  },
  setup(__props) {
    const props = __props;
    const { t } = useI18n();
    const tone = computed(() => {
      var _a;
      return (_a = { draft: "neutral", review: "info", approved: "accent", published: "success", archived: "neutral" }[props.status]) != null ? _a : "neutral";
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$2, mergeProps({
        tone: tone.value,
        "data-status": __props.status
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)(`admin.status.${__props.status}`))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)(`admin.status.${__props.status}`)), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/StatusBadge.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const ENDPOINT = {
  university: "admin/study/universities",
  topic: "admin/patente/topics",
  guide: "admin/guides",
  offices: "admin/government/offices"
};
function useRelationOptions(kind) {
  const { request } = useApi();
  const { locale } = useI18n();
  const options = useState(`admin-rel-${kind}`, () => null);
  const failed = useState(`admin-rel-${kind}-failed`, () => false);
  const pending = ref(false);
  async function load(force = false) {
    var _a, _b;
    if (options.value && !force) return;
    pending.value = true;
    failed.value = false;
    try {
      if (kind === "city") {
        const cities = await request("cities");
        options.value = ((_a = cities.data) != null ? _a : []).map((c) => ({ value: String(c.id), label: `${c.name} (${c.slug})` }));
        return;
      }
      const res = await request(ENDPOINT[kind], { query: { per_page: 100, sort: "slug" } });
      options.value = ((_b = res.data) != null ? _b : []).map((i) => {
        var _a2;
        const titles = (_a2 = i.titles) != null ? _a2 : {};
        const title = titles[locale.value] || titles.ar || titles.en || titles.it || "";
        return { value: String(i.id), label: title ? `${title} (${i.slug})` : i.slug };
      });
    } catch {
      failed.value = true;
    } finally {
      pending.value = false;
    }
  }
  return { options: computed(() => {
    var _a;
    return (_a = options.value) != null ? _a : [];
  }), failed, pending, load };
}
function usePlaces() {
  const { request } = useApi();
  const regions = useState("admin-regions", () => []);
  const cities = useState("admin-cities", () => []);
  const failed = ref(false);
  async function load() {
    var _a, _b;
    if (regions.value.length && cities.value.length) return;
    try {
      const [r, c] = await Promise.all([request("regions"), request("cities")]);
      regions.value = (_a = r.data) != null ? _a : [];
      cities.value = (_b = c.data) != null ? _b : [];
    } catch {
      failed.value = true;
    }
  }
  return { regions, cities, failed, load };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "FreshnessBadge",
  __ssrInlineRender: true,
  props: {
    freshness: {}
  },
  setup(__props) {
    const props = __props;
    const { t } = useI18n();
    const tone = computed(() => {
      var _a;
      return (_a = { fresh: "success", stale: "warning", outdated: "danger", unverified: "neutral" }[props.freshness]) != null ? _a : "neutral";
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$2, mergeProps({
        tone: tone.value,
        "data-freshness": __props.freshness
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)(`freshness.state.${__props.freshness}`))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)(`freshness.state.${__props.freshness}`)), 1)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/FreshnessBadge.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { STATUSES as S, _sfc_main as _, editWarning as a, _sfc_main$1 as b, canSchedule as c, describeProblem as d, editState as e, useRelationOptions as f, classifyTransitionError as g, usePlaces as u, workflowActions as w };
//# sourceMappingURL=FreshnessBadge-C3EJLnMu.mjs.map
