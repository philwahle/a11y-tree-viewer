<script setup lang="ts">
import TreeNode from "./TreeNode.vue";
import type { A11yNode } from "./../types/a11y";

type Props = {
  nodes: A11yNode[];
  showAll: boolean;
  showWarn: boolean;
  showLabel?: boolean;
};

withDefaults(defineProps<Props>(), { showLabel: true });
</script>

<template>
  <div>
    <div
      v-if="showLabel"
      class="border-b border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] px-3 py-1.5 text-sm font-bold tracking-wider text-[var(--vp-c-text-3)] uppercase"
    >
      Accessibility Tree
    </div>
    <div class="overflow-y-auto p-2 max-h-104">
      <div
        v-if="nodes.length === 0"
        class="py-8 text-center text-xs leading-relaxed text-[var(--vp-c-text-3)]"
      >
        ← HTML eingeben, um den Accessibility Tree zu sehen.
      </div>
      <TreeNode
        v-for="(node, i) in nodes"
        :key="i"
        :node="node"
        :show-all="showAll"
        :show-warn="showWarn"
      />
    </div>
  </div>
</template>
