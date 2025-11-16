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

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VoiceAssistant } from "./components/VoiceAssistant";

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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9090";
const LOCAL_STORAGE_KEY = "voice-assistant:user-id";

export default function Home() {
  const router = useRouter();
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  const handleLogout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    setConversation([]);
    setUserProfile(null);
    setUserError(null);
    setIsUserLoading(false);

    router.replace("/projects/voice-assistant/auth");
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedUserId = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedUserId) {
      router.replace("/projects/voice-assistant/auth");
      return;
    }

    const controller = new AbortController();

    const fetchUserProfile = async () => {
      try {
        setIsUserLoading(true);
        setUserError(null);

        const response = await fetch(`${API_BASE_URL}/users/${storedUserId}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 404) {
            window.localStorage.removeItem(LOCAL_STORAGE_KEY);
            router.replace("/projects/voice-assistant/auth");
            return;
          }

          throw new Error("Unable to fetch user profile");
        }

        const data = (await response.json()) as UserProfile;
        setUserProfile(data);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setUserError(
          error instanceof Error
            ? error.message
            : "Failed to load account details"
        );
        setUserProfile(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsUserLoading(false);
        }
      }
    };

    fetchUserProfile();

    return () => controller.abort();
  }, [router]);

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
        // Backend no longer returns metadata; keep messages without it
      },
    ]);
  };

  const clearConversation = () => {
    setConversation([]);
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] p-4">
      <div className="h-full flex flex-col rounded-2xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-xl">
        <VoiceAssistant
          conversation={conversation}
          onTranscription={handleTranscription}
          onResponse={handleResponse}
          onClearConversation={clearConversation}
          userProfile={userProfile}
          isUserLoading={isUserLoading}
          userError={userError}
          className=""
          onLogout={handleLogout}
        />
      </div>
    </main>
  );
}
