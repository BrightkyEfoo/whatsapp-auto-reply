import OpenAI from "openai";
import { Server as SocketIOServer } from "socket.io";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SchedulerStats {
  totalMessagesSent: number;
  lastSentDate: string | null;
}

interface SchedulerStatus {
  isEnabled: boolean;
  hasSentToday: boolean;
  lastSentDate: string | null;
  totalMessagesSent: number;
}

interface WhatsAppClientInterface {
  isReady: boolean;
  client: any;
}

class MorningMessagesScheduler {
  private whatsappClient: WhatsAppClientInterface;
  private io: SocketIOServer;
  private isEnabled: boolean;
  private hasSentToday: boolean;
  private checkInterval: NodeJS.Timeout | null;
  private stats: SchedulerStats;

  constructor(whatsappClient: WhatsAppClientInterface, io: SocketIOServer) {
    this.whatsappClient = whatsappClient;
    this.io = io;
    this.isEnabled = true;
    this.hasSentToday = false;
    this.checkInterval = null;
    this.stats = {
      totalMessagesSent: 0,
      lastSentDate: null,
    };
  }

  start(): void {
    console.log("📅 Scheduler de messages matinaux démarré");

    // Vérifier toutes les 5 minutes si on est dans la plage horaire
    this.checkInterval = setInterval(() => {
      this.checkAndSendMorningMessages();
    }, 5 * 60 * 1000); // 5 minutes

    // Vérifier immédiatement au démarrage
    this.checkAndSendMorningMessages();
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log("📅 Scheduler arrêté");
    }
  }

  async checkAndSendMorningMessages(): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    if (!this.whatsappClient || !this.whatsappClient.isReady) {
      return;
    }

    const now = new Date();
    const hour = now.getHours();
    const today = now.toDateString();

    // Vérifier si on a déjà envoyé aujourd'hui
    if (this.hasSentToday && this.stats.lastSentDate === today) {
      return;
    }

    // Reset à minuit
    if (this.stats.lastSentDate && this.stats.lastSentDate !== today) {
      this.hasSentToday = false;
    }

    // Vérifier si on est dans la plage horaire (8h-10h)
    const startHour = parseInt(process.env.MORNING_START_HOUR || "8");
    const endHour = parseInt(process.env.MORNING_END_HOUR || "10");

    if (hour >= startHour && hour < endHour && !this.hasSentToday) {
      console.log(`🌅 Il est ${hour}h - Envoi des messages matinaux...`);
      await this.sendMorningMessages();
      this.hasSentToday = true;
      this.stats.lastSentDate = today;
    }
  }

  async sendMorningMessages(): Promise<void> {
    try {
      const girlfriendNumber = process.env.GIRLFRIEND_NUMBER;

      if (!girlfriendNumber) {
        console.error("❌ Aucun numéro configuré");
        return;
      }

      // Nombre aléatoire de messages entre 2 et 6
      const minMessages = parseInt(process.env.MORNING_MIN_MESSAGES || "2");
      const maxMessages = parseInt(process.env.MORNING_MAX_MESSAGES || "6");
      const messageCount = Math.floor(Math.random() * (maxMessages - minMessages + 1)) + minMessages;

      console.log(`💬 Envoi de ${messageCount} messages...`);

      this.io.emit("morning_messages_start", {
        count: messageCount,
        timestamp: new Date().toISOString()
      });

      // Envoyer les messages avec des délais aléatoires
      for (let i = 0; i < messageCount; i++) {
        // Délai aléatoire entre 2 et 8 minutes (sauf pour le premier message)
        if (i > 0) {
          const delayMinutes = Math.floor(Math.random() * 7) + 2; // 2-8 minutes
          const delayMs = delayMinutes * 60 * 1000;

          console.log(`⏳ Attente de ${delayMinutes} minutes avant le prochain message...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        const message = await this.generateMorningMessage(i, messageCount);
        console.log(`📤 Envoi du message ${i + 1}/${messageCount}: "${message}"`);

        await this.sendMessage(girlfriendNumber, message);

        this.stats.totalMessagesSent++;

        this.io.emit("morning_message_sent", {
          message,
          index: i + 1,
          total: messageCount,
          timestamp: new Date().toISOString()
        });
      }

      console.log(`✅ Tous les messages matinaux ont été envoyés (${messageCount})`);

      this.io.emit("morning_messages_complete", {
        count: messageCount,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("❌ Erreur lors de l'envoi des messages matinaux:", error);
      this.io.emit("morning_messages_error", {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  }

  private async generateMorningMessage(index: number, total: number): Promise<string> {
    const useAI = process.env.USE_AI_MORNING === "true";

    if (useAI) {
      // Utiliser OpenAI pour générer des messages variés
      const prompts = [
        "un message matinal affectueux pour dire bonjour à ta copine",
        "un message pour demander si elle a bien dormi, de manière naturelle et affectueuse",
        "un message pour lui souhaiter une bonne journée à l'école",
        "un message affectueux et encourageant pour sa journée",
        "un message court et mignon avec un emoji",
        "un message pour lui dire que tu penses à elle"
      ];

      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

      try {
        const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Tu écris des messages WhatsApp courts, naturels et affectueux pour ta copine. Sois spontané, utilise des emojis avec modération. Messages de 1-2 phrases max. Varie le style : parfois juste un emoji, parfois une phrase, parfois une question."
            },
            {
              role: "user",
              content: `Écris ${randomPrompt}. Sois naturel et authentique, comme dans une vraie relation.`
            }
          ],
          temperature: 1.0,
          max_tokens: 80,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("No response from OpenAI");
        }

        return content.trim();
      } catch (error) {
        console.error("❌ Erreur OpenAI, utilisation des messages prédéfinis");
        return this.getRandomPresetMessage();
      }
    } else {
      return this.getRandomPresetMessage();
    }
  }

  private getRandomPresetMessage(): string {
    const messages = [
      "Bonjour b ❤️",
      "Bien dormi ? 😊",
      "Bonne journée à l'école ✨",
      "Je pense à toi 💭",
      "Courage pour aujourd'hui 💪",
      "T'es la meilleure 🌟",
      "Passe une belle journée ☀️",
      "J'espère que ta journée se passe bien 😊",
      "Tu me manques déjà 💕",
      "Fais de beaux rêves... ah non attends t'es réveillée 😅",
      "Bébé ❤️",
      "N'oublie pas que t'es incroyable 🥰",
      "Bisous 😘",
      "Je t'aime ❤️",
      "Comment tu te sens ce matin ? 🌸",
      "Prête pour ta journée ? 💪",
      "Mange bien à midi hein 🍽️",
      "Tu vas gérer ta journée j'en suis sûr 🔥",
      "Profite bien de ta journée mon cœur 💝"
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  private async sendMessage(to: string, message: string): Promise<void> {
    if (!this.whatsappClient || !this.whatsappClient.client) {
      throw new Error("Client WhatsApp non disponible");
    }

    const chat = await this.whatsappClient.client.getChatById(to);
    await chat.sendMessage(message);
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`📅 Messages matinaux ${enabled ? "activés" : "désactivés"}`);
  }

  getEnabled(): boolean {
    return this.isEnabled;
  }

  resetToday(): void {
    this.hasSentToday = false;
    console.log("🔄 Reset du flag d'envoi journalier");
  }

  getStats(): SchedulerStatus {
    return {
      isEnabled: this.isEnabled,
      hasSentToday: this.hasSentToday,
      lastSentDate: this.stats.lastSentDate,
      totalMessagesSent: this.stats.totalMessagesSent
    };
  }

  async sendTestMessage(): Promise<void> {
    console.log("🧪 Envoi d'un message de test...");
    await this.sendMorningMessages();
  }
}

export default MorningMessagesScheduler;
