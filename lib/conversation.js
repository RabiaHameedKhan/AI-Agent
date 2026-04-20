import db from "@/lib/db";

export function getConversationHistory(phoneNumber, limit = 20) {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 20;

  const rows = db
    .prepare(
      `
        SELECT role, content
        FROM conversations
        WHERE phone_number = ?
        ORDER BY created_at ASC
        LIMIT ?
      `
    )
    .all(phoneNumber, safeLimit);

  return rows.map((row) => ({
    role: row.role,
    content: row.content,
  }));
}

export function saveMessage(phoneNumber, role, content) {
  db.prepare(
    `
      INSERT INTO conversations (phone_number, role, content)
      VALUES (?, ?, ?)
    `
  ).run(phoneNumber, role, content);
}

export function getOrCreateWhatsAppUser(phoneNumber, profileName) {
  const existingUser = db
    .prepare(
      `
        SELECT phone_number, name, last_seen
        FROM whatsapp_users
        WHERE phone_number = ?
      `
    )
    .get(phoneNumber);

  if (!existingUser) {
    db.prepare(
      `
        INSERT INTO whatsapp_users (phone_number, name, last_seen)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `
    ).run(phoneNumber, profileName || null);
  } else if (profileName) {
    db.prepare(
      `
        UPDATE whatsapp_users
        SET name = ?, last_seen = CURRENT_TIMESTAMP
        WHERE phone_number = ?
      `
    ).run(profileName, phoneNumber);
  } else {
    db.prepare(
      `
        UPDATE whatsapp_users
        SET last_seen = CURRENT_TIMESTAMP
        WHERE phone_number = ?
      `
    ).run(phoneNumber);
  }

  return db
    .prepare(
      `
        SELECT phone_number, name, last_seen
        FROM whatsapp_users
        WHERE phone_number = ?
      `
    )
    .get(phoneNumber);
}

export function clearOldConversations(phoneNumber) {
  db.prepare(
    `
      DELETE FROM conversations
      WHERE phone_number = ?
        AND created_at < datetime('now', '-7 days')
    `
  ).run(phoneNumber);
}

export function getConversationSummary(phoneNumber) {
  const user = db
    .prepare(
      `
        SELECT name
        FROM whatsapp_users
        WHERE phone_number = ?
      `
    )
    .get(phoneNumber);

  const aggregate = db
    .prepare(
      `
        SELECT COUNT(*) AS messageCount, MAX(created_at) AS lastCreatedAt
        FROM conversations
        WHERE phone_number = ?
      `
    )
    .get(phoneNumber);

  let lastMessage = null;
  if (aggregate.lastCreatedAt) {
    const latest = db
      .prepare(
        `
          SELECT content
          FROM conversations
          WHERE phone_number = ?
            AND created_at = ?
          ORDER BY id DESC
          LIMIT 1
        `
      )
      .get(phoneNumber, aggregate.lastCreatedAt);

    lastMessage = latest?.content || null;
  }

  return {
    messageCount: aggregate.messageCount || 0,
    lastMessage,
    customerName: user?.name || null,
  };
}
