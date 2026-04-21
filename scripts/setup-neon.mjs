import { ensureSchema, getSqlClient, getTableCounts, loadProjectEnv } from "./db-utils.mjs";

loadProjectEnv();

const sql = getSqlClient();

try {
  await ensureSchema(sql);
  const counts = await getTableCounts(sql);
  console.log("Neon database is ready.");
  console.table(counts);
} finally {
  await sql.end({ timeout: 5 });
}
