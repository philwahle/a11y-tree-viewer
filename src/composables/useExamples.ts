import { computed, onMounted, onUnmounted, ref } from "vue";
import { DEFAULT_EXAMPLE_ID, findExample, type Example } from "../examples";

const STORAGE_KEY = "a11y-tree-edits";

type Edits = Record<string, string>;

function loadEdits(): Edits {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Edits) : {};
  } catch {
    return {};
  }
}

function saveEdits(edits: Edits) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
  } catch {
    // Storage unavailable (private mode, blocked): edits stay in memory only
  }
}

function idFromHash(): string {
  const id = decodeURIComponent(location.hash.slice(1));
  return findExample(id) ? id : DEFAULT_EXAMPLE_ID;
}

/**
 * Selected example synced with the URL hash, plus per-example edits that
 * survive switching and reloading.
 */
export function useExamples() {
  const currentId = ref(idFromHash());
  const edits = ref<Edits>(loadEdits());

  const current = computed<Example>(() => findExample(currentId.value)!);

  const html = computed({
    get: () => edits.value[currentId.value] ?? current.value.html,
    set: (val: string) => {
      const next = { ...edits.value };
      // Exact compare: a trimmed one would treat added blank lines as "no
      // edit" and snap the editor back to the original
      if (val === current.value.html) delete next[currentId.value];
      else next[currentId.value] = val;
      edits.value = next;
      saveEdits(next);
    },
  });

  const isEdited = (id: string) => id in edits.value;

  function reset() {
    html.value = current.value.html;
  }

  const onHashChange = () => (currentId.value = idFromHash());
  onMounted(() => window.addEventListener("hashchange", onHashChange));
  onUnmounted(() => window.removeEventListener("hashchange", onHashChange));

  return { currentId, current, html, isEdited, reset };
}
