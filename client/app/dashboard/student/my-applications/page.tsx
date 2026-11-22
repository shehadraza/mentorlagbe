
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ApplicationStatus = "pending" | "accepted" | "rejected";

type Application = {
  _id?: string;
  id?: string;
  tuitionId: string;
  tuitionTitle: string;
  subject: string;
  monthlyFee: number;
  tutorName?: string;
  tutorEmail: string;
  status: ApplicationStatus;
  appliedAt: string;
};

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

function formatMoney(value: number) {
  return `৳${Number(value || 0).toLocaleString("en-BD")}`;
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const styles = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const labels = {
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Rejected",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${styles[status]}`}
    >
      {status === "pending" && <Clock3 size={12} />}
      {status === "accepted" && <CheckCircle2 size={12} />}
      {status === "rejected" && <XCircle size={12} />}
      {labels[status]}
    </span>
  );
}

export default function MyApplicationsPage() {
  const reduceMotion = useReducedMotion();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const { data: tokenData, error: tokenError } = await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error("Please sign in again to view your applications.");
      }

      const response = await fetch(`${API_URL}/api/applications/mine`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load applications.");
      }

      setApplications(
        Array.isArray(result.applications) ? result.applications : []
      );
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
    if (!sessionPending) {
      void loadApplications();
    }
  }, [sessionPending, loadApplications]);

  const cancelApplication = async (application: Application) => {
    const applicationId = application._id || application.id;

    if (!applicationId || application.status !== "pending") return;

    const confirmed = window.confirm(
      `Are you sure you want to cancel your application for "${application.tuitionTitle}"?`
    );

    if (!confirmed) return;

    try {
      setCancellingId(applicationId);
      setError("");
      setNotice("");

      const { data: tokenData, error: tokenError } = await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const response = await fetch(
        `${API_URL}/api/applications/${applicationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${tokenData.token}`,
          },
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not cancel this application.");
      }

      setApplications((current) =>
        current.filter(
          (item) => (item._id || item.id) !== applicationId
        )
      );

      setNotice("Your pending application has been cancelled successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while cancelling the application."
      );
    } finally {
      setCancellingId("");
    }
  };

  const pendingCount = applications.filter(
    (item) => item.status === "pending"
  ).length;

  const acceptedCount = applications.filter(
    (item) => item.status === "accepted"
  ).length;

  const rejectedCount = applications.filter(
    (item) => item.status === "rejected"
  ).length;

  if (sessionPending || loading) {
    return (
      <div className="min-h-screen bg-[#f3f2ee] px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-[1400px] animate-pulse space-y-6">
          <div className="h-10 w-64 rounded-xl bg-[#e4e3dc]" />
          <div className="h-48 rounded-[30px] bg-[#e4e3dc]" />
          <div className="h-72 rounded-[30px] bg-white" />
        </div>
      </div>
    );
  }

  const user = session?.user as
    | { role?: string }
    | undefined;

  if (!user || user.role !== "student") {
    return (
      <div className="flex min-h-[65vh] items-center justify-center bg-[#f3f2ee] px-5">
        <div className="max-w-md rounded-[28px] border border-[#e7e6de] bg-white p-9 text-center shadow-sm">
          <GraduationCap className="mx-auto text-[#718e25]" size={35} />
          <h2 className="mt-5 text-2xl font-semibold text-[#0b0b0c]">
            Student access only
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#77776f]">
            My Applications is available for student accounts.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#b6ff2e] px-5 py-3 text-sm font-semibold text-[#0b0b0c]"
          >
            Back to dashboard <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ee] px-4 pb-12 pt-5 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-[1400px] space-y-7">
        <div>
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#77776f] transition hover:text-[#0b0b0c]"
          >
            <ArrowLeft size={14} />
            Back to student dashboard
          </Link>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mt-5 overflow-hidden rounded-[30px] bg-[#0b0b0c] px-7 py-9 text-white sm:px-10 sm:py-11"
          >
            <div className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-2 -top-14 h-56 w-56 rounded-full border border-[#b6ff2e]/20" />
            <div className="pointer-events-none absolute -bottom-20 right-[20%] h-52 w-52 rounded-full bg-[#b6ff2e]/10 blur-3xl" />

            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-[10px] font-semibold tracking-[1.8px] text-[#d5e7a9]">
                <BookOpen size={13} />
                YOUR LEARNING ACTIVITY
              </span>

              <h1 className="mt-5 text-3xl font-semibold tracking-[-1.5px] sm:text-5xl">
                My Applications<span className="text-[#b6ff2e]">.</span>
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-7 text-white/60">
                Keep track of your tuition requests, check tutor responses,
                and manage applications that are still pending.
              </p>
            </div>

            <div className="absolute bottom-0 right-0 h-1.5 w-1/3 bg-[#b6ff2e]" />
          </motion.div>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total applications",
              value: applications.length,
              icon: BookOpen,
            },
            {
              label: "Pending",
              value: pendingCount,
              icon: Clock3,
            },
            {
              label: "Accepted",
              value: acceptedCount,
              icon: CheckCircle2,
            },
            {
              label: "Rejected",
              value: rejectedCount,
              icon: XCircle,
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.label}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="rounded-[22px] border border-[#e7e6de] bg-white p-5 shadow-[0_8px_25px_rgba(11,11,12,0.025)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#85847b]">
                    {item.label}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff2e6] text-[#536b25]">
                    <Icon size={17} />
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-[#0b0b0c]">
                  {item.value}
                </p>
              </motion.div>
            );
          })}
        </section>

        {notice && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 shrink-0" size={17} />
            {notice}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            <XCircle className="mt-0.5 shrink-0" size={17} />
            <span>{error}</span>
          </div>
        )}

        <section className="overflow-hidden rounded-[28px] border border-[#e7e6de] bg-white shadow-[0_10px_35px_rgba(11,11,12,0.035)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#efeee8] px-6 py-6 sm:px-8">
            <div>
              <p className="text-[10px] font-bold tracking-[1.8px] text-[#85847b]">
                APPLICATION HISTORY
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#0b0b0c] sm:text-2xl">
                All your tuition requests
              </h2>
              <p className="mt-1 text-xs text-[#85847b]">
                {applications.length} application
                {applications.length === 1 ? "" : "s"} found
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadApplications()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-[#e8e7df] px-4 py-2.5 text-xs font-semibold text-[#414139] transition hover:border-[#b6ff2e] hover:bg-[#f8fbea] disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {applications.length === 0 && !error ? (
            <div className="px-6 py-16 text-center sm:px-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#eff2e6] text-[#536b25]">
                <Search size={28} />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[#0b0b0c]">
                No applications yet
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#85847b]">
                Once you apply to a tuition, it will appear here. Explore
                available tutors and find the right match for your goals.
              </p>
              <Link
                href="/tuitions"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#b6ff2e] px-6 py-3.5 text-sm font-semibold text-[#0b0b0c] transition hover:bg-[#a5ef1d]"
              >
                Browse tuitions <ArrowUpRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#efeee8]">
              {applications.map((application, index) => {
                const applicationId =
                  application._id || application.id || "";

                return (
                  <motion.article
                    key={
                      applicationId ||
                      `${application.tuitionId}-${index}`
                    }
                    initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                    className="flex flex-col gap-5 px-6 py-6 transition-colors hover:bg-[#fbfbf8] sm:px-8 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eff2e6] text-[#536b25]">
                        <GraduationCap size={23} strokeWidth={1.6} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-[#0b0b0c] sm:text-lg">
                          {application.tuitionTitle}
                        </h3>

                        <p className="mt-1 text-sm text-[#85847b]">
                          {application.subject}
                        </p>

                        <div className="mt-3 flex flex-col gap-2 text-xs text-[#77776f] sm:flex-row sm:flex-wrap sm:gap-x-5">
                          <span>
                            Tutor:{" "}
                            <strong className="font-semibold text-[#414139]">
                              {application.tutorName || "Tutor"}
                            </strong>
                          </span>

                          <span className="break-all">
                            {application.tutorEmail}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={13} />
                            Applied {formatDate(application.appliedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#efeee8] pt-4 sm:justify-start lg:border-0 lg:pt-0">
                      <div className="min-w-[100px]">
                        <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#99988e]">
                          Monthly fee
                        </p>
                        <p className="mt-1 text-base font-semibold text-[#0b0b0c]">
                          {formatMoney(application.monthlyFee)}
                        </p>
                      </div>

                      <StatusBadge status={application.status} />

                      <Link
                        href={`/tuitions/${application.tuitionId}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e7df] px-3.5 py-2.5 text-xs font-semibold text-[#414139] transition hover:border-[#b6ff2e] hover:bg-[#f7fbea]"
                      >
                        Details <ArrowUpRight size={13} />
                      </Link>

                      {application.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => void cancelApplication(application)}
                          disabled={
                            !applicationId || cancellingId === applicationId
                          }
                          className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 px-3.5 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {cancellingId === applicationId ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                          {cancellingId === applicationId
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#efeee8] bg-[#fafaf7] px-6 py-4 sm:px-8">
            <Link
              href="/dashboard/student"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#55564e] transition hover:text-[#0b0b0c]"
            >
              <ArrowLeft size={13} />
              Dashboard
            </Link>

            <Link
              href="/tuitions"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#55564e] transition hover:text-[#718e25]"
            >
              Find another tuition <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
