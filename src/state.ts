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
}

class ConversationState {
  private conversations: Map<string, number>;
  private isActive: boolean;

  constructor() {
    this.conversations = new Map();
    this.isActive = true;
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

  getStats(): StateStats {
    return {
      totalConversations: this.conversations.size,
      conversations: Array.from(this.conversations.entries()).map(([chatId, count]) => ({
        chatId,
        messageCount: count
      })),
      isActive: this.isActive
    };
  }
}

export default new ConversationState();
