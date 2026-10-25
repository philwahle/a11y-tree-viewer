<script setup lang="ts">
import { type LucideIcon } from "lucide-vue-next";

type Props = {
  icon?: LucideIcon;
  label: string;
  type: string;
};

const props = defineProps<Props>();
</script>

<template>
  <li class="flex items-center gap-1.5 text-xs text-[var(--vp-c-text-2)] m-0!">
    <span
      class="vdark:text-[var(--custom-color-100)] vdark:bg-[var(--custom-color-800)] vdark:border-[var(--custom-color-700)] inline-flex items-center gap-1 rounded border border-[var(--custom-color-100)] bg-[var(--custom-color-50)] px-1.5 py-px text-xs font-bold text-[var(--custom-color-800)]"
    >
      <component :is="icon" :size="12" aria-hidden="true" />
      {{ type }}
    </span>
    <span>{{ label }}</span>
  </li>
</template>
