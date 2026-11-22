
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Crown,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type AccountUser = {
  name?: string;
  email?: string;
  role?: "student" | "tutor" | "admin";
  plan?: "free" | "pro";
};

type CheckoutResponse = {
  success?: boolean;
  message?: string;
  checkoutUrl?: string | null;
};

const benefits = {
  student: [
    "Apply to available tuition opportunities",
    "Track your applications",
    "Manage your learning profile",
    "Student Pro membership",
  ],
  tutor: [
    "Publish unlimited tuition posts",
    "Manage all your tuition opportunities",
    "Review and manage applicants",
    "Tutor Pro membership",
  ],
};

export default function PricingPage() {
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const user = session?.user as AccountUser | undefined;
  const role = user?.role;
  const isPro = user?.plan === "pro";
  const amount = role === "student" ? 10 : 15;

  async function handleCheckout() {
    setError("");

    if (!user) {
      window.location.assign("/sign-in?callbackURL=%2Fpricing");
      return;
    }

    if (role !== "student" && role !== "tutor") {
      setError("Only student and tutor accounts can purchase Pro.");
      return;
    }

    if (isPro) {
      setError("Your account already has Pro membership.");
      return;
    }

    setLoading(true);

    try {
      const { data: tokenData, error: tokenError } =
        await authClient.token();

      if (tokenError || !tokenData?.token) {
        window.location.assign("/sign-in?callbackURL=%2Fpricing");
        return;
      }

      const response = await fetch(`${API_URL}/api/payments/checkout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
      });

      const result = (await response.json()) as CheckoutResponse;

      if (!response.ok) {
        throw new Error(result.message || "Unable to start checkout.");
      }

      if (!result.checkoutUrl) {
        throw new Error("Stripe did not return a checkout URL.");
      }

      window.location.assign(result.checkoutUrl);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  }

  if (isPending) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-[#F3F2EE]">
        <LoaderCircle className="h-7 w-7 animate-spin text-[#0B0B0C]" />
      </main>
    );
  }

  const activeBenefits =
    role === "student"
      ? benefits.student
      : benefits.tutor;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F3F2EE] px-5 py-20 text-[#0B0B0C] sm:px-8">
      <div className="pointer-events-none absolute -right-40 top-10 h-[420px] w-[420px] rounded-full bg-[#B6FF2E]/20 blur-[100px]" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[360px] w-[360px] rounded-full bg-[#B6FF2E]/10 blur-[100px]" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Sparkles size={13} />
            MentorLagbe Membership
          </span>

          <h1 className="mt-7 font-heading text-4xl font-bold tracking-[-2px] sm:text-6xl">
            Invest in your
            <span className="block text-[#85877B]">next opportunity.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#727467]">
            Choose the membership that matches your journey.
            Unlock more possibilities with MentorLagbe Pro.
          </p>
        </div>

        {!user ? (
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {(["student", "tutor"] as const).map((accountRole) => (
              <div
                key={accountRole}
                className="rounded-[28px] border border-black/10 bg-white p-7 shadow-sm sm:p-9"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#85877B]">
                  {accountRole} membership
                </p>
                <h2 className="mt-5 text-3xl font-bold">
                  {accountRole === "student" ? "$10" : "$15"}
                  <span className="ml-2 text-sm font-medium text-[#85877B]">
                    / one-time payment
                  </span>
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#727467]">
                  {accountRole === "student"
                    ? "A better learning experience with Student Pro."
                    : "More opportunities with unlimited tuition posts."}
                </p>

                <Link
                  href="/sign-up"
                  className="mt-8 flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#B6FF2E] px-5 text-sm font-bold transition hover:bg-[#A5EF1D]"
                >
                  Create {accountRole} account
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        ) : role === "admin" ? (
          <div className="mx-auto mt-14 max-w-xl rounded-[28px] border border-black/10 bg-white p-9 text-center">
            <ShieldCheck className="mx-auto h-9 w-9" />
            <h2 className="mt-5 text-2xl font-bold">
              Administrator account
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#727467]">
              Pro membership is available for student and tutor accounts.
            </p>
            <Link
              href="/dashboard/admin"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#0B0B0C] px-6 py-3 text-sm font-semibold text-white"
            >
              Go to dashboard
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : role === "student" || role === "tutor" ? (
          <div className="mx-auto mt-14 max-w-xl overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_25px_80px_rgba(11,11,12,0.08)]">
            <div className="relative overflow-hidden bg-[#0B0B0C] p-8 text-white sm:p-10">
              <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-4 -top-12 h-44 w-44 rounded-full border border-dashed border-[#B6FF2E]/40" />

              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#B6FF2E] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0B0B0C]">
                  <Crown size={12} />
                  {isPro ? "Current membership" : "Upgrade available"}
                </span>

                <h2 className="mt-7 text-3xl font-bold">
                  {role === "student" ? "Student Pro" : "Tutor Pro"}
                </h2>

                <p className="mt-2 text-sm text-white/60">
                  Welcome{user.name ? `, ${user.name}` : ""}.
                  {" "}Your account is registered as a {role}.
                </p>

                <div className="mt-7 flex items-baseline gap-2">
                  <span className="text-6xl font-bold tracking-[-3px]">
                    ${amount}
                  </span>
                  <span className="text-xs text-white/50">
                    one-time payment
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-10">
              <h3 className="text-sm font-bold">
                What your Pro membership includes
              </h3>

              <ul className="mt-6 space-y-4">
                {activeBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#B6FF2E]">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className="text-sm text-[#55554F]">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>

              {error && (
                <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              {isPro ? (
                <div className="mt-8 rounded-2xl bg-[#F3F2EE] p-4 text-center">
                  <p className="font-bold text-[#397A20]">
                    You already have Pro membership.
                  </p>
                  <p className="mt-1 text-xs text-[#727467]">
                    Thank you for being part of MentorLagbe Pro.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={loading}
                  className="mt-8 flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[#B6FF2E] px-6 text-sm font-bold text-[#0B0B0C] transition hover:-translate-y-0.5 hover:bg-[#A5EF1D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Connecting to Stripe...
                    </>
                  ) : (
                    <>
                      Upgrade to Pro
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              )}

              <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#85877B]">
                <ShieldCheck size={14} />
                Secure payment powered by Stripe
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-14 max-w-xl rounded-[28px] bg-white p-8 text-center">
            <p className="text-sm text-[#727467]">
              Your account role could not be identified. Please sign in again.
            </p>
            <Link href="/sign-in" className="mt-5 inline-block font-bold underline">
              Sign in
            </Link>
          </div>
        )}

        <p className="mt-10 text-center text-xs leading-6 text-[#85877B]">
          Prices are in USD. Payments are securely processed through Stripe.
        </p>
      </div>
    </main>
  );
}
