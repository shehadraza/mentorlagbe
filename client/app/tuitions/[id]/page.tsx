
"use client";
import { Suspense, useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  IndianRupee,
  MapPin,
  Monitor,
  Phone,
  Send,
  ShieldCheck,
  UserRound,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type MentorUser = {
  name: string;
  email: string;
  role?: "student" | "tutor" | "admin";
};

type Tuition = {
  _id?: string;
  id?: string;
  title?: string;
  subject?: string;
  classLevel?: string;
  mode?: string;
  location?: string;
  monthlyFee?: number | string;
  daysPerWeek?: number;
  bannerImage?: string;
  description?: string;
  tutorName?: string;
  createdAt?: string;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const subjectImages: Record<string, string> = {
  mathematics:
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=85",
  science:
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&q=85",
  english:
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=85",
  physics:
    "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=1200&q=85",
  chemistry:
    "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=1200&q=85",
  biology:
    "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200&q=85",
};

function getBanner(subject?: string) {
  const key = subject?.toLowerCase() || "";
  return (
    subjectImages[key] ||
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=85"
  );
}

function formatFee(fee?: number | string) {
  const amount = Number(fee);
  if (!Number.isFinite(amount)) return "Negotiable";

  return `৳${amount.toLocaleString("en-BD")}`;
}

function TuitionDetailsContent() {
  const params = useParams<{ id: string }>();
  const tuitionId = params.id;

  const { data: session, isPending: sessionPending } =
    authClient.useSession();

  const user = session?.user as MentorUser | undefined;

  const [tuition, setTuition] = useState<Tuition | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [studentPhone, setStudentPhone] = useState("");
  const [preferredSchedule, setPreferredSchedule] = useState("");
  const [studentNote, setStudentNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  const loadTuition = useCallback(
    async (signal?: AbortSignal) => {
      if (!tuitionId) return;

      setLoading(true);
      setLoadError("");

      try {
        const response = await fetch(
          `${API_URL}/api/tuitions/${encodeURIComponent(tuitionId)}`,
          {
            method: "GET",
            cache: "no-store",
            signal,
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success || !result.tuition) {
          throw new Error(
            result.message || "This tuition could not be found."
          );
        }

        setTuition(result.tuition);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;

        setLoadError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading this tuition."
        );
        setTuition(null);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [tuitionId]
  );

  useEffect(() => {
    const controller = new AbortController();

    loadTuition(controller.signal);

    return () => controller.abort();
  }, [loadTuition]);

  async function handleApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || user.role !== "student") {
      setApplicationMessage("Only student accounts can apply.");
      return;
    }

    setSubmitting(true);
    setApplicationMessage("");

    try {
      const response = await fetch(`${API_URL}/api/applications`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tuitionId,
          studentPhone: studentPhone.trim(),
          preferredSchedule: preferredSchedule.trim(),
          studentNote: studentNote.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(
            "You have already applied for this tuition."
          );
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Your session may have expired. Please sign in again."
          );
        }

        throw new Error(
          result.message || "Your application could not be submitted."
        );
      }

      setApplicationSuccess(true);
      setApplicationMessage(
        result.message || "Your application has been submitted successfully."
      );
    } catch (error) {
      setApplicationSuccess(false);
      setApplicationMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F3F2EE] px-5 pb-20 pt-32 text-[#0B0B0C]">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-8 h-5 w-36 rounded-full bg-black/10" />
          <div className="h-[360px] rounded-[28px] bg-black/10 md:h-[460px]" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <div className="h-9 w-2/3 rounded-lg bg-black/10" />
              <div className="h-5 w-1/2 rounded-lg bg-black/10" />
              <div className="h-32 rounded-2xl bg-black/10" />
            </div>
            <div className="h-72 rounded-2xl bg-black/10" />
          </div>
        </div>
      </main>
    );
  }

  if (loadError || !tuition) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-[#F3F2EE] px-5 pt-24 text-[#0B0B0C]">
        <div className="w-full max-w-lg rounded-[28px] border border-black/10 bg-white p-9 text-center shadow-xl shadow-black/5">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <XCircle size={30} />
          </div>
          <h1 className="text-2xl font-bold">Tuition unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-black/55">
            {loadError || "We couldn't find this tuition listing."}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => loadTuition()}
              className="rounded-full bg-[#0B0B0C] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#B6FF2E] hover:text-black"
            >
              Try again
            </button>
            <Link
              href="/tuitions"
              className="rounded-full border border-black/15 px-6 py-3 text-sm font-semibold transition hover:bg-black/5"
            >
              Browse Tuitions
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isStudent = user?.role === "student";
  const isGuest = !user;
  const banner = tuition.bannerImage || getBanner(tuition.subject);

  const signInUrl = `/sign-in?callbackURL=${encodeURIComponent(
    `/tuitions/${tuitionId}`
  )}`;

  return (
    <main className="min-h-screen bg-[#F3F2EE] pb-24 pt-28 text-[#0B0B0C]">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Link
          href="/tuitions"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-black/55 transition hover:text-black"
        >
          <ArrowLeft size={17} />
          Back to Browse Tuitions
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative isolate flex min-h-[330px] items-end overflow-hidden rounded-[28px] bg-[#0B0B0C] p-7 text-white sm:min-h-[400px] sm:p-10 lg:min-h-[460px] lg:p-14"
        >
          <div
            className="absolute inset-0 -z-20 bg-cover bg-center"
            style={{ backgroundImage: `url("${banner}")` }}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/65 to-black/10" />

          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#B6FF2E] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black">
                {tuition.subject || "Tuition"}
              </span>
              <span className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-md">
                {tuition.mode || "Flexible"} Learning
              </span>
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {tuition.title || "Tuition Opportunity"}
            </h1>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75">
              <span className="inline-flex items-center gap-2">
                <GraduationCap size={17} />
                {tuition.classLevel || "Class not specified"}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={17} />
                {tuition.location || "Location not specified"}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={17} />
                {tuition.daysPerWeek || "Flexible"} days/week
              </span>
            </div>
          </div>
        </motion.section>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-8">
            <section className="rounded-[24px] border border-black/10 bg-white p-6 sm:p-9">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">
                    About this opportunity
                  </p>
                  <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                    Tuition overview
                  </h2>
                </div>
                <div className="rounded-2xl bg-[#B6FF2E]/30 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-black/50">
                    Monthly fee
                  </p>
                  <p className="mt-1 text-xl font-extrabold">
                    {formatFee(tuition.monthlyFee)}
                  </p>
                </div>
              </div>

              <p className="mt-7 whitespace-pre-line text-[15px] leading-8 text-black/65">
                {tuition.description ||
                  "No additional description has been provided for this tuition yet."}
              </p>
            </section>

            <section className="rounded-[24px] border border-black/10 bg-white p-6 sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">
                Learning details
              </p>
              <h2 className="mt-3 text-2xl font-bold">What you need to know</h2>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<BookOpen size={19} />}
                  label="Subject"
                  value={tuition.subject || "Not specified"}
                />
                <DetailItem
                  icon={<GraduationCap size={19} />}
                  label="Class level"
                  value={tuition.classLevel || "Not specified"}
                />
                <DetailItem
                  icon={<Monitor size={19} />}
                  label="Learning mode"
                  value={tuition.mode || "Not specified"}
                />
                <DetailItem
                  icon={<MapPin size={19} />}
                  label="Location"
                  value={tuition.location || "Not specified"}
                />
                <DetailItem
                  icon={<CalendarDays size={19} />}
                  label="Days per week"
                  value={
                    tuition.daysPerWeek
                      ? `${tuition.daysPerWeek} days`
                      : "Flexible"
                  }
                />
                <DetailItem
                  icon={<Wallet size={19} />}
                  label="Monthly fee"
                  value={formatFee(tuition.monthlyFee)}
                />
              </div>
            </section>

            <section className="rounded-[24px] border border-black/10 bg-white p-6 sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">
                Your potential mentor
              </p>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#B6FF2E]/40">
                  <UserRound size={26} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {tuition.tutorName || "Verified Tutor"}
                  </h2>
                  <p className="mt-1 text-sm text-black/50">
                    Tuition provider
                  </p>
                </div>
                <div className="ml-auto hidden items-center gap-1 rounded-full bg-[#F3F2EE] px-3 py-2 text-xs font-semibold sm:flex">
                  <ShieldCheck size={15} />
                  Platform listing
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-black/55">
                Apply for this tuition to express your interest. The tutor can
                review your application and respond through the platform.
              </p>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28">
            <section className="overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-xl shadow-black/5">
              <div className="bg-[#0B0B0C] p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
                  Investment in learning
                </p>
                <p className="mt-3 text-4xl font-extrabold tracking-tight">
                  {formatFee(tuition.monthlyFee)}
                </p>
                <p className="mt-1 text-sm text-white/50">per month</p>
              </div>

              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black/50">Learning mode</span>
                  <span className="font-semibold capitalize">
                    {tuition.mode || "Flexible"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black/50">Days per week</span>
                  <span className="font-semibold">
                    {tuition.daysPerWeek || "Flexible"}
                  </span>
                </div>

                <div className="my-2 border-t border-black/10" />

                {sessionPending ? (
                  <div className="h-12 animate-pulse rounded-full bg-black/10" />
                ) : isGuest ? (
                  <div>
                    <p className="mb-4 text-sm leading-6 text-black/55">
                      Sign in with a student account to apply for this tuition.
                    </p>
                    <Link
                      href={signInUrl}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#B6FF2E] px-5 py-4 text-sm font-bold text-black transition hover:bg-black hover:text-white"
                    >
                      Sign In to Apply
                      <ArrowRight size={17} />
                    </Link>
                    <p className="mt-3 text-center text-xs text-black/40">
                      New here?{" "}
                      <Link
                        href="/sign-up"
                        className="font-bold text-black underline underline-offset-2"
                      >
                        Create an account
                      </Link>
                    </p>
                  </div>
                ) : isStudent ? (
                  applicationSuccess ? (
                    <div className="rounded-2xl bg-[#B6FF2E]/20 p-5">
                      <CheckCircle2 size={28} className="text-green-700" />
                      <h3 className="mt-3 font-bold">Application submitted</h3>
                      <p className="mt-2 text-sm leading-6 text-black/60">
                        {applicationMessage}
                      </p>
                      <Link
                        href="/dashboard/student"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4"
                      >
                        Go to dashboard
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-bold">Apply for this tuition</h3>
                      <p className="mt-2 text-sm leading-6 text-black/50">
                        Share your contact details and preferred schedule.
                      </p>

                      <form
                        onSubmit={handleApplication}
                        className="mt-5 space-y-4"
                      >
                        <div>
                          <label
                            htmlFor="studentPhone"
                            className="mb-2 block text-xs font-bold"
                          >
                            Phone number
                          </label>
                          <div className="relative">
                            <Phone
                              size={16}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
                            />
                            <input
                              id="studentPhone"
                              type="tel"
                              maxLength={30}
                              value={studentPhone}
                              onChange={(event) =>
                                setStudentPhone(event.target.value)
                              }
                              placeholder="Your contact number"
                              className="w-full rounded-xl border border-black/10 bg-[#F3F2EE]/60 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-black"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="preferredSchedule"
                            className="mb-2 block text-xs font-bold"
                          >
                            Preferred schedule
                          </label>
                          <div className="relative">
                            <Clock3
                              size={16}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
                            />
                            <input
                              id="preferredSchedule"
                              type="text"
                              maxLength={300}
                              value={preferredSchedule}
                              onChange={(event) =>
                                setPreferredSchedule(event.target.value)
                              }
                              placeholder="e.g. Evening, 5 PM – 7 PM"
                              className="w-full rounded-xl border border-black/10 bg-[#F3F2EE]/60 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-black"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="studentNote"
                            className="mb-2 block text-xs font-bold"
                          >
                            Learning note
                          </label>
                          <textarea
                            id="studentNote"
                            rows={4}
                            maxLength={2000}
                            value={studentNote}
                            onChange={(event) =>
                              setStudentNote(event.target.value)
                            }
                            placeholder="Tell the tutor about your learning goals..."
                            className="w-full resize-y rounded-xl border border-black/10 bg-[#F3F2EE]/60 p-4 text-sm outline-none transition focus:border-black"
                          />
                        </div>

                        {applicationMessage && (
                          <p
                            role="alert"
                            className="rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700"
                          >
                            {applicationMessage}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#B6FF2E] px-5 py-4 text-sm font-bold text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {submitting ? (
                            "Submitting..."
                          ) : (
                            <>
                              Submit Application
                              <Send size={16} />
                            </>
                          )}
                        </button>
                      </form>
                      <p className="mt-4 text-center text-xs leading-5 text-black/40">
                        Your application will be submitted with pending status.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="rounded-2xl bg-[#F3F2EE] p-5">
                    <Users size={25} />
                    <h3 className="mt-3 font-bold">
                      Applications are for students
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-black/55">
                      You are signed in as a {user?.role || "platform user"}.
                      Only student accounts can apply for tuition listings.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <div className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white/70 p-4">
              <ShieldCheck size={19} className="mt-0.5 shrink-0" />
              <p className="text-xs leading-5 text-black/50">
                Applications are reviewed by tutors. Never share your account
                password or sensitive information with anyone.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-[#F3F2EE] p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-black/45">{label}</p>
        <p className="mt-1 break-words text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}
export default function TuitionDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F3F2EE] px-5 pt-32">
          <div className="mx-auto max-w-7xl animate-pulse">
            <div className="h-5 w-36 rounded-full bg-black/10" />
            <div className="mt-8 h-[360px] rounded-[28px] bg-black/10" />
          </div>
        </main>
      }
    >
      <TuitionDetailsContent />
    </Suspense>
  );
}