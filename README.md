# Accessibility Tree Viewer

Ein interaktives Lernwerkzeug, das aus beliebigem HTML-Code den Accessibility Tree ableitet und anzeigt.

**Live-Demo:** <https://philwahle.github.io/a11y-tree-viewer/>

## Wofür?

Screenreader und andere assistive Technologien lesen nicht das DOM, sondern den **Accessibility Tree**: eine vereinfachte Darstellung der Seite mit Rollen, barrierefreien Namen und Zuständen. Was dort fehlt oder falsch ist, kommt bei Menschen mit assistiver Technik nicht an.

Der Viewer macht diesen sonst unsichtbaren Baum sichtbar. Er eignet sich für Lehre und Workshops, um zu zeigen, wie sich semantisches HTML, ARIA-Attribute und fehlende Alternativen auf die Barrierefreiheit auswirken.

## Funktionen

- **Beispiele** zu Rolle, Name, Ausblenden, Zustand und Struktur sowie zu eigenen Widgets, Seitengerüst, Formularen, Tabellen und Live Regions – direkt verlinkbar (z. B. `#block-4`); eigene Änderungen bleiben pro Beispiel gespeichert und lassen sich zurücksetzen
- **HTML-Editor** mit Syntax-Highlighting (CodeMirror) und optionalem Zeilenumbruch für lange Zeilen
- **Accessibility Tree** mit Rolle, barrierefreiem Name und Zuständen je Element, live aktualisiert
- **Live-Vorschau** des HTML in einem abgeschotteten iframe (ohne Skripte), um Fokus und Tastaturbedienung selbst auszuprobieren
- **Implizite und explizite Rollen**: Native HTML-Semantik und `role`-Attribute werden unterschieden
- **Warnungen** für typische Probleme, z. B. fehlendes `alt`, fehlender barrierefreier Name, fehlendes `tabindex` oder Tabellen ohne `<th>`
- **Filter**: nur relevante Knoten oder alle Elemente anzeigen, Warnungen ein- und ausblenden
- **Legende** der Kategorien: Landmark, Interaktiv, Struktur, Live Region, Explizit
- **Drei Layouts**: vertikal gestapelt, nebeneinander oder als Tabs (die Auswahl wird gespeichert)
- **Hell, dunkel oder wie das System**
- **Namensberechnung** (`name.html`): zeigt für jedes Element im Baum jede geprüfte Quelle für Name und Description, also was verwendet wurde, nicht gesetzt ist, leer ist oder verloren hat, mit Link zur passenden Regel in HTML-AAM

Name und Description folgen [AccName 1.2](https://www.w3.org/TR/accname-1.2/) und [HTML-AAM](https://www.w3.org/TR/html-aam-1.0/), nicht dem Verhalten eines bestimmten Browsers. Ein Abgleich mit Chrome 146 zeigte drei Abweichungen: Chrome behält das `aria-label` auf Rollen ohne erlaubten Namen (z. B. `div`), nimmt `figcaption` nicht als Namen eines `img` und bildet keinen Namen für `tr` aus dem Inhalt. Stylesheets, `::before`/`::after`, Shadow DOM und `aria-owns` wertet das Tool nicht aus.

Der Viewer ist ein vereinfachtes Lernmodell. Einige Vereinfachungen sind gewollt und Teil der Übung, z. B. zeigt er `disabled` auch auf einem `<div>` an und vererbt `disabled` nicht vom `<fieldset>` an enthaltene Felder.

## Lokal starten

Voraussetzung: [Node.js](https://nodejs.org/) 22 oder neuer.

```bash
npm install
npm run dev
```

Weitere Skripte:

| Befehl            | Beschreibung                                  |
| ----------------- | --------------------------------------------- |
| `npm test`        | Tests (Vitest), laufen auch vor jedem Deploy  |
| `npm run build`   | Typprüfung und Produktions-Build nach `dist/` |
| `npm run preview` | Lokale Vorschau des Produktions-Builds        |

## Deployment

Bei jedem Push auf `main` baut ein GitHub-Actions-Workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) die App und veröffentlicht sie auf GitHub Pages. Über **Actions → Deploy to GitHub Pages → Run workflow** lässt sich ein Deployment auch manuell starten.

**Eigenen Fork deployen:**

1. Repository forken
2. In den Repository-Einstellungen unter **Settings → Pages → Source** die Option **GitHub Actions** wählen
3. Auf `main` pushen oder den Workflow manuell starten

Weil Vite mit relativen Pfaden baut (`base: "./"`), funktioniert der Build unabhängig vom Namen des Repositorys.

## Tech-Stack

- [Vue 3](https://vuejs.org/) mit TypeScript
- [Vite](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [CodeMirror 6](https://codemirror.net/)
- [Lucide](https://lucide.dev/) Icons

## Lizenz

[MIT](LICENSE) © Philipp Wahle
