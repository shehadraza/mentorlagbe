
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  LoaderCircle,
} from "lucide-react";

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

type Pagination = {
  currentPage: number;
  limit: number;
  total: number;
  totalPages: number;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const PAGE_SIZE = 9;

const initialPagination: Pagination = {
  currentPage: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 0,
};

function TuitionCard({ tuition, index }: {
  tuition: Tuition;
  index: number;
}) {
  const fee = Number(tuition.monthlyFee || 0);
  const tuitionId = tuition._id || tuition.id;
    const subject = (tuition.subject || "General").toLowerCase();

  const fallbackImages: Record<string, string> = {
    mathematics:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=900&auto=format&fit=crop",
    science:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=900&auto=format&fit=crop",
    english:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900&auto=format&fit=crop",
    physics:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=900&auto=format&fit=crop",
    chemistry:
      "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=900&auto=format&fit=crop",
    biology:
      "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=900&auto=format&fit=crop",
    general:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&auto=format&fit=crop",
  };

  const imageUrl =
    tuition.bannerImage ||
    fallbackImages[subject] ||
    fallbackImages.general;

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.07 }}
      whileHover={{ y: -6 }}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-black/[0.08] bg-white transition-shadow duration-300 hover:shadow-[0_20px_60px_rgba(11,11,12,0.09)]"
    >
            <div className="group/banner relative h-[190px] shrink-0 overflow-hidden bg-[#EAE9E3]">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />

        <div className="absolute left-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-[#B6FF2E] text-[#0B0B0C]">
          <BookOpen size={19} />
        </div>

        <span className="absolute right-5 top-5 z-10 rounded-full border border-white/30 bg-white/90 px-3 py-1.5 text-[10px] font-bold capitalize text-[#0B0B0C] backdrop-blur-md">
          {tuition.mode || "Tuition"}
        </span>

        <div className="absolute bottom-5 left-5 z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
            Subject
          </p>
          <p className="mt-1 font-heading text-2xl font-bold tracking-tight text-white">
            {tuition.subject || "General"}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="line-clamp-2 font-heading text-lg font-bold leading-snug tracking-tight text-[#0B0B0C]">
          {tuition.title || "Tuition opportunity"}
        </h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {tuition.classLevel && (
            <span className="rounded-lg bg-[#F3F2EE] px-2.5 py-1.5 text-[10px] font-semibold text-[#77776F]">
              {tuition.classLevel}
            </span>
          )}

          {tuition.daysPerWeek && (
            <span className="rounded-lg bg-[#F3F2EE] px-2.5 py-1.5 text-[10px] font-semibold text-[#77776F]">
              {tuition.daysPerWeek} days/week
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-[#77776F]">
          <MapPin size={14} />
          <span className="line-clamp-1">
            {tuition.location || "Location not specified"}
          </span>
        </div>

        {tuition.tutorName && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[#77776F]">
            <GraduationCap size={15} />
            <span className="line-clamp-1">
              Posted by {tuition.tutorName}
            </span>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-black/[0.08] pt-5">
          <div>
            <p className="text-[10px] font-semibold text-[#999990]">
              Monthly fee
            </p>
            <p className="mt-1 font-heading text-xl font-bold tracking-tight text-[#0B0B0C]">
              ৳{fee.toLocaleString("en-BD")}
            </p>
          </div>

          {tuitionId ? (
            <Link
              href={`/tuitions/${tuitionId}`}
              className="flex h-10 items-center gap-2 rounded-full bg-[#F3F2EE] px-4 text-xs font-bold text-[#0B0B0C] transition-all duration-300 hover:bg-[#B6FF2E]"
            >
              View details
              <ArrowUpRight size={15} />
            </Link>
          ) : (
            <span className="text-xs text-[#999990]">
              Details unavailable
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function BrowseTuitionsPage() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [mode, setMode] = useState("");
  const [location, setLocation] = useState("");
  const [minFee, setMinFee] = useState("");
  const [maxFee, setMaxFee] = useState("");

  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [pagination, setPagination] =
    useState<Pagination>(initialPagination);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTuitions = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (search.trim()) params.set("search", search.trim());
      if (subject.trim()) params.set("subject", subject.trim());
      if (classLevel.trim()) params.set("classLevel", classLevel.trim());
      if (mode) params.set("mode", mode);
      if (location.trim()) params.set("location", location.trim());
      if (minFee.trim()) params.set("minFee", minFee.trim());
      if (maxFee.trim()) params.set("maxFee", maxFee.trim());

      try {
        const response = await fetch(
          `${API_URL}/api/tuitions?${params.toString()}`,
          {
            signal,
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load tuition opportunities."
          );
        }

        setTuitions(
          Array.isArray(data.tuitions) ? data.tuitions : []
        );

        setPagination(data.pagination || initialPagination);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
          setTuitions([]);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [page, search, subject, classLevel, mode, location, minFee, maxFee]
  );

  useEffect(() => {
    const controller = new AbortController();
    const delay = window.setTimeout(() => {
      loadTuitions(controller.signal);
    }, 300);

    return () => {
      window.clearTimeout(delay);
      controller.abort();
    };
  }, [loadTuitions]);

  function updateFilter(
    setter: (value: string) => void,
    value: string
  ) {
    setter(value);
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setSubject("");
    setClassLevel("");
    setMode("");
    setLocation("");
    setMinFee("");
    setMaxFee("");
    setPage(1);
  }

  const hasFilters = Boolean(
    search || subject || classLevel || mode ||
    location || minFee || maxFee
  );

  return (
    <main className="min-h-screen bg-[#F3F2EE] pb-24 text-[#0B0B0C]">
      <section className="relative overflow-hidden border-b border-black/[0.07] bg-[#0B0B0C] text-white">
        <div className="pointer-events-none absolute -right-24 -top-32 h-[430px] w-[430px] rounded-full border border-white/[0.09]" />
        <div className="pointer-events-none absolute -right-5 -top-12 h-[290px] w-[290px] rounded-full border border-white/[0.08]" />
        <div className="pointer-events-none absolute -bottom-36 left-[35%] h-[320px] w-[320px] rounded-full bg-[#B6FF2E]/10 blur-[100px]" />

        <div className="container-main relative mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B6FF2E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B6FF2E]" />
              Explore opportunities
            </div>

            <h1 className="font-heading text-4xl font-bold leading-[1.08] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Find the right
              <br />
              <span className="text-[#B6FF2E]">tuition for you.</span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
              Discover verified tuition opportunities, explore subjects
              and find a learning match that fits your goals.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-10 flex max-w-2xl items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.07] p-2 backdrop-blur-xl"
          >
            <Search className="ml-3 shrink-0 text-[#B6FF2E]" size={20} />
            <input
              value={search}
              onChange={(event) =>
                updateFilter(setSearch, event.target.value)
              }
              placeholder="Search subject, class, tutor or location..."
              className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/40"
            />
            {search && (
              <button
                onClick={() => updateFilter(setSearch, "")}
                aria-label="Clear search"
                className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X size={17} />
              </button>
            )}
          </motion.div>
        </div>
      </section>

      <section className="container-main mx-auto max-w-7xl px-5 pt-12 sm:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#88887F]">
              <SlidersHorizontal size={14} />
              Tuition directory
            </div>
            <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Browse opportunities
            </h2>
            <p className="mt-2 text-sm text-[#77776F]">
              Find a tuition that matches your preferences.
            </p>
          </div>

          <div className="text-sm text-[#77776F]">
            {loading ? (
              "Finding opportunities..."
            ) : (
              <>
                <span className="font-bold text-[#0B0B0C]">
                  {pagination.total}
                </span>{" "}
                opportunities found
              </>
            )}
          </div>
        </div>

        <div className="mb-9 rounded-[24px] border border-black/[0.07] bg-white p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={17} />
              <h3 className="text-sm font-bold">Refine your search</h3>
            </div>

            {hasFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 text-xs font-bold text-[#77776F] transition hover:text-[#0B0B0C]"
              >
                <RotateCcw size={13} />
                Clear all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-2 block text-[11px] font-bold text-[#77776F]">
                Subject
              </span>
              <input
                value={subject}
                onChange={(e) => updateFilter(setSubject, e.target.value)}
                placeholder="e.g. Mathematics"
                className="w-full rounded-xl border border-black/10 bg-[#F8F8F5] px-4 py-3 text-sm outline-none transition focus:border-[#0B0B0C]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-bold text-[#77776F]">
                Class / Level
              </span>
              <input
                value={classLevel}
                onChange={(e) => updateFilter(setClassLevel, e.target.value)}
                placeholder="e.g. Class 9"
                className="w-full rounded-xl border border-black/10 bg-[#F8F8F5] px-4 py-3 text-sm outline-none transition focus:border-[#0B0B0C]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-bold text-[#77776F]">
                Teaching mode
              </span>
              <select
                value={mode}
                onChange={(e) => updateFilter(setMode, e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-[#F8F8F5] px-4 py-3 text-sm outline-none transition focus:border-[#0B0B0C]"
              >
                <option value="">All modes</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="both">Both</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-bold text-[#77776F]">
                Location
              </span>
              <input
                value={location}
                onChange={(e) => updateFilter(setLocation, e.target.value)}
                placeholder="e.g. Dhanmondi"
                className="w-full rounded-xl border border-black/10 bg-[#F8F8F5] px-4 py-3 text-sm outline-none transition focus:border-[#0B0B0C]"
              />
            </label>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:max-w-xl">
            <label className="block">
              <span className="mb-2 block text-[11px] font-bold text-[#77776F]">
                Minimum monthly fee (BDT)
              </span>
              <input
                type="number"
                min="0"
                value={minFee}
                onChange={(e) => updateFilter(setMinFee, e.target.value)}
                placeholder="Minimum fee"
                className="w-full rounded-xl border border-black/10 bg-[#F8F8F5] px-4 py-3 text-sm outline-none transition focus:border-[#0B0B0C]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-bold text-[#77776F]">
                Maximum monthly fee (BDT)
              </span>
              <input
                type="number"
                min="0"
                value={maxFee}
                onChange={(e) => updateFilter(setMaxFee, e.target.value)}
                placeholder="Maximum fee"
                className="w-full rounded-xl border border-black/10 bg-[#F8F8F5] px-4 py-3 text-sm outline-none transition focus:border-[#0B0B0C]"
              />
            </label>
          </div>
        </div>

        {error && (
          <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-bold text-red-800">
                Could not load tuition opportunities
              </p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => {
                const controller = new AbortController();
                loadTuitions(controller.signal);
              }}
              className="rounded-full bg-[#0B0B0C] px-5 py-2.5 text-xs font-bold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[350px] animate-pulse overflow-hidden rounded-[24px] border border-black/[0.06] bg-white"
              >
                <div className="h-[155px] bg-[#E8E7E1]" />
                <div className="space-y-4 p-5">
                  <div className="h-5 w-3/4 rounded bg-[#E8E7E1]" />
                  <div className="h-4 w-1/2 rounded bg-[#E8E7E1]" />
                  <div className="mt-8 h-10 rounded bg-[#E8E7E1]" />
                </div>
              </div>
            ))}
          </div>
        ) : !error && tuitions.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {tuitions.map((tuition, index) => (
              <TuitionCard
                key={tuition._id || tuition.id || index}
                tuition={tuition}
                index={index}
              />
            ))}
          </div>
        ) : !error ? (
          <div className="rounded-[28px] border border-dashed border-black/15 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3F2EE]">
              <BookOpen size={27} />
            </div>
            <h3 className="mt-6 font-heading text-xl font-bold">
              No tuition opportunities found
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#77776F]">
              Try changing your search or removing some filters to discover
              more opportunities.
            </p>
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="mt-6 rounded-full bg-[#B6FF2E] px-6 py-3 text-xs font-bold text-[#0B0B0C] transition hover:bg-[#a5ee20]"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : null}

        {!loading && !error && pagination.totalPages > 1 && (
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-black/[0.08] pt-7">
            <p className="text-xs text-[#77776F]">
              Page{" "}
              <span className="font-bold text-[#0B0B0C]">
                {pagination.currentPage}
              </span>{" "}
              of{" "}
              <span className="font-bold text-[#0B0B0C]">
                {pagination.totalPages}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="flex h-11 items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-xs font-bold transition hover:bg-[#B6FF2E] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={15} />
                Previous
              </button>

              <button
                onClick={() =>
                  setPage((current) =>
                    Math.min(pagination.totalPages, current + 1)
                  )
                }
                disabled={page >= pagination.totalPages}
                className="flex h-11 items-center gap-2 rounded-full bg-[#0B0B0C] px-5 text-xs font-bold text-white transition hover:bg-[#B6FF2E] hover:text-[#0B0B0C] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
