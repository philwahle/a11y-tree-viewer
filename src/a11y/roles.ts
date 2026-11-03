import type { RoleCategory, RoleInfo } from "../types/a11y";

/** Elements that never appear in the tree (document scaffolding, metadata). */
export const SKIP_TAGS = new Set([
  "html",
  "head",
  "body",
  "script",
  "style",
  "meta",
  "link",
  "title",
  "br",
  "wbr",
  "template",
  "noscript",
  "slot",
]);

/** Tooltip texts for role badges. */
export const ROLE_DESC: Record<string, string> = {
  banner:
    "Seitenkopf-Bereich. Einmalig pro Seite; entspricht <header> auf oberster Ebene.",
  navigation:
    "Navigationsbereich mit einer Gruppe von Links. Sollte aria-label haben bei mehreren nav-Elementen.",
  main: "Hauptinhalt der Seite. Einmalig pro Seite; Screenreader können direkt dorthin springen.",
  contentinfo:
    "Fußzeile mit Metainfos (Copyright, Links). Entspricht <footer> auf oberster Ebene.",
  complementary:
    "Ergänzender Inhalt (z.B. Sidebar), der eigenständig funktioniert.",
  region:
    "Benannter Inhaltsbereich. <section> bekommt diese Rolle NUR wenn ein accessible name vorhanden ist.",
  form: "Formular-Landmark. <form> bekommt diese Rolle NUR wenn ein accessible name vorhanden ist.",
  search: "Suchbereich der Seite.",
  button: "Auslösbares Steuerelement. Aktivierbar per Klick oder Enter/Space.",
  link: "Navigiert zu einer anderen URL oder Seite. Aktivierbar per Enter.",
  checkbox: "Zweistufige Auswahl (checked/unchecked). Aktivierbar per Space.",
  radio: "Einzelauswahl aus einer Gruppe. Aktivierbar per Pfeiltasten.",
  textbox: "Einzeiliges Texteingabefeld.",
  searchbox: "Texteingabe speziell für Suchanfragen.",
  combobox: "Kombinierte Auswahl mit Texteingabe und Vorschlagsliste.",
  listbox: "Liste auswählbarer Optionen (z.B. <select multiple>).",
  slider: "Numerischer Wert in einem Bereich via Schieberegler.",
  spinbutton: "Numerische Eingabe mit Hoch/Runter-Buttons.",
  heading: "Überschrift mit Level 1–6. Strukturiert die Seite hierarchisch.",
  list: "Geordnete oder ungeordnete Liste von Elementen.",
  listitem: "Element einer Liste.",
  article: "Eigenständiger Inhalt (z.B. Blogpost, Kommentar, Widget).",
  table: "Tabellarische Daten mit Zeilen und Spalten.",
  row: "Zeile in einer Tabelle oder einem Grid.",
  cell: "Datenzelle in einer Tabelle.",
  columnheader: 'Spaltenüberschrift (<th scope="col">).',
  rowheader: 'Zeilenüberschrift (<th scope="row">).',
  rowgroup: "Gruppe von Tabellenzeilen: <thead>, <tbody> oder <tfoot>.",
  img: "Bild mit alternativem Text (alt-Attribut).",
  presentation:
    "Dekoratives Element ohne semantischen Wert. Wird von AT-Tools ignoriert.",
  none: "Wie presentation – kein semantischer Wert.",
  group: "Gruppe zusammengehöriger Elemente (z.B. <fieldset>, <details>).",
  separator: "Visuelle oder logische Trennlinie (<hr>).",
  dialog: "Modales oder nicht-modales Dialogfenster.",
  alertdialog:
    "Dialog mit einer wichtigen Meldung, die sofortige Aufmerksamkeit erfordert.",
  alert: "Wichtige Live-Meldung, die sofort vorgelesen wird.",
  status:
    "Statusmeldung (Live Region), die vorgelesen wird sobald der User eine Pause macht.",
  progressbar: "Zeigt den Fortschritt eines Vorgangs an.",
  meter: "Messwert in einem festen Bereich (z.B. Batteriestand).",
  figure: "Abbildung, Diagramm oder Illustration mit optionaler Beschriftung.",
  paragraph: "Textabsatz.",
  term: "Begriff in einer Definition (<dt>).",
  definition: "Erklärung eines Begriffs (<dd>).",
  tab: "Einzelner Tab in einer Tab-Liste.",
  tablist: "Container für Tab-Elemente.",
  tabpanel: "Inhaltsbereich eines Tabs.",
  option: "Auswählbare Option in einer Listbox.",
  math: "Mathematischer Ausdruck.",
  tooltip: "Kontextueller Hinweis, der bei Hover/Focus erscheint.",
  log: "Live Region mit fortlaufenden Einträgen (z.B. Chat-Log).",
};

