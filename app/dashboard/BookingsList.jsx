"use client";

import { useMemo, useState } from "react";

function getBookingDateTime(booking) {
  return new Date(`${booking.appointment_date}T${booking.appointment_time}`);
}

function statusClasses(status) {
  if (status === "cancelled") {
    return "bg-red-100 text-red-700";
  }
  return "bg-emerald-100 text-emerald-700";
}

function BookingCard({ booking, showCancel, onCancel, isCancelling }) {
  return (
    <article className="rounded-2xl border border-[#C9A84C]/50 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl text-[#4A1942] [font-family:var(--font-cormorant)]">
            {booking.service_name}
          </h3>
          <p className="mt-2 text-sm text-[#2C2C2C]/80">
            {booking.appointment_date} at {booking.appointment_time}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(booking.status)}`}>
          {booking.status}
        </span>
      </div>
      {showCancel && (
        <button
          type="button"
          onClick={() => onCancel(booking.id)}
          disabled={isCancelling}
          className="mt-4 rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCancelling ? "Cancelling..." : "Cancel"}
        </button>
      )}
    </article>
  );
}

export default function BookingsList({ initialBookings }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [cancellingId, setCancellingId] = useState(null);

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const upcomingItems = [];
    const pastItems = [];

    for (const booking of bookings) {
      const bookingDate = getBookingDateTime(booking);
      const isUpcoming = booking.status === "confirmed" && bookingDate >= now;

      if (isUpcoming) {
        upcomingItems.push(booking);
      } else {
        pastItems.push(booking);
      }
    }

    return { upcoming: upcomingItems, past: pastItems };
  }, [bookings]);

  async function handleCancel(id) {
    setCancellingId(id);
    try {
      const response = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to cancel booking.");
      }
      setBookings((current) =>
        current.map((booking) =>
          booking.id === id ? { ...booking, status: "cancelled" } : booking
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-3xl text-[#4A1942] [font-family:var(--font-cormorant)]">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-[#2C2C2C]/70">No upcoming bookings.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                showCancel={booking.status === "confirmed"}
                onCancel={handleCancel}
                isCancelling={cancellingId === booking.id}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-3xl text-[#4A1942] [font-family:var(--font-cormorant)]">Past</h2>
        {past.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-[#2C2C2C]/70">No past bookings yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {past.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                showCancel={false}
                onCancel={handleCancel}
                isCancelling={false}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
