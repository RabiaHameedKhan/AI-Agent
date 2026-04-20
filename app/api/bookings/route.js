import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");
  const sort = searchParams.get("sort") === "desc" ? "DESC" : "ASC";

  if (scope === "all") {
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bookings = db
      .prepare(
        `
          SELECT id, phone_number, customer_name, user_id, service_name, appointment_date, appointment_time, status, notes, created_at
          FROM bookings
          ORDER BY appointment_date ${sort}, appointment_time ${sort}
        `
      )
      .all();

    return NextResponse.json({ bookings });
  }

  const bookings = db
    .prepare(
      `
        SELECT id, phone_number, customer_name, user_id, service_name, appointment_date, appointment_time, status, notes, created_at
        FROM bookings
        WHERE user_id = ?
        ORDER BY appointment_date ASC, appointment_time ASC
      `
    )
    .all(session.user.id);

  return NextResponse.json({ bookings });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    const result = db
      .prepare(
        `
          INSERT INTO bookings (
            phone_number, customer_name, user_id, service_name, appointment_date, appointment_time, status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?)
        `
      )
      .run(
        phoneNumber,
        customerName,
        session.user.id,
        serviceName,
        appointmentDate,
        appointmentTime,
        notes
      );

    return NextResponse.json({ success: true, bookingId: result.lastInsertRowid }, { status: 201 });
  } catch (error) {
    console.error("Booking creation failed:", error);

    if (error?.code === "SQLITE_BUSY") {
      return NextResponse.json(
        { error: "The booking system is busy right now. Please try again in a moment." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "Unable to create booking." },
      { status: 500 }
    );
  }
}
