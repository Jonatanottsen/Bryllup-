import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let instance: NeonHttpDatabase<typeof schema> | undefined;

/** Lazy, slik at `next build` ikke krever DATABASE_URL. */
export function db() {
  if (!instance) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL mangler – se .env.example");
    instance = drizzle({ client: neon(url), schema });
  }
  return instance;
}

/** Postgres 23505 = unique_violation (f.eks. sete allerede tatt). */
export function isUniqueViolation(error: unknown): boolean {
  let e: unknown = error;
  while (e && typeof e === "object") {
    if ((e as { code?: string }).code === "23505") return true;
    e = (e as { cause?: unknown }).cause;
  }
  return false;
}
