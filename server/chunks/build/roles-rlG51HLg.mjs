import { u as useAdminSeo, _ as _sfc_main$1 } from './useAdminSeo-DuRYEU0h.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, i as _sfc_main$2$1 } from './server.mjs';
import { _ as _sfc_main$3 } from './Alert-D-zfMDy5.mjs';
import { defineComponent, withAsyncContext, computed, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { u as useRoles } from './useRoles-B6Nsc3f-.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "roles",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t } = useI18n();
    useAdminSeo(() => t("admin.nav.roles"));
    const { roles, failed, pending, load } = useRoles();
    [__temp, __restore] = withAsyncContext(() => load()), await __temp, __restore();
    const perms = computed(() => {
      var _a;
      return [...new Set(((_a = roles.value) != null ? _a : []).flatMap((r) => r.permissions))].sort();
    });
    const groups = computed(() => {
      var _a, _b;
      const g = {};
      for (const p of perms.value) ((_b = g[_a = p.split(".")[0]]) != null ? _b : g[_a] = []).push(p);
      return Object.entries(g);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiAlert = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)("admin.nav.roles"),
        description: unref(t)("admin.roles.subtitle"),
        crumbs: [{ label: unref(t)("admin.title"), to: "/admin" }, { label: unref(t)("admin.users.title"), to: "/admin/users" }, { label: unref(t)("admin.nav.roles") }]
      }, null, _parent));
      if (unref(pending)) {
        _push(ssrRenderComponent(_component_UiSkeleton, { lines: 6 }, null, _parent));
      } else if (unref(failed)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          retry: "",
          onRetry: ($event) => unref(load)(true)
        }, null, _parent));
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "info",
          class: "mb-4"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("admin.roles.superAdminNote"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("admin.roles.superAdminNote")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="relative overflow-auto rounded-lg border border-line bg-surface" role="region"${ssrRenderAttr("aria-label", unref(t)("admin.nav.roles"))} tabindex="0"><table class="w-full min-w-[40rem] border-collapse text-start"><caption class="sr-only">${ssrInterpolate(unref(t)("admin.roles.matrix"))}</caption><thead class="bg-sunken text-sm"><tr><th scope="col" class="px-3 py-2 text-start">${ssrInterpolate(unref(t)("admin.roles.permission"))}</th><!--[-->`);
        ssrRenderList(unref(roles), (r) => {
          _push(`<th scope="col" class="px-3 py-2 text-center">${ssrInterpolate(r.label)}`);
          if (r.privileged) {
            _push(`<span class="block text-xs font-normal text-muted">${ssrInterpolate(unref(t)("admin.users.privilegedRole"))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</th>`);
        });
        _push(`<!--]--></tr></thead><!--[-->`);
        ssrRenderList(unref(groups), ([group, ps]) => {
          _push(`<tbody class="divide-y divide-line border-t border-line"><!--[-->`);
          ssrRenderList(ps, (p) => {
            _push(`<tr><th scope="row" class="px-3 py-1.5 text-start font-normal" dir="ltr">${ssrInterpolate(p)}</th><!--[-->`);
            ssrRenderList(unref(roles), (r) => {
              _push(`<td class="px-3 py-1.5 text-center">`);
              if (r.permissions.includes(p)) {
                _push(`<!--[--><span aria-hidden="true">\u2713</span><span class="sr-only">${ssrInterpolate(unref(t)("admin.common.true"))}</span><!--]-->`);
              } else {
                _push(`<!--[--><span class="text-muted" aria-hidden="true">\u2013</span><span class="sr-only">${ssrInterpolate(unref(t)("admin.common.false"))}</span><!--]-->`);
              }
              _push(`</td>`);
            });
            _push(`<!--]--></tr>`);
          });
          _push(`<!--]--></tbody>`);
        });
        _push(`<!--]--></table></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/users/roles.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=roles-rlG51HLg.mjs.map
