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

export async function GET(request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (phone) {
    const history = db
      .prepare(
        `
          SELECT id, phone_number, role, content, created_at
          FROM conversations
          WHERE phone_number = ?
          ORDER BY datetime(created_at) ASC, id ASC
        `
      )
      .all(phone);

    return NextResponse.json({ phone, history });
  }

  const conversations = db
    .prepare(
      `
        SELECT c.phone_number, c.role, c.content, c.created_at
        FROM conversations c
        INNER JOIN (
          SELECT phone_number, MAX(created_at) AS max_created_at
          FROM conversations
          GROUP BY phone_number
        ) latest
          ON latest.phone_number = c.phone_number
         AND latest.max_created_at = c.created_at
        ORDER BY datetime(c.created_at) DESC
      `
    )
    .all();

  return NextResponse.json({ conversations });
}
