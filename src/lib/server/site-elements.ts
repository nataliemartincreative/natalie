import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { BrandElements } from "@/lib/brand-types";

const MAX_HTML = 2_000_000;
const MAX_CSS = 600_000;
const TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Safe fetching. The URL comes from the user, so only public http(s) hosts
// are allowed, re-checked on every redirect.

function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224
    );
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith("::ffff:")) return isPrivateAddress(v6.slice(7));
  return v6 === "::1" || v6 === "::" || /^f[cd]/.test(v6) || /^fe[89ab]/.test(v6);
}

async function assertPublicUrl(url: URL) {
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only http and https links work.");
  if (url.username || url.password) throw new Error("Links with credentials aren't allowed.");
  const addresses = await lookup(url.hostname, { all: true }).catch(() => {
    throw new Error(`Couldn't find ${url.hostname}.`);
  });
  if (addresses.some((a) => isPrivateAddress(a.address))) throw new Error("That address isn't public.");
}

async function safeFetch(input: string, limit: number, accept: string): Promise<{ url: URL; body: string }> {
  let url = new URL(input);
  for (let hop = 0; hop < 5; hop++) {
    await assertPublicUrl(url);
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NFWE-brand-reader/1.0)", Accept: accept },
    });
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      url = new URL(location, url);
      continue;
    }
    if (!response.ok) throw new Error(`${url.hostname} answered ${response.status}.`);
    return { url, body: await readLimited(response, limit) };
  }
  throw new Error("Too many redirects.");
}

async function readLimited(response: Response, limit: number): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < limit) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength;
  }
  await reader.cancel().catch(() => {});
  return new TextDecoder().decode(Buffer.concat(chunks).subarray(0, limit));
}

// ---------------------------------------------------------------------------
// Parsing. Regex over HTML is enough for the handful of tags read here.

const attr = (tag: string, name: string) =>
  tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"))?.slice(1).find((v) => v !== undefined);

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();

function meta(html: string, key: string): string | undefined {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const k = attr(tag, "property") ?? attr(tag, "name");
    if (k?.toLowerCase() === key) {
      const content = attr(tag, "content");
      if (content) return decode(content);
    }
  }
}

function absolute(href: string | undefined, base: URL): string | undefined {
  if (!href) return undefined;
  try {
    const url = new URL(decode(href), base);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function findIcon(html: string, base: URL): string | undefined {
  const links = (html.match(/<link\b[^>]*>/gi) ?? []).map((tag) => ({
    rel: (attr(tag, "rel") ?? "").toLowerCase(),
    href: attr(tag, "href"),
    sizes: Number((attr(tag, "sizes") ?? "").split("x")[0]) || 0,
    type: attr(tag, "type") ?? "",
  }));
  const touch = links.filter((l) => l.rel.includes("apple-touch-icon")).sort((a, b) => b.sizes - a.sizes)[0];
  const svg = links.find((l) => l.rel.includes("icon") && /svg/.test(l.type + l.href));
  const icon = links.filter((l) => /(^|\s)icon/.test(l.rel)).sort((a, b) => b.sizes - a.sizes)[0];
  return absolute((touch ?? svg ?? icon)?.href, base);
}

function findLogo(html: string, base: URL): string | undefined {
  // Structured data first: Organization.logo.
  for (const block of html.match(/<script[^>]+application\/ld\+json[^>]*>[\s\S]*?<\/script>/gi) ?? []) {
    const logo = block.match(/"logo"\s*:\s*(?:"([^"]+)"|\{[^}]*"url"\s*:\s*"([^"]+)")/i);
    if (logo) return absolute(logo[1] ?? logo[2], base);
  }
  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    const hint = [attr(tag, "alt"), attr(tag, "class"), attr(tag, "id"), attr(tag, "src")].join(" ");
    if (/logo/i.test(hint)) {
      const src = attr(tag, "src") ?? attr(tag, "data-src");
      if (src && !src.startsWith("data:")) return absolute(src, base);
    }
  }
}

function toHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0")).join("")}`;
}

