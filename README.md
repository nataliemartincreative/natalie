# Natalie Martin

A personal portfolio for all my creative work: a simple, editorial site with
a numbered work index, project pages and an about page. Private behind a
password for now. Built with Next.js 16, React 19 and Tailwind CSS 4; every
page is static.

## Pages

| Path | What it is |
| --- | --- |
| `/` | Name, intro and the index of work |
| `/work/[slug]` | One page per project: details, text and images |
| `/about` | Bio, disciplines and contact links |
| `/enter` | Password page |

## Editing content

Everything lives in [`src/content/site.ts`](src/content/site.ts): name,
role, intro, about text, disciplines, contact links and projects. To add a
project, copy an entry in `projects` and give it a new `slug`.

Images go in `public/` (e.g. `public/work/project-one/cover.jpg`) and are
referenced as `"/work/project-one/cover.jpg"` in `cover` or `images`. Set
`aspect` (e.g. `"4 / 5"`) to match each image. Landscape (3 / 2) images run
full width on project pages; others pair up side by side. Anything without
a `src` shows an "Image to come" panel.

## Password

While `SITE_PASSWORD` is set, every page asks for it. Set it in Vercel →
Project → Settings → Environment Variables (tick Production and Preview).
Visitors stay signed in for 30 days; changing the password signs everyone
out. In production the site stays locked until the password is set. Search
engines are asked not to index it.

To make the site public later, delete `src/proxy.ts` and the `robots`
settings in `src/app/layout.tsx` and `src/app/robots.ts`.

## Development

```bash
npm install
SITE_PASSWORD=choose-one npm run dev   # or leave it unset to skip the password locally
npm run lint
npm run build
```

Fonts (Instrument Serif, Inter) are self-hosted from `src/fonts` under the
SIL Open Font License.
