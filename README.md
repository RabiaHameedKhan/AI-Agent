# Lumiere Salon AI Assistant

Royal luxury salon website with:
- Next.js App Router frontend
- NextAuth authentication
- SQLite persistence
- Twilio WhatsApp webhook
- Groq-powered WhatsApp AI concierge

## 1. Install and Setup

```bash
npm install
```

Create `.env.local` (copy from `.env.local.example`) and fill:

```env
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GROQ_API_KEY=...
GROQ_MODEL=llama-3.3-70b-versatile
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=+14155238886
ADMIN_EMAIL=admin@example.com
```

Then run:

```bash
npm run dev
```

## 2. Groq API Key (Free Tier)

1. Open Groq Console: `https://console.groq.com`
2. Sign up and open API Keys
3. Generate an API key
4. Put it in `.env.local` as `GROQ_API_KEY`

## 3. Twilio WhatsApp Sandbox Setup

1. Open Twilio Console -> Messaging -> Try it out -> Send a WhatsApp message.
2. Join the sandbox from your phone by sending the provided join code to Twilio's sandbox number (for example `+14155238886`).
3. In sandbox configuration, set **When a message comes in** webhook URL to:

`https://YOUR_NGROK_URL/api/whatsapp/webhook`

4. Make sure method is `HTTP POST`.

## 4. Expose Local Server via ngrok

Run:

```bash
ngrok http 3000
```

Copy the HTTPS forwarding URL and use it in Twilio webhook:

`https://YOUR_NGROK_URL/api/whatsapp/webhook`

## 5. How to Test

1. Ensure Next.js dev server is running on port `3000`.
2. Ensure ngrok tunnel is active.
3. Ensure Twilio sandbox webhook points to your ngrok `/api/whatsapp/webhook`.
4. Send any WhatsApp message from your joined phone number to the Twilio sandbox WhatsApp number.
5. You should receive an AI response from the salon assistant.

## 6. Notes

- Service data comes from SQLite (`salon.db`) via `/api/services`.
- Conversation history is stored in `conversations` table.
- Incoming WhatsApp users are tracked in `whatsapp_users`.
- If the AI response exceeds 1500 chars, messages are split and sent as multiple WhatsApp messages.
