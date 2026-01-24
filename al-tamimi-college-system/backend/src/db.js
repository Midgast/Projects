import pg from "pg";

const { Pool } = pg;

let pool = null;

export function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return pool;
}

export { pool };

export async function query(text, params) {
  const p = getPool();
  if (!p) throw new Error("DB not available");
  const res = await p.query(text, params);
  return res;
}
