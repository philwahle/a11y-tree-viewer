import { ref, watch } from 'vue'

const STORAGE_KEY = 'a11y-tree-wrap'

function loadWrap(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function useWrapPreference() {
  const wrap = ref(loadWrap())

  watch(wrap, (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(val))
    } catch {
      // Storage unavailable: the choice lasts for this page view only
    }
  })

  return { wrap }
}
