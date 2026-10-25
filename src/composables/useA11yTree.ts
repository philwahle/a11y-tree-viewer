import { computed, type Ref } from "vue";
import { buildTree } from "../a11y/tree";
import type { A11yNode } from "../types/a11y";

export function useA11yTree(html: Ref<string>) {
  const nodes = computed<A11yNode[]>(() => {
    if (typeof DOMParser === "undefined") return [];
    if (!html.value.trim()) return [];
    return buildTree(html.value);
  });
  return { nodes };
}
