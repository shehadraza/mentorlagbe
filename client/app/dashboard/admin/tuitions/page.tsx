
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  IndianRupee,
  MapPin,
  Monitor,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Tuition = {
  _id?: string;
  id?: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: string;
  location: string;
  monthlyFee: number;
  daysPerWeek: number;
  bannerImage?: string;
  description: string;
  tutorName: string;
  tutorEmail: string;
  approvalStatus: "pending" | "approved" | "rejected";
  isActive: boolean;
  createdAt: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  tuitions?: Tuition[];
  total?: number;
};

type ActionType = "approved" | "rejected";

function getTuitionId(tuition: Tuition) {
  return tuition._id || tuition.id || "";
}

function formatDate(date: string) {
  if (!date) return "Date unavailable";

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-BD").format(amount);
}

export default function AdminTuitionsPage() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTuition, setSelectedTuition] =
    useState<Tuition | null>(null);
  const [processingId, setProcessingId] = useState("");
  const [confirmation, setConfirmation] = useState<{
    tuition: Tuition;
    action: ActionType;
  } | null>(null);

  const getToken = useCallback(async () => {
    const result = await authClient.token();
    const token = result.data?.token;

    if (!token) {
      throw new Error("Your session could not be verified. Please sign in again.");
    }

    return token;
  }, []);

  const loadTuitions = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const token = await getToken();

      const response = await fetch(
        `${API_URL}/api/tuitions/admin/pending`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load pending tuitions.");
      }

      setTuitions(result.tuitions ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading tuitions."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  useEffect(() => {
    void loadTuitions();
  }, [loadTuitions]);

  const filteredTuitions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return tuitions;

    return tuitions.filter((tuition) =>
      [
        tuition.title,
        tuition.subject,
        tuition.classLevel,
        tuition.location,
        tuition.tutorName,
        tuition.tutorEmail,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [tuitions, search]);

  const moderateTuition = async () => {
    if (!confirmation) return;

    const { tuition, action } = confirmation;
    const tuitionId = getTuitionId(tuition);

    if (!tuitionId) {
      setError("This tuition does not have a valid ID.");
      setConfirmation(null);
      return;
    }

    setProcessingId(tuitionId);
    setError("");
    setSuccess("");

    try {
      const token = await getToken();

      const response = await fetch(
        `${API_URL}/api/tuitions/${encodeURIComponent(tuitionId)}/moderate`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            approvalStatus: action,
          }),
        }
      );

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update tuition status.");
      }

      setTuitions((current) =>
        current.filter((item) => getTuitionId(item) !== tuitionId)
      );

      setSelectedTuition((current) =>
        current && getTuitionId(current) === tuitionId ? null : current
      );

      setSuccess(
        action === "approved"
          ? "Tuition approved successfully."
          : "Tuition rejected successfully."
      );

      setConfirmation(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update this tuition."
      );
    } finally {
      setProcessingId("");
    }
  };

  return (
    <main className="min-h-screen bg-[#F3F2EE] px-4 py-7 text-[#0B0B0C] sm:px-6 lg:px-9">
      <div className="mx-auto max-w-[1440px]">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative mb-8 overflow-hidden border border-[#0B0B0C]/10 bg-[#E9E8E1] p-6 sm:p-9"
        >
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-[#B6FF2E]/70" />
          <div className="pointer-events-none absolute -right-1 top-8 h-32 w-32 rounded-full border border-[#0B0B0C]/20" />

          <div className="relative z-10 max-w-3xl">
            <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#52534B]">
              <ShieldCheck size={15} />
              Administration / Moderation
            </div>

            <h1 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
              Tuition
              <span className="ml-3 inline-block bg-[#B6FF2E] px-2 text-[#0B0B0C]">
                Review.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#55564F] sm:text-base">
              Review tutor submissions, check the details and decide which
              opportunities are ready to reach students.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 border border-[#0B0B0C]/15 bg-[#F3F2EE] px-4 py-3">
                <Clock3 size={17} />
                <span className="text-sm font-semibold">
                  {tuitions.length} awaiting review
                </span>
              </div>

              <button
                type="button"
                onClick={() => void loadTuitions(true)}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-2 border border-[#0B0B0C] bg-[#0B0B0C] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#B6FF2E] hover:text-[#0B0B0C] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh list
              </button>
            </div>
          </div>
        </motion.header>

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="border border-[#0B0B0C]/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#77786F]">
                Pending review
              </span>
              <Clock3 size={19} />
            </div>
            <p className="mt-5 text-4xl font-black tracking-tight">
              {loading ? "—" : tuitions.length.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-[#77786F]">
              Submissions waiting for a decision
            </p>
          </div>

          <div className="border border-[#0B0B0C]/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#77786F]">
                Displayed results
              </span>
              <Search size={19} />
            </div>
            <p className="mt-5 text-4xl font-black tracking-tight">
              {filteredTuitions.length.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-[#77786F]">
              Matching your current search
            </p>
          </div>

          <div className="relative overflow-hidden border border-[#0B0B0C] bg-[#B6FF2E] p-5">
            <div className="absolute -bottom-8 -right-5 h-28 w-28 rounded-full border-[15px] border-[#0B0B0C]/10" />
            <div className="relative flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.16em]">
                Your responsibility
              </span>
              <CheckCircle2 size={19} />
            </div>
            <p className="relative mt-5 text-2xl font-black tracking-tight">
              Quality first.
            </p>
            <p className="relative mt-2 max-w-[220px] text-xs leading-5 text-[#34392A]">
              Approve only complete and appropriate tuition posts.
            </p>
          </div>
        </section>

        <section className="border border-[#0B0B0C]/10 bg-white">
          <div className="flex flex-col gap-4 border-b border-[#0B0B0C]/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#85857C]">
                Submission queue
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">
                Pending tuitions
              </h2>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77786F]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, subject, tutor..."
                className="h-12 w-full border border-[#0B0B0C]/15 bg-[#F3F2EE] pl-10 pr-4 text-sm outline-none transition placeholder:text-[#92928A] focus:border-[#0B0B0C] focus:ring-2 focus:ring-[#B6FF2E]"
              />
            </div>
          </div>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mx-5 mt-5 flex items-center gap-2 border border-[#6D9B16]/30 bg-[#B6FF2E]/25 px-4 py-3 text-sm font-semibold sm:mx-6"
              >
                <CheckCircle2 size={17} />
                {success}
                <button
                  type="button"
                  onClick={() => setSuccess("")}
                  className="ml-auto p-1"
                  aria-label="Dismiss success message"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-5 mt-5 flex items-start gap-2 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 sm:mx-6"
              >
                <XCircle size={17} className="mt-0.5 shrink-0" />
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="ml-auto p-1"
                  aria-label="Dismiss error"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="space-y-4 p-5 sm:p-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse gap-4 border border-[#0B0B0C]/10 p-4"
                >
                  <div className="h-24 w-28 shrink-0 bg-[#E9E8E1]" />
                  <div className="flex-1 space-y-3 py-2">
                    <div className="h-4 w-2/3 bg-[#E9E8E1]" />
                    <div className="h-3 w-1/3 bg-[#E9E8E1]" />
                    <div className="h-3 w-1/2 bg-[#E9E8E1]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error && tuitions.length === 0 ? (
            <div className="px-5 py-16 text-center sm:px-8">
              <XCircle size={34} className="mx-auto text-red-500" />
              <h3 className="mt-4 text-xl font-black">
                Could not load submissions
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#77786F]">
                Check your login session and server connection, then try again.
              </p>
              <button
                type="button"
                onClick={() => void loadTuitions()}
                className="mt-6 border border-[#0B0B0C] bg-[#0B0B0C] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B6FF2E] hover:text-[#0B0B0C]"
              >
                Try again
              </button>
            </div>
          ) : filteredTuitions.length === 0 ? (
            <div className="px-5 py-16 text-center sm:px-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center border border-[#0B0B0C]/10 bg-[#F3F2EE]">
                <CheckCircle2 size={29} />
              </div>
              <h3 className="mt-5 text-xl font-black">
                {search ? "No matching submissions" : "Queue is clear"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#77786F]">
                {search
                  ? "Try another search term to find a tuition post."
                  : "There are no pending tuition submissions waiting for review right now."}
              </p>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 border border-[#0B0B0C] px-5 py-2.5 text-sm font-bold transition hover:bg-[#B6FF2E]"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#0B0B0C]/10">
              {filteredTuitions.map((tuition, index) => {
                const id = getTuitionId(tuition);

                return (
                  <motion.article
                    key={id || `${tuition.title}-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.2) }}
                    className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
                  >
                    <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
                      <div className="relative h-36 w-full shrink-0 overflow-hidden bg-[#E9E8E1] sm:h-28 sm:w-36">
                        {tuition.bannerImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={tuition.bannerImage}
                            alt={tuition.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <BookOpen size={35} className="text-[#77786F]" />
                          </div>
                        )}
                        <span className="absolute left-2 top-2 bg-[#B6FF2E] px-2 py-1 text-[10px] font-black uppercase tracking-wider">
                          Pending
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#85857C]">
                            {tuition.subject}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-[#B6FF2E]" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#85857C]">
                            {tuition.classLevel}
                          </span>
                        </div>

                        <h3 className="mt-2 text-xl font-black leading-tight tracking-tight sm:text-2xl">
                          {tuition.title}
                        </h3>

                        <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-[#77786F]">
                          {tuition.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#55564F]">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={14} />
                            {tuition.location}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Monitor size={14} />
                            {tuition.mode}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={14} />
                            {tuition.daysPerWeek} days/week
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <IndianRupee size={14} />
                            BDT {formatMoney(tuition.monthlyFee)}/month
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#0B0B0C]/10 pt-3 text-xs text-[#77786F]">
                          <span>
                            Tutor:{" "}
                            <strong className="text-[#0B0B0C]">
                              {tuition.tutorName}
                            </strong>
                          </span>
                          <span>{tuition.tutorEmail}</span>
                          <span>Submitted {formatDate(tuition.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">
                      <button
                        type="button"
                        onClick={() => setSelectedTuition(tuition)}
                        className="inline-flex flex-1 items-center justify-center gap-2 border border-[#0B0B0C]/20 px-4 py-3 text-xs font-bold transition hover:border-[#0B0B0C] hover:bg-[#F3F2EE] lg:min-w-36"
                      >
                        View details
                        <ArrowUpRight size={14} />
                      </button>

                      <button
                        type="button"
                        disabled={processingId === id}
                        onClick={() =>
                          setConfirmation({ tuition, action: "approved" })
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 border border-[#0B0B0C] bg-[#B6FF2E] px-4 py-3 text-xs font-black transition hover:bg-[#0B0B0C] hover:text-white disabled:opacity-50 lg:min-w-36"
                      >
                        <Check size={15} />
                        Approve
                      </button>

                      <button
                        type="button"
                        disabled={processingId === id}
                        onClick={() =>
                          setConfirmation({ tuition, action: "rejected" })
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 border border-red-200 px-4 py-3 text-xs font-bold text-red-700 transition hover:border-red-600 hover:bg-red-50 disabled:opacity-50 lg:min-w-36"
                      >
                        <X size={15} />
                        Reject
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-[#0B0B0C]/10 bg-[#F3F2EE] px-5 py-4 text-xs text-[#77786F] sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span>
              Showing {filteredTuitions.length} of {tuitions.length} pending submissions
            </span>
            <span className="font-semibold uppercase tracking-[0.12em]">
              MentorLagbe Admin
            </span>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {selectedTuition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0B0C]/65 p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedTuition(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-[#F3F2EE] p-5 sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#77786F]">
                    Submission details
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                    {selectedTuition.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTuition(null)}
                  className="border border-[#0B0B0C]/15 p-2 transition hover:bg-[#B6FF2E]"
                  aria-label="Close details"
                >
                  <X size={19} />
                </button>
              </div>

              {selectedTuition.bannerImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedTuition.bannerImage}
                  alt={selectedTuition.title}
                  className="mt-6 max-h-64 w-full object-cover"
                />
              )}

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  ["Subject", selectedTuition.subject],
                  ["Class", selectedTuition.classLevel],
                  ["Mode", selectedTuition.mode],
                  ["Location", selectedTuition.location],
                  ["Monthly fee", `BDT ${formatMoney(selectedTuition.monthlyFee)}`],
                  ["Days per week", String(selectedTuition.daysPerWeek)],
                ].map(([label, value]) => (
                  <div key={label} className="border border-[#0B0B0C]/10 bg-white p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#85857C]">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-bold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 border border-[#0B0B0C]/10 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#85857C]">
                  Description
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#55564F]">
                  {selectedTuition.description}
                </p>
              </div>

              <div className="mt-5 border border-[#0B0B0C]/10 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#85857C]">
                  Tutor information
                </p>
                <p className="mt-3 font-bold">{selectedTuition.tutorName}</p>
                <p className="mt-1 break-all text-sm text-[#77786F]">
                  {selectedTuition.tutorEmail}
                </p>
                <p className="mt-3 text-xs text-[#77786F]">
                  Submitted on {formatDate(selectedTuition.createdAt)}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmation({
                      tuition: selectedTuition,
                      action: "approved",
                    });
                  }}
                  className="flex-1 border border-[#0B0B0C] bg-[#B6FF2E] px-5 py-3 text-sm font-black transition hover:bg-[#0B0B0C] hover:text-white"
                >
                  Approve tuition
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmation({
                      tuition: selectedTuition,
                      action: "rejected",
                    });
                  }}
                  className="flex-1 border border-red-300 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
                >
                  Reject tuition
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0B0B0C]/70 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="w-full max-w-md border border-[#0B0B0C]/10 bg-[#F3F2EE] p-6 sm:p-8"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center ${
                  confirmation.action === "approved"
                    ? "bg-[#B6FF2E]"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {confirmation.action === "approved" ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <XCircle size={24} />
                )}
              </div>

              <h3 className="mt-5 text-2xl font-black tracking-tight">
                {confirmation.action === "approved"
                  ? "Approve this tuition?"
                  : "Reject this tuition?"}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#77786F]">
                You are about to{" "}
                <strong className="text-[#0B0B0C]">
                  {confirmation.action}
                </strong>{" "}
                <strong className="text-[#0B0B0C]">
                  {confirmation.tuition.title}
                </strong>
                . This will update its approval status.
              </p>

              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  disabled={Boolean(processingId)}
                  onClick={() => setConfirmation(null)}
                  className="flex-1 border border-[#0B0B0C]/20 px-4 py-3 text-sm font-bold transition hover:bg-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={Boolean(processingId)}
                  onClick={() => void moderateTuition()}
                  className={`flex-1 border border-[#0B0B0C] px-4 py-3 text-sm font-black transition disabled:opacity-50 ${
                    confirmation.action === "approved"
                      ? "bg-[#B6FF2E] hover:bg-[#0B0B0C] hover:text-white"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {processingId
                    ? "Processing..."
                    : confirmation.action === "approved"
                      ? "Confirm approval"
                      : "Confirm rejection"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
