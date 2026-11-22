
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Filter,
  MapPin,
  Monitor,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
  X,
  XCircle,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  bannerImage?: string;
  description: string;
  approvalStatus: "pending" | "approved" | "rejected";
  isActive: boolean;
  createdAt: string;
};

type FilterType = "all" | "approved" | "pending" | "rejected" | "inactive";

type EditForm = {
  title: string;
  subject: string;
  classLevel: string;
  mode: "online" | "offline";
  location: string;
  monthlyFee: string;
  daysPerWeek: string;
  bannerImage: string;
  description: string;
};

const initialEditForm: EditForm = {
  title: "",
  subject: "",
  classLevel: "",
  mode: "online",
  location: "",
  monthlyFee: "",
  daysPerWeek: "3",
  bannerImage: "",
  description: "",
};

const filters: { label: string; value: FilterType }[] = [
  { label: "All posts", value: "all" },
  { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
  { label: "Inactive", value: "inactive" },
];

const inputClass =
  "w-full rounded-xl border border-[#E4E2D9] bg-[#FAF9F6] px-4 py-3 text-[11px] text-[#0B0B0C] outline-none transition placeholder:text-[#99978F] focus:border-[#9ACD20] focus:bg-white focus:ring-4 focus:ring-[#B6FF2E]/15";

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

function getId(tuition: Tuition) {
  return tuition._id || tuition.id || "";
}

async function getAuthToken() {
  const { data: tokenData, error: tokenError } =
    await authClient.token();

  if (tokenError || !tokenData?.token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  return tokenData.token;
}

function StatusBadge({
  status,
  isActive,
}: {
  status: Tuition["approvalStatus"];
  isActive: boolean;
}) {
  if (!isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-[9px] font-bold text-slate-600">
        <XCircle size={12} />
        Inactive
      </span>
    );
  }

  const config = {
    approved: {
      label: "Approved",
      icon: CheckCircle2,
      style: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    pending: {
      label: "Pending review",
      icon: Clock3,
      style: "border-amber-200 bg-amber-50 text-amber-700",
    },
    rejected: {
      label: "Rejected",
      icon: XCircle,
      style: "border-rose-200 bg-rose-50 text-rose-700",
    },
  };

  const item = config[status];
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[9px] font-bold ${item.style}`}
    >
      <Icon size={12} />
      {item.label}
    </span>
  );
}

function EmptyState({
  searchActive,
  filter,
}: {
  searchActive: boolean;
  filter: FilterType;
}) {
  let title = "No tuition posts yet";
  let description =
    "Create your first tuition post and start connecting with learners.";

  if (searchActive) {
    title = "No matching tuition found";
    description = "Try another search term to find your tuition post.";
  } else if (filter !== "all") {
    title = `No ${filter} tuition posts`;
    description = "There are currently no tuition posts in this category.";
  }

  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="border border-[#E4E2D9] bg-[#F3F2EE] p-5 text-[#0B0B0C]">
        <BookOpen size={30} strokeWidth={1.5} />
      </div>

      <h3 className="mt-5 text-[15px] font-bold text-[#0B0B0C]">
        {title}
      </h3>

      <p className="mt-2 max-w-xs text-[10px] leading-6 text-[#77766F]">
        {description}
      </p>
    </div>
  );
}

function EditModal({
  tuition,
  onClose,
  onSave,
  saving,
  error,
}: {
  tuition: Tuition;
  onClose: () => void;
  onSave: (form: EditForm) => void;
  saving: boolean;
  error: string;
}) {
  const [form, setForm] = useState<EditForm>({
    title: tuition.title || "",
    subject: tuition.subject || "",
    classLevel: tuition.classLevel || "",
    mode: tuition.mode || "online",
    location: tuition.location || "",
    monthlyFee: String(tuition.monthlyFee || ""),
    daysPerWeek: String(tuition.daysPerWeek || 3),
    bannerImage: tuition.bannerImage || "",
    description: tuition.description || "",
  });

  const update = (field: keyof EditForm, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#0B0B0C]/65 p-3 backdrop-blur-sm sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="my-auto w-full max-w-[680px] overflow-hidden rounded-2xl border border-[#E4E2D9] bg-white shadow-[0_25px_90px_rgba(0,0,0,0.2)]"
      >
        <div className="flex items-center justify-between bg-[#0B0B0C] px-5 py-5 text-white sm:px-7">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[2px] text-[#B6FF2E]">
              Tuition management
            </p>
            <h2 className="mt-1 text-lg font-bold">Edit tuition post</h2>
            <p className="mt-1 text-[10px] text-white/60">
              Updating this post will require admin reapproval.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="border border-white/15 bg-white/10 p-2.5 transition hover:bg-white/20"
            aria-label="Close edit form"
          >
            <X size={17} />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="max-h-[75vh] space-y-5 overflow-y-auto p-5 sm:p-7"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-[10px] font-bold text-[#30302C]">
                Tuition title *
              </label>
              <input
                required
                maxLength={150}
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#30302C]">
                Subject *
              </label>
              <input
                required
                value={form.subject}
                onChange={(event) => update("subject", event.target.value)}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#30302C]">
                Class / Level *
              </label>
              <input
                required
                value={form.classLevel}
                onChange={(event) => update("classLevel", event.target.value)}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#30302C]">
                Teaching mode *
              </label>
              <select
                value={form.mode}
                onChange={(event) =>
                  update("mode", event.target.value as "online" | "offline")
                }
                className={inputClass}
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#30302C]">
                Location *
              </label>
              <input
                required
                value={form.location}
                onChange={(event) => update("location", event.target.value)}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#30302C]">
                Monthly fee (BDT) *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={form.monthlyFee}
                onChange={(event) =>
                  update("monthlyFee", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#30302C]">
                Days per week *
              </label>
              <select
                required
                value={form.daysPerWeek}
                onChange={(event) =>
                  update("daysPerWeek", event.target.value)
                }
                className={inputClass}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <option key={day} value={day}>
                    {day} {day === 1 ? "day" : "days"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-[10px] font-bold text-[#30302C]">
                Banner image URL
              </label>
              <input
                type="url"
                maxLength={2000}
                value={form.bannerImage}
                onChange={(event) =>
                  update("bannerImage", event.target.value)
                }
                placeholder="https://example.com/image.jpg"
                className={inputClass}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-[10px] font-bold text-[#30302C]">
                Description *
              </label>
              <textarea
                required
                rows={5}
                maxLength={5000}
                value={form.description}
                onChange={(event) =>
                  update("description", event.target.value)
                }
                className={`${inputClass} resize-y leading-6`}
              />
            </div>
          </div>

          {error && (
            <div className="border border-rose-200 bg-rose-50 p-3 text-[10px] leading-5 text-rose-700">
              {error}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 border-t border-[#EAE8E0] pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-[#E4E2D9] px-5 py-3 text-[10px] font-bold text-[#55554E] transition hover:bg-[#F3F2EE] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#B6FF2E] px-5 py-3 text-[10px] font-extrabold text-[#0B0B0C] transition hover:-translate-y-0.5 hover:bg-[#caff63] disabled:opacity-60"
            >
              {saving ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save changes
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function MyTuitionsPage() {
  const reduceMotion = useReducedMotion();

  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingTuition, setEditingTuition] = useState<Tuition | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [deactivatingId, setDeactivatingId] = useState("");
  const [confirmDeactivateId, setConfirmDeactivateId] = useState("");

  const loadTuitions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = await getAuthToken();

      const response = await fetch(`${API_URL}/api/tuitions/mine`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load your tuition posts.");
      }

      setTuitions(Array.isArray(result.tuitions) ? result.tuitions : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load tuition posts."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTuitions();
  }, [loadTuitions]);

  const statistics = useMemo(
    () => ({
      total: tuitions.length,
      approved: tuitions.filter(
        (item) => item.isActive && item.approvalStatus === "approved"
      ).length,
      pending: tuitions.filter(
        (item) => item.isActive && item.approvalStatus === "pending"
      ).length,
      rejected: tuitions.filter(
        (item) => item.isActive && item.approvalStatus === "rejected"
      ).length,
      inactive: tuitions.filter((item) => !item.isActive).length,
    }),
    [tuitions]
  );

  const visibleTuitions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tuitions.filter((tuition) => {
      const matchesSearch =
        !keyword ||
        [
          tuition.title,
          tuition.subject,
          tuition.classLevel,
          tuition.location,
          tuition.mode,
        ].some((value) => value?.toLowerCase().includes(keyword));

      const matchesFilter =
        filter === "all" ||
        (filter === "inactive" && !tuition.isActive) ||
        (filter !== "inactive" &&
          tuition.isActive &&
          tuition.approvalStatus === filter);

      return matchesSearch && matchesFilter;
    });
  }, [tuitions, search, filter]);

  const handleEdit = async (form: EditForm) => {
    if (!editingTuition) return;

    const id = getId(editingTuition);

    if (!id) {
      setEditError("This tuition post does not have a valid ID.");
      return;
    }

    const monthlyFee = Number(form.monthlyFee);
    const daysPerWeek = Number(form.daysPerWeek);

    if (!Number.isFinite(monthlyFee) || monthlyFee <= 0) {
      setEditError("Please enter a valid monthly fee.");
      return;
    }

    if (
      !Number.isInteger(daysPerWeek) ||
      daysPerWeek < 1 ||
      daysPerWeek > 7
    ) {
      setEditError("Days per week must be between 1 and 7.");
      return;
    }

    if (
      !form.title.trim() ||
      !form.subject.trim() ||
      !form.classLevel.trim() ||
      !form.location.trim() ||
      !form.description.trim()
    ) {
      setEditError("Please complete all required fields.");
      return;
    }

    if (form.title.trim().length > 150) {
      setEditError("Tuition title cannot exceed 150 characters.");
      return;
    }

    if (form.description.trim().length > 5000) {
      setEditError("Description cannot exceed 5000 characters.");
      return;
    }

    if (form.bannerImage.trim()) {
      try {
        const parsedUrl = new URL(form.bannerImage.trim());

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          setEditError("Banner image must use HTTP or HTTPS.");
          return;
        }
      } catch {
        setEditError("Please enter a valid banner image URL.");
        return;
      }
    }

    try {
      setSavingEdit(true);
      setEditError("");

      const token = await getAuthToken();

      const response = await fetch(`${API_URL}/api/tuitions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          title: form.title.trim(),
          subject: form.subject.trim(),
          classLevel: form.classLevel.trim(),
          mode: form.mode,
          location: form.location.trim(),
          monthlyFee,
          daysPerWeek,
          bannerImage: form.bannerImage.trim(),
          description: form.description.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not update this tuition.");
      }

      setEditingTuition(null);
      setNotice("Tuition updated. It is now waiting for admin reapproval.");
      await loadTuitions();
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Could not update this tuition."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeactivate = async (tuition: Tuition) => {
    const id = getId(tuition);

    if (!id) {
      setError("This tuition post does not have a valid ID.");
      return;
    }

    try {
      setDeactivatingId(id);
      setError("");
      setNotice("");

      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/tuitions/${id}/deactivate`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Could not deactivate this tuition."
        );
      }

      setConfirmDeactivateId("");
      setNotice("Tuition post deactivated successfully.");
      await loadTuitions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not deactivate tuition."
      );
    } finally {
      setDeactivatingId("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-7 pb-6">
      {/* OPEN HEADER — NO HERO CARD */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative isolate overflow-hidden py-5 sm:py-8"
      >
        {/* Decorative 3D geometry */}
        <div className="pointer-events-none absolute right-0 top-0 -z-10 hidden h-[290px] w-[340px] sm:block">
          <div className="absolute right-8 top-4 h-64 w-64 rounded-full bg-[#B6FF2E]/10 blur-[70px]" />

          <motion.div
            animate={
              reduceMotion
                ? undefined
                : {
                    rotateX: [0, 15, 0],
                    rotateY: [0, 28, 0],
                    rotateZ: [0, 8, 0],
                    y: [0, -12, 0],
                  }
            }
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute right-12 top-8 h-36 w-36"
            style={{
              perspective: "800px",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="absolute inset-0 border border-[#0B0B0C]/20 bg-[#B6FF2E]/75"
              style={{
                transform: "rotateY(35deg) rotateX(52deg) translateZ(24px)",
                boxShadow: "18px 18px 0 rgba(11,11,12,0.07)",
              }}
            />
            <div
              className="absolute inset-5 border border-[#0B0B0C]/30"
              style={{
                transform: "rotateY(-35deg) rotateX(52deg) translateZ(48px)",
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 bg-[#0B0B0C]"
              style={{ transform: "translateZ(65px)" }}
            />
          </motion.div>

          <motion.div
            animate={
              reduceMotion
                ? undefined
                : { y: [0, 16, 0], rotate: [0, 45, 0] }
            }
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute right-64 top-36 h-5 w-5 border border-[#0B0B0C]/30 bg-[#B6FF2E]"
          />

          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-10 right-12 h-12 w-12 rounded-full border border-[#0B0B0C]/15"
          />

          <div className="absolute right-5 top-5 h-2 w-2 rounded-full bg-[#B6FF2E]" />
          <div className="absolute bottom-4 right-36 h-2 w-2 rounded-full bg-[#0B0B0C]/20" />
        </div>

        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Link
              href="/dashboard/tutor"
              className="mb-7 inline-flex items-center gap-2 text-[10px] font-semibold text-[#77766F] transition hover:text-[#0B0B0C]"
            >
              <ArrowLeft size={13} />
              Tutor dashboard
            </Link>

            <p className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[2.5px] text-[#77766F]">
              <GraduationCap size={14} />
              Tuition management
            </p>

            <h1 className="mt-3 text-[36px] font-extrabold tracking-[-1.8px] text-[#0B0B0C] sm:text-[48px]">
              My tuitions<span className="text-[#9ACD20]">.</span>
            </h1>

            <p className="mt-3 max-w-lg text-[11px] leading-7 text-[#77766F] sm:text-[12px]">
              Manage your teaching opportunities, track approval status and
              keep your tuition information up to date.
            </p>
          </div>

          <Link
            href="/dashboard/tutor/post-tuition"
            className="inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-xl bg-[#B6FF2E] px-5 py-3.5 text-[10px] font-extrabold text-[#0B0B0C] shadow-[0_8px_24px_rgba(182,255,46,0.18)] transition hover:-translate-y-1 hover:bg-[#caff63]"
          >
            <Plus size={15} />
            Post new tuition
            <ArrowRight size={13} />
          </Link>
        </div>
      </motion.section>

      {/* NOTICES */}
      {notice && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <p className="text-[10px] font-semibold leading-5">{notice}</p>
          </div>

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notice"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p className="text-[10px] leading-5">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <section>
        <div className="mb-4">
          <p className="text-[9px] font-extrabold uppercase tracking-[2px] text-[#77766F]">
            Your collection
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-[#0B0B0C]">
            Tuition overview
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          {[
            {
              label: "Total posts",
              value: statistics.total,
              icon: BookOpen,
              color: "text-[#0B0B0C]",
              bg: "bg-[#B6FF2E]/30",
            },
            {
              label: "Approved",
              value: statistics.approved,
              icon: CheckCircle2,
              color: "text-emerald-700",
              bg: "bg-emerald-50",
            },
            {
              label: "Pending",
              value: statistics.pending,
              icon: Clock3,
              color: "text-amber-700",
              bg: "bg-amber-50",
            },
            {
              label: "Rejected",
              value: statistics.rejected,
              icon: XCircle,
              color: "text-rose-700",
              bg: "bg-rose-50",
            },
            {
              label: "Inactive",
              value: statistics.inactive,
              icon: Trash2,
              color: "text-slate-600",
              bg: "bg-slate-100",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.label}
                initial={reduceMotion ? false : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                className="rounded-2xl border border-[#E4E2D9] bg-white p-4 shadow-[0_8px_25px_rgba(15,35,55,0.025)] transition-shadow hover:shadow-[0_15px_35px_rgba(15,35,55,0.06)] sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-semibold text-[#77766F] sm:text-[10px]">
                    {item.label}
                  </span>

                  <span className={`rounded-lg p-2 ${item.bg} ${item.color}`}>
                    <Icon size={15} />
                  </span>
                </div>

                <p className="mt-4 text-[27px] font-extrabold tracking-[-1px] text-[#0B0B0C]">
                  {item.value}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FILTERS AND SEARCH */}
      <section className="rounded-2xl border border-[#E4E2D9] bg-white p-4 shadow-[0_8px_30px_rgba(15,35,55,0.025)] sm:p-5">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <div className="mr-1 flex items-center gap-2 text-[#77766F]">
              <Filter size={14} />
              <span className="text-[9px] font-extrabold uppercase tracking-[1.5px]">
                Filter
              </span>
            </div>

            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-lg border px-3 py-2.5 text-[9px] font-bold transition ${
                  filter === item.value
                    ? "border-[#0B0B0C] bg-[#0B0B0C] text-white"
                    : "border-[#E4E2D9] bg-[#FAF9F6] text-[#55554E] hover:border-[#9ACD20] hover:bg-[#B6FF2E]/15"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1 sm:min-w-[240px]">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99978F]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, subject, location..."
                className="w-full rounded-xl border border-[#E4E2D9] bg-[#FAF9F6] py-3 pl-10 pr-4 text-[10px] text-[#0B0B0C] outline-none transition placeholder:text-[#99978F] focus:border-[#9ACD20] focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={() => void loadTuitions()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E4E2D9] bg-white px-4 py-3 text-[10px] font-bold text-[#30302C] transition hover:border-[#9ACD20] hover:bg-[#B6FF2E]/10 disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#EAE8E0] pt-4">
          <p className="text-[10px] text-[#77766F]">
            Showing{" "}
            <span className="font-bold text-[#0B0B0C]">
              {visibleTuitions.length}
            </span>{" "}
            of {tuitions.length} tuition posts
          </p>

          {(search || filter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
              className="inline-flex items-center gap-1.5 text-[9px] font-bold text-[#55554E] transition hover:text-[#0B0B0C]"
            >
              <X size={12} />
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* TUITION CARDS */}
      <section>
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl border border-[#E4E2D9] bg-[#EAE8E0]"
              />
            ))}
          </div>
        ) : visibleTuitions.length === 0 ? (
          <div className="overflow-hidden rounded-2xl border border-[#E4E2D9] bg-white">
            <EmptyState
              searchActive={Boolean(search.trim())}
              filter={filter}
            />

            {tuitions.length === 0 && (
              <div className="pb-8 text-center">
                <Link
                  href="/dashboard/tutor/post-tuition"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#B6FF2E] px-5 py-3 text-[10px] font-extrabold text-[#0B0B0C] transition hover:-translate-y-0.5 hover:bg-[#caff63]"
                >
                  <Plus size={14} />
                  Create your first tuition
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid items-start gap-5 md:grid-cols-2">
            {visibleTuitions.map((tuition, index) => {
              const id = getId(tuition);
              const isConfirming = confirmDeactivateId === id;
              const isDeactivating = deactivatingId === id;

              return (
                <motion.article
                  key={id || index}
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.055 }}
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  className="group overflow-hidden rounded-2xl border border-[#E4E2D9] bg-white shadow-[0_8px_28px_rgba(15,35,55,0.035)] transition-shadow hover:shadow-[0_18px_42px_rgba(15,35,55,0.08)]"
                >
                  {/* CARD TOP */}
                  <div className="relative flex items-start justify-between gap-3 overflow-hidden bg-[#F3F2EE] px-5 py-5">
                    <div className="pointer-events-none absolute -right-8 -top-14 h-36 w-36 rounded-full bg-[#B6FF2E]/25 blur-3xl" />

                    <div className="relative flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E4E2D9] bg-white text-[#0B0B0C]">
                        <BookOpen size={20} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-[13px] font-bold leading-5 text-[#0B0B0C]">
                          {tuition.title}
                        </h3>

                        <p className="mt-1 text-[10px] text-[#77766F]">
                          {tuition.subject} · {tuition.classLevel}
                        </p>
                      </div>
                    </div>

                    <div className="relative shrink-0">
                      <StatusBadge
                        status={tuition.approvalStatus}
                        isActive={tuition.isActive}
                      />
                    </div>
                  </div>

                  {/* CARD BODY */}
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-[#EAE8E0] bg-[#FAF9F6] p-3">
                        <div className="flex items-center gap-2 text-[#77766F]">
                          <Wallet size={13} />
                          <span className="text-[9px] font-semibold">
                            Monthly fee
                          </span>
                        </div>
                        <p className="mt-2 text-[14px] font-extrabold text-[#0B0B0C]">
                          {formatMoney(tuition.monthlyFee)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#EAE8E0] bg-[#FAF9F6] p-3">
                        <div className="flex items-center gap-2 text-[#77766F]">
                          <CalendarDays size={13} />
                          <span className="text-[9px] font-semibold">
                            Schedule
                          </span>
                        </div>
                        <p className="mt-2 text-[12px] font-extrabold text-[#0B0B0C]">
                          {tuition.daysPerWeek} days / week
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-[#77766F]">
                      <span className="inline-flex items-center gap-1.5">
                        {tuition.mode === "online" ? (
                          <Monitor size={13} />
                        ) : (
                          <MapPin size={13} />
                        )}
                        <span className="capitalize">{tuition.mode}</span>
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13} />
                        {tuition.location}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#EAE8E0] pt-4">
                      <span className="text-[9px] text-[#99978F]">
                        Posted {formatDate(tuition.createdAt)}
                      </span>

                      <span className="text-[9px] font-semibold text-[#77766F]">
                        {tuition.isActive ? "Active listing" : "Deactivated"}
                      </span>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTuition(tuition);
                          setEditError("");
                        }}
                        disabled={!tuition.isActive || isDeactivating}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E4E2D9] bg-[#F3F2EE] px-3 py-3 text-[9px] font-bold text-[#0B0B0C] transition hover:border-[#9ACD20] hover:bg-[#B6FF2E]/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Edit3 size={13} />
                        Edit post
                      </button>

                      {tuition.isActive && !isConfirming && (
                        <button
                          type="button"
                          onClick={() => setConfirmDeactivateId(id)}
                          disabled={isDeactivating}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-[9px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                          Deactivate
                        </button>
                      )}

                      {!tuition.isActive && (
                        <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-[9px] font-semibold text-slate-500">
                          <XCircle size={13} />
                          No longer active
                        </div>
                      )}
                    </div>

                    {/* DEACTIVATION CONFIRMATION */}
                    {isConfirming && (
                      <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
                        <p className="text-[10px] font-bold text-rose-800">
                          Deactivate this tuition?
                        </p>

                        <p className="mt-1 text-[9px] leading-5 text-rose-700/80">
                          This will make the post inactive. You can review
                          its status here afterward.
                        </p>

                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => void handleDeactivate(tuition)}
                            disabled={isDeactivating}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-[9px] font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                          >
                            {isDeactivating ? (
                              <RefreshCw size={11} className="animate-spin" />
                            ) : (
                              <Trash2 size={11} />
                            )}
                            {isDeactivating ? "Deactivating..." : "Confirm"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfirmDeactivateId("")}
                            disabled={isDeactivating}
                            className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-[9px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E2D9] pt-5">
        <p className="text-[10px] text-[#77766F]">
          Manage your opportunities with MentorLagbe.
        </p>

        <Link
          href="/dashboard/tutor"
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#55554E] transition hover:text-[#0B0B0C]"
        >
          Back to dashboard
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* EDIT MODAL */}
      {editingTuition && (
        <EditModal
          tuition={editingTuition}
          onClose={() => {
            if (!savingEdit) {
              setEditingTuition(null);
              setEditError("");
            }
          }}
          onSave={handleEdit}
          saving={savingEdit}
          error={editError}
        />
      )}
    </div>
  );
}
