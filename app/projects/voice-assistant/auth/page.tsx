"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register";

interface RegisterPayload {
  username: string;
  email: string;
  full_name: string;
  status: string;
  password: string;
}

interface LoginPayload {
  username: string;
  password: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL_MCP ?? "http://localhost:9090";

const defaultRegisterState: RegisterPayload = {
  username: "",
  email: "",
  full_name: "",
  status: "active",
  password: "",
};

const defaultLoginState: LoginPayload = {
  username: "",
  password: "",
};

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [registerForm, setRegisterForm] =
    useState<RegisterPayload>(defaultRegisterState);
  const [loginForm, setLoginForm] = useState<LoginPayload>(defaultLoginState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeForm = useMemo(
    () => (mode === "login" ? loginForm : registerForm),
    [loginForm, mode, registerForm]
  );

  const handleInputChange = (
    field: keyof RegisterPayload | keyof LoginPayload,
    value: string
  ) => {
    if (mode === "login") {
      setLoginForm((prev) => ({ ...prev, [field]: value }));
      return;
    }

    setRegisterForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForms = () => {
    setLoginForm(defaultLoginState);
    setRegisterForm(defaultRegisterState);
  };

  const storeUserId = (data: any) => {
    const candidateId = data?.id ?? data?.user_id ?? data?.user?.id;

    if (candidateId && typeof window !== "undefined") {
      // Persist the user id locally so it can be reused across pages.
      window.localStorage.setItem(
        "voice-assistant:user-id",
        String(candidateId)
      );
      return String(candidateId);
    }
    return null;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existingId = window.localStorage.getItem("voice-assistant:user-id");
    if (existingId) {
      router.replace("/projects/voice-assistant");
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const endpoint = mode === "login" ? "/users/login" : "/users/register";
      const payload = mode === "login" ? loginForm : registerForm;
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response
          .json()
          .catch(() => ({ message: null }));
        const message =
          errorBody?.message ??
          (mode === "login" ? "Login failed" : "Registration failed");
        throw new Error(message);
      }

      const data = await response.json();
      const storedId = storeUserId(data);

      if (storedId) {
        router.replace("/projects/voice-assistant");
      } else {
        setSuccess(
          mode === "login"
            ? "Welcome back! You are now logged in."
            : "Registration complete! You can now use the assistant."
        );
        resetForms();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    label: string,
    field: keyof RegisterPayload | keyof LoginPayload,
    type = "text",
    placeholder?: string
  ) => (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-300">{label}</span>
      <input
        type={type}
        value={(activeForm as any)[field] ?? ""}
        onChange={(event) => handleInputChange(field, event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-[#23232a] px-4 py-3 text-white outline-none transition focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/30 placeholder:text-gray-500"
        disabled={isLoading}
        required
      />
    </label>
  );

  return (
    <main className="min-h-screen bg-linear-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl grid gap-6 rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl ">
        <div className="flex flex-col justify-center gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-gray-400">
              Voice Assistant
            </span>
            <h1 className="mt-4 text-3xl font-bold text-white">
              {mode === "login" ? "Welcome Back" : "Create Your Account"}
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              {mode === "login"
                ? "Sign in to access your personalized voice assistant workspace."
                : "Register to start building contextual conversations powered by memory-aware AI."}
            </p>
          </div>

          <div className="flex gap-1 rounded-full bg-linear-to-r from-[#18181b] to-[#1f1f23] p-0.5 border border-white/20 shadow-inner backdrop-blur-sm">
            {(
              [
                { key: "login", label: "Login", icon: "👤" },
                { key: "register", label: "Register", icon: "✨" },
              ] as { key: AuthMode; label: string; icon: string }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setMode(tab.key);
                  setError(null);
                  setSuccess(null);
                }}
                className={`group relative flex-1 flex items-center justify-center gap-2 rounded-full px-6 py-1 text-sm font-semibold transition-all duration-300 ${
                  mode === tab.key
                    ? "bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] text-black shadow-lg shadow-[#38bdf8]/30 scale-[0.98]"
                    : "text-gray-400 hover:text-white hover:bg-white/5 active:scale-[0.96]"
                }`}
                disabled={isLoading}
                type="button"
              >
                <span className="text-base">{tab.icon}</span>
                <span className="tracking-wide">{tab.label}</span>
                {mode === tab.key && (
                  <div className="absolute inset-0 rounded-xl bg-linear-to-r from-white/20 to-transparent pointer-events-none" />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <div className="grid gap-4 md:grid-cols-2">
                {renderInput("Full Name", "full_name", "text", "Alex Johnson")}
                {renderInput("Email", "email", "email", "alex@mail.com")}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {renderInput("Username", "username", "text", "alexj")}
              {renderInput("Password", "password", "password", "••••••••")}
            </div>

            {mode === "register" && (
              <div className="grid gap-4 md:grid-cols-2">
                {renderInput("Account Status", "status", "text", "active")}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] px-6 py-3 text-sm font-semibold text-black shadow-lg transition hover:shadow-[#38bdf8]/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Register"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
