
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  UserRound,
  CalendarDays,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type UserRole = "student" | "tutor" | "admin";

type AdminUser = {
  id: string;
  name?: string;
  email?: string;
  role?: UserRole;
  phone?: string;
  bio?: string;
  plan?: string;
  createdAt?: string;
};

type UsersApiResponse = {
  success?: boolean;
  message?: string;
  users?: AdminUser[];
  pagination?: {
    currentPage?: number;
    limit?: number;
    totalUsers?: number;
    totalPages?: number;
  };
};

type AdminSessionUser = {
  role?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const PAGE_SIZE = 10;

const roleFilters = [
  { label: "All users", value: "all" },
  { label: "Students", value: "student" },
  { label: "Tutors", value: "tutor" },
  { label: "Admins", value: "admin" },
] as const;

function formatDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(name?: string) {
  if (!name?.trim()) return "U";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getRoleStyle(role?: UserRole) {
  switch (role) {
    case "admin":
      return "border-[#B6FF2E] bg-[#B6FF2E]/20 text-[#334B00]";
    case "tutor":
      return "border-[#0B0B0C]/20 bg-[#0B0B0C]/5 text-[#0B0B0C]";
    case "student":
      return "border-[#77776F]/20 bg-[#77776F]/10 text-[#66665F]";
    default:
      return "border-[#77776F]/20 bg-[#77776F]/10 text-[#66665F]";
  }
}

export default function AdminUsersPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const session = authClient.useSession();

  const currentUser = session.data?.user as
    | AdminSessionUser
    | undefined;

  const isAdmin = currentUser?.role === "admin";

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<string>("all");

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Load users from the protected admin API.
  const loadUsers = useCallback(async () => {
    setError("");
    setRefreshing(true);
    setLoading(true);

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

      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (role !== "all") {
        params.set("role", role);
      }

      const response = await fetch(
        `${API_URL}/api/users/?${params.toString()}`,
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

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Admin access could not be verified. Please sign in again or contact the administrator.",
        );
      }

      if (!response.ok) {
        throw new Error(
          `Unable to load users (HTTP ${response.status}).`,
        );
      }

      const result =
        (await response.json()) as UsersApiResponse;

      if (result.success === false) {
        throw new Error(
          result.message ||
            "The server could not return the user list.",
        );
      }

      const loadedUsers = Array.isArray(result.users)
        ? result.users
        : [];

      setUsers(loadedUsers);
      setTotalUsers(result.pagination?.totalUsers ?? 0);
      setTotalPages(
        Math.max(1, result.pagination?.totalPages ?? 1),
      );
    } catch (err) {
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(1);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading users.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, role]);

  // Verify the current session and administrator permissions.
  useEffect(() => {
    if (session.isPending) return;

    if (!session.data) {
      router.replace(
        "/sign-in?callbackURL=/dashboard/admin/users",
      );
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

    void loadUsers();
  }, [
    session.isPending,
    session.data,
    currentUser?.role,
    router,
    loadUsers,
  ]);

  const handleRoleChange = (nextRole: string) => {
    setError("");
    setRole(nextRole);
    setPage(1);
  };

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
      {/* Decorative atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-28 h-[400px] w-[400px] rounded-full bg-[#B6FF2E]/15 blur-[100px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 -left-28 h-[360px] w-[360px] rounded-full bg-[#B6FF2E]/10 blur-[100px]"
      />

      <div className="relative mx-auto max-w-[1500px]">
        {/* Page introduction */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Link
            href="/dashboard/admin"
            className="mb-7 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#77776F] transition-colors hover:text-[#0B0B0C]"
          >
            <ArrowLeft size={14} />
            Back to overview
          </Link>

          <header className="relative overflow-hidden border border-[#0B0B0C]/10 bg-white/70 p-6 sm:p-8 lg:p-10">
            <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-5 flex items-center gap-2">
                  <span className="h-2 w-2 bg-[#B6FF2E]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#77776F]">
                    MentorLagbe / User directory
                  </span>
                </div>

                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#92928A]">
                  Administration / 01
                </p>

                <h1 className="mt-3 text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                  People make
                  <br />
                  the{" "}
                  <span className="underline decoration-[#B6FF2E] decoration-[7px] underline-offset-4">
                    platform.
                  </span>
                </h1>

                <p className="mt-5 max-w-xl text-sm leading-7 text-[#77776F] sm:text-base">
                  Browse the MentorLagbe community and review account
                  information for students, tutors and administrators.
                </p>
              </div>

              {/* Animated community graphic */}
              <div className="relative mx-auto flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48">
                <div className="absolute inset-3 rotate-12 border border-[#0B0B0C]/15" />
                <div className="absolute inset-7 -rotate-12 border border-[#B6FF2E]" />

                <motion.div
                  animate={
                    reduceMotion
                      ? undefined
                      : { y: [0, -7, 0], rotate: [0, 4, 0] }
                  }
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative flex h-24 w-24 items-center justify-center bg-[#B6FF2E] shadow-[12px_12px_0_rgba(11,11,12,0.08)] sm:h-28 sm:w-28"
                >
                  <Users
                    size={43}
                    strokeWidth={1.4}
                    className="text-[#0B0B0C]"
                  />
                </motion.div>

                <span className="absolute -right-1 top-3 border border-[#0B0B0C]/10 bg-white px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em]">
                  Community
                </span>

                <span className="absolute -bottom-1 left-0 bg-[#0B0B0C] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#B6FF2E]">
                  ML / 02
                </span>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="absolute -bottom-16 right-[25%] h-40 w-40 rounded-full border border-[#0B0B0C]/[0.06]"
            />
          </header>
        </motion.div>

        {/* Directory statistics */}
        <section className="mt-9">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border border-[#0B0B0C]/10 bg-white/65 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#92928A]">
                  Registered accounts
                </span>
                <UserRound size={18} className="text-[#77776F]" />
              </div>

              <p className="mt-4 text-4xl font-black tracking-[-0.06em]">
                {loading ? "—" : totalUsers.toLocaleString("en-US")}
              </p>

              <p className="mt-2 text-xs text-[#92928A]">
                Total accounts matching the selected filter
              </p>
            </div>

            <div className="border border-[#0B0B0C]/10 bg-[#0B0B0C] p-5 text-white sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                  Current directory
                </span>
                <ShieldCheck size={18} className="text-[#B6FF2E]" />
              </div>

              <p className="mt-4 text-2xl font-black tracking-[-0.04em]">
                {role === "all"
                  ? "All roles"
                  : `${role.charAt(0).toUpperCase()}${role.slice(1)} accounts`}
              </p>

              <p className="mt-2 text-xs text-white/45">
                Page {page} of {totalPages}
              </p>
            </div>
          </div>
        </section>

        {/* User directory */}
        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#77776F]">
                Community / 02
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-[-0.045em] sm:text-3xl">
                User directory.
              </h2>

              <p className="mt-2 text-xs leading-6 text-[#92928A]">
                Review registered accounts and their platform information.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadUsers()}
              disabled={refreshing}
              className="inline-flex min-h-10 items-center justify-center gap-2 border border-[#0B0B0C]/20 px-4 text-xs font-bold uppercase tracking-[0.1em] transition-colors hover:border-[#0B0B0C] hover:bg-[#0B0B0C] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing" : "Refresh"}
            </button>
          </div>

          {/* Role filters */}
          <div className="mb-5 flex flex-wrap gap-2">
            {roleFilters.map((filter) => {
              const active = role === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => handleRoleChange(filter.value)}
                  aria-pressed={active}
                  className={`min-h-10 border px-4 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
                    active
                      ? "border-[#0B0B0C] bg-[#0B0B0C] text-[#B6FF2E]"
                      : "border-[#0B0B0C]/15 bg-white/60 text-[#77776F] hover:border-[#0B0B0C] hover:text-[#0B0B0C]"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Error feedback */}
          {error && (
            <div
              role="alert"
              className="mb-5 flex flex-col gap-3 border border-red-900/20 bg-red-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-2">
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0 text-red-800"
                />
                <p className="text-sm leading-6 text-red-800">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadUsers()}
                className="shrink-0 text-left text-xs font-bold uppercase tracking-[0.12em] text-red-900 underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          )}

          {/* User records */}
          <div className="overflow-hidden border border-[#0B0B0C]/10 bg-white/70">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0B0B0C]/10 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                <Search size={15} className="text-[#92928A]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#77776F]">
                  Account records
                </span>
              </div>

              <span className="text-[10px] font-medium text-[#92928A]">
                Showing {loading ? "..." : users.length} of{" "}
                {loading ? "..." : totalUsers} accounts
              </span>
            </div>

            {loading ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3">
                <RefreshCw
                  size={22}
                  className="animate-spin text-[#77776F]"
                />
                <p className="text-xs text-[#92928A]">
                  Loading community records...
                </p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                <div className="flex h-14 w-14 items-center justify-center border border-[#0B0B0C]/10 bg-[#F3F2EE]">
                  <Users size={23} className="text-[#92928A]" />
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  No accounts found
                </h3>

                <p className="mt-2 max-w-sm text-xs leading-6 text-[#92928A]">
                  There are no user records for this filter at the moment.
                  Try selecting another role.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop directory */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[850px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[#0B0B0C]/10 bg-[#F3F2EE]/70">
                        <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.16em] text-[#92928A]">
                          User
                        </th>

                        <th className="px-5 py-4 text-[9px] font-bold uppercase tracking-[0.16em] text-[#92928A]">
                          Role
                        </th>

                        <th className="px-5 py-4 text-[9px] font-bold uppercase tracking-[0.16em] text-[#92928A]">
                          Contact
                        </th>

                        <th className="px-5 py-4 text-[9px] font-bold uppercase tracking-[0.16em] text-[#92928A]">
                          Plan
                        </th>

                        <th className="px-5 py-4 text-[9px] font-bold uppercase tracking-[0.16em] text-[#92928A]">
                          Joined
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {users.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={
                            reduceMotion
                              ? false
                              : { opacity: 0, y: 8 }
                          }
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: reduceMotion ? 0 : index * 0.035,
                          }}
                          className="border-b border-[#0B0B0C]/[0.07] transition-colors last:border-0 hover:bg-[#B6FF2E]/[0.07]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#0B0B0C]/10 bg-[#F3F2EE] text-xs font-black">
                                {getInitials(user.name)}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold">
                                  {user.name || "Unnamed user"}
                                </p>

                                <p className="mt-1 text-[10px] text-[#92928A]">
                                  ID: {user.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <span
                              className={`inline-flex border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${getRoleStyle(user.role)}`}
                            >
                              {user.role || "Unknown"}
                            </span>
                          </td>

                          <td className="px-5 py-5">
                            <p className="max-w-[190px] truncate text-xs text-[#55554F]">
                              {user.email || "No email"}
                            </p>

                            <p className="mt-1 text-[10px] text-[#92928A]">
                              {user.phone || "No phone number"}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <span className="text-xs font-medium text-[#55554F]">
                              {user.plan || "Free"}
                            </span>
                          </td>

                          <td className="px-5 py-5">
                            <span className="text-xs text-[#77776F]">
                              {formatDate(user.createdAt)}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile directory */}
                <div className="divide-y divide-[#0B0B0C]/[0.08] md:hidden">
                  {users.map((user, index) => (
                    <motion.article
                      key={user.id}
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, y: 8 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: reduceMotion ? 0 : index * 0.035,
                      }}
                      className="p-4 sm:p-5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#0B0B0C]/10 bg-[#F3F2EE] text-xs font-black">
                          {getInitials(user.name)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold">
                              {user.name || "Unnamed user"}
                            </h3>

                            <span
                              className={`inline-flex border px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] ${getRoleStyle(user.role)}`}
                            >
                              {user.role || "Unknown"}
                            </span>
                          </div>

                          <p className="mt-1 break-all text-xs text-[#77776F]">
                            {user.email || "No email"}
                          </p>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div>
                              <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#92928A]">
                                <Phone size={11} />
                                Phone
                              </p>

                              <p className="mt-1 break-words text-xs text-[#55554F]">
                                {user.phone || "Not provided"}
                              </p>
                            </div>

                            <div>
                              <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#92928A]">
                                <CalendarDays size={11} />
                                Joined
                              </p>

                              <p className="mt-1 text-xs text-[#55554F]">
                                {formatDate(user.createdAt)}
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#92928A]">
                                Plan
                              </p>

                              <p className="mt-1 text-xs text-[#55554F]">
                                {user.plan || "Free"}
                              </p>
                            </div>

                            <div>
                              <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#92928A]">
                                <Mail size={11} />
                                Account ID
                              </p>

                              <p className="mt-1 truncate text-xs text-[#55554F]">
                                {user.id}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-[#92928A]">
              Page {page} of {totalPages} · {totalUsers} total accounts
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                disabled={page <= 1 || loading}
                className="inline-flex min-h-10 items-center gap-2 border border-[#0B0B0C]/20 px-4 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors hover:bg-[#0B0B0C] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-[#0B0B0C]"
              >
                <ChevronLeft size={14} />
                Previous
              </button>

              <span className="flex h-10 min-w-10 items-center justify-center border border-[#0B0B0C] bg-[#B6FF2E] px-3 text-xs font-black">
                {page}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages, current + 1),
                  )
                }
                disabled={page >= totalPages || loading}
                className="inline-flex min-h-10 items-center gap-2 border border-[#0B0B0C]/20 px-4 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors hover:bg-[#0B0B0C] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-[#0B0B0C]"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-[#0B0B0C]/10 py-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#92928A]">
            MentorLagbe / User management
          </span>

          <span className="text-[10px] text-[#92928A]">
            Learn. Grow. Lead.
          </span>
        </footer>
      </div>
    </main>
  );
}
