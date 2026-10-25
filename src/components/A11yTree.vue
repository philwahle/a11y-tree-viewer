<script setup lang="ts">
import { ref, watch } from "vue";
import EditorPanel from "./EditorPanel.vue";
import TreePanel from "./TreePanel.vue";
import Legend from "./Legend.vue";
import LayoutToggle from "./LayoutToggle.vue";
import { useA11yTree } from "./../composables/useA11yTree.ts";
import { useLayoutPreference } from "./../composables/useLayoutPreference.ts";

const props = defineProps<{ html?: string }>();

const htmlContent = ref("");
const showAll = ref(false);
const showWarn = ref(true);
const activeTab = ref<"editor" | "tree">("editor");

const { layout } = useLayoutPreference();
const { nodes } = useA11yTree(htmlContent);

watch(
  () => props.html,
  (val) => {
    if (val !== undefined) htmlContent.value = val.trim();
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <div
    class="my-4 overflow-hidden rounded-lg border border-[var(--vp-c-divider)] text-sm"
  >
    <!-- Main header -->
    <div
      class="flex items-center gap-3 border-b border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] px-3 py-2"
    >
      <LayoutToggle v-model="layout" />
      <div class="ml-auto flex items-center gap-4">
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
      </div>
    </div>

    <!-- Vertical layout -->
    <template v-if="layout === 'vertical'">
      <EditorPanel
        v-model="htmlContent"
        class="border-b border-[var(--vp-c-divider)]"
      />
      <TreePanel :nodes="nodes" :show-all="showAll" :show-warn="showWarn" />
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
          role="tab"
          :aria-selected="activeTab === 'editor'"
          :aria-controls="'tab-panel-editor'"
          @click="activeTab = 'editor'"
          class="-mb-px border-b-2 px-4 py-2 text-xs font-medium transition-colors"
          :class="
            activeTab === 'editor'
              ? 'border-sky-400 text-[var(--vp-c-text-1)]'
              : 'border-transparent text-[var(--vp-c-text-3)] hover:text-[var(--vp-c-text-2)]'
          "
        >
          HTML-Editor
        </button>
        <button
          role="tab"
          :aria-selected="activeTab === 'tree'"
          :aria-controls="'tab-panel-tree'"
          @click="activeTab = 'tree'"
          class="-mb-px border-b-2 px-4 py-2 text-xs font-medium transition-colors"
          :class="
            activeTab === 'tree'
              ? 'border-sky-500 text-[var(--vp-c-text-1)]'
              : 'border-transparent text-[var(--vp-c-text-3)] hover:text-[var(--vp-c-text-2)]'
          "
        >
          Accessibility Tree
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
    </template>

    <Legend />
  </div>
</template>
