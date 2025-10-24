"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
type Message = {
  role: "user" | "assistant";
  content: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL_CHUNKING ?? "http://localhost:8000";

export default function CareerChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSubmitting) return;

    const nextHistory: Message[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];

    setIsSubmitting(true);
    setError(null);
    setMessages(nextHistory);
    setInput("");

    try {
      const response = await fetch(`${API_BASE}/career/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: { role: string; content: string } = await response.json();
      setMessages((current) => [
        ...current,
        {
          role: (data.role ?? "assistant") as Message["role"],
          content: data.content,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: messages.length <= 1 ? "auto" : "smooth",
    });
  }, [messages]);

  return (
    <main className="min-h-screen bg-linear-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] py-12 px-4">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
          <header className="mb-8 space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-400">
              Career Copilot
            </span>
            <h1 className="text-4xl font-bold bg-linear-to-r from-[#ff6a3d] via-[#ff8c61] to-[#ffa785] bg-clip-text text-transparent">
              Career Chat Assistant
            </h1>
            <p className="text-sm text-gray-400 md:text-base">
              Have a conversation with Jyoti&apos;s career copilot. Ask about
              experience, recent projects, tech stack, or anything that helps
              you evaluate the fit for your team.
            </p>
          </header>

          <div className="space-y-4">
            <div className="relative min-h-80 rounded-xl border border-white/10 bg-white/5 p-5 shadow-inner">
              <div className="pointer-events-none absolute inset-0 rounded-xl border border-white/5" />
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-gray-500">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl">
                    💬
                  </div>
                  <p className="max-w-sm text-gray-400">
                    Ask anything about Jyoti&apos;s background, what
                    collaborating looks like, or request tailored project ideas
                    to explore together.
                  </p>
                </div>
              ) : (
                <div
                  ref={scrollContainerRef}
                  className="max-h-[420px] space-y-4 overflow-y-auto pr-2"
                >
                  {messages.map((message, index) => (
                    <div key={`${message.role}-${index}`} className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.3em] text-gray-500">
                        {message.role === "user" ? "You" : "Assistant"}
                      </span>
                      <div
                        className={
                          message.role === "user"
                            ? "rounded-2xl border border-[#ff6a3d]/40 bg-[#ff6a3d]/15 p-4 text-sm text-gray-100 shadow-lg"
                            : "rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-gray-300"
                        }
                      >
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0">{children}</p>
                            ),
                            ul: ({ children }) => (
                              <ul className="mb-2 ml-4 list-disc space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="mb-2 ml-4 list-decimal space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="leading-relaxed">{children}</li>
                            ),
                            code: ({ className, children }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="rounded bg-black/40 px-1.5 py-0.5 text-xs text-[#ff6a3d]">
                                  {children}
                                </code>
                              ) : (
                                <code className="block rounded-xl bg-black/60 p-3 text-xs leading-relaxed">
                                  {children}
                                </code>
                              );
                            },
                            strong: ({ children }) => (
                              <strong className="font-semibold text-white">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic text-slate-300">
                                {children}
                              </em>
                            ),
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#ff6a3d] underline transition hover:text-[#ff815b]"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 md:flex-row"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  name="prompt"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/30"
                  placeholder="Type your question about Jyoti's career..."
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={isSubmitting}
                />
                <div className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 text-xs text-gray-500 md:block">
                  ↵ to send
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-[#ff6a3d] to-[#ff8c61] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ff6a3d]/30 transition-all duration-200 hover:shadow-[#ff6a3d]/50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending…" : "Send"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
