// Each preset must show what its description promises.
import { describe, expect, it } from "vitest";
import { buildTree } from "../a11y/tree";
import { EXAMPLES, findExample } from "../examples";
import { byRole, byTag, find, findAll } from "./helpers";

const treeOf = (id: string) => buildTree(findExample(id)!.html);

describe("Presets", () => {
  it("haben eindeutige ids", () => {
    const ids = EXAMPLES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("Block 5: div-Navigation enthält Links, aber keine navigation-Rolle", () => {
    const nodes = treeOf("block-5");
    const div = find(nodes, (n) => n.tag === "div" && n.children.length === 3);
    expect(div.roleInfo.role).toBeNull();
    expect(findAll([div], byRole("link"))).toHaveLength(3);
    expect(findAll(nodes, byRole("navigation"))).toHaveLength(1);
  });

  it("Eigenes Widget: tabindex-Warnung, aria-pressed und switch", () => {
    const nodes = treeOf("widget");
    const [noTabindex, withTabindex] = findAll(nodes, byTag("div"));
    expect(noTabindex.warns).toContain("⚠ tabindex fehlt");
    expect(withTabindex.warns).toEqual([]);
    expect(noTabindex.roleInfo.source).toBe("explicit");
    expect(find(nodes, (n) => n.nameInfo.name === "Fett").states.pressed).toBe(
      "true",
    );
    const sw = find(nodes, byRole("switch"));
    expect(sw.nameInfo.name).toBe("Dunkelmodus");
    expect(sw.states.checked).toBe("false");
  });

  it("Seitengerüst: genau ein banner/contentinfo, Ebenen sichtbar", () => {
    const nodes = treeOf("seitengeruest");
    expect(findAll(nodes, byRole("banner"))).toHaveLength(1);
    expect(findAll(nodes, byRole("contentinfo"))).toHaveLength(1);
    expect(find(nodes, byRole("navigation")).nameInfo.name).toBe(
      "Hauptnavigation",
    );
    expect(find(nodes, byRole("complementary")).nameInfo.name).toBe("Angebote");
    expect(find(nodes, byRole("main"))).toBeDefined();
    expect(find(nodes, byTag("h4")).states.level).toBe("4");
    expect(
      find(nodes, (n) => n.attrs.some((a) => a.name === "href") && !!n.states.current)
        .states.current,
    ).toBe("page");
  });

  it("Formular: legend, Zustände und select ohne Label", () => {
    const nodes = treeOf("formular");
    expect(find(nodes, byRole("form")).nameInfo.name).toBe("Bestellung");
    expect(find(nodes, byTag("fieldset")).nameInfo).toEqual({
      name: "Lieferart",
      src: "<legend>",
    });
    const [standard] = findAll(nodes, byRole("radio"));
    expect(standard.nameInfo.name).toBe("Standard");
    expect(standard.states.checked).toBe("true");
    const mail = find(nodes, (n) => n.nameInfo.name === "E-Mail" && n.tag === "input");
    expect(mail.states).toMatchObject({ required: "true", invalid: "true" });
    const [land, unlabelled] = findAll(nodes, byRole("combobox"));
    expect(land.nameInfo.name).toBe("Land");
    expect(unlabelled.warns).toContain("⚠ Kein barrierefreier Name");
    expect(find(nodes, byRole("checkbox")).states.checked).toBe("true");
    expect(find(nodes, byTag("summary")).states.expanded).toBe("false");
  });

  it("Tabelle & Live Region: th-Warnung, caption, rowheader, Live Regions", () => {
    const nodes = treeOf("tabelle-live");
    const [plain, proper] = findAll(nodes, byTag("table"));
    expect(plain.warns).toContain("⚠ Keine <th>-Elemente");
    expect(proper.warns).toEqual([]);
    expect(proper.nameInfo.name).toBe("Preisliste");
    expect(findAll([proper], byRole("rowheader"))).toHaveLength(2);
    expect(findAll([proper], byRole("columnheader"))).toHaveLength(2);
    expect(find(nodes, byRole("status")).roleInfo.source).toBe("explicit");
    expect(find(nodes, byRole("alert"))).toBeDefined();
    expect(find(nodes, byTag("output")).roleInfo).toEqual({
      role: "status",
      source: "native",
    });
    expect(find(nodes, byTag("progress")).roleInfo.role).toBe("progressbar");
  });
});
