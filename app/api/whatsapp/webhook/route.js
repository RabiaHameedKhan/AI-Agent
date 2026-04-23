import {
  getConversationHistory,
  getOrCreateWhatsAppUser,
  saveMessage,
} from "@/lib/conversation";
import { runAgentLoop } from "@/lib/whatsapp-agent";
import { sendWhatsAppMessage } from "@/lib/twilio";

export async function POST(request) {
  let phoneNumber = "";

  try {
    const formData = await request.formData();
    const from = String(formData.get("From") || "");
    const messageBody = String(formData.get("Body") || "").trim();
    const profileName = String(formData.get("ProfileName") || "").trim();

    phoneNumber = from.replace(/^whatsapp:/, "").trim();
    console.log("[whatsapp:webhook] Incoming message", {
      from,
      phoneNumber,
      profileName,
      hasBody: Boolean(messageBody),
    });

    if (!phoneNumber) {
      console.warn("[whatsapp:webhook] Missing phone number in webhook payload");
      return new Response("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    const user = await getOrCreateWhatsAppUser(phoneNumber, profileName);

    if (messageBody) {
      await saveMessage(phoneNumber, "user", messageBody);
    }

    const conversationHistory = await getConversationHistory(phoneNumber, 20);
    console.log("[whatsapp:webhook] Loaded conversation history", {
      phoneNumber,
      messageCount: conversationHistory.length,
    });

    const agentResponse = await runAgentLoop({
      phoneNumber,
      customerName: user?.name || "",
      conversationHistory,
    });
    console.log("[whatsapp:webhook] Generated agent response", {
      phoneNumber,
      responseLength: agentResponse.length,
      preview: agentResponse.slice(0, 120),
    });

    await saveMessage(phoneNumber, "assistant", agentResponse);
    await sendWhatsAppMessage(phoneNumber, agentResponse);
    console.log("[whatsapp:webhook] Sent WhatsApp response", { phoneNumber });

    return new Response("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("[whatsapp:webhook] Failed to handle incoming WhatsApp message", {
      phoneNumber,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (phoneNumber) {
      try {
        await sendWhatsAppMessage(
          phoneNumber,
          "Sorry, something went wrong. Please try again."
        );
        console.log("[whatsapp:webhook] Sent fallback error message", { phoneNumber });
      } catch (sendError) {
        console.error("[whatsapp:webhook] Failed to send fallback error message", {
          phoneNumber,
          error: sendError instanceof Error ? sendError.message : String(sendError),
        });
      }
    }

    return new Response("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  }
}
