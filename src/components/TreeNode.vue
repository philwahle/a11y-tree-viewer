<script setup lang="ts">
import { computed } from "vue";
import TreeNode from "./TreeNode.vue";
import { getRoleCat, ROLE_DESC } from "./../a11y/roles";
import type { A11yNode, RoleCategory } from "./../types/a11y";

import {
  Compass,
  MousePointerClick,
  ListTree,
  Radio,
  Code2,
  type LucideIcon,
} from "lucide-vue-next";

defineOptions({ name: "TreeNode" });

const props = defineProps<{
  node: A11yNode;
  showAll: boolean;
  showWarn: boolean;
}>();

const role = computed(() => props.node.roleInfo.role);
const src = computed(() => props.node.roleInfo.source);
const cat = computed<RoleCategory>(() =>
  role.value ? getRoleCat(role.value, src.value) : "none",
);

const isHidden = computed(() => props.node.states.hidden === "true");
const isPres = computed(
  () => role.value === "presentation" || role.value === "none",
);

const shouldRender = computed(
  () => props.showAll || !!role.value || props.node.children.length > 0,
);

const BADGE_CLASSES: Record<string, string> = {
  land: "vdark:text-[var(--custom-color-blue-100)] vdark:bg-[var(--custom-color-blue-800)] vdark:border-[var(--custom-color-blue-700)] border-[var(--custom-color-blue-100)] bg-[var(--custom-color-blue-50)] text-[var(--custom-color-blue-800)]",
  act: "vdark:text-[var(--custom-color-purple-100)] vdark:bg-[var(--custom-color-purple-800)] vdark:border-[var(--custom-color-purple-700)] border-[var(--custom-color-purple-100)] bg-[var(--custom-color-purple-50)] text-[var(--custom-color-purple-800)]",
  str: "vdark:text-[var(--custom-color-green-100)] vdark:bg-[var(--custom-color-green-800)] vdark:border-[var(--custom-color-green-700)] border-[var(--custom-color-green-100)] bg-[var(--custom-color-green-50)] text-[var(--custom-color-green-800)]",
  live: "vdark:text-[var(--custom-color-amber-100)] vdark:bg-[var(--custom-color-amber-800)] vdark:border-[var(--custom-color-amber-700)] border-[var(--custom-color-amber-100)] bg-[var(--custom-color-amber-50)] text-[var(--custom-color-amber-800)]",
  exp: "vdark:text-[var(--custom-color-red-100)] vdark:bg-[var(--custom-color-red-800)] vdark:border-[var(--custom-color-red-700)] border-[var(--custom-color-red-100)] bg-[var(--custom-color-red-50)] text-[var(--custom-color-red-800)]",
  none: "vdark:text-slate-100 vdark:bg-slate-800 vdark:border-slate-700 border-slate-100 bg-slate-50 text-slate-800",
};

const BADGE_ICONS: Record<string, LucideIcon | null> = {
  land: Compass,
  act: MousePointerClick,
  str: ListTree,
  live: Radio,
  exp: Code2,
  none: null,
};

const HI = new Set([
  "pressed",
  "expanded",
  "checked",
  "selected",
  "current",
  "live",
]);

const WARN_STATES = new Set(["disabled", "hidden", "invalid"]);
const INFO = new Set(["level", "required", "modal", "haspopup"]);

