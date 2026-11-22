
"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Atom,
  BookMarked,
  BookOpen,
  Calculator,
  Check,
  ChevronRight,
  Code2,
  GraduationCap,
  Globe2,
  Languages,
  Lightbulb,
  Microscope,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import HeroScene from "@/components/hero-scene";

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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const easeOut = [0.22, 1, 0.36, 1] as const;

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={reveal}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  label,
  title,
  description,
  align = "left",
}: {
  label: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`max-w-2xl ${
        align === "center" ? "mx-auto text-center" : ""
      }`}
    >
      <div className="mb-5 inline-flex items-center gap-2.5 border border-black/10 bg-white/70 px-3.5 py-2">
        <span className="h-2 w-2 bg-[#B6FF2E]" />
        <span className="font-brand text-[10px] font-bold uppercase tracking-[0.2em] text-[#55554F]">
          {label}
        </span>
      </div>

      <h2 className="font-heading text-4xl font-bold leading-[1.08] tracking-[-0.055em] text-[#0B0B0C] sm:text-5xl lg:text-[60px]">
        {title}
      </h2>

      {description && (
        <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#77776F] sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

function PrimaryLink({
  href,
  children,
  dark = false,
}: {
  href: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex min-h-12 items-center justify-center gap-3 px-6 font-brand text-sm font-bold transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD36] focus-visible:ring-offset-2 ${
        dark
          ? "bg-[#25261F] text-white hover:bg-[#3A3C30]"
          : "bg-[#B6FF2E] text-[#0B0B0C] hover:bg-[#A5EF1D]"
      }`}
    >
      {children}
      <ArrowUpRight
        size={17}
        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  HERO                                      */
/* -------------------------------------------------------------------------- */

function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-[760px] overflow-hidden pb-20 pt-36 sm:pt-40 lg:min-h-[850px] lg:pb-28 lg:pt-44">
      <div className="ambient-orb ambient-orb-acid pointer-events-none absolute -left-32 top-36 h-80 w-80 opacity-30 blur-3xl" />
      <div className="ambient-orb pointer-events-none absolute right-[-100px] top-48 h-96 w-96 opacity-40 blur-3xl" />

      <div className="container-main relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-4">
          <div className="relative z-10">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-7 inline-flex items-center gap-2.5 border border-black/10 bg-white/70 px-4 py-2.5"
            >
              <Sparkles size={14} className="text-[#77776F]" />
              <span className="font-brand text-[10px] font-bold uppercase tracking-[0.18em] text-[#55554F]">
                A smarter way to learn and teach
              </span>
            </motion.div>

            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
              className="max-w-[720px] font-heading text-[56px] font-bold leading-[0.98] tracking-[-0.075em] text-[#0B0B0C] sm:text-7xl lg:text-[88px]"
            >
              Learn today.
              <br />
              <span className="relative inline-block">
                Own tomorrow.
                <svg
                  viewBox="0 0 460 18"
                  className="absolute -bottom-3 left-0 w-full"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 13C115 2 319 -2 456 9"
                    stroke="#B6FF2E"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-9 max-w-[490px] text-base leading-8 text-[#77776F] sm:text-lg"
            >
              The right guidance can change everything. Find the right tutor,
              discover meaningful learning opportunities, and move closer to
              what you want to become.
            </motion.p>

            <motion.form
              action="/tuitions"
              method="GET"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-9 flex max-w-[540px] flex-col gap-2 border border-black/10 bg-white p-2 shadow-[0_16px_60px_rgba(11,11,12,0.07)] sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <Search
                  size={19}
                  className="shrink-0 text-[#77776F]"
                />
                <input
                  type="search"
                  name="search"
                  placeholder="Search subject, class or tuition..."
                  aria-label="Search tuition opportunities"
                  className="h-12 w-full min-w-0 bg-transparent text-sm text-[#0B0B0C] outline-none placeholder:text-[#999990] focus-visible:ring-0"
                />
              </div>

              <button
                type="submit"
                className="group flex min-h-12 items-center justify-center gap-2 bg-[#B6FF2E] px-6 font-brand text-sm font-bold text-[#0B0B0C] transition-colors hover:bg-[#A5EF1D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25261F] focus-visible:ring-offset-2"
              >
                Find tuition
                <ArrowUpRight
                  size={17}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
            </motion.form>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3"
            >
              <Link
                href="/tuitions"
                className="inline-flex items-center gap-2 font-brand text-xs font-bold text-[#55554F] transition-colors hover:text-[#7EAA24]"
              >
                Explore opportunities
                <ArrowRight size={14} />
              </Link>

              <span className="h-1 w-1 bg-[#B6FF2E]" />

              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 font-brand text-xs font-bold text-[#55554F] transition-colors hover:text-[#7EAA24]"
              >
                Become a tutor
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: easeOut }}
            className="relative mx-auto w-full max-w-[650px] lg:ml-auto"
          >
            <HeroScene />
          </motion.div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-20 flex flex-wrap items-center justify-between gap-5 border-t border-black/10 pt-7"
        >
          <p className="font-brand text-[10px] font-bold uppercase tracking-[0.2em] text-[#999990]">
            One platform. Two paths. Endless possibilities.
          </p>

          <div className="flex flex-wrap items-center gap-5 text-[#77776F]">
            <span className="flex items-center gap-2 text-xs font-semibold">
              <GraduationCap size={16} />
              For students
            </span>
            <span className="flex items-center gap-2 text-xs font-semibold">
              <BookOpen size={15} />
              For tutors
            </span>
            <span className="flex items-center gap-2 text-xs font-semibold">
              <ShieldCheck size={15} />
              Structured learning
            </span>
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-7 right-8 hidden items-center gap-3 text-[#999990] xl:flex">
        <span className="font-brand text-[9px] font-bold uppercase tracking-[0.2em]">
          Scroll to explore
        </span>
        <ArrowDown size={14} className="animate-bounce" />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              LATEST TUITIONS                               */
/* -------------------------------------------------------------------------- */

function TuitionCard({ tuition }: { tuition: Tuition }) {
  const fee = Number(tuition.monthlyFee || 0);

  return (
    <motion.article
      variants={reveal}
      whileHover={{ y: -7 }}
      className="group flex h-full flex-col overflow-hidden border border-black/[0.08] bg-white transition-shadow duration-300 hover:shadow-[0_20px_60px_rgba(11,11,12,0.09)]"
    >
      <div className="relative flex min-h-[145px] items-start justify-between overflow-hidden bg-[#EAE9E3] p-5">
        <div className="absolute -right-8 -top-16 h-44 w-44 rounded-full border border-black/10 transition-transform duration-700 group-hover:scale-125" />
        <div className="absolute -right-2 -top-8 h-32 w-32 rounded-full border border-black/10" />

        <div className="relative z-10 flex h-11 w-11 items-center justify-center bg-[#B6FF2E] text-[#0B0B0C]">
          <BookOpen size={20} />
        </div>

        <span className="relative z-10 bg-white/90 px-3 py-1.5 font-brand text-[10px] font-bold text-[#55554F]">
          {tuition.mode || "Tuition"}
        </span>

        <div className="absolute bottom-4 left-5 z-10">
          <p className="font-brand text-[10px] font-bold uppercase tracking-[0.16em] text-[#77776F]">
            Subject
          </p>
          <p className="mt-1 font-heading text-xl font-bold tracking-tight text-[#0B0B0C]">
            {tuition.subject || "General"}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-heading text-lg font-bold leading-snug tracking-tight text-[#0B0B0C]">
          {tuition.title || "Tuition opportunity"}
        </h3>

        {tuition.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-6 text-[#77776F]">
            {tuition.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {tuition.classLevel && (
            <span className="bg-[#F3F2EE] px-2.5 py-1.5 text-[10px] font-semibold text-[#77776F]">
              {tuition.classLevel}
            </span>
          )}

          {tuition.daysPerWeek && (
            <span className="bg-[#F3F2EE] px-2.5 py-1.5 text-[10px] font-semibold text-[#77776F]">
              {tuition.daysPerWeek} days/week
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-[#77776F]">
          <Globe2 size={14} />
          <span className="line-clamp-1">
            {tuition.location || "Location not specified"}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-black/[0.08] pt-5">
          <div>
            <p className="text-[10px] font-semibold text-[#999990]">
              Monthly fee
            </p>
            <p className="mt-1 font-heading text-xl font-bold tracking-tight text-[#0B0B0C]">
              ৳{fee.toLocaleString("en-BD")}
            </p>
          </div>

          <Link
            href="/tuitions"
            className="inline-flex min-h-10 items-center justify-center gap-2 bg-[#F3F2EE] px-4 font-brand text-[10px] font-bold text-[#25261F] transition-all duration-300 hover:bg-[#B6FF2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD36]"
            aria-label={`Explore ${tuition.title || "this tuition"}`}
          >
            View details
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function LatestTuitions() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTuitions() {
      try {
        const response = await fetch(`${API_URL}/api/tuitions?limit=6`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load tuition opportunities.");
        }

        const data = await response.json();

        setTuitions(
          Array.isArray(data.tuitions) ? data.tuitions : []
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.name !== "AbortError"
        ) {
          setFailed(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTuitions();

    return () => controller.abort();
  }, []);

  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-28">
      <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-[#B6FF2E]/10 blur-3xl" />

      <div className="container-main relative">
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <SectionHeading
            label="Find your next opportunity"
            title={
              <>
                Learning starts
                <br />
                with the <span className="text-[#999990]">right match.</span>
              </>
            }
            description="Explore available tuition opportunities and find a learning path that fits your goals."
          />

          <Link
            href="/tuitions"
            className="group inline-flex min-h-11 items-center gap-2 self-start border border-black/10 px-5 py-3 font-brand text-xs font-bold text-[#0B0B0C] transition-all hover:border-[#B6FF2E] hover:bg-[#B6FF2E] md:self-auto"
          >
            Browse all tuition
            <ArrowUpRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        {loading ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[360px] animate-pulse bg-[#F3F2EE]"
              />
            ))}
          </div>
        ) : failed ? (
          <div className="mt-12 border border-black/10 bg-[#F3F2EE] px-6 py-12 text-center">
            <Activity
              className="mx-auto mb-4 text-[#999990]"
              size={26}
            />
            <h3 className="font-heading text-xl font-bold text-[#0B0B0C]">
              Tuition opportunities are temporarily unavailable.
            </h3>
            <p className="mt-2 text-sm text-[#77776F]">
              Please try again in a little while.
            </p>
            <Link
              href="/tuitions"
              className="mt-6 inline-flex min-h-11 items-center gap-2 bg-[#B6FF2E] px-5 py-3 font-brand text-xs font-bold text-[#0B0B0C] transition-colors hover:bg-[#A5EF1D]"
            >
              Explore tuition
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : tuitions.length > 0 ? (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.08 }}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {tuitions.map((tuition, index) => (
              <TuitionCard
                key={tuition._id || tuition.id || index}
                tuition={tuition}
              />
            ))}
          </motion.div>
        ) : (
          <div className="mt-12 border border-dashed border-black/15 bg-[#F3F2EE] px-6 py-14 text-center">
            <BookOpen
              size={28}
              className="mx-auto text-[#999990]"
            />
            <h3 className="mt-4 font-heading text-xl font-bold text-[#0B0B0C]">
              New opportunities are on their way.
            </h3>
            <p className="mt-2 text-sm text-[#77776F]">
              There are no published tuition posts to show right now.
            </p>
            <Link
              href="/tuitions"
              className="mt-6 inline-flex items-center gap-2 border border-black/10 bg-white px-5 py-3 font-brand text-xs font-bold text-[#0B0B0C] transition-colors hover:bg-[#B6FF2E]"
            >
              Browse tuition
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              AUDIENCE                                      */
/* -------------------------------------------------------------------------- */

function AudienceSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="container-main">
        <SectionHeading
          label="Built for both sides of learning"
          title={
            <>
              Different goals.
              <br />
              <span className="text-[#999990]">One shared journey.</span>
            </>
          }
          description="Whether you are looking for someone to guide you or ready to guide someone else, MentorLagbe gives you a place to begin."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="group relative flex min-h-[420px] flex-col overflow-hidden bg-[#B6FF2E] p-7 sm:p-10">
              <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full border border-black/10 transition-transform duration-700 group-hover:scale-125" />
              <div className="absolute -right-5 top-[-35px] h-52 w-52 rounded-full border border-black/10" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="border border-black/15 px-3 py-2 font-brand text-[10px] font-bold uppercase tracking-[0.16em] text-[#0B0B0C]">
                  For students
                </span>
                <GraduationCap size={25} />
              </div>

              <div className="relative z-10 mt-auto max-w-md">
                <h3 className="font-heading text-4xl font-bold leading-[1.05] tracking-[-0.055em] text-[#0B0B0C] sm:text-5xl">
                  Your next chapter starts with a good teacher.
                </h3>

                <p className="mt-5 max-w-sm text-sm leading-7 text-[#303326]/80">
                  Discover tuition opportunities, connect with tutors, and
                  take the next step in your education.
                </p>

                <Link
  href="/tuitions"
  className="group/link mt-8 inline-flex min-h-12 items-center gap-3 border border-[#B6FF2E] bg-[#B6FF2E] px-6 py-4 font-brand text-xs font-bold text-[#0B0B0C] shadow-[0_8px_24px_rgba(182,255,46,0.16)] transition-all duration-300 hover:-translate-y-1 hover:border-[#9DE51F] hover:bg-[#9DE51F] hover:shadow-[0_12px_30px_rgba(182,255,46,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B0B0C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#B6FF2E]"
>
  Find a tutor
  <ArrowUpRight
    size={16}
    className="transition-transform duration-300 group-hover/link:translate-x-1 group-hover/link:-translate-y-1"
  />
</Link>
              </div>

              <BookOpen
                size={105}
                strokeWidth={0.8}
                className="absolute bottom-10 right-8 rotate-[-12deg] text-black/[0.08] transition-transform duration-700 group-hover:rotate-[-4deg] group-hover:scale-110"
              />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div
              id="for-tutors"
              className="group relative flex min-h-[420px] flex-col overflow-hidden bg-[#EAE9E3] p-7 sm:p-10"
            >
              <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full border border-black/10 transition-transform duration-700 group-hover:scale-125" />
              <div className="absolute -right-5 top-[-35px] h-52 w-52 rounded-full border border-black/10" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="border border-black/15 px-3 py-2 font-brand text-[10px] font-bold uppercase tracking-[0.16em] text-[#0B0B0C]">
                  For tutors
                </span>
                <Users size={23} />
              </div>

              <div className="relative z-10 mt-auto max-w-md">
                <h3 className="font-heading text-4xl font-bold leading-[1.05] tracking-[-0.055em] text-[#0B0B0C] sm:text-5xl">
                  Turn what you know into someone&apos;s future.
                </h3>

                <p className="mt-5 max-w-sm text-sm leading-7 text-[#77776F]">
                  Create tuition posts, manage applications, and help learners
                  move forward through your knowledge.
                </p>

                <Link
                  href="/sign-up"
                  className="group/link mt-8 inline-flex min-h-12 items-center gap-3 bg-white px-6 py-4 font-brand text-xs font-bold text-[#0B0B0C] transition-all hover:-translate-y-1 hover:bg-[#B6FF2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD36]"
                >
                  Start teaching
                  <ArrowUpRight
                    size={16}
                    className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                  />
                </Link>
              </div>

              <GraduationCap
                size={115}
                strokeWidth={0.8}
                className="absolute bottom-8 right-7 rotate-[10deg] text-black/[0.07] transition-transform duration-700 group-hover:rotate-[2deg] group-hover:scale-110"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              HOW IT WORKS                                  */
/* -------------------------------------------------------------------------- */

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Explore",
    description:
      "Browse tuition opportunities and discover options that match your learning goals.",
  },
  {
    number: "02",
    icon: Users,
    title: "Connect",
    description:
      "Students apply to opportunities. Tutors review and manage incoming applications.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Get matched",
    description:
      "Move forward through a structured application and selection process.",
  },
  {
    number: "04",
    icon: BookOpen,
    title: "Keep growing",
    description:
      "Build a learning relationship and keep moving toward your next milestone.",
  },
];

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[#EAE9E3] py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-white/60 blur-3xl" />

      <div className="container-main relative">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionHeading
              label="Simple by design"
              title={
                <>
                  From looking
                  <br />
                  to <span className="text-[#999990]">learning.</span>
                </>
              }
              description="A clearer process makes it easier to find the right opportunity and take action."
            />

            <div className="mt-9">
              <PrimaryLink href="/tuitions">
                Get started
              </PrimaryLink>
            </div>
          </div>

          <div className="relative">
            <div className="absolute bottom-8 left-[25px] top-8 w-px bg-black/10 sm:left-[31px]" />

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="space-y-4"
            >
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.number}
                    variants={reveal}
                    className="group relative flex gap-5 border border-black/[0.07] bg-white/80 p-5 transition-all duration-300 hover:bg-white sm:gap-7 sm:p-7"
                  >
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center border border-black/10 bg-[#F3F2EE] transition-colors group-hover:bg-[#B6FF2E] sm:h-16 sm:w-16">
                      <Icon size={22} strokeWidth={1.7} />
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex items-center gap-3">
                        <span className="font-brand text-[10px] font-bold tracking-[0.16em] text-[#999990]">
                          STEP {step.number}
                        </span>
                        <span className="h-px w-8 bg-[#B6FF2E]" />
                      </div>

                      <h3 className="mt-2 font-heading text-2xl font-bold tracking-tight text-[#0B0B0C]">
                        {step.title}
                      </h3>

                      <p className="mt-2 max-w-md text-sm leading-7 text-[#77776F]">
                        {step.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={18}
                      className="mt-3 shrink-0 text-[#999990] transition-transform group-hover:translate-x-1 group-hover:text-[#0B0B0C]"
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                SUBJECTS                                    */
/* -------------------------------------------------------------------------- */

const subjects: {
  name: string;
  detail: string;
  icon: LucideIcon;
  number: string;
}[] = [
  {
    name: "Mathematics",
    detail: "Build strong foundations",
    icon: Calculator,
    number: "01",
  },
  {
    name: "Physics",
    detail: "Understand how things work",
    icon: Atom,
    number: "02",
  },
  {
    name: "Programming",
    detail: "Turn ideas into solutions",
    icon: Code2,
    number: "03",
  },
  {
    name: "IELTS & Languages",
    detail: "Communicate with confidence",
    icon: Languages,
    number: "04",
  },
  {
    name: "Biology",
    detail: "Explore the living world",
    icon: Microscope,
    number: "05",
  },
  {
    name: "General Studies",
    detail: "Keep curiosity moving",
    icon: BookMarked,
    number: "06",
  },
];

function SubjectsSection() {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="container-main">
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <SectionHeading
            label="Explore what interests you"
            title={
              <>
                A world of
                <br />
                <span className="text-[#999990]">things to learn.</span>
              </>
            }
            description="From academic foundations to practical skills, start with the subject that matters to you."
          />

          <div className="hidden h-20 w-20 items-center justify-center bg-[#B6FF2E] md:flex">
            <Lightbulb size={32} strokeWidth={1.4} />
          </div>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {subjects.map((subject) => {
            const Icon = subject.icon;

            return (
              <motion.div key={subject.name} variants={reveal}>
                <Link
                  href={`/tuitions?subject=${encodeURIComponent(subject.name)}`}
                  className="group flex min-h-[150px] items-center gap-5 border border-black/[0.08] bg-[#F3F2EE] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#B6FF2E] hover:bg-white hover:shadow-[0_15px_40px_rgba(11,11,12,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD36] sm:p-6"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-white transition-colors group-hover:bg-[#B6FF2E]">
                    <Icon size={24} strokeWidth={1.6} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="font-brand text-[9px] font-bold tracking-[0.16em] text-[#999990]">
                      {subject.number}
                    </span>

                    <h3 className="mt-1 font-heading text-lg font-bold tracking-tight text-[#0B0B0C]">
                      {subject.name}
                    </h3>

                    <p className="mt-1 text-xs text-[#77776F]">
                      {subject.detail}
                    </p>
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-[#999990] transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#0B0B0C]"
                  />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                PRICING                                     */
/* -------------------------------------------------------------------------- */

function PricingCard({
  audience,
  plan,
  price,
  description,
  features,
  featured = false,
  href,
}: {
  audience: string;
  plan: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
  href: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -7 }}
      className={`group relative flex min-h-[420px] flex-col overflow-hidden border p-6 transition-shadow duration-300 hover:shadow-[0_20px_55px_rgba(11,11,12,0.08)] sm:p-7 ${
        featured
          ? "border-[#25261F] bg-[#25261F] text-white"
          : "border-black/10 bg-white text-[#0B0B0C]"
      }`}
    >
      <div
        className={`absolute -right-12 -top-14 h-44 w-44 rounded-full border transition-transform duration-700 group-hover:scale-125 ${
          featured ? "border-white/10" : "border-black/[0.07]"
        }`}
      />

      <div
        className={`absolute -right-2 -top-7 h-28 w-28 rounded-full border ${
          featured ? "border-white/10" : "border-black/[0.07]"
        }`}
      />

      {featured && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="absolute -right-5 top-12 h-24 w-24 rounded-full border border-dashed border-[#B6FF2E]/40"
        />
      )}

      <div className="relative z-10 flex items-center justify-between">
        <span
          className={`font-brand text-[10px] font-bold uppercase tracking-[0.18em] ${
            featured ? "text-white/65" : "text-[#999990]"
          }`}
        >
          {audience}
        </span>

        {featured ? (
          <span className="bg-[#B6FF2E] px-3 py-1.5 font-brand text-[9px] font-bold uppercase tracking-wider text-[#0B0B0C]">
            Pro plan
          </span>
        ) : (
          <span className="bg-[#F3F2EE] px-3 py-1.5 font-brand text-[9px] font-bold uppercase tracking-wider text-[#55554F]">
            Free plan
          </span>
        )}
      </div>

      <div className="relative z-10 mt-8">
        <h3 className="font-heading text-2xl font-bold tracking-tight">
          {plan}
        </h3>

        <p
          className={`mt-2 min-h-10 text-xs leading-6 ${
            featured ? "text-white/65" : "text-[#77776F]"
          }`}
        >
          {description}
        </p>

        <div className="mt-6 flex items-baseline gap-2">
          <span className="font-heading text-5xl font-bold tracking-[-0.07em]">
            ${price}
          </span>
          <span
            className={`text-xs ${
              featured ? "text-white/55" : "text-[#999990]"
            }`}
          >
            / month
          </span>
        </div>
      </div>

      <div
        className={`my-7 h-px ${
          featured ? "bg-white/15" : "bg-black/10"
        }`}
      />

      <ul className="relative z-10 flex-1 space-y-4">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center ${
                featured
                  ? "bg-[#B6FF2E] text-[#0B0B0C]"
                  : "bg-[#F3F2EE] text-[#0B0B0C]"
              }`}
            >
              <Check size={12} strokeWidth={3} />
            </span>

            <span
              className={`text-xs leading-6 ${
                featured ? "text-white/80" : "text-[#55554F]"
              }`}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`group/button relative z-10 mt-8 flex min-h-12 items-center justify-center gap-2 px-5 font-brand text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF2E] focus-visible:ring-offset-2 ${
          featured
            ? "bg-[#B6FF2E] text-[#0B0B0C] hover:bg-[#A5EF1D]"
            : "bg-[#F3F2EE] text-[#0B0B0C] hover:bg-[#B6FF2E]"
        }`}
      >
        View plan details
        <ArrowUpRight
          size={15}
          className="transition-transform group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5"
        />
      </Link>
    </motion.div>
  );
}

