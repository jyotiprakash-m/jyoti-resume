"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Patient {
  id?: number;
  registration_no: string;
  name: string;
  address: string;
  contact_no: string;
  email: string;
  registration_date: string;
}

interface Doctor {
  id?: number;
  name: string;
  specialist: string;
  hospital: string;
  contact_no: string;
  email: string;
  education: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL_CHUNKING || "http://localhost:8000";

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [filterName, setFilterName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDoctorsModal, setShowDoctorsModal] = useState(false);
  const [newPatient, setNewPatient] = useState<Patient>({
    registration_no: "",
    name: "",
    address: "",
    contact_no: "",
    email: "",
    registration_date: "",
  });
  const [bulkPatients, setBulkPatients] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Doctors modal state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [doctorSpecialist, setDoctorSpecialist] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Fetch patients from API
  const fetchPatients = async (name?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = name
        ? `${API_BASE_URL}/healthcare/patients/?name=${encodeURIComponent(
            name
          )}`
        : `${API_BASE_URL}/healthcare/patients/`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data: Patient[] = await response.json();
      setPatients(data);
      setFilteredPatients(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterName(value);
    fetchPatients(value);
  };

  // Handle add patient
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/healthcare/patients/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient),
      });
      if (!response.ok) throw new Error("Failed to add patient");
      setShowAddModal(false);
      setNewPatient({
        registration_no: "",
        name: "",
        address: "",
        contact_no: "",
        email: "",
        registration_date: "",
      });
      fetchPatients(filterName);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const patientsArray: Patient[] = JSON.parse(bulkPatients);
      const response = await fetch(
        `${API_BASE_URL}/healthcare/patients/bulk/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patientsArray),
        }
      );
      if (!response.ok) throw new Error("Failed to bulk upload patients");
      setShowBulkModal(false);
      setBulkPatients("");
      fetchPatients(filterName);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctors for modal
  const fetchDoctors = async (specialist?: string) => {
    setLoadingDoctors(true);
    try {
      const url = specialist
        ? `${API_BASE_URL}/healthcare/doctors/?specialist=${encodeURIComponent(
            specialist
          )}`
        : `${API_BASE_URL}/healthcare/doctors/`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch doctors");
      const data: Doctor[] = await response.json();
      setDoctors(data);
      setFilteredDoctors(data);
    } catch {
      setDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Open doctors modal and fetch doctors
  const handleOpenDoctorsModal = () => {
    setShowDoctorsModal(true);
    setDoctorSpecialist("");
    fetchDoctors();
  };

  // Handle doctor specialist filter
  const handleDoctorSpecialistChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setDoctorSpecialist(value);
    fetchDoctors(value);
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] py-12 px-4">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
          <header className="mb-8 space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-400">
              Healthcare Agent
            </span>
            <h1 className="text-4xl font-bold bg-linear-to-r from-[#ff6a3d] via-[#ff8c61] to-[#ffa785] bg-clip-text text-transparent">
              Agentic Pathology
            </h1>
            <p className="text-sm text-gray-400 md:text-base">
              Seamlessly handle patient data while simplifying the scheduling
              and publishing of pathology reports. and bulk operations.
            </p>
          </header>

          <div className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {/* Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Filter by Name
              </label>
              <input
                type="text"
                placeholder="Search patients by name..."
                value={filterName}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/30"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex-1 bg-linear-to-r from-[#38bdf8] to-[#0ea5e9] text-black py-2 px-4 rounded-lg font-medium hover:shadow-lg hover:shadow-[#38bdf8]/50 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                ➕ Add Patient
              </button>
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex-1 bg-linear-to-r from-[#2dd4bf] to-[#14b8a6] text-black py-2 px-4 rounded-lg font-medium hover:shadow-lg hover:shadow-[#2dd4bf]/50 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                📤 Bulk Upload
              </button>
              <button
                onClick={handleOpenDoctorsModal}
                className="flex-1 bg-linear-to-r from-[#c084fc] to-[#a21caf] text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg hover:shadow-[#c084fc]/50 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                🩺 Doctors
              </button>
            </div>

            {/* Patients Table */}
            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
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
                    Loading patients...
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-medium text-gray-300">
                          ID
                        </th>
                        <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-medium text-gray-300">
                          Registration No
                        </th>
                        <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-medium text-gray-300">
                          Name
                        </th>
                        <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-medium text-gray-300">
                          Address
                        </th>
                        <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-medium text-gray-300">
                          Contact No
                        </th>
                        <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-medium text-gray-300">
                          Email
                        </th>
                        <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-medium text-gray-300">
                          Registration Date
                        </th>
                        <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-medium text-gray-300">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((patient) => (
                        <tr
                          key={patient.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {patient.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {patient.registration_no}
                          </td>
                          <td className="px-4 py-3 text-sm text-white font-medium">
                            {patient.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {patient.address}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {patient.contact_no}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {patient.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {patient.registration_date}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() =>
                                router.push(
                                  `/projects/healthcare/analyze/${patient.id}`
                                )
                              }
                              className="bg-linear-to-r from-[#ff6a3d] to-[#ff8c61] text-white px-3 py-1 rounded-md text-xs font-medium hover:shadow-lg hover:shadow-[#ff6a3d]/50 transition-all duration-200"
                            >
                              Publish
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPatients.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                      No patients found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-black/90 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold bg-linear-to-r from-[#ff6a3d] to-[#ff8c61] bg-clip-text text-transparent mb-6">
              Add New Patient
            </h2>
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Registration No
                </label>
                <input
                  type="text"
                  placeholder="Enter registration number"
                  value={newPatient.registration_no}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      registration_no: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter patient name"
                  value={newPatient.name}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Enter address"
                  value={newPatient.address}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, address: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Number
                </label>
                <input
                  type="text"
                  placeholder="Enter contact number"
                  value={newPatient.contact_no}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, contact_no: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newPatient.email}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Registration Date
                </label>
                <input
                  type="date"
                  value={newPatient.registration_date}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      registration_date: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#ff6a3d] focus:outline-none focus:ring-2 focus:ring-[#ff6a3d]/30"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-linear-to-r from-[#ff6a3d] to-[#ff8c61] text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg hover:shadow-[#ff6a3d]/50 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                      Adding...
                    </>
                  ) : (
                    <>Add Patient</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-black/90 border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold bg-linear-to-r from-[#2dd4bf] to-[#14b8a6] bg-clip-text text-transparent mb-6">
              Bulk Upload Patients
            </h2>
            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Patient Data (JSON Array)
                </label>
                <textarea
                  placeholder='[{"registration_no": "123", "name": "John Doe", "address": "123 Main St", "contact_no": "555-0123", "email": "john@example.com", "registration_date": "2024-01-01"}, ...]'
                  value={bulkPatients}
                  onChange={(e) => setBulkPatients(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#2dd4bf] focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/30 h-48 resize-none"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-linear-to-r from-[#2dd4bf] to-[#14b8a6] text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg hover:shadow-[#2dd4bf]/50 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                      Uploading...
                    </>
                  ) : (
                    <>Upload Patients</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-6 py-3 rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctors Modal */}
      {showDoctorsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-black/90 border border-white/10 rounded-2xl p-8 w-full max-w-6xl shadow-2xl">
            <h2 className="text-2xl font-bold bg-linear-to-r from-[#c084fc] to-[#a21caf] bg-clip-text text-transparent mb-6">
              Doctors List
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filter by Specialist
              </label>
              <input
                type="text"
                placeholder="Search by specialist..."
                value={doctorSpecialist}
                onChange={handleDoctorSpecialistChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#c084fc] focus:outline-none focus:ring-2 focus:ring-[#c084fc]/30"
              />
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 overflow-x-auto max-h-96">
              {loadingDoctors ? (
                <div className="p-8 text-center text-gray-400">
                  Loading doctors...
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-medium text-gray-300">
                        ID
                      </th>
                      <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-medium text-gray-300">
                        Name
                      </th>
                      <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-medium text-gray-300">
                        Specialist
                      </th>
                      <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-medium text-gray-300">
                        Hospital
                      </th>
                      <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-medium text-gray-300">
                        Contact No
                      </th>
                      <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-medium text-gray-300">
                        Email
                      </th>
                      <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-medium text-gray-300">
                        Education
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.length > 0 ? (
                      filteredDoctors.map((doctor) => (
                        <tr
                          key={doctor.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {doctor.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-white font-medium">
                            {doctor.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {doctor.specialist}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {doctor.hospital}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {doctor.contact_no}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {doctor.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {doctor.education}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-gray-400"
                        >
                          No doctors found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            <div className="flex justify-end pt-6">
              <button
                type="button"
                onClick={() => setShowDoctorsModal(false)}
                className="px-6 py-3 rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
