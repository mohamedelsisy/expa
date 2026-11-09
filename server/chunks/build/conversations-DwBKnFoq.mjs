import { u as useAdminSeo, _ as _sfc_main$1 } from './useAdminSeo-DuRYEU0h.mjs';
import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$3 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$4 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$5 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, i as _sfc_main$2$1, j as isApiError, h as formatDateTime } from './server.mjs';
import { _ as _sfc_main$6 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$7 } from './DataTable--nNCrVdv.mjs';
import { _ as _sfc_main$8 } from './Pagination-DA28GIFv.mjs';
import { defineComponent, ref, withAsyncContext, computed, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import './Breadcrumbs-C7SaJcTR.mjs';
import './useSeo-BU4sLOnV.mjs';
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
  __name: "conversations",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    useAdminSeo(() => t("admin.ai.conversations.title"));
    const page = ref(1);
    const { data, error, refresh, status: st } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("admin-ai-conversations", () => request("admin/ai/conversations", { query: { page: page.value, per_page: 25 } }), { watch: [page] })), __temp = await __temp, __restore(), __temp);
    const { data: usage } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("admin-ai-usage", async () => {
      try {
        return (await request("admin/ai/usage")).data;
      } catch {
        return null;
      }
    })), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    const nf = computed(() => new Intl.NumberFormat(locale.value));
    const columns = computed(() => [
      { key: "id", label: "#" },
      { key: "user_id", label: t("admin.ai.conversations.user") },
      { key: "locale", label: t("admin.ai.knowledge.language") },
      { key: "messages", label: t("admin.ai.conversations.messages") },
      { key: "degraded", label: t("admin.ai.conversations.degraded") },
      { key: "updated_at", label: t("admin.ai.conversations.updated") }
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_UiAlert = _sfc_main$2;
      const _component_UiBadge = _sfc_main$3;
      const _component_UiCard = _sfc_main$4;
      const _component_UiSkeleton = _sfc_main$5;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$6;
      const _component_AdminDataTable = _sfc_main$7;
      const _component_UiPagination = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)("admin.ai.conversations.title"),
        description: unref(t)("admin.ai.conversations.help"),
        crumbs: [{ label: unref(t)("admin.title"), to: "/admin" }, { label: unref(t)("admin.ai.conversations.title") }]
      }, null, _parent));
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "info",
        class: "mb-6",
        "data-testid": "metadata-only"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("admin.ai.conversations.privacy"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("admin.ai.conversations.privacy")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(usage)) {
        _push(`<section aria-labelledby="usage-h" class="mb-8 space-y-3"><h2 id="usage-h" class="text-xl font-bold">${ssrInterpolate(unref(t)("admin.ai.conversations.usageTitle"))}</h2><dl class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><!--[-->`);
        ssrRenderList(["questions_30d", "degraded_30d", "tokens_in_30d", "tokens_out_30d"], (k) => {
          _push(`<div class="rounded-md border border-line bg-surface p-4"><dt class="text-sm text-ink-soft">${ssrInterpolate(unref(t)(`admin.ai.conversations.usage.${k}`))}</dt><dd class="mt-1 text-2xl font-bold" dir="ltr">${ssrInterpolate(unref(nf).format(unref(usage)[k]))}</dd></div>`);
        });
        _push(`<!--]--></dl>`);
        if (unref(usage).by_intent.length) {
          _push(`<div><h3 class="mb-2 font-bold">${ssrInterpolate(unref(t)("admin.ai.conversations.byIntent"))}</h3><ul class="flex flex-wrap gap-2"><!--[-->`);
          ssrRenderList(unref(usage).by_intent, (i) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_UiBadge, { tone: "neutral" }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<span dir="ltr"${_scopeId}>${ssrInterpolate(i.intent)}: ${ssrInterpolate(unref(nf).format(i.total))}</span>`);
                } else {
                  return [
                    createVNode("span", { dir: "ltr" }, toDisplayString(i.intent) + ": " + toDisplayString(unref(nf).format(i.total)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<h2 class="mb-3 text-xl font-bold">${ssrInterpolate(unref(t)("admin.ai.conversations.listTitle"))}</h2>`);
      if (unref(st) === "pending" && !unref(data)) {
        _push(`<ul aria-busy="true"><li>`);
        _push(ssrRenderComponent(_component_UiCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSkeleton, { lines: 5 }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSkeleton, { lines: 5 })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</li></ul>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: unref(isApiError)(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!unref(rows).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("admin.ai.conversations.empty"),
          icon: "help"
        }, null, _parent));
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_AdminDataTable, {
          columns: unref(columns),
          rows: unref(rows),
          "row-key": "id",
          caption: unref(t)("admin.ai.conversations.title")
        }, {
          "cell-user_id": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            var _a2, _b2;
            if (_push2) {
              _push2(`<span dir="ltr"${_scopeId}>${ssrInterpolate((_a2 = row.user_id) != null ? _a2 : "\u2014")}</span>`);
            } else {
              return [
                createVNode("span", { dir: "ltr" }, toDisplayString((_b2 = row.user_id) != null ? _b2 : "\u2014"), 1)
              ];
            }
          }),
          "cell-locale": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)(`languages.${row.locale}`))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)(`languages.${row.locale}`)), 1)
              ];
            }
          }),
          "cell-updated_at": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-sm"${_scopeId}>${ssrInterpolate(unref(formatDateTime)(row.updated_at, unref(locale)))}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-sm" }, toDisplayString(unref(formatDateTime)(row.updated_at, unref(locale))), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="mt-4">`);
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_b = (_a = unref(meta)) == null ? void 0 : _a.page) != null ? _b : 1,
          "last-page": (_d = (_c = unref(meta)) == null ? void 0 : _c.last_page) != null ? _d : 1,
          onChange: ($event) => page.value = $event
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/ai/conversations.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=conversations-DwBKnFoq.mjs.map
