"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  ImagePlus,
  Info,
  MapPin,
  Monitor,
  Send,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const initialForm = {
  title: "",
  subject: "",
  classLevel: "",
  mode: "online" as "online" | "offline",
  location: "",
  monthlyFee: "",
  daysPerWeek: "3",
  bannerImage: "",
  description: "",
};

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Bangla",
  "ICT",
  "Accounting",
  "Finance",
  "Economics",
  "General Science",
  "Other",
];

const classLevels = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "SSC",
  "Class 11",
  "Class 12",
  "HSC",
  "Admission",
  "University",
  "Other",
];

type FormFieldProps = {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
};

const inputClass =
  "w-full rounded-xl border border-[#deddd5] bg-[#faf9f6] px-4 py-3.5 text-[12px] font-medium text-[#0B0B0C] outline-none transition duration-200 placeholder:text-[#a3a198] hover:border-[#b8b6aa] focus:border-[#0B0B0C] focus:bg-white focus:ring-4 focus:ring-[#B6FF2E]/20";

function FormField({
  label,
  required = false,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-bold tracking-wide text-[#292923]">
        {label}
        {required && <span className="ml-1 text-[#829d25]">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-[10px] leading-5 text-[#858379]">{hint}</p>
      )}
    </div>
  );
}

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7 flex items-start gap-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#dcdacf] bg-[#f3f2ee] text-[11px] font-black text-[#0B0B0C]">
        {number}
      </div>
      <div>
        <h2 className="text-[15px] font-extrabold tracking-tight text-[#0B0B0C]">
          {title}
        </h2>
        <p className="mt-1 text-[10px] leading-5 text-[#858379]">
          {description}
        </p>
      </div>
    </div>
  );
}

function LearningVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto flex h-[245px] w-full max-w-[360px] items-center justify-center sm:h-[290px]">
      <motion.div
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        className="absolute h-[210px] w-[210px] rounded-full border border-dashed border-[#c9c7ba] sm:h-[250px] sm:w-[250px]"
      />
      <motion.div
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        className="absolute h-[160px] w-[160px] rounded-full border border-[#d9d7cb] sm:h-[195px] sm:w-[195px]"
      />

      <div className="absolute h-36 w-36 rounded-full bg-[#B6FF2E]/30 blur-[55px] sm:h-48 sm:w-48" />

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { y: [0, -12, 0], rotate: [-3, 1, -3] }
        }
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10"
        style={{ perspective: "700px" }}
      >
        <div
          className="relative flex h-[112px] w-[190px] items-center justify-center sm:h-[135px] sm:w-[230px]"
          style={{
            transform: "rotateX(16deg) rotateZ(-8deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className="absolute left-0 top-0 h-full w-1/2 border-r border-[#d5d3c7] bg-[#fffefa] shadow-[-8px_12px_15px_rgba(0,0,0,0.10)]"
            style={{ transform: "rotateY(12deg)", transformOrigin: "right" }}
          >
            <div className="space-y-3 px-4 pt-6 sm:px-5 sm:pt-7">
              <div className="h-1 w-12 bg-[#0B0B0C]/75 sm:w-16" />
              <div className="h-1 w-16 bg-[#d9d7cc] sm:w-20" />
              <div className="h-1 w-11 bg-[#d9d7cc] sm:w-14" />
              <div className="mt-3 h-5 w-5 border-2 border-[#B6FF2E] sm:h-7 sm:w-7" />
            </div>
          </div>

          <div
            className="absolute right-0 top-0 h-full w-1/2 border-l border-[#d5d3c7] bg-[#f7f6f0] shadow-[8px_12px_15px_rgba(0,0,0,0.10)]"
            style={{ transform: "rotateY(-12deg)", transformOrigin: "left" }}
          >
            <div className="space-y-3 px-4 pt-6 sm:px-5 sm:pt-7">
              <div className="h-1 w-14 bg-[#0B0B0C]/75 sm:w-16" />
              <div className="h-1 w-11 bg-[#d9d7cc] sm:w-14" />
              <div className="h-1 w-16 bg-[#d9d7cc] sm:w-20" />
              <div className="mt-3 flex gap-1">
                <div className="h-5 w-5 bg-[#B6FF2E] sm:h-7 sm:w-7" />
                <div className="h-5 w-5 border border-[#d5d3c7] sm:h-7 sm:w-7" />
              </div>
            </div>
          </div>

          <div className="absolute left-1/2 top-0 h-full w-[5px] -translate-x-1/2 bg-[#c9c6b8] shadow-md" />
          <div className="absolute -bottom-2 left-2 right-2 h-2 rounded-b-sm bg-[#d6d3c5]" />
        </div>
      </motion.div>

      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -9, 0], rotate: [0, 7, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[8%] top-[12%] flex h-12 w-12 items-center justify-center border border-[#d9d7cb] bg-white text-[#0B0B0C] shadow-lg sm:right-[10%] sm:h-14 sm:w-14"
      >
        <GraduationCap size={26} strokeWidth={1.5} />
      </motion.div>

      <motion.div
        animate={reduceMotion ? undefined : { y: [0, 8, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[12%] left-[7%] flex h-11 w-11 items-center justify-center border border-[#d9d7cb] bg-[#B6FF2E] text-[#0B0B0C] shadow-lg"
      >
        <BookOpen size={21} />
      </motion.div>

      <motion.div
        animate={reduceMotion ? undefined : { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.8, repeat: Infinity }}
        className="absolute left-[18%] top-[20%] text-[#829d25]"
      >
        <Sparkles size={19} />
      </motion.div>

      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity }}
        className="absolute bottom-[15%] right-[8%] border border-[#deddd5] bg-white px-3 py-2 shadow-md"
      >
        <p className="text-[8px] font-bold uppercase tracking-[1.5px] text-[#858379]">
          Your next chapter
        </p>
        <p className="mt-1 text-[11px] font-black text-[#0B0B0C]">
          Starts here.
        </p>
      </motion.div>
    </div>
  );
}

function SuccessScreen({
  onCreateAnother,
  onViewTuitions,
}: {
  onCreateAnother: () => void;
  onViewTuitions: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-[850px] items-center justify-center">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full overflow-hidden border border-[#deddd5] bg-white px-6 py-12 text-center sm:px-12"
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#B6FF2E]/25 blur-[65px]" />

        <div className="relative mx-auto flex h-20 w-20 items-center justify-center border border-[#dce7bb] bg-[#f4f8e9] text-[#526c17]">
          <CheckCircle2 size={38} strokeWidth={1.6} />
        </div>

        <div className="relative mt-7 inline-flex items-center gap-2 border border-[#dfe5ce] bg-[#f5f8eb] px-3 py-2 text-[9px] font-bold uppercase tracking-[1.8px] text-[#617b23]">
          <Sparkles size={13} />
          Submission successful
        </div>

        <h1 className="relative mt-5 text-3xl font-black tracking-[-1.5px] text-[#0B0B0C] sm:text-4xl">
          Your tuition is on its way.
        </h1>

        <p className="relative mx-auto mt-4 max-w-md text-[12px] leading-7 text-[#77766f]">
          Your tuition post has been submitted successfully. It is now waiting
          for admin approval. Once approved, learners will be able to discover
          your opportunity.
        </p>

        <div className="relative mx-auto mt-7 flex max-w-sm items-center gap-3 border border-amber-200 bg-amber-50 p-4 text-left">
          <Clock3 className="shrink-0 text-amber-600" size={21} />
          <div>
            <p className="text-[11px] font-bold text-amber-800">
              Pending admin approval
            </p>
            <p className="mt-1 text-[10px] leading-5 text-amber-700/80">
              Your post will become visible after approval.
            </p>
          </div>
        </div>

        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onViewTuitions}
            className="inline-flex items-center gap-2 bg-[#0B0B0C] px-5 py-3.5 text-[11px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#30302b]"
          >
            View my tuitions
            <ArrowRight size={14} />
          </button>

          <button
            type="button"
            onClick={onCreateAnother}
            className="border border-[#deddd5] bg-white px-5 py-3.5 text-[11px] font-bold text-[#0B0B0C] transition hover:border-[#0B0B0C] hover:bg-[#f3f2ee]"
          >
            Create another
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function PostTuitionPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) return;

    setError("");

    const title = form.title.trim();
    const subject = form.subject.trim();
    const classLevel = form.classLevel.trim();
    const location = form.location.trim();
    const description = form.description.trim();
    const monthlyFee = Number(form.monthlyFee);
    const daysPerWeek = Number(form.daysPerWeek);

    if (!title || !subject || !classLevel || !location || !description) {
      setError("Please complete all required fields.");
      return;
    }

    if (title.length > 150) {
      setError("Tuition title cannot exceed 150 characters.");
      return;
    }

    if (description.length > 5000) {
      setError("Description cannot exceed 5000 characters.");
      return;
    }

    if (!Number.isFinite(monthlyFee) || monthlyFee <= 0) {
      setError("Please enter a valid monthly fee.");
      return;
    }

    if (!Number.isInteger(daysPerWeek) || daysPerWeek < 1 || daysPerWeek > 7) {
      setError("Days per week must be between 1 and 7.");
      return;
    }

    if (form.bannerImage.trim()) {
      try {
        const parsedUrl = new URL(form.bannerImage.trim());

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          setError("Banner image must use a valid HTTP or HTTPS URL.");
          return;
        }
      } catch {
        setError("Please enter a valid banner image URL.");
        return;
      }
    }

    try {
      setSubmitting(true);

      const { data: tokenData, error: tokenError } = await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const response = await fetch(`${API_URL}/api/tuitions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          title,
          subject,
          classLevel,
          mode: form.mode,
          location,
          monthlyFee,
          daysPerWeek,
          bannerImage: form.bannerImage.trim(),
          description,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Could not submit your tuition post."
        );
      }

      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <SuccessScreen
        onCreateAnother={() => setSuccess(false)}
        onViewTuitions={() => router.push("/dashboard/tutor/my-tuitions")}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-8 pb-6">
      {/* EDITORIAL HERO — intentionally not a card */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative isolate overflow-hidden border-b border-[#deddd5] pb-8 pt-2 sm:pb-10"
      >
        <div className="pointer-events-none absolute -right-10 top-0 -z-10 h-64 w-64 rounded-full bg-[#B6FF2E]/15 blur-[75px]" />

        <div className="mb-7">
          <Link
            href="/dashboard/tutor"
            className="group inline-flex items-center gap-2 text-[10px] font-bold text-[#77766f] transition hover:text-[#0B0B0C]"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to dashboard
          </Link>
        </div>

        <div className="grid items-center gap-4 md:grid-cols-[1fr_0.9fr]">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 border border-[#deddd5] bg-white/70 px-3 py-2 text-[9px] font-bold uppercase tracking-[1.8px] text-[#55544d]">
              <span className="h-2 w-2 bg-[#B6FF2E]" />
              Create an opportunity
            </div>

            <h1 className="mt-6 max-w-[620px] text-[38px] font-black leading-[1.04] tracking-[-2px] text-[#0B0B0C] sm:text-[54px] lg:text-[62px]">
              Great learning
              <br />
              starts with a
              <br />
              <span className="relative inline-block">
                great match.
                <span className="absolute bottom-1 left-0 -z-10 h-[13px] w-full bg-[#B6FF2E] sm:h-[17px]" />
              </span>
            </h1>

            <p className="mt-5 max-w-[460px] text-[11px] leading-7 text-[#77766f] sm:text-[12px]">
              Share your teaching opportunity with learners. Add clear
              information about your subject, schedule and expectations to
              help the right student find you.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-[9px] font-bold uppercase tracking-[1.3px] text-[#77766f]">
              <span className="flex items-center gap-2">
                <BookOpen size={14} />
                Your expertise
              </span>
              <span className="h-1 w-1 bg-[#B6FF2E]" />
              <span className="flex items-center gap-2">
                <GraduationCap size={15} />
                Their next step
              </span>
            </div>
          </div>

          <div className="relative -my-2">
            <LearningVisual />
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <div className="h-[3px] w-12 bg-[#B6FF2E]" />
          <p className="text-[9px] font-bold uppercase tracking-[2px] text-[#858379]">
            Teach. Inspire. Make a difference.
          </p>
        </div>
      </motion.section>

      {/* FORM AND SIDEBAR */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <motion.form
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          onSubmit={handleSubmit}
          className="min-w-0 space-y-5"
        >
          {/* BASIC INFORMATION */}
          <section className="rounded-2xl border border-[#deddd5] bg-white p-5 shadow-[0_8px_30px_rgba(11,11,12,0.025)] sm:p-7">
            <SectionHeading
              number="01"
              title="Basic information"
              description="Start with the essential details of your tuition."
            />

            <div className="space-y-5">
              <FormField label="Tuition title" required>
                <input
                  type="text"
                  maxLength={150}
                  required
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="e.g. Experienced Physics Tutor for HSC Student"
                  className={inputClass}
                />
                <p className="text-right text-[9px] text-[#929085]">
                  {form.title.length}/150 characters
                </p>
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Subject" required>
                  <select
                    required
                    value={form.subject}
                    onChange={(event) =>
                      updateField("subject", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Class / Level" required>
                  <select
                    required
                    value={form.classLevel}
                    onChange={(event) =>
                      updateField("classLevel", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select class or level</option>
                    {classLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="Tuition description" required>
                <textarea
                  required
                  rows={6}
                  maxLength={5000}
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Describe your teaching experience, lesson approach, what the student will learn and any other important details..."
                  className={`${inputClass} min-h-[150px] resize-y leading-6`}
                />
                <p className="text-right text-[9px] text-[#929085]">
                  {form.description.length}/5000 characters
                </p>
              </FormField>
            </div>
          </section>

          {/* TEACHING ARRANGEMENT */}
          <section className="rounded-2xl border border-[#deddd5] bg-white p-5 shadow-[0_8px_30px_rgba(11,11,12,0.025)] sm:p-7">
            <SectionHeading
              number="02"
              title="Teaching arrangement"
              description="Choose how and where your lessons will take place."
            />

            <FormField label="Teaching mode" required>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateField("mode", "online")}
                  aria-pressed={form.mode === "online"}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                    form.mode === "online"
                      ? "border-[#0B0B0C] bg-[#f3f2ee] ring-2 ring-[#B6FF2E]/40"
                      : "border-[#deddd5] bg-[#faf9f6] hover:border-[#aaa89d]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center ${
                      form.mode === "online"
                        ? "bg-[#B6FF2E] text-[#0B0B0C]"
                        : "bg-[#efeee8] text-[#77766f]"
                    }`}
                  >
                    <Monitor size={19} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#0B0B0C]">
                      Online
                    </p>
                    <p className="mt-1 text-[9px] text-[#858379]">
                      Remote lessons
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => updateField("mode", "offline")}
                  aria-pressed={form.mode === "offline"}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                    form.mode === "offline"
                      ? "border-[#0B0B0C] bg-[#f3f2ee] ring-2 ring-[#B6FF2E]/40"
                      : "border-[#deddd5] bg-[#faf9f6] hover:border-[#aaa89d]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center ${
                      form.mode === "offline"
                        ? "bg-[#B6FF2E] text-[#0B0B0C]"
                        : "bg-[#efeee8] text-[#77766f]"
                    }`}
                  >
                    <MapPin size={19} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#0B0B0C]">
                      Offline
                    </p>
                    <p className="mt-1 text-[9px] text-[#858379]">
                      In-person lessons
                    </p>
                  </div>
                </button>
              </div>
            </FormField>

            <div className="mt-5">
              <FormField
                label="Location"
                required
                hint={
                  form.mode === "online"
                    ? "Enter your city or preferred location."
                    : "Enter the area where you can provide in-person tuition."
                }
              >
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#858379]"
                  />
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(event) =>
                      updateField("location", event.target.value)
                    }
                    placeholder={
                      form.mode === "online"
                        ? "e.g. Dhaka, Bangladesh"
                        : "e.g. Dhanmondi, Dhaka"
                    }
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </FormField>
            </div>
          </section>

          {/* SCHEDULE AND FEE */}
          <section className="rounded-2xl border border-[#deddd5] bg-white p-5 shadow-[0_8px_30px_rgba(11,11,12,0.025)] sm:p-7">
            <SectionHeading
              number="03"
              title="Schedule & compensation"
              description="Set your weekly schedule and expected monthly fee."
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Monthly fee (BDT)"
                required
                hint="Enter the expected monthly tuition fee."
              >
                <div className="relative">
                  <Wallet
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#858379]"
                  />
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={form.monthlyFee}
                    onChange={(event) =>
                      updateField("monthlyFee", event.target.value)
                    }
                    placeholder="e.g. 5000"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </FormField>

              <FormField
                label="Days per week"
                required
                hint="Choose how many days you will teach."
              >
                <div className="relative">
                  <CalendarDays
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#858379]"
                  />
                  <select
                    required
                    value={form.daysPerWeek}
                    onChange={(event) =>
                      updateField("daysPerWeek", event.target.value)
                    }
                    className={`${inputClass} pl-11`}
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <option key={day} value={day}>
                        {day} {day === 1 ? "day" : "days"} per week
                      </option>
                    ))}
                  </select>
                </div>
              </FormField>
            </div>
          </section>

          {/* OPTIONAL IMAGE */}
          <section className="rounded-2xl border border-[#deddd5] bg-white p-5 shadow-[0_8px_30px_rgba(11,11,12,0.025)] sm:p-7">
            <SectionHeading
              number="04"
              title="Visual presentation"
              description="Optionally add a banner image to make your post more attractive."
            />

            <FormField
              label="Banner image URL"
              hint="Use a publicly accessible HTTP or HTTPS image URL. You can leave this field empty."
            >
              <div className="relative">
                <ImagePlus
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#858379]"
                />
                <input
                  type="url"
                  maxLength={2000}
                  value={form.bannerImage}
                  onChange={(event) =>
                    updateField("bannerImage", event.target.value)
                  }
                  placeholder="https://example.com/your-image.jpg"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </FormField>
          </section>

          {/* ERROR MESSAGE */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800"
            >
              <Info size={17} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-[11px] font-bold">
                  Unable to submit tuition
                </p>
                <p className="mt-1 text-[10px] leading-5">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-rose-500 transition hover:text-rose-800"
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}

          {/* SUBMIT */}
          <div className="flex flex-col gap-4 rounded-2xl border border-[#deddd5] bg-white p-5 shadow-[0_8px_30px_rgba(11,11,12,0.025)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-[11px] font-extrabold text-[#0B0B0C]">
                Ready to publish your opportunity?
              </p>
              <p className="mt-1 text-[10px] leading-5 text-[#858379]">
                Your post will be submitted for admin approval.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 bg-[#B6FF2E] px-6 py-3.5 text-[11px] font-extrabold text-[#0B0B0C] transition hover:-translate-y-0.5 hover:bg-[#c7ff62] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0B0B0C]/30 border-t-[#0B0B0C]" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Submit tuition post
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* SIDEBAR */}
        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-5 lg:sticky lg:top-6"
        >
          {/* POSTING GUIDE */}
          <div className="relative isolate overflow-hidden rounded-2xl bg-[#0B0B0C] p-6 text-white">
            <div className="pointer-events-none absolute -right-12 -top-12 -z-10 h-44 w-44 rounded-full bg-[#B6FF2E]/20 blur-[55px]" />

            <div className="flex items-center gap-2 text-[#B6FF2E]">
              <Sparkles size={16} />
              <span className="text-[9px] font-extrabold uppercase tracking-[2px]">
                Posting guide
              </span>
            </div>

            <h3 className="mt-4 text-xl font-black leading-snug">
              Make your
              <br />
              tuition stand out.
            </h3>

            <p className="mt-2 text-[10px] leading-6 text-white/55">
              A thoughtful post helps the right learners understand your
              teaching opportunity.
            </p>

            <div className="mt-7 space-y-5">
              {[
                {
                  icon: BookOpen,
                  title: "Clear title",
                  text: "Mention the subject and class level.",
                },
                {
                  icon: GraduationCap,
                  title: "Useful description",
                  text: "Explain your teaching approach and experience.",
                },
                {
                  icon: Wallet,
                  title: "Fair monthly fee",
                  text: "Set a realistic fee for the lessons.",
                },
                {
                  icon: CalendarDays,
                  title: "Accurate schedule",
                  text: "Choose the actual teaching days per week.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 bg-white/[0.07] text-[#B6FF2E]">
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white/90">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[9px] leading-5 text-white/50">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 h-[3px] w-full bg-white/10">
              <div className="h-full w-1/3 bg-[#B6FF2E]" />
            </div>
          </div>

          {/* APPROVAL PROCESS */}
          <div className="rounded-2xl border border-[#deddd5] bg-white p-5">
            <div className="flex items-center gap-2">
              <Clock3 size={17} className="text-[#829d25]" />
              <h3 className="text-[12px] font-extrabold text-[#0B0B0C]">
                Approval process
              </h3>
            </div>

            <div className="mt-5 space-y-4">
              {[
                {
                  number: "01",
                  title: "Submit your post",
                  text: "Your tuition details are sent to MentorLagbe.",
                },
                {
                  number: "02",
                  title: "Admin review",
                  text: "The admin reviews your submitted information.",
                },
                {
                  number: "03",
                  title: "Become discoverable",
                  text: "Approved and active posts become visible to learners.",
                },
              ].map((step, index) => (
                <div key={step.number} className="flex gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center text-[9px] font-black ${
                      index === 0
                        ? "bg-[#B6FF2E] text-[#0B0B0C]"
                        : "bg-[#f3f2ee] text-[#77766f]"
                    }`}
                  >
                    {step.number}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#292923]">
                      {step.title}
                    </p>
                    <p className="mt-1 text-[9px] leading-5 text-[#858379]">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FREE PLAN */}
          <div className="rounded-2xl border border-[#deddd5] bg-[#f3f2ee] p-5">
            <div className="flex items-center gap-2 text-[#657d20]">
              <Info size={16} />
              <p className="text-[11px] font-extrabold text-[#0B0B0C]">
                Free plan reminder
              </p>
            </div>

            <p className="mt-2 text-[10px] leading-6 text-[#77766f]">
              Free membership allows up to two tuition posts. Pro membership
              provides unlimited tuition posting.
            </p>

            <Link
              href="/pricing"
              className="mt-4 inline-flex items-center gap-2 border-b border-[#0B0B0C] pb-1 text-[10px] font-bold text-[#0B0B0C] transition hover:border-[#829d25] hover:text-[#657d20]"
            >
              Explore membership
              <ArrowRight size={12} />
            </Link>
          </div>
        </motion.aside>
      </div>

      {/* FOOTER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#deddd5] pt-5">
        <p className="text-[10px] text-[#858379]">
          MentorLagbe · Empowering better learning connections.
        </p>

        <Link
          href="/dashboard/tutor"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#77766f] transition hover:text-[#0B0B0C]"
        >
          Dashboard
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}