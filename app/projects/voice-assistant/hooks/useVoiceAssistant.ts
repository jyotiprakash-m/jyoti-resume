// hooks/useVoiceAssistant.ts
import { useState, useRef, useCallback, useEffect } from "react";
import { SpeechRecognition } from "../page";

interface VoiceAssistantResponse {
  transcription: string;
  response: string;
  conversation_id: string;
  action_taken?: string;
  audio_response?: string;
  metadata?: {
    processing_time?: number;
    agent_used?: string;
  };
}

interface UseVoiceAssistantOptions {
  apiBaseUrl?: string;
  autoPlayResponse?: boolean;
  onTranscription?: (text: string) => void;
  onResponse?: (response: VoiceAssistantResponse) => void;
  onError?: (error: string) => void;
  streamByDefault?: boolean;
}

export const useVoiceAssistant = (options: UseVoiceAssistantOptions = {}) => {
  const LOCAL_STORAGE_KEY = "voice-assistant:user-id";
  const {
    apiBaseUrl = "http://localhost:9090",
    autoPlayResponse = true,
    onTranscription,
    onResponse,
    onError,
    streamByDefault = true,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [response, setResponse] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
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

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mp3",
        });
        await processVoiceCommand(audioBlob);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      setError(null);
    } catch (err) {
      const errorMsg = "Error accessing microphone";
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const playAudioResponse = useCallback(
    (audioData: string) => {
      try {
        if (audioData && audioData.startsWith("data:audio/")) {
          const audio = new Audio(audioData);
          audio.play().catch((e) => {
            console.error("Error playing audio:", e);
            if (response && "speechSynthesis" in window) {
              const utterance = new SpeechSynthesisUtterance(response);
              utterance.rate = 0.8;
              utterance.pitch = 1;
              window.speechSynthesis.speak(utterance);
            }
          });
        } else if (audioData && audioData.length > 0) {
          const audioUrl = `data:audio/mp3;base64,${audioData}`;
          const audio = new Audio(audioUrl);
          audio.play().catch((e) => {
            console.error("Error playing base64 audio:", e);
            if (response && "speechSynthesis" in window) {
              const utterance = new SpeechSynthesisUtterance(response);
              utterance.rate = 0.8;
              utterance.pitch = 1;
              window.speechSynthesis.speak(utterance);
            }
          });
        } else if (response && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(response);
          utterance.rate = 0.8;
          utterance.pitch = 1;
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        console.error("Error creating audio element:", err);
        if (response && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(response);
          utterance.rate = 0.8;
          utterance.pitch = 1;
          window.speechSynthesis.speak(utterance);
        }
      }
    },
    [response]
  );

  const processVoiceCommand = useCallback(
    async (audioBlob: Blob) => {
      setIsProcessing(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", audioBlob, "audio.mp3");
        if (conversationId) {
          formData.append("conversation_id", conversationId);
        }
        if (typeof window !== "undefined") {
          const storedUserId = window.localStorage.getItem(LOCAL_STORAGE_KEY);
          if (storedUserId) {
            formData.append("user_id", storedUserId);
          }
        }

        const response = await fetch(`${apiBaseUrl}/assistant/process-voice`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: VoiceAssistantResponse = await response.json();

        setTranscription(result.transcription);
        setResponse(result.response);
        setConversationId(result.conversation_id);

        onTranscription?.(result.transcription);
        onResponse?.(result);

        // Play audio response if available and auto-play is enabled
        if (result.audio_response && autoPlayResponse) {
          playAudioResponse(result.audio_response);
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Voice processing failed";
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },
    [
      apiBaseUrl,
      conversationId,
      autoPlayResponse,
      onTranscription,
      onResponse,
      onError,
      playAudioResponse,
    ]
  );

  const processTextCommand = useCallback(
    async (text: string, fromSpeech = false, forceStream?: boolean) => {
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
        const payload: Record<string, unknown> = {
          text: normalizedText,
          user_input: normalizedText,
          stream: false,
        };

        if (storedUserId) {
          payload.user_id = Number.isNaN(Number(storedUserId))
            ? storedUserId
            : Number(storedUserId);
        }

        if (conversationId) {
          payload.conversation_id = conversationId;
        }

        const response = await fetch(`${apiBaseUrl}/assistant/text-command`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
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

        const result: VoiceAssistantResponse = await response.json();

        setResponse(result.response);
        setConversationId(result.conversation_id);

        onResponse?.(result);

        if (result.audio_response && autoPlayResponse) {
          playAudioResponse(result.audio_response);
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Text processing failed";
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },
    [
      apiBaseUrl,
      conversationId,
      autoPlayResponse,
      onTranscription,
      onResponse,
      onError,
      streamByDefault,
      playAudioResponse,
    ]
  );

  const clearConversation = useCallback(() => {
    setConversationId(null);
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
    conversationId,
    error,

    // Actions
    startListening,
    stopListening,
    startRecording,
    stopRecording,
    processTextCommand,
    clearConversation,
    playAudioResponse,
    speakText,
  };
};
