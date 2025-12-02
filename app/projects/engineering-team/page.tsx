"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiRefreshCw, FiTrash2 } from "react-icons/fi";

type Project = {
  id: number;
  requirements: string;
  module_name: string;
  class_name: string;
  project_name: string;
  created_at?: string;
  updated_at?: string;
};

// API endpoint - update this to your backend URL
const API_URL =
  process.env.NEXT_PUBLIC_API_URL_ENGINEERING || "http://localhost:8001";

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string[]>>(
    {}
  );
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line
  }, []);

  async function fetchProjects(filterName?: string) {
    setLoading(true);
    try {
      let url = `${API_URL}/projects`;
      if (filterName && filterName.trim()) {
        url += `?project_name=${encodeURIComponent(filterName.trim())}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data: Project[] = await res.json();
      setProjects(data);
      data.forEach((p) => handleListFiles(p.project_name));
    } catch (err: any) {
      setMessage(err.message || "Error fetching projects");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProject(id: number) {
    if (!confirm("Delete project? This will remove DB entry and files."))
      return;
    try {
      const res = await fetch(`${API_URL}/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      setMessage("Project deleted");
      await fetchProjects();
    } catch (err: any) {
      setMessage(err.message || "Error deleting project");
    }
  }

  async function handleListFiles(project_name: string) {
    try {
      const res = await fetch(
        `${API_URL}/core/list-files/${encodeURIComponent(project_name)}`
      );
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to list files");
      }
      const files: string[] = await res.json();
      setSelectedFiles((prev) => ({ ...prev, [project_name]: files }));
    } catch (err: any) {
      setMessage(err.message || "Error listing files");
      setSelectedFiles((prev) => ({ ...prev, [project_name]: [] }));
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] py-12 px-4">
      <section className="mx-auto w-full max-w-5xl flex flex-col gap-8">
        <header className="mb-2 space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-400">
            Engineering Team
          </span>
          <h1 className="text-4xl font-bold bg-linear-to-r from-[#ff6a3d] via-[#ff8c61] to-[#ffa785] bg-clip-text text-transparent">
            Project Management
          </h1>
          <p className="text-sm text-gray-400 md:text-base">
            View, manage, and download engineering projects and their files.
          </p>
        </header>

        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => router.push("/projects/engineering-team/process")}
              className="flex items-center gap-2 rounded-lg bg-linear-to-r from-[#ff6a3d] to-[#ff8c61] px-4 py-2 text-white font-medium shadow hover:shadow-[#ff6a3d]/40 transition-all duration-200"
            >
              ➕ New Project
            </button>
            <button
              onClick={() => fetchProjects(filter)}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] px-4 py-2 text-white font-medium shadow hover:shadow-[#38bdf8]/40 transition-all duration-200 disabled:opacity-60"
            >
              <FiRefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by project name..."
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 min-w-[200px]"
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchProjects(e.currentTarget.value);
              }}
            />
            <button
              onClick={() => fetchProjects(filter)}
              className="rounded-lg bg-linear-to-r from-[#2dd4bf] to-[#14b8a6] px-3 py-2 text-white text-sm font-medium hover:shadow-lg hover:shadow-[#2dd4bf]/40 transition-all duration-200"
            >
              Filter
            </button>
          </div>
          {message && <span className="text-red-400 text-sm">{message}</span>}
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
              <div className="inline-flex items-center gap-2 text-gray-400">
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
                Loading projects...
              </div>
            </div>
          ) : (
            <>
              {projects.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
                  No projects found.
                </div>
              )}
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() =>
                    router.push(`/projects/engineering-team/process?id=${p.id}`)
                  }
                  className="rounded-xl border border-white/10 bg-black/40 p-6 shadow-lg backdrop-blur-xl cursor-pointer hover:bg-black/60 hover:border-[#ff6a3d]/30 transition-all duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-white">
                        {p.project_name}
                      </div>
                      <div className="text-sm text-gray-400">
                        <span className="font-mono text-[#ff8c61]">
                          {p.class_name}
                        </span>
                        {" / "}
                        <span className="font-mono text-[#ffa785]">
                          {p.module_name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {p.requirements}
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(p.id);
                        }}
                        className="flex items-center gap-1 rounded bg-linear-to-r from-red-500 to-pink-500 px-3 py-1.5 text-xs font-medium text-white hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200"
                      >
                        <FiTrash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                  {selectedFiles[p.project_name] && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-300 mb-1">
                        Files:
                      </div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        {selectedFiles[p.project_name].length === 0 && (
                          <li>(no files)</li>
                        )}
                        {selectedFiles[p.project_name].map((fn) => (
                          <li key={fn} className="flex items-center gap-2">
                            <span>{fn}</span>
                            {fn.endsWith(".zip") && (
                              <a
                                onClick={(e) => e.stopPropagation()}
                                className="ml-2 text-[#ff6a3d] underline hover:text-[#ffa785] transition"
                                href={`${API_URL}/public/${encodeURIComponent(
                                  p.project_name
                                )}/${encodeURIComponent(fn)}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Download
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
