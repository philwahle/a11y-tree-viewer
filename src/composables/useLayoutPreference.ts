import { ref, watch } from 'vue'
import type { Layout } from '../types/a11y'

const STORAGE_KEY = 'a11y-tree-layout'

export function useLayoutPreference() {
  const stored = (typeof localStorage !== 'undefined'
    ? localStorage.getItem(STORAGE_KEY)
    : null) as Layout | null

  const layout = ref<Layout>(stored ?? 'vertical')

  watch(layout, (val) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, val)
    }
  })

  return { layout }
}
