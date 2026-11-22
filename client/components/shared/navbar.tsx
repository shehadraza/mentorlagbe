
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type MentorUser = {
  id: string;
  name: string;
  email: string;
  role?: "student" | "tutor" | "admin";
  image?: string | null;
};

const navigation = [
  { label: "Home", href: "/" },
  { label: "Browse Tuitions", href: "/tuitions" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "For Tutors", href: "/#for-tutors" },
  { label: "Pricing", href: "/pricing" },
];

function getDashboardPath(role?: string) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "tutor") return "/dashboard/tutor";
  return "/dashboard/student";
}

function getRoleLabel(role?: string) {
  if (role === "admin") return "Admin";
  if (role === "tutor") return "Tutor";
  return "Student";
}

function getInitials(name?: string) {
  if (!name?.trim()) return "ML";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function UserAvatar({
  user,
  size = "normal",
}: {
  user: MentorUser;
  size?: "normal" | "large";
}) {
  const dimensions =
    size === "large" ? "h-10 w-10" : "h-9 w-9";

  return (
    <span
      className={`flex ${dimensions} shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0B0B0C] text-xs font-bold text-[#B6FF2E]`}
    >
      {user.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.image}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        getInitials(user.name)
      )}
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as MentorUser | undefined;

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const closeDropdown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setProfileOpen(false);
      }
    };

    window.addEventListener("keydown", closeDropdown);

    return () => window.removeEventListener("keydown", closeDropdown);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.includes("#")) return false;

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleSignOut = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await authClient.signOut();
      setProfileOpen(false);
      setMobileOpen(false);
      router.replace("/");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const dashboardPath = getDashboardPath(user?.role);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-black/[0.08] bg-[#F3F2EE]/90 shadow-[0_8px_30px_rgba(11,11,12,0.06)] backdrop-blur-2xl"
          : "border-b border-transparent bg-[#F3F2EE]/70 backdrop-blur-md"
      }`}
    >
      <div
        className={`container-main flex items-center justify-between transition-all duration-300 ${
          scrolled ? "h-[72px]" : "h-[88px]"
        }`}
      >
        {/* Brand */}
        <Link
          href="/"
          aria-label="MentorLagbe home"
          className="group flex shrink-0 items-center gap-2.5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B0B0C] text-[#B6FF2E] transition-transform duration-300 group-hover:rotate-[-8deg]">
            <GraduationCap size={23} strokeWidth={2.2} />
          </span>

          <span className="flex flex-col leading-none">
            <span className="font-heading text-[21px] font-bold tracking-[-1.2px] text-[#0B0B0C]">
              Mentor<span className="text-[#77776F]">Lagbe</span>
            </span>
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[2px] text-[#77776F]">
              Learn. Grow. Lead.
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative py-3 text-[13px] font-semibold text-[#77776F] transition-colors hover:text-[#0B0B0C]"
            >
              <span
                className={
                  isActive(item.href) ? "text-[#0B0B0C]" : ""
                }
              >
                {item.label}
              </span>

              {isActive(item.href) && (
                <motion.span
                  layoutId="navbar-active-indicator"
                  className="absolute inset-x-0 -bottom-[1px] h-[2px] rounded-full bg-[#0B0B0C]"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}

              <span className="absolute inset-x-0 -bottom-[1px] h-[2px] origin-left scale-x-0 rounded-full bg-[#B6FF2E] transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {isPending ? (
            <div className="h-10 w-28 animate-pulse rounded-full bg-black/[0.06]" />
          ) : user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                aria-expanded={profileOpen}
                aria-label="Open account menu"
                className="flex items-center gap-2.5 rounded-full border border-black/10 bg-white/70 py-1.5 pl-1.5 pr-3 transition-all hover:border-black/25 hover:bg-white"
              >
                <UserAvatar user={user} />

                <span className="max-w-[105px] truncate text-left text-[12px] font-bold text-[#0B0B0C]">
                  {user.name}
                </span>

                <ChevronDown
                  size={14}
                  className={`text-[#77776F] transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-[calc(100%+12px)] w-64 overflow-hidden rounded-2xl border border-black/10 bg-[#F3F2EE] p-2 shadow-[0_18px_55px_rgba(11,11,12,0.14)]"
                  >
                    <div className="border-b border-black/[0.08] px-3 py-3">
                      <p className="truncate text-sm font-bold text-[#0B0B0C]">
                        {user.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#77776F]">
                        {user.email}
                      </p>
                      <span className="mt-2 inline-flex rounded-full bg-[#B6FF2E] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0B0B0C]">
                        {getRoleLabel(user.role)}
                      </span>
                    </div>

                    <Link
                      href={dashboardPath}
                      className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#0B0B0C] transition-colors hover:bg-black/[0.05]"
                    >
                      <LayoutDashboard size={17} />
                      Dashboard
                      <ArrowUpRight size={14} className="ml-auto" />
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#0B0B0C] transition-colors hover:bg-black/[0.05]"
                    >
                      <UserRound size={17} />
                      Update Profile
                    </Link>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/[0.07] disabled:opacity-50"
                    >
                      <LogOut size={17} />
                      {loggingOut ? "Signing out..." : "Sign Out"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-full px-4 py-3 text-[13px] font-bold text-[#0B0B0C] transition-colors hover:bg-black/[0.05]"
              >
                Sign In
              </Link>

              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-2 rounded-full border border-[#0B0B0C]/10 bg-[#B6FF2E] px-5 py-3 text-[13px] font-bold text-[#0B0B0C] shadow-[0_8px_22px_rgba(120,150,50,0.16)] transition-all duration-300 hover:bg-[#A7ED27]"
              >
                Sign Up
                <ArrowUpRight
                  size={15}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/70 text-[#0B0B0C] transition-colors hover:bg-[#B6FF2E] lg:hidden"
        >
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* Mobile navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-black/[0.08] bg-[#F3F2EE]/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="container-main py-5">
              <nav className="flex flex-col">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between border-b border-black/[0.06] py-4 text-sm font-semibold ${
                        isActive(item.href)
                          ? "text-[#0B0B0C]"
                          : "text-[#77776F]"
                      }`}
                    >
                      {item.label}
                      <ArrowUpRight size={16} />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {isPending ? (
                <div className="mt-5 h-12 animate-pulse rounded-xl bg-black/[0.06]" />
              ) : user ? (
                <div className="mt-5 space-y-2">
                  <div className="flex items-center gap-3 rounded-xl bg-white/70 p-3">
                    <UserAvatar user={user} size="large" />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#0B0B0C]">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-[#77776F]">
                        {getRoleLabel(user.role)} · {user.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={dashboardPath}
                    className="flex items-center gap-3 rounded-xl bg-[#B6FF2E] px-4 py-3 text-sm font-bold text-[#0B0B0C]"
                  >
                    <LayoutDashboard size={17} />
                    Dashboard
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 rounded-xl border border-black/10 px-4 py-3 text-sm font-bold text-[#0B0B0C]"
                  >
                    <UserRound size={17} />
                    Update Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-500/[0.07]"
                  >
                    <LogOut size={17} />
                    {loggingOut ? "Signing out..." : "Sign Out"}
                  </button>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link
                    href="/sign-in"
                    className="rounded-xl border border-black/15 px-4 py-3 text-center text-sm font-bold text-[#0B0B0C]"
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/sign-up"
                    className="rounded-xl border border-[#0B0B0C]/10 bg-[#B6FF2E] px-4 py-3 text-center text-sm font-bold text-[#0B0B0C] transition-colors hover:bg-[#A7ED27]"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              <p className="mt-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[2px] text-[#77776F]">
                <BookOpen size={13} />
                Learn. Grow. Lead.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
