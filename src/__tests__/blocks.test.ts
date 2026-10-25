// Locks the behaviour the handed-out exercise sheet (blocks 1–5) relies on,
// including the deliberate simplifications of block 4.
import { describe, expect, it } from "vitest";
import { buildTree } from "../composables/useA11yTree";
import { byRole, byTag, find, findAll } from "./helpers";

describe("Block 1 — Rolle kommt nicht vom Aussehen", () => {
  const nodes = buildTree(`
    <a>Startseite</a>
    <a href="/">Startseite</a>
    <div onclick="kaufen()">Kaufen</div>
    <button>Kaufen</button>`);

  it("gibt <a> ohne href keine Rolle", () => {
    expect(nodes[0].roleInfo.role).toBeNull();
  });

  it("macht <a href> zum link", () => {
    expect(nodes[1].roleInfo).toEqual({ role: "link", source: "native" });
    expect(nodes[1].nameInfo.name).toBe("Startseite");
  });

  it("gibt dem klickbaren div keine Rolle", () => {
    expect(nodes[2].roleInfo.role).toBeNull();
  });

  it("macht <button> zum button", () => {
    expect(nodes[3].roleInfo.role).toBe("button");
    expect(nodes[3].nameInfo.name).toBe("Kaufen");
  });
});

describe("Block 2 — Sichtbar vs. zugänglich benannt", () => {
  const nodes = buildTree(`
    <button><span class="icon-cart" aria-hidden="true"></span></button>
    <button aria-label="Warenkorb öffnen"><span class="icon-cart" aria-hidden="true"></span></button>
    <label for="email">E-Mail</label>
    <input id="email" type="email">
    <label>Newsletter-E-Mail <input type="email"></label>
    <input type="email" placeholder="E-Mail-Adresse">`);
  const [iconOnly, labelled] = findAll(nodes, byTag("button"));
  const [forInput, wrappedInput, placeholderInput] = findAll(
    nodes,
    byTag("input"),
  );

  it("warnt beim Icon-Button ohne Namen", () => {
    expect(iconOnly.warns).toContain("⚠ Kein barrierefreier Name");
  });

  it("benennt den Icon-Button über aria-label", () => {
    expect(labelled.nameInfo).toEqual({
      name: "Warenkorb öffnen",
      src: "aria-label",
    });
    expect(labelled.warns).toEqual([]);
  });

  it("findet die Namensquellen der Eingabefelder", () => {
    expect(forInput.nameInfo).toEqual({ name: "E-Mail", src: "label[for]" });
    expect(wrappedInput.nameInfo).toEqual({
      name: "Newsletter-E-Mail",
      src: "<label>",
    });
    expect(placeholderInput.nameInfo).toEqual({
      name: "E-Mail-Adresse",
      src: "placeholder",
    });
  });
});

describe("Block 3 — Verschwinden aus dem Baum", () => {
  const nodes = buildTree(`
    <button aria-hidden="true">Absenden</button>
    <img src="chart.png">
    <img src="deko-linie.png" alt="">
    <img src="chart.png" alt="Umsatz steigt von Q1 zu Q4 um 40%">`);
  const [noAlt, emptyAlt, withAlt] = findAll(nodes, byTag("img"));

  it("zeigt den aria-hidden-Button weiter an, markiert ihn aber als hidden", () => {
    expect(nodes[0].roleInfo.role).toBe("button");
    expect(nodes[0].states.hidden).toBe("true");
  });

  it("warnt beim Bild ohne alt", () => {
    expect(noAlt.warns).toContain("⚠ Kein alt-Attribut");
  });

  it("macht alt=\"\" zu presentation", () => {
    expect(emptyAlt.roleInfo.role).toBe("presentation");
    expect(emptyAlt.warns).toEqual([]);
  });

  it("benennt das informative Bild über alt", () => {
    expect(withAlt.roleInfo.role).toBe("img");
    expect(withAlt.nameInfo.src).toBe("alt");
  });
});

describe("Block 4 — Der Baum ist blind für Verhalten", () => {
  const nodes = buildTree(`
    <button disabled>Bestellen</button>
    <button aria-disabled="true">Bestellen</button>
    <div disabled><span>Ich bin nicht wirklich deaktiviert</span></div>
    <fieldset disabled>
      <label>Name <input></label>
      <button>Absenden</button>
    </fieldset>`);

  it("zeigt disabled und aria-disabled identisch an", () => {
    expect(nodes[0].states.disabled).toBe("true");
    expect(nodes[1].states.disabled).toBe("true");
  });

  it("zeigt disabled auch auf dem div (bewusste Vereinfachung)", () => {
    expect(nodes[2].states.disabled).toBe("true");
  });

  it("vererbt disabled vom fieldset nicht (bewusste Vereinfachung)", () => {
    const fieldset = find(nodes, byTag("fieldset"));
    expect(fieldset.states.disabled).toBe("true");
    expect(find([fieldset], byTag("input")).states.disabled).toBeUndefined();
    expect(find([fieldset], byTag("button")).states.disabled).toBeUndefined();
  });
});

describe("Block 5 — Struktur kommt vom Tag, nicht vom Style", () => {
  const nodes = buildTree(`
    <div class="liste"><div>Milch</div><div>Brot</div></div>
    <ul><li>Milch</li><li>Brot</li></ul>
    <section><h2>Bewertungen</h2><p>4,5 von 5 Sternen</p></section>
    <section aria-label="Kundenbewertungen"><h2>Bewertungen</h2></section>
    <section aria-labelledby="h"><h2 id="h">Bewertungen</h2></section>
    <div class="hauptnavigation">Start · Produkte · Kontakt</div>
    <nav>Start · Produkte · Kontakt</nav>`);

  it("gibt der div-Liste keine Rollen", () => {
    expect(findAll([nodes[0]], (n) => n.roleInfo.role !== null)).toEqual([]);
  });

  it("macht ul/li zu list/listitem", () => {
    expect(nodes[1].roleInfo.role).toBe("list");
    expect(findAll([nodes[1]], byRole("listitem"))).toHaveLength(2);
  });

  it("macht section nur mit Namen zur region", () => {
    expect(nodes[2].roleInfo.role).toBeNull();
    expect(nodes[3].roleInfo.role).toBe("region");
    expect(nodes[4].roleInfo.role).toBe("region");
    expect(nodes[4].nameInfo).toEqual({
      name: "Bewertungen",
      src: "aria-labelledby",
    });
  });

  it("ignoriert den Klassennamen, nur <nav> wird navigation", () => {
    expect(nodes[5].roleInfo.role).toBeNull();
    expect(nodes[6].roleInfo.role).toBe("navigation");
  });

  it("gibt Überschriften ein level", () => {
    expect(find(nodes, byTag("h2")).states.level).toBe("2");
  });
});
