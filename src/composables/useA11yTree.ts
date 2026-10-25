import { computed, type Ref } from 'vue'
import type { A11yNode, AttrPair, NameInfo, RoleCategory, RoleInfo, States } from '../types/a11y'

// ── Constants ─────────────────────────────────────────────────────────────────

const SKIP_TAGS = new Set([
  'html', 'head', 'body', 'script', 'style', 'meta', 'link', 'title',
  'br', 'wbr', 'template', 'noscript', 'slot',
])

export const ROLE_DESC: Record<string, string> = {
  banner:          'Seitenkopf-Bereich. Einmalig pro Seite; entspricht <header> auf oberster Ebene.',
  navigation:      'Navigationsbereich mit einer Gruppe von Links. Sollte aria-label haben bei mehreren nav-Elementen.',
  main:            'Hauptinhalt der Seite. Einmalig pro Seite; Screenreader können direkt dorthin springen.',
  contentinfo:     'Fußzeile mit Metainfos (Copyright, Links). Entspricht <footer> auf oberster Ebene.',
  complementary:   'Ergänzender Inhalt (z.B. Sidebar), der eigenständig funktioniert.',
  region:          'Benannter Inhaltsbereich. <section> bekommt diese Rolle NUR wenn ein accessible name vorhanden ist.',
  form:            'Formular-Landmark. <form> bekommt diese Rolle NUR wenn ein accessible name vorhanden ist.',
  search:          'Suchbereich der Seite.',
  button:          'Auslösbares Steuerelement. Aktivierbar per Klick oder Enter/Space.',
  link:            'Navigiert zu einer anderen URL oder Seite. Aktivierbar per Enter.',
  checkbox:        'Zweistufige Auswahl (checked/unchecked). Aktivierbar per Space.',
  radio:           'Einzelauswahl aus einer Gruppe. Aktivierbar per Pfeiltasten.',
  textbox:         'Einzeiliges Texteingabefeld.',
  searchbox:       'Texteingabe speziell für Suchanfragen.',
  combobox:        'Kombinierte Auswahl mit Texteingabe und Vorschlagsliste.',
  listbox:         'Liste auswählbarer Optionen (z.B. <select multiple>).',
  slider:          'Numerischer Wert in einem Bereich via Schieberegler.',
  spinbutton:      'Numerische Eingabe mit Hoch/Runter-Buttons.',
  heading:         'Überschrift mit Level 1–6. Strukturiert die Seite hierarchisch.',
  list:            'Geordnete oder ungeordnete Liste von Elementen.',
  listitem:        'Element einer Liste.',
  article:         'Eigenständiger Inhalt (z.B. Blogpost, Kommentar, Widget).',
  table:           'Tabellarische Daten mit Zeilen und Spalten.',
  row:             'Zeile in einer Tabelle oder einem Grid.',
  cell:            'Datenzelle in einer Tabelle.',
  columnheader:    'Spaltenüberschrift (<th scope="col">).',
  rowheader:       'Zeilenüberschrift (<th scope="row">).',
  rowgroup:        'Gruppe von Tabellenzeilen: <thead>, <tbody> oder <tfoot>.',
  img:             'Bild mit alternativem Text (alt-Attribut).',
  presentation:    'Dekoratives Element ohne semantischen Wert. Wird von AT-Tools ignoriert.',
  none:            'Wie presentation – kein semantischer Wert.',
  group:           'Gruppe zusammengehöriger Elemente (z.B. <fieldset>, <details>).',
  separator:       'Visuelle oder logische Trennlinie (<hr>).',
  dialog:          'Modales oder nicht-modales Dialogfenster.',
  alertdialog:     'Dialog mit einer wichtigen Meldung, die sofortige Aufmerksamkeit erfordert.',
  alert:           'Wichtige Live-Meldung, die sofort vorgelesen wird.',
  status:          'Statusmeldung (Live Region), die vorgelesen wird sobald der User eine Pause macht.',
  progressbar:     'Zeigt den Fortschritt eines Vorgangs an.',
  meter:           'Messwert in einem festen Bereich (z.B. Batteriestand).',
  figure:          'Abbildung, Diagramm oder Illustration mit optionaler Beschriftung.',
  paragraph:       'Textabsatz.',
  term:            'Begriff in einer Definition (<dt>).',
  definition:      'Erklärung eines Begriffs (<dd>).',
  tab:             'Einzelner Tab in einer Tab-Liste.',
  tablist:         'Container für Tab-Elemente.',
  tabpanel:        'Inhaltsbereich eines Tabs.',
  option:          'Auswählbare Option in einer Listbox.',
  math:            'Mathematischer Ausdruck.',
  tooltip:         'Kontextueller Hinweis, der bei Hover/Focus erscheint.',
  log:             'Live Region mit fortlaufenden Einträgen (z.B. Chat-Log).',
}

