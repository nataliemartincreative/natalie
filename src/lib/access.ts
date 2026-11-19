/**
 * Shared-password access for buyers. The access cookie holds an HMAC of a
 * fixed message keyed by SITE_PASSWORD, so it can't be forged without the
 * password and every cookie stops working when the password changes.
 * Uses Web Crypto, so it runs in the proxy and in server actions alike.
 */

export const ACCESS_COOKIE = "dh_access";
export const ACCESS_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const MESSAGE = new TextEncoder().encode("diamond-home-access-v1");

export const sitePassword = () => process.env.SITE_PASSWORD || undefined;

export async function accessToken(password: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, MESSAGE));
  return Array.from(signature, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Compares without exiting early, so timing doesn't reveal how much matched. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Whether a request with this cookie may view the site. Without a password
 * configured the site is open in local development and locked in production.
 */
export async function hasAccess(cookie: string | undefined): Promise<boolean> {
  const password = sitePassword();
  if (!password) return process.env.NODE_ENV !== "production";
  return !!cookie && safeEqual(cookie, await accessToken(password));
}

/** Only same-site paths, so the redirect after sign-in can't send buyers elsewhere. */
export function safeNext(value: unknown): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}
