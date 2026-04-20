"use client";

import { useMemo, useState } from "react";

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function statusClasses(status) {
  if (status === "cancelled") {
    return "bg-red-100 text-red-700";
  }
  return "bg-emerald-100 text-emerald-700";
}

function CancelConfirmationModal({ booking, onClose, onConfirm, isCancelling }) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-md rounded-3xl border border-[#C9A84C]/50 bg-[#FDFAF5] p-6 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-red-600">Confirm Cancellation</p>
        <h3 className="mt-2 text-3xl text-[#4A1942] [font-family:var(--font-cormorant)]">
          Cancel this booking?
        </h3>
        <p className="mt-3 text-sm leading-6 text-[#2C2C2C]/80">
          {booking.service_name} on {booking.appointment_date} at {booking.appointment_time} will be
          moved out of your upcoming bookings.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isCancelling}
            className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isCancelling ? "Cancelling..." : "Yes, Cancel Booking"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            className="rounded-full border border-[#C9A84C]/60 px-5 py-2.5 text-sm font-semibold text-[#4A1942] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            Keep Booking
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking, showCancel, onCancelClick, isCancelling }) {
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
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onCancelClick(booking)}
            disabled={isCancelling}
            className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCancelling ? "Cancelling..." : "Cancel Booking"}
          </button>
          <p className="text-xs text-[#2C2C2C]/60">You can cancel any upcoming booking.</p>
        </div>
      )}
    </article>
  );
}

export default function BookingsList({ initialBookings }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [cancellingId, setCancellingId] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const { upcoming, past } = useMemo(() => {
    const today = getTodayDateString();
    const upcomingItems = [];
    const pastItems = [];

    for (const booking of bookings) {
      const isUpcoming =
        booking.status === "confirmed" && booking.appointment_date >= today;

      if (isUpcoming) {
        upcomingItems.push(booking);
      } else {
        pastItems.push(booking);
      }
    }

    return { upcoming: upcomingItems, past: pastItems };
  }, [bookings]);

  function openCancelModal(booking) {
    setFeedback("");
    setError("");
    setBookingToCancel(booking);
  }

  function closeCancelModal() {
    if (cancellingId) return;
    setBookingToCancel(null);
  }

  async function handleCancel(id) {
    setFeedback("");
    setError("");
    setCancellingId(id);
    try {
      const response = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to cancel booking.");
      }
      setBookings((current) =>
        current.map((booking) =>
          booking.id === id ? { ...booking, status: "cancelled" } : booking
        )
      );
      setFeedback("Booking cancelled successfully.");
      setBookingToCancel(null);
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="space-y-10">
      {(feedback || error) && (
        <div
          className={`rounded-2xl px-5 py-4 text-sm shadow-sm ${
            error
              ? "border border-red-200 bg-red-50 text-red-800"
              : "border border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          {error || feedback}
        </div>
      )}

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
                onCancelClick={openCancelModal}
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
                onCancelClick={openCancelModal}
                isCancelling={false}
              />
            ))}
          </div>
        )}
      </section>

      <CancelConfirmationModal
        booking={bookingToCancel}
        onClose={closeCancelModal}
        onConfirm={() => bookingToCancel && handleCancel(bookingToCancel.id)}
        isCancelling={cancellingId === bookingToCancel?.id}
      />
    </div>
  );
}
