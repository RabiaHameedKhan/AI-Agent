"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    setLoading(true);

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, message }),
    });
    const data = await response.json();

    setLoading(false);
    if (!response.ok) {
      setStatus(data.error || "Unable to send your message.");
      return;
    }

    setStatus("Your message has been sent to our salon team.");
    setName("");
    setPhone("");
    setMessage("");
  }

  return (
    <section className="rounded-2xl border border-[#C9A84C]/50 bg-white p-8 shadow-sm">
      <h2 className="text-3xl text-[#4A1942] [font-family:var(--font-cormorant)]">Send Us a Message</h2>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-[#4A1942]">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-[#C9A84C]/40 px-4 py-2.5 text-sm outline-none ring-[#C9A84C] focus:ring-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[#4A1942]">Phone Number</label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-[#C9A84C]/40 px-4 py-2.5 text-sm outline-none ring-[#C9A84C] focus:ring-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[#4A1942]">Message</label>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-[#C9A84C]/40 px-4 py-2.5 text-sm outline-none ring-[#C9A84C] focus:ring-2"
          />
        </div>

        {status && <p className="text-sm text-[#4A1942]">{status}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[#C9A84C] px-6 py-2.5 text-sm font-semibold text-[#4A1942] transition hover:bg-[#E8D5A3] disabled:opacity-70"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </section>
  );
}
