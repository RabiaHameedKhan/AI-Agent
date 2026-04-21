import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db, { ensureDatabase } from "@/lib/db";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");
  const sort = searchParams.get("sort") === "desc" ? "DESC" : "ASC";

  await ensureDatabase();

  if (scope === "all") {
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bookings =
      sort === "DESC"
        ? await db`
            SELECT id, phone_number, customer_name, user_id, service_name, appointment_date, appointment_time, status, notes, created_at
            FROM bookings
            ORDER BY appointment_date DESC, appointment_time DESC
          `
        : await db`
            SELECT id, phone_number, customer_name, user_id, service_name, appointment_date, appointment_time, status, notes, created_at
            FROM bookings
            ORDER BY appointment_date ASC, appointment_time ASC
          `;

    return NextResponse.json({ bookings });
  }

  const bookings = await db`
    SELECT id, phone_number, customer_name, user_id, service_name, appointment_date, appointment_time, status, notes, created_at
    FROM bookings
    WHERE user_id = ${session.user.id}
    ORDER BY appointment_date ASC, appointment_time ASC
  `;

  return NextResponse.json({ bookings });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDatabase();

    const body = await request.json();
    const serviceName = body?.service_name?.trim();
    const appointmentDate = body?.appointment_date?.trim();
    const appointmentTime = body?.appointment_time?.trim();
    const phoneNumber = body?.phone_number?.trim() || "";
    const customerName = body?.customer_name?.trim() || session.user.name || "";
    const notes = body?.notes?.trim() || "";

    if (!serviceName || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: "service_name, appointment_date, and appointment_time are required." },
        { status: 400 }
      );
    }

    const [result] = await db`
      INSERT INTO bookings (
        phone_number, customer_name, user_id, service_name, appointment_date, appointment_time, status, notes
      ) VALUES (
        ${phoneNumber},
        ${customerName},
        ${session.user.id},
        ${serviceName},
        ${appointmentDate},
        ${appointmentTime},
        'confirmed',
        ${notes}
      )
      RETURNING id
    `;

    return NextResponse.json({ success: true, bookingId: result.id }, { status: 201 });
  } catch (error) {
    console.error("Booking creation failed:", error);

    return NextResponse.json(
      { error: error?.message || "Unable to create booking." },
      { status: 500 }
    );
  }
}
