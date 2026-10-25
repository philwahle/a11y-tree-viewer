<script setup lang="ts">
import A11yTreeViewer from "./components/A11yTree.vue";
import ExamplePicker from "./components/ExamplePicker.vue";
import { useExamples } from "./composables/useExamples";

const { currentId, current, html, isEdited, reset } = useExamples();
</script>

<template>
  <div class="py-8">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-[var(--vp-c-text-1)]">
        Accessibility Tree Viewer
      </h1>
    </header>

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
  </div>
</template>
