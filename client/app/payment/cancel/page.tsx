
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <main className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-[#F3F2EE] px-5 py-20">
      <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-[#B6FF2E]/20 blur-[100px]" />

      <div className="relative w-full max-w-lg rounded-[30px] border border-black/10 bg-white p-8 text-center shadow-[0_25px_80px_rgba(11,11,12,0.07)] sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F3F2EE]">
          <CreditCard size={34} className="text-[#0B0B0C]" />
        </div>

        <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#85877B]">
          MentorLagbe Payments
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0B0B0C]">
          Payment cancelled
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#727467]">
          Your checkout was cancelled or left incomplete.
          No successful payment has been recorded for this attempt.
          You can return to pricing and try again whenever you are ready.
        </p>

        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-[#F3F2EE] p-4 text-left">
          <ShieldCheck size={22} className="shrink-0" />
          <p className="text-xs leading-6 text-[#55554F]">
            Your account remains unchanged. You can continue using
            your current membership.
          </p>
        </div>

        <Link
          href="/pricing"
          className="mt-9 flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#B6FF2E] px-6 text-sm font-bold text-[#0B0B0C] transition hover:bg-[#A5EF1D]"
        >
          <ArrowLeft size={17} />
          Return to pricing
        </Link>

        <Link
          href="/"
          className="mt-5 inline-block text-xs font-semibold text-[#727467] transition hover:text-[#0B0B0C]"
        >
          Back to homepage
        </Link>
      </div>
    </main>
  );
}