const CAT: Record<string, string[]> = {
  land: ['banner','complementary','contentinfo','form','main','navigation','region','search'],
  act:  ['button','checkbox','combobox','link','listbox','menuitem','menuitemcheckbox',
         'menuitemradio','option','radio','searchbox','slider','spinbutton',
         'switch','tab','textbox','treeitem'],
  live: ['alert','alertdialog','log','marquee','progressbar','status','timer','meter'],
  str:  ['article','cell','columnheader','definition','dialog','directory','document',
         'feed','figure','group','heading','img','list','listitem','math','none','note',
         'paragraph','presentation','row','rowgroup','rowheader','separator',
         'table','term','toolbar','tooltip','tablist','tabpanel','treegrid',
         'tree','grid','gridcell'],
}

const ARIA_PROPS = [
  'aria-pressed','aria-checked','aria-expanded','aria-selected',
  'aria-disabled','aria-hidden','aria-required','aria-invalid',
  'aria-current','aria-busy','aria-live','aria-atomic',
  'aria-haspopup','aria-modal','aria-multiselectable',
  'aria-orientation','aria-valuenow','aria-valuemin',
  'aria-valuemax','aria-valuetext','aria-level',
  'aria-sort','aria-readonly','aria-autocomplete',
  'aria-posinset','aria-setsize','aria-rowcount','aria-colcount',
]

// ── Pure functions ─────────────────────────────────────────────────────────────

export function getRoleCat(role: string, src: string): RoleCategory {
  if (src === 'explicit') return 'exp'
  for (const [c, rs] of Object.entries(CAT)) {
    if (rs.includes(role)) return c as RoleCategory
  }
  return 'none'
}

