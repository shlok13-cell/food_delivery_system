import "dotenv/config";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pool from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate(): Promise<void> {
  const sql = readFileSync(join(__dirname, "schema.sql"), "utf-8");

  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  const conn = await pool.getConnection();

  try {
    console.log("Running migrations...\n");

    for (const statement of statements) {
      const preview = statement.slice(0, 60).replace(/\n/g, " ");
      await conn.query(statement);
      console.log(`  ✅ ${preview}...`);
    }

    console.log("\nMigrations completed successfully.");
  } catch (err) {
    console.error("\n❌ Migration failed:", (err as Error).message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

migrate();
