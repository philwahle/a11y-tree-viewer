import type { Contribution, NameTrace, SpecRef, Step } from "../types/a11y";
import { ACCNAME_STEPS, ARIA_NAME_PROHIBITED, htmlAam } from "./specs";
import {
  associatedLabels,
  clean,
  inputType,
  joinParts,
  tagOf,
  traverse,
  traverseChildren,
} from "./textAlternative";

/** Roles whose accessible name may be computed from their text content. */
export const NAME_FROM_CONTENT_ROLES = new Set([
  "button",
  "cell",
  "checkbox",
  "columnheader",
  "gridcell",
  "heading",
  "link",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "radio",
  "row",
  "rowheader",
  "switch",
  "tab",
  "term",
  "tooltip",
  "treeitem",
]);

/** ARIA 1.2, 5.2.8.6; `none` is the synonym of `presentation`. */
const NAME_PROHIBITED_ROLES = new Set([
  "caption",
  "code",
  "deletion",
  "emphasis",
  "generic",
  "insertion",
  "none",
  "paragraph",
  "presentation",
  "strong",
  "subscript",
  "superscript",
]);

/** The tree shows no role for these tags, but they map to a prohibited one. */
const PROHIBITED_ROLE_BY_TAG: Record<string, string> = {
  b: "generic",
  bdi: "generic",
  bdo: "generic",
  caption: "caption",
  code: "code",
  data: "generic",
  del: "deletion",
  div: "generic",
  em: "emphasis",
  i: "generic",
  ins: "insertion",
  small: "generic",
  span: "generic",
  strong: "strong",
  sub: "subscript",
  sup: "superscript",
  u: "generic",
};

type Kind =
  | "label"
  | "title"
  | "placeholder"
  | "ariaPlaceholder"
  | "value"
  | "defaultText"
  | "alt"
  | "legend"
  | "caption"
  | "content"
  | "figcaption"
  | "svgTitle";

interface Rule {
  ref: SpecRef;
  kinds: Kind[];
}

const AAM = {
  text: htmlAam(
    "4.1.1",
    "input-type-text-input-type-password-input-type-number-input-type-search-input-type-tel-input-type-email-input-type-url-and-textarea-elements-accessible-name-computation",
  ),
  inputButton: htmlAam(
    "4.1.2",
    "input-type-button-input-type-submit-and-input-type-reset-elements-accessible-name-computation",
  ),
  inputImage: htmlAam("4.1.3", "input-type-image-element-accessible-name-computation"),
  button: htmlAam("4.1.4", "button-element-accessible-name-computation"),
  fieldset: htmlAam("4.1.5", "fieldset-element-accessible-name-computation"),
  output: htmlAam("4.1.6", "output-element-accessible-name-computation"),
  otherForm: htmlAam("4.1.7", "other-form-elements-accessible-name-computation"),
  summary: htmlAam("4.1.8", "summary-element-accessible-name-computation"),
  figure: htmlAam("4.1.9", "figure-element-accessible-name-computation"),
  img: htmlAam("4.1.10", "el-img-name"),
  table: htmlAam("4.1.11", "table-element-accessible-name-computation"),
  cell: htmlAam("4.1.12", "tr-td-th-elements-accessible-name-computation"),
  a: htmlAam("4.1.13", "a-element-accessible-name-computation"),
  area: htmlAam("4.1.14", "area-element-accessible-name-computation"),
  iframe: htmlAam("4.1.15", "iframe-element-accessible-name-computation"),
  section: htmlAam("4.1.16", "section-and-grouping-element-accessible-name-computation"),
  text_level: htmlAam("4.1.17", "text-level-element-accessible-name-computation"),
};

const TEXT_LEVEL_TAGS = new Set(
  "abbr b bdi bdo cite code data del dfn em i ins kbd mark q rp rt ruby s samp small span strong sub sup time u var".split(
    " ",
  ),
);

