# Accessibility Tree Viewer

Ein interaktives Lernwerkzeug, das aus beliebigem HTML-Code den Accessibility Tree ableitet und anzeigt.

**Live-Demo:** <https://philwahle.github.io/a11y-tree-viewer/>

## Wofür?

Screenreader und andere assistive Technologien lesen nicht das DOM, sondern den **Accessibility Tree**: eine vereinfachte Darstellung der Seite mit Rollen, barrierefreien Namen und Zuständen. Was dort fehlt oder falsch ist, kommt bei Menschen mit assistiver Technik nicht an.

Der Viewer macht diesen sonst unsichtbaren Baum sichtbar. Er eignet sich für Lehre und Workshops, um zu zeigen, wie sich semantisches HTML, ARIA-Attribute und fehlende Alternativen auf die Barrierefreiheit auswirken.

## Funktionen

- **HTML-Editor** mit Syntax-Highlighting (CodeMirror)
- **Accessibility Tree** mit Rolle, barrierefreiem Name und Zuständen je Element, live aktualisiert
- **Implizite und explizite Rollen**: Native HTML-Semantik und `role`-Attribute werden unterschieden
- **Warnungen** für typische Probleme, z. B. fehlendes `alt`, fehlender barrierefreier Name, fehlendes `tabindex` oder Tabellen ohne `<th>`
- **Filter**: nur relevante Knoten oder alle Elemente anzeigen, Warnungen ein- und ausblenden
- **Legende** der Kategorien: Landmark, Interaktiv, Struktur, Live Region, Explizit
- **Drei Layouts**: vertikal gestapelt, nebeneinander oder als Tabs (die Auswahl wird gespeichert)

## Lokal starten

Voraussetzung: [Node.js](https://nodejs.org/) 22 oder neuer.

```bash
npm install
npm run dev
```

Weitere Skripte:

| Befehl            | Beschreibung                                  |
| ----------------- | --------------------------------------------- |
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
