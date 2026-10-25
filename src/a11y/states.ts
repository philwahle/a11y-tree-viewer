import type { States } from "../types/a11y";

/** ARIA attributes shown as state badges (key without the "aria-" prefix). */
export const ARIA_STATE_ATTRS = [
  "aria-pressed",
  "aria-checked",
  "aria-expanded",
  "aria-selected",
  "aria-disabled",
  "aria-hidden",
  "aria-required",
  "aria-invalid",
  "aria-current",
  "aria-busy",
  "aria-live",
  "aria-atomic",
  "aria-haspopup",
  "aria-modal",
  "aria-multiselectable",
  "aria-orientation",
  "aria-valuenow",
  "aria-valuemin",
  "aria-valuemax",
  "aria-valuetext",
  "aria-level",
  "aria-sort",
  "aria-readonly",
  "aria-autocomplete",
  "aria-posinset",
  "aria-setsize",
  "aria-rowcount",
  "aria-colcount",
];

/** Native boolean attributes that map 1:1 to a state. */
const NATIVE_BOOLEAN_STATES = ["disabled", "required", "readonly"];

export function getStates(el: Element): States {
  const s: States = {};
  for (const attr of ARIA_STATE_ATTRS) {
    const v = el.getAttribute(attr);
    if (v !== null) s[attr.replace("aria-", "")] = v;
  }

  for (const attr of NATIVE_BOOLEAN_STATES) {
    if (el.hasAttribute(attr)) s[attr] = "true";
  }

  const tag = el.tagName.toLowerCase();
  if (tag === "input") {
    const t = el.getAttribute("type");
    if ((t === "checkbox" || t === "radio") && el.hasAttribute("checked"))
      s.checked = "true";
  }

  if (tag === "summary" && !s.expanded) {
    const details = el.parentElement;
    if (details?.tagName.toLowerCase() === "details")
      s.expanded = details.hasAttribute("open") ? "true" : "false";
  }

  const hm = tag.match(/^h([1-6])$/);
  if (hm && !s.level) s.level = hm[1];

  return s;
}
