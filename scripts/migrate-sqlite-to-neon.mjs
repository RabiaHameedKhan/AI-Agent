import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import {
  ensureSchema,
  getSqlClient,
  getTableCounts,
  loadProjectEnv,
  projectRoot,
} from "./db-utils.mjs";

loadProjectEnv();

const sqlitePath = path.join(projectRoot, "salon.db");
if (!fs.existsSync(sqlitePath)) {
  throw new Error(`SQLite database not found at ${sqlitePath}`);
}

const force = process.argv.includes("--force");
const sqlite = new Database(sqlitePath, { readonly: true });
const sql = getSqlClient();

function readAll(tableName) {
  return sqlite.prepare(`SELECT * FROM ${tableName}`).all();
}

async function resetIdentitySequence(client, tableName) {
  await client.unsafe(`
    SELECT setval(
      pg_get_serial_sequence('${tableName}', 'id'),
      COALESCE((SELECT MAX(id) FROM ${tableName}), 1),
      (SELECT COUNT(*) > 0 FROM ${tableName})
    )
  `);
}

try {
  await ensureSchema(sql);

  const counts = await getTableCounts(sql);
  const nonServiceTableCounts = [
    counts.users,
    counts.bookings,
    counts.messages,
    counts.conversations,
    counts.whatsapp_users,
  ];
  const hasExistingData = nonServiceTableCounts.some((count) => count > 0) || counts.services > 6;

  if (hasExistingData && !force) {
    throw new Error(
      `Neon already has data ${JSON.stringify(counts)}. Re-run with --force if you want to replace it.`
    );
  }

  const users = readAll("users");
  const services = readAll("services");
  const bookings = readAll("bookings");
  const messages = readAll("messages");
  const conversations = readAll("conversations");
  const whatsappUsers = readAll("whatsapp_users");

  await sql.begin(async (tx) => {
    await tx`TRUNCATE TABLE bookings, messages, conversations, whatsapp_users, services, users RESTART IDENTITY CASCADE`;

    for (const row of users) {
      await tx`
        INSERT INTO users (id, name, email, password, role, created_at)
        VALUES (
          ${row.id},
          ${row.name ?? null},
          ${row.email ?? null},
          ${row.password ?? null},
          ${row.role ?? "user"},
          ${row.created_at ?? null}
        )
      `;
    }

    for (const row of services) {
      await tx`
        INSERT INTO services (id, name, description, duration_minutes, price, category)
        VALUES (
          ${row.id},
          ${row.name},
          ${row.description ?? null},
          ${row.duration_minutes ?? null},
          ${row.price ?? null},
          ${row.category ?? null}
        )
      `;
    }

    for (const row of bookings) {
      await tx`
        INSERT INTO bookings (
          id,
          phone_number,
          customer_name,
          user_id,
          service_name,
          appointment_date,
          appointment_time,
          status,
          notes,
          created_at
        ) VALUES (
          ${row.id},
          ${row.phone_number ?? null},
          ${row.customer_name ?? null},
          ${row.user_id ?? null},
          ${row.service_name ?? null},
          ${row.appointment_date ?? null},
          ${row.appointment_time ?? null},
          ${row.status ?? "confirmed"},
          ${row.notes ?? null},
          ${row.created_at ?? null}
        )
      `;
    }

    for (const row of messages) {
      await tx`
        INSERT INTO messages (id, phone_number, customer_name, content, is_read, created_at)
        VALUES (
          ${row.id},
          ${row.phone_number ?? null},
          ${row.customer_name ?? null},
          ${row.content ?? null},
          ${Boolean(row.is_read)},
          ${row.created_at ?? null}
        )
      `;
    }

    for (const row of conversations) {
      await tx`
        INSERT INTO conversations (id, phone_number, role, content, created_at)
        VALUES (
          ${row.id},
          ${row.phone_number ?? null},
          ${row.role ?? null},
          ${row.content ?? null},
          ${row.created_at ?? null}
        )
      `;
    }

    for (const row of whatsappUsers) {
      await tx`
        INSERT INTO whatsapp_users (phone_number, name, last_seen, created_at)
        VALUES (
          ${row.phone_number},
          ${row.name ?? null},
          ${row.last_seen ?? null},
          ${row.created_at ?? null}
        )
      `;
    }
  });

  await resetIdentitySequence(sql, "services");
  await resetIdentitySequence(sql, "bookings");
  await resetIdentitySequence(sql, "messages");
  await resetIdentitySequence(sql, "conversations");

  const finalCounts = await getTableCounts(sql);
  console.log("SQLite data migrated to Neon.");
  console.table(finalCounts);
} finally {
  sqlite.close();
  await sql.end({ timeout: 5 });
}
