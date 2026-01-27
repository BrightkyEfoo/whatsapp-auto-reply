/**
 * Gestion de l'état des conversations
 */

interface ConversationInfo {
  chatId: string;
  messageCount: number;
}

interface StateStats {
  totalConversations: number;
  conversations: ConversationInfo[];
  isActive: boolean;
  pausedUntil: string | null;
}

class ConversationState {
  private conversations: Map<string, number>;
  private isActive: boolean;
  private pausedUntil: Date | null;

  constructor() {
    this.conversations = new Map();
    this.isActive = true;
    this.pausedUntil = null;
  }

  increment(chatId: string): number {
    const count = this.conversations.get(chatId) || 0;
    const newCount = count + 1;
    this.conversations.set(chatId, newCount);
    return newCount;
  }

  getCount(chatId: string): number {
    return this.conversations.get(chatId) || 0;
  }

  reset(chatId: string): void {
    this.conversations.delete(chatId);
  }

  resetAll(): void {
    this.conversations.clear();
  }

  setActive(active: boolean): void {
    this.isActive = active;
  }

  getActive(): boolean {
    return this.isActive;
  }

  pauseUntilTomorrow(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    this.pausedUntil = tomorrow;
    console.log(`⏸️  Bot mis en pause jusqu'à demain: ${tomorrow.toISOString()}`);
  }

  isPaused(): boolean {
    if (!this.pausedUntil) return false;

    const now = new Date();
    if (now >= this.pausedUntil) {
      // La pause est terminée
      this.pausedUntil = null;
      console.log("▶️  Bot réactivé (fin de pause)");
      return false;
    }
    return true;
  }

  isPastCutoffTime(): boolean {
    const now = new Date();
    // Convertir en GMT+1
    const gmt1Hour = now.getUTCHours() + 1;
    const cutoffHour = 13; // 13h GMT+1

    if (gmt1Hour >= cutoffHour) {
      return true;
    }
    return false;
  }

  canRespond(): boolean {
    // Vérifier si le bot peut répondre
    if (!this.isActive) {
      return false;
    }
    if (this.isPaused()) {
      return false;
    }
    if (this.isPastCutoffTime()) {
      return false;
    }
    return true;
  }

  getStats(): StateStats {
    return {
      totalConversations: this.conversations.size,
      conversations: Array.from(this.conversations.entries()).map(([chatId, count]) => ({
        chatId,
        messageCount: count
      })),
      isActive: this.isActive,
      pausedUntil: this.pausedUntil ? this.pausedUntil.toISOString() : null
    };
  }
}

export default new ConversationState();
