
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Check,
  GraduationCap,
  ImagePlus,
  LoaderCircle,
  Mail,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Profile = {
  name: string;
  email: string;
  role: "student" | "tutor" | "admin";
  plan: "free" | "pro";
  phone: string;
  bio: string;
  image: string | null;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  profile?: Profile;
};

const emptyProfile: Profile = {
  name: "",
  email: "",
  role: "student",
  plan: "free",
  phone: "",
  bio: "",
  image: null,
};

async function getAuthToken() {
  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    throw new Error(
      "Your session could not be verified. Please sign in again.",
    );
  }

  return data.token;
}

async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid image.");
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Please select a JPEG, PNG, or WebP image.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image size must be less than 10 MB.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>(
      (resolve, reject) => {
        const element = new window.Image();

        element.onload = () => resolve(element);
        element.onerror = () =>
          reject(new Error("Could not read this image."));

        element.src = objectUrl;
      },
    );

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Image processing is not supported.");
    }

    const size = 320;
    const scale = Math.min(
      size / image.width,
      size / image.height,
      1,
    );

    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    canvas.width = width;
    canvas.height = height;

    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    let quality = 0.78;
    let result = canvas.toDataURL("image/jpeg", quality);

    while (result.length > 58000 && quality > 0.35) {
      quality -= 0.08;
      result = canvas.toDataURL("image/jpeg", quality);
    }

    if (result.length > 60000) {
      throw new Error(
        "This image could not be compressed enough. Please select a smaller image.",
      );
    }

    return result;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function getRoleLabel(role: Profile["role"]) {
  const labels = {
    student: "Student",
    tutor: "Tutor",
    admin: "Administrator",
  };

  return labels[role] ?? "Student";
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/users/me/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );

      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success || !result.profile) {
        throw new Error(
          result.message || "Unable to load your profile.",
        );
      }

      setProfile(result.profile);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading your profile.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setError("");
    setSuccess("");
    setProcessingImage(true);

    try {
      const compressedImage = await compressImage(file);

      setProfile((current) => ({
        ...current,
        image: compressedImage,
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process this image.",
      );
    } finally {
      setProcessingImage(false);
    }
  };

  const handleSave = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (profile.name.trim().length < 2) {
      setError("Please enter a valid name.");
      return;
    }

    if (profile.phone.length > 25) {
      setError("Phone number is too long.");
      return;
    }

    if (profile.bio.length > 300) {
      setError("Bio cannot exceed 300 characters.");
      return;
    }

    setSaving(true);

    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/users/me/profile`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: profile.name,
            phone: profile.phone,
            bio: profile.bio,
            image: profile.image,
          }),
        },
      );

      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to save your profile.",
        );
      }

      if (result.profile) {
        setProfile((current) => ({
          ...current,
          ...result.profile,
        }));
      }

      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const removeImage = () => {
    setProfile((current) => ({
      ...current,
      image: null,
    }));

    setSuccess("");
    setError("");
  };

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#83B900]" />
          <p className="text-sm text-[#777]">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl pb-12">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#777] transition hover:text-black"
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </Link>

            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#83A900]">
              Account management
            </p>

            <h1 className="text-3xl font-black tracking-tight text-[#111] sm:text-4xl">
              Your Profile<span className="text-[#A5D923]">.</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#777]">
              Manage your personal information and how others see you
              on MentorLagbe.
            </p>
          </div>

          <div className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-[#E5E5DF] bg-white sm:flex">
            <UserRound className="h-6 w-6 text-[#7EA900]" />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <X size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-xl border border-[#D8E8B9] bg-[#F3F9E9] px-4 py-3 text-sm text-[#426B00]"
          >
            <Check size={18} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[0.85fr_1.5fr]">
            <div className="space-y-6">
              <section className="overflow-hidden rounded-2xl border border-[#E5E4DE] bg-white">
                <div className="h-24 bg-[#DCE9BE]">
                  <div className="h-full w-full bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,0.75),transparent_32%)]" />
                </div>

                <div className="px-6 pb-6">
                  <div className="-mt-12 flex items-end justify-between">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#F0F0E9] shadow-sm">
                      {profile.image ? (
                        <img
                          src={profile.image}
                          alt="Your profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound className="h-11 w-11 text-[#99998E]" />
                      )}
                    </div>

                    <span className="mb-2 rounded-md bg-[#EDFFD0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#577D00]">
                      {profile.plan}
                    </span>
                  </div>

                  <h2 className="mt-4 break-words text-xl font-bold text-[#171717]">
                    {profile.name || "Your name"}
                  </h2>

                  <p className="mt-1 break-all text-sm text-[#888]">
                    {profile.email}
                  </p>

                  <div className="mt-5 flex items-center gap-2 border-t border-[#EEEEEA] pt-4 text-sm text-[#666]">
                    <GraduationCap size={17} className="text-[#83A900]" />
                    {getRoleLabel(profile.role)}
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm text-[#666]">
                    <ShieldCheck size={16} className="text-[#83A900]" />
                    Verified session
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-[#E5E4DE] bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888]">
                  Profile picture
                </p>

                <div className="mt-4 flex flex-col gap-3">
                  <button
                    type="button"
                    disabled={processingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#DCDCD4] bg-[#FAFAF7] px-4 text-sm font-semibold text-[#222] transition hover:border-[#9ABF45] hover:bg-[#F4F9E9] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processingImage ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <Camera size={17} />
                    )}
                    {processingImage ? "Processing..." : "Choose a photo"}
                  </button>

                  {profile.image && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-100 px-4 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Remove photo
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <p className="text-xs leading-5 text-[#999]">
                    JPEG, PNG or WebP. Maximum original size 10 MB.
                    Your image will be compressed before saving.
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-[#E5E4DE] bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888]">
                  Account information
                </p>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F2F5EB]">
                      <Mail size={16} className="text-[#789E22]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-[#999]">Email</p>
                      <p className="break-all text-sm font-medium text-[#333]">
                        {profile.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F2F5EB]">
                      <GraduationCap size={16} className="text-[#789E22]" />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#999]">Account role</p>
                      <p className="text-sm font-medium text-[#333]">
                        {getRoleLabel(profile.role)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-[#E5E4DE] bg-white p-6 sm:p-8">
                <div className="mb-7 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#171717]">
                      Personal details
                    </h2>
                    <p className="mt-1 text-sm text-[#888]">
                      Keep your information accurate and up to date.
                    </p>
                  </div>

                  <span className="rounded-lg bg-[#F1F6E7] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#638B12]">
                    Editable
                  </span>
                </div>

                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="profile-name"
                      className="mb-2 block text-sm font-semibold text-[#333]"
                    >
                      Full name <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="profile-name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={80}
                      value={profile.name}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Enter your full name"
                      className="h-12 w-full rounded-xl border border-[#DEDED7] bg-[#FCFCFA] px-4 text-sm text-[#222] outline-none transition placeholder:text-[#AAA] focus:border-[#91B932] focus:ring-2 focus:ring-[#B6FF2E]/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-phone"
                      className="mb-2 block text-sm font-semibold text-[#333]"
                    >
                      Phone number
                    </label>

                    <input
                      id="profile-phone"
                      type="tel"
                      maxLength={25}
                      value={profile.phone}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                      placeholder="+880 1XXXXXXXXX"
                      className="h-12 w-full rounded-xl border border-[#DEDED7] bg-[#FCFCFA] px-4 text-sm text-[#222] outline-none transition placeholder:text-[#AAA] focus:border-[#91B932] focus:ring-2 focus:ring-[#B6FF2E]/20"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label
                        htmlFor="profile-bio"
                        className="text-sm font-semibold text-[#333]"
                      >
                        About you
                      </label>

                      <span className="text-xs tabular-nums text-[#999]">
                        {profile.bio.length}/300
                      </span>
                    </div>

                    <textarea
                      id="profile-bio"
                      rows={6}
                      maxLength={300}
                      value={profile.bio}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          bio: event.target.value,
                        }))
                      }
                      placeholder="Tell others a little about yourself, your interests, or your learning goals..."
                      className="w-full resize-y rounded-xl border border-[#DEDED7] bg-[#FCFCFA] px-4 py-3 text-sm leading-6 text-[#222] outline-none transition placeholder:text-[#AAA] focus:border-[#91B932] focus:ring-2 focus:ring-[#B6FF2E]/20"
                    />

                    <p className="mt-2 text-xs text-[#999]">
                      Write a short introduction. Maximum 300 characters.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEEEEA] pt-6">
                  <p className="text-xs text-[#999]">
                    Changes are saved to your account.
                  </p>

                  <button
                    type="submit"
                    disabled={saving || processingImage}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#B6FF2E] px-6 text-sm font-bold text-[#171717] shadow-sm transition hover:bg-[#A7F01E] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <Save size={17} />
                    )}
                    {saving ? "Saving changes..." : "Save changes"}
                  </button>
                </div>
              </section>

              <section className="flex items-start gap-4 rounded-2xl border border-[#E5E4DE] bg-[#F8F8F3] p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                  <ShieldCheck size={19} className="text-[#789E22]" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#292929]">
                    Your account, your information
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#85857D]">
                    Your profile is connected to your authenticated
                    account. Only your own account can update these
                    personal details through this page.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