function parseColor(raw: string): string | undefined {
  const hex = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
    return `#${full.toLowerCase()}`;
  }
  const rgb = raw.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
  if (rgb) return toHex(+rgb[1], +rgb[2], +rgb[3]);
}

/** Saturation and lightness, for filtering out greys, black and white. */
function sl(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
  return { s, l };
}

function brandColors(css: string, themeColor?: string): string[] {
  const counts = new Map<string, number>();
  for (const match of css.match(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b|rgba?\([^)]*\)/gi) ?? []) {
    const hex = parseColor(match);
    if (!hex) continue;
    const { s, l } = sl(hex);
    if (s < 0.25 || l < 0.08 || l > 0.94) continue;
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([hex]) => hex);
  const theme = themeColor ? parseColor(themeColor) : undefined;
  return [...new Set([theme, ...ranked].filter((c): c is string => !!c))].slice(0, 6);
}

const GENERIC_FONTS =
  /^(inherit|initial|unset|serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-\w+|-apple-system|blinkmacsystemfont|segoe ui|roboto|helvetica( neue)?|arial|times( new roman)?|georgia|verdana|tahoma|apple color emoji|segoe ui (emoji|symbol)|noto color emoji|var\(.*)$/i;

function brandFonts(html: string, css: string): string[] {
  const counts = new Map<string, number>();
  const add = (name: string, weight = 1) => {
    const clean = name.trim().replace(/^["']|["']$/g, "").trim();
    if (clean && !GENERIC_FONTS.test(clean) && clean.length < 40) counts.set(clean, (counts.get(clean) ?? 0) + weight);
  };
  for (const href of html.match(/fonts\.googleapis\.com\/css2?\?[^"'\s>]+/gi) ?? []) {
    for (const family of decode(href).match(/family=([^&:]+)/gi) ?? []) {
      add(decodeURIComponent(family.slice(7).replace(/\+/g, " ")), 5);
    }
  }
  for (const decl of css.match(/font-family\s*:\s*([^;}]+)/gi) ?? []) {
    add(decl.replace(/font-family\s*:/i, "").split(",")[0]);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name).slice(0, 4);
}

/** Reads a brand's site for its logo, icon, colors and fonts. */
export async function readSiteElements(input: string): Promise<BrandElements> {
  const start = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  const { url, body: html } = await safeFetch(start, MAX_HTML, "text/html,application/xhtml+xml");

  const inlineCss = [
    ...(html.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi) ?? []),
    ...(html.match(/\bstyle\s*=\s*"[^"]*"/gi) ?? []),
  ].join("\n");
  const stylesheets = (html.match(/<link\b[^>]*>/gi) ?? [])
    .filter((tag) => /stylesheet/i.test(attr(tag, "rel") ?? ""))
    .map((tag) => absolute(attr(tag, "href"), url))
    .filter((href): href is string => !!href && !/fonts\.googleapis/.test(href))
    .slice(0, 4);
  const linkedCss = await Promise.all(
    stylesheets.map((href) => safeFetch(href, MAX_CSS, "text/css").then((r) => r.body).catch(() => "")),
  );
  return parseSiteElements(html, url, [inlineCss, ...linkedCss].join("\n"));
}

/** Pure extraction from fetched HTML and CSS. */
export function parseSiteElements(html: string, url: URL, css: string): BrandElements {
  return {
    url: url.href,
    siteName: meta(html, "og:site_name") ?? (decode(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "") || undefined),
    description: meta(html, "og:description") ?? meta(html, "description"),
    logo: findLogo(html, url),
    icon: findIcon(html, url) ?? new URL("/favicon.ico", url).href,
    image: absolute(meta(html, "og:image"), url),
    colors: brandColors(css, meta(html, "theme-color")),
    fonts: brandFonts(html, css),
    fetchedAt: new Date().toISOString(),
  };
}
