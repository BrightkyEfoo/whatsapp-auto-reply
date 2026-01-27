import { Client, LocalAuth, Message } from "whatsapp-web.js";
import { Server as SocketIOServer } from "socket.io";
import { generateReply } from "./ai.js";
import state from "./state.js";
import MorningMessagesScheduler from "./scheduler.js";

interface MessageInfo {
  from?: string;
  to?: string;
  body: string;
  timestamp: string;
  type?: string;
  messageCount?: number;
}

interface StatusResponse {
  isReady: boolean;
  hasQR: boolean;
  qrCode: string | null;
  state: any;
  messageHistory: MessageInfo[];
  scheduler: any;
}

class WhatsAppClient {
  io: SocketIOServer;
  client: Client | null;
  qrCode: string | null;
  isReady: boolean;
  messageHistory: MessageInfo[];
  scheduler: MorningMessagesScheduler | null;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.client = null;
    this.qrCode = null;
    this.isReady = false;
    this.messageHistory = [];
    this.scheduler = null;
  }

  async initialize(): Promise<void> {
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: ".wwebjs_auth"
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    this.setupEventHandlers();
    await this.client.initialize();
  }

  private setupEventHandlers(): void {
    if (!this.client) return;

    // QR Code généré
    this.client.on("qr", (qr: string) => {
      console.log("📱 QR Code généré");
      this.qrCode = qr;
      this.io.emit("qr", qr);
    });

    // Prêt
    this.client.on("ready", () => {
      console.log("✅ WhatsApp connecté et prêt");
      this.isReady = true;
      this.qrCode = null;
      this.io.emit("ready");

      // Démarrer le scheduler de messages matinaux
      if (!this.scheduler) {
        this.scheduler = new MorningMessagesScheduler(this, this.io);
        this.scheduler.start();
      }
    });

    // Authentification réussie
    this.client.on("authenticated", () => {
      console.log("🔐 Authentification réussie");
      this.io.emit("authenticated");
    });

    // Échec d'authentification
    this.client.on("auth_failure", (msg: string) => {
      console.error("❌ Échec d'authentification:", msg);
      this.io.emit("auth_failure", msg);
    });

    // Déconnecté
    this.client.on("disconnected", (reason: string) => {
      console.log("🔌 Déconnecté:", reason);
      this.isReady = false;
      this.io.emit("disconnected", reason);
    });

    // Message reçu
    this.client.on("message", async (msg: Message) => {
      await this.handleMessage(msg);
    });
  }

  private async handleMessage(msg: Message): Promise<void> {
    const girlfriendNumber = process.env.GIRLFRIEND_NUMBER;

    // Ignore si ce n'est pas le bon numéro
    if (msg.from !== girlfriendNumber) {
      return;
    }

    const messageInfo: MessageInfo = {
      from: msg.from,
      body: msg.body,
      timestamp: new Date().toISOString()
    };

    this.messageHistory.unshift(messageInfo);
    if (this.messageHistory.length > 50) {
      this.messageHistory = this.messageHistory.slice(0, 50);
    }

    console.log(`📨 Message reçu: "${msg.body}"`);
    this.io.emit("message_received", messageInfo);

    // Vérifier si le message commence par "!" pour mettre en pause
    if (msg.body.trim().startsWith("!")) {
      console.log("⏸️  Message avec '!' détecté - mise en pause jusqu'à demain");
      state.pauseUntilTomorrow();
      this.io.emit("bot_paused", { until: state.getStats().pausedUntil });
      return;
    }

    // Vérifier si le bot peut répondre (actif, pas en pause, pas après 13h)
    if (!state.canRespond()) {
      if (state.isPaused()) {
        console.log("⏸️  Bot en pause - message ignoré");
      } else if (state.isPastCutoffTime()) {
        console.log("🕐 Après 13h (GMT+1) - bot ne répond plus");
      } else {
        console.log("🔕 Bot désactivé - message ignoré");
      }
      return;
    }

    try {
      // Incrémenter le compteur
      const count = state.increment(msg.from);
      console.log(`📊 Message n°${count}`);

      // Délai aléatoire pour paraître naturel
      const minDelay = parseInt(process.env.RESPONSE_DELAY_MIN || "3") * 1000;
      const maxDelay = parseInt(process.env.RESPONSE_DELAY_MAX || "8") * 1000;
      const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

      console.log(`⏳ Attente de ${delay / 1000}s avant de répondre...`);
      await new Promise(r => setTimeout(r, delay));

      // Générer la réponse
      const reply = await generateReply(msg.body, count);
      console.log(`💬 Réponse: "${reply}"`);

      // Envoyer la réponse
      await msg.reply(reply);

      const responseInfo: MessageInfo = {
        to: msg.from,
        body: reply,
        timestamp: new Date().toISOString(),
        messageCount: count,
        type: "sent"
      };

      this.messageHistory.unshift(responseInfo);
      this.io.emit("message_sent", responseInfo);

      // Reset si on a atteint le max
      const maxMessages = parseInt(process.env.MAX_MESSAGES || "3");
      if (count >= maxMessages) {
        console.log("😴 Limite atteinte - reset de la conversation");
        state.reset(msg.from);
      }
    } catch (error) {
      console.error("❌ Erreur lors du traitement du message:", error);
      this.io.emit("error", {
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  }

  getStatus(): StatusResponse {
    return {
      isReady: this.isReady,
      hasQR: !!this.qrCode,
      qrCode: this.qrCode,
      state: state.getStats(),
      messageHistory: this.messageHistory.slice(0, 20),
      scheduler: this.scheduler ? this.scheduler.getStats() : null
    };
  }

  async destroy(): Promise<void> {
    if (this.scheduler) {
      this.scheduler.stop();
      this.scheduler = null;
    }
    if (this.client) {
      await this.client.destroy();
    }
  }
}

export default WhatsAppClient;
