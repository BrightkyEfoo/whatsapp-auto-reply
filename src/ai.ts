import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Génère une réponse basée sur le message reçu
 * @param message - Message reçu
 * @param count - Numéro du message dans la conversation
 * @returns Réponse générée
 */
export async function generateReply(message: string, count: number): Promise<string> {
  const maxMessages = parseInt(process.env.MAX_MESSAGES || "3");

  // Si on a atteint le max, message de fin
  if (count >= maxMessages) {
    return "Je suis vraiment fatigué 😅 je vais dormir, on se parle plutard ❤️";
  }

  const prompt = `Tu réponds à des messages WhatsApp de ta copine.

Contexte :
- Vous êtes dans une relation
- Ton naturel, affectueux mais pas trop
- Messages courts et spontanés
- Utilise des emojis de temps en temps (pas à chaque message)
- Pas trop parfait, reste humain
- Varie le style : parfois juste un emoji, parfois une phrase

Important :
- NE réponds PAS comme un assistant
- Réponds comme un être humain dans une vraie conversation
- Sois cohérent avec le message reçu
- Reste bref (1-2 phrases max)

Message reçu :
"${message}"

Réponds de manière naturelle et directe :`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Tu es dans une conversation WhatsApp naturelle. Réponds de manière spontanée, brève et authentique."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 100,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return content.trim();
  } catch (error) {
    console.error("❌ Erreur OpenAI:", error instanceof Error ? error.message : error);
    throw error;
  }
}
