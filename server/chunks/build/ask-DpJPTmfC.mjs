import { _ as _sfc_main$1 } from './Alert-D-zfMDy5.mjs';
import { u as useI18n, f as useRoute, g as useApi, _ as _sfc_main$3, d as _sfc_main$5, h as formatDateTime, i as _sfc_main$2$1, j as isApiError } from './server.mjs';
import { _ as _sfc_main$2 } from './IconButton-f7KcV3ty.mjs';
import { _ as _sfc_main$4 } from './ConfirmInline-sG5Cp32P.mjs';
import { _ as _sfc_main$6 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$7, e as explainBody } from './patenteExplain-CPOOCBVz.mjs';
import { _ as _sfc_main$8 } from './VerifyNeeded-mxk-8UjC.mjs';
import { _ as _sfc_main$9 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$a } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$b } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$c } from './Textarea-C8QsGxT0.mjs';
import { defineComponent, withAsyncContext, ref, watch, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, isRef, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderAttr, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr, ssrRenderStyle } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
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
import './routes-BNQ9Jhms.mjs';
import './safe-B2eSdAXJ.mjs';
import './SourceBadge-4_eAChkr.mjs';
import './FreshnessIndicator-B5-_pVo1.mjs';
import 'perfect-debounce';

const MAX = 1e3;
const MIN = 2;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ask",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b;
    let __temp, __restore;
    const { t, locale } = useI18n();
    useRoute();
    const { request } = useApi();
    const toast = useToast();
    useSeo(() => ({ title: t("ask.title"), description: t("ask.subtitle"), noindex: true }));
    let seq = 0;
    const nextKey = () => `m${++seq}`;
    const { data: side, refresh: refreshSide, error: sideError } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("ask-side", async () => {
      const [usage2, convs] = await Promise.all([
        request("ai/usage"),
        request("ai/conversations", { query: { per_page: 30 } })
      ]);
      return { usage: usage2.data, conversations: convs.data };
    })), __temp = await __temp, __restore(), __temp);
    const usage = ref((_b = (_a = side.value) == null ? void 0 : _a.usage) != null ? _b : null);
    watch(side, (s) => {
      if (s) usage.value = s.usage;
    });
    const conversations = computed(() => {
      var _a2, _b2;
      return (_b2 = (_a2 = side.value) == null ? void 0 : _a2.conversations) != null ? _b2 : [];
    });
    const conversationId = ref(null);
    const items = ref([]);
    const draft = ref("");
    const sending = ref(false);
    const loadingConv = ref(false);
    const convError = ref(null);
    const askError = ref(null);
    const showHistory = ref(false);
    const confirmDelete = ref(null);
    const deleting = ref(false);
    const logEl = ref(null);
    const announce = ref("");
    const remaining = computed(() => {
      var _a2, _b2;
      return (_b2 = (_a2 = usage.value) == null ? void 0 : _a2.remaining) != null ? _b2 : null;
    });
    const limitReached = computed(() => remaining.value !== null && remaining.value <= 0);
    const trimmed = computed(() => draft.value.trim());
    const tooLong = computed(() => draft.value.length > MAX);
    const canSend = computed(() => trimmed.value.length >= MIN && !tooLong.value && !sending.value && !limitReached.value);
    const counterTone = computed(() => draft.value.length > MAX ? "text-danger font-semibold" : draft.value.length > MAX * 0.9 ? "text-warning font-semibold" : "text-muted");
    function scrollToEnd() {
      nextTick(() => {
        var _a2, _b2, _c;
        (_c = (_b2 = (_a2 = logEl.value) == null ? void 0 : _a2.lastElementChild) == null ? void 0 : _b2.scrollIntoView) == null ? void 0 : _c.call(_b2, { block: "nearest" });
      });
    }
    async function openConversation(id) {
      loadingConv.value = true;
      convError.value = null;
      askError.value = null;
      showHistory.value = false;
      try {
        const res = await request(`ai/conversations/${id}`);
        conversationId.value = res.data.id;
        items.value = res.data.messages.map((m) => ({ key: nextKey(), role: m.role, content: m.content, message: m.role === "assistant" ? m : void 0 }));
        scrollToEnd();
      } catch (e) {
        convError.value = isApiError(e) ? e.message : t("errors.generic");
      } finally {
        loadingConv.value = false;
      }
    }
    function newConversation() {
      conversationId.value = null;
      items.value = [];
      askError.value = null;
      convError.value = null;
      showHistory.value = false;
    }
    async function deleteConversation(id) {
      deleting.value = true;
      try {
        await request(`ai/conversations/${id}`, { method: "DELETE" });
        if (conversationId.value === id) newConversation();
        confirmDelete.value = null;
        toast.success(t("ask.deleted"));
        await refreshSide();
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        deleting.value = false;
      }
    }
    const teacher = ref(null);
    const teacherOpen = ref(false);
    const topics = ref(null);
    const topicsError = ref(false);
    const topicsLoading = ref(false);
    const pickedTopic = ref("");
    async function loadTopics() {
      if (topics.value || topicsLoading.value) return;
      topicsLoading.value = true;
      topicsError.value = false;
      try {
        topics.value = (await request("patente/topics")).data;
      } catch {
        topicsError.value = true;
      } finally {
        topicsLoading.value = false;
      }
    }
    const topicOptions = computed(() => {
      var _a2;
      return ((_a2 = topics.value) != null ? _a2 : []).map((x) => ({ value: x.slug, label: x.title }));
    });
    function pickTopic(slug) {
      var _a2;
      pickedTopic.value = slug;
      const found = (_a2 = topics.value) == null ? void 0 : _a2.find((x) => x.slug === slug);
      teacher.value = found ? { kind: "topic", slug: found.slug, title: found.title } : null;
    }
    function explain() {
      const ctx = teacher.value;
      if (!ctx || sending.value || limitReached.value) return;
      const text = t(ctx.kind === "topic" ? "patente.explain.askTopic" : "patente.explain.askQuestion", { title: ctx.title });
      if (!explainBody(ctx.kind, ctx.slug, text)) return;
      void send(text, void 0, ctx);
    }
    async function send(text, reuse, ctx) {
      var _a2, _b2;
      askError.value = null;
      sending.value = true;
      let bubble = reuse;
      if (bubble) bubble.failed = false;
      else {
        items.value.push({ key: nextKey(), role: "user", content: text });
        bubble = items.value[items.value.length - 1];
      }
      scrollToEnd();
      try {
        const res = await request("ai/ask", { method: "POST", body: { message: text, ...conversationId.value ? { conversation_id: conversationId.value } : {}, ...ctx ? ctx.kind === "topic" ? { patente_topic: ctx.slug } : { patente_question: ctx.slug } : {} }, timeoutMs: 4e4 });
        const isNew = conversationId.value === null;
        conversationId.value = res.data.conversation_id;
        const msg = { ...res.data.message, degraded: res.data.message.degraded || !!res.meta.degraded };
        items.value.push({ key: nextKey(), role: "assistant", content: msg.content, message: msg, question: text });
        if (res.data.usage) usage.value = { limit: (_b2 = (_a2 = usage.value) == null ? void 0 : _a2.limit) != null ? _b2 : null, remaining: res.data.usage.remaining };
        announce.value = t("ask.newAnswer");
        if (isNew) await refreshSide();
      } catch (e) {
        bubble.failed = true;
        if (isApiError(e)) askError.value = { code: e.code, message: e.message };
        else askError.value = { code: "error", message: t("errors.generic") };
        if (isApiError(e) && e.code === "ai_limit_reached" && usage.value) usage.value = { ...usage.value, remaining: 0 };
      } finally {
        sending.value = false;
        scrollToEnd();
      }
    }
    function submit() {
      if (!canSend.value) return;
      const text = trimmed.value;
      draft.value = "";
      void send(text);
    }
    function onKeydown(e) {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        submit();
      }
    }
    const prompts = computed(() => [t("ask.prompts.p1"), t("ask.prompts.p2"), t("ask.prompts.p3")]);
    const errorHint = computed(() => {
      var _a2;
      const c = (_a2 = askError.value) == null ? void 0 : _a2.code;
      if (c === "ai_limit_reached") return t("ask.limitHint");
      if (c === "too_many_requests") return t("ask.slowDownHint");
      if (c === "network" || c === "timeout") return t("ask.networkHint");
      return null;
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a2, _b2;
      const _component_UiAlert = _sfc_main$1;
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiIconButton = _sfc_main$2;
      const _component_UiConfirmInline = _sfc_main$4;
      const _component_UiSkeleton = _sfc_main$6;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_AskMessage = _sfc_main$7;
      const _component_AuthVerifyNeeded = _sfc_main$8;
      const _component_UiFormField = _sfc_main$9;
      const _component_UiSelect = _sfc_main$a;
      const _component_UiBadge = _sfc_main$b;
      const _component_UiTextarea = _sfc_main$c;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-6 sm:py-10" }, _attrs))}><header class="mb-5 flex flex-wrap items-end justify-between gap-3"><div class="max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("ask.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("ask.subtitle"))}</p></div>`);
      if (unref(usage) && unref(usage).limit !== null) {
        _push(`<p class="rounded-full bg-primary-soft px-4 py-1.5 text-sm font-semibold text-primary-strong" data-testid="ai-usage">${ssrInterpolate(unref(t)("ask.usage", { remaining: (_a2 = unref(usage).remaining) != null ? _a2 : 0, limit: unref(usage).limit }))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</header>`);
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "info",
        class: "mb-5"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("ask.generalNote"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("ask.generalNote")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]"><aside${ssrRenderAttr("aria-label", unref(t)("ask.history"))} class="lg:order-first"><div class="mb-3 flex items-center justify-between gap-2"><h2 class="text-lg font-bold">${ssrInterpolate(unref(t)("ask.history"))}</h2>`);
      _push(ssrRenderComponent(_component_UiButton, {
        variant: "secondary",
        onClick: newConversation
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "plus",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("ask.newChat"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "plus",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("ask.newChat")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><button type="button" class="mb-2 inline-flex min-h-touch items-center gap-2 font-medium text-primary-strong lg:hidden"${ssrRenderAttr("aria-expanded", unref(showHistory))} aria-controls="conv-list">`);
      _push(ssrRenderComponent(_component_UiIcon, {
        name: "chevron-down",
        size: 18,
        class: unref(showHistory) ? "rotate-180" : ""
      }, null, _parent));
      _push(`${ssrInterpolate(unref(t)("ask.historyToggle", { count: unref(conversations).length }))}</button><div id="conv-list" class="${ssrRenderClass(unref(showHistory) ? "block" : "hidden lg:block")}">`);
      if (unref(sideError)) {
        _push(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("ask.historyError"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("ask.historyError")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (!unref(conversations).length) {
        _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("ask.historyEmpty"))}</p>`);
      } else {
        _push(`<ul class="max-h-80 space-y-1 overflow-auto lg:max-h-[32rem]"><!--[-->`);
        ssrRenderList(unref(conversations), (c) => {
          _push(`<li class="${ssrRenderClass([unref(conversationId) === c.id ? "bg-primary-soft" : "", "rounded-md"])}"><div class="flex items-center gap-1"><button type="button" class="min-h-touch min-w-0 flex-1 rounded-md px-3 py-2 text-start hover:bg-sunken"${ssrRenderAttr("aria-current", unref(conversationId) === c.id ? "true" : void 0)}><span class="block truncate font-medium">${ssrInterpolate(c.title || unref(t)("ask.untitled"))}</span><span class="block text-xs text-muted">${ssrInterpolate(unref(formatDateTime)(c.updated_at, unref(locale)))}</span></button>`);
          _push(ssrRenderComponent(_component_UiIconButton, {
            icon: "trash",
            label: unref(t)("ask.deleteConversation"),
            onClick: ($event) => confirmDelete.value = c.id
          }, null, _parent));
          _push(`</div>`);
          if (unref(confirmDelete) === c.id) {
            _push(ssrRenderComponent(_component_UiConfirmInline, {
              class: "m-2",
              message: unref(t)("ask.deleteConfirm"),
              "confirm-label": unref(t)("common.delete"),
              loading: unref(deleting),
              onConfirm: ($event) => deleteConversation(c.id),
              onCancel: ($event) => confirmDelete.value = null
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      }
      _push(`</div></aside><section${ssrRenderAttr("aria-label", unref(t)("ask.chat"))} class="flex min-h-[28rem] min-w-0 flex-col rounded-lg border border-line bg-surface"><div class="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6"${ssrRenderAttr("aria-busy", unref(sending) || unref(loadingConv) ? "true" : void 0)}>`);
      if (unref(loadingConv)) {
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 3
        }, null, _parent));
      } else if (unref(convError)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: unref(convError),
          retry: "",
          onRetry: ($event) => unref(conversationId) && openConversation(unref(conversationId))
        }, null, _parent));
      } else if (!unref(items).length) {
        _push(`<div class="mx-auto max-w-lg space-y-4 py-6 text-center"><span class="mx-auto grid size-14 place-items-center rounded-full bg-primary-soft text-primary-strong">`);
        _push(ssrRenderComponent(_component_UiIcon, {
          name: "sparkle",
          size: 28
        }, null, _parent));
        _push(`</span><h2 class="text-lg font-bold">${ssrInterpolate(unref(t)("ask.emptyTitle"))}</h2><p class="text-ink-soft">${ssrInterpolate(unref(t)("ask.emptyBody"))}</p><ul class="flex flex-col gap-2"><!--[-->`);
        ssrRenderList(unref(prompts), (p) => {
          _push(`<li><button type="button" class="min-h-touch w-full rounded-md border border-line-strong bg-surface px-4 py-2 text-start hover:bg-sunken">${ssrInterpolate(p)}</button></li>`);
        });
        _push(`<!--]--></ul></div>`);
      } else {
        _push(`<div role="log" aria-live="polite"${ssrRenderAttr("aria-label", unref(t)("ask.conversation"))} class="space-y-5"><!--[-->`);
        ssrRenderList(unref(items), (it) => {
          _push(`<div class="${ssrRenderClass(it.role === "user" ? "flex justify-end" : "flex justify-start")}">`);
          if (it.role === "user") {
            _push(`<div class="max-w-[85%] rounded-lg bg-primary px-4 py-3 text-on-primary" data-testid="ask-user-msg"><p class="prose-plain break-words" dir="auto">${ssrInterpolate(it.content)}</p>`);
            if (it.failed) {
              _push(`<div class="mt-2 flex flex-wrap items-center gap-2 text-sm"><span class="font-semibold">${ssrInterpolate(unref(t)("ask.notSent"))}</span><button type="button" class="inline-flex min-h-touch items-center gap-1 rounded-md bg-surface px-3 font-medium text-primary-strong"${ssrIncludeBooleanAttr(unref(sending)) ? " disabled" : ""}>`);
              _push(ssrRenderComponent(_component_UiIcon, {
                name: "refresh",
                size: 16
              }, null, _parent));
              _push(`${ssrInterpolate(unref(t)("common.retry"))}</button></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(`<div class="w-full max-w-[95%] rounded-lg border border-line bg-canvas px-4 py-3 sm:max-w-[90%]" data-testid="ask-assistant-msg">`);
            if (it.message) {
              _push(ssrRenderComponent(_component_AskMessage, {
                message: it.message,
                "msg-key": it.key,
                "fallback-query": it.question
              }, null, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      }
      if (unref(sending)) {
        _push(`<p class="flex items-center gap-2 text-ink-soft" role="status"><span class="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true"></span>${ssrInterpolate(unref(t)("ask.thinking"))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="space-y-3 border-t border-line p-4">`);
      if (((_b2 = unref(askError)) == null ? void 0 : _b2.code) === "email_not_verified") {
        _push(ssrRenderComponent(_component_AuthVerifyNeeded, null, null, _parent));
      } else if (unref(askError)) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "danger",
          title: unref(askError).code === "ai_limit_reached" ? unref(t)("ask.limitTitle") : unref(t)("ask.errorTitle"),
          "data-testid": "ask-error"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p${_scopeId}>${ssrInterpolate(unref(askError).message)}</p>`);
              if (unref(errorHint)) {
                _push2(`<p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(unref(errorHint))}</p>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode("p", null, toDisplayString(unref(askError).message), 1),
                unref(errorHint) ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "mt-1 text-sm"
                }, toDisplayString(unref(errorHint)), 1)) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<section class="rounded-md border border-line bg-sunken p-3"${ssrRenderAttr("aria-label", unref(t)("patente.explain.title"))} data-testid="ask-teacher"><button type="button" class="inline-flex min-h-touch items-center gap-2 font-medium text-primary-strong"${ssrRenderAttr("aria-expanded", unref(teacherOpen))} aria-controls="teacher-panel">`);
      _push(ssrRenderComponent(_component_UiIcon, {
        name: "chevron-down",
        size: 18,
        class: unref(teacherOpen) ? "rotate-180" : ""
      }, null, _parent));
      _push(`${ssrInterpolate(unref(t)("ask.teacherToggle"))}</button><div id="teacher-panel" class="mt-2 space-y-3" style="${ssrRenderStyle(unref(teacherOpen) ? null : { display: "none" })}"><p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("ask.teacherIntro"))}</p>`);
      if (unref(topicsLoading)) {
        _push(`<p class="text-sm text-muted" role="status">${ssrInterpolate(unref(t)("common.loading"))}</p>`);
      } else if (unref(topicsError)) {
        _push(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("ask.teacherTopicsError"))}</p>`);
              _push2(ssrRenderComponent(_component_UiButton, {
                variant: "secondary",
                class: "mt-2",
                onClick: ($event) => loadTopics()
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("common.retry"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("common.retry")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode("p", null, toDisplayString(unref(t)("ask.teacherTopicsError")), 1),
                createVNode(_component_UiButton, {
                  variant: "secondary",
                  class: "mt-2",
                  onClick: ($event) => loadTopics()
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("common.retry")), 1)
                  ]),
                  _: 1
                }, 8, ["onClick"])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (unref(topics) && !unref(topics).length) {
        _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("ask.teacherNoTopics"))}</p>`);
      } else if (unref(topics)) {
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("ask.teacherTopic")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSelect, {
                "model-value": unref(pickedTopic),
                options: unref(topicOptions),
                placeholder: unref(t)("ask.teacherChoose"),
                "onUpdate:modelValue": pickTopic
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSelect, {
                  "model-value": unref(pickedTopic),
                  options: unref(topicOptions),
                  placeholder: unref(t)("ask.teacherChoose"),
                  "onUpdate:modelValue": pickTopic
                }, null, 8, ["model-value", "options", "placeholder"])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(teacher)) {
        _push(`<div class="flex flex-wrap items-center gap-2" data-testid="teacher-ctx">`);
        _push(ssrRenderComponent(_component_UiBadge, {
          tone: "accent",
          dir: "auto"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(teacher).title)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(teacher).title), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          variant: "secondary",
          disabled: unref(sending) || unref(limitReached),
          "data-testid": "teacher-explain",
          onClick: explain
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "sparkle",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("patente.explain.button"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "sparkle",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("patente.explain.button")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          variant: "ghost",
          onClick: ($event) => {
            teacher.value = null;
            pickedTopic.value = "";
          }
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("ask.teacherClear"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("ask.teacherClear")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section><p class="sr-only" role="status" aria-live="polite">${ssrInterpolate(unref(announce))}</p><form class="space-y-2" novalidate>`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("ask.inputLabel"),
        error: unref(tooLong) ? unref(t)("ask.tooLong", { max: MAX }) : void 0
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextarea, {
              modelValue: unref(draft),
              "onUpdate:modelValue": ($event) => isRef(draft) ? draft.value = $event : null,
              rows: 3,
              placeholder: unref(t)("ask.placeholder"),
              disabled: unref(limitReached),
              "data-ask-input": "",
              onKeydown
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextarea, {
                modelValue: unref(draft),
                "onUpdate:modelValue": ($event) => isRef(draft) ? draft.value = $event : null,
                rows: 3,
                placeholder: unref(t)("ask.placeholder"),
                disabled: unref(limitReached),
                "data-ask-input": "",
                onKeydown
              }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder", "disabled"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex flex-wrap items-center justify-between gap-3"><p class="${ssrRenderClass([unref(counterTone), "text-xs"])}" data-testid="ask-counter"><span class="tabular-nums">${ssrInterpolate(unref(draft).length)}</span> / ${ssrInterpolate(MAX)} \xB7 ${ssrInterpolate(unref(t)("ask.keysHint"))}</p>`);
      _push(ssrRenderComponent(_component_UiButton, {
        type: "submit",
        disabled: !unref(canSend),
        loading: unref(sending)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "send",
              size: 18,
              class: "rtl:-scale-x-100"
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("ask.send"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "send",
                size: 18,
                class: "rtl:-scale-x-100"
              }),
              createTextVNode(toDisplayString(unref(t)("ask.send")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></form></div></section></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/ask.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ask-DpJPTmfC.mjs.map
