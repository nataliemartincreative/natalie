/** Shared between the brand research API routes and the client store. */

export interface BrandCandidate {
  name: string;
  website: string;
  description: string;
  /** Why this matches, e.g. "Sells clear PET kitchen organizers". */
  evidence: string;
  confidence: "high" | "medium" | "low";
}

export interface BrandElements {
  url: string;
  siteName?: string;
  description?: string;
  logo?: string;
  icon?: string;
  image?: string;
  /** Hex colors, most prominent first. */
  colors: string[];
  fonts: string[];
  fetchedAt: string;
}

export interface ResearchRequest {
  name: string;
  /** Context from the import: categories, product names, retailer. */
  hints: string[];
}
