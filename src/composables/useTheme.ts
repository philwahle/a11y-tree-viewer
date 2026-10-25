import { onMounted, onUnmounted, ref, watch } from "vue";

export type ThemeMode = "light" | "dark" | "system";

// Keep in sync with the inline script in index.html that avoids a flash.
const STORAGE_KEY = "a11y-tree-theme";

function loadMode(): ThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

export function useTheme() {
  const mode = ref<ThemeMode>(loadMode());
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  const apply = () => {
    const dark =
      mode.value === "dark" || (mode.value === "system" && media.matches);
    document.documentElement.classList.toggle("dark", dark);
  };

  watch(mode, (val) => {
    try {
      if (val === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, val);
    } catch {
      // Storage unavailable: the choice lasts for this page view only
    }
    apply();
  });

  onMounted(() => {
    apply();
    media.addEventListener("change", apply);
  });
  onUnmounted(() => media.removeEventListener("change", apply));

  return { mode };
}
