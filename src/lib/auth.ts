// Signerte sesjons-cookies med HMAC (Web Crypto – virker både i proxy og server).
// Format: "<rolle>.<utløp ms>.<signatur>"

export type Role = "guest" | "admin";

export const SESSION_COOKIE = "bryllup_session";
export const DEVICE_COOKIE = "bryllup_device";
export const RSVP_COOKIE = "bryllup_rsvp";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 120; // 120 dager

const enc = new TextEncoder();

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET mangler eller er for kort (min. 16 tegn)");
  }
  return s;
}

function toBase64Url(buf: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function hmac(data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

/** Sammenligning i konstant tid (hasher først så lengden ikke lekker). */
export async function safeEqual(a: string, b: string) {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  const va = new Uint8Array(ha);
  const vb = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
  return diff === 0;
}

export async function createSessionToken(role: Role) {
  const payload = `${role}.${Date.now() + SESSION_MAX_AGE * 1000}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<Role | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [role, exp, sig] = parts;
  if (role !== "guest" && role !== "admin") return null;
  if (!(Number(exp) > Date.now())) return null;
  return (await safeEqual(sig, await hmac(`${role}.${exp}`))) ? role : null;
}
