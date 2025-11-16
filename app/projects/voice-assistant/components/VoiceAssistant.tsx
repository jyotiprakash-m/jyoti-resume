// components/VoiceAssistant.tsx
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  MessageSquare,
  Loader2,
  Trash2,
  Copy,
  Pause,
  User,
  Clock,
  LogOut,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useVoiceAssistant } from "../hooks/useVoiceAssistant";

interface ConversationItem {
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  status: string;
  created_at?: string;
  last_active?: string;
}

interface VoiceAssistantProps {
  className?: string;
  conversation?: ConversationItem[];
  onTranscription?: (text: string) => void;
  onResponse?: (response: any) => void;
  onClearConversation?: () => void;
  userProfile?: UserProfile | null;
  isUserLoading?: boolean;
  userError?: string | null;
  onLogout?: () => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  className = "",
  conversation = [],
  onTranscription,
  onResponse,
  onClearConversation,
  userProfile,
  isUserLoading = false,
  userError,
  onLogout,
}) => {
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isListening,
    isProcessing,
    transcription,
    response,
    error,
    startListening,
    stopListening,
    processTextCommand,
    clearConversation: clearLocalConversation,

    speakText,
  } = useVoiceAssistant({
    onTranscription,
    onResponse,
    onError: (error) => console.error("Voice Assistant Error:", error),
  });

  const handleClearConversation = () => {
    if (onClearConversation) {
      onClearConversation();
    }
    clearLocalConversation();
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, transcription, response, isProcessing]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      processTextCommand(textInput, false);
      setTextInput("");
    }
  };

  // Removed handlePlayAudio (audio response is not supported)

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if desired
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handlePauseSpeech = () => {
    if ("speechSynthesis" in window) {
      if (window.speechSynthesis.speaking) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        } else {
          window.speechSynthesis.pause();
        }
      }
    }
  };

  const getStatusText = () => {
    if (isProcessing) return "Processing your request...";
    if (isListening) return "Listening... Speak now!";
    return "Ready to help! Click the microphone or type your message.";
  };

  const getButtonColor = () => {
    if (isProcessing)
      return "bg-linear-to-r from-orange-500 to-orange-600 hover:shadow-orange-500/40";
    if (isListening)
      return "bg-linear-to-r from-red-500 to-red-600 hover:shadow-red-500/40 animate-pulse";
    return "bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] hover:shadow-[#38bdf8]/40";
  };

  const handleLogoutClick = () => {
    setShowProfileModal(false);
    onLogout?.();
  };

  const lastActiveDisplay = useMemo(() => {
    if (!userProfile?.last_active) return null;
    const parsed = new Date(userProfile.last_active);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleString();
  }, [userProfile?.last_active]);

  const joinedDisplay = useMemo(() => {
    if (!userProfile?.created_at) return null;
    const parsed = new Date(userProfile.created_at);
    if (Number.isNaN(parsed.getTime())) return userProfile.created_at;
    return parsed.toLocaleString();
  }, [userProfile?.created_at]);

  const statusClasses = useMemo(() => {
    if (!userProfile?.status) {
      return "bg-white/5 border-white/10 text-gray-300";
    }
    const normalized = userProfile.status.toLowerCase();
    if (normalized === "active") {
      return "bg-emerald-500/10 border-emerald-400/40 text-emerald-300";
    }
    if (normalized === "inactive" || normalized === "disabled") {
      return "bg-rose-500/10 border-rose-400/40 text-rose-300";
    }
    return "bg-white/5 border-white/10 text-gray-300";
  }, [userProfile?.status]);

  return (
    <div
      className={`relative flex flex-col h-screen max-h-screen ${className}`}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between p-6 border-b border-white/10 bg-[#18181b]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] rounded-full flex items-center justify-center">
            <span className="text-black text-lg font-bold">AI</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Voice Assistant</h1>
            <p className="text-sm text-gray-400">{getStatusText()}</p>
            {isUserLoading && (
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading your profile…</span>
              </div>
            )}
            {!isUserLoading && userProfile && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#38bdf8]" />
                  {userProfile.full_name || userProfile.username}
                </span>
                {lastActiveDisplay && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
                    Last active {lastActiveDisplay}
                  </span>
                )}
                <span
                  className={`flex items-center gap-1 rounded-full border px-2 py-0.5 uppercase tracking-wide ${statusClasses}`}
                >
                  {userProfile.status}
                </span>
              </div>
            )}
            {!isUserLoading && userError && (
              <div className="mt-2 text-xs text-rose-300">{userError}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isUserLoading && userProfile && (
            <button
              onClick={() => setShowProfileModal(true)}
              className="p-2 rounded-lg bg-[#23232a] text-gray-400 hover:text-[#38bdf8] hover:bg-[#38bdf8]/10 transition-colors"
              title="View profile details"
            >
              <User className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setShowTextInput(!showTextInput)}
            className={`p-2 rounded-lg transition-colors ${
              showTextInput
                ? "bg-[#38bdf8]/20 text-[#38bdf8]"
                : "bg-[#23232a] text-gray-400 hover:text-white hover:bg-[#23232a]/80"
            }`}
            title="Toggle text input"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={handleClearConversation}
            className="p-2 rounded-lg bg-[#23232a] text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          {onLogout && (
            <button
              onClick={handleLogoutClick}
              className="p-2 rounded-lg bg-[#23232a] text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 min-h-0">
        {/* Welcome Message */}
        {conversation.length === 0 && !transcription && !response && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold bg-linear-to-r from-[#38bdf8] via-[#0ea5e9] to-[#06b6d4] bg-clip-text text-transparent mb-2">
              How can I help you today?
            </h2>
            <p className="text-gray-400 mb-8">
              Click the microphone to start speaking or use the examples below
            </p>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
              <>
                {[
                  "Create a task to review the presentation",
                  "Show me my pending tasks",
                  "Research quantum computing applications",
                  "Find flights from Delhi to Mumbai",
                  "What time is it in India?",
                  "Mark task 3 as completed",
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => processTextCommand(suggestion, false)}
                    disabled={isProcessing}
                    className="text-left p-4 bg-[#23232a] hover:bg-[#38bdf8]/10 text-gray-300 border border-white/10 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-[#38bdf8] text-sm">💡</span>{" "}
                    {suggestion}
                  </button>
                ))}
              </>
            </div>
          </div>
        )}

        {/* Conversation History */}
        {conversation.map((item, index) => (
          <div
            key={index}
            className={`flex ${
              item.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-5 py-3 rounded-2xl ${
                item.type === "user"
                  ? "bg-[#23232a] text-white border border-[#38bdf8]/30"
                  : "bg-[#18181b] text-gray-100 border border-white/10"
              }`}
            >
              <div
                className={`flex items-center gap-2 mb-1 ${
                  item.type === "assistant" ? "justify-between" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      item.type === "user"
                        ? "bg-[#38bdf8]"
                        : "bg-linear-to-r from-[#38bdf8] to-[#0ea5e9]"
                    }`}
                  >
                    <span className="text-black text-xs font-bold">
                      {item.type === "user" ? "U" : "AI"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {item.type === "user" ? "You" : "Assistant"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                {item.type === "assistant" && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyText(item.content)}
                      className="p-1 text-[#38bdf8] hover:text-[#0ea5e9] transition-colors"
                      title="Copy response"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => speakText(item.content)}
                      className="p-1 text-[#38bdf8] hover:text-[#0ea5e9] transition-colors"
                      title="Read aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handlePauseSpeech}
                      className="p-1 text-[#38bdf8] hover:text-[#0ea5e9] transition-colors"
                      title="Pause/Resume speech"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                {item.type === "assistant" ? (
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-xl font-bold text-[#38bdf8] mb-2">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-semibold text-[#38bdf8] mb-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-medium text-[#38bdf8] mb-1">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-2 space-y-1">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-2 space-y-1">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-gray-100">{children}</li>
                      ),
                      code: ({ children }) => (
                        <code className="bg-[#23232a] text-[#38bdf8] px-1 py-0.5 rounded text-sm font-mono">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-[#23232a] border border-white/10 rounded-lg p-3 overflow-x-auto mb-2">
                          {children}
                        </pre>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-[#38bdf8] pl-4 italic text-gray-300 mb-2">
                          {children}
                        </blockquote>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-white">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          className="text-[#38bdf8] hover:text-[#0ea5e9] underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {item.content}
                  </ReactMarkdown>
                ) : (
                  <div className="whitespace-pre-wrap text-white">
                    {item.content}
                  </div>
                )}
              </div>
              {item.metadata?.agent_used && (
                <div className="text-xs text-[#38bdf8] mt-2">
                  • {item.metadata.agent_used}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="max-w-[70%] bg-[#18181b] text-gray-100 px-5 py-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] rounded-full flex items-center justify-center">
                  <span className="text-black text-xs font-bold">AI</span>
                </div>
                <span className="text-xs text-gray-400">Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#38bdf8]" />
                <span className="text-gray-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex justify-center">
            <div className="max-w-md p-4 bg-red-500/10 border border-red-500/40 text-red-300 rounded-xl">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-white/10 bg-[#18181b] p-6">
        {showTextInput ? (
          <form onSubmit={handleTextSubmit} className="flex gap-3">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Message AI Voice Assistant..."
              className="flex-1 px-4 py-3 border border-white/10 bg-[#23232a] text-white placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 focus:border-[#38bdf8]"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || !textInput.trim()}
              className="px-6 py-3 bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] hover:shadow-[#38bdf8]/40 text-black font-bold rounded-xl shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={handleVoiceToggle}
              disabled={isProcessing}
              className={`flex items-center gap-3 px-8 py-4 text-black font-bold rounded-full shadow-lg transition-all duration-200 ${getButtonColor()} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isProcessing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isListening ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
              {isProcessing
                ? "Processing..."
                : isListening
                ? "Stop Listening"
                : "Start Listening"}
            </button>
          </div>
        )}
      </div>

      {showProfileModal && userProfile ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#18181b] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {userProfile?.full_name || userProfile?.username || "Profile"}
                </h2>
                <p className="text-sm text-gray-400">Account details</p>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="rounded-full bg-[#23232a] px-3 py-1 text-sm text-gray-400 hover:text-white transition"
              >
                X
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <span className="text-sm text-gray-400">Username</span>
                <span className="text-sm font-medium text-white">
                  {userProfile?.username ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <span className="text-sm text-gray-400">Email</span>
                <span className="text-sm font-medium text-white">
                  {userProfile?.email ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <span className="text-sm text-gray-400">Status</span>
                <span
                  className={`text-xs font-semibold uppercase tracking-wide rounded-full border px-2 py-1 ${statusClasses}`}
                >
                  {userProfile?.status ?? "unknown"}
                </span>
              </div>
              {userProfile?.created_at && (
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                  <span className="text-sm text-gray-400">Joined</span>
                  <span className="text-sm font-medium text-white">
                    {joinedDisplay ?? userProfile.created_at}
                  </span>
                </div>
              )}
              {userProfile?.last_active && (
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                  <span className="text-sm text-gray-400">Last Active</span>
                  <span className="text-sm font-medium text-white">
                    {lastActiveDisplay ?? userProfile.last_active}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowProfileModal(false)}
                className="rounded-xl border border-white/10 px-5 py-2 text-sm text-gray-300 hover:text-white hover:border-[#38bdf8] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