function ruleFor(el: Element): Rule {
  const tag = tagOf(el);
  switch (tag) {
    case "textarea":
      return { ref: AAM.text, kinds: ["label", "title", "placeholder", "ariaPlaceholder"] };
    case "input": {
      const type = inputType(el);
      if (["text", "password", "number", "search", "tel", "email", "url"].includes(type))
        return { ref: AAM.text, kinds: ["label", "title", "placeholder", "ariaPlaceholder"] };
      if (["button", "submit", "reset"].includes(type))
        return { ref: AAM.inputButton, kinds: ["label", "value", "defaultText", "title"] };
      if (type === "image")
        return { ref: AAM.inputImage, kinds: ["label", "alt", "title", "defaultText"] };
      return { ref: AAM.otherForm, kinds: ["label", "title"] };
    }
    case "select":
    case "meter":
    case "progress":
      return { ref: AAM.otherForm, kinds: ["label", "title"] };
    case "button":
      return { ref: AAM.button, kinds: ["label", "content", "title"] };
    case "fieldset":
      return { ref: AAM.fieldset, kinds: ["legend", "title"] };
    case "output":
      return { ref: AAM.output, kinds: ["label", "title"] };
    case "summary":
      return { ref: AAM.summary, kinds: ["content", "title"] };
    case "figure":
      return { ref: AAM.figure, kinds: ["title"] };
    case "img":
      return { ref: AAM.img, kinds: ["alt", "title", "figcaption"] };
    case "table":
      return { ref: AAM.table, kinds: ["caption", "title"] };
    case "tr":
    case "td":
    case "th":
      return { ref: AAM.cell, kinds: ["title"] };
    case "a":
      return { ref: AAM.a, kinds: ["content", "title"] };
    case "area":
      return { ref: AAM.area, kinds: ["alt", "title"] };
    case "iframe":
      return { ref: AAM.iframe, kinds: ["title"] };
    case "svg":
      return { ref: ACCNAME_STEPS, kinds: ["svgTitle", "title"] };
    default:
      return TEXT_LEVEL_TAGS.has(tag)
        ? { ref: AAM.text_level, kinds: ["title"] }
        : { ref: AAM.section, kinds: ["title"] };
  }
}

/**
 * Host-language rule plus AccName step 2F: a role that allows name from content
 * gets it before the tooltip, and one that does not loses it.
 */
function kindsFor(rule: Rule, role: string | null): Kind[] {
  const allowed = !!role && NAME_FROM_CONTENT_ROLES.has(role);
  const kinds = rule.kinds.filter((k) => k !== "content" || allowed);
  if (!allowed || kinds.includes("content")) return kinds;
  const title = kinds.indexOf("title");
  return title < 0
    ? [...kinds, "content"]
    : [...kinds.slice(0, title), "content", ...kinds.slice(title)];
}

function prohibitedRole(el: Element, role: string | null): string | null {
  if (role) return NAME_PROHIBITED_ROLES.has(role) ? role : null;
  const tag = tagOf(el);
  if (["a", "area"].includes(tag) || ["header", "footer"].includes(tag)) return "generic";
  return PROHIBITED_ROLE_BY_TAG[tag] ?? null;
}

/** Read a source without deciding whether it wins. */
type Reading = Pick<Step, "value" | "note" | "contributions" | "status">;

const unset = (note = "nicht gesetzt"): Reading => ({ status: "unset", value: "", note });
const blank = (note = "gesetzt, aber leer"): Reading => ({ status: "empty", value: "", note });
const found = (value: string, contributions?: Contribution[], note = ""): Reading => ({
  status: "used",
  value,
  note,
  contributions,
});

function fromAttr(el: Element, attr: string): Reading {
  const raw = el.getAttribute(attr);
  if (raw === null) return unset();
  const value = clean(raw);
  return value ? found(value) : blank();
}

export function readReferences(el: Element, doc: Document, attr: string): Reading {
  const raw = el.getAttribute(attr);
  if (raw === null) return unset();
  const ids = raw.trim().split(/\s+/).filter(Boolean);
  if (!ids.length) return blank();
  const refs = ids.map((id) => ({ id, ref: doc.getElementById(id) }));
  const missing = refs.filter((r) => !r.ref).map((r) => `„${r.id}“`);
  const missingNote = missing.length
    ? `id ${missing.join(", ")} gibt es nicht`
    : "";
  const parts = refs
    .filter((r) => r.ref)
    .map((r) => traverse(r.ref!, el, doc, true));
  const value = joinParts(parts);
  if (!value) return blank(missingNote || "Verweisziel enthält keinen Text");
  return found(value, parts, missingNote);
}

function childSource(el: Element, doc: Document, selector: string, name: string): Reading {
  const child = el.querySelector(`:scope > ${selector}`);
  if (!child) return unset(`kein <${name}> vorhanden`);
  const c = traverse(child, el, doc, false);
  return c.text ? found(c.text, [c]) : blank(`<${name}> enthält keinen Text`);
}

