import type { A11yNode, AttrPair } from "../types/a11y";
import { computeName } from "./name";
import { getNativeRole, SKIP_TAGS } from "./roles";
import { getStates } from "./states";
import { getWarnings } from "./warnings";

const MAX_ATTR_LABEL_LENGTH = 25;

function getAttrs(el: Element, tag: string): AttrPair[] {
  const attrs: AttrPair[] = [];
  const add = (name: string, val: string) => attrs.push({ name, val });

  if (el.id) add("id", `"${el.id}"`);
  const role = el.getAttribute("role");
  if (role) add("role", `"${role}"`);
  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel) {
    const truncated =
      ariaLabel.length > MAX_ATTR_LABEL_LENGTH
        ? ariaLabel.slice(0, MAX_ATTR_LABEL_LENGTH) + "…"
        : ariaLabel;
    add("aria-label", `"${truncated}"`);
  }
  const ariaLby = el.getAttribute("aria-labelledby");
  if (ariaLby) add("aria-labelledby", `"${ariaLby}"`);
  if (tag === "input") {
    const t = el.getAttribute("type");
    if (t) add("type", `"${t}"`);
  }
  if (el.hasAttribute("href")) add("href", '"…"');
  const ariaHidden = el.getAttribute("aria-hidden");
  if (ariaHidden) add("aria-hidden", `"${ariaHidden}"`);

  return attrs;
}

function buildNode(el: Element, doc: Document): A11yNode | null {
  const tag = el.tagName.toLowerCase();
  if (SKIP_TAGS.has(tag)) return null;

  const roleInfo = getNativeRole(el);
  const { name, src, trace: nameTrace } = computeName(el, doc, roleInfo.role);
  const nameInfo = { name, src };
  const states = getStates(el);
  const warns = getWarnings(el, roleInfo, nameInfo);
  const attrs = getAttrs(el, tag);
  const children = buildChildren(el, doc);

  return { tag, roleInfo, nameInfo, nameTrace, states, warns, children, attrs };
}

function buildChildren(parent: Element, doc: Document): A11yNode[] {
  const nodes: A11yNode[] = [];
  for (const child of parent.children) {
    const node = buildNode(child, doc);
    if (node) nodes.push(node);
  }
  return nodes;
}

export function buildTree(html: string): A11yNode[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return buildChildren(doc.body, doc);
}
