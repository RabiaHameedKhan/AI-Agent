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
    if (!phoneNumber) {
      return new Response("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    const user = await getOrCreateWhatsAppUser(phoneNumber, profileName);

    if (messageBody) {
      await saveMessage(phoneNumber, "user", messageBody);
    }

    const conversationHistory = await getConversationHistory(phoneNumber, 20);

    const agentResponse = await runAgentLoop({
      phoneNumber,
      customerName: user?.name || "",
      conversationHistory,
    });

    await saveMessage(phoneNumber, "assistant", agentResponse);
    await sendWhatsAppMessage(phoneNumber, agentResponse);

    return new Response("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    if (phoneNumber) {
      try {
        await sendWhatsAppMessage(
          phoneNumber,
          "Sorry, something went wrong. Please try again."
        );
      } catch (sendError) {
        // Ignore secondary errors to keep webhook response stable.
      }
    }

    return new Response("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  }
}
