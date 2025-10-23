"use client";

import { useState } from "react";

// Types for API responses
interface ChunkMetadata {
  chunk_index?: number;
  total_chunks?: number;
  window_size?: number;
  step_size?: number;
  granularity?: string;
  [key: string]: any;
}

interface Chunk {
  chunk_id: number;
  content: string;
  metadata: ChunkMetadata;
  length?: number;
}

interface ChunkingResponse {
  success?: boolean;
  num_chunks: number;
  chunks: Chunk[];
  file_info?: {
    filename: string;
    content_type: string;
    text_length: number;
  };
  chunking_params?: {
    method: string;
    chunk_size: number;
    chunk_overlap: number;
    [key: string]: any;
  };
  statistics?: {
    num_chunks: number;
    total_characters: number;
    average_chunk_length: number;
    min_chunk_length: number;
    max_chunk_length: number;
  };
}

export default function ChunkingTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [method, setMethod] = useState<string>("block");
  const [chunkSize, setChunkSize] = useState<number>(1000);
  const [chunkOverlap, setChunkOverlap] = useState<number>(200);
  const [windowSize, setWindowSize] = useState<number>(100);
  const [stepSize, setStepSize] = useState<number>(50);
  const [granularity, setGranularity] = useState<string>("word");
  const [language, setLanguage] = useState<string>("");
  const [lengthFunction, setLengthFunction] = useState<string>("word");
  const [model, setModel] = useState<string>("gpt-4o-mini");
  const [temperature, setTemperature] = useState<number>(0.0);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ChunkingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // API endpoint - update this to your backend URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL_CHUNKING || "http://localhost:8000";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("method", method);
      if (method !== "sliding_window" && method !== "agentic") {
        formData.append("chunk_size", chunkSize.toString());
        formData.append("chunk_overlap", chunkOverlap.toString());
        if (method === "sentence" && lengthFunction) {
        formData.append("length_function", lengthFunction);
      }
      }
      
      // Add method-specific parameters
      if (method === "sliding_window") {
        formData.append("window_size", windowSize.toString());
        formData.append("step_size", stepSize.toString());
        formData.append("granularity", granularity);
      }
      
      if (method === "agentic") {
        formData.append("model", model);
        formData.append("temperature", temperature.toString());
      }
      
      if (language) {
        formData.append("language", language);
      }

      const res = await fetch(`${API_URL}/chunk`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `HTTP error! status: ${res.status}`);
      }

      const data: ChunkingResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Chunking error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ff6a3d] via-[#ff8c61] to-[#ffa785] bg-clip-text text-transparent mb-2">
              🤖 Advanced Chunking Simulator
            </h1>
            <p className="text-gray-400">
              Upload a document and test different chunking strategies
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                📄 Upload File
              </label>
              <input
                type="file"
                accept=".pdf,.txt,.md,.docx"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#ff6a3d]/20 file:text-[#ff6a3d]
                  hover:file:bg-[#ff6a3d]/30
                  cursor-pointer border border-white/10 rounded-lg bg-white/5 p-2"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-400">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                🔧 Chunking Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white shadow-sm focus:border-[#ff6a3d] focus:ring-[#ff6a3d] px-4 py-2"
              >
                <option value="block" className="bg-[#1a1a1a]">Block (Recursive Character)</option>
                <option value="sentence" className="bg-[#1a1a1a]">Sentence-Based</option>
                <option value="sliding_window" className="bg-[#1a1a1a]">Sliding Window</option>
                <option value="agentic" className="bg-[#1a1a1a]">Agentic (LLM-Powered)</option>
              </select>
            </div>

            {/* Common Parameters - Only for block and sentence methods */}
            {(method === "block" || method === "sentence") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chunk Size
                  </label>
                  <input
                    type="number"
                    value={chunkSize}
                    onChange={(e) => setChunkSize(Number(e.target.value))}
                    min="1"
                    max="10000"
                    className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white shadow-sm focus:border-[#ff6a3d] focus:ring-[#ff6a3d] px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chunk Overlap
                  </label>
                  <input
                    type="number"
                    value={chunkOverlap}
                    onChange={(e) => setChunkOverlap(Number(e.target.value))}
                    min="0"
                    max="5000"
                    className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white shadow-sm focus:border-[#ff6a3d] focus:ring-[#ff6a3d] px-4 py-2"
                  />
                </div>
              </div>
            )}

            {/* Language (Optional) - Only for block and sentence methods */}
            {(method === "block" || method === "sentence") && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Programming Language (Optional)
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white shadow-sm focus:border-[#ff6a3d] focus:ring-[#ff6a3d] px-4 py-2"
                >
                  <option value="" className="bg-[#1a1a1a]">None</option>
                  <option value="CPP" className="bg-[#1a1a1a]">C++</option>
                  <option value="GO" className="bg-[#1a1a1a]">Go</option>
                  <option value="JAVA" className="bg-[#1a1a1a]">Java</option>
                  <option value="KOTLIN" className="bg-[#1a1a1a]">Kotlin</option>
                  <option value="JS" className="bg-[#1a1a1a]">JavaScript</option>
                  <option value="TS" className="bg-[#1a1a1a]">TypeScript</option>
                  <option value="PHP" className="bg-[#1a1a1a]">PHP</option>
                  <option value="PROTO" className="bg-[#1a1a1a]">Protobuf</option>
                  <option value="PYTHON" className="bg-[#1a1a1a]">Python</option>
                  <option value="RST" className="bg-[#1a1a1a]">reStructuredText</option>
                  <option value="RUBY" className="bg-[#1a1a1a]">Ruby</option>
                  <option value="RUST" className="bg-[#1a1a1a]">Rust</option>
                  <option value="SCALA" className="bg-[#1a1a1a]">Scala</option>
                  <option value="SWIFT" className="bg-[#1a1a1a]">Swift</option>
                  <option value="MARKDOWN" className="bg-[#1a1a1a]">Markdown</option>
                  <option value="LATEX" className="bg-[#1a1a1a]">LaTeX</option>
                  <option value="HTML" className="bg-[#1a1a1a]">HTML</option>
                  <option value="SOL" className="bg-[#1a1a1a]">Solidity</option>
                  <option value="CSHARP" className="bg-[#1a1a1a]">C#</option>
                  <option value="COBOL" className="bg-[#1a1a1a]">COBOL</option>
                  <option value="C" className="bg-[#1a1a1a]">C</option>
                  <option value="LUA" className="bg-[#1a1a1a]">Lua</option>
                  <option value="PERL" className="bg-[#1a1a1a]">Perl</option>
                  <option value="HASKELL" className="bg-[#1a1a1a]">Haskell</option>
                  <option value="ELIXIR" className="bg-[#1a1a1a]">Elixir</option>
                  <option value="POWERSHELL" className="bg-[#1a1a1a]">PowerShell</option>
                  <option value="VISUALBASIC6" className="bg-[#1a1a1a]">Visual Basic 6</option>
                </select>
              </div>
            )}

            {/* Method-Specific Parameters */}
            {method === "sliding_window" && (
              <div className="bg-[#38bdf8]/10 border border-[#38bdf8]/30 p-4 rounded-lg space-y-4">
                <h3 className="font-medium text-[#38bdf8]">Sliding Window Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Window Size
                    </label>
                    <input
                      type="number"
                      value={windowSize}
                      onChange={(e) => setWindowSize(Number(e.target.value))}
                      min="1"
                      className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white shadow-sm focus:border-[#38bdf8] focus:ring-[#38bdf8] px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Step Size
                    </label>
                    <input
                      type="number"
                      value={stepSize}
                      onChange={(e) => setStepSize(Number(e.target.value))}
                      min="1"
                      className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white shadow-sm focus:border-[#38bdf8] focus:ring-[#38bdf8] px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Granularity
                    </label>
                    <select
                      value={granularity}
                      onChange={(e) => setGranularity(e.target.value)}
                      className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white shadow-sm focus:border-[#38bdf8] focus:ring-[#38bdf8] px-4 py-2"
                    >
                      <option value="character" className="bg-[#1a1a1a]">Character</option>
                      <option value="word" className="bg-[#1a1a1a]">Word</option>
                      <option value="sentence" className="bg-[#1a1a1a]">Sentence</option>
                      <option value="token" className="bg-[#1a1a1a]">Token</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {method === "sentence" && (
              <div className="bg-[#2dd4bf]/10 border border-[#2dd4bf]/30 p-4 rounded-lg">
                <label className="block text-sm font-medium text-[#2dd4bf] mb-2">
                  Length Function
                </label>
                <select
                  value={lengthFunction}
                  onChange={(e) => setLengthFunction(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white shadow-sm focus:border-[#2dd4bf] focus:ring-[#2dd4bf] px-4 py-2"
                >
                  <option value="word" className="bg-[#1a1a1a]">Word Count</option>
                  <option value="sentence" className="bg-[#1a1a1a]">Sentence Count</option>
                  <option value="simple_sentence_count" className="bg-[#1a1a1a]">Simple Sentence Count</option>
                  <option value="advanced_sentence_count" className="bg-[#1a1a1a]">Advanced Sentence Count</option>
                </select>
              </div>
            )}

            {method === "agentic" && (
              <div className="bg-[#c084fc]/10 border border-[#c084fc]/30 p-4 rounded-lg space-y-4">
                <h3 className="font-medium text-[#c084fc]">Agentic Chunking Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Model
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white shadow-sm focus:border-[#c084fc] focus:ring-[#c084fc] px-4 py-2"
                    >
                      <option value="gpt-4o-mini" className="bg-[#1a1a1a]">GPT-4O Mini</option>
                      <option value="gpt-4o" className="bg-[#1a1a1a]">GPT-4O</option>
                      <option value="gpt-4" className="bg-[#1a1a1a]">GPT-4</option>
                      <option value="gpt-3.5-turbo" className="bg-[#1a1a1a]">GPT-3.5 Turbo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Temperature
                    </label>
                    <input
                      type="number"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      min="0"
                      max="2"
                      step="0.1"
                      className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white shadow-sm focus:border-[#c084fc] focus:ring-[#c084fc] px-4 py-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-gradient-to-r from-[#ff6a3d] to-[#ff8c61] text-white py-3 px-6 rounded-lg font-medium 
                hover:shadow-lg hover:shadow-[#ff6a3d]/50 disabled:bg-gray-700 disabled:cursor-not-allowed
                transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>🚀 Chunk Document</>
              )}
            </button>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-2xl mr-3">❌</span>
                <div>
                  <h3 className="text-red-400 font-medium">Error</h3>
                  <p className="text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Response Display */}
          {response && (
            <div className="mt-8 space-y-6">
              {/* Statistics */}
              <div className="bg-[#2dd4bf]/10 border border-[#2dd4bf]/30 rounded-lg p-6">
                <h2 className="text-xl font-bold text-[#2dd4bf] mb-4 flex items-center gap-2">
                  ✅ Chunking Complete
                </h2>
                
                {response.statistics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Total Chunks</p>
                      <p className="text-2xl font-bold text-white">
                        {response.statistics.num_chunks}
                      </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Avg Length</p>
                      <p className="text-2xl font-bold text-white">
                        {Math.round(response.statistics.average_chunk_length)}
                      </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Min Length</p>
                      <p className="text-2xl font-bold text-white">
                        {response.statistics.min_chunk_length}
                      </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Max Length</p>
                      <p className="text-2xl font-bold text-white">
                        {response.statistics.max_chunk_length}
                      </p>
                    </div>
                  </div>
                )}

                {response.file_info && (
                  <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                    <h3 className="font-medium text-white mb-2">File Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-300">
                      <p><span className="font-medium text-[#ff6a3d]">Filename:</span> {response.file_info.filename}</p>
                      <p><span className="font-medium text-[#ff6a3d]">Type:</span> {response.file_info.content_type}</p>
                      <p><span className="font-medium text-[#ff6a3d]">Text Length:</span> {response.file_info.text_length.toLocaleString()} chars</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chunks Display */}
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-[#ff6a3d] to-[#ff8c61] bg-clip-text text-transparent mb-4">
                  📝 Chunks ({response.num_chunks})
                </h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {response.chunks.map((chunk) => (
                    <div
                      key={chunk.chunk_id}
                      className="group relative bg-white/5 border border-white/10 rounded-lg p-4 hover:border-[#ff6a3d]/50 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#ff6a3d]/0 via-[#ff6a3d]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-[#ff6a3d]">
                            Chunk #{chunk.chunk_id}
                          </h3>
                          <span className="text-sm text-gray-400">
                            {chunk.length || chunk.content.length} chars
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm whitespace-pre-wrap mb-2">
                          {chunk.content.substring(0, 500)}
                          {chunk.content.length > 500 && "..."}
                        </p>
                        {chunk.metadata && Object.keys(chunk.metadata).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-400 cursor-pointer hover:text-[#ff6a3d]">
                              View Metadata
                            </summary>
                            <pre className="mt-2 text-xs bg-black/40 p-2 rounded overflow-x-auto text-gray-300 border border-white/10">
                              {JSON.stringify(chunk.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}