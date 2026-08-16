"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatMessage, { Message } from "@/components/ChatMessage";
import TypingIndicator from "@/components/TypingIndicator";
import Sidebar from "@/components/Sidebar";
import { IconSearch, IconArrowUp, IconAlert, IconInfo } from "@/components/Icons";

const SUGGESTIONS = [
  "What is the main contribution of this paper?",
  "Summarize the methodology used",
  "What are the key findings?",
];

// Known papers in the system
const PAPERS = [
  { name: "paper.pdf", size: "1.5 MB" },
  { name: "resume.pdf", size: "112 KB" },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleUploadClick = useCallback(() => {
    setToast("Upload endpoint not configured yet");
  }, []);

  async function handleSend(question?: string) {
    const q = (question || input).trim();
    if (!q || isLoading) return;

    setError(null);
    setInput("");

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: q,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok) {
        throw new Error(`Server error (${res.status})`);
      }

      const data = await res.json();

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: data.answer,
        sources: data.sources,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const showWelcome = messages.length === 0 && !isLoading;

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar papers={PAPERS} onUploadClick={handleUploadClick} />

      {/* Main Panel */}
      <main className="main-panel">
        {/* Header */}
        <header className="main-header">
          <div className="main-header-status">
            <span className="status-dot" />
            Ready
          </div>
        </header>

        {/* Chat Area */}
        <div className="chat-area" ref={chatAreaRef}>
          {showWelcome ? (
            <div className="welcome">
              <div className="welcome-icon">
                <IconSearch size={22} />
              </div>
              <h2>Ask anything about your papers</h2>
              <p>
                Your research papers have been analyzed and indexed.
                Ask a question below or try one of these suggestions.
              </p>
              <div className="welcome-suggestions">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    className="suggestion-chip"
                    onClick={() => handleSend(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && <TypingIndicator />}
              {error && (
                <div className="error-bubble">
                  <IconAlert size={14} />
                  {error} — Please try again.
                </div>
              )}
            </>
          )}
        </div>

        {/* Input */}
        <div className="input-area">
          <div className="input-wrapper">
            <input
              ref={inputRef}
              id="question-input"
              className="input-field"
              type="text"
              placeholder="Ask a question about your papers..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              id="send-button"
              className="send-button"
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <IconArrowUp size={16} />
            </button>
          </div>
          <p className="input-hint">Press Enter to send</p>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="toast-overlay">
          <div className="toast">
            <IconInfo size={14} />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
