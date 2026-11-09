import { _ as _sfc_main$1 } from './Document-Dv_75K1K.mjs';
import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './Breadcrumbs-C7SaJcTR.mjs';
import './server.mjs';
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
import './useSeo-BU4sLOnV.mjs';
import './safe-B2eSdAXJ.mjs';
import './Skeleton-BTnKIEst.mjs';
import './Alert-D-zfMDy5.mjs';
import './Inline-DiRQe8hf.mjs';
import './legal-vAxOkaZS.mjs';
import './asyncData-bKJD5Wmv.mjs';
import 'perfect-debounce';

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_LegalDocument = _sfc_main$1;
  _push(ssrRenderComponent(_component_LegalDocument, mergeProps({ slug: "cookies" }, _attrs), null, _parent));
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/cookies.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const cookies = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { cookies as default };
//# sourceMappingURL=cookies-B5wBv67f.mjs.map
