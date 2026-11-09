<script setup lang="ts">
import { Check, Minus, CircleSlash, X, CircleDashed, type LucideIcon } from "lucide-vue-next";
import ContributionList from "./ContributionList.vue";
import type { Step, StepStatus } from "./../types/a11y";

defineProps<{ steps: Step[] }>();

const STATUS: Record<StepStatus, { label: string; icon: LucideIcon; classes: string }> = {
  used: {
    label: "verwendet",
    icon: Check,
    classes: "text-emerald-700 vdark:text-emerald-300",
  },
  unset: {
    label: "nicht gesetzt",
    icon: Minus,
    classes: "text-[var(--vp-c-text-3)]",
  },
  empty: {
    label: "leer",
    icon: CircleDashed,
    classes: "text-[var(--vp-c-text-3)]",
  },
  outranked: {
    label: "verloren",
    icon: X,
    classes: "text-amber-700 vdark:text-amber-300",
  },
  ignored: {
    label: "ignoriert",
    icon: CircleSlash,
    classes: "text-red-700 vdark:text-red-300",
  },
};
</script>

<template>
  <ol class="m-0 list-none divide-y divide-[var(--vp-c-divider)] p-0">
    <li v-for="step in steps" :key="step.source" class="py-2">
      <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          class="inline-flex w-32 shrink-0 items-center gap-1.5 text-sm font-semibold"
          :class="STATUS[step.status].classes"
        >
          <component :is="STATUS[step.status].icon" :size="14" aria-hidden="true" class="self-center" />
          {{ STATUS[step.status].label }}
        </span>
        <code class="w-44 shrink-0 font-mono text-sm text-[var(--vp-c-text-1)]">{{ step.source }}</code>
        <span class="min-w-48 flex-1 text-sm break-words">
          <span v-if="step.value" class="text-[var(--vp-c-text-1)]">„{{ step.value }}“</span>
          <span
            v-if="step.note && step.note !== STATUS[step.status].label"
            class="text-[var(--vp-c-text-2)]"
          >
            {{ step.note }}
          </span>
        </span>
      </div>
      <details v-if="step.contributions?.length" class="mt-1 ml-1 text-sm">
        <summary class="cursor-pointer text-[var(--vp-c-text-2)] focus-visible:outline-2 outline-offset-2 outline-sky-700">
          So entsteht der Text
        </summary>
        <ContributionList :items="step.contributions" />
      </details>
    </li>
  </ol>
</template>
