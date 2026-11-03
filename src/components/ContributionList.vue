<script setup lang="ts">
import ContributionList from "./ContributionList.vue";
import type { Contribution } from "./../types/a11y";

defineOptions({ name: "ContributionList" });
defineProps<{ items: Contribution[] }>();
</script>

<template>
  <ul class="my-1 ml-3 list-none border-l border-[var(--vp-c-divider)] pl-3">
    <template v-for="(item, i) in items" :key="i">
      <li v-if="item.via !== 'Leerraum'" class="py-0.5">
        <code class="font-mono text-[var(--vp-c-text-1)]">{{ item.label }}</code>
        <span v-if="item.via !== item.label" class="text-[var(--vp-c-text-2)]"> · {{ item.via }}</span>
        <span v-if="item.text.trim()" class="text-[var(--vp-c-text-1)]"> · „{{ item.text.trim() }}“</span>
        <span v-else class="text-[var(--vp-c-text-3)]"> · kein Text</span>
        <ContributionList v-if="item.children.length" :items="item.children" />
      </li>
    </template>
  </ul>
</template>
