import { useState, useRef, useEffect, type FC, type ReactNode, type FormEvent } from "react";
import ReactMarkdown from 'react-markdown';

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type ChatWindowProps = {
  onClose: () => void;
  header?: ReactNode;
};

const ChatWindow: FC<ChatWindowProps> = ({ onClose, header }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm the AI copilot. Ask me about experience, projects, or anything about Jyoti Prakash.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          history: messages 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Chat error:', error);
      return "Sorry, I'm having trouble responding right now. Please try again.";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const responseContent = await generateResponse(input.trim());

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: responseContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiResponse]);
    setIsTyping(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ff6a3d]/20 text-lg text-[#ff6a3d]">⚡</span>
          <span>{header || "AI Copilot"}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-1.5 text-slate-300 transition hover:border-[#ff6a3d] hover:text-white"
          aria-label="Close chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-slate-300">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Today</p>
        <div className="mt-3 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${
                msg.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl bg-[#ff6a3d]/20 px-4 py-3 text-slate-100 text-right"
                  : "max-w-[85%] rounded-2xl bg-white/10 px-4 py-3 text-slate-200 text-left"
              }`}
            >
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
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
                  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                  em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
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
                {msg.content}
              </ReactMarkdown>
            </div>
          ))}
          {isTyping && (
            <div className="max-w-[85%] rounded-2xl bg-white/10 px-4 py-3 text-slate-200">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#ff6a3d]" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#ff6a3d]" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#ff6a3d]" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-[0_10px_30px_rgba(2,6,23,0.45)]">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Ask me something..."
          className="flex-1 resize-none border-none bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="inline-flex items-center gap-2 rounded-full bg-[#ff6a3d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950 transition hover:bg-[#ff815b] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 12l16-6-6 16-2-7-8-3z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;