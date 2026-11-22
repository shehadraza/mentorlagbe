
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import AuthBackground from "@/components/auth/auth-background";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: normalizedEmail,
        password,
      });

      if (result.error) {
        setError(
          result.error.message || "Unable to sign in. Please try again.",
        );
        return;
      }

          const sessionResult = await authClient.getSession();
      const role = (
        sessionResult.data?.user as { role?: string } | undefined
      )?.role;

      const callbackURL = new URLSearchParams(
        window.location.search,
      ).get("callbackURL");

      const dashboardPath =
        role === "student"
          ? "/dashboard/student"
          : role === "tutor"
            ? "/dashboard/tutor"
            : role === "admin"
              ? "/dashboard/admin"
              : "/";

      const destination =
        callbackURL?.startsWith("/") ? callbackURL : dashboardPath;

      router.replace(destination);
      router.refresh();
    } catch {
      setError(
        "Something went wrong. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#EAECE5] px-5 py-28">
      <AuthBackground />

      <div className="container-main relative z-10 grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        {/* Left introduction */}
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B0B0C] text-[#B6FF2E]">
              <GraduationCap size={27} />
            </span>

            <span className="font-heading text-2xl font-bold tracking-[-1.3px] text-[#0B0B0C]">
              Mentor<span className="text-[#77776F]">Lagbe</span>
            </span>
          </Link>

          <div className="mt-20 max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] text-[#77776F]">
              <span className="h-2 w-2 rounded-full bg-[#B6FF2E]" />
              Your learning journey continues
            </span>

            <h1 className="mt-8 font-heading text-6xl font-bold leading-[1.08] tracking-[-3.5px] text-[#0B0B0C] xl:text-7xl">
              Good to see
              <br />
              you{" "}
              <span className="relative inline-block">
                again.
                <span className="absolute bottom-1 left-0 -z-10 h-4 w-full bg-[#B6FF2E]" />
              </span>
            </h1>

            <p className="mt-7 max-w-md text-base leading-8 text-[#77776F]">
              Pick up where you left off. Connect with great tutors,
              discover new opportunities, and keep moving forward.
            </p>

            <div className="mt-12 flex items-center gap-4 border-t border-black/10 pt-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#B6FF2E] text-[#0B0B0C]">
                <ShieldCheck size={23} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#0B0B0C]">
                  Your account, your journey
                </p>
                <p className="mt-1 text-xs text-[#77776F]">
                  Secure authentication powered by MentorLagbe
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Sign in form */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mx-auto w-full max-w-[470px]"
        >
          <div className="rounded-[28px] border border-black/[0.08] bg-white/85 p-7 shadow-[0_24px_80px_rgba(11,11,12,0.08)] backdrop-blur-xl sm:p-10">
            <Link
              href="/"
              className="mb-9 inline-flex items-center gap-2 text-xs font-semibold text-[#77776F] transition-colors hover:text-[#0B0B0C]"
            >
              <ArrowLeft size={15} />
              Back to home
            </Link>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#77776F]">
                Welcome back
              </p>

              <h2 className="mt-3 font-heading text-3xl font-bold tracking-[-1.5px] text-[#0B0B0C]">
                Sign in to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#77776F]">
                Enter your credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-9 space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-bold text-[#0B0B0C]"
                >
                  Email address
                </label>

                <div className="flex h-13 items-center gap-3 rounded-xl border border-black/10 bg-[#F3F2EE]/70 px-4 transition-all focus-within:border-[#0B0B0C]/50 focus-within:bg-white">
                  <Mail size={17} className="shrink-0 text-[#77776F]" />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={loading}
                    required
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#0B0B0C] outline-none placeholder:text-[#A3A39C] disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-bold text-[#0B0B0C]"
                  >
                    Password
                  </label>
                </div>

                <div className="flex h-13 items-center gap-3 rounded-xl border border-black/10 bg-[#F3F2EE]/70 px-4 transition-all focus-within:border-[#0B0B0C]/50 focus-within:bg-white">
                  <LockKeyhole
                    size={17}
                    className="shrink-0 text-[#77776F]"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={loading}
                    required
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#0B0B0C] outline-none placeholder:text-[#A3A39C] disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="shrink-0 text-[#77776F] transition-colors hover:text-[#0B0B0C]"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"
                    >
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-13 w-full items-center justify-center gap-3 rounded-xl border border-[#0B0B0C]/10 bg-[#B6FF2E] px-5 text-sm font-bold text-[#0B0B0C] shadow-[0_8px_22px_rgba(120,150,50,0.16)] transition-all duration-300 hover:bg-[#A7ED27] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing you in..." : "Sign In"}

                {!loading && (
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-black/[0.08] pt-7 text-center">
              <p className="text-sm text-[#77776F]">
                Don't have an account?{" "}
                <Link
                  href="/sign-up"
                  className="font-bold text-[#0B0B0C] underline decoration-[#B6FF2E] decoration-2 underline-offset-4 transition-colors hover:text-[#555]"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-[10px] font-medium tracking-wide text-[#77776F]">
            By continuing, you agree to use MentorLagbe responsibly.
          </p>
        </motion.section>
      </div>
    </div>
  );
}
