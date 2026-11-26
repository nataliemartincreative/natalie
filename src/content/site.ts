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
  year: string;
  disciplines: string[];
  client?: string;
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
    "Natalie is a designer specializing in packaging and the physicality of things, creating intentional, human-driven work that seeks truth and solves real problems, with AI as a tool in the process.",
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

// PLACEHOLDER projects: replace with your own work.
export const projects: Project[] = [
  {
    slug: "project-one",
    title: "Project One",
    year: "2026",
    disciplines: ["Packaging"],
    tools: ["Illustrator", "Photoshop"],
    summary: "Placeholder project. Replace with a short line about the work.",
    cover: { alt: "Project One cover", tint: "#7a3b2e" },
    body: ["Describe the brief, your approach and the outcome in a few short paragraphs."],
    images: [
      { alt: "Project One image 1", aspect: "3 / 2" },
      { alt: "Project One image 2", aspect: "4 / 5" },
      { alt: "Project One image 3", aspect: "4 / 5" },
    ],
  },
  {
    slug: "project-two",
    title: "Project Two",
    year: "2026",
    disciplines: ["Brand identity"],
    summary: "Placeholder project. Replace with a short line about the work.",
    cover: { alt: "Project Two cover", tint: "#2f4a5c" },
    body: ["Describe the brief, your approach and the outcome in a few short paragraphs."],
    images: [
      { alt: "Project Two image 1", aspect: "3 / 2" },
      { alt: "Project Two image 2", aspect: "3 / 2" },
    ],
  },
  {
    slug: "project-three",
    title: "Project Three",
    year: "2025",
    disciplines: ["Art direction"],
    summary: "Placeholder project. Replace with a short line about the work.",
    cover: { alt: "Project Three cover", tint: "#5d5a2b" },
    body: ["Describe the brief, your approach and the outcome in a few short paragraphs."],
    images: [
      { alt: "Project Three image 1", aspect: "4 / 5" },
      { alt: "Project Three image 2", aspect: "4 / 5" },
    ],
  },
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
