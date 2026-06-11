import { useState } from "react";
import { Bot, X, Send } from "lucide-react";
import { getToken } from "../auth";
import "../styles/AskAIInput.css";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface LisaResponse {
  choices?: Array<{
    message: {
      content: string;
    };
  }>;
}

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? "";

interface AskAIInputProps {
  placeholder?: string;
  initialMessages?: Message[];
}

export function AskAIInput({ 
  placeholder = "Ask AI Assistant...", 
  initialMessages = [{ role: "system" as const, content: "You are a helpful assistant." }] 
}: AskAIInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>(initialMessages);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = getToken();

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!token) {
      setError("Please login to chat");
      return;
    }

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...chatHistory, userMessage];
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${ALLOWED_HOST}:3000/lisa/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: newMessages,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Error: ${response.status}`);
      }

      const data: LisaResponse = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.choices?.[0]?.message?.content || "No response",
      };
      const updatedHistory = [...newMessages, assistantMessage];
      setChatHistory(updatedHistory);
      setMessages(updatedHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setMessages(chatHistory);
    setInput("");
    setError(null);
  };

  if (isOpen) {
    return (
      <div className="ai-chat-container">
        <div className="ai-chat-header">
          <div className="ai-chat-title">
            <div className="ai-chat-icon-small">
              <Bot size={20} />
            </div>
            <span>Chat with Lisa</span>
          </div>
          <button className="ai-chat-close" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <div className="ai-chat-messages">
          {messages.slice(1).map((msg, i) => (
            <div
              key={i}
              className={`ai-message ${msg.role === "user" ? "user" : "assistant"}`}
            >
              <div className="ai-message-content">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="ai-message assistant">
              <div className="ai-message-content loading">Thinking...</div>
            </div>
          )}
          {error && (
            <div className="ai-message error">
              <div className="ai-message-content">{error}</div>
            </div>
          )}
        </div>

        <div className="ai-chat-input-area">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="ai-chat-textarea"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="ai-send-button"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-input-row">
      <div className="ai-input-icon">
        <Bot size={26} />
      </div>
      <button 
        type="button" 
        className="ai-input-button"
        onClick={() => setIsOpen(true)}
      >
        {placeholder}
      </button>
    </div>
  );
}
