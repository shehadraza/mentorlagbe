
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
  UserRound,
  BookOpen,
  Mail,
  LockKeyhole,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import AuthBackground from "@/components/auth/auth-background";

type AccountRole = "student" | "tutor";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<AccountRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password || !confirmPassword) {
      setError("Please complete all required fields.");
      return;
    }

    if (normalizedName.length < 2) {
      setError("Your name must contain at least 2 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name: normalizedName,
        email: normalizedEmail,
        password,
        role,
      } as Parameters<typeof authClient.signUp.email>[0]);

      if (result.error) {
        setError(
          result.error.message ||
            "Unable to create your account. Please try again.",
        );
        return;
      }

      const sessionResult = await authClient.getSession();

const registeredRole = (
  sessionResult.data?.user as { role?: string } | undefined
)?.role;

const dashboardPath =
  registeredRole === "student"
    ? "/dashboard/student"
    : registeredRole === "tutor"
      ? "/dashboard/tutor"
      : "/";

if (dashboardPath === "/") {
  setError("Account created, but your account role could not be verified. Please sign in again.");
  return;
}

router.replace(dashboardPath);
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

      <div className="container-main relative z-10 grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1fr] lg:gap-20">
        {/* Introduction */}
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
              Start something meaningful
            </span>

            <h1 className="mt-8 font-heading text-6xl font-bold leading-[1.08] tracking-[-3.5px] text-[#0B0B0C] xl:text-7xl">
              Your next
              <br />
              chapter{" "}
              <span className="relative inline-block">
                starts here.
                <span className="absolute bottom-1 left-0 -z-10 h-4 w-full bg-[#B6FF2E]" />
              </span>
            </h1>

            <p className="mt-7 max-w-md text-base leading-8 text-[#77776F]">
              Whether you want to find the right tutor or share your
              knowledge, there is a place for you here.
            </p>

            <div className="mt-12 grid max-w-md grid-cols-2 gap-3">
              <div className="rounded-2xl border border-black/10 bg-white/65 p-5">
                <BookOpen size={21} className="text-[#0B0B0C]" />
                <p className="mt-5 text-sm font-bold text-[#0B0B0C]">
                  Learn with purpose
                </p>
                <p className="mt-2 text-xs leading-5 text-[#77776F]">
                  Discover tuition opportunities that match your goals.
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-[#B6FF2E] p-5">
                <GraduationCap size={21} className="text-[#0B0B0C]" />
                <p className="mt-5 text-sm font-bold text-[#0B0B0C]">
                  Teach with impact
                </p>
                <p className="mt-2 text-xs leading-5 text-[#0B0B0C]/65">
                  Connect with students and share what you know.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Registration form */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mx-auto w-full max-w-[490px]"
        >
          <div className="rounded-[28px] border border-black/[0.08] bg-white/85 p-7 shadow-[0_24px_80px_rgba(11,11,12,0.08)] backdrop-blur-xl sm:p-10">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-[#77776F] transition-colors hover:text-[#0B0B0C]"
            >
              <ArrowLeft size={15} />
              Back to home
            </Link>

            <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#77776F]">
              Join MentorLagbe
            </p>

            <h2 className="mt-3 font-heading text-3xl font-bold tracking-[-1.5px] text-[#0B0B0C]">
              Create your account
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#77776F]">
              A few details are all you need to get started.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Account role */}
              <div>
                <label className="mb-3 block text-xs font-bold text-[#0B0B0C]">
                  I want to join as
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    disabled={loading}
                    aria-pressed={role === "student"}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      role === "student"
                        ? "border-[#0B0B0C] bg-[#B6FF2E]/35 ring-1 ring-[#0B0B0C]"
                        : "border-black/10 bg-[#F3F2EE]/60 hover:border-black/30"
                    }`}
                  >
                    <UserRound size={20} className="text-[#0B0B0C]" />
                    <span className="mt-3 block text-sm font-bold text-[#0B0B0C]">
                      Student
                    </span>
                    <span className="mt-1 block text-[10px] text-[#77776F]">
                      Find a tutor
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("tutor")}
                    disabled={loading}
                    aria-pressed={role === "tutor"}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      role === "tutor"
                        ? "border-[#0B0B0C] bg-[#B6FF2E]/35 ring-1 ring-[#0B0B0C]"
                        : "border-black/10 bg-[#F3F2EE]/60 hover:border-black/30"
                    }`}
                  >
                    <GraduationCap size={20} className="text-[#0B0B0C]" />
                    <span className="mt-3 block text-sm font-bold text-[#0B0B0C]">
                      Tutor
                    </span>
                    <span className="mt-1 block text-[10px] text-[#77776F]">
                      Teach students
                    </span>
                  </button>
                </div>
              </div>

              {/* Full name */}
              <div>
                <label
                  htmlFor="full-name"
                  className="mb-2 block text-xs font-bold text-[#0B0B0C]"
                >
                  Full name
                </label>

                <div className="flex h-13 items-center gap-3 rounded-xl border border-black/10 bg-[#F3F2EE]/70 px-4 transition-all focus-within:border-black/50 focus-within:bg-white">
                  <UserRound size={17} className="shrink-0 text-[#77776F]" />

                  <input
                    id="full-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={loading}
                    required
                    minLength={2}
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#0B0B0C] outline-none placeholder:text-[#A3A39C]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="signup-email"
                  className="mb-2 block text-xs font-bold text-[#0B0B0C]"
                >
                  Email address
                </label>

                <div className="flex h-13 items-center gap-3 rounded-xl border border-black/10 bg-[#F3F2EE]/70 px-4 transition-all focus-within:border-black/50 focus-within:bg-white">
                  <Mail size={17} className="shrink-0 text-[#77776F]" />

                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={loading}
                    required
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#0B0B0C] outline-none placeholder:text-[#A3A39C]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="signup-password"
                  className="mb-2 block text-xs font-bold text-[#0B0B0C]"
                >
                  Password
                </label>

                <div className="flex h-13 items-center gap-3 rounded-xl border border-black/10 bg-[#F3F2EE]/70 px-4 transition-all focus-within:border-black/50 focus-within:bg-white">
                  <LockKeyhole size={17} className="shrink-0 text-[#77776F]" />

                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={loading}
                    required
                    minLength={8}
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#0B0B0C] outline-none placeholder:text-[#A3A39C]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="shrink-0 text-[#77776F] hover:text-[#0B0B0C]"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-xs font-bold text-[#0B0B0C]"
                >
                  Confirm password
                </label>

                <div className="flex h-13 items-center gap-3 rounded-xl border border-black/10 bg-[#F3F2EE]/70 px-4 transition-all focus-within:border-black/50 focus-within:bg-white">
                  <LockKeyhole size={17} className="shrink-0 text-[#77776F]" />

                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter your password again"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={loading}
                    required
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#0B0B0C] outline-none placeholder:text-[#A3A39C]"
                  />
                </div>
              </div>

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

              <button
                type="submit"
                disabled={loading}
                className="group flex h-13 w-full items-center justify-center gap-3 rounded-xl border border-[#0B0B0C]/10 bg-[#B6FF2E] px-5 text-sm font-bold text-[#0B0B0C] shadow-[0_8px_22px_rgba(120,150,50,0.16)] transition-all duration-300 hover:bg-[#A7ED27] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating your account..." : "Create Account"}

                {!loading && (
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            <div className="mt-7 border-t border-black/[0.08] pt-6 text-center">
              <p className="text-sm text-[#77776F]">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-bold text-[#0B0B0C] underline decoration-[#B6FF2E] decoration-2 underline-offset-4 hover:text-[#555]"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
