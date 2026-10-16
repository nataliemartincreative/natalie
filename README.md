# Natalie's Favorite Website Ever

A yellow, Helvetica-set dashboard built with Next.js 16 (App Router, React 19,
Tailwind CSS 4, TypeScript). A cinematic intro plays once per browser session.

## Pages

- **Home**: `/`
- **Projects**: `/projects`. A spreadsheet-style list of projects. Add one with
  **New project**, or bring in a spreadsheet with **Import** or by dragging an
  XLS/XLSX/CSV file onto the page. Each row becomes a project.
- **Project**: `/projects/[id]`. Status, UPC-A barcode (with SVG download) and
  every imported column as details.
- **Brand**: `/brands/[slug]`. The brand's logo, colors and fonts (read from
  its website) and all of its projects.
- **Purchase orders**: `/purchase-orders`. One per imported factory sheet; the
  sheet's header block (factory, quote date, PO #…) becomes the purchase order.

### New brands

When an import introduces a brand the app hasn't seen, it searches the web for
every brand using that name (Claude with web search, `/api/brands/research`)
and asks you to pick the right one, or paste its website. The chosen site is
read for its logo, colors and fonts (`/api/brands/elements`). Research needs
`ANTHROPIC_API_KEY`; pasting a website works without it.

### How imports map columns

The first sheet is read in the browser. Plain tables (header in the first row)
and vendor forms (a header block, then a one- or two-row table header, then
products and a totals row) both work. Values are kept exactly as Excel shows
them. The style number is the project's ID, so re-importing an updated sheet
updates projects instead of duplicating them. Columns are matched by header:

| Field   | Headers it looks for                                    |
| ------- | ------------------------------------------------------- |
| Style # | Style Number, Style, SKU, Item Number, Model            |
| Brand   | Label Brand, Brand Name, Brand                          |
| Name    | Description (long), Product Name, Name, Title, ...      |
| Barcode | UPC-A, UPC, UPC Code, Barcode, GTIN, EAN                |
| Status  | Status, Stage                                           |

Unit size L/W/H columns in cm and inches become the project's dimensions.
Every other column is saved on the project as a detail. Barcodes that Excel
stored as numbers get their leading zeros restored.

Projects, purchase orders and brands are stored in the browser (localStorage,
with dieline files in IndexedDB) for now. See
`src/lib/projects.ts` to move them to a database.

## Barcode API

`GET /api/barcode?code=03600029145` returns a UPC-A barcode as SVG, generated
with [bwip-js](https://github.com/metafloor/bwip-js). Pass 11 digits to have the
check digit added, or 12 to have it verified. Add `&download=1` to download it.

## Environment variables

See `.env.example`. Set them in Vercel → Project → Settings → Environment
Variables, or in `.env.local` for local development.

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```
