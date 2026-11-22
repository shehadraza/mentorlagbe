
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  CreditCard,
  Mail,
  ShieldCheck,
  UserRound,
  GraduationCap,
  Pencil,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type DashboardUser = {
  name?: string;
  email?: string;
  role?: "student" | "tutor" | "admin";
  plan?: "free" | "pro";
};

const roleLabels: Record<string, string> = {
  student: "Student",
  tutor: "Tutor",
  admin: "Administrator",
};

export default function SettingsPage() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as DashboardUser | undefined;

  const plan = user?.plan?.toLowerCase();

  if (isPending) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#F3F2EE]">
        <div className="flex items-center gap-3 text-sm font-semibold text-[#0B0B0C]/55">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#0B0B0C]/15 border-t-[#0B0B0C]" />
          Loading your account...
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#F3F2EE] px-4 py-8 text-[#0B0B0C] sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="mb-10">
            <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#0B0B0C]/45">
              Account / Settings
            </p>

            <h1 className="text-4xl font-black tracking-[-0.06em] sm:text-5xl">
              Account settings
              <span className="text-[#91C91B]">.</span>
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-6 text-[#0B0B0C]/55">
              Manage your account information and subscription.
            </p>
          </div>

          <div className="grid gap-5">
            {/* Account overview */}
            <section className="border border-[#0B0B0C]/10 bg-white p-5 sm:p-7">
              <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center bg-[#B6FF2E]/35">
                    <UserRound size={21} />
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight">
                      Account overview
                    </h2>
                    <p className="mt-1 text-xs text-[#0B0B0C]/50">
                      Your registered account information.
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard/profile"
                  className="inline-flex min-h-10 items-center justify-center gap-2 bg-[#B6FF2E] px-4 text-xs font-extrabold text-[#0B0B0C] transition-colors hover:bg-[#A5EF1D]"
                >
                  <Pencil size={14} />
                  Edit profile
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="border-l-2 border-[#B6FF2E] pl-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0B0B0C]/40">
                    Full name
                  </p>
                  <p className="mt-2 break-words text-sm font-bold">
                    {user.name || "Not available"}
                  </p>
                </div>

                <div className="border-l-2 border-[#B6FF2E] pl-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0B0B0C]/40">
                    Email address
                  </p>
                  <p className="mt-2 flex items-center gap-2 break-all text-sm font-bold">
                    <Mail size={15} className="shrink-0 text-[#0B0B0C]/40" />
                    {user.email || "Not available"}
                  </p>
                </div>

                <div className="border-l-2 border-[#B6FF2E] pl-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0B0B0C]/40">
                    Account role
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-bold">
                    <GraduationCap size={16} className="text-[#0B0B0C]/45" />
                    {roleLabels[user.role || ""] || "Member"}
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-col justify-between gap-3 border-t border-[#0B0B0C]/10 pt-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-bold">
                    Personal profile
                  </p>
                  <p className="mt-1 text-xs text-[#0B0B0C]/50">
                    Update your name, phone number, bio and profile picture.
                  </p>
                </div>

                <span className="inline-flex items-center gap-2 text-xs font-bold text-[#0B0B0C]/45">
                  <ShieldCheck size={16} />
                  Account protected
                </span>
              </div>
            </section>

            {/* Subscription */}
            <section className="relative overflow-hidden border border-[#0B0B0C]/10 bg-white p-5 sm:p-7">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border-[24px] border-[#B6FF2E]/15" />

              <div className="relative">
                <div className="mb-7 flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center bg-[#B6FF2E]/35">
                    <CreditCard size={21} />
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight">
                      Subscription plan
                    </h2>
                    <p className="mt-1 text-xs text-[#0B0B0C]/50">
                      Your current membership information.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-5 border border-[#0B0B0C]/10 bg-[#F3F2EE] p-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#0B0B0C]/45">
                      Current plan
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <h3 className="text-3xl font-black tracking-[-0.05em]">
                        {plan === "pro"
                          ? "Pro"
                          : plan === "free"
                            ? "Free"
                            : "Unavailable"}
                      </h3>

                      {plan === "pro" && (
                        <span className="inline-flex items-center gap-1 bg-[#B6FF2E] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider">
                          <BadgeCheck size={12} />
                          Active plan
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs text-[#0B0B0C]/50">
                      {plan === "pro"
                        ? "Your account has a Pro plan."
                        : plan === "free"
                          ? "You are currently using the Free plan."
                          : "Plan information is not available in your session."}
                    </p>
                  </div>

                  <Link
                    href="/pricing"
                    className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#B6FF2E] px-5 text-xs font-extrabold text-[#0B0B0C] transition-colors hover:bg-[#A5EF1D]"
                  >
                    View plans
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="border border-[#0B0B0C]/10 bg-white p-5 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#B6FF2E]/35">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold tracking-tight">
                    Account security
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#0B0B0C]/55">
                    Your account is connected to your registered email
                    address. Always keep your sign-in credentials private.
                  </p>

                  <p className="mt-4 text-xs font-semibold text-[#0B0B0C]/45">
                    To end your current session, use the Sign out option
                    in the dashboard sidebar.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8 border-t border-[#0B0B0C]/10 pt-5">
            <p className="text-[11px] leading-5 text-[#0B0B0C]/45">
              MentorLagbe · Account settings
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
