import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local first (Next.js convention), then fall back to .env
config({ path: ".env.local" });
config({ path: ".env" });

if (!process.env.DATABASE_URI) {
  throw new Error("DATABASE_URI env var is not set (check .env.local)");
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URI,
  },
  verbose: true,
  strict: true,
});
