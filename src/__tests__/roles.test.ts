import { describe, expect, it } from "vitest";
import { buildTree } from "../a11y/tree";
import { byTag, find, findAll } from "./helpers";

describe("header/footer-Scoping", () => {
  it("macht header/footer auf oberster Ebene zu banner/contentinfo", () => {
    const nodes = buildTree(`<header>Kopf</header><footer>Fuß</footer>`);
    expect(nodes[0].roleInfo.role).toBe("banner");
    expect(nodes[1].roleInfo.role).toBe("contentinfo");
  });

  it("bleibt Landmark innerhalb eines div", () => {
    const nodes = buildTree(`<div><header>Kopf</header></div>`);
    expect(find(nodes, byTag("header")).roleInfo.role).toBe("banner");
  });

  it.each(["article", "aside", "main", "nav", "section"])(
    "ist innerhalb von <%s> keine Landmark",
    (parent) => {
      const nodes = buildTree(
        `<${parent}><div><header>Kopf</header><footer>Fuß</footer></div></${parent}>`,
      );
      expect(find(nodes, byTag("header")).roleInfo.role).toBeNull();
      expect(find(nodes, byTag("footer")).roleInfo.role).toBeNull();
    },
  );

  it("behält explizite Rollen auch innerhalb von article", () => {
    const nodes = buildTree(`<article><header role="banner">Kopf</header></article>`);
    expect(findAll(nodes, byTag("header"))[0].roleInfo).toEqual({
      role: "banner",
      source: "explicit",
    });
  });
});
