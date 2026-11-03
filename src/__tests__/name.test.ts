import { describe, expect, it } from "vitest";
import { buildTree } from "../a11y/tree";
import { byTag, find, findAll } from "./helpers";

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

  it("nimmt figcaption nicht als Namen der figure (HTML-AAM 4.1.9)", () => {
    const nodes = buildTree(`
      <figure><img src="a.png" alt="Diagramm"><figcaption>Abb. 1</figcaption></figure>`);
    expect(find(nodes, byTag("figure")).nameInfo).toEqual({
      name: "",
      src: "none",
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

  describe("Rangfolge nach Spezifikation", () => {
    const nameOf = (html: string, tag: string) =>
      find(buildTree(html), byTag(tag)).nameInfo;

    it("button: Inhalt vor title", () => {
      expect(nameOf(`<button title="x">Senden</button>`, "button")).toEqual({
        name: "Senden",
        src: "text",
      });
    });

    it("button: title nur ohne Inhalt", () => {
      expect(nameOf(`<button title="x"></button>`, "button").src).toBe("title");
    });

    it("a: Inhalt vor title", () => {
      expect(nameOf(`<a href="/" title="x">Start</a>`, "a").name).toBe("Start");
    });

    it("input: value ist kein Name", () => {
      expect(nameOf(`<input value="abc">`, "input").name).toBe("");
    });

    it("input: title vor placeholder vor aria-placeholder", () => {
      expect(
        nameOf(`<input title="t" placeholder="p" aria-placeholder="a">`, "input").src,
      ).toBe("title");
      expect(
        nameOf(`<input placeholder="p" aria-placeholder="a">`, "input").src,
      ).toBe("placeholder");
      expect(nameOf(`<input aria-placeholder="a">`, "input")).toEqual({
        name: "a",
        src: "aria-placeholder",
      });
    });

    it("aria-labelledby vor aria-label vor label", () => {
      const html = `<span id="s">Ref</span><label for="i">Label</label>`;
      expect(
        nameOf(`${html}<input id="i" aria-labelledby="s" aria-label="A">`, "input").src,
      ).toBe("aria-labelledby");
      expect(nameOf(`${html}<input id="i" aria-label="A">`, "input").src).toBe(
        "aria-label",
      );
      expect(nameOf(`${html}<input id="i" title="t">`, "input").src).toBe("label[for]");
    });

    it("verbindet mehrere Labels eines Felds", () => {
      expect(
        nameOf(`<label for="i">Vor</label><label>Um <input id="i"></label>`, "input").name,
      ).toBe("Vor Um");
    });

    it("submit: value vor Standardtext vor title", () => {
      expect(nameOf(`<input type="submit" value="Los" title="t">`, "input").name).toBe("Los");
      expect(nameOf(`<input type="submit" title="t">`, "input").src).toBe("Browser-Standard");
      expect(nameOf(`<input type="button" title="t">`, "input").src).toBe("title");
    });

    it("img: title nur, wenn alt fehlt", () => {
      expect(nameOf(`<img title="t">`, "img").src).toBe("title");
      expect(nameOf(`<img alt="" title="t">`, "img").name).toBe("");
    });

    it("img: figcaption nur ohne alt und title", () => {
      expect(
        nameOf(`<figure><img src="a"><figcaption>Abb</figcaption></figure>`, "img").src,
      ).toBe("<figcaption>");
    });
  });

  describe("Rollen ohne Namen", () => {
    for (const html of [
      `<div aria-label="x"></div>`,
      `<span title="x"></span>`,
      `<p aria-label="x"></p>`,
      `<strong aria-label="x"></strong>`,
      `<div role="presentation" aria-label="x"></div>`,
      `<a aria-label="x"></a>`,
    ]) {
      it(`verbietet den Namen bei ${html}`, () => {
        const [node] = buildTree(html);
        expect(node.nameInfo.name).toBe("");
        expect(node.nameTrace.prohibited).not.toBeNull();
      });
    }

    it("erlaubt den Namen, wenn die Rolle ihn erlaubt", () => {
      expect(buildTree(`<div role="group" aria-label="x"></div>`)[0].nameInfo.name).toBe("x");
    });
  });

  describe("AccName-Schritte", () => {
    it("2F: nimmt aria-label von Kindern", () => {
      expect(
        buildTree(`<button><span aria-label="Schließen">×</span></button>`)[0].nameInfo.name,
      ).toBe("Schließen");
    });

    it("2A: nimmt versteckte Verweisziele", () => {
      const nodes = buildTree(`<span id="h" hidden>Suche</span><input aria-labelledby="h">`);
      expect(find(nodes, byTag("input")).nameInfo.name).toBe("Suche");
    });

    it("2A: überspringt versteckte Kinder sichtbarer Verweisziele", () => {
      const nodes = buildTree(
        `<div id="v">Sichtbar <span hidden>Nein</span></div><input aria-labelledby="v">`,
      );
      expect(find(nodes, byTag("input")).nameInfo.name).toBe("Sichtbar");
    });

    it("2A: erkennt Inline-Style als versteckt", () => {
      expect(
        buildTree(`<button>Ja<span style="display:none">Nein</span></button>`)[0].nameInfo.name,
      ).toBe("Ja");
    });

    it("2B: folgt aria-labelledby nur einmal", () => {
      const nodes = buildTree(
        `<span id="a" aria-labelledby="b">A</span><span id="b">B</span><input aria-labelledby="a">`,
      );
      expect(find(nodes, byTag("input")).nameInfo.name).toBe("A");
    });

    it("2B: Selbstverweis nutzt das eigene aria-label", () => {
      const nodes = buildTree(
        `<span id="d">Datei</span><button id="b" aria-label="Löschen" aria-labelledby="b d"></button>`,
      );
      expect(find(nodes, byTag("button")).nameInfo.name).toBe("Löschen Datei");
    });

    it("2C: nimmt den Wert eines eingebetteten Felds, aber nicht den eigenen", () => {
      const nodes = buildTree(
        `<input type="checkbox" id="c"><label for="c">Alle <input value="3"> Tage</label>`,
      );
      expect(findAll(nodes, byTag("input"))[0].nameInfo.name).toBe("Alle 3 Tage");
      const own = buildTree(`<label>Menge <input value="3"></label>`);
      expect(find(own, byTag("input")).nameInfo.name).toBe("Menge");
    });

    it("2C: nimmt die gewählte Option eines select", () => {
      const nodes = buildTree(
        `<input type="checkbox" id="c"><label for="c">Farbe <select><option>Rot</option><option selected>Blau</option></select></label>`,
      );
      expect(findAll(nodes, byTag("input"))[0].nameInfo.name).toBe("Farbe Blau");
    });

    it("setzt Blockelemente mit Leerzeichen, Inline-Elemente ohne", () => {
      expect(buildTree(`<button><b>A</b>B</button>`)[0].nameInfo.name).toBe("AB");
      expect(buildTree(`<button><div>A</div><div>B</div></button>`)[0].nameInfo.name).toBe("A B");
    });

    it("kürzt lange Namen nicht", () => {
      const long = "x".repeat(100);
      expect(buildTree(`<button>${long}</button>`)[0].nameInfo.name).toBe(long);
    });
  });

  describe("Begründung", () => {
    const stepsOf = (html: string) =>
      Object.fromEntries(
        buildTree(html)[0].nameTrace.steps.map((s) => [s.source, s]),
      );

    it("nennt jede geprüfte Quelle und ihren Status", () => {
      const steps = stepsOf(`<button title="x">Senden</button>`);
      expect(steps["aria-labelledby"]).toMatchObject({ status: "unset", note: "nicht gesetzt" });
      expect(steps["aria-label"].status).toBe("unset");
      expect(steps["<label>"].status).toBe("unset");
      expect(steps["Inhalt"]).toMatchObject({ status: "used", value: "Senden" });
      expect(steps["title"]).toMatchObject({ status: "outranked", value: "x" });
    });

    it("nennt fehlende Verweisziele", () => {
      const steps = stepsOf(`<input aria-labelledby="nix">`);
      expect(steps["aria-labelledby"].status).toBe("empty");
      expect(steps["aria-labelledby"].note).toContain("nix");
    });

    it("zitiert die Regel des Elements", () => {
      expect(buildTree(`<button></button>`)[0].nameTrace.rule.label).toBe("HTML-AAM 4.1.4");
      expect(buildTree(`<input>`)[0].nameTrace.rule.label).toBe("HTML-AAM 4.1.1");
      expect(buildTree(`<a href="/"></a>`)[0].nameTrace.rule.label).toBe("HTML-AAM 4.1.13");
    });

    it("markiert Quellen bei verbotenem Namen als ignoriert", () => {
      const steps = stepsOf(`<div aria-label="x"></div>`);
      expect(steps["aria-label"].status).toBe("ignored");
    });
  });
});
