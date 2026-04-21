import db, { ensureDatabase } from "@/lib/db";

export async function getConversationHistory(phoneNumber, limit = 20) {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 20;
  await ensureDatabase();

  const rows = await db`
    SELECT role, content
    FROM conversations
    WHERE phone_number = ${phoneNumber}
    ORDER BY created_at ASC, id ASC
    LIMIT ${safeLimit}
  `;

  return rows.map((row) => ({
    role: row.role,
    content: row.content,
  }));
}

export async function saveMessage(phoneNumber, role, content) {
  await ensureDatabase();

  await db`
    INSERT INTO conversations (phone_number, role, content)
    VALUES (${phoneNumber}, ${role}, ${content})
  `;
}

export async function getOrCreateWhatsAppUser(phoneNumber, profileName) {
  await ensureDatabase();

  const [existingUser] = await db`
    SELECT phone_number, name, last_seen
    FROM whatsapp_users
    WHERE phone_number = ${phoneNumber}
    LIMIT 1
  `;

  if (!existingUser) {
    await db`
      INSERT INTO whatsapp_users (phone_number, name, last_seen)
      VALUES (${phoneNumber}, ${profileName || null}, NOW())
    `;
  } else if (profileName) {
    await db`
      UPDATE whatsapp_users
      SET name = ${profileName}, last_seen = NOW()
      WHERE phone_number = ${phoneNumber}
    `;
  } else {
    await db`
      UPDATE whatsapp_users
      SET last_seen = NOW()
      WHERE phone_number = ${phoneNumber}
    `;
  }

  const [user] = await db`
    SELECT phone_number, name, last_seen
    FROM whatsapp_users
    WHERE phone_number = ${phoneNumber}
    LIMIT 1
  `;

  return user;
}

export async function clearOldConversations(phoneNumber) {
  await ensureDatabase();

  await db`
    DELETE FROM conversations
    WHERE phone_number = ${phoneNumber}
      AND created_at < NOW() - INTERVAL '7 days'
  `;
}

export async function getConversationSummary(phoneNumber) {
  await ensureDatabase();

  const [user] = await db`
    SELECT name
    FROM whatsapp_users
    WHERE phone_number = ${phoneNumber}
    LIMIT 1
  `;

  const [aggregate] = await db`
    SELECT COUNT(*)::int AS "messageCount", MAX(created_at) AS "lastCreatedAt"
    FROM conversations
    WHERE phone_number = ${phoneNumber}
  `;

  let lastMessage = null;
  if (aggregate?.lastCreatedAt) {
    const [latest] = await db`
      SELECT content
      FROM conversations
      WHERE phone_number = ${phoneNumber}
        AND created_at = ${aggregate.lastCreatedAt}
      ORDER BY id DESC
      LIMIT 1
    `;

    lastMessage = latest?.content || null;
  }

  return {
    messageCount: aggregate?.messageCount || 0,
    lastMessage,
    customerName: user?.name || null,
  };
}
