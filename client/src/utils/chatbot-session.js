const STORAGE_PREFIX = "sl-chatbot:";
const MAX_STORED_MESSAGES = 80;

export const DEFAULT_CHAT_MESSAGES = [
  {
    role: "assistant",
    content:
      "Xin chào! Tôi là trợ lý tư vấn của Saint Laurent. Tôi có thể giúp bạn tìm sản phẩm, tư vấn phối đồ hoặc giải đáp thắc mắc. Bạn cần hỗ trợ gì?",
  },
];

function getStorageKey(userId) {
  return userId ? `${STORAGE_PREFIX}${userId}` : `${STORAGE_PREFIX}guest`;
}

function isValidMessage(message) {
  return (
    message &&
    typeof message === "object" &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0
  );
}

export function loadChatbotMessages(userId) {
  try {
    const raw = sessionStorage.getItem(getStorageKey(userId));
    if (!raw) return DEFAULT_CHAT_MESSAGES;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_CHAT_MESSAGES;

    const messages = parsed.filter(isValidMessage);
    return messages.length > 0 ? messages : DEFAULT_CHAT_MESSAGES;
  } catch {
    return DEFAULT_CHAT_MESSAGES;
  }
}

export function saveChatbotMessages(userId, messages) {
  if (!Array.isArray(messages) || messages.length === 0) return;

  try {
    const payload = messages
      .filter(isValidMessage)
      .slice(-MAX_STORED_MESSAGES);
    sessionStorage.setItem(getStorageKey(userId), JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearChatbotMessages(userId) {
  try {
    sessionStorage.removeItem(getStorageKey(userId));
  } catch {
    /* ignore */
  }
}
