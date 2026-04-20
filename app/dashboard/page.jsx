import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import BookingsList from "./BookingsList";

export default async function DashboardPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const params = await searchParams;
  const bookingConfirmed = params?.booking === "confirmed";
  const confirmedServiceName = params?.service || "";

  const bookings = db
    .prepare(
      `
        SELECT id, service_name, appointment_date, appointment_time, status
        FROM bookings
        WHERE user_id = ?
        ORDER BY appointment_date ASC, appointment_time ASC
      `
    )
    .all(session.user.id);

  return (
    <main className="min-h-screen bg-[#FDFAF5] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 rounded-2xl border border-[#C9A84C]/50 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-[#C9A84C]">User Dashboard</p>
          <h1 className="mt-2 text-4xl text-[#4A1942] [font-family:var(--font-cormorant)]">
            Welcome, {session.user.name || "Guest"}
          </h1>
          <p className="mt-2 text-[#2C2C2C]/75">{session.user.email}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/#services"
              className="rounded-full bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#4A1942] transition hover:bg-[#E8D5A3]"
            >
              View Services
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-[#C9A84C]/50 px-4 py-2 text-sm font-semibold text-[#4A1942] transition hover:bg-[#F5ECD7]"
            >
              Contact Salon
            </Link>
          </div>
        </header>

        {bookingConfirmed && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900 shadow-sm">
            <p className="text-sm font-semibold">Booking confirmed</p>
            <p className="mt-1 text-sm">
              {confirmedServiceName || "Your service"} has been saved and is now visible in your dashboard.
            </p>
          </div>
        )}

        <BookingsList initialBookings={bookings} />
      </div>
    </main>
  );
}
