"use client";

import { FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";

interface DeepResearchRequest {
  query: string;
  email: string;
  workflow_models?: { [key: string]: number };
  search_count?: number;
}

interface ReportData {
  short_summary: string;
  markdown_report: string;
  follow_up_questions: string[];
}

const modelOptions = [
  { value: 1, label: "LLaMA 3.2 3B (via Ollama)" },
  { value: 2, label: "DeepSeek R1-LLaMA 70B (via OpenRouter)" },
  { value: 3, label: "Qwen 3-30B (via OpenRouter)" },
  { value: 4, label: "GPT-4o-mini (via OpenAI)" },
  { value: 5, label: "GPT-5-mini (via OpenAI)" },
  { value: 6, label: "GPT-4.1-mini (via OpenAI)" },
];

const capableModels = {
  search_plan: [1, 2, 3, 4, 5, 6],
  perform_search: [4, 5, 6],
  write_report: [2, 3, 4, 5, 6],
  send_email: [4, 5, 6],
};

export default function DeepResearchPage() {
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [searchCount, setSearchCount] = useState(3);
  const [workflowModels, setWorkflowModels] = useState({
    search_plan: 1,
    perform_search: 4,
    write_report: 4,
    send_email: 4,
  });
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // API endpoint - update this to your backend URL
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL_CHUNKING || "http://localhost:8000";

  const handleWorkflowModelChange = (stage: string, value: number) => {
    setWorkflowModels((prev) => ({ ...prev, [stage]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setReport(null);

    const payload: DeepResearchRequest = {
      query,
      email,
      workflow_models: workflowModels,
      search_count: searchCount,
    };

    try {
      const response = await fetch(`${API_URL}/deep-research/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch report");
      }

      const data: ReportData = await response.json();
      setReport(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] py-12 px-4">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
          <header className="mb-8 space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-400">
              Deep Research
            </span>
            <h1 className="text-4xl font-bold bg-linear-to-r from-[#ff6a3d] via-[#ff8c61] to-[#ffa785] bg-clip-text text-transparent">
              AI-Powered Deep Research
            </h1>
            <p className="text-sm text-gray-400 md:text-base">
              Unleash comprehensive research on any topic with multi-model AI
              workflows. Get detailed reports delivered straight to your inbox.
            </p>
          </header>

          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Research Query
                  </label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/30"
                    placeholder="Enter your research topic..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/30"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              {/* Advanced Settings Toggle */}
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 py-2 underline text-gray-300 hover:text-white transition-all duration-200"
                >
                  <span className="text-sm font-medium">
                    {showAdvanced ? "Hide" : "Show"} Advanced Settings
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      showAdvanced ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
              {/* Advanced Settings */}
              <div
                className={`grid grid-cols-1 md:grid-cols-5 gap-6 transition-all duration-300 ease-in-out ${
                  showAdvanced
                    ? "opacity-100"
                    : "opacity-0 max-h-0 overflow-hidden"
                }`}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Search Count
                  </label>
                  <input
                    type="number"
                    value={searchCount}
                    onChange={(e) => setSearchCount(Number(e.target.value))}
                    min={1}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Search Planning Agent
                  </label>
                  <select
                    value={workflowModels.search_plan}
                    onChange={(e) =>
                      handleWorkflowModelChange(
                        "search_plan",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/30"
                  >
                    {modelOptions
                      .filter((opt) =>
                        capableModels.search_plan.includes(opt.value)
                      )
                      .map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          className="bg-[#1a1a1a]"
                        >
                          {opt.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Search Execution Agent
                  </label>
                  <select
                    value={workflowModels.perform_search}
                    onChange={(e) =>
                      handleWorkflowModelChange(
                        "perform_search",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/30"
                  >
                    {modelOptions
                      .filter((opt) =>
                        capableModels.perform_search.includes(opt.value)
                      )
                      .map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          className="bg-[#1a1a1a]"
                        >
                          {opt.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Report Writing Agent
                  </label>
                  <select
                    value={workflowModels.write_report}
                    onChange={(e) =>
                      handleWorkflowModelChange(
                        "write_report",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/30"
                  >
                    {modelOptions
                      .filter((opt) =>
                        capableModels.write_report.includes(opt.value)
                      )
                      .map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          className="bg-[#1a1a1a]"
                        >
                          {opt.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Delivery Agent
                  </label>
                  <select
                    value={workflowModels.send_email}
                    onChange={(e) =>
                      handleWorkflowModelChange(
                        "send_email",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/30"
                  >
                    {modelOptions
                      .filter((opt) =>
                        capableModels.send_email.includes(opt.value)
                      )
                      .map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          className="bg-[#1a1a1a]"
                        >
                          {opt.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="col-span-1 md:col-span-5 ">
                  <p className="text-[#ff6a3d]">
                    Note: If OpenRouter is giving error for some models, please
                    switch to Ollama or OpenAI models.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-[#ff6a3d] to-[#ff8c61] text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg hover:shadow-[#ff6a3d]/50 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Running Research...
                  </>
                ) : (
                  <>🚀 Start Deep Research</>
                )}
              </button>
            </form>

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {report && (
              <div className="space-y-6">
                <div className="bg-[#2dd4bf]/10 border border-[#2dd4bf]/30 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-[#2dd4bf] mb-4">
                    📋 Short Summary
                  </h2>
                  <p className="text-gray-300">{report.short_summary}</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h2 className="text-xl font-bold bg-linear-to-r from-[#ff6a3d] to-[#ff8c61] bg-clip-text text-transparent mb-4">
                    📄 Detailed Report
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>{report.markdown_report}</ReactMarkdown>
                  </div>
                </div>

                <div className="bg-[#c084fc]/10 border border-[#c084fc]/30 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-[#c084fc] mb-4">
                    ❓ Follow-up Questions
                  </h2>
                  <ul className="space-y-2">
                    {report.follow_up_questions.map((q, i) => (
                      <li
                        key={i}
                        className="text-gray-300 flex items-start gap-2"
                      >
                        <span className="text-[#c084fc] mt-1">•</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
