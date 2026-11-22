
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type VerificationResult = {
  success?: boolean;
  paymentStatus?: string;
  paymentRecorded?: boolean;
  message?: string;
};

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { data: session, isPending } = authClient.useSession();

  const [status, setStatus] = useState<
    "checking" | "success" | "processing" | "failed"
  >("checking");

  const [message, setMessage] = useState(
    "Verifying your payment securely..."
  );

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      setStatus("failed");
      setMessage("Please sign in to verify your payment.");
      return;
    }

    if (!sessionId) {
      setStatus("failed");
      setMessage("The checkout session ID is missing.");
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    async function verifyPayment() {
      if (cancelled) return;

      try {
        const { data: tokenData, error: tokenError } =
          await authClient.token();

        if (tokenError || !tokenData?.token) {
          throw new Error("Your session expired. Please sign in again.");
        }

        const response = await fetch(
          `${API_URL}/api/payments/verify/${encodeURIComponent(sessionId!)}`,
          {
            headers: {
              Authorization: `Bearer ${tokenData.token}`,
            },
            credentials: "include",
            cache: "no-store",
          }
        );

        const result =
          (await response.json()) as VerificationResult;

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Payment verification failed."
          );
        }

        if (cancelled) return;

        if (
          result.paymentStatus === "paid" &&
          result.paymentRecorded
        ) {
          setStatus("success");
          setMessage("Your Pro membership is now active.");
          return;
        }

        if (result.paymentStatus === "paid") {
          setStatus("processing");
          setMessage(
            "Payment received. We are activating your membership."
          );
        } else {
          setStatus("processing");
          setMessage(
            "Waiting for payment confirmation from Stripe."
          );
        }

        attempts += 1;

        if (attempts < 12) {
          timeout = setTimeout(verifyPayment, 3000);
        } else {
          setStatus("processing");
          setMessage(
            "Your payment is still being processed. Please check your membership again shortly."
          );
        }
      } catch (error) {
        if (cancelled) return;

        setStatus("failed");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify your payment."
        );
      }
    }

    void verifyPayment();

    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [sessionId, session, isPending]);

  const dashboardHref =
    session?.user &&
    (session.user as { role?: string }).role === "tutor"
      ? "/dashboard/tutor"
      : "/dashboard/student";

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-[#F3F2EE] px-5 py-20">
      <div className="w-full max-w-lg rounded-[30px] border border-black/10 bg-white p-8 text-center shadow-[0_25px_80px_rgba(11,11,12,0.07)] sm:p-12">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            status === "success"
              ? "bg-[#B6FF2E]"
              : status === "failed"
                ? "bg-red-50"
                : "bg-[#F3F2EE]"
          }`}
        >
          {status === "success" ? (
            <CheckCircle2 size={38} className="text-[#0B0B0C]" />
          ) : status === "failed" ? (
            <CircleAlert size={38} className="text-red-600" />
          ) : (
            <LoaderCircle
              size={36}
              className="animate-spin text-[#0B0B0C]"
            />
          )}
        </div>

        <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#85877B]">
          MentorLagbe Payments
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0B0B0C]">
          {status === "success"
            ? "Payment successful!"
            : status === "failed"
              ? "Verification issue"
              : "Confirming your payment"}
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#727467]">
          {message}
        </p>

        {status === "success" && (
          <div className="mt-8 rounded-2xl bg-[#F3F2EE] p-5 text-left">
            <div className="flex items-center gap-3">
              <ShieldCheck size={22} />
              <div>
                <p className="text-sm font-bold">Pro membership active</p>
                <p className="mt-1 text-xs text-[#727467]">
                  Your payment has been verified and recorded.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === "processing" && (
          <p className="mt-6 text-xs text-[#85877B]">
            You can safely keep this page open while we check your payment.
          </p>
        )}

        {status === "success" ? (
          <Link
            href={dashboardHref}
            className="mt-9 flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#B6FF2E] px-6 text-sm font-bold text-[#0B0B0C] transition hover:bg-[#A5EF1D]"
          >
            Go to dashboard
            <ArrowRight size={17} />
          </Link>
        ) : status === "failed" ? (
          <Link
            href="/pricing"
            className="mt-9 inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#0B0B0C] px-7 text-sm font-bold text-white"
          >
            Return to pricing
            <ArrowRight size={17} />
          </Link>
        ) : null}

        <p className="mt-7 break-all text-[10px] text-[#999990]">
          Session: {sessionId || "Not provided"}
        </p>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[80vh] items-center justify-center bg-[#F3F2EE]">
          <LoaderCircle className="h-7 w-7 animate-spin" />
        </main>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
