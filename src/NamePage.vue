<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { Info } from "lucide-vue-next";
import EditorPanel from "./components/EditorPanel.vue";
import ExamplePicker from "./components/ExamplePicker.vue";
import NameTracePanel from "./components/NameTracePanel.vue";
import ThemeToggle from "./components/ThemeToggle.vue";
import TreePanel from "./components/TreePanel.vue";
import { useA11yTree } from "./composables/useA11yTree";
import { useExamples } from "./composables/useExamples";
import { useTheme } from "./composables/useTheme";
import { useWrapPreference } from "./composables/useWrapPreference";
import { NAME_EXAMPLES } from "./examples";
import type { A11yNode } from "./types/a11y";

const { currentId, current, html, isEdited, reset } = useExamples(NAME_EXAMPLES);
const { mode } = useTheme();
const { wrap } = useWrapPreference();
const { nodes } = useA11yTree(html);

// Generic elements are part of the lesson: they show why a name is not allowed
const showAll = ref(true);
const showWarn = ref(true);
const uid = useId();
const idFor = (name: string) => `${uid}-${name}`;

function flatten(list: A11yNode[]): A11yNode[] {
  return list.flatMap((n) => [n, ...flatten(n.children)]);
}

const pickedPath = ref<string | null>(null);

const selected = computed<A11yNode | null>(() => {
  const all = flatten(nodes.value);
  return (
    all.find((n) => n.path === pickedPath.value) ??
    all.find((n) => n.roleInfo.role) ??
    all[0] ??
    null
  );
});
</script>

<template>
  <div class="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <header class="mb-8">
      <div class="flex items-start justify-between gap-4">
        <h1 class="text-2xl font-bold text-[var(--vp-c-text-1)] sm:text-3xl">
          Accessible Name berechnen
        </h1>
        <ThemeToggle v-model="mode" />
      </div>

      <div class="mt-4 mb-6 flex flex-col gap-8 md:flex-row">
        <div class="mt-4 max-w-prose space-y-3 text-[var(--vp-c-text-2)]">
          <p>
            Woher ein Element seinen Namen bekommt, legt eine feste Reihenfolge fest. Sie hängt vom Element ab. Diese Seite zeigt für jedes Element jede geprüfte Quelle: was gesetzt ist, was nicht gesetzt ist und was verloren hat.
          </p>
          <p>
            Grundlage sind die Spezifikationen
            <a href="https://www.w3.org/TR/accname-1.2/" class="underline underline-offset-4 focus-visible:outline-2 outline-offset-2 outline-sky-700">AccName 1.2</a>
            und
            <a href="https://www.w3.org/TR/html-aam-1.0/" class="underline underline-offset-4 focus-visible:outline-2 outline-offset-2 outline-sky-700">HTML-AAM</a>.
          </p>
          <p>
            <a href="./" class="font-semibold text-sky-700 underline underline-offset-4 vdark:text-sky-300 focus-visible:outline-2 outline-offset-2 outline-sky-700">Zurück zum Accessibility Tree Viewer</a>
          </p>
        </div>

        <aside
          aria-labelledby="limits-title"
          class="mt-4 flex max-w-prose gap-3 rounded-lg border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] p-4 text-sm text-[var(--vp-c-text-2)]"
        >
          <Info :size="18" class="mt-0.5 shrink-0 text-sky-600" aria-hidden="true" />
          <div>
            <h2 id="limits-title" class="font-bold text-[var(--vp-c-text-1)]">Grenzen des Tools</h2>
            <p class="mt-1">
              Die Seite setzt die Spezifikation um und zeigt nicht, was ein bestimmter Browser tut. Sie liest nur den HTML-Text: Ausgewertet werden <code>hidden</code>, <code>aria-hidden</code> und Inline-Styles. Nicht ausgewertet werden CSS aus Stylesheets, Text aus <code>::before</code> und <code>::after</code>, Shadow DOM und <code>aria-owns</code>.
            </p>
          </div>
        </aside>
      </div>
    </header>

    <main>
      <ExamplePicker
        :current-id="currentId"
        :is-edited="isEdited"
        :examples="NAME_EXAMPLES"
        @reset="reset"
      />

      <section aria-labelledby="example-title" class="mt-8">
        <h2 id="example-title" class="text-xl font-bold text-[var(--vp-c-text-1)]">{{ current.title }}</h2>
        <p class="mt-1 max-w-prose text-[var(--vp-c-text-2)]">{{ current.description }}</p>

        <div class="my-4 overflow-hidden rounded-lg border border-[var(--vp-c-divider)] text-sm">
          <div class="flex flex-wrap items-center justify-end gap-4 border-b border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] px-3 py-2">
            <label :for="idFor('showAll')" class="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--vp-c-text-2)] select-none">
              <input :id="idFor('showAll')" v-model="showAll" type="checkbox" class="cursor-pointer accent-sky-400" />
              Alle Elemente
            </label>
            <label :for="idFor('showWarn')" class="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--vp-c-text-2)] select-none">
              <input :id="idFor('showWarn')" v-model="showWarn" type="checkbox" class="cursor-pointer accent-sky-400" />
              Warnungen
            </label>
            <label :for="idFor('wrap')" class="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--vp-c-text-2)] select-none">
              <input :id="idFor('wrap')" v-model="wrap" type="checkbox" class="cursor-pointer accent-sky-400" />
              Zeilenumbruch
            </label>
          </div>

          <div class="grid lg:grid-cols-2">
            <div class="min-w-0 border-b border-[var(--vp-c-divider)] lg:border-r lg:border-b-0">
              <EditorPanel v-model="html" :wrap="wrap" />
            </div>
            <div class="min-w-0">
              <TreePanel
                :nodes="nodes"
                :show-all="showAll"
                :show-warn="showWarn"
                :selected-path="selected?.path ?? ''"
                @select="pickedPath = $event.path"
              />
            </div>
          </div>

          <NameTracePanel :node="selected" />
        </div>
      </section>
    </main>
  </div>
</template>
