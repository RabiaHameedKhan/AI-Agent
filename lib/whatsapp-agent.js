import { dispatchTool } from "@/lib/agent-tools";

const FALLBACK_MESSAGE = "I'm sorry, I had trouble processing that. Please try again.";

export const tools = [
  {
    name: "get_services",
    description: "Get all salon services.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "check_availability",
    description: "Check available appointment slots for a date.",
    input_schema: {
      type: "object",
      properties: {
        date: { type: "string" },
        service_name: { type: "string" },
      },
      required: ["date"],
    },
  },
  {
    name: "book_appointment",
    description: "Book an appointment for a customer.",
    input_schema: {
      type: "object",
      properties: {
        service_name: { type: "string" },
        appointment_date: { type: "string" },
        appointment_time: { type: "string" },
        customer_name: { type: "string" },
        notes: { type: "string" },
      },
      required: ["service_name", "appointment_date", "appointment_time"],
    },
  },
  {
    name: "get_my_bookings",
    description: "Get bookings for this customer.",
    input_schema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["confirmed", "cancelled", "all"] },
      },
      required: [],
    },
  },
  {
    name: "cancel_booking",
    description: "Cancel a booking by ID.",
    input_schema: {
      type: "object",
      properties: {
        booking_id: { type: "integer" },
      },
      required: ["booking_id"],
    },
  },
  {
    name: "send_message_to_salon",
    description: "Send a customer message to the salon team.",
    input_schema: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
      required: ["message"],
    },
  },
  {
    name: "get_salon_info",
    description: "Get salon contact and policy information.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "save_customer_name",
    description: "Save or update the customer's name.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
      },
      required: ["name"],
    },
  },
];

const groqTools = tools.map((tool) => ({
  type: "function",
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.input_schema,
  },
}));

export function SYSTEM_PROMPT({ phoneNumber, customerName, today }) {
  return `You are Aria, AI concierge for Lumière Salon via WhatsApp.
Be warm, elegant, and concise. Use WhatsApp formatting: *bold* for names/prices,
numbered lists, emojis naturally (💅✂️💆‍♀️📅✅).
Keep messages under 1500 characters. If longer, summarize.
Always confirm before booking (repeat service, date, time back to user).
Ask for name if unknown. Today: ${today}. User phone: ${phoneNumber}. Name: ${customerName}.`;
}

function normalizeConversationHistory(conversationHistory = []) {
  return conversationHistory
    .filter((m) => m && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({
      role: m.role,
      content: typeof m.content === "string" ? m.content : String(m.content ?? ""),
    }));
}

function stringifyToolResult(result) {
  if (typeof result === "string") return result;
  try {
    return JSON.stringify(result);
  } catch {
    return "Tool execution completed.";
  }
}

function parseToolArguments(rawArguments) {
  if (!rawArguments) return {};
  if (typeof rawArguments === "object") return rawArguments;
  try {
    return JSON.parse(rawArguments);
  } catch {
    return {};
  }
}

async function callGroq(messages, systemPrompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { error: "GROQ_API_KEY is missing." };
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.4,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      tools: groqTools,
      tool_choice: "auto",
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    return { error: `Groq request failed with status ${response.status}.` };
  }

  const data = await response.json();
  const choice = data?.choices?.[0]?.message;
  if (!choice) {
    return { error: "Groq response was empty." };
  }

  return { message: choice };
}

export async function runAgentLoop({ phoneNumber, customerName, conversationHistory }) {
  try {
    const messages = normalizeConversationHistory(conversationHistory);
    const maxIterations = 5;
    const today = new Date().toISOString().slice(0, 10);
    const systemPrompt = SYSTEM_PROMPT({
      phoneNumber,
      customerName: customerName || "Unknown",
      today,
    });

    for (let i = 0; i < maxIterations; i += 1) {
      const { message, error } = await callGroq(messages, systemPrompt);
      if (error || !message) {
        return FALLBACK_MESSAGE;
      }

      const toolCalls = message.tool_calls || [];
      if (toolCalls.length === 0) {
        const text = typeof message.content === "string" ? message.content.trim() : "";
        return text || FALLBACK_MESSAGE;
      }

      messages.push({
        role: "assistant",
        content: message.content || "",
        tool_calls: toolCalls,
      });

      for (const toolCall of toolCalls) {
        const toolName = toolCall?.function?.name;
        const toolInput = parseToolArguments(toolCall?.function?.arguments);

        let result;
        try {
          result = await Promise.resolve(
            dispatchTool(toolName, toolInput, phoneNumber, customerName)
          );
        } catch {
          result = { success: false, error: "Tool execution failed." };
        }

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: stringifyToolResult(result),
        });
      }
    }

    return FALLBACK_MESSAGE;
  } catch {
    return FALLBACK_MESSAGE;
  }
}
