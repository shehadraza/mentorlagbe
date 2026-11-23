
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Clock3,
  Check,
  X,
  Mail,
  Phone,
  CalendarDays,
  BookOpen,
  ArrowUpRight,
  ChevronDown,
  RefreshCw,
  Loader2,
  SlidersHorizontal,
  Sparkles,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ApplicationStatus = "pending" | "accepted" | "rejected";
type FilterStatus = "all" | ApplicationStatus;

interface Application {
  _id?: string;
  id?: string;
  tuitionId: string;
  tuitionTitle: string;
  subject: string;
  monthlyFee: number;
  tutorEmail: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  preferredSchedule: string;
  studentNote: string;
  status: ApplicationStatus;
  appliedAt: string;
}

const filters: { label: string; value: FilterStatus }[] = [
  { label: "All applications", value: "all" },
  { label: "Needs review", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
];

function formatDate(value: string) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatFee(value: number) {
  return `৳${Number(value || 0).toLocaleString("en-BD")}`;
}

function getInitials(name: string) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ST"
  );
}

function StatusLabel({ status }: { status: ApplicationStatus }) {
  const config = {
    pending: {
      label: "Awaiting review",
      dot: "bg-[#A3D900]",
      text: "text-[#667F00]",
      background: "bg-[#B6FF2E]/20",
    },
    accepted: {
      label: "Accepted",
      dot: "bg-[#0B0B0C]",
      text: "text-[#0B0B0C]",
      background: "bg-[#B6FF2E]",
    },
    rejected: {
      label: "Rejected",
      dot: "bg-neutral-400",
      text: "text-neutral-600",
      background: "bg-neutral-100",
    },
  };

  const item = config[status];

  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider ${item.background} ${item.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
}

function BookArtwork() {
  return (
    <div className="relative flex h-[210px] w-full items-center justify-center overflow-hidden sm:h-[250px]">
      <div className="absolute h-48 w-48 rounded-full border border-[#B6FF2E]/20 sm:h-60 sm:w-60" />
      <div className="absolute h-36 w-36 rounded-full border border-[#B6FF2E]/20 sm:h-48 sm:w-48" />

      <motion.div
        className="relative z-10"
        animate={{
          y: [0, -11, 0],
          rotate: [-5, -2, -5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ perspective: 800 }}
      >
        <div className="relative h-[116px] w-[150px] sm:h-[145px] sm:w-[188px]">
          <div
            className="absolute inset-0 translate-x-3 translate-y-3 bg-[#B6FF2E]"
            style={{ transform: "skewY(-8deg) rotate(-5deg)" }}
          />

          <div
            className="absolute inset-0 flex flex-col justify-between border border-white/20 bg-[#262626] p-4 text-white shadow-2xl sm:p-5"
            style={{
              transform: "rotate(-8deg) skewY(-3deg)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="flex items-center justify-between">
              <BookOpen size={19} className="text-[#B6FF2E]" />
              <span className="text-[8px] font-bold tracking-[0.2em] text-white/40">
                ML / 01
              </span>
            </div>

            <div>
              <div className="text-2xl font-black leading-none tracking-tighter sm:text-3xl">
                LEARN
                <br />
                <span className="text-[#B6FF2E]">MORE.</span>
              </div>
              <div className="mt-3 h-1 w-10 bg-[#B6FF2E]" />
            </div>
          </div>

          <div
            className="absolute -bottom-2 left-1 right-0 h-2 bg-[#D5D5CD]"
            style={{ transform: "rotate(-8deg) skewX(-30deg)" }}
          />
        </div>
      </motion.div>

      <motion.div
        className="absolute right-[13%] top-[20%] h-4 w-4 rotate-12 bg-[#B6FF2E] sm:h-5 sm:w-5"
        animate={{ y: [0, -12, 0], rotate: [12, 32, 12] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-[18%] left-[15%] h-3 w-3 rounded-full bg-[#B6FF2E]"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </div>
  );
}

export default function TutorApplicantsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data: tokenData, error: tokenError } =
        await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error(
          "Your session could not be verified. Please sign in again."
        );
      }

      const response = await fetch(`${API_URL}/api/applications/tutor`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load applications.");
      }

      setApplications(data.applications || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading applications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const counts = useMemo(
    () => ({
      all: applications.length,
      pending: applications.filter((item) => item.status === "pending").length,
      accepted: applications.filter((item) => item.status === "accepted").length,
      rejected: applications.filter((item) => item.status === "rejected").length,
    }),
    [applications]
  );

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesFilter =
        activeFilter === "all" || application.status === activeFilter;

      const searchable = [
        application.studentName,
        application.studentEmail,
        application.studentPhone,
        application.tuitionTitle,
        application.subject,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && (!query || searchable.includes(query));
    });
  }, [applications, activeFilter, search]);

  const handleStatusChange = async (
    application: Application,
    status: "accepted" | "rejected"
  ) => {
    const applicationId = application._id || application.id;

    if (!applicationId) {
      setError("Application ID is missing. This application cannot be updated.");
      return;
    }

    const confirmed = window.confirm(
      status === "accepted"
        ? `Accept ${application.studentName}'s application?`
        : `Reject ${application.studentName}'s application?`
    );

    if (!confirmed) return;

    setUpdatingId(applicationId);
    setError("");
    setNotice("");

    try {
      const { data: tokenData, error: tokenError } =
        await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error(
          "Your session could not be verified. Please sign in again."
        );
      }

      const response = await fetch(
        `${API_URL}/api/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${tokenData.token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not update application.");
      }

      setApplications((current) =>
        current.map((item) =>
          (item._id || item.id) === applicationId
            ? { ...item, status }
            : item
        )
      );

      setExpandedId(null);
      setNotice(
        status === "accepted"
          ? "Application accepted successfully."
          : "Application rejected successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update application."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#F3F2EE] pb-12 text-[#0B0B0C]">
      <style jsx global>{`
        @keyframes lime-drift {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(12px, -12px, 0); }
        }

        .lime-drift {
          animation: lime-drift 7s ease-in-out infinite;
        }

        .applicant-row {
          transition: background 220ms ease, padding 220ms ease;
        }

        .applicant-row:hover {
          background: #ffffff;
        }

        @media (prefers-reduced-motion: reduce) {
          .lime-drift {
            animation: none;
          }
        }
      `}</style>

      {/* Editorial masthead */}
      <section className="relative overflow-hidden border-b border-black/10">
        <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full bg-[#B6FF2E]/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1500px] gap-5 px-5 py-8 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-10 lg:py-12">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
              <span className="h-2 w-2 rounded-full bg-[#B6FF2E]" />
              MentorLagbe / Tutor workspace
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="mt-7 max-w-3xl text-[clamp(3.2rem,8vw,6.5rem)] font-black leading-[0.88] tracking-[-0.075em]"
            >
              FIND YOUR
              <br />
              NEXT <span className="text-[#91C900]">STUDENT.</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.55 }}
              className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
            >
              <p className="max-w-md text-sm leading-7 text-neutral-500">
                Every application is a new opportunity to make a difference.
                Explore student requests and find the right learning match.
              </p>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#B6FF2E] flex items-center justify-center">
                  <Users size={19} />
                </div>
                <div>
                  <p className="text-2xl font-black leading-none">
                    {counts.all.toString().padStart(2, "0")}
                  </p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.17em] text-neutral-500">
                    Total applications
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute right-0 top-0 text-right text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              KNOWLEDGE
              <br />
              OPENS DOORS
            </div>
            <BookArtwork />
            <div className="absolute bottom-1 left-8 text-[9px] font-bold tracking-[0.2em] text-neutral-400">
              MENTORLAGBE — 2026
            </div>
          </div>
        </div>
      </section>

      {/* Application overview */}
      <section className="mx-auto max-w-[1500px] px-5 pt-7 sm:px-8 lg:px-10">
        <div className="grid grid-cols-3 border-y border-black/15 py-5 sm:py-7">
          <div className="border-r border-black/10 pr-3">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-neutral-400 sm:text-[10px]">
              To review
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight sm:text-5xl">
                {counts.pending.toString().padStart(2, "0")}
              </span>
              <span className="hidden text-xs text-neutral-400 sm:inline">
                pending
              </span>
            </div>
            <div className="mt-3 h-1 w-12 bg-[#B6FF2E]" />
          </div>

          <div className="border-r border-black/10 px-3 sm:px-6">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-neutral-400 sm:text-[10px]">
              Accepted
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight sm:text-5xl">
                {counts.accepted.toString().padStart(2, "0")}
              </span>
              <span className="hidden text-xs text-neutral-400 sm:inline">
                selected
              </span>
            </div>
            <div className="mt-3 h-1 w-12 bg-black" />
          </div>

          <div className="pl-3 sm:pl-6">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-neutral-400 sm:text-[10px]">
              Rejected
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight sm:text-5xl">
                {counts.rejected.toString().padStart(2, "0")}
              </span>
              <span className="hidden text-xs text-neutral-400 sm:inline">
                closed
              </span>
            </div>
            <div className="mt-3 h-1 w-12 bg-neutral-300" />
          </div>
        </div>
      </section>

      {/* Directory controls */}
      <section className="mx-auto max-w-[1500px] px-5 pt-9 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
              <Sparkles size={13} />
              The directory
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] sm:text-4xl">
              APPLICATIONS<span className="text-[#91C900]">.</span>
            </h2>
            <p className="mt-2 text-xs text-neutral-500">
              Browse, review and manage your student applications.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadApplications()}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 border border-black/15 bg-white px-4 text-xs font-bold transition hover:border-black hover:bg-[#B6FF2E] disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Refresh directory
          </button>
        </div>

        <div className="mt-7 flex flex-col gap-4 border-y border-black/10 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`px-3 py-2 text-[10px] font-bold transition sm:px-4 ${
                  activeFilter === filter.value
                    ? "bg-[#0B0B0C] text-white"
                    : "bg-white text-neutral-500 hover:bg-[#B6FF2E] hover:text-black"
                }`}
              >
                {filter.label}
                <span className="ml-2 opacity-60">
                  {counts[filter.value]}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full lg:max-w-xs">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find a student or tuition..."
              className="h-11 w-full border border-black/15 bg-white pl-10 pr-4 text-xs outline-none transition placeholder:text-neutral-400 focus:border-black focus:ring-2 focus:ring-[#B6FF2E]"
            />
          </div>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-3 border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
            <X size={17} className="mt-0.5 shrink-0" />
            <p className="flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-xs font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {notice && (
          <div className="mt-5 flex items-center gap-3 border-l-4 border-[#91C900] bg-[#B6FF2E]/20 px-4 py-3 text-sm text-black">
            <Check size={17} />
            <p className="flex-1 font-semibold">{notice}</p>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="text-xs font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Directory heading */}
        <div className="mt-7 hidden grid-cols-[minmax(190px,1.1fr)_minmax(180px,1fr)_minmax(120px,0.7fr)_minmax(130px,0.7fr)_40px] gap-4 border-b border-black/15 px-4 pb-3 text-[9px] font-black uppercase tracking-[0.17em] text-neutral-400 md:grid">
          <span>Student</span>
          <span>Tuition details</span>
          <span>Monthly fee</span>
          <span>Application status</span>
          <span />
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="divide-y divide-black/10">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex animate-pulse items-center gap-4 py-6"
              >
                <div className="h-12 w-12 bg-neutral-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-36 bg-neutral-200" />
                  <div className="h-3 w-52 max-w-full bg-neutral-200" />
                </div>
                <div className="hidden h-7 w-24 bg-neutral-200 sm:block" />
              </div>
            ))}
          </div>
        ) : filteredApplications.length > 0 ? (
          <div className="divide-y divide-black/10">
            <AnimatePresence mode="popLayout">
              {filteredApplications.map((application, index) => {
                const applicationId =
                  application._id || application.id || `${index}`;

                const expanded = expandedId === applicationId;
                const isUpdating = updatingId === applicationId;

                return (
                  <motion.div
                    key={applicationId}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, delay: Math.min(index * 0.035, 0.18) }}
                    className="applicant-row"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(expanded ? null : applicationId)
                      }
                      className="grid w-full grid-cols-[1fr_32px] items-center gap-3 px-2 py-5 text-left md:grid-cols-[minmax(190px,1.1fr)_minmax(180px,1fr)_minmax(120px,0.7fr)_minmax(130px,0.7fr)_40px] md:gap-4 md:px-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#B6FF2E] text-sm font-black">
                          {getInitials(application.studentName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black tracking-tight">
                            {application.studentName || "Student"}
                          </p>
                          <p className="mt-1 truncate text-[10px] text-neutral-500">
                            {application.studentEmail}
                          </p>
                          <p className="mt-1 text-[9px] text-neutral-400 md:hidden">
                            Applied {formatDate(application.appliedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="hidden min-w-0 md:block">
                        <p className="truncate text-xs font-bold">
                          {application.tuitionTitle}
                        </p>
                        <p className="mt-1 text-[10px] text-neutral-500">
                          {application.subject}
                        </p>
                      </div>

                      <div className="hidden md:block">
                        <p className="text-sm font-black">
                          {formatFee(application.monthlyFee)}
                        </p>
                        <p className="mt-1 text-[9px] text-neutral-400">
                          Per month
                        </p>
                      </div>

                      <div className="hidden md:block">
                        <StatusLabel status={application.status} />
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <span className="md:hidden">
                          <StatusLabel status={application.status} />
                        </span>
                        <ChevronDown
                          size={17}
                          className={`shrink-0 transition-transform duration-300 ${
                            expanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mb-5 ml-0 border-l-4 border-[#B6FF2E] bg-white p-5 sm:ml-16 sm:p-6">
                            <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
                              <div className="grid flex-1 gap-5 sm:grid-cols-2">
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-[0.17em] text-neutral-400">
                                    Tuition
                                  </p>
                                  <p className="mt-2 text-sm font-black">
                                    {application.tuitionTitle}
                                  </p>
                                  <p className="mt-1 text-xs text-neutral-500">
                                    {application.subject}
                                  </p>
                                  <p className="mt-2 text-xs font-bold">
                                    {formatFee(application.monthlyFee)} / month
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-[0.17em] text-neutral-400">
                                    Application information
                                  </p>
                                  <p className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
                                    <CalendarDays size={13} />
                                    {formatDate(application.appliedAt)}
                                  </p>
                                  {application.preferredSchedule && (
                                    <p className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
                                      <Clock3 size={13} />
                                      {application.preferredSchedule}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-[0.17em] text-neutral-400">
                                    Contact details
                                  </p>
                                  <a
                                    href={`mailto:${application.studentEmail}`}
                                    className="mt-2 flex items-center gap-2 break-all text-xs font-semibold text-neutral-700 hover:underline"
                                  >
                                    <Mail size={13} />
                                    {application.studentEmail}
                                    <ArrowUpRight size={11} />
                                  </a>
                                  {application.studentPhone && (
                                    <a
                                      href={`tel:${application.studentPhone}`}
                                      className="mt-2 flex items-center gap-2 text-xs font-semibold text-neutral-700 hover:underline"
                                    >
                                      <Phone size={13} />
                                      {application.studentPhone}
                                    </a>
                                  )}
                                </div>

                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-[0.17em] text-neutral-400">
                                    Student&apos;s message
                                  </p>
                                  <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-neutral-600">
                                    {application.studentNote ||
                                      "No additional message provided."}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col justify-end gap-2 border-t border-black/10 pt-4 lg:w-48 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                                {application.status === "pending" ? (
                                  <>
                                    <button
                                      type="button"
                                      disabled={isUpdating}
                                      onClick={() =>
                                        void handleStatusChange(
                                          application,
                                          "accepted"
                                        )
                                      }
                                      className="flex h-11 items-center justify-center gap-2 bg-[#B6FF2E] px-4 text-xs font-black transition hover:bg-[#a4eb1e] disabled:opacity-50"
                                    >
                                      {isUpdating ? (
                                        <Loader2
                                          size={15}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Check size={15} />
                                      )}
                                      Accept student
                                    </button>

                                    <button
                                      type="button"
                                      disabled={isUpdating}
                                      onClick={() =>
                                        void handleStatusChange(
                                          application,
                                          "rejected"
                                        )
                                      }
                                      className="flex h-10 items-center justify-center gap-2 border border-black/15 px-4 text-xs font-bold transition hover:border-black hover:bg-neutral-100 disabled:opacity-50"
                                    >
                                      <X size={14} />
                                      Reject application
                                    </button>
                                  </>
                                ) : (
                                  <div className="border border-black/10 p-4">
                                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-neutral-400">
                                      Review complete
                                    </p>
                                    <p className="mt-2 text-sm font-black">
                                      {application.status === "accepted"
                                        ? "Student accepted"
                                        : "Application rejected"}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden border-y border-black/10 py-16 text-center sm:py-20"
          >
            <div className="lime-drift pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 bg-[#B6FF2E]/20 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center bg-[#B6FF2E]">
                {applications.length === 0 ? (
                  <BookOpen size={27} />
                ) : (
                  <SlidersHorizontal size={27} />
                )}
              </div>

              <h3 className="mt-6 text-2xl font-black tracking-tight">
                {applications.length === 0
                  ? "THE NEXT CHAPTER STARTS HERE."
                  : "NO MATCHES FOUND."}
              </h3>

              <p className="mx-auto mt-3 max-w-sm text-xs leading-6 text-neutral-500">
                {applications.length === 0
                  ? "When students apply to your approved tuition posts, their applications will appear in this directory."
                  : "Try a different search or status filter to find the application you're looking for."}
              </p>

              {(search || activeFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setActiveFilter("all");
                  }}
                  className="mt-6 bg-[#0B0B0C] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#B6FF2E] hover:text-black"
                >
                  Reset filters
                </button>
              )}
            </div>
          </motion.div>
        )}

        <div className="mt-8 flex flex-col justify-between gap-2 border-t border-black/10 pt-4 text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-400 sm:flex-row">
          <span>MentorLagbe / Find the right connection</span>
          <span>
            Showing {filteredApplications.length} of {applications.length} applications
          </span>
        </div>
      </section>
    </main>
  );
}
