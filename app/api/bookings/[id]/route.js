import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db, { ensureDatabase } from "@/lib/db";

export async function DELETE(request, context) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const id = Number(params?.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid booking ID." }, { status: 400 });
  }

  await ensureDatabase();

  const [booking] = await db`
    SELECT id, user_id, status
    FROM bookings
    WHERE id = ${id}
    LIMIT 1
  `;

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (booking.user_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (booking.status !== "cancelled") {
    await db`
      UPDATE bookings
      SET status = 'cancelled'
      WHERE id = ${id}
    `;
  }

  return NextResponse.json({ success: true });
}
