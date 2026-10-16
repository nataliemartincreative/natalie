/** Shared between the dieline reading API route and the client. */

export interface DielineReading {
  index: number;
  /** Style / SKU numbers printed on the dieline. */
  styleNumbers: string[];
  /** Panel widths along the top, left to right, in centimeters. */
  panelWidthsCm: number[];
  /** Height if it is labelled, in centimeters. */
  heightCm: number | null;
}

export interface ReadDielinesRequest {
  dielines: { index: number; image: string }[];
  /** Style numbers of existing projects, to help read ambiguous digits. */
  knownStyleNumbers: string[];
}
