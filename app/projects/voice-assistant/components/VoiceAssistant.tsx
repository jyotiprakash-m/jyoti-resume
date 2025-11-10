// components/VoiceAssistant.tsx
"use client";

import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  MessageSquare,
  Loader2,
  Trash2,
} from "lucide-react";
import { useVoiceAssistant } from "../hooks/useVoiceAssistant";

interface VoiceAssistantProps {
  className?: string;
  onTranscription?: (text: string) => void;
  onResponse?: (response: any) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  className = "",
  onTranscription,
  onResponse,
}) => {
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);

  const {
    isListening,
    isProcessing,
    transcription,
    response,
    error,
    startListening,
    stopListening,
    processTextCommand,
    clearConversation,
    playAudioResponse,
    speakText,
  } = useVoiceAssistant({
    onTranscription,
    onResponse,
    onError: (error) => console.error("Voice Assistant Error:", error),
  });

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
      processTextCommand(textInput);
      setTextInput("");
    }
  };

  const handlePlayAudio = () => {
    if (response) {
      speakText(response);
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

  return (
    <div
      className={`max-w-4xl mx-auto p-8 rounded-2xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-xl ${className}`}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-400">
            Voice Assistant
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-[#38bdf8] via-[#0ea5e9] to-[#06b6d4] bg-clip-text text-transparent mb-3">
          AI Voice Assistant
        </h1>
        <p className="text-gray-300">{getStatusText()}</p>
      </div>

      {/* Voice Control Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={handleVoiceToggle}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-6 py-3 text-black font-bold rounded-xl shadow transition-all duration-200 ${getButtonColor()} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
          {isProcessing
            ? "Processing..."
            : isListening
            ? "Stop Listening"
            : "Start Listening"}
        </button>

        <button
          onClick={() => setShowTextInput(!showTextInput)}
          className="flex items-center gap-2 px-4 py-3 bg-[#23232a] hover:bg-[#38bdf8]/20 text-white font-semibold rounded-xl border border-white/10 transition-all duration-200"
        >
          <MessageSquare className="w-5 h-5" />
          Type
        </button>

        <button
          onClick={clearConversation}
          className="flex items-center gap-2 px-4 py-3 bg-[#23232a] hover:bg-red-500/20 text-white font-semibold rounded-xl border border-white/10 transition-all duration-200"
        >
          <Trash2 className="w-5 h-5" />
          Clear
        </button>
      </div>

      {/* Text Input */}
      {showTextInput && (
        <form onSubmit={handleTextSubmit} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your message here..."
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
          </div>
        </form>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/40 text-red-300 rounded-xl">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Transcription */}
      {transcription && (
        <div className="mb-6">
          <div className="bg-[#23232a] border border-white/10 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-4 h-4 text-[#38bdf8]" />
              <span className="font-semibold text-white">You said:</span>
            </div>
            <p className="text-gray-300 italic">"{transcription}"</p>
          </div>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="mb-6">
          <div className="bg-[#18181b] border border-white/10 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] rounded-full flex items-center justify-center">
                  <span className="text-black text-sm font-bold">AI</span>
                </div>
                <span className="font-semibold text-white">Assistant:</span>
              </div>
              <button
                onClick={() => handlePlayAudio()}
                disabled={!response}
                className="p-1 text-[#38bdf8] hover:text-[#0ea5e9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Play audio response"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-gray-100 whitespace-pre-wrap">{response}</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">Try saying:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              onClick={() => processTextCommand(suggestion)}
              disabled={isProcessing}
              className="text-left p-4 bg-[#23232a] hover:bg-[#38bdf8]/10 text-gray-300 border border-white/10 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              "{suggestion}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
