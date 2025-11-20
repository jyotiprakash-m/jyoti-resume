"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Loader2,
  Copy,
  User,
  Bot,
  MessageSquare,
  Settings,
  X,
  Mic,
  Square,
  Volume2,
  Pause,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface PersonaFormData {
  role: string;
  tone: string;
  style: string;
  responsibilities: string;
  avoid: string;
  rules: string;
}

export default function PersonaChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [systemMessage, setSystemMessage] = useState("");
  const [formData, setFormData] = useState<PersonaFormData>({
    role: "",
    tone: "",
    style: "",
    responsibilities: "",
    avoid: "",
    rules: "",
  });
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);
  const [showSystemMessageModal, setShowSystemMessageModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentPlayingText, setCurrentPlayingText] = useState<string | null>(null);


  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Load system message from localStorage on mount
  useEffect(() => {
    const savedSystemMessage = localStorage.getItem("personaSystemMessage");
    if (savedSystemMessage) {
      setSystemMessage(savedSystemMessage);
    }else{
      setShowSettings(true);
    }
  }, []);

  // Ensure modal visibility follows the systemMessage state
  useEffect(() => {
    if (!systemMessage) {
      setShowSettings(true);
    } else {
      setShowSettings(false);
    }
  }, [systemMessage]);
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    const userMessage: Message = {
      type: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsProcessing(true);

    try {
      // Call chat API with system message context
      const response = await fetch("/api/persona/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          systemMessage: systemMessage,
          history: messages.map((m) => ({
            role: m.type === "user" ? "user" : "assistant",
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        type: "assistant",
        content: data.response || data.result || "No response received.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        type: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Voice recording (STT)
  const handleStartRecording = () => {
    setIsRecording(true);
    audioChunksRef.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "voice.webm");
        const response = await fetch("/api/persona/stt", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (data.transcript) {
          setInputText(data.transcript);
        }
      };
    });
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  // Close settings modal but ensure a persona (systemMessage) exists
  const handleCloseSettings = () => {
    if (!systemMessage) {
      // Keep the modal open and prompt the user to apply a persona first
      // We keep UX simple: show an alert and ensure modal remains visible
      alert("Please configure and apply a persona before closing settings.");
      setShowSettings(true);
      return;
    }
    setShowSettings(false);
  };

  // Play assistant response (TTS)
  const handlePlayResponse = async (text: string) => {
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      setIsPlaying(true);
      setCurrentPlayingText(text);

      const response = await fetch("/api/persona/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        console.error('TTS request failed', response.status, await response.text());
        setIsPlaying(false);
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      const audioBlob = await response.blob();

      if (!contentType.startsWith('audio') && audioBlob.size === 0) {
        console.error('TTS returned non-audio or empty response', contentType, audioBlob.size);
        setIsPlaying(false);
        return;
      }

      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      const audio = new Audio();
      audioRef.current = audio;
      audio.src = url;
      audio.preload = 'auto';

      // Error handler for loading issues
      const onError = (e: any) => {
        console.error('Audio load error:', e);
        setIsPlaying(false);
        try {
          URL.revokeObjectURL(url);
          setAudioUrl(null);
        } catch {}
        audioRef.current = null;
        setCurrentPlayingText(null);
      };

      audio.addEventListener('error', onError, { once: true });

      // Play when ready; use canplaythrough when available
      const playAudio = () => {
        audio.play().catch((err) => {
          if (err && err.name === 'AbortError') {
            // expected when interrupted
            return;
          }
          console.error('Audio play error:', err);
          setIsPlaying(false);
        });
      };

      // If already buffered enough, play immediately
      if (audio.readyState >= 4) {
        playAudio();
      } else {
        audio.addEventListener('canplaythrough', () => playAudio(), { once: true });
        // trigger load and provide a short fallback
        audio.load();
        setTimeout(() => {
          if (audioRef.current) playAudio();
        }, 1500);
      }

      audio.onended = () => {
        setIsPlaying(false);
        try {
          URL.revokeObjectURL(url);
          setAudioUrl(null);
        } catch {}
        audioRef.current = null;
        setCurrentPlayingText(null);
      };
    } catch (err) {
      console.error('TTS playback error:', err);
      setIsPlaying(false);
    }
  };

  // Toggle playback: start if no audio, pause/resume if audio exists
  const togglePlayback = async (text: string) => {
    try {
      // If there's no existing audio, start playback
      if (!audioRef.current) {
        await handlePlayResponse(text);
        return;
      }

      const audio = audioRef.current;
      if (audio.paused) {
        // resume
        await audio.play().catch((err) => {
          if (err && err.name === 'AbortError') return;
          console.error('Audio resume error:', err);
        });
        setIsPlaying(true);
        setCurrentPlayingText(text);
      } else {
        // pause
        audio.pause();
        setIsPlaying(false);
        setCurrentPlayingText(null);
      }
    } catch (err) {
      console.error('Toggle playback error:', err);
      setIsPlaying(false);
    }
  };


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingPersona(true);

    try {
      // Call API to generate system message
      const response = await fetch("/api/persona/system-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate system message");
      }

      const data = await response.json();
      const newSystemMessage = data.systemMessage || data.result || "";

      // Store the system message in local storage
      localStorage.setItem("personaSystemMessage", newSystemMessage);

      // Update the system message state
      setSystemMessage(newSystemMessage);

      setShowSettings(false);
    } catch (error) {
      console.error("Error generating system message:", error);
      alert("Failed to generate persona configuration. Please try again.");
    } finally {
      setIsGeneratingPersona(false);
    }
  };

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] p-4">
      <div className="h-screen max-h-screen flex flex-col rounded-2xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between p-6 border-b border-white/10 bg-[#18181b]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-black" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">Persona Chat</h1>
              <p className="text-sm text-gray-400">
                {isProcessing
                  ? "Thinking..."
                  : systemMessage
                  ? "Persona configured"
                  : "Chat with your AI persona assistant"}
              </p>
            </div>

            {/* System Message Display */}
            {systemMessage && (
              <div
                className="max-w-md cursor-pointer"
                onClick={() => setShowSystemMessageModal(true)}
              >
                <div className="text-xs text-gray-500 mb-1">Active Persona:</div>
                <div className="text-sm text-gray-300 bg-[#23232a] px-3 py-2 rounded-lg border border-[#38bdf8]/20 max-h-20 overflow-y-auto">
                  {systemMessage.length > 100
                    ? `${systemMessage.substring(0, 100)}...`
                    : systemMessage}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-[#23232a] text-gray-400 hover:text-[#38bdf8] hover:bg-[#38bdf8]/10 transition-colors"
            title="Persona Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-[#18181b]">
                <h2 className="text-xl font-bold bg-linear-to-r from-[#38bdf8] via-[#0ea5e9] to-[#06b6d4] bg-clip-text text-transparent">
                  Persona Configuration
                </h2>
                <button
                  onClick={handleCloseSettings}
                  className="p-2 rounded-lg bg-[#23232a] text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Role / Expertise
                    </label>
                    <input
                      name="role"
                      placeholder="e.g., Software Engineer, Data Scientist"
                      value={formData.role}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-white/10 bg-[#23232a] text-white placeholder:text-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 focus:border-[#38bdf8]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Tone / Personality
                    </label>
                    <input
                      name="tone"
                      placeholder="e.g., Professional, Friendly, Casual"
                      value={formData.tone}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-white/10 bg-[#23232a] text-white placeholder:text-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 focus:border-[#38bdf8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Communication Style / Format
                  </label>
                  <input
                    name="style"
                    placeholder="e.g., Concise, Detailed, Bullet Points, Conversational"
                    value={formData.style}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-white/10 bg-[#23232a] text-white placeholder:text-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 focus:border-[#38bdf8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Primary Responsibilities
                  </label>
                  <textarea
                    name="responsibilities"
                    placeholder="List the main tasks and responsibilities (one per line)"
                    value={formData.responsibilities}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-white/10 bg-[#23232a] text-white placeholder:text-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 focus:border-[#38bdf8] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Important Behavioral Rules
                  </label>
                  <textarea
                    name="rules"
                    placeholder="Key rules and guidelines the persona must follow"
                    value={formData.rules}
                    onChange={handleFormChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-white/10 bg-[#23232a] text-white placeholder:text-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 focus:border-[#38bdf8] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Constraints / Forbidden Actions
                  </label>
                  <textarea
                    name="avoid"
                    placeholder="What should the persona avoid doing or saying?"
                    value={formData.avoid}
                    onChange={handleFormChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-white/10 bg-[#23232a] text-white placeholder:text-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 focus:border-[#38bdf8] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingPersona}
                  className="w-full px-6 py-3 bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] hover:shadow-lg hover:shadow-[#38bdf8]/40 text-black font-bold rounded-xl shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGeneratingPersona ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Persona...
                    </>
                  ) : (
                    "Apply Persona Configuration"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* System Message Modal */}
        {showSystemMessageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-[#18181b]">
                <h2 className="text-xl font-bold bg-linear-to-r from-[#38bdf8] via-[#0ea5e9] to-[#06b6d4] bg-clip-text text-transparent">
                  Full Persona System Message
                </h2>
                <button
                  onClick={() => setShowSystemMessageModal(false)}
                  className="p-2 rounded-lg bg-[#23232a] text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 text-gray-200 whitespace-pre-line wrap-break-word">
                {systemMessage}
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 min-h-0">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-2xl font-bold bg-linear-to-r from-[#38bdf8] via-[#0ea5e9] to-[#06b6d4] bg-clip-text text-transparent mb-2">
                Start a Conversation
              </h2>
              <p className="text-gray-400 mb-8">
                Type your message below to begin chatting with your AI persona
              </p>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                {[
                  "Tell me about yourself",
                  "What can you help me with?",
                  "Let's have a conversation",
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(suggestion)}
                    className="text-left p-4 bg-[#23232a] hover:bg-[#38bdf8]/10 text-gray-300 border border-white/10 rounded-xl transition-all duration-200"
                  >
                    <span className="text-[#38bdf8] text-sm">💬</span>{" "}
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation History */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] px-5 py-3 rounded-2xl ${
                  message.type === "user"
                    ? "bg-[#23232a] text-white border border-[#38bdf8]/30"
                    : "bg-[#18181b] text-gray-100 border border-white/10"
                }`}
              >
                <div
                  className={`flex items-center gap-2 mb-1 ${
                    message.type === "assistant" ? "justify-between" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        message.type === "user"
                          ? "bg-[#38bdf8]"
                          : "bg-linear-to-r from-[#38bdf8] to-[#0ea5e9]"
                      }`}
                    >
                      {message.type === "user" ? (
                        <User className="w-4 h-4 text-black" />
                      ) : (
                        <Bot className="w-4 h-4 text-black" />
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {message.type === "user" ? "You" : "Assistant"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {message.type === "assistant" && (
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePlayback(message.content)}
                          className="p-1 text-[#38bdf8] hover:text-[#0ea5e9] transition-colors"
                          title={isPlaying ? "Pause" : "Play response"}
                        >
                          {currentPlayingText === message.content && isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>

                        {/* Waveform visual for the currently playing message */}
                        {currentPlayingText === message.content && isPlaying && (
                          <div className="flex items-end gap-1 h-4">
                            <span className="w-0.5 bg-[#38bdf8] rounded-sm animate-[wave_1.5s_ease-in-out_infinite]" style={{height: '4px', animationDelay: '0s'}}></span>
                            <span className="w-0.5 bg-[#38bdf8] rounded-sm animate-[wave_1.5s_ease-in-out_infinite]" style={{height: '8px', animationDelay: '0.12s'}}></span>
                            <span className="w-0.5 bg-[#38bdf8] rounded-sm animate-[wave_1.5s_ease-in-out_infinite]" style={{height: '12px', animationDelay: '0.24s'}}></span>
                            <span className="w-0.5 bg-[#38bdf8] rounded-sm animate-[wave_1.5s_ease-in-out_infinite]" style={{height: '16px', animationDelay: '0.36s'}}></span>
                            <span className="w-0.5 bg-[#38bdf8] rounded-sm animate-[wave_1.5s_ease-in-out_infinite]" style={{height: '12px', animationDelay: '0.48s'}}></span>
                            <span className="w-0.5 bg-[#38bdf8] rounded-sm animate-[wave_1.5s_ease-in-out_infinite]" style={{height: '8px', animationDelay: '0.6s'}}></span>
                            <span className="w-0.5 bg-[#38bdf8] rounded-sm animate-[wave_1.5s_ease-in-out_infinite]" style={{height: '4px', animationDelay: '0.72s'}}></span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopyText(message.content)}
                        className="p-1 text-[#38bdf8] hover:text-[#0ea5e9] transition-colors"
                        title="Copy response"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  {message.type === "assistant" ? (
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
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <div className="whitespace-pre-wrap text-white">
                      {message.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="max-w-[70%] bg-[#18181b] text-gray-100 px-5 py-3 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-black" />
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

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="shrink-0 border-t border-white/10 bg-[#18181b] p-6">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-white/10 bg-[#23232a] text-white placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 focus:border-[#38bdf8]"
              disabled={isProcessing}
            />
            <button
              type="button"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isProcessing}
              className={`px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-[#23232a] text-gray-400 hover:text-[#38bdf8] hover:bg-[#38bdf8]/10"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isRecording ? "Stop recording" : "Start voice input"}
            >
              {isRecording ? (
                <Square className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
            <button
              type="submit"
              disabled={isProcessing || !inputText.trim()}
              className="px-6 py-3 bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] hover:shadow-lg hover:shadow-[#38bdf8]/40 text-black font-bold rounded-xl shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              Send
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
