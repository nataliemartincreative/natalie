/**
 * Everything the site shows lives here. Edit this file to change copy, add a
 * brand, a technique or a piece of work. Images go in /public and are
 * referenced by path (e.g. "/brands/alta/hero.jpg"); leave `src` out to show a
 * "photography to come" panel instead.
 *
 * Product facts (style numbers, sizes, materials, packaging) come from the
 * factory quote sheet. Prices and order details are deliberately left out.
 */

export interface Img {
  src?: string;
  alt: string;
  /** CSS aspect ratio, e.g. "4 / 5". */
  aspect?: string;
}

export interface Size {
  l: string;
  w: string;
  h: string;
}

export interface Product {
  styleNumber: string;
  brand: BrandSlug;
  name: string;
  material: string;
  /** Unit size without packaging, exactly as on the spec sheet. */
  sizeIn: Size;
  sizeCm: Size;
  packaging: TechniqueSlug;
  image?: Img;
}

export interface Brand {
  slug: BrandSlug;
  name: string;
  tagline: string;
  intro: string[];
  categories: string[];
  /** Accent and tint used for this brand's panels and details. */
  accent: string;
  tint: string;
  hero?: Img;
}

export interface Technique {
  slug: TechniqueSlug;
  name: string;
  summary: string;
  description: string[];
  goodFor: string[];
}

export interface Work {
  slug: string;
  title: string;
  brand: BrandSlug;
  summary: string;
  body: string[];
  /** Style numbers featured in this piece of work. */
  products: string[];
  techniques: TechniqueSlug[];
  hero?: Img;
  gallery: Img[];
}

export type BrandSlug = "oasis" | "alta" | "clear-collective";
export type TechniqueSlug = "bellyband" | "color-sleeve" | "window-box" | "insert-card" | "four-way-band";

export const company = {
  name: "Diamond Home",
  eyebrow: "A house of brands",
  headline: "The brands we build, and how we bring them to shelf.",
  intro:
    "A private look at the Diamond Home portfolio for the retail partners we work with: our brands, the packaging formats behind them, and recent work.",
  confidentiality: "Prepared for Diamond Home's retail partners. Please keep this site within your team.",
};

export const brands: Brand[] = [
  {
    slug: "oasis",
    name: "Oasis",
    tagline: "Calm, simple storage for every room.",
    intro: [
      "Oasis brings quiet order to the home with simple storage pieces made to work in any room.",
      "Its first organizer pairs a clear PET body with built-in dividers, finished with a printed bellyband.",
    ],
    categories: ["Storage", "Home organization"],
    accent: "#6b7556",
    tint: "#e2e3d4",
  },
  {
    slug: "alta",
    name: "Alta",
    tagline: "Clear organization for the kitchen, pantry and fridge.",
    intro: [
      "Alta is a range of clear, stackable organizers that bring order to the places a kitchen gets busiest: the drawer, the pantry shelf and the fridge.",
      "Crystal-clear PET keeps everything inside visible at a glance, and each piece is finished with a printed bellyband that carries the brand without hiding the product.",
    ],
    categories: ["Kitchen organization", "Food storage", "Fridge", "Drawer organization"],
    accent: "#4d6b6f",
    tint: "#dde4e1",
  },
  {
    slug: "clear-collective",
    name: "Clear Collective",
    tagline: "A new brand from Diamond Home.",
    intro: ["More on Clear Collective is coming soon. Ask your Diamond Home contact for the current range."],
    categories: [],
    accent: "#5f6b78",
    tint: "#e0e3e6",
  },
];

export const products: Product[] = [
  {
    styleNumber: "101243",
    brand: "alta",
    name: "Tea Bag Organizer",
    material: "Clear PET",
    sizeIn: { l: "10.63", w: "10.63", h: "3.74" },
    sizeCm: { l: "27", w: "27", h: "9.5" },
    packaging: "bellyband",
  },
  {
    styleNumber: "101244",
    brand: "alta",
    name: "Soda Can Organizer",
    material: "Clear PET",
    sizeIn: { l: "13.98", w: "5.51", h: "3.94" },
    sizeCm: { l: "35.5", w: "14", h: "10" },
    packaging: "bellyband",
  },
  {
    styleNumber: "101245",
    brand: "alta",
    name: "Woven-Texture Soda Can Organizer",
    material: "Clear PET",
    sizeIn: { l: "13.98", w: "5.51", h: "3.94" },
    sizeCm: { l: "35.5", w: "14", h: "10" },
    packaging: "bellyband",
  },
  {
    styleNumber: "101246",
    brand: "alta",
    name: "Storage Bag Organizer Bin",
    material: "Clear PET",
    sizeIn: { l: "12.87", w: "12.05", h: "2.87" },
    sizeCm: { l: "32.7", w: "30.6", h: "7.3" },
    packaging: "bellyband",
  },
  {
    styleNumber: "101247",
    brand: "alta",
    name: "Expandable Organizer Bin",
    material: "Clear PET",
    sizeIn: { l: "14.02", w: "6.69", h: "2.95" },
    sizeCm: { l: "35.6", w: "17", h: "7.5" },
    packaging: "bellyband",
  },
  {
    styleNumber: "101248",
    brand: "alta",
    name: "Skinny Soda Can Holder",
    material: "Clear PET",
    sizeIn: { l: "9.84", w: "8.07", h: "2.95" },
    sizeCm: { l: "25", w: "20.5", h: "7.5" },
    packaging: "bellyband",
  },
  {
    styleNumber: "101249",
    brand: "alta",
    name: "Stackable Can Dispenser with Lid",
    material: "Clear PET",
    sizeIn: { l: "17.13", w: "5.91", h: "6.02" },
    sizeCm: { l: "43.5", w: "15", h: "15.3" },
    packaging: "bellyband",
  },
  {
    styleNumber: "300379",
    brand: "oasis",
    name: "Organizer with Dividers",
    material: "Clear PET",
    sizeIn: { l: "10.63", w: "10.63", h: "3.74" },
    sizeCm: { l: "27", w: "27", h: "9.5" },
    packaging: "bellyband",
  },
];

