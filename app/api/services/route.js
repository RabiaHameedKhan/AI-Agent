import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const services = db
      .prepare(
        `
          SELECT id, name, description, duration_minutes, price, category
          FROM services
          ORDER BY id ASC
        `
      )
      .all();

    return NextResponse.json({ services });
  } catch (error) {
    return NextResponse.json({ error: "Unable to load services." }, { status: 500 });
  }
}
