
"use client";

import {
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  BookMarked,
  ChevronLeft,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Settings2,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type UserRole = "student" | "tutor" | "admin";

type DashboardUser = {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  image?: string | null;
};

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

const roleConfig: Record<
  UserRole,
  {
    label: string;
    heading: string;
    description: string;
    items: NavItem[];
  }
> = {
  student: {
    label: "Student",
    heading: "Student space",
    description: "Your learning journey, in one place.",
    items: [
      {
        label: "Overview",
        href: "/dashboard/student",
        icon: LayoutDashboard,
      },
      {
        label: "My Applications",
        href: "/dashboard/student/my-applications",
        icon: ClipboardList,
      },
      {
        label: "Find a Tutor",
        href: "/tuitions",
        icon: BookOpen,
      },
      {
        label: "My Plan",
        href: "/pricing",
        icon: Wallet,
      },
    ],
  },

  tutor: {
    label: "Tutor",
    heading: "Tutor workspace",
    description: "Manage your teaching opportunities.",
    items: [
      {
        label: "Overview",
        href: "/dashboard/tutor",
        icon: LayoutDashboard,
      },
      {
        label: "Post a Tuition",
        href: "/dashboard/tutor/post-tuition",
        icon: PlusCircle,
      },
      {
        label: "My Tuitions",
        href: "/dashboard/tutor/my-tuitions",
        icon: BookMarked,
      },
      {
        label: "Applicants",
        href: "/dashboard/tutor/applicants",
        icon: Users,
      },
      {
        label: "My Plan",
        href: "/pricing",
        icon: Wallet,
      },
    ],
  },

  admin: {
    label: "Administrator",
    heading: "Control center",
    description: "Platform operations and management.",
    items: [
      {
        label: "Overview",
        href: "/dashboard/admin",
        icon: LayoutDashboard,
      },
      {
        label: "Manage Users",
        href: "/dashboard/admin/users",
        icon: Users,
      },
      {
        label: "Manage Tuitions",
        href: "/dashboard/admin/tuitions",
        icon: BookMarked,
      },
      {
        label: "Transactions",
        href: "/dashboard/admin/transactions",
        icon: Wallet,
      },
    ],
  },
};

function getDashboardPath(role?: string) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "tutor") return "/dashboard/tutor";
  return "/dashboard/student";
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

