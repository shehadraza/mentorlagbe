
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type AdminUser = {
  role?: string;
};

type OverviewStats = {
  totalUsers: number;
  totalTutors: number;
  pendingTuitions: number;
  approvedTuitions: number;
  totalRevenue: number;
};

type StatisticsResponse = {
  success?: boolean;
  message?: string;
  statistics?: OverviewStats & {
    currency?: string;
  };
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const initialStats: OverviewStats = {
  totalUsers: 0,
  totalTutors: 0,
  pendingTuitions: 0,
  approvedTuitions: 0,
  totalRevenue: 0,
};

const quickLinks = [
  {
    title: "Manage users",
    description: "Review student, tutor and admin accounts.",
    href: "/dashboard/admin/users",
    icon: Users,
    number: "01",
  },
  {
    title: "Review tuitions",
    description: "Check tuition posts awaiting approval.",
    href: "/dashboard/admin/tuitions",
    icon: BookOpen,
    number: "02",
  },
  {
    title: "Applications",
    description: "Monitor applications across the platform.",
    href: "/dashboard/admin/applications",
    icon: GraduationCap,
    number: "03",
  },
  {
    title: "Transactions",
    description: "Review platform payment records.",
    href: "/dashboard/admin/transactions",
    icon: Wallet,
    number: "04",
  },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatRevenue(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AdminOverviewPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const session = authClient.useSession();

  const currentUser = session.data?.user as AdminUser | undefined;
  const isAdmin = currentUser?.role === "admin";

  const [stats, setStats] = useState<OverviewStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async () => {
    setError("");
    setRefreshing(true);

    try {
      const { data: tokenData, error: tokenError } =
        await authClient.token();

      if (tokenError) {
        throw new Error(
          "Your session could not be verified. Please sign in again.",
        );
      }

      const token = (
        tokenData as { token?: string } | null
      )?.token;

      if (!token) {
        throw new Error(
          "Authentication token is unavailable. Please sign in again.",
        );
      }

      const response = await fetch(
        `${API_URL}/api/admin/statistics`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Admin access could not be verified. Please sign in again or contact the administrator.",
          );
        }

        throw new Error(
          `Unable to load dashboard statistics (HTTP ${response.status}).`,
        );
      }

      const data = (await response.json()) as StatisticsResponse;

      if (!data.success || !data.statistics) {
        throw new Error(
          data.message || "Dashboard statistics could not be loaded.",
        );
      }

      setStats({
        totalUsers: data.statistics.totalUsers,
        totalTutors: data.statistics.totalTutors,
        pendingTuitions: data.statistics.pendingTuitions,
        approvedTuitions: data.statistics.approvedTuitions,
        totalRevenue: data.statistics.totalRevenue,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading the dashboard.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (session.isPending) return;

    if (!session.data) {
      router.replace("/sign-in?callbackURL=/dashboard/admin");
      return;
    }

    if (currentUser?.role !== "admin") {
      router.replace(
        currentUser?.role === "tutor"
          ? "/dashboard/tutor"
          : currentUser?.role === "student"
            ? "/dashboard/student"
            : "/",
      );
      return;
    }

    void loadOverview();
  }, [
    session.isPending,
    session.data,
    currentUser?.role,
    router,
    loadOverview,
  ]);

  const metricCards = [
    {
      label: "Total users",
      value: formatNumber(stats.totalUsers),
      description: "All registered platform accounts",
      icon: Users,
      index: "01",
    },
    {
      label: "Total tutors",
      value: formatNumber(stats.totalTutors),
      description: "Registered tutor accounts",
      icon: GraduationCap,
      index: "02",
    },
    {
      label: "Tuition approvals",
      value: `${formatNumber(stats.pendingTuitions)} / ${formatNumber(stats.approvedTuitions)}`,
      description: "Pending / approved tuition posts",
      icon: Clock3,
      index: "03",
    },
    {
      label: "Total Stripe revenue",
      value: formatRevenue(stats.totalRevenue),
      description: "Successfully paid transactions · USD",
      icon: CircleDollarSign,
      index: "04",
    },
  ];

  if (session.isPending || !session.data || !isAdmin) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-[#66665F]">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Verifying administrator access...
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F3F2EE] px-4 py-6 text-[#0B0B0C] sm:px-6 sm:py-8 lg:px-9">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-32 h-[420px] w-[420px] rounded-full bg-[#B6FF2E]/20 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 -left-28 h-[380px] w-[380px] rounded-full bg-[#B6FF2E]/10 blur-[100px]"
      />

      <div className="relative mx-auto max-w-[1500px]">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden border border-[#0B0B0C]/10 bg-[#0B0B0C] px-6 py-8 text-[#F3F2EE] sm:px-9 sm:py-10 lg:px-12 lg:py-12"
        >
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="mb-6 flex items-center gap-2">
                <span className="h-2 w-2 bg-[#B6FF2E]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#B6FF2E]">
                  MentorLagbe / Administration
                </span>
              </div>

              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/45">
                Control centre
              </p>

              <h1 className="max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                Keep the
                <br />
                platform <span className="text-[#B6FF2E]">moving.</span>
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-white/60 sm:text-base">
                A clear view of your platform activity, user community and
                the work that needs your attention.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard/admin/tuitions"
                  className="inline-flex min-h-11 items-center gap-3 bg-[#B6FF2E] px-5 text-xs font-bold uppercase tracking-[0.12em] text-[#0B0B0C] transition-colors hover:bg-white"
                >
                  Review tuitions
                  <ArrowUpRight size={15} />
                </Link>

                <span className="inline-flex items-center gap-2 border border-white/15 px-4 py-3 text-[11px] font-medium text-white/65">
                  <ShieldCheck size={14} className="text-[#B6FF2E]" />
                  Administrator access
                </span>
              </div>
            </div>

            <div className="relative mx-auto flex h-[220px] w-full max-w-[360px] items-center justify-center sm:h-[260px]">
              <div className="absolute h-48 w-48 rotate-45 border border-[#B6FF2E]/25 sm:h-56 sm:w-56" />
              <div className="absolute h-36 w-36 rotate-12 border border-white/15 sm:h-44 sm:w-44" />

              <motion.div
                animate={
                  reduceMotion
                    ? undefined
                    : { rotate: [0, 8, 0], y: [0, -8, 0] }
                }
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative flex h-32 w-32 rotate-[-8deg] items-center justify-center border border-[#B6FF2E]/50 bg-[#B6FF2E] shadow-[18px_18px_0_rgba(182,255,46,0.12)] sm:h-40 sm:w-40"
              >
                <div className="absolute inset-3 border border-[#0B0B0C]/20" />
                <Activity
                  className="h-14 w-14 text-[#0B0B0C] sm:h-16 sm:w-16"
                  strokeWidth={1.4}
                />
              </motion.div>

              <div className="absolute right-1 top-4 flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-2 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 bg-[#B6FF2E]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/70">
                  Admin online
                </span>
              </div>

              <div className="absolute bottom-3 left-0 border border-white/15 bg-white/5 px-3 py-2 backdrop-blur-sm">
                <span className="block text-[9px] uppercase tracking-[0.16em] text-white/40">
                  Platform status
                </span>
                <span className="mt-1 flex items-center gap-2 text-xs font-semibold text-white">
                  <CheckCircle2 size={13} className="text-[#B6FF2E]" />
                  Dashboard active
                </span>
              </div>

              <span className="absolute bottom-5 right-4 text-[10px] font-bold tracking-[0.2em] text-[#B6FF2E]/60">
                ML / 01
              </span>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="absolute -right-10 -top-10 h-40 w-40 border border-white/[0.06]"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-20 right-[30%] h-52 w-52 rounded-full border border-white/[0.06]"
          />
        </motion.header>

        <section className="mt-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#77776F]">
                Platform overview / 01
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.045em] sm:text-3xl">
                The numbers.
              </h2>
            </div>

            <button
              type="button"
              onClick={() => void loadOverview()}
              disabled={refreshing}
              className="inline-flex min-h-10 items-center gap-2 border border-[#0B0B0C]/20 bg-transparent px-4 text-xs font-bold uppercase tracking-[0.1em] transition-colors hover:border-[#0B0B0C] hover:bg-[#0B0B0C] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing" : "Refresh data"}
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex flex-col gap-3 border border-red-900/20 bg-red-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm leading-6 text-red-800">{error}</p>
              <button
                type="button"
                onClick={() => void loadOverview()}
                className="shrink-0 text-left text-xs font-bold uppercase tracking-[0.12em] text-red-900 underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((metric, index) => {
              const Icon = metric.icon;

              return (
                <motion.article
                  key={metric.label}
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: reduceMotion ? 0 : index * 0.08,
                  }}
                  className="group relative min-h-[190px] overflow-hidden border border-[#0B0B0C]/10 bg-white/65 p-5 transition-colors hover:border-[#0B0B0C]/40 hover:bg-white sm:p-6"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#92928A]">
                      {metric.index} / 04
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center border border-[#0B0B0C]/10 bg-[#F3F2EE] transition-colors group-hover:border-[#B6FF2E] group-hover:bg-[#B6FF2E]">
                      <Icon size={17} strokeWidth={1.7} />
                    </div>
                  </div>

                  <div className="mt-7">
                    <p className="text-xs font-medium text-[#77776F]">
                      {metric.label}
                    </p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-black tracking-[-0.06em] sm:text-4xl">
                        {loading ? "—" : metric.value}
                      </span>
                      {!loading && (
                        <ArrowDownRight
                          size={16}
                          className="text-[#92928A] transition-transform group-hover:translate-x-1 group-hover:translate-y-1"
                        />
                      )}
                    </div>
                    <p className="mt-2 text-[11px] text-[#92928A]">
                      {metric.description}
                    </p>
                  </div>

                  <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#B6FF2E] transition-all duration-300 group-hover:w-full" />
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#77776F]">
              Administration / 02
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.045em] sm:text-3xl">
              Get things done.
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {quickLinks.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.href}
                  initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: reduceMotion ? 0 : index * 0.07,
                  }}
                >
                  <Link
                    href={item.href}
                    className="group flex min-h-[116px] items-center gap-4 border border-[#0B0B0C]/10 bg-white/50 p-5 transition-all hover:-translate-y-1 hover:border-[#0B0B0C] hover:bg-white sm:gap-5 sm:p-6"
                  >
                    <span className="hidden text-xs font-bold tracking-[0.15em] text-[#A2A29A] sm:block">
                      {item.number}
                    </span>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#0B0B0C]/10 bg-[#F3F2EE] transition-colors group-hover:border-[#B6FF2E] group-hover:bg-[#B6FF2E]">
                      <Icon size={21} strokeWidth={1.6} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold tracking-tight">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[#77776F]">
                        {item.description}
                      </p>
                    </div>

                    <ArrowRight
                      size={18}
                      className="shrink-0 text-[#92928A] transition-all group-hover:translate-x-1 group-hover:text-[#0B0B0C]"
                    />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-[#0B0B0C]/10 py-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#92928A]">
            MentorLagbe / Admin workspace
          </span>
          <span className="text-[10px] text-[#92928A]">
            Learn. Grow. Lead.
          </span>
        </footer>
      </div>
    </main>
  );
}
