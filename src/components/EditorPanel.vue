<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";

import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    showLabel?: boolean;
  }>(),
  { showLabel: true },
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const editorRef = ref<HTMLDivElement>();

// Typed loosely — CodeMirror is loaded dynamically (SSR-safe)
type View = {
  destroy(): void;
  dispatch(tr: object): void;
  state: { doc: { toString(): string } };
};

type ThemeCompartment = {
  reconfigure(ext: object): object;
};

let view: View | null = null;
let themeCompartment: ThemeCompartment | null = null;
let observer: MutationObserver | null = null;

onMounted(async () => {
  // Dynamic imports keep CodeMirror out of the SSR bundle

  const isDark = () => document.documentElement.classList.contains("dark");

  // Base theme: auto-height with min/max + VitePress font/color vars
  const baseTheme = EditorView.theme({
    "&": {
      minHeight: "5rem",
      maxHeight: "26rem",
      fontSize: "1rem",
      backgroundColor: "var(--vp-c-bg-mute)",
    },
    ".cm-scroller": {
      overflow: "auto",
      fontFamily: "var(--vp-font-family-mono, ui-monospace, monospace)",
      lineHeight: "1.65",
    },
    ".cm-content": {
      padding: "0,75rem 1rem",
      caretColor: "var(--vp-c-text-1)",
    },
    ".cm-focused": { outline: "none" },
    ".cm-line": { padding: "0" },
    "&.cm-focused .cm-cursor": { borderLeftColor: "var(--vp-c-text-1)" },
    // Light-mode surface colors (overridden by oneDark in dark mode)
    ".cm-gutters": {
      backgroundColor: "var(--vp-c-bg-soft)",
      borderRight: "1px solid var(--vp-c-divider)",
      color: "var(--vp-c-text-3)",
    },
    ".cm-activeLineGutter": { backgroundColor: "var(--vp-c-bg-mute)" },
    ".cm-activeLine": { backgroundColor: "rgba(127,127,127,0.06)" },
  });

  // themeCompartment = new Compartment();

  view = new EditorView({
    state: EditorState.create({
      doc: props.modelValue,
      extensions: [
        basicSetup,
        html(),
        baseTheme,
        // themeCompartment?.of(isDark() ? oneDark : []),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            emit("update:modelValue", update.state.doc.toString());
          }
        }),
      ],
    }),
    parent: editorRef.value!,
  });

  // Swap dark/light theme when VitePress toggles the .dark class on <html>
  observer = new MutationObserver(() => {
    view?.dispatch({
      effects: themeCompartment!.reconfigure(isDark() ? oneDark : []),
    });
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

onUnmounted(() => {
  observer?.disconnect();
  view?.destroy();
});

// Sync prop changes into the editor (e.g. when parent switches the snippet)
watch(
  () => props.modelValue,
  (val) => {
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== val) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: val },
      });
    }
  },
);
</script>

<template>
  <div>
    <div
      v-if="showLabel"
      class="border-b border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] px-3 py-1.5 text-sm font-bold tracking-wider text-[var(--vp-c-text-3)] uppercase"
    >
      HTML-Editor
    </div>
    <div ref="editorRef" />
  </div>
</template>
