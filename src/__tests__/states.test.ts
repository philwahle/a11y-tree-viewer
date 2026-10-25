import { describe, expect, it } from "vitest";
import { buildTree } from "../a11y/tree";
import { byTag, find } from "./helpers";

describe("details/summary", () => {
  it("zeigt expanded: false bei geschlossenem details", () => {
    const nodes = buildTree(`<details><summary>FAQ</summary><p>Antwort</p></details>`);
    expect(find(nodes, byTag("summary")).states.expanded).toBe("false");
  });

  it("zeigt expanded: true bei details[open]", () => {
    const nodes = buildTree(`<details open><summary>FAQ</summary><p>Antwort</p></details>`);
    expect(find(nodes, byTag("summary")).states.expanded).toBe("true");
  });

  it("setzt nichts bei summary außerhalb von details", () => {
    const nodes = buildTree(`<summary>FAQ</summary>`);
    expect(nodes[0].states.expanded).toBeUndefined();
  });

  it("lässt explizites aria-expanded gewinnen", () => {
    const nodes = buildTree(
      `<details><summary aria-expanded="true">FAQ</summary></details>`,
    );
    expect(find(nodes, byTag("summary")).states.expanded).toBe("true");
  });
});
