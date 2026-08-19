# Miss Eaves — Really Amazing Font

A single-page type-specimen website for **Miss Eaves**, an original high-contrast
display typeface drawn from geometric first principles and compiled into a genuine,
installable TrueType file.

> Miss Eaves is an original design made for this project. It is *not* Emigre's
> commercial "Mrs Eaves" — the name is a playful homage; every glyph here was
> generated from scratch.

## What's here

| Path | Purpose |
|------|---------|
| `index.html` · `styles.css` · `script.js` | The website (static, no build step) |
| `fonts/MissEaves.ttf` | The typeface — real TrueType, installable & downloadable |
| `fonts/MissEaves.woff2` | Web-optimised copy used by the page |
| `tools/fontbuild.py` | Generates the typeface from geometric primitives → `.ttf` |
| `tools/specimen.py` | Renders a specimen PNG for visual QA |
| `assets/specimen.png` | Reference specimen of the full character set |

## The website

- **Splash** — the wordmark reveals letter by letter, then dissolves.
- **Specimen** — the *entire* character set (A–Z, a–z, 0–9, punctuation) on screen
  at once, snapping into place with a typewriter cascade. Hover any glyph to
  spotlight it.
- **Details** — the ampersand, true `liga` ligatures, old-style figures, and the
  stroke contrast, each in its own card.
- **Set your own words** — type anything and watch it render live, with a size slider.
- **Get the font** — a rounded, glowing *Download TTF* button. Clicking it opens a
  **theatrical** "send us $100" checkout. No card is read, no money moves, nothing
  is sent anywhere — it's a bit. On "payment" the real `.ttf` downloads.

## Rebuilding the typeface

```bash
pip install fonttools brotli pillow
python3 tools/fontbuild.py fonts/MissEaves.ttf
python3 tools/specimen.py fonts/MissEaves.ttf assets/specimen.png
```

## Running the site

It's fully static — open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```
