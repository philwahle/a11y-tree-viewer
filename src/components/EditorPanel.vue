<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";

import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";
import { Compartment, EditorState } from "@codemirror/state";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";
import { useDarkClass } from "./../composables/useDarkClass";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    showLabel?: boolean;
    /** Soft-wrap long lines instead of scrolling horizontally. */
    wrap?: boolean;
  }>(),
  { showLabel: true, wrap: false },
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const MIN_LINES = 4;
const LINE_HEIGHT = 1.65;
const CONTENT_PADDING_Y = "0.75rem";

const editorRef = ref<HTMLDivElement>();
const { isDark } = useDarkClass();

let view: EditorView | null = null;
const themeCompartment = new Compartment();
const wrapCompartment = new Compartment();

const wrapExtension = (wrap: boolean) => (wrap ? EditorView.lineWrapping : []);

onMounted(() => {
  // At least MIN_LINES lines tall (plus content padding), even when empty
  const minHeight = `calc(${MIN_LINES} * ${LINE_HEIGHT}em + 2 * ${CONTENT_PADDING_Y})`;

  // Base theme: auto-height with min/max + VitePress font/color vars
  const baseTheme = EditorView.theme({
    "&": {
      maxHeight: "26rem",
      fontSize: "1rem",
      backgroundColor: "var(--vp-c-bg-mute)",
    },
    ".cm-scroller": {
      overflow: "auto",
      fontFamily: "var(--vp-font-family-mono, ui-monospace, monospace)",
      lineHeight: String(LINE_HEIGHT),
    },
    ".cm-content": {
      padding: `${CONTENT_PADDING_Y} 1rem`,
      minHeight,
      caretColor: "var(--vp-c-text-1)",
    },
    ".cm-gutter": { minHeight },
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

  view = new EditorView({
    state: EditorState.create({
      doc: props.modelValue,
      extensions: [
        basicSetup,
        html(),
        baseTheme,
        themeCompartment.of(isDark.value ? oneDark : []),
        wrapCompartment.of(wrapExtension(props.wrap)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            emit("update:modelValue", update.state.doc.toString());
          }
        }),
      ],
    }),
    parent: editorRef.value!,
  });

});

// Swap dark/light theme when the .dark class on <html> changes
watch(isDark, (dark) => {
  view?.dispatch({ effects: themeCompartment.reconfigure(dark ? oneDark : []) });
});

watch(
  () => props.wrap,
  (wrap) => {
    view?.dispatch({ effects: wrapCompartment.reconfigure(wrapExtension(wrap)) });
  },
);

onUnmounted(() => {
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