export const techniques: Technique[] = [
  {
    slug: "bellyband",
    name: "Bellyband",
    summary: "A printed band wrapped around the middle of the product.",
    description: [
      "A bellyband is a single printed paper band that wraps around the product, leaving most of it in plain view. It carries the brand, the product name, key features and the UPC in one tidy strip.",
      "Because it uses so little material, it suits products that sell themselves when seen, like clear organizers.",
    ],
    goodFor: ["Clear or visually striking products", "Lean, low-material packaging", "Stacking and nesting items"],
  },
  {
    slug: "color-sleeve",
    name: "Color sleeve",
    summary: "A full printed sleeve that slides over the product.",
    description: [
      "A color sleeve is a printed paperboard wrap that slides over the product or its tray, giving every side a graphic surface while the ends stay open.",
      "It gives more room for brand storytelling and imagery than a band, with less material than a full carton.",
    ],
    goodFor: ["Sets and multi-packs", "Products that need more shelf presence", "Lifestyle imagery and feature callouts"],
  },
  {
    slug: "window-box",
    name: "Window box",
    summary: "A folding carton with a die-cut window onto the product.",
    description: [
      "A window box protects the product in a printed carton while a die-cut window lets shoppers see exactly what they're buying.",
      "The panels around the window leave space for the full brand story, instructions and specifications.",
    ],
    goodFor: ["Fragile or giftable products", "Peg and shelf display", "Products with a story to tell"],
  },
  {
    slug: "insert-card",
    name: "Insert card",
    summary: "A printed card placed inside clear packaging.",
    description: [
      "An insert card is a printed paper card that sits inside or behind clear packaging, so the branding shows through alongside the product.",
      "It's a simple way to dress clear packs and switch artwork between retailers or seasons.",
    ],
    goodFor: ["Clear clamshells and boxes", "Retailer- or season-specific artwork", "Short runs"],
  },
  {
    slug: "four-way-band",
    name: "4-way band",
    summary: "Two bands crossing on four sides, holding a set together.",
    description: [
      "A 4-way band crosses over the product on all four sides, securing stacked or nested pieces while putting the brand on top.",
      "It keeps sets together without boxing them in.",
    ],
    goodFor: ["Stacked and nested sets", "Multi-piece bundles", "Keeping pieces visible"],
  },
];

export const work: Work[] = [
  {
    slug: "alta-clear-kitchen-organization",
    title: "Clear kitchen organization",
    brand: "alta",
    summary:
      "Seven clear PET organizers for the pantry, fridge and kitchen drawer, each finished with a printed bellyband.",
    body: [
      "The Alta kitchen range covers the everyday trouble spots: tea in the drawer, cans in the fridge, storage bags and pantry overflow. Every piece is clear PET, so what's inside is always in sight.",
      "Each organizer ships with a single printed bellyband rather than a box. The band carries the brand, the product name and the UPC, and leaves the clear body on show at shelf.",
    ],
    products: ["101243", "101244", "101245", "101246", "101247", "101248", "101249"],
    techniques: ["bellyband"],
    gallery: [
      { alt: "Alta organizers on a pantry shelf", aspect: "4 / 5" },
      { alt: "Alta bellyband detail", aspect: "4 / 5" },
    ],
  },
  {
    slug: "oasis-organizer-with-dividers",
    title: "Organizer with dividers",
    brand: "oasis",
    summary: "A clear PET organizer with built-in dividers, launched with a printed bellyband.",
    body: [
      "The first Oasis piece is a square clear organizer with built-in dividers, sized for shelves, cabinets and drawers around the home.",
      "Like Alta, it's finished with a single printed bellyband that keeps the organizer itself in view.",
    ],
    products: ["300379"],
    techniques: ["bellyband"],
    gallery: [
      { alt: "Oasis organizer in use", aspect: "4 / 5" },
      { alt: "Oasis bellyband detail", aspect: "4 / 5" },
    ],
  },
];

// Lookups --------------------------------------------------------------------

export const getBrand = (slug: string) => brands.find((b) => b.slug === slug);
export const getTechnique = (slug: string) => techniques.find((t) => t.slug === slug);
export const getWork = (slug: string) => work.find((w) => w.slug === slug);
export const productsFor = (brand: BrandSlug) => products.filter((p) => p.brand === brand);
export const workFor = (brand: BrandSlug) => work.filter((w) => w.brand === brand);
export const productsByStyle = (styles: string[]) =>
  styles.map((s) => products.find((p) => p.styleNumber === s)).filter((p): p is Product => !!p);

/** Brands that use a technique, through any of their products. */
export const brandsUsing = (technique: TechniqueSlug) =>
  brands.filter((b) => products.some((p) => p.brand === b.slug && p.packaging === technique));

export const formatSize = (s: Size, unit: string) => `${s.l} × ${s.w} × ${s.h} ${unit}`;
