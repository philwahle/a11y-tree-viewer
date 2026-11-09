// Each preset must show what its description promises.
import { describe, expect, it } from "vitest";
import { buildTree } from "../a11y/tree";
import { EXAMPLES, findExample, NAME_EXAMPLES } from "../examples";
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

describe("Beispiele der Namensberechnung", () => {
  const treeFor = (id: string) =>
    buildTree(NAME_EXAMPLES.find((e) => e.id === id)!.html);

  it("haben eindeutige ids", () => {
    const ids = NAME_EXAMPLES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("title: wird Description oder Name", () => {
    const nodes = treeFor("title");
    expect(find(nodes, byTag("button")).nameInfo.name).toBe("Senden");
    expect(find(nodes, byTag("button")).descInfo.description).toContain("verbindlich");
    const [search, titled] = findAll(nodes, byTag("input"));
    expect(search.descInfo.description).toBe("Stichwort eingeben");
    expect(titled.nameInfo.src).toBe("title");
    expect(titled.descInfo.description).toBe("");
  });

  it("Rangfolge: aria-labelledby gewinnt, alle anderen verlieren", () => {
    const input = find(treeFor("rangfolge"), byTag("input"));
    expect(input.nameInfo.src).toBe("aria-labelledby");
    const outranked = input.nameTrace.steps.filter((s) => s.status === "outranked");
    expect(outranked.map((s) => s.source)).toEqual([
      "aria-label",
      "<label>",
      "title",
      "placeholder",
      "aria-placeholder",
    ]);
  });

  it("Je Element: title verliert oder gewinnt je nach Tag", () => {
    const nodes = treeFor("elemente");
    expect(find(nodes, byTag("button")).nameInfo.name).toBe("Inhalt");
    const [withAlt, noAlt] = findAll(nodes, (n) => n.tag === "img" && n.nameInfo.src !== "none");
    expect(withAlt.nameInfo.src).toBe("alt");
    expect(noAlt.nameInfo.src).toBe("title");
    expect(find(nodes, byTag("fieldset")).nameInfo.name).toBe("legend");
    expect(find(nodes, byTag("table")).nameInfo.name).toBe("caption");
    expect(find(nodes, byTag("figure")).nameInfo.src).toBe("title");
  });

  it("Kein Name erlaubt: nur die Rolle group wird benannt", () => {
    const nodes = treeFor("verboten");
    expect(nodes.map((n) => n.nameInfo.name)).toEqual(["", "", "", "Versand"]);
  });

  it("Aus dem Inhalt: Rekursion und Abstände", () => {
    const nodes = treeFor("inhalt");
    expect(nodes.map((n) => n.nameInfo.name)).toEqual([
      "Schließen",
      "Startseite öffnen",
      "Speichern",
      "Zwei Blöcke",
      "ZweiInline",
    ]);
  });

  it("Verweise: Ziele, Selbstverweis und fehlende id", () => {
    const nodes = treeFor("verweise");
    const [search, password, missing] = findAll(nodes, byTag("input"));
    expect(search.nameInfo.name).toBe("Suche");
    expect(find(nodes, byTag("button")).nameInfo.name).toBe("Löschen Bericht.pdf");
    expect(password.descInfo.description).toBe("Mindestens 12 Zeichen.");
    expect(missing.nameInfo.src).toBe("placeholder");
  });

  it("Eingebettetes Feld: Wert anderer Felder zählt, eigener nicht", () => {
    const nodes = treeFor("eingebettet");
    const [checkbox, , quantity] = findAll(nodes, byTag("input"));
    expect(checkbox.nameInfo.name).toBe("Alle 3 Tage erinnern");
    expect(quantity.nameInfo.name).toBe("Menge");
  });
});