function readKind(kind: Kind, el: Element, doc: Document): Reading & { source: string; src: string } {
  switch (kind) {
    case "label": {
      const labels = associatedLabels(el, doc);
      const src = labels[0]?.hasAttribute("for") ? "label[for]" : "<label>";
      if (!labels.length) return { ...unset("kein verknüpftes <label>"), source: "<label>", src };
      const parts = labels.map((l) => traverse(l, el, doc, false));
      const value = joinParts(parts);
      return {
        ...(value ? found(value, parts) : blank("<label> enthält keinen Text")),
        source: "<label>",
        src,
      };
    }
    case "title":
      return { ...fromAttr(el, "title"), source: "title", src: "title" };
    case "placeholder":
      return { ...fromAttr(el, "placeholder"), source: "placeholder", src: "placeholder" };
    case "ariaPlaceholder":
      return { ...fromAttr(el, "aria-placeholder"), source: "aria-placeholder", src: "aria-placeholder" };
    case "value":
      return { ...fromAttr(el, "value"), source: "value", src: "value" };
    case "defaultText":
      return { ...defaultText(el), source: "Standardtext des Browsers", src: "Browser-Standard" };
    case "alt": {
      const raw = el.getAttribute("alt");
      if (raw === null) return { ...unset(), source: "alt", src: "alt" };
      // img: an empty alt still counts and ends the search
      if (tagOf(el) === "img" && !clean(raw))
        return { ...found("", undefined, 'alt="" zählt als leerer Name'), source: "alt", src: "alt" };
      return { ...fromAttr(el, "alt"), source: "alt", src: "alt" };
    }
    case "legend":
      return { ...childSource(el, doc, "legend", "legend"), source: "<legend>", src: "<legend>" };
    case "caption":
      return { ...childSource(el, doc, "caption", "caption"), source: "<caption>", src: "<caption>" };
    case "svgTitle":
      return { ...childSource(el, doc, "title", "title"), source: "<title>", src: "<title>" };
    case "content": {
      const c = traverseChildren(el, doc);
      return {
        ...(c.text ? found(c.text, c.children) : blank("kein Text im Inhalt")),
        source: "Inhalt",
        src: "text",
      };
    }
    case "figcaption":
      return { ...figcaptionOf(el, doc), source: "<figcaption>", src: "<figcaption>" };
  }
}

/** Implementation-defined per HTML-AAM; the text varies by browser and language. */
function defaultText(el: Element): Reading {
  const type = inputType(el);
  if (type === "image")
    return found("Submit Query", undefined, "von der Spezifikation genanntes Beispiel, je nach Browser anders");
  if (el.hasAttribute("value")) return unset("nicht nötig, value ist vorhanden");
  if (type === "submit") return found("Senden", undefined, "je nach Browser und Sprache anders");
  if (type === "reset") return found("Zurücksetzen", undefined, "je nach Browser und Sprache anders");
  return unset("gibt es nur für submit und reset");
}

function figcaptionOf(el: Element, doc: Document): Reading {
  const figure = el.closest("figure");
  const caption = figure?.querySelector(":scope > figcaption");
  if (!caption) return unset("kein <figcaption> vorhanden");
  const other = Array.from(figure!.children).filter(
    (c) => c !== caption && !c.contains(el),
  );
  if (other.length) return unset("<figure> enthält weiteren Inhalt");
  const c = traverse(caption, el, doc, false);
  return c.text ? found(c.text, [c]) : blank("<figcaption> enthält keinen Text");
}

export interface ComputedName {
  name: string;
  src: string;
  trace: NameTrace;
}

export function computeName(
  el: Element,
  doc: Document,
  role: string | null,
): ComputedName {
  const rule = ruleFor(el);
  const prohibited = prohibitedRole(el, role);

  const sources: (Reading & { source: string; src: string; ref?: SpecRef })[] = [
    {
      ...readReferences(el, doc, "aria-labelledby"),
      source: "aria-labelledby",
      src: "aria-labelledby",
      ref: ACCNAME_STEPS,
    },
    {
      ...fromAttr(el, "aria-label"),
      source: "aria-label",
      src: "aria-label",
      ref: ACCNAME_STEPS,
    },
    ...kindsFor(rule, role).map((k) => readKind(k, el, doc)),
  ];

  // alt="" (used, but empty) ends the search: the tooltip is only for a missing alt
  const winner = prohibited ? -1 : sources.findIndex((s) => s.status === "used");

  const steps: Step[] = sources.map((s, i) => {
    const { source, value, note, contributions, ref, status } = s;
    const base = { source, value, note, contributions, ref };
    if (status !== "used") return { ...base, status };
    if (prohibited) return { ...base, status: "ignored", note: `Rolle ${prohibited} darf keinen Namen haben` };
    if (i === winner) return { ...base, status: "used" };
    return { ...base, status: "outranked", note: `verliert gegen ${sources[winner].source}` };
  });

  const win = winner >= 0 ? sources[winner] : null;
  return {
    name: win?.value ?? "",
    src: win?.value ? win.src : "none",
    trace: {
      rule: rule.ref,
      prohibited: prohibited
        ? { role: prohibited, ref: ARIA_NAME_PROHIBITED }
        : null,
      steps,
    },
  };
}