function DashboardAvatar({
  user,
  large = false,
}: {
  user: DashboardUser;
  large?: boolean;
}) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#B6FF2E] font-bold text-[#0B0B0C] shadow-[0_5px_20px_rgba(182,255,46,0.12)] ${
        large ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs"
      }`}
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

function WorkspaceLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F2EE]">
      <div className="flex flex-col items-center gap-4">
        <motion.span
          animate={{ rotateY: [0, 180, 360], scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#0B0B0C] text-[#B6FF2E] shadow-2xl"
        >
          <GraduationCap size={30} />
        </motion.span>

        <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-white/60">
          Preparing your workspace
        </p>
      </div>
    </div>
  );
}

function DashboardShellContent({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const { data: session, isPending } = authClient.useSession();

  const user = session?.user as DashboardUser | undefined;
  const role = user?.role;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.replace(
        `/sign-in?callbackURL=${encodeURIComponent(pathname)}`
      );
      return;
    }

    if (
      role !== "student" &&
      role !== "tutor" &&
      role !== "admin"
    ) {
      router.replace("/");
      return;
    }

    const correctDashboard = getDashboardPath(role);

    const isWrongDashboard =
      (pathname.startsWith("/dashboard/student") &&
        role !== "student") ||
      (pathname.startsWith("/dashboard/tutor") &&
        role !== "tutor") ||
      (pathname.startsWith("/dashboard/admin") &&
        role !== "admin");

    if (isWrongDashboard) {
      router.replace(correctDashboard);
    }
  }, [isPending, user, role, pathname, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await authClient.signOut();
      router.replace("/");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  if (
    isPending ||
    !user ||
    (role !== "student" && role !== "tutor" && role !== "admin")
  ) {
    return <WorkspaceLoader />;
  }

  const config = roleConfig[role];
  const dashboardPath = getDashboardPath(role);

  const isActive = (href: string) => {
    if (href === dashboardPath) {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex h-[82px] shrink-0 items-center justify-between border-b border-black/[0.08] px-6">
        <Link href="/" className="group flex items-center gap-3">
          <motion.span
            whileHover={reduceMotion ? undefined : { rotate: -8, scale: 1.06 }}
            className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#B6FF2E] text-[#0B0B0C] shadow-[0_0_28px_rgba(182,255,46,0.18)]"
          >
            <GraduationCap size={23} strokeWidth={2.2} />
          </motion.span>

          <span className="leading-none">
            <span className="block font-heading text-[19px] font-bold tracking-[-1px] text-[#F3F2EE]">
              MentorLagbe
            </span>
            <span className="mt-1.5 block text-[9px] font-bold uppercase tracking-[2px] text-white/35">
              Workspace
            </span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          className="rounded-lg bg-[#B6FF2E] p-2 text-[#0B0B0C] transition hover:bg-[#A5EF1D] lg:hidden"
        >
          <X size={19} />
        </button>
      </div>

      {/* User profile */}
      <div className="px-5 pt-7">
        <p className="px-3 text-[9px] font-extrabold uppercase tracking-[0.2em] text-white/60">
          Your account
        </p>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-black/[0.09] bg-[#F3F2EE] p-3 transition-colors hover:bg-[#EAE9E2]">
          <DashboardAvatar user={user} large />

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-[#0B0B0C]">
              {user.name}
            </p>
            <p className="mt-1 truncate text-[10px] text-[#0B0B0C]/40">
              {config.label}
            </p>
          </div>

          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B6FF2E] opacity-30" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#B6FF2E]" />
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-5 py-8">
        <p className="px-3 text-[9px] font-extrabold uppercase tracking-[0.2em] text-white/60">
          Main menu
        </p>

        <div className="mt-4 space-y-1.5">
          {config.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-3.5 py-3.5 text-[12px] font-semibold transition-all duration-200 ${
                  active
                    ? "bg-[#B6FF2E] text-[#0B0B0C] shadow-[0_5px_22px_rgba(182,255,46,0.12)]"
                    : "bg-[#B6FF2E] text-[#0B0B0C] hover:translate-x-1 hover:bg-[#A5EF1D] hover:text-[#0B0B0C]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="dashboard-active-indicator"
                    className="absolute inset-0 rounded-xl bg-[#B6FF2E]"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 32,
                    }}
                  />
                )}

                <Icon
                  size={17}
                  strokeWidth={active ? 2.4 : 1.9}
                  className="relative z-10 shrink-0"
                />

                <span className="relative z-10">{item.label}</span>

                {active && (
                  <ArrowUpRight
                    size={14}
                    className="relative z-10 ml-auto"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Account links */}
        <div className="mt-9 border-t border-white/[0.08] pt-7">
          <p className="px-3 text-[9px] font-extrabold uppercase tracking-[0.2em] text-white/60">
            Account
          </p>

          <Link
            href="/dashboard/settings"
            className={`mt-4 flex items-center gap-3 rounded-xl px-3.5 py-3.5 text-[12px] font-semibold transition-colors ${
              pathname === "/dashboard/settings"
                ? "bg-[#B6FF2E] text-[#0B0B0C]"
                : "bg-[#B6FF2E] text-[#0B0B0C] hover:bg-[#A5EF1D] hover:text-[#0B0B0C]"
            }`}
          >
            <Settings2 size={17} />
            Settings
          </Link>

          <Link
            href="/"
            className="mt-1 flex items-center gap-3 rounded-xl px-3.5 py-3.5 text-[12px] font-semibold bg-[#B6FF2E] text-[#0B0B0C] transition-colors hover:bg-[#A5EF1D] hover:text-[#0B0B0C]"
          >
            <ChevronLeft size={17} />
            Back to website
          </Link>
        </div>
      </nav>

      {/* Sidebar bottom */}
      <div className="shrink-0 border-t border-white/[0.08] p-5">
        <div className="relative overflow-hidden rounded-2xl bg-[#B6FF2E] p-4 text-[#0B0B0C]">
          <div className="pointer-events-none absolute -right-8 -top-9 h-24 w-24 rounded-full border-[12px] border-black/[0.06]" />
          <div className="pointer-events-none absolute -bottom-10 -right-2 h-20 w-20 rounded-full border-[10px] border-black/[0.05]" />

          <div className="relative flex items-center gap-2">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">
              Your workspace
            </span>
          </div>

          <p className="relative mt-2 text-[11px] leading-relaxed text-black/65">
            Keep your learning and teaching journey moving forward.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={loggingOut}
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[12px] font-semibold bg-[#B6FF2E] text-[#0B0B0C] transition-colors hover:bg-[#A5EF1D] hover:text-[#0B0B0C] disabled:opacity-50"
        >
          <LogOut size={17} />
          {loggingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </>
  );

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#F3F2EE] text-[#0B0B0C]">

      {/* Animated background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(11,11,12,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(11,11,12,0.035) 1px, transparent 1px)",
            backgroundSize: "46px 46px",
            maskImage:
              "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 35, -15, 0],
                  y: [0, -25, 20, 0],
                  scale: [1, 1.12, 0.95, 1],
                }
          }
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-40 -top-44 h-[470px] w-[470px] rounded-full bg-[#B6FF2E]/[0.12] blur-[95px]"
        />

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, -25, 20, 0],
                  y: [0, 30, -15, 0],
                  scale: [1, 0.9, 1.08, 1],
                }
          }
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-52 left-[24%] h-[430px] w-[430px] rounded-full bg-[#A7B9A0]/[0.16] blur-[100px]"
        />

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : { rotate: [0, 360], y: [0, -12, 0] }
          }
          transition={{
            rotate: {
              duration: 70,
              repeat: Infinity,
              ease: "linear",
            },
            y: {
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          className="absolute right-[12%] top-[36%] hidden h-28 w-28 rounded-[30px] border border-black/[0.035] bg-white/20 shadow-[0_20px_80px_rgba(11,11,12,0.035)] backdrop-blur-sm lg:block"
          style={{ transform: "perspective(500px) rotateX(55deg) rotateZ(35deg)" }}
        />
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] flex-col bg-[#0B0B0C] shadow-[15px_0_60px_rgba(11,11,12,0.08)] lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 cursor-default bg-black/60 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: -310 }}
              animate={{ x: 0 }}
              exit={{ x: -310 }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 32,
              }}
              className="fixed inset-y-0 left-0 z-50 flex w-[min(310px,88vw)] flex-col bg-[#0B0B0C] shadow-[25px_0_80px_rgba(0,0,0,0.25)] lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main workspace */}
      <div className="relative min-h-screen lg:pl-[270px]">

        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-black/[0.065] bg-[#F3F2EE]/85 px-4 backdrop-blur-2xl sm:h-[78px] sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/[0.09] bg-white/80 transition hover:bg-[#B6FF2E] lg:hidden"
            >
              <Menu size={19} />
            </button>

            <div className="min-w-0">
              <p className="truncate text-[9px] font-extrabold uppercase tracking-[0.17em] text-[#77776F] sm:tracking-[0.2em]">
                {config.label} / Workspace
              </p>

              <h1 className="mt-1 truncate font-heading text-[16px] font-bold tracking-tight sm:text-[19px]">
                {config.heading}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-[170px] truncate text-[11px] font-bold">
                {user.name}
              </p>
              <p className="mt-0.5 max-w-[170px] truncate text-[10px] text-[#999990]">
                {user.email}
              </p>
            </div>

            <DashboardAvatar user={user} />
          </div>
        </header>

        {/* Page content */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10"
        >
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
            <div>
              <p className="text-[11px] font-medium text-[#0B0B0C]">
  {config.description}
</p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-3 py-2 text-[10px] font-bold text-[#55554F] shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-[#82C91E] opacity-30" />
                <span className="relative h-2 w-2 rounded-full bg-[#82C91E]" />
              </span>
              Account active
            </span>
          </div>

          {children}
        </motion.div>

        {/* Footer */}
        <footer className="relative border-t border-black/[0.065] px-4 py-5 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-medium text-white/60">
            <span className="text-[#64748b]">
  © {new Date().getFullYear()} MentorLagbe
</span>

<span className="flex items-center gap-1.5 text-[#64748b]">
  <BookOpen size={12} />
  Learn. Grow. Lead.
</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<WorkspaceLoader />}>
      <DashboardShellContent>{children}</DashboardShellContent>
    </Suspense>
  );
}






