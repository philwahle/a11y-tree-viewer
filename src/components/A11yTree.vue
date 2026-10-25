<script setup lang="ts">
import { computed, ref, useId, watch } from "vue";
import EditorPanel from "./EditorPanel.vue";
import TreePanel from "./TreePanel.vue";
import PreviewPanel from "./PreviewPanel.vue";
import Legend from "./Legend.vue";
import LayoutToggle from "./LayoutToggle.vue";
import { useA11yTree } from "./../composables/useA11yTree.ts";
import { useLayoutPreference } from "./../composables/useLayoutPreference.ts";
import { useWrapPreference } from "./../composables/useWrapPreference.ts";

type Tab = "editor" | "tree" | "preview";

const props = defineProps<{ html?: string }>();
const emit = defineEmits<{ "update:html": [value: string] }>();

const htmlContent = ref("");
const showAll = ref(false);
const showWarn = ref(true);
const showPreview = ref(true);
const activeTab = ref<Tab>("editor");

// Explicit label/control ids (WCAG H44, helps voice control), unique per
// viewer so several viewers can share one page
const uid = useId();
const idFor = (name: string) => `${uid}-${name}`;

const { layout } = useLayoutPreference();
const { wrap } = useWrapPreference();
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
          :for="idFor('showAll')"
          class="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--vp-c-text-2)] select-none focus-within:outline-2 focus-within:outline-sky-700 focus-within:outline-offset-2 rounded-sm"
        >
          <input
            :id="idFor('showAll')"
            type="checkbox"
            v-model="showAll"
            class="cursor-pointer accent-sky-400"
          />
          Alle Elemente
        </label>
        <label
          :for="idFor('showWarn')"
          class="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--vp-c-text-2)] select-none focus-within:outline-2 focus-within:outline-sky-700 focus-within:outline-offset-2 rounded-sm"
        >
          <input
            :id="idFor('showWarn')"
            type="checkbox"
            v-model="showWarn"
            class="cursor-pointer accent-sky-400"
          />
          Warnungen
        </label>
        <label
          :for="idFor('wrap')"
          class="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--vp-c-text-2)] select-none focus-within:outline-2 focus-within:outline-sky-700 focus-within:outline-offset-2 rounded-sm"
        >
          <input
            :id="idFor('wrap')"
            type="checkbox"
            v-model="wrap"
            class="cursor-pointer accent-sky-400"
          />
          Zeilenumbruch
        </label>
        <label
          :for="idFor('showPreview')"
          class="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--vp-c-text-2)] select-none focus-within:outline-2 focus-within:outline-sky-700 focus-within:outline-offset-2 rounded-sm"
        >
          <input
            :id="idFor('showPreview')"
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
        :wrap="wrap"
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
          <EditorPanel v-model="htmlContent" :wrap="wrap" />
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
          :aria-controls="idFor(`tab-panel-${tab.id}`)"
          @click="activeTab = tab.id"
          class="-mb-px border-b-2 px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-2 -outline-offset-2 outline-sky-700"
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
        :id="idFor('tab-panel-editor')"
        role="tabpanel"
        :hidden="activeTab !== 'editor'"
      >
        <EditorPanel
          v-show="activeTab === 'editor'"
          v-model="htmlContent"
          :wrap="wrap"
          :show-label="false"
        />
      </div>
      <div :id="idFor('tab-panel-tree')" role="tabpanel" :hidden="activeTab !== 'tree'">
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
        :id="idFor('tab-panel-preview')"
        role="tabpanel"
        :hidden="activeTab !== 'preview'"
      >
        <PreviewPanel :html="htmlContent" :show-label="false" />
      </div>
    </template>

    <Legend />
  </div>
</template>
