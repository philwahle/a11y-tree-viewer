import type { NameInfo } from "../types/a11y";

const MAX_TEXT_NAME_LENGTH = 60;

export function getAccName(el: Element, doc: Document): NameInfo {
  const tag = el.tagName.toLowerCase();

  const lby = el.getAttribute("aria-labelledby");
  if (lby) {
    const parts = lby
      .trim()
      .split(/\s+/)
      .map((id) => doc.getElementById(id)?.textContent?.trim())
      .filter((p): p is string => !!p);
    if (parts.length) return { name: parts.join(" "), src: "aria-labelledby" };
  }

  const al = el.getAttribute("aria-label");
  if (al?.trim()) return { name: al.trim(), src: "aria-label" };

  if (el.id) {
    const lbl = doc.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (lbl) return { name: lbl.textContent!.trim(), src: "label[for]" };
  }

  const pLabel = el.closest("label");
  if (pLabel) {
    const clone = pLabel.cloneNode(true) as Element;
    clone.querySelectorAll("input,select,textarea").forEach((e) => e.remove());
    const t = clone.textContent?.trim();
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

  const title = el.getAttribute("title");
  if (title?.trim()) return { name: title.trim(), src: "title" };

  const text = el.textContent?.trim().replace(/\s+/g, " ") ?? "";
  if (text) return { name: truncate(text), src: "text" };

  return { name: "", src: "none" };
}

function truncate(text: string): string {
  return text.length > MAX_TEXT_NAME_LENGTH
    ? text.slice(0, MAX_TEXT_NAME_LENGTH - 3) + "…"
    : text;
}
