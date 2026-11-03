import type { DescInfo, NameInfo, Step } from "../types/a11y";
import { readReferences } from "./name";
import { ACCNAME_STEPS, HTML_AAM_DESCRIPTION } from "./specs";
import { clean, inputType, tagOf, traverse, traverseChildren } from "./textAlternative";

export interface ComputedDescription extends DescInfo {
  steps: Step[];
}

const NOT_USED = "nicht gesetzt";
const USED_AS_NAME = "schon als Name verwendet";

/** HTML-AAM 4.2: the first applicable source wins, sources the name used do not count. */
export function computeDescription(
  el: Element,
  doc: Document,
  name: NameInfo,
): ComputedDescription {
  const steps: Step[] = [
    {
      source: "aria-describedby",
      ref: ACCNAME_STEPS,
      ...readReferences(el, doc, "aria-describedby"),
    },
    attrStep(el, "aria-description"),
    ...hostSteps(el, doc, name),
    usableUnlessName(attrStep(el, "title"), name.src === "title"),
  ];

  const winner = steps.findIndex((s) => s.status === "used");
  const resolved = steps.map((s, i): Step =>
    s.status === "used" && i !== winner
      ? { ...s, status: "outranked", note: `verliert gegen ${steps[winner].source}` }
      : s,
  );

  return {
    description: winner >= 0 ? steps[winner].value : "",
    src: winner >= 0 ? steps[winner].source : "none",
    steps: resolved,
  };
}

function attrStep(el: Element, attr: string): Step {
  const raw = el.getAttribute(attr);
  const value = clean(raw ?? "");
  return {
    source: attr,
    ref: HTML_AAM_DESCRIPTION,
    value,
    note: raw === null ? NOT_USED : value ? "" : "gesetzt, aber leer",
    status: raw === null ? "unset" : value ? "used" : "empty",
  };
}

function usableUnlessName(step: Step, usedAsName: boolean): Step {
  return usedAsName && step.status === "used"
    ? { ...step, status: "ignored", note: USED_AS_NAME }
    : step;
}

/** Native sources; they only appear as steps for the elements they apply to. */
function hostSteps(el: Element, doc: Document, name: NameInfo): Step[] {
  const tag = tagOf(el);
  const base = { ref: HTML_AAM_DESCRIPTION };

  if (tag === "table") {
    const caption = el.querySelector(":scope > caption");
    const c = caption ? traverse(caption, el, doc, false) : null;
    return [
      usableUnlessName(
        {
          ...base,
          source: "<caption>",
          value: c?.text ?? "",
          contributions: c ? [c] : undefined,
          note: c ? (c.text ? "" : "<caption> enthält keinen Text") : "kein <caption> vorhanden",
          status: !c ? "unset" : c.text ? "used" : "empty",
        },
        name.src === "<caption>",
      ),
    ];
  }

  if (tag === "summary") {
    const c = traverseChildren(el, doc);
    return [
      usableUnlessName(
        {
          ...base,
          source: "Inhalt",
          value: c.text,
          contributions: c.children,
          note: c.text ? "" : "kein Text im Inhalt",
          status: c.text ? "used" : "empty",
        },
        name.src === "text",
      ),
    ];
  }

  if (tag === "input" && ["button", "submit", "reset"].includes(inputType(el))) {
    return [usableUnlessName(attrStep(el, "value"), name.src === "value")];
  }

  return [];
}
