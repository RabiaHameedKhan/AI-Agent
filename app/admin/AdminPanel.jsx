"use client";

import { useEffect, useMemo, useState } from "react";

const tabs = ["bookings", "messages", "conversations"];

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
        active
          ? "bg-[#4A1942] text-[#FDFAF5]"
          : "border border-[#C9A84C]/50 bg-white text-[#4A1942] hover:bg-[#F5ECD7]"
      }`}
    >
      {children}
    </button>
  );
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [sortOrder, setSortOrder] = useState("asc");
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [conversationList, setConversationList] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadBookings() {
      setLoading(true);
      try {
        const res = await fetch(`/api/bookings?scope=all&sort=${sortOrder}`);
        const data = await res.json();
        if (res.ok) setBookings(data.bookings || []);
      } finally {
        setLoading(false);
      }
    }

    if (activeTab === "bookings") {
      loadBookings();
    }
  }, [activeTab, sortOrder]);

  useEffect(() => {
    async function loadMessages() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/messages");
        const data = await res.json();
        if (res.ok) setMessages(data.messages || []);
      } finally {
        setLoading(false);
      }
    }

    if (activeTab === "messages") {
      loadMessages();
    }
  }, [activeTab]);

  useEffect(() => {
    async function loadConversations() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/conversations");
        const data = await res.json();
        if (res.ok) setConversationList(data.conversations || []);
      } finally {
        setLoading(false);
      }
    }

    if (activeTab === "conversations") {
      loadConversations();
    }
  }, [activeTab]);

  async function handleMarkRead(id) {
    const res = await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) return;

    setMessages((current) =>
      current.map((message) => (message.id === id ? { ...message, is_read: 1 } : message))
    );
  }

  async function handleViewConversation(phone) {
    setSelectedPhone(phone);
    const res = await fetch(`/api/admin/conversations?phone=${encodeURIComponent(phone)}`);
    const data = await res.json();
    if (!res.ok) return;
    setHistory(data.history || []);
  }

  const tabTitle = useMemo(() => {
    if (activeTab === "bookings") return "All Bookings";
    if (activeTab === "messages") return "WhatsApp Messages";
    return "WhatsApp Conversations";
  }, [activeTab]);

  return (
    <section className="rounded-2xl border border-[#C9A84C]/50 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {tabs.map((tab) => (
          <TabButton key={tab} active={tab === activeTab} onClick={() => setActiveTab(tab)}>
            {tab === "conversations" ? "WhatsApp Conversations" : tab}
          </TabButton>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-3xl text-[#4A1942] [font-family:var(--font-cormorant)]">{tabTitle}</h2>
        {activeTab === "bookings" && (
          <button
            type="button"
            onClick={() => setSortOrder((s) => (s === "asc" ? "desc" : "asc"))}
            className="rounded-full border border-[#C9A84C]/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#4A1942] hover:bg-[#F5ECD7]"
          >
            Sort by date: {sortOrder === "asc" ? "Oldest" : "Newest"}
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-[#2C2C2C]/70">Loading...</p>}

      {!loading && activeTab === "bookings" && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#C9A84C]/30 text-sm">
            <thead className="bg-[#F5ECD7] text-left text-[#4A1942]">
              <tr>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Service</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D5A3]/40">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-3 py-2">{booking.customer_name || booking.phone_number || "-"}</td>
                  <td className="px-3 py-2">{booking.service_name}</td>
                  <td className="px-3 py-2">{booking.appointment_date}</td>
                  <td className="px-3 py-2">{booking.appointment_time}</td>
                  <td className="px-3 py-2 capitalize">{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && activeTab === "messages" && (
        <div className="space-y-3">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`rounded-xl border p-4 ${message.is_read ? "border-[#E8D5A3]" : "border-[#C9A84C] bg-[#FFFDF8]"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#4A1942]">
                  {message.customer_name || "Unknown"} · {message.phone_number}
                </p>
                <p className="text-xs text-[#2C2C2C]/70">{message.created_at}</p>
              </div>
              <p className="mt-2 text-[#2C2C2C]/85">{message.content}</p>
              {!message.is_read && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(message.id)}
                  className="mt-3 rounded-full bg-[#C9A84C] px-3 py-1 text-xs font-semibold text-[#4A1942] hover:bg-[#E8D5A3]"
                >
                  Mark as Read
                </button>
              )}
            </article>
          ))}
          {messages.length === 0 && <p className="text-sm text-[#2C2C2C]/70">No messages found.</p>}
        </div>
      )}

      {!loading && activeTab === "conversations" && (
        <div className="grid gap-5 lg:grid-cols-[320px,1fr]">
          <div className="space-y-2 rounded-xl border border-[#E8D5A3] p-3">
            {conversationList.map((item) => (
              <button
                key={`${item.phone_number}-${item.created_at}`}
                type="button"
                onClick={() => handleViewConversation(item.phone_number)}
                className={`w-full rounded-lg p-3 text-left transition ${
                  selectedPhone === item.phone_number
                    ? "bg-[#4A1942] text-[#FDFAF5]"
                    : "bg-[#F5ECD7]/45 text-[#4A1942] hover:bg-[#F5ECD7]"
                }`}
              >
                <p className="text-sm font-semibold">{item.phone_number}</p>
                <p className="mt-1 line-clamp-1 text-xs opacity-80">{item.content}</p>
              </button>
            ))}
            {conversationList.length === 0 && (
              <p className="p-2 text-sm text-[#2C2C2C]/70">No conversations yet.</p>
            )}
          </div>
          <div className="rounded-xl border border-[#E8D5A3] p-4">
            <h3 className="text-xl text-[#4A1942] [font-family:var(--font-cormorant)]">
              {selectedPhone ? `Conversation: ${selectedPhone}` : "Select a phone number"}
            </h3>
            <div className="mt-4 space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    item.role === "assistant"
                      ? "ml-auto bg-[#C9A84C]/20 text-[#2C2C2C]"
                      : "bg-[#F5ECD7] text-[#2C2C2C]"
                  }`}
                >
                  <p>{item.content}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide opacity-60">{item.created_at}</p>
                </div>
              ))}
              {selectedPhone && history.length === 0 && (
                <p className="text-sm text-[#2C2C2C]/70">No messages in this conversation.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
