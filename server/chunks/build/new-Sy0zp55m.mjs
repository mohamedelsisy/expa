import { u as useAdminSeo, _ as _sfc_main$1 } from './useAdminSeo-DuRYEU0h.mjs';
import { _ as _sfc_main$2 } from './ContentForm-BY8XCqFs.mjs';
import { defineComponent, computed, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { m as moduleByKey } from './modules-CgmwLVRo.mjs';
import { u as useI18n, f as useRoute, c as useLocalePath, n as navigateTo } from './server.mjs';
import './Breadcrumbs-C7SaJcTR.mjs';
import './useSeo-BU4sLOnV.mjs';
import './safe-B2eSdAXJ.mjs';
import './FreshnessBadge-C3EJLnMu.mjs';
import './Badge-PdKIsny2.mjs';
import './Dialog-D35kg5aY.mjs';
import './FormField-DFtov8VK.mjs';
import './TextInput-BI4efS3_.mjs';
import './Alert-D-zfMDy5.mjs';
import './Card-BxvVO_-_.mjs';
import './Checkbox-PDAPbGXG.mjs';
import './Select-BjjHKxeN.mjs';
import './Textarea-C8QsGxT0.mjs';
import './ConfirmInline-sG5Cp32P.mjs';
import './useToast-BX2bodPv.mjs';
import './usePermissions-C4HCMWJS.mjs';
import './permissions-CcyNKBx7.mjs';
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
  __name: "new",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const route = useRoute();
    const m = computed(() => moduleByKey(route.params.module));
    useAdminSeo(() => t("admin.content.new"));
    const localePath = useLocalePath();
    const done = (item) => navigateTo(localePath(`/admin/content/${m.value.key}/${item.id}`));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_AdminContentForm = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)("admin.content.newTitle", { module: unref(t)(`admin.modules.${unref(m).key}Singular`) }),
        crumbs: [{ label: unref(t)("admin.title"), to: "/admin" }, { label: unref(t)(`admin.modules.${unref(m).key}`), to: `/admin/content/${unref(m).key}` }, { label: unref(t)("admin.content.new") }]
      }, null, _parent));
      _push(ssrRenderComponent(_component_AdminContentForm, {
        key: unref(m).key,
        module: unref(m),
        initial: null,
        onSaved: done
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/content/[module]/new.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=new-Sy0zp55m.mjs.map
