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
- **Brand**: `/brands/[slug]`. All projects for one brand.

### How imports map columns

The first sheet is read in the browser; the first row is the header. Columns
are matched by header name:

| Field   | Headers it looks for                                    |
| ------- | ------------------------------------------------------- |
| Brand   | Label Brand, Brand Name, Brand, Label                   |
| Name    | Product Name, Project Name, Item Name, Name, Title, ... |
| Barcode | UPC-A, UPC, UPC Code, Barcode, GTIN, EAN                |
| Status  | Status, Stage                                           |

Every other column is saved on the project as a detail. Barcodes that Excel
stored as numbers get their leading zeros restored.

Projects are stored in the browser (localStorage) for now. See
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
