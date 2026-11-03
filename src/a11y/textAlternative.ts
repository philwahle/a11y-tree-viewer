import type { Contribution } from "../types/a11y";
import { SKIP_TAGS } from "./roles";

/** Elements that can be associated with a <label>. */
const LABELABLE = new Set([
  "button",
  "input",
  "meter",
  "output",
  "progress",
  "select",
  "textarea",
]);

const TEXT_INPUT_TYPES = new Set([
  "text",
  "password",
  "number",
  "search",
  "tel",
  "email",
  "url",
]);

/**
 * Elements rendered as blocks by default. The viewer knows no CSS, so these
 * stand in for the spacing AccName adds around block-level content.
 */
const BLOCK_TAGS = new Set(
  "address article aside blockquote br dd details dialog div dl dt fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hr li main nav ol option p pre section summary table td th tr ul".split(
    " ",
  ),
);

export const tagOf = (el: Element) => el.tagName.toLowerCase();

export const inputType = (el: Element) =>
  (el.getAttribute("type") || "text").toLowerCase();

export const isTextInput = (el: Element) =>
  tagOf(el) === "textarea" ||
  (tagOf(el) === "input" && TEXT_INPUT_TYPES.has(inputType(el)));

export const clean = (text: string) => text.replace(/\s+/g, " ").trim();

function isSelfHidden(el: Element): boolean {
  if (el.hasAttribute("hidden")) return true;
  if (el.getAttribute("aria-hidden") === "true") return true;
  const style = el.getAttribute("style") ?? "";
  return /(^|;)\s*(display\s*:\s*none|visibility\s*:\s*hidden)/i.test(style);
}

function isHiddenInTree(el: Element): boolean {
  for (let n: Element | null = el; n; n = n.parentElement) {
    if (isSelfHidden(n)) return true;
  }
  return false;
}

export function associatedLabels(el: Element, doc: Document): Element[] {
  if (!LABELABLE.has(tagOf(el))) return [];
  if (tagOf(el) === "input" && inputType(el) === "hidden") return [];
  return Array.from(doc.querySelectorAll("label")).filter((label) => {
    if (label.hasAttribute("for")) return !!el.id && label.getAttribute("for") === el.id;
    return firstLabelable(label) === el;
  });
}

function firstLabelable(label: Element): Element | undefined {
  return Array.from(label.querySelectorAll("*")).find(
    (e) =>
      LABELABLE.has(tagOf(e)) &&
      !(tagOf(e) === "input" && inputType(e) === "hidden"),
  );
}

interface Traversal {
  /** The element being named: never part of its own text alternative. */
  root: Element;
  doc: Document;
  /** False inside aria-labelledby/-describedby, which are not followed twice. */
  followReferences: boolean;
  /** True if the traversal started at a hidden node (step 2A). */
  includeHidden: boolean;
}

/** Text of a node reached by aria-labelledby/-describedby or a native label. */
export function traverse(
  start: Element,
  root: Element,
  doc: Document,
  viaReference: boolean,
): Contribution {
  return visit(start, {
    root,
    doc,
    followReferences: !viaReference,
    includeHidden: isHiddenInTree(start),
  });
}

/** Text of the root's own subtree (step 2F for the element being named). */
export function traverseChildren(root: Element, doc: Document): Contribution {
  const t: Traversal = {
    root,
    doc,
    followReferences: true,
    includeHidden: false,
  };
  const children = visitChildren(root, t);
  return {
    label: `<${tagOf(root)}>`,
    via: "Inhalt",
    text: joinText(children),
    children,
  };
}

