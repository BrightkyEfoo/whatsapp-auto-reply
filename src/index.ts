import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import WhatsAppClient from "./whatsapp.js";
import state from "./state.js";

// Configuration
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// WhatsApp client instance
let whatsappClient: WhatsAppClient | null = null;

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Status du bot
app.get("/api/status", (_req: Request, res: Response) => {
  if (!whatsappClient) {
    return res.json({
      initialized: false,
      isReady: false,
      hasQR: false,
      state: state.getStats()
    });
  }

  return res.json({
    initialized: true,
    ...whatsappClient.getStatus()
  });
});

// Démarrer le bot
app.post("/api/start", async (_req: Request, res: Response) => {
  try {
    if (whatsappClient && whatsappClient.isReady) {
      return res.json({
        success: true,
        message: "Bot déjà démarré"
      });
    }

    console.log("🚀 Démarrage du bot WhatsApp...");
    whatsappClient = new WhatsAppClient(io);

    // Initialiser en arrière-plan
    whatsappClient.initialize().catch(error => {
      console.error("❌ Erreur lors de l'initialisation:", error);
      io.emit("error", { message: error instanceof Error ? error.message : "Unknown error" });
    });

    return res.json({
      success: true,
      message: "Bot en cours de démarrage..."
    });
  } catch (error) {
    console.error("❌ Erreur:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Arrêter le bot
app.post("/api/stop", async (_req: Request, res: Response) => {
  try {
    if (!whatsappClient) {
      return res.json({
        success: true,
        message: "Bot déjà arrêté"
      });
    }

    console.log("🛑 Arrêt du bot WhatsApp...");
    await whatsappClient.destroy();
    whatsappClient = null;

    return res.json({
      success: true,
      message: "Bot arrêté"
    });
  } catch (error) {
    console.error("❌ Erreur:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Activer/Désactiver les réponses automatiques
app.post("/api/toggle", (req: Request, res: Response) => {
  const { active } = req.body;
  state.setActive(active);

  console.log(`🔄 Réponses automatiques ${active ? "activées" : "désactivées"}`);
  io.emit("toggle", { active });

  res.json({
    success: true,
    active: state.getActive()
  });
});

// Reset des conversations
app.post("/api/reset", (_req: Request, res: Response) => {
  state.resetAll();
  console.log("🔄 Toutes les conversations ont été réinitialisées");

  io.emit("reset");

  return res.json({
    success: true,
    message: "Conversations réinitialisées"
  });
});

// Historique des messages
app.get("/api/history", (_req: Request, res: Response) => {
  if (!whatsappClient) {
    return res.json([]);
  }

  return res.json(whatsappClient.messageHistory || []);
});

// ========== MORNING MESSAGES ROUTES ==========

// Activer/Désactiver les messages matinaux
app.post("/api/morning/toggle", (req: Request, res: Response) => {
  if (!whatsappClient || !whatsappClient.scheduler) {
    return res.status(400).json({
      success: false,
      message: "Bot non démarré ou scheduler non disponible"
    });
  }

  const { enabled } = req.body;
  whatsappClient.scheduler.setEnabled(enabled);

  console.log(`🌅 Messages matinaux ${enabled ? "activés" : "désactivés"}`);
  io.emit("morning_toggle", { enabled });

  return res.json({
    success: true,
    enabled: whatsappClient.scheduler.getEnabled()
  });
});

// Envoyer un test de messages matinaux immédiatement
app.post("/api/morning/test", async (_req: Request, res: Response) => {
  if (!whatsappClient || !whatsappClient.scheduler) {
    return res.status(400).json({
      success: false,
      message: "Bot non démarré ou scheduler non disponible"
    });
  }

  try {
    // Envoyer en arrière-plan
    whatsappClient.scheduler.sendTestMessage().catch(error => {
      console.error("❌ Erreur test messages matinaux:", error);
    });

    return res.json({
      success: true,
      message: "Envoi des messages de test en cours..."
    });
  } catch (error) {
    console.error("❌ Erreur:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Reset du flag d'envoi journalier (pour forcer un nouvel envoi)
app.post("/api/morning/reset", (_req: Request, res: Response) => {
  if (!whatsappClient || !whatsappClient.scheduler) {
    return res.status(400).json({
      success: false,
      message: "Bot non démarré ou scheduler non disponible"
    });
  }

  whatsappClient.scheduler.resetToday();
  console.log("🔄 Flag d'envoi journalier réinitialisé");

  return res.json({
    success: true,
    message: "Flag d'envoi réinitialisé"
  });
});

// Statistiques des messages matinaux
app.get("/api/morning/stats", (_req: Request, res: Response) => {
  if (!whatsappClient || !whatsappClient.scheduler) {
    return res.json({
      isEnabled: false,
      hasSentToday: false,
      lastSentDate: null,
      totalMessagesSent: 0
    });
  }

  return res.json(whatsappClient.scheduler.getStats());
});

// Socket.IO
io.on("connection", (socket) => {
  console.log("👤 Client connecté:", socket.id);

  // Envoyer le statut initial
  if (whatsappClient) {
    const status = whatsappClient.getStatus();
    if (status.qrCode) {
      socket.emit("qr", status.qrCode);
    }
    if (status.isReady) {
      socket.emit("ready");
    }
  }

  socket.on("disconnect", () => {
    console.log("👤 Client déconnecté:", socket.id);
  });
});

// Démarrage du serveur
httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🤖  WhatsApp Auto-Reply Bot                             ║
║                                                           ║
║  ✅  Serveur démarré sur http://localhost:${PORT}           ║
║                                                           ║
║  📱  Ouvre ton navigateur pour scanner le QR code        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Gestion de l'arrêt propre
process.on("SIGINT", async () => {
  console.log("\n🛑 Arrêt du serveur...");

  if (whatsappClient) {
    await whatsappClient.destroy();
  }

  process.exit(0);
});
