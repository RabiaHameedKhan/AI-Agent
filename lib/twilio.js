import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function splitBySentenceBoundaries(text, maxLength = 1500) {
  if (!text) return [""];
  if (text.length <= maxLength) return [text];

  const sentences = text.match(/[^.!?]+[.!?]?/g) || [text];
  const chunks = [];
  let currentChunk = "";

  for (const sentenceRaw of sentences) {
    const sentence = sentenceRaw.trim();
    if (!sentence) continue;

    if (sentence.length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }

      for (let i = 0; i < sentence.length; i += maxLength) {
        chunks.push(sentence.slice(i, i + maxLength).trim());
      }
      continue;
    }

    const nextChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
    if (nextChunk.length > maxLength) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk = nextChunk;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text.slice(0, maxLength)];
}

export async function sendWhatsAppMessage(to, body) {
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  if (!fromNumber) {
    throw new Error("TWILIO_WHATSAPP_NUMBER is not configured.");
  }

  const content = typeof body === "string" ? body : String(body ?? "");
  const chunks = splitBySentenceBoundaries(content, 1500);

  for (const chunk of chunks) {
    const result = await client.messages.create({
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${to}`,
      body: chunk,
    });
    console.log("[twilio] Outbound WhatsApp message sent", {
      sid: result.sid,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${to}`,
      chunkLength: chunk.length,
      status: result.status,
    });
  }
}
