import { describe, expect, it } from "vitest";
import { buildTree } from "../a11y/tree";
import { byTag, find } from "./helpers";

const descOf = (html: string, tag: string) =>
  find(buildTree(html), byTag(tag)).descInfo;

describe("Description", () => {
  it("macht title zur Description, wenn der Name woanders herkommt", () => {
    expect(descOf(`<button title="x">Senden</button>`, "button")).toEqual({
      description: "x",
      src: "title",
    });
    expect(descOf(`<input aria-label="Suche" title="x">`, "input").description).toBe("x");
    expect(descOf(`<a href="/" title="x">Start</a>`, "a").description).toBe("x");
  });

  it("nimmt title nicht doppelt", () => {
    const [node] = buildTree(`<input title="x">`);
    expect(node.nameInfo.name).toBe("x");
    expect(node.descInfo.description).toBe("");
    expect(node.descSteps.find((s) => s.source === "title")).toMatchObject({
      status: "ignored",
      note: "schon als Name verwendet",
    });
  });

  it("nutzt aria-describedby vor aria-description vor title", () => {
    const hint = `<p id="h">Hinweis</p>`;
    expect(
      descOf(
        `${hint}<button aria-describedby="h" aria-description="d" title="t">A</button>`,
        "button",
      ).src,
    ).toBe("aria-describedby");
    expect(descOf(`<button aria-description="d" title="t">A</button>`, "button").src).toBe(
      "aria-description",
    );
  });

  it("nimmt versteckte Verweisziele", () => {
    expect(
      descOf(`<p id="h" hidden>Hinweis</p><button aria-describedby="h">A</button>`, "button")
        .description,
    ).toBe("Hinweis");
  });

  it("macht placeholder nicht zur Description", () => {
    expect(descOf(`<input aria-label="A" placeholder="p">`, "input").description).toBe("");
  });

  it("nimmt caption, wenn aria-label die Tabelle benennt", () => {
    expect(
      descOf(`<table aria-label="A"><caption>Cap</caption></table>`, "table"),
    ).toEqual({ description: "Cap", src: "<caption>" });
  });

  it("nimmt value bei einem Button mit eigenem Namen", () => {
    expect(descOf(`<input type="submit" value="Los" aria-label="A">`, "input").description).toBe(
      "Los",
    );
    expect(descOf(`<input type="submit" value="Los">`, "input").description).toBe("");
  });

  it("nimmt den Inhalt von summary, wenn aria-label benennt", () => {
    expect(descOf(`<details><summary aria-label="A">Mehr</summary></details>`, "summary").description).toBe(
      "Mehr",
    );
  });
});
