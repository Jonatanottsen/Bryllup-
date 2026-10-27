import { defineConfig } from "drizzle-kit";

// Leser .env.local lokalt. På Vercel/CI kommer DATABASE_URL fra miljøet.
try {
  process.loadEnvFile(".env.local");
} catch {}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
});
