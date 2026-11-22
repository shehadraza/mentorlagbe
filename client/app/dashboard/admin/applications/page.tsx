
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const PAGE_SIZE = 10;

type ApplicationStatus = "pending" | "accepted" | "rejected";

type Application = {
  _id: string;
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
  updatedAt?: string;
};

type Pagination = {
  currentPage: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  applications?: Application[];
  pagination?: Pagination;
};

const EMPTY_PAGINATION: Pagination = {
  currentPage: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 0,
};

function formatDate(value: string) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatFee(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getStatusStyle(status: ApplicationStatus) {
  if (status === "accepted") {
    return "border border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "rejected") {
    return "border border-red-200 bg-red-50 text-red-800";
  }

  return "border border-amber-200 bg-amber-50 text-amber-800";
}

function getApplicationId(application: Application) {
  return application._id;
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] =
    useState<Pagination>(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "all" | ApplicationStatus
  >("all");
  const [search, setSearch] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const getToken = useCallback(async () => {
    const result = await authClient.token();
    const token = result.data?.token;

    if (!token) {
      throw new Error("Your session could not be verified. Please sign in again.");
    }

    return token;
  }, []);

  const loadApplications = useCallback(
        async (isRefresh = false) => {
      try {
        const token = await getToken();

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          `${API_URL}/api/applications/admin?page=${page}&limit=${PAGE_SIZE}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const data = (await response.json()) as ApiResponse;

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load applications."
          );
        }

        setApplications(data.applications || []);
        setPagination(data.pagination || EMPTY_PAGINATION);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading applications."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getToken, page]
  );

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesStatus =
        statusFilter === "all" ||
        application.status === statusFilter;

      const searchableValues = [
        application.studentName,
        application.studentEmail,
        application.studentPhone,
        application.tuitionTitle,
        application.subject,
        application.tutorEmail,
        application._id,
      ];

      const matchesSearch =
        !query ||
        searchableValues
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [applications, search, statusFilter]);

  const pendingCount = applications.filter(
    (application) => application.status === "pending"
  ).length;

  const acceptedCount = applications.filter(
    (application) => application.status === "accepted"
  ).length;

  const rejectedCount = applications.filter(
    (application) => application.status === "rejected"
  ).length;

  const changePage = (nextPage: number) => {
    if (
      nextPage < 1 ||
      nextPage > pagination.totalPages ||
      nextPage === page
    ) {
      return;
    }

    setPage(nextPage);
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
          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-[#B6FF2E]/70" />
          <div className="pointer-events-none absolute right-20 top-16 h-28 w-28 rounded-full border border-[#0B0B0C]/20" />

          <div className="relative z-10">
            <Link
              href="/dashboard/admin"
              className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#55564F] transition hover:text-[#0B0B0C]"
            >
              <ArrowLeft size={15} />
              Admin overview
            </Link>

            <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#52534B]">
              <ShieldCheck size={15} />
              Administration / Applications
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
              Every
              <span className="ml-3 inline-block bg-[#B6FF2E] px-2">
                Application.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#55564F] sm:text-base">
              Monitor student applications across the platform. Review
              applicant information, tuition preferences and submission
              history from one place.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 border border-[#0B0B0C]/15 bg-[#F3F2EE] px-4 py-3">
                <ClipboardList size={17} />
                <span className="text-sm font-semibold">
                  Application records
                </span>
              </div>

              <button
                type="button"
                onClick={() => void loadApplications(true)}
                disabled={loading || refreshing}
                className="inline-flex items-center gap-2 border border-[#0B0B0C] bg-[#0B0B0C] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#B6FF2E] hover:text-[#0B0B0C] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh applications
              </button>
            </div>
          </div>
        </motion.header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-[#0B0B0C]/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#77786F]">
                Total applications
              </span>
              <ClipboardList size={19} />
            </div>
            <p className="mt-5 text-4xl font-black tracking-tight">
              {loading ? "—" : pagination.total.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-[#77786F]">
              Across the entire platform
            </p>
          </div>

          <div className="border border-[#0B0B0C]/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#77786F]">
                Pending on this page
              </span>
              <Clock3 size={19} />
            </div>
            <p className="mt-5 text-4xl font-black tracking-tight">
              {loading ? "—" : pendingCount.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-[#77786F]">
              Waiting for tutor review
            </p>
          </div>

          <div className="border border-[#0B0B0C]/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#77786F]">
                Accepted on this page
              </span>
              <CheckCircle2 size={19} />
            </div>
            <p className="mt-5 text-4xl font-black tracking-tight">
              {loading ? "—" : acceptedCount.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-[#77786F]">
              Successfully accepted
            </p>
          </div>

          <div className="relative overflow-hidden border border-[#0B0B0C] bg-[#B6FF2E] p-5">
            <div className="absolute -bottom-8 -right-5 h-28 w-28 rounded-full border-[15px] border-[#0B0B0C]/10" />
            <div className="relative flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.15em]">
                Rejected on this page
              </span>
              <XCircle size={19} />
            </div>
            <p className="relative mt-5 text-4xl font-black tracking-tight">
              {loading ? "—" : rejectedCount.toString().padStart(2, "0")}
            </p>
            <p className="relative mt-2 text-xs text-[#34392A]">
              Applications declined by tutors
            </p>
          </div>
        </section>

        <section className="border border-[#0B0B0C]/10 bg-white">
          <div className="flex flex-col gap-5 border-b border-[#0B0B0C]/10 p-5 sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#85857C]">
                Student application records
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">
                All applications
              </h2>
              <p className="mt-2 text-xs text-[#77786F]">
                Newest applications appear first. Search and filters apply
                to the currently loaded page.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["all", "All"],
                    ["pending", "Pending"],
                    ["accepted", "Accepted"],
                    ["rejected", "Rejected"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    className={`border px-4 py-2.5 text-xs font-bold transition ${
                      statusFilter === value
                        ? "border-[#0B0B0C] bg-[#0B0B0C] text-white"
                        : "border-[#0B0B0C]/15 bg-[#F3F2EE] hover:border-[#0B0B0C]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:max-w-sm">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77786F]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search student, email or tuition..."
                  className="h-11 w-full border border-[#0B0B0C]/15 bg-[#F3F2EE] pl-10 pr-4 text-sm outline-none transition placeholder:text-[#92928A] focus:border-[#0B0B0C] focus:ring-2 focus:ring-[#B6FF2E]"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-5 mt-5 flex items-start gap-2 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 sm:mx-6">
              <XCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
              <button
                type="button"
                onClick={() => void loadApplications()}
                className="ml-auto shrink-0 font-bold underline"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3 p-5 sm:p-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-4 border border-[#0B0B0C]/10 p-4"
                >
                  <div className="h-10 w-10 bg-[#E9E8E1]" />
                  <div className="flex-1 space-y-3">
                    <div className="h-3 w-1/3 bg-[#E9E8E1]" />
                    <div className="h-3 w-1/2 bg-[#E9E8E1]" />
                  </div>
                  <div className="h-7 w-20 bg-[#E9E8E1]" />
                </div>
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="px-5 py-16 text-center sm:px-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center border border-[#0B0B0C]/10 bg-[#F3F2EE]">
                <ClipboardList size={28} />
              </div>
              <h3 className="mt-5 text-xl font-black">
                {search || statusFilter !== "all"
                  ? "No matching applications"
                  : "No applications yet"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#77786F]">
                {search || statusFilter !== "all"
                  ? "Try changing the search term or application status filter."
                  : "When students apply to approved tuition posts, their applications will appear here."}
              </p>
              {(search || statusFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="mt-5 border border-[#0B0B0C] px-5 py-2.5 text-sm font-bold transition hover:bg-[#B6FF2E]"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1100px] border-collapse text-left">
                  <thead>
                    <tr className="bg-[#F3F2EE] text-[10px] font-bold uppercase tracking-[0.14em] text-[#77786F]">
                      <th className="px-5 py-4">Student</th>
                      <th className="px-5 py-4">Tuition</th>
                      <th className="px-5 py-4">Monthly fee</th>
                      <th className="px-5 py-4">Applied on</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Details</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#0B0B0C]/10">
                    {filteredApplications.map((application) => (
                      <tr
                        key={getApplicationId(application)}
                        className="transition hover:bg-[#F3F2EE]/70"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#B6FF2E] text-sm font-black">
                              {application.studentName
                                ?.charAt(0)
                                ?.toUpperCase() || "S"}
                            </div>
                            <div>
                              <p className="font-bold">
                                {application.studentName || "Unknown student"}
                              </p>
                              <p className="mt-1 text-xs text-[#77786F]">
                                {application.studentEmail}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <p className="max-w-[240px] truncate text-sm font-bold">
                            {application.tuitionTitle}
                          </p>
                          <p className="mt-1 text-xs text-[#77786F]">
                            {application.subject}
                          </p>
                        </td>

                        <td className="px-5 py-5 text-sm font-bold">
                          {formatFee(application.monthlyFee)}
                        </td>

                        <td className="px-5 py-5 text-xs text-[#77786F]">
                          {formatDate(application.appliedAt)}
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] ${getStatusStyle(application.status)}`}
                          >
                            {application.status}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <button
                            type="button"
                            onClick={() => setSelectedApplication(application)}
                            className="inline-flex items-center gap-2 border border-[#0B0B0C]/15 px-3 py-2 text-xs font-bold transition hover:border-[#0B0B0C] hover:bg-[#B6FF2E]"
                          >
                            <Eye size={14} />
                            View details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 lg:hidden">
                {filteredApplications.map((application) => (
                  <article
                    key={getApplicationId(application)}
                    className="border border-[#0B0B0C]/10 bg-[#F9F8F5] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#B6FF2E] font-black">
                          {application.studentName
                            ?.charAt(0)
                            ?.toUpperCase() || "S"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold">
                            {application.studentName || "Unknown student"}
                          </p>
                          <p className="truncate text-xs text-[#77786F]">
                            {application.studentEmail}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 px-2 py-1 text-[10px] font-bold uppercase ${getStatusStyle(application.status)}`}
                      >
                        {application.status}
                      </span>
                    </div>

                    <div className="mt-4 border-t border-[#0B0B0C]/10 pt-3">
                      <p className="text-sm font-bold">
                        {application.tuitionTitle}
                      </p>
                      <p className="mt-1 text-xs text-[#77786F]">
                        {application.subject} · {formatFee(application.monthlyFee)}
                      </p>
                      <p className="mt-2 text-xs text-[#77786F]">
                        Applied {formatDate(application.appliedAt)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedApplication(application)}
                      className="mt-4 flex w-full items-center justify-center gap-2 border border-[#0B0B0C]/15 px-3 py-2.5 text-xs font-bold transition hover:bg-[#B6FF2E]"
                    >
                      <Eye size={14} />
                      View application details
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}

          <div className="flex flex-col gap-3 border-t border-[#0B0B0C]/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#77786F]">
              {pagination.total === 0
                ? "No records"
                : `Page ${pagination.currentPage} of ${pagination.totalPages} · ${pagination.total} total applications`}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changePage(page - 1)}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 border border-[#0B0B0C]/15 px-4 py-2.5 text-xs font-bold transition hover:bg-[#B6FF2E] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={14} />
                Previous
              </button>

              <button
                type="button"
                onClick={() => changePage(page + 1)}
                disabled={page >= pagination.totalPages || loading}
                className="inline-flex items-center gap-2 border border-[#0B0B0C] bg-[#0B0B0C] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#B6FF2E] hover:text-[#0B0B0C] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {selectedApplication && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0B0C]/65 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setSelectedApplication(null)}
        >
          <motion.section
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-detail-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[#0B0B0C]/10 bg-[#F3F2EE] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#0B0B0C]/10 bg-[#E9E8E1] px-5 py-4 sm:px-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#77786F]">
                  Application record
                </p>
                <h2
                  id="application-detail-title"
                  className="mt-1 text-xl font-black"
                >
                  Applicant details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                aria-label="Close application details"
                className="flex h-10 w-10 items-center justify-center border border-[#0B0B0C]/15 transition hover:bg-[#B6FF2E]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-[#77786F]">Application status</p>
                  <span
                    className={`mt-2 inline-flex px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] ${getStatusStyle(selectedApplication.status)}`}
                  >
                    {selectedApplication.status}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-xs text-[#77786F]">Submitted</p>
                  <p className="mt-1 text-sm font-bold">
                    {formatDate(selectedApplication.appliedAt)}
                  </p>
                </div>
              </div>

              <div className="border border-[#0B0B0C]/10 bg-white p-5">
                <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-[#77786F]">
                  <Users size={15} />
                  Student information
                </div>

                <h3 className="text-xl font-black">
                  {selectedApplication.studentName || "Unknown student"}
                </h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="flex min-w-0 items-start gap-2 text-sm">
                    <Mail size={15} className="mt-0.5 shrink-0 text-[#77786F]" />
                    <span className="break-all">
                      {selectedApplication.studentEmail || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Phone size={15} className="mt-0.5 shrink-0 text-[#77786F]" />
                    <span>
                      {selectedApplication.studentPhone || "Not provided"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-[#0B0B0C]/10 bg-white p-5">
                <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-[#77786F]">
                  <BookOpen size={15} />
                  Tuition information
                </div>

                <h3 className="text-lg font-black">
                  {selectedApplication.tuitionTitle || "Untitled tuition"}
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-[#77786F]">Subject</p>
                    <p className="mt-1 text-sm font-semibold">
                      {selectedApplication.subject || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#77786F]">Monthly fee</p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatFee(selectedApplication.monthlyFee)}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-[#77786F]">Tutor email</p>
                    <p className="mt-1 break-all text-sm font-semibold">
                      {selectedApplication.tutorEmail || "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-[#0B0B0C]/10 bg-white p-5">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-[#77786F]">
                  <CalendarDays size={15} />
                  Preferred schedule
                </div>
                <p className="whitespace-pre-wrap text-sm leading-7">
                  {selectedApplication.preferredSchedule || "No schedule provided."}
                </p>
              </div>

              <div className="border border-[#0B0B0C]/10 bg-white p-5">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-[#77786F]">
                  <ClipboardList size={15} />
                  Student note
                </div>
                <p className="whitespace-pre-wrap text-sm leading-7 text-[#55564F]">
                  {selectedApplication.studentNote || "The student did not add a note."}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#0B0B0C]/10 pt-4">
                <p className="break-all text-[10px] text-[#77786F]">
                  Application ID: {selectedApplication._id}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  className="border border-[#0B0B0C] bg-[#B6FF2E] px-5 py-2.5 text-xs font-black transition hover:bg-[#0B0B0C] hover:text-white"
                >
                  Close details
                </button>
              </div>
            </div>
          </motion.section>
        </div>
      )}
    </main>
  );
}
