import { NextResponse } from "next/server";
import db, { ensureDatabase } from "@/lib/db";

export async function GET() {
  try {
    await ensureDatabase();

    const services = await db`
      SELECT id, name, description, duration_minutes, price, category
      FROM services
      ORDER BY id ASC
    `;

    return NextResponse.json({ services });
  } catch (error) {
    return NextResponse.json({ error: "Unable to load services." }, { status: 500 });
  }
}
