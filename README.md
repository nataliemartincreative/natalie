# Natalie Martin — Graphic Design Portfolio

A single-page portfolio site: a hero that cycles through project previews,
a work grid, an about section, and a contact section. Static, no build step.

## What's here

| Path | Purpose |
|------|---------|
| `index.html` · `styles.css` · `script.js` | The website |
| `img/work-01.svg` … `img/work-06.svg` | Placeholder project artwork (swap for real work) |
| `img/profile.svg` | Placeholder portrait for the About section |
| `favicon.svg` | Browser tab icon |

## Replace with your own content

Everything content-related lives in one place: the `PROJECTS` array at the
top of `script.js`. Each entry has a `title`, `category`, `year`, `img`
(path to the project image), and `blurb` (short description). Edit the
array and drop your own images into `img/` (any aspect ratio close to 4:3
works best) — the hero preview and the work grid both render from it
automatically.

Other things to personalize:

- **About section** (`index.html`) — bio copy, focus areas, and tools list.
- **Contact section** (`index.html`) — the email is already set to
  `natalie.martin.creative@gmail.com`; the Instagram / Behance / LinkedIn
  links are placeholders (`href="#"`) — point them at your real profiles.
- **`img/profile.svg`** — replace with an actual photo (e.g. `img/profile.jpg`
  and update the `<img>` tag in the About section).
- **Case study text** — the project modal currently shows the same `blurb`
  as the grid card plus a placeholder note; expand `modalBlurb` handling in
  `script.js` if you want longer, per-project case studies.

## Running the site

It's fully static — open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```
