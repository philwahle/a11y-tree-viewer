<script setup lang="ts">
import type { Layout } from "./../types/a11y";

defineProps<{ modelValue: Layout }>();
const emit = defineEmits<{ "update:modelValue": [value: Layout] }>();

type Option = { value: Layout; label: string };

const options: Option[] = [
  { value: "vertical", label: "Vertikal gestapelt" },
  { value: "side", label: "Nebeneinander" },
  { value: "tabs", label: "Tabs" },
];
</script>

<template>
  <div
    role="radiogroup"
    aria-label="Layout wählen"
    class="flex items-center gap-0.5 rounded-md bg-[var(--vp-c-bg-mute)] p-0.5"
  >
    <button
      v-for="opt in options"
      :key="opt.value"
      :aria-checked="modelValue === opt.value"
      :aria-label="opt.label"
      :title="opt.label"
      name="layout"
      @click="emit('update:modelValue', opt.value)"
      class="flex h-7 w-7 items-center justify-center rounded transition-colors focus-visible:outline-2 outline-sky-700"
      :class="
        modelValue === opt.value
          ? 'bg-[var(--vp-c-bg-soft)] text-[var(--vp-c-text-1)] shadow-sm'
          : 'text-[var(--vp-c-text-3)] hover:text-[var(--vp-c-text-2)]'
      "
    >
      <!-- Vertical: two stacked bars -->
      <svg
        v-if="opt.value === 'vertical'"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="currentColor"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="12" height="5" rx="1" />
        <rect x="1" y="8" width="12" height="5" rx="1" />
      </svg>
      <!-- Side by side: two vertical bars -->
      <svg
        v-else-if="opt.value === 'side'"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="currentColor"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="5" height="12" rx="1" />
        <rect x="8" y="1" width="5" height="12" rx="1" />
      </svg>
      <!-- Tabs: tab header + content -->
      <svg
        v-else
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="currentColor"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="5" height="3" rx="1" />
        <rect x="7" y="1" width="5" height="3" rx="1" opacity="0.35" />
        <rect x="1" y="5" width="12" height="8" rx="1" />
      </svg>
    </button>
  </div>
</template>
