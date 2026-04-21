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

export async function GET(request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  await ensureDatabase();

  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (phone) {
    const history = await db`
      SELECT id, phone_number, role, content, created_at
      FROM conversations
      WHERE phone_number = ${phone}
      ORDER BY created_at ASC, id ASC
    `;

    return NextResponse.json({ phone, history });
  }

  const conversations = await db`
    SELECT DISTINCT ON (c.phone_number)
      c.phone_number,
      c.role,
      c.content,
      c.created_at
    FROM conversations c
    ORDER BY c.phone_number, c.created_at DESC, c.id DESC
  `;

  conversations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return NextResponse.json({ conversations });
}
