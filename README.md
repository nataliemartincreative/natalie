# Diamond Home

A private, password-protected portfolio site for Diamond Home's retail
partners: our brands (Oasis, Alta, Clear Collective), the packaging formats
we use, and pages of our work. Built with Next.js 16, React 19 and Tailwind
CSS 4; every page is static.

## Pages

| Path | What it is |
| --- | --- |
| `/` | Diamond Home: intro, brands, branding techniques, selected work |
| `/oasis`, `/alta`, `/clear-collective` | One page per brand: story, range, packaging, work |
| `/techniques` | Packaging formats: bellyband, color sleeve, window box, insert card, 4-way band |
| `/work`, `/work/[slug]` | Pages of our work |
| `/enter` | Password page |

## Editing content

All copy, brands, products, techniques and work live in
[`src/content/portfolio.ts`](src/content/portfolio.ts). To add photos, put
them in `public/` (e.g. `public/alta/hero.jpg`) and set the matching
`hero`, `image` or `gallery` entry's `src` to `"/alta/hero.jpg"`. Anything
without a photo shows a "Photography to come" panel.

## Access

Every page sits behind one shared password. Set `SITE_PASSWORD` in Vercel →
Project → Settings → Environment Variables (tick Production and Preview).
Buyers stay signed in for 30 days; changing the password signs everyone out.
In production the site stays locked until the password is set. Search
engines are asked not to index it.

## Development

```bash
npm install
SITE_PASSWORD=choose-one npm run dev   # or leave it unset to skip the password locally
npm run lint
npm run build
```

Fonts (Instrument Serif, Inter) are self-hosted from `src/fonts` under the
SIL Open Font License.
