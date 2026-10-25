import { describe, expect, it } from "vitest";
import { buildTree } from "../a11y/tree";
import { byTag, find } from "./helpers";

describe("Namensberechnung", () => {
  it("benennt fieldset über legend", () => {
    const nodes = buildTree(`
      <fieldset><legend>Versand</legend><label>Straße <input></label></fieldset>`);
    expect(find(nodes, byTag("fieldset")).nameInfo).toEqual({
      name: "Versand",
      src: "<legend>",
    });
  });

  it("benennt table über caption", () => {
    const nodes = buildTree(`
      <table><caption>Umsatz 2025</caption><tr><th>Q1</th></tr></table>`);
    expect(find(nodes, byTag("table")).nameInfo).toEqual({
      name: "Umsatz 2025",
      src: "<caption>",
    });
  });

  it("benennt figure über figcaption", () => {
    const nodes = buildTree(`
      <figure><img src="a.png" alt="Diagramm"><figcaption>Abb. 1</figcaption></figure>`);
    expect(find(nodes, byTag("figure")).nameInfo).toEqual({
      name: "Abb. 1",
      src: "<figcaption>",
    });
  });

  it("ignoriert aria-hidden-Kinder im Textinhalt", () => {
    const nodes = buildTree(
      `<button><span aria-hidden="true">🛒</span> Warenkorb</button>`,
    );
    expect(nodes[0].nameInfo).toEqual({ name: "Warenkorb", src: "text" });
  });

  it("nutzt alt von eingebetteten Bildern im Textinhalt", () => {
    const nodes = buildTree(`<a href="/"><img src="logo.png" alt="Startseite"></a>`);
    expect(nodes[0].nameInfo).toEqual({ name: "Startseite", src: "text" });
  });

  it("ignoriert aria-hidden-Kinder auch im Label", () => {
    const nodes = buildTree(
      `<label for="q">Suche <span aria-hidden="true">*</span></label><input id="q">`,
    );
    expect(find(nodes, byTag("input")).nameInfo.name).toBe("Suche");
  });

  it("übernimmt keinen Textinhalt bei Rollen ohne name-from-content", () => {
    const nodes = buildTree(`
      <ul><li>Milch</li></ul>
      <nav><a href="/">Start</a></nav>
      <p>Text</p>
      <div>Text</div>`);
    for (const n of nodes) expect(n.nameInfo).toEqual({ name: "", src: "none" });
  });

  it("warnt beim select ohne Label statt die Optionen als Namen zu nehmen", () => {
    const nodes = buildTree(
      `<select><option>Rot</option><option>Blau</option></select>`,
    );
    expect(nodes[0].nameInfo.name).toBe("");
    expect(nodes[0].warns).toContain("⚠ Kein barrierefreier Name");
  });

  it("nimmt den Textinhalt weiter bei button, link, heading und cell", () => {
    const nodes = buildTree(`
      <button>Senden</button>
      <a href="/">Start</a>
      <h2>Titel</h2>
      <table><tr><th>Kopf</th><td>Zelle</td></tr></table>`);
    expect(nodes[0].nameInfo.name).toBe("Senden");
    expect(nodes[1].nameInfo.name).toBe("Start");
    expect(nodes[2].nameInfo.name).toBe("Titel");
    expect(find(nodes, byTag("th")).nameInfo.name).toBe("Kopf");
    expect(find(nodes, byTag("td")).nameInfo.name).toBe("Zelle");
  });
});
