<script setup lang="ts">
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-vue-next";
import type { ThemeMode } from "./../composables/useTheme";

defineProps<{ modelValue: ThemeMode }>();
const emit = defineEmits<{ "update:modelValue": [value: ThemeMode] }>();

const options: { value: ThemeMode; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Hell", icon: Sun },
  { value: "dark", label: "Dunkel", icon: Moon },
  { value: "system", label: "Wie System", icon: Monitor },
];
</script>

<template>
  <div
    role="group"
    aria-label="Farbschema"
    class="flex items-center gap-0.5 rounded-md bg-[var(--vp-c-bg-mute)] p-0.5"
  >
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      :aria-pressed="modelValue === opt.value"
      :aria-label="opt.label"
      :title="opt.label"
      @click="emit('update:modelValue', opt.value)"
      class="flex h-8 w-8 items-center justify-center rounded transition-colors focus-visible:outline-2 outline-sky-700"
      :class="
        modelValue === opt.value
          ? 'bg-[var(--vp-c-bg-soft)] text-[var(--vp-c-text-1)] shadow-sm'
          : 'text-[var(--vp-c-text-3)] hover:text-[var(--vp-c-text-2)]'
      "
    >
      <component :is="opt.icon" :size="16" aria-hidden="true" />
    </button>
  </div>
</template>
