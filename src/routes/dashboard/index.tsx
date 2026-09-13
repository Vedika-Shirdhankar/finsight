import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTotalBalance } from "@/hooks/queries/use-accounts";
import { useTransactions } from "@/hooks/queries/use-transactions";

export const Route = createFileRoute("/dashboard/")({
  component: Overview,
});

function startOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function Overview() {
  const { userId } = useAuth();
  const { total: balance, isLoading: balanceLoading } = useTotalBalance(userId);

  const monthStart = startOfMonthISO();
  const { data: monthTxns, isLoading: monthLoading } = useTransactions(userId, {
    from: monthStart,
  });
  const { data: recentTxns, isLoading: recentLoading } = useTransactions(userId, { limit: 5 });

  const income =
    monthTxns?.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0) ?? 0;
  const expenses =
    monthTxns?.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0) ?? 0;
  const savings = income - expenses;
  const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : "0.0";

  const loading = balanceLoading || monthLoading;

  const stats = [
    {
      label: "Total balance",
      value: `₹${balance.toLocaleString("en-IN")}`,
      color: "text-signal",
      Icon: WalletCards,
    },
    {
      label: "This month's income",
      value: `₹${income.toLocaleString("en-IN")}`,
      color: "text-info-signal",
      Icon: ArrowUpRight,
    },
    {
      label: "This month's expenses",
      value: `₹${expenses.toLocaleString("en-IN")}`,
      color: "text-warning-signal",
      Icon: ArrowDownRight,
    },
    {
      label: "Net savings",
      value: `₹${savings.toLocaleString("en-IN")}`,
      color: "text-signal",
      Icon: TrendingUp,
    },
    {
      label: "Savings rate",
      value: `${savingsRate}%`,
      color: "text-signal",
      Icon: CircleDollarSign,
    },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.2em] text-signal">
            Financial overview
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
            Your financial command center
          </h1>
          <p className="mt-2 text-sm text-mute">
            Here's what your money is telling you this month.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Link
            to="/dashboard/transactions"
            className="flex items-center gap-2 rounded-lg border border-line bg-panel px-3 py-2 text-sm text-mute hover:border-signal/40 hover:text-ink"
          >
            <Plus className="size-4" /> Add transaction
          </Link>
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            to={"/dashboard/insights" as any}
            className="fs-clip flex items-center gap-2 bg-signal px-4 py-2 text-sm font-medium text-signal-foreground hover:brightness-110"
          >
            <Sparkles className="size-4" /> View insights
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, value, color, Icon }) => (
          <div key={label} className="rounded-xl border border-line bg-panel p-5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.14em] text-mute">
              <span>{label}</span>
              <span className={color}>
                <Icon className="size-4" />
              </span>
            </div>
            <div className="mt-3 font-mono text-2xl font-bold tracking-tight">
              {loading ? "…" : value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-line bg-panel p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-display text-lg font-semibold">Recent transactions</div>
            <div className="mt-1 text-xs text-mute">Your latest financial activity</div>
          </div>
          <Link
            to="/dashboard/transactions"
            className="text-xs font-medium text-signal hover:underline"
          >
            View all <ArrowUpRight className="ml-1 inline size-3" />
          </Link>
        </div>
        <div className="mt-5 divide-y divide-line">
          {recentLoading && <div className="py-6 text-center text-sm text-mute">Loading…</div>}
          {!recentLoading && recentTxns?.length === 0 && (
            <div className="py-6 text-center text-sm text-mute">
              No transactions yet — add your first one to see it here.
            </div>
          )}
          {recentTxns?.map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-raise font-display font-bold text-mute">
                {(t.merchant ?? "?")[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {t.merchant ?? t.description ?? "Transaction"}
                </div>
                <div className="truncate text-[11px] font-mono text-mute">
                  {new Date(t.transaction_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div
                className={`shrink-0 font-mono text-sm font-semibold ${t.type === "income" ? "text-signal" : "text-ink"}`}
              >
                {t.type === "income" ? "+" : "−"}₹{Number(t.amount).toLocaleString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5 text-[10px] font-mono uppercase tracking-[0.15em] text-mute">
        <span className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-signal" /> Protected session
        </span>
        <span>Data scope: live</span>
      </div>
    </div>
  );
}
