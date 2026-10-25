<script setup lang="ts">
import { Info } from "lucide-vue-next";
import A11yTreeViewer from "./components/A11yTree.vue";
import ExamplePicker from "./components/ExamplePicker.vue";
import ThemeToggle from "./components/ThemeToggle.vue";
import { useExamples } from "./composables/useExamples";
import { useTheme } from "./composables/useTheme";

const { currentId, current, html, isEdited, reset } = useExamples();
const { mode } = useTheme();
</script>

<template>
  <div class="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <header class="mb-8">
      <div class="flex items-start justify-between gap-4">
        <h1 class="text-2xl font-bold text-[var(--vp-c-text-1)] sm:text-3xl">
          Accessibility Tree Viewer
        </h1>
        <ThemeToggle v-model="mode" />
      </div>

      <div class="flex flex-col md:flex-row gap-8 mt-4 mb-6">
        <div class="mt-4 max-w-prose space-y-3 text-[var(--vp-c-text-2)]">
          <p>
            Aus HTML baut der Browser den DOM – und leitet daraus einen zweiten
            Baum ab: den
            <strong class="text-[var(--vp-c-text-1)]">Accessibility Tree</strong
            >. Screenreader, Sprachsteuerung und andere assistive Technologien
            lesen ausschließlich diesen Baum. Für jedes Element berechnet der
            Browser dort eine
            <strong class="text-[var(--vp-c-text-1)]">Rolle</strong>
            (Was ist das?), einen
            <strong class="text-[var(--vp-c-text-1)]">Namen</strong> (Wie wird
            es angekündigt?) und seine
            <strong class="text-[var(--vp-c-text-1)]">Zustände</strong>
            (deaktiviert, ausgewählt, aufgeklappt …).
          </p>
          <p>
            Wählen Sie ein Beispiel, verändern Sie den Code im Editor und
            beobachten Sie, wie sich der Baum live anpasst.
          </p>
        </div>

        <aside
          aria-labelledby="limits-title"
          class="mt-4 flex max-w-prose gap-3 rounded-lg border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] p-4 text-sm text-[var(--vp-c-text-2)]"
        >
          <Info
            :size="18"
            class="mt-0.5 shrink-0 text-sky-600"
            aria-hidden="true"
          />
          <div>
            <h2 id="limits-title" class="font-bold text-[var(--vp-c-text-1)]">
              Grenzen des Tools
            </h2>
            <p class="mt-1">
              Der Viewer ist ein vereinfachtes Lernmodell, kein 1:1-Abbild des
              Browsers. Er berechnet Rolle, Name und Zustand aus dem Quellcode –
              Verhalten wie Fokus, Tastaturbedienung oder vererbte Zustände
              sieht er nicht. Prüfen Sie Ihre Ergebnisse deshalb in der Vorschau
              mit der Tastatur und im echten Accessibility Tree der
              Entwicklertools (Chrome/Edge: <em>Elements → Accessibility</em>,
              Firefox: <em>Barrierefreiheit</em>).
            </p>
          </div>
        </aside>
      </div>
    </header>

    <main>
      <ExamplePicker
        :current-id="currentId"
        :is-edited="isEdited"
        @reset="reset"
      />

      <section aria-labelledby="example-title" class="mt-8">
        <h2
          id="example-title"
          class="text-xl font-bold text-[var(--vp-c-text-1)]"
        >
          {{ current.title }}
        </h2>
        <p class="mt-1 max-w-prose text-[var(--vp-c-text-2)]">
          {{ current.description }}
        </p>

        <A11yTreeViewer v-model:html="html" />
      </section>
    </main>
  </div>
</template>
