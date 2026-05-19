import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { getApiUrl } from "@/config/api";
import {
  clearChatbotMessages,
  DEFAULT_CHAT_MESSAGES,
  loadChatbotMessages,
  saveChatbotMessages,
} from "@/utils/chatbot-session";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

function isGenericTypingElement(el) {
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toUpperCase();
  if (tag === "TEXTAREA") return true;
  if (tag === "INPUT") {
    const t = String(el.type || "text").toLowerCase();
    return (
      ["text", "search", "email", "url", "tel", "password", "number"].includes(
        t
      ) || t === ""
    );
  }
  return Boolean(el.isContentEditable);
}

function Chatbot() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const userId = user?._id ?? null;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => loadChatbotMessages(userId));
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const chatPanelRef = useRef(null);
  const pointerDownInsidePanelRef = useRef(false);
  const authSnapshotRef = useRef({ isAuthenticated, userId });

  function scrollMessagesToBottom() {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function insertSpaceInComposer() {
    const el = inputRef.current;
    if (!el || el.disabled) return;

    let caretNext = el.value.length + 1;
    el.focus();

    setInput((prev) => {
      const ln = prev.length;
      const rawStart =
        typeof el.selectionStart === "number" ? el.selectionStart : ln;
      const rawEnd =
        typeof el.selectionEnd === "number" ? el.selectionEnd : ln;
      const safeStart = Math.max(0, Math.min(rawStart, ln));
      const safeEnd = Math.max(0, Math.min(rawEnd, ln));
      caretNext = safeStart + 1;
      return prev.slice(0, safeStart) + " " + prev.slice(safeEnd);
    });

    requestAnimationFrame(() => {
      const node = inputRef.current;
      if (!node || node.disabled) return;
      const max = node.value.length;
      const caret = Math.max(0, Math.min(caretNext, max));
      try {
        node.setSelectionRange(caret, caret);
      } catch {
        /* ignore */
      }
    });
  }

  function isInteractingWithChatPanel(active = document.activeElement) {
    const panel = chatPanelRef.current;
    if (!panel) return false;

    if (panel.contains(active)) return true;

    if (
      (active === document.body || active === document.documentElement) &&
      pointerDownInsidePanelRef.current
    ) {
      return true;
    }

    return false;
  }

  useEffect(() => {
    setMessages(loadChatbotMessages(userId));
  }, [userId]);

  useEffect(() => {
    saveChatbotMessages(userId, messages);
  }, [messages, userId]);

  useEffect(() => {
    const prev = authSnapshotRef.current;

    if (prev.isAuthenticated && prev.userId && !isAuthenticated) {
      clearChatbotMessages(prev.userId);
      setMessages(DEFAULT_CHAT_MESSAGES);
    }

    authSnapshotRef.current = { isAuthenticated, userId };
  }, [isAuthenticated, userId]);

  useEffect(() => {
    scrollMessagesToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current && !inputRef.current.disabled) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      pointerDownInsidePanelRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function onPointerDownCapture(e) {
      pointerDownInsidePanelRef.current = Boolean(
        chatPanelRef.current?.contains(e.target)
      );
    }

    document.addEventListener("pointerdown", onPointerDownCapture, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDownCapture, true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function onWindowKeyDownCapture(e) {
      if (e.key !== " " && e.code !== "Space") return;

      const active = document.activeElement;

      if (active === inputRef.current && !inputRef.current?.disabled) {
        return;
      }

      if (
        isGenericTypingElement(active) &&
        !chatPanelRef.current?.contains(active)
      ) {
        return;
      }

      if (!isInteractingWithChatPanel(active)) {
        return;
      }

      if (active?.tagName === "BUTTON" && chatPanelRef.current?.contains(active)) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      if (!inputRef.current?.disabled) {
        insertSpaceInComposer();
      }
    }

    window.addEventListener("keydown", onWindowKeyDownCapture, true);
    return () =>
      window.removeEventListener("keydown", onWindowKeyDownCapture, true);
  }, [isOpen]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const historyForApi = [...messages, userMessage].map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        content: m.content,
      }));

      const { data } = await axios.post(
        getApiUrl("/api/chat"),
        { message: trimmed, history: historyForApi },
        { withCredentials: true }
      );

      if (!data?.success) {
        throw new Error(data?.message || "Chatbot không thể trả lời lúc này.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.data.reply,
        },
      ]);
    } catch (error) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Xin lỗi, đã xảy ra lỗi kết nối. Vui lòng thử lại sau.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: serverMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-28 right-8 z-50 w-16 h-16 bg-black text-white rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-white/20"
        aria-label={isOpen ? "Đóng chat" : "Mở chat"}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {isOpen && (
        <div
          ref={chatPanelRef}
          className="fixed bottom-44 right-8 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-12rem)] bg-white border border-gray-200 rounded-lg shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-100 bg-black text-white">
            <p
              className="text-sm font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Saint Laurent
            </p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 mt-0.5">
              Trợ lý tư vấn thời trang
            </p>
          </div>

          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-black text-white rounded-t-xl rounded-bl-xl"
                      : "bg-gray-100 text-gray-800 rounded-t-xl rounded-br-xl"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 rounded-t-xl rounded-br-xl px-4 py-2.5 text-[13px] flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang trả lời...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              disabled={isLoading}
              className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 focus:outline-none focus:border-gray-400 transition-colors disabled:opacity-50 placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Gửi"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
