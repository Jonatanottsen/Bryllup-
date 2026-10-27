import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  DEVICE_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  verifySessionToken,
  type Role,
} from "./auth";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

export async function getRole(): Promise<Role | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Forsvar i dybden: server actions sjekker også, ikke bare proxy. */
export async function requireGuest() {
  const role = await getRole();
  if (!role) redirect("/login");
  return role;
}

export async function requireAdmin() {
  if ((await getRole()) !== "admin") redirect("/admin/login");
}

export async function startSession(role: Role) {
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(role), cookieOptions);
  if (!store.get(DEVICE_COOKIE)) {
    store.set(DEVICE_COOKIE, crypto.randomUUID(), cookieOptions);
  }
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Anonym id per nettleser – brukes for å avbestille egne seter/reservasjoner. */
export async function getDeviceId() {
  const store = await cookies();
  let id = store.get(DEVICE_COOKIE)?.value;
  if (!id) {
    id = crypto.randomUUID();
    store.set(DEVICE_COOKIE, id, cookieOptions);
  }
  return id;
}

export async function readDeviceId() {
  return (await cookies()).get(DEVICE_COOKIE)?.value ?? null;
}