function stateBadgeClass(key: string, val: string): string {
  if (HI.has(key) && val !== "false")
    return "text-amber-600 border-amber-600/30 vdark:text-amber-400 vdark:border-amber-400/30";

  if (WARN_STATES.has(key) && val !== "false")
    return "text-red-600 border-red-600/25 vdark:text-red-400 vdark:border-red-400/30";

  if (INFO.has(key))
    return "text-sky-600 border-sky-600/25 vdark:text-sky-400 vdark:border-sky-400/30";

  return "text-slate-600 border-slate-600/25 vdark:text-slate-300 vdark:border-slate-300/25";
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const tagHtml = computed(() => {
  const { tag, attrs } = props.node;
  let html = `<span class="text-[var(--vp-c-text-2)]">&lt;${esc(tag)}</span>`;
  for (const { name, val } of attrs) {
    html +=
      ` <span class="text-blue-700/70 vdark:text-blue-300/80">${esc(name)}</span>` +
      `<span class="text-[var(--vp-c-text-2)]">=</span>` +
      `<span class="text-sky-700/80 vdark:text-sky-300/80">${esc(val)}</span>`;
  }
  html += `<span class="text-[var(--vp-c-text-2)]">&gt;</span>`;
  return html;
});

const roleTooltip = computed(() => {
  if (!role.value) return "";
  return (
    ROLE_DESC[role.value] ??
    (src.value === "explicit" ? 'Explizit via role="" gesetzt' : "")
  );
});
</script>

<template>
  <div
    v-if="shouldRender"
    class="font-mono text-xs"
    :class="[isHidden ? 'opacity-35' : '', isPres ? 'opacity-30' : '']"
  >
    <div
      class="flex min-h-8 cursor-default flex-wrap items-center gap-1 rounded px-1.5 py-0.5 hover:bg-[var(--vp-c-bg-mute)]"
    >
      <!-- Tag with highlighted attributes -->
      <span v-html="tagHtml" />

      <!-- aria-hidden indicator -->
      <span
        v-if="isHidden"
        class="rounded border border-red-400/30 px-1.5 text-sm text-red-400"
      >
        ⊘ aria-hidden
      </span>

      <!-- Role badge -->
      <span
        v-if="role || showAll"
        class="inline-flex cursor-help items-center gap-1 rounded border px-1.5 py-px text-sm font-bold"
        :class="BADGE_CLASSES[cat] ?? BADGE_CLASSES.none"
        :title="roleTooltip"
      >
        <!-- <span
          v-if="src === 'explicit'"
          class="h-1 w-1 shrink-0 rounded-full bg-current opacity-60"
          title='Explizit via role="" gesetzt'
          aria-hidden="true"
        /> -->

        <component
          v-if="BADGE_ICONS[cat]"
          :is="BADGE_ICONS[cat]"
          :size="12"
          aria-hidden="true"
        />

        {{ role ?? "generic" }}
      </span>

      <!-- Accessible name -->
      <span
        v-if="node.nameInfo.name"
        class="vdark:text-sky-200/60 max-w-80 cursor-help overflow-hidden text-sm text-ellipsis whitespace-nowrap text-sky-800/60 italic"
        :title="`Name-Quelle: ${node.nameInfo.src}`"
      >
        "{{ node.nameInfo.name.replace(/"/g, "'") }}"
      </span>

      <!-- Accessible description -->
      <span
        v-if="node.descInfo.description"
        class="vdark:text-slate-300 max-w-80 cursor-help overflow-hidden text-sm text-ellipsis whitespace-nowrap text-slate-600"
        :title="`Description-Quelle: ${node.descInfo.src}`"
      >
        Description: "{{ node.descInfo.description.replace(/"/g, "'") }}"
      </span>

      <!-- State badges -->
      <span
        v-for="[key, val] in Object.entries(node.states)"
        :key="key"
        class="inline-block rounded-sm border px-1.5 py-px text-sm"
        :class="stateBadgeClass(key, val)"
      >
        {{ key }}: {{ val }}
      </span>

      <!-- Warning badges -->
      <template v-if="showWarn">
        <span
          v-for="warn in node.warns"
          :key="warn"
          class="rounded border border-red-400/30 bg-red-400/5 px-1.5 text-sm text-red-400"
        >
          {{ warn }}
        </span>
      </template>
    </div>

    <!-- Children -->
    <div
      v-if="node.children.length"
      class="ml-4 border-l border-[var(--vp-c-divider)] pl-2.5"
    >
      <TreeNode
        v-for="(child, i) in node.children"
        :key="i"
        :node="child"
        :show-all="showAll"
        :show-warn="showWarn"
      />
    </div>
  </div>
</template>
