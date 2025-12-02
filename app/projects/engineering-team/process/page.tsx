"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type Project = {
  id: number;
  requirements: string;
  module_name: string;
  class_name: string;
  project_name: string;
};

type EngineeringInput = {
  requirements: string;
  module_name: string;
  class_name: string;
  project_name: string;
};
// API endpoint - update this to your backend URL
const API_URL =
  process.env.NEXT_PUBLIC_API_URL_ENGINEERING || "http://localhost:8001";

function RunEngineeringPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [form, setForm] = useState<EngineeringInput>({
    requirements: "",
    module_name: "",
    class_name: "",
    project_name: "",
  });
  const [formDisabled, setFormDisabled] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [zipUrl, setZipUrl] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if form is valid (all fields filled)
  const isFormValid =
    form.requirements.trim() &&
    form.module_name.trim() &&
    form.class_name.trim() &&
    form.project_name.trim();

  // Fetch project if id is present
  useEffect(() => {
    if (id) {
      fetch(`${API_URL}/projects/${id}`)
        .then((res) => res.json())
        .then((data: Project) => {
          setForm({
            requirements: data.requirements,
            module_name: data.module_name,
            class_name: data.class_name,
            project_name: data.project_name,
          });
          setFormDisabled(true);
          setProjectName(data.project_name);
          fetchFiles(data.project_name);
        })
        .catch(() => setMessage("Project not found"));
    }
  }, [id]);

  // Fetch files for a project
  async function fetchFiles(project_name: string) {
    try {
      const res = await fetch(
        `${API_URL}/core/list-files/${encodeURIComponent(project_name)}`
      );
      if (!res.ok) throw new Error("Failed to fetch files");
      const files: string[] = await res.json();
      setFiles(files);
      if (files.length > 0) {
        setSelectedFile(files[0]);
        fetchFileContent(project_name, files[0]);
      }
    } catch {
      setFiles([]);
      setSelectedFile(null);
      setFileContent("");
    }
  }

  // Fetch zip url for a project
  async function fetchZipUrl(project_name: string) {
    await fetch(
      `${API_URL}/core/zip-project/${encodeURIComponent(project_name)}`,
      {
        method: "POST",
      }
    );
    setZipUrl(
      `${API_URL}/public/${encodeURIComponent(
        project_name
      )}/${encodeURIComponent(project_name)}.zip`
    );
  }

  // Fetch file content
  async function fetchFileContent(project_name: string, file: string) {
    const url = `${API_URL}/public/${encodeURIComponent(
      project_name
    )}/${encodeURIComponent(file)}`;
    const res = await fetch(url);
    if (res.ok) {
      setFileContent(await res.text());
    } else {
      setFileContent("Unable to load file content.");
    }
  }

  // Handle form input
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Handle form submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/run-engineering/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to run engineering");
      setMessage("Engineering process completed!");
      setProjectName(form.project_name);
      fetchFiles(form.project_name);
      setFormDisabled(true);
    } catch {
      setMessage("Failed to run engineering");
    } finally {
      setIsLoading(false);
    }
  }

  // Copy file content
  function handleCopy() {
    navigator.clipboard.writeText(fileContent);
  }

  // Download file
  function handleDownload() {
    if (!selectedFile) return;
    const url = `${API_URL}/public/${encodeURIComponent(
      projectName
    )}/${encodeURIComponent(selectedFile)}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = selectedFile;
    link.click();
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] py-12 px-4">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
          <header className="mb-8 space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-400">
              Engineering Team Agent
            </span>
            <h1 className="text-4xl font-bold bg-linear-to-r from-[#38bdf8] via-[#0ea5e9] to-[#0284c7] bg-clip-text text-transparent">
              Full Project Generator
            </h1>
            <p className="text-sm text-gray-400 md:text-base">
              Generate and manage engineering project code with automated file
              creation and processing.
            </p>
          </header>

          <div className="">
            <div>
              <h2 className="text-2xl font-bold bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] bg-clip-text text-transparent">
                Project Idea
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Requirements <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="requirements"
                    value={form.requirements}
                    onChange={handleChange}
                    disabled={formDisabled}
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 resize-none"
                    placeholder="Enter project requirements..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Module Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="module_name"
                      value={form.module_name}
                      onChange={handleChange}
                      disabled={formDisabled}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30"
                      placeholder="Enter module name..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Class Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="class_name"
                      value={form.class_name}
                      onChange={handleChange}
                      disabled={formDisabled}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30"
                      placeholder="Enter class name..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Project Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="project_name"
                      value={form.project_name}
                      onChange={handleChange}
                      disabled={formDisabled}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30"
                      placeholder="Enter project name..."
                    />
                  </div>
                </div>
                {!formDisabled && (
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      isFormValid
                        ? "bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] text-black hover:shadow-lg hover:shadow-[#38bdf8]/50"
                        : "bg-gray-600 text-white cursor-not-allowed"
                    }`}
                  >
                    🚀 Run Engineering
                  </button>
                )}
              </form>
              {message && (
                <div
                  className={`rounded-lg border p-4 mt-6 ${
                    message.includes("completed")
                      ? "border-green-500/40 bg-green-500/10 text-green-300"
                      : "border-red-500/40 bg-red-500/10 text-red-300"
                  }`}
                >
                  <p>{message}</p>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col mt-10 gap-6 h-[88vh]">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-linear-to-r from-[#2dd4bf] to-[#14b8a6] bg-clip-text text-transparent">
                  Project Files
                </h2>
                {/* {zipUrl && ( */}
                <button
                  onClick={async () => {
                    if (projectName) {
                      await fetchZipUrl(projectName);
                      // Trigger download after ZIP is generated
                      const link = document.createElement("a");
                      link.href = zipUrl;
                      link.download = `${projectName}.zip`;
                      link.click();
                    }
                  }}
                  className="bg-linear-to-r from-[#2dd4bf] to-[#14b8a6] text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-[#2dd4bf]/50 transition-all duration-200 flex items-center gap-2 text-sm"
                >
                  📦 Download ZIP
                </button>
                {/* )} */}
              </div>

              <div className="flex flex-1 min-h-0 gap-4 h-full">
                <div className="w-48 rounded-xl border border-white/10 bg-white/5 overflow-y-auto ">
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">
                      Files
                    </h3>
                    <ul className="space-y-1">
                      {files.map((f) => (
                        <li key={f}>
                          <button
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                              selectedFile === f
                                ? "bg-[#38bdf8]/20 text-white border border-[#38bdf8]/30"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                            }`}
                            onClick={() => {
                              setSelectedFile(f);
                              fetchFileContent(projectName, f);
                            }}
                          >
                            {f}
                          </button>
                        </li>
                      ))}
                    </ul>
                    {files.length === 0 && (
                      <p className="text-gray-500 text-sm">
                        No files available
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex-1 rounded-xl border border-white/10 bg-white/5 flex flex-col">
                  {selectedFile ? (
                    <>
                      <div className="flex justify-end items-center gap-3 p-4 border-b border-white/10">
                        <button
                          onClick={handleCopy}
                          className="bg-linear-to-r from-[#c084fc] to-[#a21caf] text-white px-3 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-[#c084fc]/50 transition-all duration-200 text-sm flex items-center gap-2"
                        >
                          📋 Copy
                        </button>
                        <button
                          onClick={handleDownload}
                          className="bg-linear-to-r from-[#ff6a3d] to-[#ff8c61] text-white px-3 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-[#ff6a3d]/50 transition-all duration-200 text-sm flex items-center gap-2"
                        >
                          💾 Download
                        </button>
                      </div>
                      <div className="flex-1 p-4 overflow-y-auto">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed min-h-full">
                          {fileContent}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-8">
                      <p className="text-gray-500">
                        Select a file to view its content
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading Modal */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-black/90 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center space-y-6">
              <h3 className="text-xl font-bold bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] bg-clip-text text-transparent">
                Generating Project
              </h3>
              <p className="text-gray-400">
                Please wait while we create your project...
              </p>
              <div className="flex justify-center">
                <img
                  src="/loader_black.gif"
                  alt="Loading..."
                  className="w-50"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function RunEngineeringPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-linear-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] py-12 px-4">
          <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
              <div className="text-center py-12">
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
                  Loading...
                </div>
              </div>
            </div>
          </section>
        </main>
      }
    >
      <RunEngineeringPageContent />
    </Suspense>
  );
}
