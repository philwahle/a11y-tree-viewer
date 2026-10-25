import type { NameInfo, RoleInfo } from "../types/a11y";

/** Roles that must have an accessible name. */
export const NAME_REQUIRED_ROLES = [
  "button",
  "link",
  "checkbox",
  "radio",
  "textbox",
  "combobox",
  "slider",
  "spinbutton",
  "searchbox",
];

/** Non-focusable tags that need tabindex once they get an interactive role. */
export const DIVLIKE_TAGS = new Set(["div", "span", "p", "li", "td", "th"]);

/** Explicit roles that imply keyboard focus. */
export const FOCUSABLE_WIDGET_ROLES = [
  "button",
  "link",
  "checkbox",
  "radio",
  "option",
  "tab",
  "menuitem",
  "treeitem",
];

export function getWarnings(
  el: Element,
  roleInfo: RoleInfo,
  nameInfo: NameInfo,
): string[] {
  const warns: string[] = [];
  const tag = el.tagName.toLowerCase();
  const role = roleInfo.role;

  if (tag === "img" && el.getAttribute("alt") === null)
    warns.push("⚠ Kein alt-Attribut");

  if (role && NAME_REQUIRED_ROLES.includes(role) && !nameInfo.name)
    warns.push("⚠ Kein barrierefreier Name");

  if (
    DIVLIKE_TAGS.has(tag) &&
    roleInfo.source === "explicit" &&
    role &&
    FOCUSABLE_WIDGET_ROLES.includes(role) &&
    !el.hasAttribute("tabindex")
  )
    warns.push("⚠ tabindex fehlt");

  if (tag === "table" && !el.querySelector("th"))
    warns.push("⚠ Keine <th>-Elemente");

  return warns;
}
