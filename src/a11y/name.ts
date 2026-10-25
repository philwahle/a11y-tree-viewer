import type { NameInfo } from "../types/a11y";
import { SKIP_TAGS } from "./roles";

const MAX_TEXT_NAME_LENGTH = 60;

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

/** Child elements that name their parent, e.g. <fieldset><legend>. */
const CAPTION_CHILD: Record<string, string> = {
  fieldset: "legend",
  table: "caption",
  figure: "figcaption",
};

const FORM_CONTROLS = new Set(["input", "select", "textarea"]);

export function getAccName(
  el: Element,
  doc: Document,
  role: string | null,
): NameInfo {
  const tag = el.tagName.toLowerCase();

  const lby = el.getAttribute("aria-labelledby");
  if (lby) {
    const parts = lby
      .trim()
      .split(/\s+/)
      .map((id) => doc.getElementById(id))
      .map((ref) => (ref ? textOf(ref) : ""))
      .filter(Boolean);
    if (parts.length) return { name: parts.join(" "), src: "aria-labelledby" };
  }

  const al = el.getAttribute("aria-label");
  if (al?.trim()) return { name: al.trim(), src: "aria-label" };

  if (el.id) {
    const lbl = doc.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (lbl) return { name: textOf(lbl), src: "label[for]" };
  }

  const pLabel = el.closest("label");
  if (pLabel) {
    const t = textOf(pLabel, (e) => FORM_CONTROLS.has(e.tagName.toLowerCase()));
    if (t) return { name: t, src: "<label>" };
  }

  if (tag === "img") {
    const altv = el.getAttribute("alt");
    if (altv !== null) return { name: altv, src: "alt" };
  }

  if (tag === "input") {
    const v = el.getAttribute("value");
    if (v) return { name: v, src: "value" };
    const ph = el.getAttribute("placeholder");
    if (ph) return { name: ph, src: "placeholder" };
  }

  const captionTag = CAPTION_CHILD[tag];
  if (captionTag) {
    const caption = el.querySelector(`:scope > ${captionTag}`);
    const t = caption ? textOf(caption) : "";
    if (t) return { name: t, src: `<${captionTag}>` };
  }

  const title = el.getAttribute("title");
  if (title?.trim()) return { name: title.trim(), src: "title" };

  if (role && NAME_FROM_CONTENT_ROLES.has(role)) {
    const text = textOf(el);
    if (text) return { name: truncate(text), src: "text" };
  }

  return { name: "", src: "none" };
}

/**
 * Text content as assistive technology perceives it: skips aria-hidden and
 * hidden descendants and uses the alt text of embedded images.
 */
function textOf(root: Element, exclude?: (el: Element) => boolean): string {
  const collect = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (node !== root) {
      if (SKIP_TAGS.has(tag) || exclude?.(el)) return "";
      if (el.getAttribute("aria-hidden") === "true") return "";
      if (el.hasAttribute("hidden")) return "";
      if (tag === "img") return ` ${el.getAttribute("alt") ?? ""} `;
    }
    return Array.from(el.childNodes).map(collect).join("");
  };

  return collect(root).replace(/\s+/g, " ").trim();
}

function truncate(text: string): string {
  return text.length > MAX_TEXT_NAME_LENGTH
    ? text.slice(0, MAX_TEXT_NAME_LENGTH - 3) + "…"
    : text;
}
