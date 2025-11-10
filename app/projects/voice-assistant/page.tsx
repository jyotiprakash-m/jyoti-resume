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

  const clearConversation = () => {
    setConversation([]);
  };

  return (
    <main>
      <div className="h-full flex flex-col rounded-2xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-xl">
        <VoiceAssistant
          conversation={conversation}
          onTranscription={handleTranscription}
          onResponse={handleResponse}
          onClearConversation={clearConversation}
          className=""
        />
      </div>
    </main>
  );
}
