<script setup lang="ts">
import { computed } from "vue";
import { RotateCcw } from "lucide-vue-next";
import { EXAMPLES, type Example } from "./../examples";

const props = withDefaults(
  defineProps<{
    currentId: string;
    isEdited: (id: string) => boolean;
    examples?: Example[];
  }>(),
  { examples: () => EXAMPLES },
);

const emit = defineEmits<{ reset: [] }>();

const GROUPS: { group: Example["group"]; label: string }[] = [
  { group: "name", label: "Namensberechnung" },
  { group: "uebung", label: "Übung" },
  { group: "weitere", label: "Weitere Beispiele" },
  { group: "eigenes", label: "Eigenes" },
];

const groups = computed(() =>
  GROUPS.filter(({ group }) => props.examples.some((e) => e.group === group)),
);
</script>

<template>
  <nav aria-label="Beispiele" class="flex flex-wrap items-start gap-x-6 gap-y-3">
    <div v-for="{ group, label } in groups" :key="group">
      <h2
        :id="`examples-${group}`"
        class="mb-1.5 text-xs font-bold tracking-wider text-[var(--vp-c-text-3)] uppercase"
      >
        {{ label }}
      </h2>
      <ul
        :aria-labelledby="`examples-${group}`"
        class="m-0 flex list-none flex-wrap gap-1.5 p-0"
      >
        <li v-for="ex in examples.filter((e) => e.group === group)" :key="ex.id">
          <a
            :href="`#${ex.id}`"
            :aria-current="ex.id === currentId ? 'true' : undefined"
            class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm no-underline transition-colors focus-visible:outline-2 outline-offset-2 outline-sky-700"
            :class="
              ex.id === currentId
                ? 'border-sky-600 bg-sky-600 text-white'
                : 'border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] text-[var(--vp-c-text-1)] hover:border-sky-600'
            "
          >
            {{ ex.label }}
            <template v-if="isEdited(ex.id)">
              <span
                class="h-1.5 w-1.5 rounded-full bg-current"
                aria-hidden="true"
                title="bearbeitet"
              />
              <span class="sr-only">(bearbeitet)</span>
            </template>
          </a>
        </li>
      </ul>
    </div>

    <button
      v-if="isEdited(currentId)"
      type="button"
      class="ml-auto inline-flex items-center gap-1.5 self-end rounded-md border border-[var(--vp-c-divider)] px-3 py-1 text-sm text-[var(--vp-c-text-2)] hover:text-[var(--vp-c-text-1)] focus-visible:outline-2 outline-offset-2 outline-sky-700"
      @click="emit('reset')"
    >
      <RotateCcw :size="14" aria-hidden="true" />
      Beispiel zurücksetzen
    </button>
  </nav>
</template>
