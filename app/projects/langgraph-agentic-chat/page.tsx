"use client";

import React, { useState, useRef, useEffect } from "react";

type ToolCall = {
  name: string;
  args: Record<string, any>;
  id: string;
  type: string;
};

type Message = {
  id?: string;
  role?: string; // "ai" | "human" | "user" | "system" | etc.
  type?: string;
  name?: string | null;
  content: string;
  additional_kwargs?: {
    refusal?: any;
    [key: string]: any;
  };
  response_metadata?: {
    token_usage?: any;
    model_provider?: string;
    model_name?: string;
    system_fingerprint?: string;
    id?: string;
    service_tier?: string;
    finish_reason?: string;
    logprobs?: any;
    [key: string]: any;
  };
  tool_calls?: ToolCall[];
  invalid_tool_calls?: ToolCall[];
  usage_metadata?: any;
  _showMeta?: boolean; // For toggling metadata display
};
type Thread = { id: string; label: string };

// API endpoint - update this to your backend URL
const API_URL =
  process.env.NEXT_PUBLIC_API_URL_CHUNKING || "http://localhost:8000";

export default function ChatPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
  const [isSuggestedPrompts, setIsSuggestedPrompts] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerFullName, setRegisterFullName] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [users, setUsers] = useState([]);

  const [newPassword, setNewPassword] = useState("");

  // Example prompts as a JSON array
  const examplePrompts = [
    {
      label: "What is the capital of France?",
      value: "What is the capital of France?",
    },
    {
      label: "Explain quantum computing in simple terms.",
      value: "Explain quantum computing in simple terms.",
    },
    {
      label: "Write a TypeScript function to reverse a string.",
      value: "Write a TypeScript function to reverse a string.",
    },
    {
      label: "Search for the latest news about artificial intelligence.",
      value: "Search for the latest news about artificial intelligence.",
    },
    {
      label: "Extract text from the uploaded file.",
      value: "Extract text from the uploaded file.",
    },
    {
      label: "Send a push notification saying 'Meeting at 3 PM'.",
      value: "Send a push notification saying 'Meeting at 3 PM'.",
    },
    {
      label: "Get a public link for the file 'report.pdf'.",
      value: "Get a public link for the file 'report.pdf'.",
    },
    {
      label: "Save the following content as a PDF: 'This is my summary.'",
      value: "Save the following content as a PDF: 'This is my summary.'",
    },
    {
      label: "Send a message to Telegram: 'Hello from the agent!'",
      value: "Send a message to Telegram: 'Hello from the agent!'",
    },
    {
      label:
        "Send a WhatsApp message to +911234567890 saying 'Hi, this is a test.'",
      value:
        "Send a WhatsApp message to +911234567890 saying 'Hi, this is a test.'",
    },
    {
      label: "What is the integral of x^2?",
      value: "What is the integral of x^2?",
    },
    {
      label: "Get a summary of the Wikipedia article on 'Machine Learning'.",
      value: "Get a summary of the Wikipedia article on 'Machine Learning'.",
    },
  ];

  // Get username from localStorage
  const username =
    typeof window !== "undefined"
      ? localStorage.getItem("username") || "demo_user"
      : "demo_user";

  // Check authentication on mount
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setIsAuthenticated(true);
    }
  }, []);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) return;

    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store username in localStorage
        localStorage.setItem("username", loginUsername);
        setIsAuthenticated(true);
      } else {
        const errorData = await response.json();
        setAuthError(errorData.message || "Login failed");
      }
    } catch (error) {
      setAuthError("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };
  // Add this function after handleLogout
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users/`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Add this function after handleLogout
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;

    try {
      const response = await fetch(`${API_URL}/users/${username}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      if (response.ok) {
        setNewPassword("");
        setAuthError("Password changed successfully!");

        // Delete the local storage username to force re-login
        setTimeout(() => {
          localStorage.removeItem("username");
          setIsAuthenticated(false);
          setIsPasswordChangeOpen(false);
        }, 1000);
      } else {
        const errorData = await response.json();
        setAuthError(errorData.message || "Failed to change password");
      }
    } catch (error) {
      setAuthError("Network error. Please try again.");
    }
  };

  // Handle register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerFullName || !registerUsername || !registerPassword) return;

    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await fetch(`${API_URL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: registerFullName,
          username: registerUsername,
          password: registerPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // After successful registration, switch to login mode
        setIsRegistering(false);
        setLoginUsername(registerUsername);
        setLoginPassword("");
        setRegisterFullName("");
        setRegisterUsername("");
        setRegisterPassword("");
        setAuthError("Registration successful! Please log in.");
      } else {
        const errorData = await response.json();
        setAuthError(errorData.message || "Registration failed");
      }
    } catch (error) {
      setAuthError("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch threads on mount
  useEffect(() => {
    if (!isAuthenticated || !username) return;

    fetch(`${API_URL}/agent/threads/${username}`)
      .then((res) => res.json())
      .then((data) => {
        const threadList = (data.threads || []).map((id: string) => ({
          id,
          label: id.split("_")[1] || id,
        }));
        setThreads(threadList);
        if (threadList.length > 0) setSelectedThread(threadList[0]);
      })
      .catch((err) => {
        console.error("Failed to fetch threads:", err);
      });
  }, [isAuthenticated, username]);

  // Fetch messages when thread changes
  useEffect(() => {
    if (!selectedThread || !username) return;

    fetch(
      `${API_URL}/agent/thread/${username}/${selectedThread.label}/messages`
    )
      .then((res) => res.json())
      .then((data) => {
        setMessages(
          (data.messages || []).map((msg: any) => ({
            role: msg.type || msg.role || "ai",
            content: msg.content,
            response_metadata: msg.response_metadata || {},
            tool_calls: msg.tool_calls || [],
          }))
        );
      })
      .catch((err) => {
        console.error("Failed to fetch messages:", err);
      });
  }, [selectedThread, username]);
  const handleSend = async () => {
    if (!input && !file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("message", input);
    formData.append("username", username);
    formData.append("chat_id", selectedThread ? selectedThread.label : "new");
    if (file) formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/agent/sidekick/run`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "user", content: input },
        { role: "ai", content: data.agent_response || "No response" },
      ]);
      setInput("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Error contacting agent." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = () => {
    const newId = `${username}_${Date.now()}`;
    const newThread = { id: newId, label: newId.split("_")[1] };
    setThreads((prev) => [newThread, ...prev]);
    setSelectedThread(newThread);
    setMessages([]);
  };

  const handleDeleteThread = async (threadId: string) => {
    const threadToDelete = threads.find((t) => t.id === threadId);
    if (!threadToDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/agent/thread/${username}/${threadToDelete.label}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setThreads((prev) => prev.filter((t) => t.id !== threadId));
        if (selectedThread && selectedThread.id === threadId) {
          setSelectedThread(threads.length > 1 ? threads[1] : null);
          setMessages([]);
        }
      } else {
        console.error("Failed to delete thread");
        // Optionally, show an error message to the user
      }
    } catch (error) {
      console.error("Error deleting thread:", error);
      // Optionally, show an error message to the user
    }
  };

  // Logout - delete from local storage
  const handleLogout = () => {
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setThreads([]);
    setSelectedThread(null);
    setMessages([]);
    setInput("");
    setFile(null);
    setLoginUsername("");
    setLoginPassword("");
    setRegisterFullName("");
    setRegisterUsername("");
    setRegisterPassword("");
    setAuthError("");
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-[#131314] items-center justify-center">
        <div className="absolute top-4 right-4">
          <button
            onClick={() => {
              setIsUsersModalOpen(true);
              fetchUsers();
            }}
            className="p-2 rounded-lg hover:bg-[#23232a] transition text-gray-400 hover:text-white"
            title="Users"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          {/* Users Modal */}
          {isUsersModalOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setIsUsersModalOpen(false)}
              ></div>
              {/* Modal */}
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-50">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white">All Users</h2>
                  <button
                    onClick={() => setIsUsersModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-[#23232a] transition text-gray-400 hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                  {users.length === 0 ? (
                    <div className="text-center text-gray-400">
                      No users found
                    </div>
                  ) : (
                    <table className="min-w-full text-left text-sm text-gray-400">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 font-semibold text-white">
                            ID
                          </th>
                          <th className="px-4 py-2 font-semibold text-white">
                            Full Name
                          </th>
                          <th className="px-4 py-2 font-semibold text-white">
                            Username
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user: any) => (
                          <tr
                            key={user.id}
                            className="bg-[#23232a] border-b border-white/10"
                          >
                            <td className="px-4 py-2 text-xs">{user.id}</td>
                            <td className="px-4 py-2">{user.full_name}</td>
                            <td className="px-4 py-2">@{user.username}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="w-full max-w-md bg-[#1a1a1a] rounded-2xl shadow-2xl p-8 border border-white/10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to Agenta
          </h1>

          {!isRegistering && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#23232a] px-4 py-3 text-white placeholder:text-gray-400 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#23232a] px-4 py-3 text-white placeholder:text-gray-400 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {authError && (
                <div className="text-[#ff8c61] text-sm">{authError}</div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] px-4 py-3 text-black font-bold shadow hover:shadow-[#38bdf8]/40 transition-all duration-200"
              >
                Sign In
              </button>

              <div className="text-center text-gray-500 text-sm">
                Don't have an account?{" "}
                <button
                  onClick={() => setIsRegistering(true)}
                  className="text-[#38bdf8] hover:underline"
                >
                  Register here
                </button>
              </div>
            </form>
          )}

          {isRegistering && (
            <div className="mt-6 p-4 rounded-lg bg-[#23232a]">
              <h2 className="text-lg font-semibold text-white mb-2">
                Create an account
              </h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={registerFullName}
                    onChange={(e) => setRegisterFullName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-white placeholder:text-gray-400 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-white placeholder:text-gray-400 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30"
                    placeholder="Choose a username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-white placeholder:text-gray-400 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30"
                    placeholder="Create a password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] px-4 py-3 text-black font-bold shadow hover:shadow-[#38bdf8]/40 transition-all duration-200"
                >
                  {authLoading ? "Registering..." : "Register"}
                </button>

                <div className="text-center text-gray-500 text-sm">
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsRegistering(false)}
                    className="text-[#38bdf8] hover:underline"
                  >
                    Login here
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#131314]">
      {/* Sidebar */}
      <aside className="w-72 flex flex-col bg-[#1a1a1a] border-r border-white/10">
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl font-bold text-white tracking-wide">
              Agenta
            </span>
          </div>
          <div>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#23232a] text-white hover:bg-[#23232a]/80 transition font-medium"
              onClick={handleCreateThread}
            >
              <span className="text-lg">＋</span>
            </button>
          </div>
        </div>
        <div className="flex-1 px-2 py-4">
          <div className="text-xs text-gray-400 mb-2 pl-2">Threads</div>
          <div className="max-h-[75vh] overflow-y-auto">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer mb-1 transition-all duration-150 ${
                  selectedThread && selectedThread.id === thread.id
                    ? "bg-[#23232a] text-white border border-[#38bdf8]/30"
                    : "hover:bg-[#23232a]/60 text-gray-300"
                }`}
                onClick={() => setSelectedThread(thread)}
              >
                <span className="truncate font-mono text-base">
                  {thread.label}
                </span>
                <button
                  className="text-red-400 ml-2 hover:text-red-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteThread(thread.id);
                  }}
                  title="Delete thread"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">@{username}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-red-400 hover:text-red-300 underline"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Top bar */}
        <div className="h-16 flex items-center justify-between px-8 border-b border-white/10 bg-[#18181b]">
          <span className="text-lg text-white font-semibold">
            {selectedThread
              ? `Thread: ${selectedThread.label}`
              : "Select a thread"}
          </span>
          {/* Setting icon for drawer */}
          <div>
            <button
              onClick={() => setIsPasswordChangeOpen(true)}
              className="p-2 rounded-lg hover:bg-[#23232a] transition text-gray-400 hover:text-white"
              title="Settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <button
              onClick={() => setIsSuggestedPrompts(true)}
              className="p-2 rounded-lg hover:bg-[#23232a] transition text-gray-400 hover:text-white"
              title="Documentation"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </button>
          </div>
        </div>
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-0 md:px-24 py-8 bg-[#131314]">
          <div className="flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-16">
                No messages yet. Start the conversation!
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "human" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "human" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-xl px-5 py-3 max-w-[70%] font-sans text-base shadow-lg whitespace-pre-line ${
                      msg.role === "human"
                        ? "bg-[#23232a] text-white border border-[#38bdf8]/30"
                        : "bg-[#18181b] text-gray-100 border border-white/10"
                    }`}
                  >
                    {msg.content}
                    {msg?.tool_calls && msg.tool_calls?.length > 0 && (
                      <div className="mt-2 text-xs text-gray-400 bg-[#23232a] rounded p-2 max-w-xs overflow-x-auto">
                        <p>Tools Call:</p>
                        <pre className="whitespace-pre-wrap break-all">
                          {JSON.stringify(msg.tool_calls, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                  {/* Metadata info icon for AI messages */}
                  {msg.role === "ai" && msg?.response_metadata && (
                    <div className="ml-2">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-white focus:outline-none"
                        title="Show metadata"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Toggle metadata display for this message
                          setMessages((prev) =>
                            prev.map((m, i) =>
                              i === idx
                                ? {
                                    ...m,
                                    _showMeta: !m._showMeta,
                                  }
                                : m
                            )
                          );
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <circle cx="12" cy="12" r="10" strokeWidth="2" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 16v-4m0-4h.01"
                          />
                        </svg>
                      </button>
                      {/* Show metadata if toggled */}
                      {msg._showMeta && (
                        <div className="mt-2 text-xs text-gray-400 bg-[#23232a] rounded p-2 max-w-xs overflow-x-auto">
                          <pre className="whitespace-pre-wrap break-all">
                            {JSON.stringify(msg.response_metadata, null, 2)}
                          </pre>
                          {msg?.tool_calls && msg.tool_calls?.length > 0 && (
                            <>
                              <p>Tools:</p>
                              <pre className="whitespace-pre-wrap break-all">
                                {JSON.stringify(msg.tool_calls, null, 2)}
                              </pre>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Input bar */}
        <div className="w-full px-0 md:px-24 py-6 bg-[#18181b] border-t border-white/10 flex items-center gap-3">
          <input
            type="text"
            className="flex-1 rounded-xl border border-white/10 bg-[#23232a] px-4 py-3 text-base text-white placeholder:text-gray-400 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={loading}
          />
          <button
            className="rounded-xl bg-[#c084fc] px-4 py-3 text-white font-semibold shadow hover:shadow-[#c084fc]/40 transition-all duration-200 text-lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            title="Attach file"
          >
            📎
          </button>
          <button
            className="rounded-xl bg-[#38bdf8] px-6 py-3 text-black font-bold shadow hover:shadow-[#38bdf8]/40 transition-all duration-200 text-lg"
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
        {file && (
          <div className="w-full px-0 md:px-24 pb-2 bg-[#18181b] text-sm text-orange-300 flex items-center gap-2">
            Attached: <span className="font-mono">{file.name}</span>
            <button
              className="ml-2 text-red-400 hover:text-red-300"
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              title="Remove attachment"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Settings Drawer */}
      {isPasswordChangeOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsPasswordChangeOpen(false)}
          ></div>

          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-96 bg-[#1a1a1a] border-l border-white/10 shadow-2xl z-50 flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button
                onClick={() => setIsPasswordChangeOpen(false)}
                className="p-2 rounded-lg hover:bg-[#23232a] transition text-gray-400 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Here we will show prompt hints and examples with code buttons */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Change Password
                </h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#23232a] px-4 py-3 text-white placeholder:text-gray-400 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] px-4 py-3 text-black font-bold shadow hover:shadow-[#38bdf8]/40 transition-all duration-200"
                  >
                    Change Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Suggested Prompts */}
      {isSuggestedPrompts && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsPasswordChangeOpen(false)}
          ></div>

          {/* Drawer */}
          <div className="fixed top-0 right-0 h-[100vh] w-96 bg-[#1a1a1a] border-l border-white/10 shadow-2xl z-50 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Example Prompts</h2>
              <button
                onClick={() => setIsSuggestedPrompts(false)}
                className="p-2 rounded-lg hover:bg-[#23232a] transition text-gray-400 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6  overflow-y-auto">
              <div className="space-y-4">
                {examplePrompts.map((ex, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-[#23232a] rounded-lg"
                  >
                    <p className="text-sm text-gray-400 flex-1 mr-4">
                      Example prompt: <br />
                      <span className="font-mono text-white">
                        `"${ex.label}"`
                      </span>
                    </p>
                    <button
                      type="button"
                      className="p-2 rounded-lg hover:bg-[#38bdf8]/30 transition text-xs text-[#38bdf8] underline hover:text-[#0ea5e9] whitespace-nowrap"
                      onClick={() => {
                        setInput(ex.value);
                        setIsSuggestedPrompts(false);
                      }}
                    >
                      Copy to input
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
