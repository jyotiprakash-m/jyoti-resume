"use client";

import React, { useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL_SUPPLYCHAIN || "http://localhost:9090";

export default function SupplyChainQueryPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Database modal
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Tables modal
  const [isTablesModalOpen, setIsTablesModalOpen] = useState(false);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any>(null);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);

  // Fetch tables when modal opens
  const handleOpenTablesModal = async () => {
    setIsTablesModalOpen(true);
    setTables([]);
    setSelectedTable(null);
    setTableData(null);
    setTableError(null);
    setTablesLoading(true);
    try {
      const res = await fetch(`${API_URL}/supplychain/tables`);
      if (!res.ok) throw new Error("Failed to fetch tables");
      const data = await res.json();
      // Accepts array of table names
      setTables(Array.isArray(data) ? data : data.tables || []);
    } catch (err: any) {
      setTableError(err.message || "Error fetching tables");
    } finally {
      setTablesLoading(false);
    }
  };

  // Fetch table data when tab is clicked
  const handleSelectTable = async (tableName: string) => {
    setSelectedTable(tableName);
    setTableData(null);
    setTableError(null);
    setTablesLoading(true);
    try {
      const res = await fetch(`${API_URL}/supplychain/table/${tableName}`);
      if (!res.ok) throw new Error("Failed to fetch table data");
      const data = await res.json();
      setTableData(data);
    } catch (err: any) {
      setTableError(err.message || "Error fetching table data");
    } finally {
      setTablesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/supplychain/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Query failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] py-12 px-4 relative">
      {/* Top right icons */}
      <div className="absolute top-8 right-8 z-30 flex gap-4">
        {/* Database icon */}
        <button
          onClick={() => setIsDbModalOpen(true)}
          className="p-3 rounded-full bg-[#23232a] hover:bg-[#38bdf8]/20 transition shadow text-[#38bdf8]"
          title="Show Database"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <ellipse cx="12" cy="6" rx="8" ry="3" strokeWidth={2} />
            <path
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6v6c0 1.657 3.582 3 8 3s8-1.343 8-3V6m-16 6v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6"
            />
          </svg>
        </button>
        {/* Table icon */}
        <button
          onClick={handleOpenTablesModal}
          className="p-3 rounded-full bg-[#23232a] hover:bg-[#38bdf8]/20 transition shadow text-[#38bdf8]"
          title="Show Tables"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <rect x="3" y="6" width="18" height="4" rx="1" strokeWidth={2} />
            <rect x="3" y="14" width="18" height="4" rx="1" strokeWidth={2} />
          </svg>
        </button>
      </div>

      {/* Database Modal */}
      {isDbModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsDbModalOpen(false)}
          ></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl z-50">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Database Schema</h2>
              <button
                onClick={() => setIsDbModalOpen(false)}
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
            <div className="p-6 flex justify-center items-center">
              <img
                src="/database.png"
                alt="Supply Chain Database Schema"
                className="rounded-xl border border-white/10 shadow-lg max-h-full object-contain"
              />
            </div>
          </div>
        </>
      )}

      {/* Tables Modal */}
      {isTablesModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsTablesModalOpen(false)}
          ></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl z-50">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Tables</h2>
              <button
                onClick={() => setIsTablesModalOpen(false)}
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
            <div className="px-6 pt-6 pb-2">
              {tablesLoading && (
                <div className="text-center text-[#38bdf8] py-8">
                  Loading tables...
                </div>
              )}
              {tableError && (
                <div className="text-center text-red-400 py-8">
                  {tableError}
                </div>
              )}
              {!tablesLoading && !tableError && tables.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-6">
                  {tables.map((table) => (
                    <button
                      key={table}
                      className={`px-4 py-2 rounded-xl font-mono text-sm border ${
                        selectedTable === table
                          ? "bg-[#38bdf8] text-black border-[#38bdf8]"
                          : "bg-[#23232a] text-white border-white/10 hover:bg-[#38bdf8]/10"
                      } transition`}
                      onClick={() => handleSelectTable(table)}
                    >
                      {table}
                    </button>
                  ))}
                </div>
              )}
              {selectedTable && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {selectedTable} Table Data
                  </h3>
                  {tablesLoading && (
                    <div className="text-center text-[#38bdf8] py-4">
                      Loading data...
                    </div>
                  )}
                  {tableError && (
                    <div className="text-center text-red-400 py-4">
                      {tableError}
                    </div>
                  )}
                  {tableData && (
                    <pre className="bg-[#23232a] rounded-lg p-4 text-sm text-[#38bdf8] overflow-x-auto max-h-[350px]">
                      {JSON.stringify(tableData, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <section className="mx-auto w-full max-w-5xl flex flex-col gap-8">
        <header className="mb-2 space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-400">
            Supply Chain
          </span>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#38bdf8] via-[#0ea5e9] to-[#06b6d4] bg-clip-text text-transparent">
            SQL Query Runner
          </h1>
          <p className="text-sm text-gray-400 md:text-base">
            Run SQL queries on your supply chain data securely and efficiently.
          </p>
        </header>
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl flex flex-col gap-6"
        >
          <label className="block text-sm font-medium text-gray-300 mb-2">
            SQL Query <span className="text-red-400">*</span>
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={10}
            className="w-full rounded-xl border border-white/10 bg-[#23232a] px-4 py-3 text-sm text-white font-mono placeholder:text-gray-500 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30"
            placeholder="Enter your SQL query here..."
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#0ea5e9] px-4 py-3 text-black font-bold shadow hover:shadow-[#38bdf8]/40 transition-all duration-200 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-[#38bdf8]"
                  viewBox="0 0 24 24"
                >
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
                Running...
              </span>
            ) : (
              "Run Query"
            )}
          </button>
          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 p-4 mt-2">
              <strong>Error:</strong> {error}
            </div>
          )}
        </form>
        {result && (
          <div className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl mt-4">
            <h2 className="text-xl font-bold text-white mb-4">Result</h2>
            <pre className="bg-[#18181b] rounded-lg p-4 text-sm text-[#38bdf8] overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </section>
    </main>
  );
}
