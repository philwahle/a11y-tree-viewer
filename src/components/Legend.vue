<script setup lang="ts">
import { Compass, MousePointerClick, ListTree, Radio, Code2 } from "lucide-vue-next";

import LegendItem from "./LegendItem.vue";
</script>

<template>
  <aside
    class="border-t border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] px-3 py-2">
    <ul role="list" class="flex flex-wrap items-center gap-x-4 gap-y-1.5 p-0! m-0! list-none">
      <LegendItem :icon="Compass" type="landmark" label="Landmark"
        style="--custom-color-100: var(--custom-color-blue-100); --custom-color-800: var(--custom-color-blue-800); --custom-color-700: var(--custom-color-blue-700); --custom-color-50: var(--custom-color-blue-50);" />
      <LegendItem :icon="MousePointerClick" type="button" label="Interaktiv"
        style="--custom-color-100: var(--custom-color-purple-100); --custom-color-800: var(--custom-color-purple-800); --custom-color-700: var(--custom-color-purple-700); --custom-color-50: var(--custom-color-purple-50);" />
      <LegendItem :icon="ListTree" type="heading" label="Struktur"
        style="--custom-color-100: var(--custom-color-green-100); --custom-color-800: var(--custom-color-green-800); --custom-color-700: var(--custom-color-green-700); --custom-color-50: var(--custom-color-green-50);" />
      <LegendItem :icon="Radio" type="status" label="Live Region"
        style="--custom-color-100: var(--custom-color-amber-100); --custom-color-800: var(--custom-color-amber-800); --custom-color-700: var(--custom-color-amber-700); --custom-color-50: var(--custom-color-amber-50);" />
      <LegendItem :icon="Code2" type="role=''" label="Explizit"
        style="--custom-color-100: var(--custom-color-red-100); --custom-color-800: var(--custom-color-red-800); --custom-color-700: var(--custom-color-red-700); --custom-color-50: var(--custom-color-red-50);" />
    </ul>

    <div class="flex justify-end mt-1.5">
      <span class="text-xs text-[var(--vp-c-text-2)] italic">
        Hover → Tooltip mit Erklärung
      </span>
    </div>
  </aside>
</template>
