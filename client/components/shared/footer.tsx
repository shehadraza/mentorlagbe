
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  GraduationCap,
} from "lucide-react";

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Tuitions", href: "/tuitions" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing & Plans", href: "/pricing" },
];

const accountLinks = [
  { label: "Sign In", href: "/sign-in" },
  { label: "Create Account", href: "/sign-up" },
  { label: "Student Dashboard", href: "/dashboard/student" },
  { label: "Tutor Dashboard", href: "/dashboard/tutor" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0B0B0C] text-[#F3F2EE]">
      <div className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-[#B6FF2E]/[0.07] blur-[100px]" />

      <div className="container-main relative">
        <div className="grid gap-12 border-b border-white/10 py-16 md:grid-cols-[1.5fr_1fr_1fr] md:gap-16 md:py-20">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="group inline-flex items-center gap-3"
              aria-label="MentorLagbe home"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B6FF2E] text-[#0B0B0C] transition-transform duration-300 group-hover:rotate-[-8deg]">
                <GraduationCap size={25} strokeWidth={2.2} />
              </span>

              <span className="font-heading text-2xl font-bold tracking-[-1.3px]">
                Mentor<span className="text-[#B6FF2E]">Lagbe</span>
              </span>
            </Link>

            <p className="mt-6 max-w-xs text-sm leading-7 text-white/55">
              A smarter way to connect students with tutors and make
              learning opportunities easier to discover.
            </p>

            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[2px] text-white/55">
              <BookOpen size={13} className="text-[#B6FF2E]" />
              Learn. Grow. Lead.
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[2px] text-[#B6FF2E]">
              Explore
            </h3>

            <ul className="mt-6 space-y-4">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={13}
                      className="opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[2px] text-[#B6FF2E]">
              Your Account
            </h3>

            <ul className="mt-6 space-y-4">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={13}
                      className="opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © MentorLagbe. All rights reserved.
          </p>

          <p className="font-medium tracking-wide">
            Built to make learning more accessible.
          </p>
        </div>
      </div>
    </footer>
  );
}
