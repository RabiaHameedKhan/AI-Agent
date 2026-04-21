import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db, { ensureDatabase } from "@/lib/db";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  await ensureDatabase();

  const messages = await db`
    SELECT id, phone_number, customer_name, content, is_read, created_at
    FROM messages
    ORDER BY created_at DESC, id DESC
  `;

  return NextResponse.json({ messages });
}

export async function PATCH(request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await ensureDatabase();

    const body = await request.json();
    const id = Number(body?.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid message ID." }, { status: 400 });
    }

    const updated = await db`
      UPDATE messages
      SET is_read = TRUE
      WHERE id = ${id}
      RETURNING id
    `;

    if (updated.length === 0) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Unable to update message." }, { status: 500 });
  }
}