/** Legend categories a role belongs to (explicit roles are always "exp"). */
export const ROLE_CATEGORIES: Record<Exclude<RoleCategory, "exp" | "none">, string[]> = {
  land: [
    "banner",
    "complementary",
    "contentinfo",
    "form",
    "main",
    "navigation",
    "region",
    "search",
  ],
  act: [
    "button",
    "checkbox",
    "combobox",
    "link",
    "listbox",
    "menuitem",
    "menuitemcheckbox",
    "menuitemradio",
    "option",
    "radio",
    "searchbox",
    "slider",
    "spinbutton",
    "switch",
    "tab",
    "textbox",
    "treeitem",
  ],
  live: [
    "alert",
    "alertdialog",
    "log",
    "marquee",
    "progressbar",
    "status",
    "timer",
    "meter",
  ],
  str: [
    "article",
    "cell",
    "columnheader",
    "definition",
    "dialog",
    "directory",
    "document",
    "feed",
    "figure",
    "group",
    "heading",
    "img",
    "list",
    "listitem",
    "math",
    "none",
    "note",
    "paragraph",
    "presentation",
    "row",
    "rowgroup",
    "rowheader",
    "separator",
    "table",
    "term",
    "toolbar",
    "tooltip",
    "tablist",
    "tabpanel",
    "treegrid",
    "tree",
    "grid",
    "gridcell",
  ],
};

/** Implicit roles that depend on nothing but the tag name. */
const TAG_ROLES: Record<string, string> = {
  article: "article",
  aside: "complementary",
  button: "button",
  datalist: "listbox",
  dd: "definition",
  details: "group",
  dfn: "term",
  dialog: "dialog",
  dt: "term",
  fieldset: "group",
  figure: "figure",
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  h5: "heading",
  h6: "heading",
  hr: "separator",
  li: "listitem",
  main: "main",
  math: "math",
  menu: "list",
  meter: "meter",
  nav: "navigation",
  ol: "list",
  optgroup: "group",
  option: "option",
  output: "status",
  p: "paragraph",
  progress: "progressbar",
  summary: "button",
  table: "table",
  tbody: "rowgroup",
  thead: "rowgroup",
  tfoot: "rowgroup",
  td: "cell",
  textarea: "textbox",
  tr: "row",
  ul: "list",
};

/** header/footer inside these are page-section scoped and lose their landmark. */
const SECTIONING_SELECTOR = "article, aside, main, nav, section";

const INPUT_TYPE_ROLES: Record<string, string> = {
  checkbox: "checkbox",
  radio: "radio",
  range: "slider",
  number: "spinbutton",
  search: "searchbox",
  submit: "button",
  button: "button",
  reset: "button",
  image: "button",
};

export function getRoleCat(role: string, src: string): RoleCategory {
  if (src === "explicit") return "exp";
  for (const [c, rs] of Object.entries(ROLE_CATEGORIES)) {
    if (rs.includes(role)) return c as RoleCategory;
  }
  return "none";
}

export function getNativeRole(el: Element): RoleInfo {
  const tag = el.tagName.toLowerCase();
  if (SKIP_TAGS.has(tag)) return { role: null, source: "none" };

  const explicit = (el.getAttribute("role") || "").trim().split(/\s+/)[0];
  if (explicit) return { role: explicit, source: "explicit" };

  const role = getImplicitRole(el, tag);
  return { role, source: role ? "native" : "none" };
}

function getImplicitRole(el: Element, tag: string): string | null {
  const hasName = !!(
    el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")
  );

  switch (tag) {
    case "a":
    case "area":
      return el.hasAttribute("href") ? "link" : null;
    case "header":
      return el.parentElement?.closest(SECTIONING_SELECTOR) ? null : "banner";
    case "footer":
      return el.parentElement?.closest(SECTIONING_SELECTOR)
        ? null
        : "contentinfo";
    case "form":
      return hasName ? "form" : null;
    case "section":
      return hasName ? "region" : null;
    case "img":
      return el.getAttribute("alt") === "" && !hasName ? "presentation" : "img";
    case "input": {
      const type = (el.getAttribute("type") || "text").toLowerCase();
      if (type === "hidden") return null;
      return INPUT_TYPE_ROLES[type] ?? "textbox";
    }
    case "select":
      return el.hasAttribute("multiple") ? "listbox" : "combobox";
    case "th":
      return el.getAttribute("scope") === "row" ? "rowheader" : "columnheader";
    default:
      return TAG_ROLES[tag] ?? null;
  }
}
