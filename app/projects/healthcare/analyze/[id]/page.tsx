"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useDropzone } from "react-dropzone";

interface Patient {
  id?: number;
  registration_no: string;
  name: string;
  address: string;
  contact_no: string;
  email: string;
  registration_date: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL_CHUNKING || "http://localhost:8000";

export default function AnalyzePatientPage() {
  const params = useParams();
  const id = params.id as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch patient details
  useEffect(() => {
    if (id) {
      const fetchPatient = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(
            `${API_BASE_URL}/healthcare/patients/${id}`
          );
          if (!response.ok) throw new Error("Patient not found");
          const data: Patient = await response.json();
          setPatient(data);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      };
      fetchPatient();
    }
  }, [id]);

  // Dropzone for file upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    onDrop: (acceptedFiles: File[]) => {
      setFile(acceptedFiles[0]);
    },
    multiple: false,
  });

  // Handle analysis
  const handleAnalyze = async () => {
    if (!file || !patient) return;
    setLoading(true);
    setError(null);
    setSummary(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", patient.email);

    try {
      const response = await fetch(`${API_BASE_URL}/healthcare-assistant/run`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Analysis failed");
      const data = await response.json();
      setSummary(data.summary_email_content);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !patient) {
    return (
      <main className="min-h-screen bg-linear-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] py-12 px-4">
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
            <div className="text-center">
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
                Loading patient details...
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (error && !patient) {
    return (
      <main className="min-h-screen bg-linear-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] py-12 px-4">
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4">
              <p className="text-red-300">Error: {error}</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!patient) {
    return (
      <main className="min-h-screen bg-linear-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] py-12 px-4">
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
            <div className="text-center text-gray-400">No patient found.</div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] py-12 px-4">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
          <header className="mb-8 space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-400">
              Schedule And Publish
            </span>
            <h1 className="text-4xl font-bold bg-linear-to-r from-[#ff6a3d] via-[#ff8c61] to-[#ffa785] bg-clip-text text-transparent">
              Analyze Patient: {patient.name}
            </h1>
            <p className="text-sm text-gray-400 md:text-base">
              Upload medical documents for AI-powered analysis and generate
              comprehensive health reports and scheduled the appointment.
            </p>
          </header>

          <div className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {/* Patient Details */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-bold bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] bg-clip-text text-transparent mb-4">
                📋 Patient Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-300">
                      Registration No:
                    </span>
                    <p className="text-white font-medium">
                      {patient.registration_no}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-300">
                      Full Name:
                    </span>
                    <p className="text-white font-medium">{patient.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-300">
                      Contact No:
                    </span>
                    <p className="text-gray-300">{patient.contact_no}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-300">
                      Address:
                    </span>
                    <p className="text-gray-300">{patient.address}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-300">
                      Email:
                    </span>
                    <p className="text-gray-300">{patient.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-300">
                      Registration Date:
                    </span>
                    <p className="text-gray-300">{patient.registration_date}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-bold bg-linear-to-r from-[#2dd4bf] to-[#14b8a6] bg-clip-text text-transparent mb-4">
                📎 Upload Medical Document
              </h2>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? "border-[#ff6a3d] bg-[#ff6a3d]/10"
                    : "border-white/20 hover:border-[#ff6a3d]/50 hover:bg-white/5"
                }`}
              >
                <input {...getInputProps()} />
                <div className="space-y-2">
                  {isDragActive ? (
                    <div className="text-[#ff6a3d]">
                      <svg
                        className="w-12 h-12 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-lg font-medium">
                        Drop the file here...
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <svg
                        className="w-12 h-12 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-lg font-medium mb-2">
                        Drag & drop a medical document
                      </p>
                      <p className="text-sm">or click to browse files</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Supports PDF and image files (PNG, JPG, JPEG)
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {file && (
                <div className="mt-4 p-3 bg-[#ff6a3d]/10 border border-[#ff6a3d]/30 rounded-lg">
                  <div className="flex items-center gap-2 text-[#ff6a3d]">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="font-medium">
                      Selected file: {file.name}
                    </span>
                    <span className="text-xs">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
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
                  Analyzing Document...
                </>
              ) : (
                <>🔍 Analyze and Publish Report</>
              )}
            </button>

            {/* Analysis Results */}
            {summary && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-bold bg-linear-to-r from-[#c084fc] to-[#a855f7] bg-clip-text text-transparent mb-4">
                  📊 Analysis Summary
                </h2>
                <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                  <pre className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                    {summary}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