function getNativeRole(el: Element): RoleInfo {
  const tag = el.tagName.toLowerCase()
  if (SKIP_TAGS.has(tag)) return { role: null, source: 'none' }

  const explicit = (el.getAttribute('role') || '').trim().split(/\s+/)[0]
  if (explicit) return { role: explicit, source: 'explicit' }

  const type     = (el.getAttribute('type') || 'text').toLowerCase()
  const href     = el.hasAttribute('href')
  const alt      = el.getAttribute('alt')
  const multiple = el.hasAttribute('multiple')
  const hasName  = !!(el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'))

  let role: string | null = null
  switch (tag) {
    case 'a':        role = href ? 'link' : null; break
    case 'area':     role = href ? 'link' : null; break
    case 'article':  role = 'article'; break
    case 'aside':    role = 'complementary'; break
    case 'button':   role = 'button'; break
    case 'datalist': role = 'listbox'; break
    case 'dd':       role = 'definition'; break
    case 'details':  role = 'group'; break
    case 'dfn':      role = 'term'; break
    case 'dialog':   role = 'dialog'; break
    case 'dt':       role = 'term'; break
    case 'fieldset': role = 'group'; break
    case 'figure':   role = 'figure'; break
    case 'footer':   role = 'contentinfo'; break
    case 'form':     role = hasName ? 'form' : null; break
    case 'h1': case 'h2': case 'h3':
    case 'h4': case 'h5': case 'h6': role = 'heading'; break
    case 'header':   role = 'banner'; break
    case 'hr':       role = 'separator'; break
    case 'img':      role = (alt === '') ? 'presentation' : 'img'; break
    case 'input': {
      if (type === 'hidden') return { role: null, source: 'none' }
      const m: Record<string, string> = {
        checkbox: 'checkbox', radio: 'radio', range: 'slider',
        number: 'spinbutton', search: 'searchbox',
        submit: 'button', button: 'button', reset: 'button', image: 'button',
      }
      role = m[type] ?? 'textbox'
      break
    }
    case 'li':       role = 'listitem'; break
    case 'main':     role = 'main'; break
    case 'math':     role = 'math'; break
    case 'menu':     role = 'list'; break
    case 'meter':    role = 'meter'; break
    case 'nav':      role = 'navigation'; break
    case 'ol':       role = 'list'; break
    case 'optgroup': role = 'group'; break
    case 'option':   role = 'option'; break
    case 'output':   role = 'status'; break
    case 'p':        role = 'paragraph'; break
    case 'progress': role = 'progressbar'; break
    case 'section':  role = hasName ? 'region' : null; break
    case 'select':   role = multiple ? 'listbox' : 'combobox'; break
    case 'summary':  role = 'button'; break
    case 'table':    role = 'table'; break
    case 'tbody':
    case 'thead':
    case 'tfoot':    role = 'rowgroup'; break
    case 'td':       role = 'cell'; break
    case 'textarea': role = 'textbox'; break
    case 'th': {
      const scope = el.getAttribute('scope')
      role = scope === 'row' ? 'rowheader' : 'columnheader'
      break
    }
    case 'tr':  role = 'row'; break
    case 'ul':  role = 'list'; break
    default:    role = null
  }

  return { role, source: role ? 'native' : 'none' }
}

function getAccName(el: Element, doc: Document): NameInfo {
  const tag = el.tagName.toLowerCase()

  const lby = el.getAttribute('aria-labelledby')
  if (lby) {
    const parts = lby.trim().split(/\s+/)
      .map(id => doc.getElementById(id)?.textContent?.trim())
      .filter((p): p is string => !!p)
    if (parts.length) return { name: parts.join(' '), src: 'aria-labelledby' }
  }

  const al = el.getAttribute('aria-label')
  if (al?.trim()) return { name: al.trim(), src: 'aria-label' }

  if (el.id) {
    const lbl = doc.querySelector(`label[for="${CSS.escape(el.id)}"]`)
    if (lbl) return { name: lbl.textContent!.trim(), src: 'label[for]' }
  }

  const pLabel = el.closest('label')
  if (pLabel) {
    const clone = pLabel.cloneNode(true) as Element
    clone.querySelectorAll('input,select,textarea').forEach(e => e.remove())
    const t = clone.textContent?.trim()
    if (t) return { name: t, src: '<label>' }
  }

  if (tag === 'img') {
    const altv = el.getAttribute('alt')
    if (altv !== null) return { name: altv, src: 'alt' }
  }

  if (tag === 'input') {
    const v = el.getAttribute('value')
    if (v) return { name: v, src: 'value' }
    const ph = el.getAttribute('placeholder')
    if (ph) return { name: ph, src: 'placeholder' }
  }

  const title = el.getAttribute('title')
  if (title?.trim()) return { name: title.trim(), src: 'title' }

  const text = el.textContent?.trim().replace(/\s+/g, ' ') ?? ''
  if (text) return { name: text.length > 60 ? text.slice(0, 57) + '…' : text, src: 'text' }

  return { name: '', src: 'none' }
}

function getStates(el: Element): States {
  const s: States = {}
  for (const attr of ARIA_PROPS) {
    const v = el.getAttribute(attr)
    if (v !== null) s[attr.replace('aria-', '')] = v
  }
  const tag = el.tagName.toLowerCase()
  if (el.hasAttribute('disabled')) s.disabled = 'true'
  if (el.hasAttribute('required')) s.required = 'true'
  if (el.hasAttribute('readonly')) s.readonly = 'true'
  if (tag === 'input') {
    const t = el.getAttribute('type')
    if ((t === 'checkbox' || t === 'radio') && el.hasAttribute('checked'))
      s.checked = 'true'
  }
  const hm = tag.match(/^h([1-6])$/)
  if (hm && !s.level) s.level = hm[1]
  return s
}

function getWarnings(el: Element, roleInfo: RoleInfo, nameInfo: NameInfo): string[] {
  const warns: string[] = []
  const tag = el.tagName.toLowerCase()
  const role = roleInfo.role

  if (tag === 'img' && el.getAttribute('alt') === null)
    warns.push('⚠ Kein alt-Attribut')

  const interactive = ['button','link','checkbox','radio','textbox','combobox','slider','spinbutton','searchbox']
  if (role && interactive.includes(role) && !nameInfo.name)
    warns.push('⚠ Kein barrierefreier Name')

  const divlike = new Set(['div','span','p','li','td','th'])
  if (divlike.has(tag) && roleInfo.source === 'explicit') {
    const interactiveRoles = ['button','link','checkbox','radio','option','tab','menuitem','treeitem']
    if (role && interactiveRoles.includes(role) && !el.hasAttribute('tabindex'))
      warns.push('⚠ tabindex fehlt')
  }

  if (tag === 'table' && !el.querySelector('th'))
    warns.push('⚠ Keine <th>-Elemente')

  return warns
}

function getAttrs(el: Element, tag: string): AttrPair[] {
  const attrs: AttrPair[] = []
  const add = (name: string, val: string) => attrs.push({ name, val })

  if (el.id) add('id', `"${el.id}"`)
  const role = el.getAttribute('role')
  if (role) add('role', `"${role}"`)
  const ariaLabel = el.getAttribute('aria-label')
  if (ariaLabel) {
    const truncated = ariaLabel.length > 25 ? ariaLabel.slice(0, 25) + '…' : ariaLabel
    add('aria-label', `"${truncated}"`)
  }
  const ariaLby = el.getAttribute('aria-labelledby')
  if (ariaLby) add('aria-labelledby', `"${ariaLby}"`)
  if (tag === 'input') {
    const t = el.getAttribute('type')
    if (t) add('type', `"${t}"`)
  }
  if (el.hasAttribute('href')) add('href', '"…"')
  const ariaHidden = el.getAttribute('aria-hidden')
  if (ariaHidden) add('aria-hidden', `"${ariaHidden}"`)

  return attrs
}

function buildNode(el: Element, doc: Document): A11yNode | null {
  if (el.nodeType !== 1) return null
  const tag = el.tagName.toLowerCase()
  if (SKIP_TAGS.has(tag)) return null

  const roleInfo = getNativeRole(el)
  const nameInfo = getAccName(el, doc)
  const states   = getStates(el)
  const warns    = getWarnings(el, roleInfo, nameInfo)
  const attrs    = getAttrs(el, tag)

  const children: A11yNode[] = []
  for (const child of el.childNodes) {
    if (child.nodeType !== 1) continue
    const n = buildNode(child as Element, doc)
    if (n) children.push(n)
  }

  return { tag, roleInfo, nameInfo, states, warns, children, attrs }
}

export function buildTree(html: string): A11yNode[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const nodes: A11yNode[] = []
  for (const child of doc.body.childNodes) {
    if (child.nodeType !== 1) continue
    const node = buildNode(child as Element, doc)
    if (node) nodes.push(node)
  }
  return nodes
}

// ── Composable ─────────────────────────────────────────────────────────────────

export function useA11yTree(html: Ref<string>) {
  const nodes = computed<A11yNode[]>(() => {
    if (typeof DOMParser === 'undefined') return []
    if (!html.value.trim()) return []
    return buildTree(html.value)
  })
  return { nodes }
}
