import { onMounted, onUnmounted, ref } from "vue";

/** Tracks the `.dark` class on <html>, set by useTheme or by VitePress. */
export function useDarkClass() {
  const isDark = ref(false);
  let observer: MutationObserver | null = null;

  onMounted(() => {
    const root = document.documentElement;
    isDark.value = root.classList.contains("dark");
    observer = new MutationObserver(() => {
      isDark.value = root.classList.contains("dark");
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  });

  onUnmounted(() => observer?.disconnect());

  return { isDark };
}
