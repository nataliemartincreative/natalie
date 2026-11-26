/**
 * Everything the site shows lives here: your name, intro, about text,
 * contact links and projects. Edit this file to change any of it.
 *
 * Images go in /public (e.g. public/work/project-one/cover.jpg) and are
 * referenced by path ("/work/project-one/cover.jpg"). Leave `src` out and the
 * page shows an "Image to come" panel in its place.
 */

export interface Img {
  src?: string;
  alt: string;
  /** CSS aspect ratio, e.g. "4 / 5". Defaults to 3 / 2. */
  aspect?: string;
  caption?: string;
  /** Placeholder color shown until `src` is set. */
  tint?: string;
}

export interface Project {
  slug: string;
  title: string;
  year?: string;
  /** Shown as "Project scope". */
  disciplines: string[];
  client?: string;
  /** The studio or agency the work was done under. */
  studio?: string;
  /** Software or techniques, shown with the project details. */
  tools?: string[];
  /** One or two sentences shown under the title. */
  summary: string;
  body: string[];
  cover?: Img;
  images: Img[];
}

export interface ContactLink {
  label: string;
  href: string;
}

// PLACEHOLDER: confirm the name and role.
export const site = {
  name: "Natalie Martin",
  role: "Designer",
  /** The opening sentence on the home page. */
  statement:
    "I shape how brands are held and felt. Thoughtful packaging, honest design and practical solutions, made with intention, using AI as a tool.",
  /** Short description used for the browser tab and link previews. */
  description: "Packaging, brand identity and art direction.",
  /** The large opening lines at the top of the about text, one per line. */
  aboutOpening: ["Design is a language.", "A form of communication beyond words."],
  about: [
    "I’ve always been drawn to the power of visual communication—the way thoughtful design, typography, and physical experiences can express what words alone sometimes cannot.",
    "I’m particularly drawn to the physicality of things and the systems behind it. I enjoy creating structure from chaos and ensuring every detail serves a purpose.",
    "As industries evolve, I’ve embraced new tools that help accelerate workflows and unlock new possibilities. Ultimately, I’m driven by creating thoughtful, intentional design that connects people and brands with clarity and purpose.",
  ],
  capabilities: ["Packaging", "Brand identity", "Art direction"],
  /** e.g. { label: "Email", href: "mailto:..." }, { label: "Instagram", href: "https://instagram.com/..." } */
  contact: [] as ContactLink[],
};

export const projects: Project[] = [
  {
    slug: "beezoo",
    title: "BEEZOO",
    disciplines: ["Brand Experience", "Strategy"],
    client: "Beezoo",
    studio: "SNG GRP",
    summary:
      "A graphic identity and sustainable packaging system for Beezoo, the LA caterer that has fed the city’s production industry since 2010.",
    body: [
      "Founder Chanez Belkebir blends traditional Middle Eastern flavors with European and Asian techniques, using organic, sustainably sourced ingredients prepared fresh daily.",
      "The identity draws on her multicultural heritage and the company’s environmental commitment, carried through to plant-based utensils and biodegradable packaging that put the mission in every customer’s hands.",
    ],
    // Image files go in public/work/beezoo/ with these names; add `src` once each is there.
    cover: { alt: "Beezoo salad bowl with the BEEZOO label, seen from above", aspect: "16 / 9", tint: "#2b302d" }, // 01-salad-bowl.jpg
    images: [
      { alt: "BEEZOO wordmark with letter-spacing measurements", aspect: "16 / 9", tint: "#3a3a3a" }, // 02-wordmark.jpg
      { alt: "BEEZOO card and a wooden stamp with a round BEEZOO stamp mark", aspect: "16 / 9", tint: "#5a4a3a" }, // 03-card-and-stamp.jpg
      { alt: "Identity development pinned up on the studio wall", aspect: "3 / 2", tint: "#7a5c3a" }, // 04-process-wall.jpg
      { alt: "North Star: the restrained, minimal reference that guided the identity", aspect: "16 / 9", tint: "#4a4a4a" }, // 05-north-star.jpg
    ],
  },
  {
    slug: "kraftwerk",
    title: "Kraftwerk",
    year: "2025",
    disciplines: ["Brand Experience", "Strategy"],
    client: "Kraftwerk × Beautiful Losers",
    studio: "SNG GRP",
    summary:
      "A limited-edition skateboard collection with the art collective Beautiful Losers, marking Kraftwerk’s nine-night residency with the LA Philharmonic at Walt Disney Concert Hall.",
    body: [
      "Nine hand-lacquered decks, one for each pivotal album of the band’s catalog from 1974 to 2017, carry Kraftwerk’s Bauhaus-inspired graphics and turn skateboards into sculptural collectibles between street culture and fine art.",
      "I created the print-ready files for the concert. The collection sold only at Comme des Garçons’ Dover Street Market, in a single production run.",
    ],
    // Image files go in public/work/kraftwerk/; add `src` once each is there.
    cover: { alt: "Kraftwerk × Beautiful Losers skateboard collection", aspect: "16 / 9", tint: "#8f1d17" },
    images: [
      { alt: "The nine hand-lacquered decks", aspect: "16 / 9", tint: "#1d1d1d" },
      { alt: "Deck detail", aspect: "4 / 5", tint: "#8f1d17" },
      { alt: "Deck detail", aspect: "4 / 5", tint: "#2a2a2a" },
    ],
  },
  {
    slug: "alloy",
    title: "Alloy Arts District",
    disciplines: ["Brand Experience", "Strategy", "Placemaking"],
    client: "Carmel Partners",
    summary:
      "Naming, brand identity and public art curation for ALLOY, Carmel Partners’ mixed-use development in the Los Angeles Arts District.",
    body: [
      "From the project’s start, cultural research, audience analysis and lifestyle studies informed community engagement, the name, the identity and the public art program.",
      "Developed alongside award-winning architecture and planning teams, the place centers on a retail paseo along a preserved historic rail spur, with rooftop gardens, creative offices, ground-floor retail and a 35-story residential tower, all tied to an identity rooted in the district’s creative legacy.",
    ],
    // Image files go in public/work/alloy/; add `src` once each is there.
    cover: { alt: "ALLOY in the Los Angeles Arts District", aspect: "16 / 9", tint: "#4f555b" },
    images: [
      { alt: "ALLOY brand identity", aspect: "16 / 9", tint: "#2f3438" },
      { alt: "ALLOY detail", aspect: "4 / 5", tint: "#7a4a35" },
      { alt: "ALLOY detail", aspect: "4 / 5", tint: "#4f555b" },
    ],
  },
  // PLACEHOLDER project: replace with your own work.
  {
    slug: "project-four",
    title: "Project Four",
    year: "2025",
    disciplines: ["Packaging", "Brand identity"],
    summary: "Placeholder project. Replace with a short line about the work.",
    cover: { alt: "Project Four cover", tint: "#4a2f57" },
    body: ["Describe the brief, your approach and the outcome in a few short paragraphs."],
    images: [{ alt: "Project Four image 1", aspect: "3 / 2" }],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

/** The project after this one, wrapping around to the first. */
export function nextProject(slug: string): Project {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
}
