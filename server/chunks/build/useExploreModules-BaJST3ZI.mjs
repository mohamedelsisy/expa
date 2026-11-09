import { computed, defineComponent, ref, watch, mergeProps, unref, isRef, useId, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderStyle, ssrRenderList, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import { u as useI18n, g as useApi, c as useLocalePath, d as _sfc_main$5, n as navigateTo } from './server.mjs';
import { u as useCommunityMeta } from './useCommunity-pk23xdcX.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Combobox",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    suggestions: {},
    label: {},
    placeholder: {},
    typeLabel: { type: Function }
  },
  emits: ["update:modelValue", "submit", "select"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const { t } = useI18n();
    const uid = useId();
    const listId = `sb-list-${uid}`;
    const optId = (i) => `sb-opt-${uid}-${i}`;
    const open = ref(false);
    const active = ref(-1);
    const expanded = computed(() => open.value && props.suggestions.length > 0);
    watch(() => props.suggestions, () => {
      active.value = -1;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative" }, _attrs))}><div class="relative">`);
      _push(ssrRenderComponent(_sfc_main$5, {
        name: "search",
        size: 18,
        class: "pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted"
      }, null, _parent));
      _push(`<input type="search" role="combobox" autocomplete="off" enterkeyhint="search"${ssrRenderAttr("aria-label", __props.label)} aria-autocomplete="list" aria-haspopup="listbox"${ssrRenderAttr("aria-expanded", expanded.value ? "true" : "false")}${ssrRenderAttr("aria-controls", listId)}${ssrRenderAttr("aria-activedescendant", expanded.value && active.value >= 0 ? optId(active.value) : void 0)}${ssrRenderAttr("value", __props.modelValue)}${ssrRenderAttr("placeholder", __props.placeholder)} maxlength="100" class="block min-h-touch w-full rounded-md border border-line-strong bg-surface ps-10 pe-3 py-2 text-ink placeholder:text-muted"></div><ul${ssrRenderAttr("id", listId)} role="listbox"${ssrRenderAttr("aria-label", unref(t)("search.suggestions"))} class="absolute inset-x-0 top-full z-50 mt-1 max-h-72 overflow-auto rounded-md border border-line bg-surface py-1 shadow-3" style="${ssrRenderStyle(expanded.value ? null : { display: "none" })}"><!--[-->`);
      ssrRenderList(__props.suggestions, (s, i) => {
        _push(`<li${ssrRenderAttr("id", optId(i))} role="option"${ssrRenderAttr("aria-selected", i === active.value ? "true" : "false")} class="${ssrRenderClass([i === active.value ? "bg-primary-soft text-primary-strong" : "text-ink hover:bg-sunken", "flex min-h-touch cursor-pointer items-center justify-between gap-3 px-3 py-2"])}"><span class="min-w-0 truncate">${ssrInterpolate(s.title)}</span><span class="shrink-0 text-xs text-muted">${ssrInterpolate(__props.typeLabel ? __props.typeLabel(s.type) : s.type)}</span></li>`);
      });
      _push(`<!--]--></ul><p class="sr-only" role="status" aria-live="polite">${ssrInterpolate(expanded.value ? unref(t)("search.suggestionsCount", { count: __props.suggestions.length }) : "")}</p></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/search/Combobox.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SearchBox",
  __ssrInlineRender: true,
  setup(__props) {
    const { t, locale } = useI18n();
    const { request } = useApi();
    const localePath = useLocalePath();
    const q = ref("");
    const suggestions = ref([]);
    let timer = null;
    let seq = 0;
    watch(q, (v) => {
      if (timer) clearTimeout(timer);
      const term = v.trim();
      if (term.length < 2) {
        suggestions.value = [];
        return;
      }
      timer = setTimeout(async () => {
        var _a;
        const my = ++seq;
        try {
          const res = await request("search/suggest", { query: { q: term }, handle401: false });
          if (my === seq) suggestions.value = (_a = res.data) != null ? _a : [];
        } catch {
          if (my === seq) suggestions.value = [];
        }
      }, 250);
    });
    const typeLabel = (type) => t(`search.types.${type}`);
    function go(query) {
      if (query.length < 2) return navigateTo(localePath("/search"));
      suggestions.value = [];
      return navigateTo({ path: localePath("/search"), query: { q: query } });
    }
    watch(locale, () => {
      suggestions.value = [];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SearchCombobox = _sfc_main$1;
      _push(`<form${ssrRenderAttrs(mergeProps({
        role: "search",
        "aria-label": unref(t)("search.title"),
        class: "w-full"
      }, _attrs))}>`);
      _push(ssrRenderComponent(_component_SearchCombobox, {
        modelValue: unref(q),
        "onUpdate:modelValue": ($event) => isRef(q) ? q.value = $event : null,
        suggestions: unref(suggestions),
        label: unref(t)("search.label"),
        placeholder: unref(t)("search.placeholder"),
        "type-label": typeLabel,
        onSubmit: go,
        onSelect: ($event) => go($event.title)
      }, null, _parent));
      _push(`</form>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/search/SearchBox.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const EXPLORE_GROUPS = [
  { key: "life", modules: ["guides", "government", "appointments", "documents", "healthcare", "housing", "dailyLife", "family", "cities"] },
  { key: "work", modules: ["jobs", "money", "netSalary", "business", "travel", "travelRequirements"] },
  { key: "learn", modules: ["study", "learnItalian", "patente"] },
  { key: "more", modules: ["recommendations", "explain", "articles", "services", "community", "pricing", "search"] }
];
function useExploreModules() {
  const community = useCommunityMeta();
  const modules = computed(() => [
    { key: "guides", to: "/guides", icon: "book" },
    { key: "government", to: "/government", icon: "building" },
    { key: "appointments", to: "/appointments", icon: "calendar" },
    { key: "documents", to: "/documents", icon: "file", auth: true },
    { key: "learnItalian", to: "/learn-italian", icon: "sparkle" },
    { key: "patente", to: "/patente", icon: "car" },
    { key: "jobs", to: "/jobs", icon: "briefcase" },
    { key: "study", to: "/study", icon: "book" },
    { key: "cities", to: "/cities", icon: "map" },
    { key: "housing", to: "/housing", icon: "home" },
    { key: "healthcare", to: "/healthcare", icon: "shield" },
    { key: "money", to: "/money", icon: "euro" },
    { key: "business", to: "/business", icon: "briefcase" },
    { key: "family", to: "/family", icon: "user" },
    { key: "travel", to: "/travel", icon: "globe" },
    { key: "netSalary", to: "/money/net-salary", icon: "euro" },
    { key: "travelRequirements", to: "/travel/requirements", icon: "globe" },
    { key: "recommendations", to: "/recommendations", icon: "sparkle", auth: true },
    { key: "dailyLife", to: "/daily-life", icon: "home" },
    { key: "explain", to: "/documents/explain", icon: "file", auth: true },
    { key: "articles", to: "/articles", icon: "list" },
    { key: "services", to: "/services", icon: "user" },
    ...community.enabled.value ? [{ key: "community", to: "/community", icon: "help" }] : [],
    { key: "pricing", to: "/pricing", icon: "euro" },
    { key: "search", to: "/search", icon: "search" }
  ]);
  const groups = computed(() => EXPLORE_GROUPS.map((g) => ({
    key: g.key,
    items: g.modules.map((k) => modules.value.find((m) => m.key === k)).filter((m) => !!m)
  })).filter((g) => g.items.length));
  return { modules, groups, community };
}
function activeModuleKey(path, modules, resolve) {
  var _a;
  let best = null;
  for (const m of modules) {
    const full = resolve(m.to);
    if ((path === full || path.startsWith(`${full}/`)) && (!best || full.length > best.len)) best = { key: m.key, len: full.length };
  }
  return (_a = best == null ? void 0 : best.key) != null ? _a : null;
}

export { _sfc_main as _, activeModuleKey as a, useExploreModules as u };
//# sourceMappingURL=useExploreModules-BaJST3ZI.mjs.map
