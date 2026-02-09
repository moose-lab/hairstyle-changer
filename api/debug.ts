import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const diagnostics: Record<string, string> = {};

  // Check env vars
  diagnostics.DATABASE_URL = process.env.DATABASE_URL ? "set (" + process.env.DATABASE_URL.substring(0, 30) + "...)" : "NOT SET";
  diagnostics.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET ? "set" : "NOT SET";
  diagnostics.BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || "NOT SET";
  diagnostics.NODE_VERSION = process.version;

  // Try importing auth
  try {
    const { auth } = await import("../lib/auth.js");
    diagnostics.auth_import = "OK";
  } catch (err: any) {
    diagnostics.auth_import = `FAILED: ${err.message}`;
  }

  // Try pg connection
  try {
    const pg = await import("pg");
    const pool = new pg.default.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      connectionTimeoutMillis: 5000,
    });
    const result = await pool.query("SELECT 1 as test");
    diagnostics.pg_connection = `OK: ${JSON.stringify(result.rows)}`;
    await pool.end();
  } catch (err: any) {
    diagnostics.pg_connection = `FAILED: ${err.message}`;
  }

  return res.status(200).json(diagnostics);
}
