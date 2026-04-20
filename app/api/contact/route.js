import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const name = body?.name?.trim();
    const phone = body?.phone?.trim();
    const message = body?.message?.trim();

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: "Name, phone, and message are required." },
        { status: 400 }
      );
    }

    db.prepare(
      `
        INSERT INTO messages (phone_number, customer_name, content, is_read)
        VALUES (?, ?, ?, 0)
      `
    ).run(phone, name, message);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Unable to send message." }, { status: 500 });
  }
}
