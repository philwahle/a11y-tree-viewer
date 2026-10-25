<script setup lang="ts">
import { computed } from "vue";

type Props = {
  html: string;
  dark?: boolean;
  showLabel?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  dark: false,
  showLabel: true,
});

// sandbox="" blocks scripts, form submission and popups; base target="_blank"
// turns link clicks into blocked popups instead of navigating the frame.
const srcdoc = computed(
  () => `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<base target="_blank">
<style>
  :root { color-scheme: ${props.dark ? "dark" : "light"}; }
  body { margin: 1rem; font: 16px/1.5 system-ui, sans-serif; }
  :focus-visible { outline: 3px solid #0284c7; outline-offset: 2px; }
</style>
</head>
<body>${props.html}</body>
</html>`,
);
</script>

<template>
  <div>
    <div
      v-if="showLabel"
      class="border-b border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] px-3 py-1.5 text-sm font-bold tracking-wider text-[var(--vp-c-text-3)] uppercase"
    >
      Vorschau
    </div>
    <div class="h-56 resize-y overflow-auto">
      <iframe
        :srcdoc="srcdoc"
        sandbox=""
        title="Gerenderte Vorschau des HTML-Codes"
        class="block h-full w-full border-0"
      />
    </div>
  </div>
</template>
