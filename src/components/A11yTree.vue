<script setup lang="ts">
import { computed, ref, watch } from "vue";
import EditorPanel from "./EditorPanel.vue";
import TreePanel from "./TreePanel.vue";
import PreviewPanel from "./PreviewPanel.vue";
import Legend from "./Legend.vue";
import LayoutToggle from "./LayoutToggle.vue";
import { useA11yTree } from "./../composables/useA11yTree.ts";
import { useLayoutPreference } from "./../composables/useLayoutPreference.ts";

type Tab = "editor" | "tree" | "preview";

const props = defineProps<{ html?: string }>();
const emit = defineEmits<{ "update:html": [value: string] }>();

const htmlContent = ref("");
const showAll = ref(false);
const showWarn = ref(true);
const showPreview = ref(true);
const activeTab = ref<Tab>("editor");

const { layout } = useLayoutPreference();
const { nodes } = useA11yTree(htmlContent);

const tabs = computed(() => {
  const all: { id: Tab; label: string }[] = [
    { id: "editor", label: "HTML-Editor" },
    { id: "tree", label: "Accessibility Tree" },
    { id: "preview", label: "Vorschau" },
  ];
  return showPreview.value ? all : all.filter((t) => t.id !== "preview");
});

watch(showPreview, (val) => {
  if (!val && activeTab.value === "preview") activeTab.value = "editor";
});

watch(
  () => props.html,
  (val) => {
    // Skip our own echo via update:html, otherwise this would rewrite typed text
    if (val === undefined || val === htmlContent.value) return;
    // Drop leading blank lines of template literals; trailing empty lines stay
    // so a snippet can offer room to type below
    htmlContent.value = val.replace(/^(\s*\n)+/, "");
  },
  {
    immediate: true,
  },
);

watch(htmlContent, (val) => emit("update:html", val));
</script>

<template>
  <div
    class="my-4 overflow-hidden rounded-lg border border-[var(--vp-c-divider)] text-sm"
  >
    <!-- Main header -->
    <div
      class="flex flex-wrap items-center gap-3 border-b border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] px-3 py-2"
    >
      <LayoutToggle v-model="layout" />
      <div class="ml-auto flex flex-wrap items-center gap-4">
        <label
          class="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--vp-c-text-2)] select-none focus-within:outline-2 focus-within:outline-sky-700 focus-within:outline-offset-2 rounded-sm"
        >
          <input
            type="checkbox"
            v-model="showAll"
            class="cursor-pointer accent-sky-400"
          />
          Alle Elemente
        </label>
        <label
          class="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--vp-c-text-2)] select-none focus-within:outline-2 focus-within:outline-sky-700 focus-within:outline-offset-2 rounded-sm"
        >
          <input
            type="checkbox"
            v-model="showWarn"
            class="cursor-pointer accent-sky-400"
          />
          Warnungen
        </label>
        <label
          class="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--vp-c-text-2)] select-none focus-within:outline-2 focus-within:outline-sky-700 focus-within:outline-offset-2 rounded-sm"
        >
          <input
            type="checkbox"
            v-model="showPreview"
            class="cursor-pointer accent-sky-400"
          />
          Vorschau
        </label>
      </div>
    </div>

    <!-- Vertical layout -->
    <template v-if="layout === 'vertical'">
      <EditorPanel
        v-model="htmlContent"
        class="border-b border-[var(--vp-c-divider)]"
      />
      <TreePanel :nodes="nodes" :show-all="showAll" :show-warn="showWarn" />
      <PreviewPanel
        v-if="showPreview"
        :html="htmlContent"
        class="border-t border-[var(--vp-c-divider)]"
      />
    </template>

    <!-- Side by side layout -->
    <template v-else-if="layout === 'side'">
      <div class="flex">
        <div class="min-w-0 flex-1 border-r border-[var(--vp-c-divider)]">
          <EditorPanel v-model="htmlContent" />
        </div>
        <div class="min-w-0 flex-1">
          <TreePanel :nodes="nodes" :show-all="showAll" :show-warn="showWarn" />
        </div>
      </div>
      <PreviewPanel
        v-if="showPreview"
        :html="htmlContent"
        class="border-t border-[var(--vp-c-divider)]"
      />
    </template>

    <!-- Tabs layout -->
    <template v-else>
      <!-- Tab bar -->
      <div
        class="flex border-b border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)]"
        role="tablist"
        aria-label="Panel wählen"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          role="tab"
          :aria-selected="activeTab === tab.id"
          :aria-controls="`tab-panel-${tab.id}`"
          @click="activeTab = tab.id"
          class="-mb-px border-b-2 px-4 py-2 text-xs font-medium transition-colors"
          :class="
            activeTab === tab.id
              ? 'border-sky-500 text-[var(--vp-c-text-1)]'
              : 'border-transparent text-[var(--vp-c-text-3)] hover:text-[var(--vp-c-text-2)]'
          "
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab panels -->
      <div
        id="tab-panel-editor"
        role="tabpanel"
        :hidden="activeTab !== 'editor'"
      >
        <EditorPanel
          v-show="activeTab === 'editor'"
          v-model="htmlContent"
          :show-label="false"
        />
      </div>
      <div id="tab-panel-tree" role="tabpanel" :hidden="activeTab !== 'tree'">
        <TreePanel
          v-show="activeTab === 'tree'"
          :nodes="nodes"
          :show-all="showAll"
          :show-warn="showWarn"
          :show-label="false"
        />
      </div>
      <div
        v-if="showPreview"
        id="tab-panel-preview"
        role="tabpanel"
        :hidden="activeTab !== 'preview'"
      >
        <PreviewPanel :html="htmlContent" :show-label="false" />
      </div>
    </template>

    <Legend />
  </div>
</template>