function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-[#EAE9E3] py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full bg-[#B6FF2E]/20 blur-3xl" />

      <div className="container-main relative">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            label="Simple and transparent"
            title={
              <>
                Room to grow.
                <br />
                <span className="text-[#999990]">Plans that fit.</span>
              </>
            }
            description="Start with a free plan and explore the platform. Upgrade when you need more."
          />

          <div className="flex items-center gap-3 border border-black/10 bg-white/70 p-4">
            <div className="flex h-11 w-11 items-center justify-center bg-[#B6FF2E]">
              <Sparkles size={20} />
            </div>

            <div>
              <p className="font-brand text-xs font-bold text-[#0B0B0C]">
                Flexible plans
              </p>
              <p className="mt-1 text-[10px] text-[#77776F]">
                For students and tutors
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-2 w-2 bg-[#B6FF2E]" />
            <h3 className="font-brand text-xs font-bold uppercase tracking-[0.18em] text-[#0B0B0C]">
              Student plans
            </h3>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <PricingCard
              audience="For students"
              plan="Free"
              price="0"
              description="A simple way to start exploring learning opportunities."
              features={[
                "Create a student account",
                "Explore available tuition posts",
                "Apply to tuition opportunities",
                "Track your applications",
              ]}
              href="/pricing"
            />

            <PricingCard
              audience="For students"
              plan="Pro"
              price="10"
              description="The paid student plan for learners ready to explore more."
              features={[
                "Student Pro subscription",
                "Access to the student platform",
                "Explore and apply to opportunities",
                "View plan details before upgrading",
              ]}
              featured
              href="/pricing"
            />
          </div>
        </div>

        <div className="mb-5 mt-14 flex items-center gap-3">
          <span className="h-2 w-2 bg-[#B6FF2E]" />
          <h3 className="font-brand text-xs font-bold uppercase tracking-[0.18em] text-[#0B0B0C]">
            Tutor plans
          </h3>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <PricingCard
            audience="For tutors"
            plan="Free"
            price="0"
            description="Start teaching and publish your first opportunities."
            features={[
              "Create a tutor account",
              "Publish up to 2 tuition posts",
              "Manage tuition posts",
              "Review student applications",
            ]}
            href="/pricing"
          />

          <PricingCard
            audience="For tutors"
            plan="Pro"
            price="15"
            description="More room to publish and manage your teaching opportunities."
            features={[
              "Unlimited tuition posts",
              "Manage your tuition opportunities",
              "Review and manage applications",
              "Pro tutor subscription",
            ]}
            featured
            href="/pricing"
          />
        </div>

        <p className="mt-6 text-center text-[11px] leading-6 text-[#77776F]">
          Prices are shown in USD. Visit the pricing page for plan and payment
          details.
        </p>

        <div className="mt-7 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 border-b border-[#77776F] pb-1 font-brand text-xs font-bold text-[#55554F] transition-colors hover:border-[#0B0B0C] hover:text-[#0B0B0C]"
          >
            Compare all plans
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              FINAL CTA                                     */
/* -------------------------------------------------------------------------- */

function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="container-main">
        <Reveal>
          <div className="relative overflow-hidden bg-[#B6FF2E] px-7 py-16 sm:px-12 sm:py-20 lg:px-20">
            <div className="absolute -right-20 -top-36 h-[430px] w-[430px] rounded-full border border-black/10" />
            <div className="absolute -right-2 -top-24 h-[290px] w-[290px] rounded-full border border-black/10" />
            <div className="absolute bottom-[-130px] right-[20%] h-64 w-64 rounded-full border border-black/10" />

            <motion.div
              animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute right-[12%] top-[20%] hidden h-20 w-20 items-center justify-center border border-black/10 bg-white/50 backdrop-blur-sm lg:flex"
            >
              <BookOpen size={34} strokeWidth={1.4} />
            </motion.div>

            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 border border-black/15 px-3 py-2 font-brand text-[10px] font-bold uppercase tracking-[0.18em] text-[#0B0B0C]">
                <Sparkles size={13} />
                Your journey begins here
              </span>

              <h2 className="mt-7 font-heading text-5xl font-bold leading-[0.98] tracking-[-0.07em] text-[#0B0B0C] sm:text-6xl lg:text-7xl">
                Make your next
                <br />
                move count.
              </h2>

              <p className="mt-6 max-w-lg text-sm leading-7 text-[#303326]/80 sm:text-base">
                Find the guidance you need or share the knowledge you have.
                There is a place for you at MentorLagbe.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
  <Link
    href="/sign-up"
    className="group inline-flex min-h-12 items-center justify-center gap-3 border border-[#B6FF2E] bg-[#B6FF2E] px-6 py-4 font-brand text-sm font-bold text-[#0B0B0C] shadow-[0_8px_24px_rgba(182,255,46,0.15)] transition-all duration-300 hover:-translate-y-1 hover:border-[#9DE51F] hover:bg-[#9DE51F] hover:shadow-[0_12px_30px_rgba(182,255,46,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B0B0C] focus-visible:ring-offset-2"
  >
    Create your account
    <ArrowUpRight
      size={16}
      className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
    />
  </Link>

  <Link
    href="/tuitions"
    className="group inline-flex min-h-12 items-center justify-center gap-2 border border-[#0B0B0C]/20 bg-white/70 px-6 py-4 font-brand text-sm font-bold text-[#0B0B0C] transition-all duration-300 hover:-translate-y-1 hover:border-[#0B0B0C]/40 hover:bg-white hover:shadow-[0_8px_22px_rgba(11,11,12,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF2E] focus-visible:ring-offset-2"
  >
    Explore tuition
    <ArrowRight
      size={16}
      className="transition-transform duration-300 group-hover:translate-x-1"
    />
  </Link>
</div>
            </div>

            <div className="pointer-events-none absolute bottom-5 right-8 hidden font-heading text-[110px] font-bold leading-none tracking-[-0.1em] text-black/[0.055] xl:block">
              ML.
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  FOOTER                                    */
/* -------------------------------------------------------------------------- */

function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="relative overflow-hidden bg-[#0B0B0C] text-white">
      <div className="pointer-events-none absolute -right-32 -top-40 h-[440px] w-[440px] rounded-full border border-white/[0.06]" />
      <div className="pointer-events-none absolute -right-10 -top-20 h-[260px] w-[260px] rounded-full border border-white/[0.06]" />

      <div className="container-main relative">
        <div className="grid gap-14 py-16 sm:py-20 lg:grid-cols-[1.4fr_0.7fr_0.7fr]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF2E]"
            >
              <span className="flex h-11 w-11 items-center justify-center bg-[#B6FF2E] text-[#0B0B0C]">
                <BookOpen size={22} />
              </span>

              <span className="font-brand text-2xl font-extrabold tracking-[-0.06em] text-white">
                MentorLagbe<span className="text-[#B6FF2E]">.</span>
              </span>
            </Link>

            <p className="mt-6 text-sm leading-7 text-white/60">
              A place where students find guidance and tutors share knowledge.
              Better connections can create better learning journeys.
            </p>

            <div className="mt-8 inline-flex items-center gap-2 border border-white/15 px-4 py-2.5">
              <span className="h-2 w-2 bg-[#B6FF2E]" />
              <span className="font-brand text-[10px] font-semibold text-white/75">
                Learn. Teach. Grow.
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-brand text-xs font-bold uppercase tracking-[0.18em] text-[#B6FF2E]">
              Explore
            </h3>

            <div className="mt-6 flex flex-col gap-4">
              <Link
                href="/tuitions"
                className="w-fit text-sm text-white/60 transition-colors hover:text-[#B6FF2E]"
              >
                Find tuition
              </Link>

              <Link
                href="#how-it-works"
                className="w-fit text-sm text-white/60 transition-colors hover:text-[#B6FF2E]"
              >
                How it works
              </Link>

              <Link
                href="#for-tutors"
                className="w-fit text-sm text-white/60 transition-colors hover:text-[#B6FF2E]"
              >
                Become a tutor
              </Link>

              <Link
                href="/pricing"
                className="w-fit text-sm text-white/60 transition-colors hover:text-[#B6FF2E]"
              >
                Pricing
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-brand text-xs font-bold uppercase tracking-[0.18em] text-[#B6FF2E]">
              Account
            </h3>

            <div className="mt-6 flex flex-col gap-4">
              <Link
                href="/sign-in"
                className="w-fit text-sm text-white/60 transition-colors hover:text-[#B6FF2E]"
              >
                Log in
              </Link>

              <Link
                href="/sign-up"
                className="w-fit text-sm text-white/60 transition-colors hover:text-[#B6FF2E]"
              >
                Create account
              </Link>

              <Link
                href="/tuitions"
                className="w-fit text-sm text-white/60 transition-colors hover:text-[#B6FF2E]"
              >
                Browse opportunities
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 border-t border-white/10 py-7 sm:flex-row sm:items-center">
          <p className="text-[11px] text-white/45">
            © {currentYear ?? "2026"} MentorLagbe. All rights reserved.
          </p>

          <p className="flex items-center gap-2 font-brand text-[10px] font-semibold text-white/50">
            Made for a world that keeps learning
            <span className="text-[#B6FF2E]">✳</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*                                HOME PAGE                                   */
/* -------------------------------------------------------------------------- */

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F3F2EE]">
      <HeroSection />
      <LatestTuitions />
      <AudienceSection />
      <HowItWorks />
      <SubjectsSection />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}

