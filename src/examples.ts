export type Example = {
  /** Used as URL hash, e.g. #block-4. */
  id: string;
  /** Short chip label. */
  label: string;
  title: string;
  description: string;
  group: "uebung" | "weitere" | "eigenes";
  html: string;
};

export const EXAMPLES: Example[] = [
  {
    id: "block-1",
    label: "1. Rolle",
    title: "Block 1 — Rolle kommt nicht vom Aussehen",
    description:
      "<a> ohne href und ein klickbares <div> sehen aus wie ein Link bzw. ein Button — sind es im Baum aber nicht.",
    group: "uebung",
    html: `<!-- Ohne href bekommt <a> gar keine Rolle -->
<a>Startseite</a>

<!-- Erst mit href wird daraus ein "link" -->
<a href="/">Startseite</a>

<!-- Klickbares div: keine Rolle, kein Tastaturzugriff -->
<div onclick="kaufen()">Kaufen</div>

<!-- Natives button: Rolle, Tastatur, Zustand "kostenlos" -->
<button>Kaufen</button>`,
  },
  {
    id: "block-2",
    label: "2. Name",
    title: "Block 2 — Sichtbar vs. zugänglich benannt",
    description:
      "Ein Element kann optisch komplett fertig aussehen und trotzdem keinen (oder den falschen) Namen für assistive Technologien haben.",
    group: "uebung",
    html: `<!-- Icon ohne Text: Warnung "Kein barrierefreier Name" -->
<button>
  <span class="icon-cart" aria-hidden="true"></span>
</button>

<!-- Gleiche Optik, aber mit Namen -->
<button aria-label="Warenkorb öffnen">
  <span class="icon-cart" aria-hidden="true"></span>
</button>

<!-- Label über for/id verknüpft -->
<label for="email">E-Mail</label>
<input id="email" type="email">

<!-- Label umschließt das Feld -->
<label>Newsletter-E-Mail
  <input type="email">
</label>

<!-- Nur Platzhalter: verschwindet beim Tippen, ist aber der einzige "Name" -->
<input type="email" placeholder="E-Mail-Adresse">`,
  },
  {
    id: "block-3",
    label: "3. Ausblenden",
    title: "Block 3 — Verschwinden aus dem Baum",
    description:
      "Manche Attribute entfernen ein Element komplett aus der Wahrnehmung assistiver Technologien — obwohl es visuell weiter da ist.",
    group: "uebung",
    html: `<!-- Sichtbar und klickbar, aber für AT ausgeblendet -->
<button aria-hidden="true">Absenden</button>

<!-- Kein alt-Attribut: Warnung -->
<img src="chart.png">

<!-- Dekorativ, bewusst aus dem Baum ausgeblendet -->
<img src="deko-linie.png" alt="">

<!-- Informativ, mit Textalternative -->
<img src="chart.png" alt="Umsatz steigt von Q1 zu Q4 um 40%">`,
  },
  {
    id: "block-4",
    label: "4. Zustand",
    title: "Block 4 — Der Baum ist blind für Verhalten",
    description:
      "Ob ein Element als deaktiviert gilt, steht im Baum — wie es sich tatsächlich verhält, zeigt erst die Vorschau mit Maus und Tastatur.",
    group: "uebung",
    html: `<!-- Beide zeigen im Tree "disabled: true" -->
<button disabled>Bestellen</button>
<button aria-disabled="true">Bestellen</button>

<!-- disabled auf div: HTML-spezifikationsseitig wirkungslos -->
<div disabled><span>Ich bin nicht wirklich deaktiviert</span></div>

<!-- fieldset deaktiviert alle Kinder nativ mit - der Tree zeigt es nur am fieldset selbst -->
<fieldset disabled>
  <label>Name <input></label>
  <button>Absenden</button>
</fieldset>`,
  },
  {
    id: "block-5",
    label: "5. Struktur",
    title: "Block 5 — Struktur kommt vom Tag, nicht vom Style",
    description:
      "Listen, Bereiche und Navigation können per CSS beliebig aussehen — ihre Bedeutung im Baum kommt allein vom HTML-Element.",
    group: "uebung",
    html: `<!-- Sieht identisch aus, ist im Baum aber keine Liste -->
<div class="liste">
  <div>Milch</div>
  <div>Brot</div>
</div>

<!-- Echte Liste: role "list" + "listitem" -->
<ul>
  <li>Milch</li>
  <li>Brot</li>
</ul>

<!-- section ohne Namen: keine Landmark-Rolle -->
<section>
  <h2>Bewertungen</h2>
  <p>4,5 von 5 Sternen</p>
</section>

<!-- section MIT Namen: wird zur "region"-Landmark -->
<section aria-label="Kundenbewertungen">
  <h2>Bewertungen</h2>
  <p>4,5 von 5 Sternen</p>
</section>

<!-- nav bekommt seine Rolle automatisch - unabhängig vom Klassennamen des div -->
<div class="hauptnavigation">
  <a href="/">Start</a> · <a href="/produkte">Produkte</a> · <a href="/kontakt">Kontakt</a>
</div>
<nav>
  <a href="/">Start</a> · <a href="/produkte">Produkte</a> · <a href="/kontakt">Kontakt</a>
</nav>`,
  },
  {
    id: "widget",
    label: "Eigenes Widget",
    title: "Eigenes Widget — Rolle, Fokus und Zustand selbst liefern",
    description:
      "Wer statt nativer Elemente eigene Bedienelemente baut, muss Rolle, Fokus und Zustand selbst nachrüsten — und die Tastaturbedienung noch dazu.",
    group: "weitere",
    html: `<!-- Rolle per ARIA, aber nicht per Tastatur erreichbar -->
<div role="button">Speichern</div>

<!-- Mit tabindex fokussierbar - Enter/Leertaste lösen trotzdem nichts aus -->
<div role="button" tabindex="0">Speichern</div>

<!-- Das native Original -->
<button>Speichern</button>

<!-- Umschalt-Buttons: Zustand über aria-pressed -->
<button aria-pressed="true">Fett</button>
<button aria-pressed="false">Kursiv</button>

<!-- Selbstgebauter Schalter: role="switch" + aria-checked -->
<span role="switch" aria-checked="false" tabindex="0">Dunkelmodus</span>`,
  },
  {
    id: "seitengeruest",
    label: "Seitengerüst",
    title: "Seitengerüst — Landmarks und Überschriften",
    description:
      "Landmarks und Überschriften bilden das Inhaltsverzeichnis, mit dem Screenreader-Nutzer:innen durch eine Seite springen.",
    group: "weitere",
    html: `<header>
  <a href="/"><img src="logo.svg" alt="Musterladen – Startseite"></a>
  <nav aria-label="Hauptnavigation">
    <ul>
      <li><a href="/" aria-current="page">Start</a></li>
      <li><a href="/produkte">Produkte</a></li>
      <li><a href="/kontakt">Kontakt</a></li>
    </ul>
  </nav>
</header>

<main>
  <h1>Willkommen im Musterladen</h1>

  <article>
    <!-- header/footer innerhalb von article: keine Landmarks -->
    <header>
      <h2>Neu im Sortiment</h2>
    </header>
    <p>Frisches Brot aus der Region.</p>
    <!-- Ebene übersprungen: h2 → h4 -->
    <h4>Zutaten</h4>
    <p>Mehl, Wasser, Salz.</p>
    <footer>Veröffentlicht am 1. Oktober</footer>
  </article>
</main>

<aside aria-label="Angebote">
  <h2>Angebot der Woche</h2>
</aside>

<footer>
  <p>© 2026 Musterladen</p>
</footer>`,
  },
  {
    id: "formular",
    label: "Formular",
    title: "Formular — Gruppen, Labels und Zustände",
    description:
      "Formularfelder bringen ihre Zustände mit — ausgewählt, Pflichtfeld, ungültig, aufgeklappt —, sofern sie richtig ausgezeichnet und benannt sind.",
    group: "weitere",
    html: `<form aria-label="Bestellung">
  <fieldset>
    <legend>Lieferart</legend>
    <label><input type="radio" name="lieferung" checked> Standard</label>
    <label><input type="radio" name="lieferung"> Express</label>
  </fieldset>

  <label for="mail">E-Mail</label>
  <input id="mail" type="email" required aria-invalid="true">

  <label for="land">Land</label>
  <select id="land">
    <option>Deutschland</option>
    <option>Österreich</option>
    <option>Schweiz</option>
  </select>

  <!-- Auswahlfeld ohne Label -->
  <select>
    <option>Rot</option>
    <option>Blau</option>
  </select>

  <label><input type="checkbox" checked> AGB gelesen</label>

  <details>
    <summary>Versandkosten</summary>
    <p>Ab 50 € versandkostenfrei.</p>
  </details>

  <button type="submit">Bestellen</button>
</form>`,
  },
  {
    id: "tabelle-live",
    label: "Tabelle & Live Region",
    title: "Tabelle & Live Region",
    description:
      "Tabellen brauchen Kopfzellen, damit Werte zuordenbar sind. Live Regions melden Änderungen, ohne dass der Fokus dorthin wandert.",
    group: "weitere",
    html: `<!-- Tabelle ohne Kopfzellen -->
<table>
  <tr><td>Produkt</td><td>Preis</td></tr>
  <tr><td>Milch</td><td>1,19 €</td></tr>
</table>

<!-- Mit Beschriftung, Spalten- und Zeilenköpfen -->
<table>
  <caption>Preisliste</caption>
  <thead>
    <tr><th scope="col">Produkt</th><th scope="col">Preis</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">Milch</th><td>1,19 €</td></tr>
    <tr><th scope="row">Brot</th><td>2,49 €</td></tr>
  </tbody>
</table>

<!-- Live Regions: werden vorgelesen, sobald sich ihr Inhalt ändert -->
<div role="status">3 Artikel im Warenkorb</div>
<div role="alert">Zahlung fehlgeschlagen</div>
<output>Summe: 3,68 €</output>
<progress value="70" max="100">70 %</progress>`,
  },
  {
    id: "eigenes",
    label: "Eigenes Beispiel",
    title: "Eigenes Beispiel",
    description:
      "Kopieren Sie einen HTML-Ausschnitt von einer echten Webseite in den Editor und prüfen Sie, ob Aussehen und Baum zusammenpassen.",
    group: "eigenes",
    // Three trailing empty lines give room to click into and paste
    html: `<!-- Fügen Sie hier einen Schnipsel von einer echten Webseite ein  -->\n\n\n`,
  },
];

export const DEFAULT_EXAMPLE_ID = EXAMPLES[0].id;

export function findExample(id: string): Example | undefined {
  return EXAMPLES.find((e) => e.id === id);
}
