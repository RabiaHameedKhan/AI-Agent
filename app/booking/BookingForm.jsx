"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export default function BookingForm({ service, userName, userEmail }) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState(userName);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          phone_number: phoneNumber,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          notes,
          service_name: service.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to confirm booking.");
      }

      const successParams = new URLSearchParams({
        booking: "confirmed",
        service: service.name,
      });
      router.push(`/dashboard?${successParams.toString()}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError.message || "Unable to confirm booking.");
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-[#C9A84C]/45 bg-white p-7 shadow-lg">
      <p className="text-xs uppercase tracking-[0.25em] text-[#C9A84C]">Confirmation Form</p>
      <h2 className="mt-2 text-4xl text-[#4A1942] [font-family:var(--font-cormorant)]">
        Confirm Your Booking
      </h2>
      <p className="mt-2 text-sm text-[#2C2C2C]/75">
        Booking for {service.name}. Signed in as {userEmail}.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <div>
          <label htmlFor="customerName" className="mb-1 block text-sm font-medium text-[#4A1942]">
            Full Name
          </label>
          <input
            id="customerName"
            type="text"
            required
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            className="w-full rounded-2xl border border-[#C9A84C]/35 px-4 py-3 text-sm outline-none ring-[#C9A84C] transition focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className="mb-1 block text-sm font-medium text-[#4A1942]">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            type="tel"
            required
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="+92 300 1234567"
            className="w-full rounded-2xl border border-[#C9A84C]/35 px-4 py-3 text-sm outline-none ring-[#C9A84C] transition focus:ring-2"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="appointmentDate" className="mb-1 block text-sm font-medium text-[#4A1942]">
              Appointment Date
            </label>
            <input
              id="appointmentDate"
              type="date"
              required
              min={getTodayDate()}
              value={appointmentDate}
              onChange={(event) => setAppointmentDate(event.target.value)}
              className="w-full rounded-2xl border border-[#C9A84C]/35 px-4 py-3 text-sm outline-none ring-[#C9A84C] transition focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="appointmentTime" className="mb-1 block text-sm font-medium text-[#4A1942]">
              Appointment Time
            </label>
            <input
              id="appointmentTime"
              type="time"
              required
              value={appointmentTime}
              onChange={(event) => setAppointmentTime(event.target.value)}
              className="w-full rounded-2xl border border-[#C9A84C]/35 px-4 py-3 text-sm outline-none ring-[#C9A84C] transition focus:ring-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium text-[#4A1942]">
            Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add any preferences or special requests."
            className="w-full rounded-2xl border border-[#C9A84C]/35 px-4 py-3 text-sm outline-none ring-[#C9A84C] transition focus:ring-2"
          />
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[#C9A84C] px-6 py-3 text-sm font-semibold text-[#4A1942] transition hover:bg-[#E8D5A3] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Confirming..." : "Confirm Booking"}
          </button>
          <Link
            href="/#services"
            className="rounded-full border border-[#C9A84C]/50 px-6 py-3 text-sm font-semibold text-[#4A1942] transition hover:bg-[#F5ECD7]"
          >
            Back to Services
          </Link>
        </div>
      </form>
    </section>
  );
}
