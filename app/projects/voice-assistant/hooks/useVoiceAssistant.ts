// hooks/useVoiceAssistant.ts
import { useState, useRef, useCallback, useEffect } from "react";
import { SpeechRecognition } from "../page";

interface VoiceAssistantResponse {
  transcription: string;
  response: string;
}

interface UseVoiceAssistantOptions {
  apiBaseUrl?: string;
  onTranscription?: (text: string) => void;
  onResponse?: (response: VoiceAssistantResponse) => void;
  onError?: (error: string) => void;
}
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL_MCP ?? "http://localhost:9090";

export const useVoiceAssistant = (options: UseVoiceAssistantOptions = {}) => {
  const LOCAL_STORAGE_KEY = "voice-assistant:user-id";
  const {
    apiBaseUrl = API_BASE_URL,
    onTranscription,
    onResponse,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [response, setResponse] = useState("");
  // Conversation IDs are no longer returned by the backend
  const [error, setError] = useState<string | null>(null);

  // removed media recorder - we don't process raw audio on the backend anymore
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setTranscription(transcript);
          onTranscription?.(transcript);
          processTextCommand(transcript, true); // Pass flag to indicate this is from speech
        };

        recognitionRef.current.onerror = (event) => {
          const errorMsg = `Speech recognition error: ${event.error}`;
          setError(errorMsg);
          onError?.(errorMsg);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setError(null);
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const processTextCommand = useCallback(
    async (text: string, fromSpeech = false) => {
      setIsProcessing(true);
      setError(null);

      if (!fromSpeech) {
        setTranscription(text);
        onTranscription?.(text);
      }

      let storedUserId: string | null = null;
      if (typeof window !== "undefined") {
        storedUserId = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      }

      const normalizedText = text.trim();

      try {
        const formBody = new URLSearchParams();
        formBody.append("prompt", normalizedText);
        formBody.append("context", "");
        formBody.append("user_id", storedUserId || "0");

        const response = await fetch(`${apiBaseUrl}/mcp-basic/query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            accept: "application/json",
          },
          body: formBody.toString(),
        });

        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorBody = await response.json();
            if (errorBody?.message) {
              errorMessage = `${errorMessage} - ${errorBody.message}`;
            } else if (errorBody?.detail) {
              errorMessage = `${errorMessage} - ${JSON.stringify(
                errorBody.detail
              )}`;
            }
          } catch (parseErr) {
            console.error("Failed to parse error response", parseErr);
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        const mapped: VoiceAssistantResponse = {
          transcription: normalizedText,
          response: result.result ?? "",
        };

        setResponse(mapped.response);
        onResponse?.(mapped as any);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Text processing failed";
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },
    [apiBaseUrl, onTranscription, onResponse, onError]
  );

  const clearConversation = useCallback(() => {
    setTranscription("");
    setResponse("");
    setError(null);
  }, []);

  const speakText = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      // Cancel any existing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      // Try to find a good voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (voice) =>
          voice.name.includes("Female") ||
          voice.name.includes("Samantha") ||
          voice.name.includes("Karen") ||
          voice.lang.startsWith("en")
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return {
    // State
    isListening,
    isProcessing,
    transcription,
    response,
    error,

    // Actions
    startListening,
    stopListening,
    processTextCommand,
    clearConversation,

    speakText,
  };
};
