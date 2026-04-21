import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import db, { ensureDatabase } from "@/lib/db";
import BookingForm from "./BookingForm";

export default async function BookingPage({ searchParams }) {
  const params = await searchParams;
  const serviceId = Number(params?.serviceId);

  if (!Number.isInteger(serviceId)) {
    redirect("/#services");
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(`/booking?serviceId=${serviceId}`)}`);
  }

  await ensureDatabase();

  const [service] = await db`
    SELECT id, name, description, duration_minutes, price, category
    FROM services
    WHERE id = ${serviceId}
    LIMIT 1
  `;

  if (!service) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#FDFAF5] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr,1.05fr]">
        <section className="rounded-3xl border border-[#C9A84C]/50 bg-gradient-to-br from-[#4A1942] to-[#2D0E28] p-7 text-[#FDFAF5] shadow-xl">
          <p className="text-xs uppercase tracking-[0.25em] text-[#E8D5A3]">Book Your Appointment</p>
          <h1 className="mt-3 text-5xl text-[#C9A84C] [font-family:var(--font-cormorant)]">
            {service.name}
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[#FDFAF5]/85">{service.description}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wider text-[#E8D5A3]">Duration</p>
              <p className="mt-2 text-lg font-semibold">{service.duration_minutes} mins</p>
            </article>
            <article className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wider text-[#E8D5A3]">Price</p>
              <p className="mt-2 text-lg font-semibold">${service.price}</p>
            </article>
            <article className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wider text-[#E8D5A3]">Category</p>
              <p className="mt-2 text-lg font-semibold">{service.category || "Salon"}</p>
            </article>
          </div>

          <div className="mt-10 rounded-2xl border border-[#C9A84C]/35 bg-white/10 p-5">
            <p className="text-sm font-semibold text-[#E8D5A3]">What happens next</p>
            <p className="mt-2 text-sm leading-6 text-[#FDFAF5]/80">
              Fill in your appointment details, confirm the booking, and we will save it directly to
              your salon dashboard.
            </p>
          </div>
        </section>

        <BookingForm
          service={service}
          userName={session.user.name || ""}
          userEmail={session.user.email || ""}
        />
      </div>
    </main>
  );
}
