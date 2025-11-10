"use client";
export interface Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

export interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

export interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

import { useState } from "react";
import { VoiceAssistant } from "./components/VoiceAssistant";

interface ConversationItem {
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: any;
}

export default function Home() {
  const [conversation, setConversation] = useState<ConversationItem[]>([]);

  const handleTranscription = (text: string) => {
    setConversation((prev) => [
      ...prev,
      {
        type: "user",
        content: text,
        timestamp: new Date(),
      },
    ]);
  };

  const handleResponse = (response: any) => {
    setConversation((prev) => [
      ...prev,
      {
        type: "assistant",
        content: response.response,
        timestamp: new Date(),
        metadata: response.metadata,
      },
    ]);
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] py-12 px-4">
      <div className="container mx-auto">
        <VoiceAssistant
          onTranscription={handleTranscription}
          onResponse={handleResponse}
        />

        {/* Conversation History */}
        {conversation.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8 p-8 rounded-2xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-xl">
            <h2 className="text-2xl font-bold bg-linear-to-r from-[#38bdf8] via-[#0ea5e9] to-[#06b6d4] bg-clip-text text-transparent mb-6">
              Conversation History
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversation.map((item, index) => (
                <div
                  key={index}
                  className={`flex ${
                    item.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-5 py-3 rounded-xl shadow-lg border ${
                      item.type === "user"
                        ? "bg-[#23232a] text-white border-[#38bdf8]/30"
                        : "bg-[#18181b] text-gray-100 border-white/10"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{item.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {item.timestamp.toLocaleTimeString()}
                      {item.metadata?.agent_used && (
                        <span className="ml-2">
                          • {item.metadata.agent_used}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
