
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  Plus,
  RefreshCw,
  Sparkles,
  Users,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type DashboardUser = {
  name: string;
  email: string;
  role?: "student" | "tutor" | "admin";
  plan?: string;
};

type Tuition = {
  _id?: string;
  id?: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: "online" | "offline";
  location: string;
  monthlyFee: number;
  daysPerWeek: number;
  approvalStatus: "pending" | "approved" | "rejected";
  isActive: boolean;
  createdAt: string;
};

type Application = {
  _id?: string;
  id?: string;
  tuitionId: string;
  tuitionTitle: string;
  subject: string;
  monthlyFee: number;
  status: "pending" | "accepted" | "rejected";
  appliedAt: string;
  studentName?: string;
  studentEmail?: string;
  applicantName?: string;
  applicantEmail?: string;
  tutorName?: string;
};

type StatCardProps = {
  label: string;
  value: number;
  description: string;
  icon: React.ElementType;
  delay: number;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value?: string) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getFirstName(name?: string) {
  return name?.trim().split(/\s+/)[0] || "Tutor";
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "ST"
  );
}

function StatusBadge({
  status,
}: {
  status: "pending" | "accepted" | "rejected";
}) {
  const config = {
    pending: {
      icon: Clock3,
      label: "Pending",
      style: "border-[#E8D69C] bg-[#FFF8DF] text-[#80651C]",
    },
    accepted: {
      icon: CheckCircle2,
      label: "Accepted",
      style: "border-[#C8DFB5] bg-[#EFF7E8] text-[#456B31]",
    },
    rejected: {
      icon: XCircle,
      label: "Rejected",
      style: "border-[#E7C7C3] bg-[#FBEFED] text-[#98544B]",
    },
  };

  const item = config[status];
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold ${item.style}`}
    >
      <Icon size={12} />
      {item.label}
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-7">
      <div className="h-[280px] animate-pulse rounded-[28px] bg-[#E2E0D8]" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-[24px] bg-[#E2E0D8]"
          />
        ))}
      </div>

      <div className="h-80 animate-pulse rounded-[26px] bg-[#E2E0D8]" />
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  delay,
}: StatCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      className="group relative overflow-hidden rounded-[24px] border border-[#E2E0D8] bg-white p-5 shadow-[0_8px_30px_rgba(11,11,12,0.035)] transition-shadow hover:shadow-[0_18px_42px_rgba(11,11,12,0.09)] sm:p-6"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#B6FF2E]/20 opacity-70 blur-3xl transition-transform duration-700 group-hover:scale-150" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[12px] font-semibold text-[#77766F]">
            {label}
          </p>

          <p className="mt-4 text-[34px] font-bold tracking-[-1.8px] text-[#0B0B0C]">
            {value}
          </p>

          <p className="mt-1.5 text-[11px] text-[#88877F]">
            {description}
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E0D8] bg-[#F3F2EE] p-3 text-[#0B0B0C] transition-all duration-500 group-hover:rotate-6 group-hover:border-[#B6FF2E] group-hover:bg-[#B6FF2E]">
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
      <div className="rounded-2xl border border-[#E2E0D8] bg-[#F3F2EE] p-5 text-[#0B0B0C]">
        <Icon size={27} strokeWidth={1.6} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-[#0B0B0C]">
        {title}
      </h3>

      <p className="mt-2 max-w-xs text-xs leading-6 text-[#77766F]">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------
   3D HERO VISUAL
   CSS perspective illustration — no extra dependency
------------------------------------------------------- */

function TutorHeroVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto flex h-[270px] w-full max-w-[490px] items-center justify-center sm:h-[320px] lg:h-[350px]">
      {/* Ambient glow */}
      <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B6FF2E]/25 blur-[65px] sm:h-64 sm:w-64" />

      {/* Orbit rings */}
      <motion.div
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#0B0B0C]/15 sm:h-[280px] sm:w-[280px]"
      >
        <span className="absolute -left-2 top-1/2 h-4 w-4 rounded-full border-[4px] border-[#F3F2EE] bg-[#B6FF2E] shadow-[0_0_20px_rgba(182,255,46,0.8)]" />
        <span className="absolute -right-1 top-[22%] h-3 w-3 rounded-full bg-[#0B0B0C]" />
      </motion.div>

      <motion.div
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{
          duration: 38,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-1/2 top-1/2 h-[175px] w-[175px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#0B0B0C]/10 sm:h-[225px] sm:w-[225px]"
      >
        <span className="absolute -bottom-1 left-[25%] h-3 w-3 rounded-full bg-[#B6FF2E] shadow-[0_0_15px_rgba(182,255,46,0.8)]" />
      </motion.div>

      {/* Floating graduation cap */}
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -13, 0],
                rotate: [-7, -2, -7],
              }
        }
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-[7%] top-[3%] z-20 flex h-[66px] w-[66px] items-center justify-center rounded-[20px] border border-white/80 bg-white/90 text-[#0B0B0C] shadow-[0_15px_35px_rgba(11,11,12,0.13)] backdrop-blur-md sm:right-[12%] sm:top-[2%] sm:h-[76px] sm:w-[76px]"
      >
        <GraduationCap size={38} strokeWidth={1.5} />
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-[3px] border-white bg-[#B6FF2E]" />
      </motion.div>

      {/* Floating mini book */}
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, 10, 0],
                rotate: [7, 12, 7],
              }
        }
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[12%] left-[4%] z-20 flex h-[58px] w-[58px] items-center justify-center rounded-[17px] border border-white/80 bg-[#B6FF2E] text-[#0B0B0C] shadow-[0_15px_35px_rgba(11,11,12,0.12)] sm:bottom-[10%] sm:left-[7%] sm:h-[68px] sm:w-[68px]"
      >
        <BookMarked size={29} strokeWidth={1.6} />
      </motion.div>

      {/* Floating spark */}
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -9, 0],
                rotate: [0, 20, 0],
              }
        }
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-[12%] top-[12%] z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/80 text-[#0B0B0C] shadow-lg backdrop-blur-md"
      >
        <Sparkles size={19} />
      </motion.div>

      {/* 3D open book */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.8, y: 25 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: reduceMotion ? 0 : [0, -8, 0],
        }}
        transition={{
          opacity: { duration: 0.7 },
          scale: { duration: 0.7, ease: "backOut" },
          y: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="relative z-10"
        style={{ perspective: "900px" }}
      >
        <div
          className="relative h-[145px] w-[245px] sm:h-[175px] sm:w-[300px]"
          style={{
            transform: "rotateX(13deg) rotateY(-9deg) rotateZ(-5deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Book shadow */}
          <div
            className="absolute left-[8%] top-[23%] h-[90%] w-[90%] rounded-[18px] bg-[#0B0B0C]/25 blur-xl"
            style={{ transform: "translateZ(-25px) translateY(16px)" }}
          />

          {/* Left page */}
          <div
            className="absolute left-0 top-0 h-full w-1/2 overflow-hidden rounded-l-[12px] border border-[#D7D5CC] bg-[#FFFEF9]"
            style={{
              transform: "rotateY(8deg)",
              transformOrigin: "right center",
              boxShadow: "inset -8px 0 12px rgba(11,11,12,0.07)",
            }}
          >
            <div className="space-y-3 px-4 py-5 sm:px-6 sm:py-7">
              <div className="h-2 w-16 rounded-full bg-[#B6FF2E] sm:w-20" />
              <div className="h-1.5 w-full rounded-full bg-[#D9D7CE]" />
              <div className="h-1.5 w-[85%] rounded-full bg-[#E5E3DA]" />
              <div className="h-1.5 w-[92%] rounded-full bg-[#E5E3DA]" />
              <div className="mt-4 h-9 w-9 rounded-xl bg-[#F3F2EE] sm:h-12 sm:w-12" />
              <div className="h-1.5 w-[78%] rounded-full bg-[#D9D7CE]" />
              <div className="h-1.5 w-[90%] rounded-full bg-[#E5E3DA]" />
            </div>
          </div>

          {/* Right page */}
          <div
            className="absolute right-0 top-0 h-full w-1/2 overflow-hidden rounded-r-[12px] border border-[#D7D5CC] bg-white"
            style={{
              transform: "rotateY(-8deg)",
              transformOrigin: "left center",
              boxShadow: "inset 8px 0 12px rgba(11,11,12,0.055)",
            }}
          >
            <div className="space-y-3 px-4 py-5 sm:px-6 sm:py-7">
              <div className="h-2 w-14 rounded-full bg-[#0B0B0C] sm:w-16" />
              <div className="h-1.5 w-[92%] rounded-full bg-[#D9D7CE]" />
              <div className="h-1.5 w-[80%] rounded-full bg-[#E5E3DA]" />
              <div className="mt-4 flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#B6FF2E]" />
                <div className="h-1.5 w-[65%] rounded-full bg-[#D9D7CE]" />
              </div>
              <div className="h-1.5 w-[95%] rounded-full bg-[#E5E3DA]" />
              <div className="h-1.5 w-[72%] rounded-full bg-[#E5E3DA]" />
              <div className="mt-3 h-7 w-full rounded-lg bg-[#F3F2EE]" />
            </div>
          </div>

          {/* Book center binding */}
          <div
            className="absolute left-1/2 top-0 h-full w-[7px] -translate-x-1/2 rounded-full bg-[#D2D0C7]"
            style={{
              transform: "translateX(-50%) translateZ(5px)",
              boxShadow: "0 0 8px rgba(11,11,12,0.12)",
            }}
          />

          {/* Bottom book cover */}
          <div
            className="absolute -bottom-[7px] left-[2%] h-[12px] w-[96%] rounded-b-[10px] bg-[#0B0B0C]"
            style={{ transform: "translateZ(-5px)" }}
          />
        </div>
      </motion.div>

      {/* Floating learning card */}
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { y: [0, -7, 0], rotate: [2, 0, 2] }
        }
        transition={{
          duration: 4.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[4%] right-[4%] z-20 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-[0_15px_35px_rgba(11,11,12,0.12)] backdrop-blur-md sm:right-[8%]"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B6FF2E] text-[#0B0B0C]">
            <CheckCircle2 size={19} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-[#0B0B0C]">
              Keep growing
            </p>
            <p className="mt-0.5 text-[9px] text-[#77766F]">
              One lesson at a time
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tiny decorative dots */}
      <div className="absolute bottom-[22%] right-[18%] h-2 w-2 rounded-full bg-[#0B0B0C]/70" />
      <div className="absolute left-[24%] bottom-[8%] h-1.5 w-1.5 rounded-full bg-[#B6FF2E]" />
    </div>
  );
}

export default function TutorDashboardPage() {
  const { data: session, isPending: sessionPending } =
    authClient.useSession();

  const user = session?.user as DashboardUser | undefined;
  const reduceMotion = useReducedMotion();

  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const { data: tokenData, error: tokenError } =
        await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error("Please sign in again to access your dashboard.");
      }

      const headers = {
        Authorization: `Bearer ${tokenData.token}`,
      };

      const [tuitionResponse, applicationResponse] = await Promise.all([
        fetch(`${API_URL}/api/tuitions/mine`, {
          method: "GET",
          headers,
          credentials: "include",
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/applications/tutor`, {
          method: "GET",
          headers,
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      const [tuitionResult, applicationResult] = await Promise.all([
        tuitionResponse.json(),
        applicationResponse.json(),
      ]);

      if (!tuitionResponse.ok || !tuitionResult.success) {
        throw new Error(
          tuitionResult.message || "Could not load your tuition posts."
        );
      }

      if (!applicationResponse.ok || !applicationResult.success) {
        throw new Error(
          applicationResult.message || "Could not load your applicants."
        );
      }

      setTuitions(
        Array.isArray(tuitionResult.tuitions)
          ? tuitionResult.tuitions
          : []
      );

      setApplications(
        Array.isArray(applicationResult.applications)
          ? applicationResult.applications
          : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading your dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionPending) return;

    if (user?.role === "tutor") {
      void loadDashboard();
    } else {
      setLoading(false);
    }
  }, [sessionPending, user?.role, loadDashboard]);

  const statistics = useMemo(() => {
    return {
      totalTuitions: tuitions.length,
      activeTuitions: tuitions.filter(
        (item) => item.isActive && item.approvalStatus === "approved"
      ).length,
      pendingApplications: applications.filter(
        (item) => item.status === "pending"
      ).length,
      acceptedApplications: applications.filter(
        (item) => item.status === "accepted"
      ).length,
      pendingPosts: tuitions.filter(
        (item) => item.approvalStatus === "pending"
      ).length,
      rejectedPosts: tuitions.filter(
        (item) => item.approvalStatus === "rejected"
      ).length,
    };
  }, [tuitions, applications]);

  const recentApplications = useMemo(
    () => applications.slice(0, 5),
    [applications]
  );

  const recentTuitions = useMemo(
    () => tuitions.slice(0, 4),
    [tuitions]
  );

  const isPro = user?.plan?.toLowerCase() === "pro";

  if (sessionPending || loading) {
    return <DashboardSkeleton />;
  }

  if (!user || user.role !== "tutor") {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-7 pb-8 text-[#0B0B0C]">
      {/* HERO SECTION */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative isolate overflow-hidden rounded-[28px] border border-[#DCDAD1] bg-[#F3F2EE] shadow-[0_18px_55px_rgba(11,11,12,0.07)]"
      >
        {/* Background texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage:
              "radial-gradient(#0B0B0C 0.7px, transparent 0.7px)",
            backgroundSize: "19px 19px",
          }}
        />

        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#B6FF2E]/35 blur-[85px]" />
        <div className="pointer-events-none absolute -bottom-32 left-[25%] h-72 w-72 rounded-full bg-[#B6FF2E]/20 blur-[90px]" />

        <div className="relative grid min-h-[330px] items-center gap-2 px-6 py-8 sm:px-9 sm:py-9 lg:min-h-[370px] lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
          {/* Hero text */}
          <div className="relative z-20 max-w-[570px]">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="inline-flex items-center gap-2 rounded-lg border border-[#D8D6CC] bg-white/75 px-3 py-2 text-[9px] font-extrabold uppercase tracking-[1.8px] text-[#0B0B0C] backdrop-blur-sm"
            >
              <span className="h-2 w-2 rounded-full bg-[#B6FF2E] shadow-[0_0_10px_rgba(182,255,46,0.9)]" />
              MentorLagbe · Tutor workspace
            </motion.div>

            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.22 }}
              className="mt-6 max-w-[540px] text-[34px] font-extrabold leading-[1.08] tracking-[-1.8px] text-[#0B0B0C] sm:text-[43px] sm:tracking-[-2.5px] lg:text-[48px]"
            >
              Welcome back,
              <span className="relative ml-2 inline-block">
                {getFirstName(user.name)}
                <span className="absolute -bottom-1 left-0 -z-10 h-[10px] w-full -rotate-1 rounded-sm bg-[#B6FF2E] sm:h-3" />
              </span>
              .
            </motion.h1>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32 }}
              className="mt-5 max-w-[440px] text-[12px] leading-7 text-[#65645E] sm:text-[13px]"
            >
              Great teaching creates brighter futures. Manage your tuition
              posts, meet motivated learners and make every lesson count.
            </motion.p>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.42 }}
              className="mt-7 flex flex-wrap gap-3"
            >
              <Link
                href="/dashboard/tutor/post-tuition"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-[#B6FF2E] px-5 py-3.5 text-[11px] font-extrabold text-[#0B0B0C] shadow-[0_7px_18px_rgba(182,255,46,0.2)] transition duration-300 hover:-translate-y-1 hover:bg-[#C8FF65] hover:shadow-[0_12px_24px_rgba(182,255,46,0.3)]"
              >
                <Plus size={15} />
                Post a tuition
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>

              <Link
                href="/dashboard/tutor/applicants"
                className="inline-flex items-center gap-2 rounded-xl border border-[#D8D6CC] bg-white/80 px-5 py-3.5 text-[11px] font-bold text-[#0B0B0C] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#0B0B0C] hover:bg-white"
              >
                <Users size={15} />
                View applicants
                <ArrowRight size={13} />
              </Link>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px] font-semibold text-[#77766F]"
            >
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-[#527B21]" />
                Your teaching journey starts here
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#77766F]" />
                Learn. Grow. Lead.
              </span>
            </motion.div>
          </div>

          {/* 3D illustration */}
          <div className="relative z-10 -mx-2 -mt-1 lg:mx-0 lg:mt-0">
            <TutorHeroVisual />
          </div>
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 h-[5px] w-full bg-[#0B0B0C]" />
        <div className="absolute bottom-0 left-0 h-[5px] w-[34%] bg-[#B6FF2E]" />
      </motion.section>

      {/* ERROR MESSAGE */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E7C7C3] bg-[#FBEFED] p-4 text-[#98544B]"
        >
          <div>
            <p className="text-xs font-bold">
              Dashboard could not refresh
            </p>
            <p className="mt-1 text-[11px]">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E7C7C3] bg-white px-4 py-2.5 text-[11px] font-bold text-[#0B0B0C] transition hover:bg-[#F3F2EE]"
          >
            <RefreshCw size={13} />
            Try again
          </button>
        </motion.div>
      )}

      {/* STATISTICS */}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[2px] text-[#88877F]">
              Your performance
            </p>
            <h2 className="mt-1.5 text-xl font-bold tracking-[-0.8px] text-[#0B0B0C]">
              Workspace overview
            </h2>
          </div>

          <span className="inline-flex items-center gap-2 rounded-lg border border-[#E2E0D8] bg-white px-3 py-2 text-[10px] font-semibold text-[#77766F]">
            <CalendarDays size={13} />
            All time
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total tuition posts"
            value={statistics.totalTuitions}
            description="Your created opportunities"
            icon={BookMarked}
            delay={0.05}
          />

          <StatCard
            label="Active tuition posts"
            value={statistics.activeTuitions}
            description="Approved and currently active"
            icon={Zap}
            delay={0.12}
          />

          <StatCard
            label="Pending applications"
            value={statistics.pendingApplications}
            description="Waiting for your response"
            icon={Clock3}
            delay={0.19}
          />

          <StatCard
            label="Accepted applications"
            value={statistics.acceptedApplications}
            description="Learners you have accepted"
            icon={CheckCircle2}
            delay={0.26}
          />
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.85fr]">
        {/* RECENT TUITION POSTS */}
        <section className="overflow-hidden rounded-[25px] border border-[#E2E0D8] bg-white shadow-[0_8px_30px_rgba(11,11,12,0.035)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEEDE7] px-5 py-5 sm:px-6">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[1.8px] text-[#88877F]">
                Teaching opportunities
              </p>
              <h2 className="mt-1 text-[17px] font-bold tracking-tight text-[#0B0B0C]">
                Your recent tuitions
              </h2>
            </div>

            <Link
              href="/dashboard/tutor/my-tuitions"
              className="group inline-flex items-center gap-2 rounded-lg border border-[#E2E0D8] bg-[#F8F7F2] px-3.5 py-2.5 text-[10px] font-bold text-[#0B0B0C] transition hover:border-[#B6FF2E] hover:bg-[#B6FF2E]"
            >
              View all
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {recentTuitions.length === 0 ? (
            <EmptyState
              title="No tuition posts yet"
              description="Create your first tuition post and start connecting with learners."
              icon={BookMarked}
            />
          ) : (
            <div className="divide-y divide-[#EEEDE7]">
              {recentTuitions.map((tuition, index) => (
                <motion.div
                  key={tuition._id || tuition.id || index}
                  initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.07 }}
                  className="group flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-[#F8F7F2] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E2E0D8] bg-[#F3F2EE] text-[#0B0B0C] transition-all group-hover:border-[#B6FF2E] group-hover:bg-[#B6FF2E]">
                      <BookOpen size={19} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-[13px] font-bold text-[#0B0B0C]">
                        {tuition.title}
                      </h3>

                      <p className="mt-1.5 text-[10px] text-[#77766F]">
                        {tuition.subject} · {tuition.classLevel}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-[#88877F]">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} />
                          {tuition.location}
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={11} />
                          {tuition.daysPerWeek} days/week
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="text-sm font-bold text-[#0B0B0C]">
                      {formatMoney(tuition.monthlyFee)}
                    </div>

                    <span
                      className={`rounded-lg border px-2.5 py-1.5 text-[9px] font-bold capitalize ${
                        tuition.approvalStatus === "approved"
                          ? "border-[#C8DFB5] bg-[#EFF7E8] text-[#456B31]"
                          : tuition.approvalStatus === "rejected"
                            ? "border-[#E7C7C3] bg-[#FBEFED] text-[#98544B]"
                            : "border-[#E8D69C] bg-[#FFF8DF] text-[#80651C]"
                      }`}
                    >
                      {tuition.approvalStatus}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* APPLICATION SUMMARY */}
        <section className="overflow-hidden rounded-[25px] border border-[#E2E0D8] bg-white shadow-[0_8px_30px_rgba(11,11,12,0.035)]">
          <div className="flex items-center justify-between border-b border-[#EEEDE7] px-5 py-5">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[1.8px] text-[#88877F]">
                Learner activity
              </p>
              <h2 className="mt-1 text-[17px] font-bold tracking-tight text-[#0B0B0C]">
                Recent applicants
              </h2>
            </div>

            <div className="rounded-xl border border-[#E2E0D8] bg-[#F3F2EE] p-2.5 text-[#0B0B0C]">
              <Users size={18} />
            </div>
          </div>

          {recentApplications.length === 0 ? (
            <EmptyState
              title="No applicants yet"
              description="When learners apply to your tuition posts, their applications will appear here."
              icon={Users}
            />
          ) : (
            <div className="divide-y divide-[#EEEDE7]">
              {recentApplications.map((application, index) => {
                const applicantName =
                  application.studentName ||
                  application.applicantName ||
                  "Student";

                return (
                  <motion.div
                    key={application._id || application.id || index}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="px-5 py-4 transition-colors hover:bg-[#F8F7F2]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2E0D8] bg-[#B6FF2E] text-[11px] font-bold text-[#0B0B0C]">
                          {getInitials(applicantName)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-bold text-[#0B0B0C]">
                            {applicantName}
                          </p>

                          <p className="mt-1 truncate text-[10px] text-[#88877F]">
                            {application.tuitionTitle}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={application.status} />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 pl-[52px]">
                      <span className="text-[10px] text-[#88877F]">
                        {formatDate(application.appliedAt)}
                      </span>

                      <span className="text-[10px] font-bold text-[#0B0B0C]">
                        {formatMoney(application.monthlyFee)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="border-t border-[#EEEDE7] p-4">
            <Link
              href="/dashboard/tutor/applicants"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#F3F2EE] px-4 py-3 text-[10px] font-bold text-[#0B0B0C] transition hover:bg-[#B6FF2E]"
            >
              Manage all applicants
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>
      </div>

      {/* BOTTOM PANELS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* PLAN */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative isolate overflow-hidden rounded-[25px] border border-[#E2E0D8] bg-white p-6 shadow-[0_8px_30px_rgba(11,11,12,0.035)] sm:p-7"
        >
          <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-[#B6FF2E]/20 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[2px] text-[#88877F]">
                Membership
              </p>

              <h2 className="mt-2 text-xl font-bold tracking-tight text-[#0B0B0C]">
                Your current plan
              </h2>

              <p className="mt-2 text-[11px] leading-6 text-[#77766F]">
                {isPro
                  ? "You are enjoying the benefits of the Pro membership."
                  : "Make more teaching opportunities available to learners."}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E0D8] bg-[#F3F2EE] p-3 text-[#0B0B0C]">
              <Wallet size={22} />
            </div>
          </div>

          <div className="relative mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#EEEDE7] pt-5">
            <div>
              <span
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider ${
                  isPro
                    ? "border-[#B6FF2E] bg-[#F3FCE5] text-[#0B0B0C]"
                    : "border-[#E2E0D8] bg-[#F3F2EE] text-[#0B0B0C]"
                }`}
              >
                <Sparkles size={13} />
                {isPro ? "Pro member" : "Free member"}
              </span>

              <p className="mt-2 text-[10px] text-[#88877F]">
                {isPro
                  ? "Unlimited tuition posts"
                  : `${statistics.totalTuitions} of 2 free posts used`}
              </p>
            </div>

            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-[#B6FF2E] px-4 py-3 text-[10px] font-bold text-[#0B0B0C] transition hover:-translate-y-0.5 hover:bg-[#C8FF65]"
            >
              {isPro ? "View membership" : "Explore Pro"}
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </motion.section>

        {/* POST STATUS */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="overflow-hidden rounded-[25px] border border-[#E2E0D8] bg-white p-6 shadow-[0_8px_30px_rgba(11,11,12,0.035)] sm:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[2px] text-[#88877F]">
                Approval tracking
              </p>

              <h2 className="mt-2 text-xl font-bold tracking-tight text-[#0B0B0C]">
                Tuition post status
              </h2>

              <p className="mt-2 text-[11px] text-[#77766F]">
                Keep track of your submitted opportunities.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E0D8] bg-[#F3F2EE] p-3 text-[#0B0B0C]">
              <BookMarked size={22} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#E2E0D8] bg-[#F8F7F2] p-3">
              <p className="text-[9px] font-semibold text-[#88877F]">
                Pending
              </p>
              <p className="mt-2 text-2xl font-bold text-[#80651C]">
                {statistics.pendingPosts}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E0D8] bg-[#F8F7F2] p-3">
              <p className="text-[9px] font-semibold text-[#88877F]">
                Approved
              </p>
              <p className="mt-2 text-2xl font-bold text-[#456B31]">
                {statistics.activeTuitions}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E0D8] bg-[#F8F7F2] p-3">
              <p className="text-[9px] font-semibold text-[#88877F]">
                Rejected
              </p>
              <p className="mt-2 text-2xl font-bold text-[#98544B]">
                {statistics.rejectedPosts}
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/tutor/my-tuitions"
            className="group mt-5 inline-flex items-center gap-2 text-[10px] font-bold text-[#0B0B0C] transition hover:text-[#657F28]"
          >
            Review your tuition posts
            <ArrowRight
              size={13}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </motion.section>
      </div>

      {/* FOOTER NOTE */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E0D8] pt-5">
        <p className="text-[10px] text-[#88877F]">
          Your teaching journey matters. Keep moving forward.
        </p>

        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#0B0B0C]">
          <GraduationCap size={14} />
          MentorLagbe Tutor Workspace
        </span>
      </div>
    </div>
  );
}
