
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  GraduationCap,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Application = {
  _id?: string;
  id?: string;
  tuitionId: string;
  tuitionTitle: string;
  subject: string;
  monthlyFee: number;
  tutorName?: string;
  tutorEmail: string;
  status: "pending" | "accepted" | "rejected";
  appliedAt: string;
};

type DashboardUser = {
  name: string;
  email: string;
  role?: "student" | "tutor" | "admin";
  plan?: string;
};

type ApplicationsResponse = {
  success: boolean;
  applications?: Application[];
  message?: string;
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

function getFirstName(name?: string) {
  return name?.trim().split(/\s+/)[0] || "Student";
}

function StatusBadge({ status }: { status: Application["status"] }) {
  const styles = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const icons = {
    pending: Clock3,
    accepted: CheckCircle2,
    rejected: XCircle,
  };

  const Icon = icons[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${styles[status]}`}
    >
      <Icon size={13} />
      {status}
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-7">
      <div className="h-[270px] animate-pulse rounded-[32px] bg-[#e7e6df]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-3xl bg-[#e7e6df]"
          />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-[30px] bg-[#e7e6df]" />
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  accent,
  delay,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  accent: string;
  delay: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={reduceMotion ? undefined : { y: -5 }}
      className="group relative overflow-hidden rounded-[25px] border border-[#e8e7df] bg-white p-6 shadow-[0_8px_30px_rgba(11,11,12,0.035)] transition-shadow hover:shadow-[0_18px_40px_rgba(11,11,12,0.08)]"
    >
      <div
        className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-60 blur-2xl transition-transform duration-500 group-hover:scale-150"
        style={{ background: accent }}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#77776f]">{label}</p>
          <p className="mt-4 text-[34px] font-semibold tracking-[-1.8px] text-[#0b0b0c]">
            {value}
          </p>
          <p className="mt-1.5 text-xs text-[#929189]">{description}</p>
        </div>

        <div className="rounded-2xl border border-[#ecebe5] bg-[#f8f8f4] p-3 text-[#25251f]">
          <Icon size={21} strokeWidth={1.7} />
        </div>
      </div>
    </motion.div>
  );
}

export default function StudentDashboardPage() {
  const { data: session, isPending: sessionPending } =
    authClient.useSession();

  const user = session?.user as DashboardUser | undefined;
  const reduceMotion = useReducedMotion();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = useCallback(async () => {
  if (!user || user.role !== "student") {
    setLoading(false);
    return;
  }

  setLoading(true);
  setError("");

  try {
    const { data: tokenData, error: tokenError } =
      await authClient.token();

    if (tokenError || !tokenData?.token) {
      throw new Error(
        tokenError?.message || "Authentication token is unavailable."
      );
    }

    const response = await fetch(`${API_URL}/api/applications/mine`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenData.token}`,
      },
      credentials: "include",
      cache: "no-store",
    });

    const data = (await response.json()) as ApplicationsResponse;

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Unable to load your applications."
      );
    }

    setApplications(data.applications || []);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong. Please try again."
    );
  } finally {
    setLoading(false);
  }
}, [user]);

  useEffect(() => {
    if (!sessionPending) {
      void loadApplications();
    }
  }, [sessionPending, loadApplications]);

  const stats = useMemo(() => {
    const accepted = applications.filter(
      (item) => item.status === "accepted"
    ).length;

    const pending = applications.filter(
      (item) => item.status === "pending"
    ).length;

    return {
      total: applications.length,
      accepted,
      pending,
    };
  }, [applications]);

  const planLabel = user?.plan?.toUpperCase() || "UNKNOWN";

  if (sessionPending || loading) {
    return (
      <div className="min-h-screen bg-[#f3f2ee] px-4 py-8 sm:px-7 lg:px-10">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f3f2ee] px-5">
        <div className="max-w-md rounded-[30px] border border-[#e6e5dc] bg-white p-9 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#b6ff2e]">
            <GraduationCap size={30} />
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-[#0b0b0c]">
            Sign in to continue
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#77776f]">
            Please sign in to access your student dashboard and application
            history.
          </p>
          <Link
            href="/sign-in"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#0b0b0c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#30302b]"
          >
            Sign In <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "student") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f3f2ee] px-5">
        <div className="max-w-md rounded-[30px] border border-[#e6e5dc] bg-white p-9 text-center">
          <GraduationCap size={34} className="mx-auto text-[#77776f]" />
          <h2 className="mt-5 text-2xl font-semibold text-[#0b0b0c]">
            Student dashboard
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#77776f]">
            This dashboard is available for student accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ee] px-4 pb-12 pt-5 sm:px-7 lg:px-10">
      <div className="mx-auto w-full max-w-[1400px] space-y-8">

        {/* Welcome section */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="relative isolate min-h-[290px] overflow-hidden rounded-[32px] bg-[#e7eadc] px-7 py-9 sm:px-10 sm:py-11 lg:px-14"
        >
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_35%,rgba(182,255,46,0.45),transparent_30%),linear-gradient(115deg,#e9e9df_0%,#e5e9d9_55%,#dce6c9_100%)]" />

          <div className="absolute -right-16 -top-28 -z-10 h-[350px] w-[350px] rounded-full border border-[#0b0b0c]/10" />
          <div className="absolute -right-5 -top-16 -z-10 h-[250px] w-[250px] rounded-full border border-[#0b0b0c]/10" />

          <motion.div
            aria-hidden="true"
            animate={
              reduceMotion
                ? undefined
                : { y: [0, -13, 0], rotate: [0, 5, 0] }
            }
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute right-[9%] top-[17%] hidden h-40 w-40 items-center justify-center rounded-[35px] border border-white/70 bg-white/35 shadow-[20px_25px_60px_rgba(11,11,12,0.12)] backdrop-blur-md lg:flex"
            style={{ transform: "perspective(700px) rotateY(-18deg) rotateX(12deg)" }}
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-[#b6ff2e] shadow-[0_15px_30px_rgba(90,130,20,0.2)]">
              <GraduationCap size={48} strokeWidth={1.5} />
            </div>
          </motion.div>

          <motion.div
            aria-hidden="true"
            animate={reduceMotion ? undefined : { y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[28%] top-[22%] hidden h-14 w-14 items-center justify-center rounded-2xl border border-white/70 bg-white/60 shadow-lg backdrop-blur-md lg:flex"
          >
            <BookOpen size={23} />
          </motion.div>

          <div className="relative z-10 max-w-[650px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0b0b0c]/10 bg-white/55 px-3.5 py-2 text-xs font-semibold text-[#424239] backdrop-blur-sm">
              <Sparkles size={14} />
              YOUR LEARNING SPACE
            </div>

            <p className="text-sm font-medium text-[#62645a]">
              Welcome back,
            </p>

            <h1 className="mt-2 text-[38px] font-semibold leading-[1.08] tracking-[-2px] text-[#0b0b0c] sm:text-[48px] lg:text-[56px]">
              Hello, {getFirstName(user.name)}
              <span className="text-[#6b8b24]">.</span>
            </h1>

            <p className="mt-4 max-w-[470px] text-sm leading-7 text-[#64665c] sm:text-base">
              Your next opportunity starts here. Keep track of your
              applications and find the right mentor for your goals.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/tuitions"
                className="group inline-flex items-center gap-2 rounded-full bg-[#B6FF2E] px-6 py-3.5 text-sm font-semibold text-[#0B0B0C] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#A5EF1D] hover:shadow-md"
              >
                Explore tuitions
                <ArrowUpRight
                  size={17}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>

              <span className="inline-flex items-center gap-2 rounded-full border border-[#0b0b0c]/10 bg-white/45 px-4 py-3 text-xs font-medium text-[#55564e]">
                <span className="h-2 w-2 rounded-full bg-[#7caa28]" />
                Student account
              </span>
            </div>
          </div>

          <div className="absolute bottom-0 right-0 h-2 w-1/3 bg-[#b6ff2e]" />
        </motion.section>

        {/* Statistics */}
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[2px] text-[#8b8a80]">
                Your overview
              </p>
              <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.8px] text-[#0b0b0c]">
                Learning at a glance
              </h2>
            </div>
            <p className="text-xs text-[#85847b]">
              Your application activity
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total applied"
              value={stats.total}
              description="All your applications"
              icon={BookOpen}
              accent="rgba(182,255,46,0.55)"
              delay={0.05}
            />
            <StatCard
              label="Accepted"
              value={stats.accepted}
              description="Applications accepted"
              icon={CheckCircle2}
              accent="rgba(52,211,153,0.25)"
              delay={0.1}
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              description="Waiting for a response"
              icon={Clock3}
              accent="rgba(251,191,36,0.25)"
              delay={0.15}
            />
            <StatCard
              label="Your plan"
              value={planLabel}
              description="Current membership"
              icon={GraduationCap}
              accent="rgba(147,197,253,0.35)"
              delay={0.2}
            />
          </div>
        </section>

        {/* Applications */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="overflow-hidden rounded-[30px] border border-[#e7e6de] bg-white shadow-[0_10px_35px_rgba(11,11,12,0.035)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#efeee8] px-6 py-6 sm:px-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.7px] text-[#89887f]">
                <CalendarDays size={14} />
                APPLICATION TRACKER
              </div>
              <h2 className="mt-2 text-[23px] font-semibold tracking-[-0.8px] text-[#0b0b0c]">
                Recent applications
              </h2>
              <p className="mt-1 text-sm text-[#89887f]">
                Follow the progress of your tuition requests.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadApplications()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-[#e8e7df] px-4 py-2.5 text-xs font-semibold text-[#414139] transition hover:border-[#b6ff2e] hover:bg-[#f8fbea] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {error ? (
            <div className="px-6 py-14 text-center sm:px-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <XCircle size={25} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#0b0b0c]">
                Could not load applications
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#85847b]">
                {error}
              </p>
              <button
                type="button"
                onClick={() => void loadApplications()}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0b0b0c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#292923]"
              >
                <RefreshCw size={15} />
                Try again
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="px-6 py-16 text-center sm:px-8">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#f0f2e9]">
                <Compass size={35} strokeWidth={1.5} />
                <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#b6ff2e]">
                  <Sparkles size={14} />
                </span>
              </div>

              <h3 className="mt-6 text-xl font-semibold tracking-tight text-[#0b0b0c]">
                Your journey starts here
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#85847b]">
                You have not applied to any tuition yet. Explore available
                opportunities and find a tutor who matches your learning
                goals.
              </p>

              <Link
                href="/tuitions"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#b6ff2e] px-6 py-3.5 text-sm font-semibold text-[#0b0b0c] transition hover:bg-[#a5ec25]"
              >
                Browse tuitions <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#efeee8]">
              {applications.map((application, index) => (
                <motion.article
                  key={
                    application._id ||
                    application.id ||
                    `${application.tuitionId}-${index}`
                  }
                  initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className="group flex flex-col gap-5 px-6 py-6 transition-colors hover:bg-[#fbfbf8] sm:px-8 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eff2e6] text-[#39451f] transition-transform group-hover:rotate-[-5deg]">
                      <GraduationCap size={23} strokeWidth={1.6} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-[#0b0b0c] sm:text-lg">
                        {application.tuitionTitle}
                      </h3>

                      <p className="mt-1 text-sm text-[#85847b]">
                        {application.subject}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#77776f]">
                        <span>
                          Tutor:{" "}
                          <span className="font-semibold text-[#414139]">
                            {application.tutorName || application.tutorEmail}
                          </span>
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={13} />
                          {formatDate(application.appliedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#efeee8] pt-4 sm:justify-start lg:border-0 lg:pt-0">
                    <div className="min-w-[105px]">
                      <p className="text-[10px] font-semibold uppercase tracking-[1.2px] text-[#99988e]">
                        Monthly fee
                      </p>
                      <p className="mt-1 text-base font-semibold text-[#0b0b0c]">
                        {formatMoney(application.monthlyFee)}
                      </p>
                    </div>

                    <StatusBadge status={application.status} />

                    <Link
                      href={`/tuitions/${application.tuitionId}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e7df] px-4 py-2.5 text-xs font-semibold text-[#414139] transition hover:border-[#b6ff2e] hover:bg-[#f7fbea]"
                    >
                      Details <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {applications.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#efeee8] bg-[#fafaf7] px-6 py-4 sm:px-8">
              <p className="text-xs text-[#85847b]">
                Showing {applications.length} application
                {applications.length === 1 ? "" : "s"}
              </p>
              <Link
                href="/tuitions"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#34352d] transition hover:text-[#718e25]"
              >
                Find another tuition <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </motion.section>

        {/* Bottom discovery card */}
        <section className="relative overflow-hidden rounded-[28px] border border-[#e4e5d8] bg-[#e9eddf] px-6 py-7 sm:px-9 sm:py-8">
          <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full bg-[#b6ff2e]/35 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[1.7px] text-[#7d806e]">
                KEEP MOVING FORWARD
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-1px] text-[#0b0b0c]">
                The right tutor can change everything.
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#727467]">
                Discover more learning opportunities and take the next step
                towards your goals.
              </p>
            </div>

            <Link
              href="/tuitions"
              className="group inline-flex items-center gap-2 rounded-full bg-[#B6FF2E] px-6 py-3.5 text-sm font-semibold text-[#0B0B0C] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#A5EF1D] hover:shadow-md"
            >
              Explore more
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
