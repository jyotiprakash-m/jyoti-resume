"use client";

import React, { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "agent";
  content: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL_SUPPLYCHAIN || "http://localhost:9090";

export default function AgentChatPage(): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: Message = { role: "user", content: trimmed };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/agent/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.detail || "Agent error");
      }

      const data = await response.json();
      const agentMessage: Message = {
        role: "agent",
        content: data.response ?? "No response from agent.",
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to contact agent.";
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: `Error: ${message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] py-12 px-4 flex flex-col items-center">
      <section className="w-full max-w-5xl flex h-[90vh] max-h-[95vh] flex-col gap-0 rounded-2xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-xl">
        <header className="px-8 py-6 border-b border-white/10 flex items-center gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-400">
            Agent Chat
          </span>
          <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-[#38bdf8] via-[#0ea5e9] to-[#06b6d4] bg-clip-text text-transparent">
            Supply Chain Agent
          </h1>
        </header>
        <div className="flex-1 px-8 py-6 overflow-y-auto min-h-96">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-16">
              Start the conversation! . You can get information related to
              supply chain database by the agent.
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`mb-4 flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-5 py-3 rounded-xl max-w-[70%] font-sans text-base shadow-lg whitespace-pre-line border ${
                  message.role === "user"
                    ? "bg-[#23232a] text-white border-[#38bdf8]/30"
                    : "bg-[#18181b] text-gray-100 border-white/10"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="px-8 py-6 border-t border-white/10 flex items-center gap-3 bg-[#18181b]">
          <textarea
            className="flex-1 rounded-xl border border-white/10 bg-[#23232a] px-4 py-3 text-base text-white placeholder:text-gray-400 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 resize-none"
            rows={2}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button
            className="rounded-xl bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] px-6 py-3 text-black font-bold shadow hover:shadow-[#38bdf8]/40 transition-all duration-200 disabled:opacity-60"
            onClick={() => void sendMessage()}
            disabled={loading || !input.trim()}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </section>
    </main>
  );
}
