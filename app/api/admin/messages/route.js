import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

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

  const messages = db
    .prepare(
      `
        SELECT id, phone_number, customer_name, content, is_read, created_at
        FROM messages
        ORDER BY datetime(created_at) DESC, id DESC
      `
    )
    .all();

  return NextResponse.json({ messages });
}

export async function PATCH(request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const body = await request.json();
    const id = Number(body?.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid message ID." }, { status: 400 });
    }

    const update = db.prepare("UPDATE messages SET is_read = 1 WHERE id = ?").run(id);
    if (update.changes === 0) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Unable to update message." }, { status: 500 });
  }
}
