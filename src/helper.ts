import { SKIP_TAGS } from "./role.ts";

type NativeRole = {
  role: string;
  source: "explicit" | "implicit";
};

export const getNativeRole = (el: Element): NativeRole | null => {
  const tag = el.tagName.toLowerCase();

  if (SKIP_TAGS.has(tag)) {
    return null;
  }

  const explicit = (el.getAttribute("role") || "").trim().split(/\s+/)[0];
  if (explicit) {
    return {
      role: explicit,
      source: "explicit",
    };
  }

  const { type, href, alt, multiple, hasName } = getAttributesFromElement(el);

  let role: string | null = null;

  switch (tag) {
    case "a":
      role = href ? "link" : null;
      break;
    case "area":
      role = href ? "link" : null;
      break;
    case "article":
      role = "article";
      break;
    case "aside":
      role = "complementary";
      break;
    case "button":
      role = "button";
      break;
    case "datalist":
      role = "listbox";
      break;
    case "dd":
      role = "definition";
      break;
    case "details":
      role = "group";
      break;
    case "dfn":
      role = "term";
      break;
    case "dialog":
      role = "dialog";
      break;
    case "dt":
      role = "term";
      break;
    case "fieldset":
      role = "group";
      break;
    case "figure":
      role = "figure";
      break;
    case "footer":
      role = "contentinfo";
      break;
    case "form":
      role = hasName ? "form" : null;
      break;
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      role = "heading";
      break;
    case "header":
      role = "banner";
      break;
    case "hr":
      role = "separator";
      break;
    case "img":
      role = alt === "" ? "presentation" : "img";
      break;
    case "input": {
      if (type === "hidden") return null;
      const m = {
        checkbox: "checkbox",
        radio: "radio",
        range: "slider",
        number: "spinbutton",
        search: "searchbox",
        submit: "button",
        button: "button",
        reset: "button",
        image: "button",
      } satisfies Record<string, string>;
      role = m[type] || "textbox";
      break;
    }
    case "li":
      role = "listitem";
      break;
    case "main":
      role = "main";
      break;
    case "math":
      role = "math";
      break;
    case "menu":
      role = "list";
      break;
    case "meter":
      role = "meter";
      break;
    case "nav":
      role = "navigation";
      break;
    case "ol":
      role = "list";
      break;
    case "optgroup":
      role = "group";
      break;
    case "option":
      role = "option";
      break;
    case "output":
      role = "status";
      break;
    case "p":
      role = "paragraph";
      break;
    case "progress":
      role = "progressbar";
      break;
    case "section":
      role = hasName ? "region" : null;
      break;
    case "select":
      role = multiple ? "listbox" : "combobox";
      break;
    case "summary":
      role = "button";
      break;
    case "table":
      role = "table";
      break;
    case "tbody":
    case "thead":
    case "tfoot":
      role = "rowgroup";
      break;
    case "td":
      role = "cell";
      break;
    case "textarea":
      role = "textbox";
      break;
    case "th": {
      const scope = el.getAttribute("scope");
      role = scope === "row" ? "rowheader" : "columnheader";
      break;
    }
    case "tr":
      role = "row";
      break;
    case "ul":
      role = "list";
      break;
    default:
      role = null;
  }
};

const getAttributesFromElement = (el: Element) => {
  const type = (el.getAttribute("type") || "text").toLowerCase();
  const href = el.hasAttribute("href");
  const alt = el.getAttribute("alt");
  const multiple = el.hasAttribute("multiple");
  const ariaLabel = el.getAttribute("aria-label");
  const ariaLby = el.getAttribute("aria-labelledby");
  const hasName = !!(ariaLabel || ariaLby);

  return { type, href, alt, multiple, hasName };
};
