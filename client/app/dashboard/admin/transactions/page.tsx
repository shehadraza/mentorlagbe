
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Payment = {
  _id?: string;
  id?: string;
  userEmail: string;
  userName: string;
  userRole: "student" | "tutor";
  planName: "pro";
  amount: number;
  currency: "usd";
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: "pending" | "paid";
  paidAt: string | null;
  createdAt: string;
};

type Pagination = {
  currentPage: number;
  limit: number;
  totalTransactions: number;
  totalPages: number;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  transactions?: Payment[];
  pagination?: Pagination;
};

const EMPTY_PAGINATION: Pagination = {
  currentPage: 1,
  limit: 10,
  totalTransactions: 0,
  totalPages: 0,
};

function formatDate(value: string | null) {
  if (!value) return "Not completed";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unavailable";

  return new Intl.DateTimeFormat("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

function getPaymentId(payment: Payment) {
  return payment._id || payment.id || payment.stripeSessionId;
}

function shortId(value: string) {
  if (!value) return "Not available";

  if (value.length <= 20) return value;

  return `${value.slice(0, 10)}...${value.slice(-7)}`;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Payment[]>([]);
  const [pagination, setPagination] =
    useState<Pagination>(EMPTY_PAGINATION);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "paid" | "pending"
  >("all");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const getToken = useCallback(async () => {
    const result = await authClient.token();
    const token = result.data?.token;

    if (!token) {
      throw new Error(
        "Your session could not be verified. Please sign in again."
      );
    }

    return token;
  }, []);

  const loadTransactions = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const token = await getToken();

        const response = await fetch(
          `${API_URL}/api/payments/transactions?page=${page}&limit=10`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to retrieve transactions."
          );
        }

        setTransactions(result.transactions ?? []);
        setPagination(result.pagination ?? EMPTY_PAGINATION);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to retrieve payment records."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getToken, page]
  );

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((payment) => {
      const matchesStatus =
        statusFilter === "all" ||
        payment.paymentStatus === statusFilter;

      const matchesSearch =
        !query ||
        [
          payment.userName,
          payment.userEmail,
          payment.userRole,
          payment.planName,
          payment.transactionId,
          payment.stripeSessionId,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [transactions, statusFilter, search]);

  const paidOnPage = transactions.filter(
    (payment) => payment.paymentStatus === "paid"
  );

  const pendingOnPage = transactions.filter(
    (payment) => payment.paymentStatus === "pending"
  );

  const paidAmountOnPage = paidOnPage.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  return (
    <main className="min-h-screen bg-[#F3F2EE] px-4 py-7 text-[#0B0B0C] sm:px-6 lg:px-9">
      <div className="mx-auto max-w-[1440px]">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative mb-8 overflow-hidden border border-[#0B0B0C]/10 bg-[#E9E8E1] p-6 sm:p-9"
        >
          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-[#B6FF2E]/70" />
          <div className="pointer-events-none absolute right-16 top-12 h-32 w-32 rounded-full border border-[#0B0B0C]/20" />

          <div className="relative z-10">
            <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#52534B]">
              <ShieldCheck size={15} />
              Administration / Finance
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
              Money
              <span className="ml-3 inline-block bg-[#B6FF2E] px-2">
                Trail.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#55564F] sm:text-base">
              A clear record of MentorLagbe Pro membership payments,
              Stripe transactions and subscription upgrades.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 border border-[#0B0B0C]/15 bg-[#F3F2EE] px-4 py-3">
                <CreditCard size={17} />
                <span className="text-sm font-semibold">
                  Payment records
                </span>
              </div>

              <button
                type="button"
                onClick={() => void loadTransactions(true)}
                disabled={loading || refreshing}
                className="inline-flex items-center gap-2 border border-[#0B0B0C] bg-[#0B0B0C] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#B6FF2E] hover:text-[#0B0B0C] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh records
              </button>
            </div>
          </div>
        </motion.header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-[#0B0B0C]/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#77786F]">
                Total records
              </span>
              <CreditCard size={19} />
            </div>
            <p className="mt-5 text-4xl font-black tracking-tight">
              {loading
                ? "—"
                : pagination.totalTransactions.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-[#77786F]">
              All recorded transactions
            </p>
          </div>

          <div className="border border-[#0B0B0C]/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#77786F]">
                Paid on this page
              </span>
              <CheckCircle2 size={19} />
            </div>
            <p className="mt-5 text-4xl font-black tracking-tight">
              {loading ? "—" : paidOnPage.length.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-[#77786F]">
              Successfully completed payments
            </p>
          </div>

          <div className="border border-[#0B0B0C]/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#77786F]">
                Pending on this page
              </span>
              <Clock3 size={19} />
            </div>
            <p className="mt-5 text-4xl font-black tracking-tight">
              {loading
                ? "—"
                : pendingOnPage.length.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-[#77786F]">
              Awaiting successful payment
            </p>
          </div>

          <div className="relative overflow-hidden border border-[#0B0B0C] bg-[#B6FF2E] p-5">
            <div className="absolute -bottom-8 -right-5 h-28 w-28 rounded-full border-[15px] border-[#0B0B0C]/10" />
            <div className="relative flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.15em]">
                Paid amount on page
              </span>
              <ArrowDownLeft size={19} />
            </div>
            <p className="relative mt-5 text-3xl font-black tracking-tight">
              {loading ? "—" : formatAmount(paidAmountOnPage, "usd")}
            </p>
            <p className="relative mt-2 text-xs text-[#34392A]">
              Current page only · USD
            </p>
          </div>
        </section>

        <section className="border border-[#0B0B0C]/10 bg-white">
          <div className="flex flex-col gap-5 border-b border-[#0B0B0C]/10 p-5 sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#85857C]">
                Stripe payment history
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">
                All transactions
              </h2>
              <p className="mt-2 text-xs text-[#77786F]">
                Records are displayed newest first.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["all", "All records"],
                    ["paid", "Paid"],
                    ["pending", "Pending"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    className={`border px-4 py-2.5 text-xs font-bold transition ${
                      statusFilter === value
                        ? "border-[#0B0B0C] bg-[#0B0B0C] text-white"
                        : "border-[#0B0B0C]/15 bg-[#F3F2EE] hover:border-[#0B0B0C]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:max-w-sm">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77786F]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email or transaction ID..."
                  className="h-11 w-full border border-[#0B0B0C]/15 bg-[#F3F2EE] pl-10 pr-4 text-sm outline-none transition placeholder:text-[#92928A] focus:border-[#0B0B0C] focus:ring-2 focus:ring-[#B6FF2E]"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-5 mt-5 flex items-start gap-2 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 sm:mx-6">
              <XCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
              <button
                type="button"
                onClick={() => void loadTransactions()}
                className="ml-auto shrink-0 font-bold underline"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3 p-5 sm:p-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-4 border border-[#0B0B0C]/10 p-4"
                >
                  <div className="h-10 w-10 bg-[#E9E8E1]" />
                  <div className="flex-1 space-y-3">
                    <div className="h-3 w-1/3 bg-[#E9E8E1]" />
                    <div className="h-3 w-1/2 bg-[#E9E8E1]" />
                  </div>
                  <div className="h-7 w-20 bg-[#E9E8E1]" />
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="px-5 py-16 text-center sm:px-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center border border-[#0B0B0C]/10 bg-[#F3F2EE]">
                <CreditCard size={28} />
              </div>
              <h3 className="mt-5 text-xl font-black">
                {search || statusFilter !== "all"
                  ? "No matching transactions"
                  : "No transactions yet"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#77786F]">
                {search || statusFilter !== "all"
                  ? "Try changing the search term or payment status filter."
                  : "When students or tutors purchase Pro membership, their payment records will appear here."}
              </p>
              {(search || statusFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="mt-5 border border-[#0B0B0C] px-5 py-2.5 text-sm font-bold transition hover:bg-[#B6FF2E]"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px] border-collapse text-left">
                  <thead>
                    <tr className="bg-[#F3F2EE] text-[10px] font-bold uppercase tracking-[0.14em] text-[#77786F]">
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-5 py-4">Role / Plan</th>
                      <th className="px-5 py-4">Amount</th>
                      <th className="px-5 py-4">Transaction ID</th>
                      <th className="px-5 py-4">Payment date</th>
                      <th className="px-5 py-4">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#0B0B0C]/10">
                    {filteredTransactions.map((payment) => (
                      <tr
                        key={getPaymentId(payment)}
                        className="transition hover:bg-[#F3F2EE]/70"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#B6FF2E] text-sm font-black">
                              {payment.userName?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold">
                                {payment.userName}
                              </p>
                              <p className="mt-1 max-w-[210px] truncate text-xs text-[#77786F]">
                                {payment.userEmail}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm font-bold capitalize">
                            {payment.userRole}
                          </p>
                          <span className="mt-1 inline-block bg-[#B6FF2E]/35 px-2 py-1 text-[10px] font-black uppercase">
                            {payment.planName}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-black">
                            {formatAmount(payment.amount, payment.currency)}
                          </p>
                          <p className="mt-1 text-[10px] uppercase text-[#85857C]">
                            {payment.currency}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p
                            title={payment.transactionId || "Not available"}
                            className="font-mono text-xs"
                          >
                            {shortId(payment.transactionId)}
                          </p>
                          <p
                            title={payment.stripeSessionId}
                            className="mt-1 font-mono text-[10px] text-[#85857C]"
                          >
                            {shortId(payment.stripeSessionId)}
                          </p>
                        </td>

                        <td className="px-5 py-5 text-xs text-[#55564F]">
                          {formatDate(
                            payment.paidAt || payment.createdAt
                          )}
                        </td>

                        <td className="px-5 py-5">
                          {payment.paymentStatus === "paid" ? (
                            <span className="inline-flex items-center gap-1.5 border border-[#6D9B16]/30 bg-[#B6FF2E]/25 px-2.5 py-1.5 text-[10px] font-black uppercase text-[#36510D]">
                              <CheckCircle2 size={13} />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[10px] font-black uppercase text-amber-800">
                              <Clock3 size={13} />
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-[#0B0B0C]/10 lg:hidden">
                {filteredTransactions.map((payment) => (
                  <article
                    key={getPaymentId(payment)}
                    className="p-5 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#B6FF2E] font-black">
                          {payment.userName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-black">
                            {payment.userName}
                          </h3>
                          <p className="mt-1 truncate text-xs text-[#77786F]">
                            {payment.userEmail}
                          </p>
                        </div>
                      </div>

                      {payment.paymentStatus === "paid" ? (
                        <span className="inline-flex shrink-0 items-center gap-1 bg-[#B6FF2E]/30 px-2 py-1.5 text-[10px] font-black uppercase">
                          <CheckCircle2 size={12} />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex shrink-0 items-center gap-1 bg-amber-50 px-2 py-1.5 text-[10px] font-black uppercase text-amber-800">
                          <Clock3 size={12} />
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 border-y border-[#0B0B0C]/10 py-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#85857C]">
                          Amount
                        </p>
                        <p className="mt-1 font-black">
                          {formatAmount(payment.amount, payment.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#85857C]">
                          Role / Plan
                        </p>
                        <p className="mt-1 text-sm font-bold capitalize">
                          {payment.userRole} / {payment.planName}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#85857C]">
                          Transaction ID
                        </p>
                        <p className="mt-1 break-all font-mono text-xs">
                          {payment.transactionId || "Not available"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#85857C]">
                          Payment date
                        </p>
                        <p className="mt-1 text-xs">
                          {formatDate(payment.paidAt || payment.createdAt)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 break-all font-mono text-[10px] text-[#85857C]">
                      Session: {payment.stripeSessionId}
                    </p>
                  </article>
                ))}
              </div>
            </>
          )}

          <div className="flex flex-col gap-4 border-t border-[#0B0B0C]/10 bg-[#F3F2EE] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-[#77786F]">
              Page {pagination.currentPage} of{" "}
              {Math.max(1, pagination.totalPages)} ·{" "}
              {pagination.totalTransactions} total records
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex items-center gap-2 border border-[#0B0B0C]/20 px-4 py-2.5 text-xs font-bold transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={14} />
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >= pagination.totalPages || loading ||
                  pagination.totalPages === 0
                }
                onClick={() =>
                  setPage((current) =>
                    Math.min(pagination.totalPages, current + 1)
                  )
                }
                className="inline-flex items-center gap-2 border border-[#0B0B0C] bg-[#0B0B0C] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#B6FF2E] hover:text-[#0B0B0C] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#77786F]">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck size={14} />
            Admin-only financial records
          </span>
          <span className="inline-flex items-center gap-2">
            <Users size={14} />
            Student & Tutor Pro memberships
          </span>
        </div>
      </div>
    </main>
  );
}
