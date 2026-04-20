import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import db from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const name = body?.name?.trim();
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    db.prepare(
      `
        INSERT INTO users (id, name, email, password, role)
        VALUES (?, ?, ?, ?, 'user')
      `
    ).run(randomUUID(), name, email, hashedPassword);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error?.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Unable to register user." },
      { status: 500 }
    );
  }
}