function visit(el: Element, t: Traversal): Contribution {
  const label = `<${tagOf(el)}>`;
  const leaf = (via: string, text: string): Contribution => ({
    label,
    via,
    text,
    children: [],
  });

  // 2A: hidden and not part of a traversal that started at a hidden node
  if (!t.includeHidden && isSelfHidden(el)) return leaf("ausgeblendet", "");

  // 2B: aria-labelledby, followed only once
  if (t.followReferences) {
    const refs = (el.getAttribute("aria-labelledby") ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => t.doc.getElementById(id))
      .filter((r): r is HTMLElement => !!r);
    if (refs.length) {
      const children = refs.map((r) => traverse(r, t.root, t.doc, true));
      return { label, via: "aria-labelledby", text: joinParts(children), children };
    }
  }

  // 2C: control embedded in the label of another widget contributes its value
  const embedded = embeddedValue(el);
  if (embedded) return leaf("Wert des eingebetteten Felds", embedded);

  // 2D: aria-label
  const ariaLabel = clean(el.getAttribute("aria-label") ?? "");
  if (ariaLabel) return leaf("aria-label", ariaLabel);

  // 2E: host language label
  const host = hostLabel(el, t);
  if (host) return host;

  // 2F–2H: name from content, consulted for every node in the recursion
  const children = visitChildren(el, t);
  const text = joinText(children);
  if (text) return { label, via: "Inhalt", text, children };

  // 2I: tooltip, only if nothing else provided a result
  const title = clean(el.getAttribute("title") ?? "");
  if (title) return leaf("title", title);

  return { label, via: "Inhalt", text: "", children };
}

function visitChildren(el: Element, t: Traversal): Contribution[] {
  const out: Contribution[] = [];
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const raw = node.textContent ?? "";
      if (raw.trim()) out.push({ label: "Text", via: "Text", text: raw, children: [] });
      else if (raw && out.length) out.push({ label: "", via: "Leerraum", text: " ", children: [] });
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;

    const child = node as Element;
    if (child === t.root) continue;
    const tag = tagOf(child);
    if (tag === "br") {
      out.push({ label: "", via: "Leerraum", text: " ", children: [] });
      continue;
    }
    if (SKIP_TAGS.has(tag)) continue;

    const c = visit(child, t);
    out.push(
      BLOCK_TAGS.has(tag) || tag === "img"
        ? { ...c, spaced: true }
        : c,
    );
  }
  return out;
}

function embeddedValue(el: Element): string {
  const tag = tagOf(el);
  if (isTextInput(el)) {
    const raw = tag === "textarea" ? el.textContent : el.getAttribute("value");
    return clean(raw ?? "");
  }
  if (tag === "select") {
    const options = Array.from(el.querySelectorAll("option"));
    const selected = options.filter((o) => o.hasAttribute("selected"));
    const chosen = selected.length
      ? selected
      : el.hasAttribute("multiple")
        ? []
        : options.slice(0, 1);
    return chosen.map((o) => clean(o.textContent ?? "")).join(" ");
  }
  const role = el.getAttribute("role");
  const isRange =
    (tag === "input" && inputType(el) === "range") ||
    ["slider", "spinbutton", "progressbar", "scrollbar", "meter"].includes(role ?? "");
  if (isRange) {
    return clean(
      el.getAttribute("aria-valuetext") ??
        el.getAttribute("aria-valuenow") ??
        el.getAttribute("value") ??
        "",
    );
  }
  return "";
}

function hostLabel(el: Element, t: Traversal): Contribution | null {
  const tag = tagOf(el);
  const label = `<${tag}>`;
  const attr = (via: string, name: string): Contribution | null => {
    const v = clean(el.getAttribute(name) ?? "");
    return v ? { label, via, text: v, children: [] } : null;
  };

  if (tag === "img" || tag === "area") return attr("alt", "alt");
  if (tag === "input") {
    const type = inputType(el);
    if (type === "image") return attr("alt", "alt");
    if (["button", "submit", "reset"].includes(type)) return attr("value", "value");
  }

  const nested = (via: string, source: Element | undefined | null) => {
    if (!source) return null;
    const c = traverse(source, t.root, t.doc, false);
    return c.text ? { label, via, text: c.text, children: [c] } : null;
  };

  const labels = associatedLabels(el, t.doc);
  if (labels.length) {
    const children = labels.map((l) => traverse(l, el, t.doc, false));
    const text = joinParts(children);
    if (text) return { label, via: "<label>", text, children };
  }
  if (tag === "fieldset") return nested("<legend>", el.querySelector(":scope > legend"));
  if (tag === "table") return nested("<caption>", el.querySelector(":scope > caption"));
  if (tag === "svg") return nested("<title>", el.querySelector(":scope > title"));
  return null;
}

function joinText(parts: Contribution[]): string {
  const raw = parts
    .map((p) => (p.spaced ? ` ${p.text} ` : p.text))
    .join("");
  return clean(raw);
}

export function joinParts(parts: Contribution[]): string {
  return parts
    .map((p) => p.text)
    .filter(Boolean)
    .join(" ");
}
