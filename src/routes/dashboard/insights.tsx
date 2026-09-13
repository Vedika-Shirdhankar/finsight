import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  AreaChart,
  Area,
} from "recharts";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Radar,
  FileDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
  Clock,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTransactions } from "@/hooks/queries/use-transactions";
import { useAccounts } from "@/hooks/queries/use-accounts";
import { useCategories } from "@/hooks/queries/use-categories";
import { useBudget } from "@/hooks/queries/use-budgets";
import { useRecurringTransactions } from "@/hooks/queries/use-recurring-transactions";
import { useSavingsGoals } from "@/hooks/queries/use-savings-goals";
import {
  detectAnomalies,
  forecastNextMonthSpend,
  calculateCategoryDrift,
  projectCashFlow,
} from "@/lib/analytics";
import { generateMonthlySummaryPdf } from "@/lib/pdf-summary";

export const Route = createFileRoute("/dashboard/insights")({
  component: InsightsPage,
});

function InsightsPage() {
  const { userId } = useAuth();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "6m" | "1y">("30d");

  const { data: txns, isLoading } = useTransactions(userId, {});
  const { data: accounts } = useAccounts(userId);
  const { data: categories } = useCategories(userId);
  const { data: budget } = useBudget(userId);
  const { data: recurringTxns } = useRecurringTransactions(userId);
  const { data: goals } = useSavingsGoals(userId);

  const transactions = txns || [];
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalVolume = income + expenses;
  const avgTxnValue = transactions.length > 0 ? totalVolume / transactions.length : 0;

  const currentBalance = (accounts || []).reduce((s, a) => s + Number(a.balance), 0);

  const categoryNameById = new Map((categories ?? []).map((c) => [c.id, c.name]));

  // Category aggregation for pie chart
  const categoryMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const cat = t.category_id
        ? (categoryNameById.get(t.category_id) ?? "Uncategorized")
        : "Uncategorized";
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(t.amount);
    });

  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  // Monthly trend from real transactions
  const trendMap: Record<string, { key: string; month: string; income: number; expense: number }> =
    {};
  transactions.forEach((t) => {
    const d = new Date(t.transaction_date);
    const key = t.transaction_date.slice(0, 7);
    const month = d.toLocaleString("default", { month: "short" });
    if (!trendMap[key]) trendMap[key] = { key, month, income: 0, expense: 0 };
    if (t.type === "income") trendMap[key].income += Number(t.amount);
    if (t.type === "expense") trendMap[key].expense += Number(t.amount);
  });

  const sortedTrend = Object.values(trendMap).sort((a, b) => a.key.localeCompare(b.key));
  const monthlyTrend =
    sortedTrend.length > 0
      ? sortedTrend
      : [
          { key: "", month: "Jan", income: 45000, expense: 32000 },
          { key: "", month: "Feb", income: 52000, expense: 34000 },
          { key: "", month: "Mar", income: 48000, expense: 39000 },
          { key: "", month: "Apr", income: 61000, expense: 41000 },
          { key: "", month: "May", income: 55000, expense: 38000 },
          { key: "", month: "Jun", income: 65000, expense: 42350 },
        ];

  // ---- Advanced Analytics calculations ----
  const anomalies = detectAnomalies(transactions, categoryNameById);
  const topAnomaly = anomalies[0];
  const forecast = forecastNextMonthSpend(transactions);
  const categoryDrift = calculateCategoryDrift(transactions, categoryNameById);
  const cashFlowTimeline = projectCashFlow(
    currentBalance > 0 ? currentBalance : 85420,
    recurringTxns || [],
    goals || [],
    expenses > 0 ? expenses / 2 : 25000
  );

  const forecastChartData = [
    ...monthlyTrend.map((m) => ({
      month: m.month,
      actual: m.expense,
      forecast: undefined as number | undefined,
    })),
    ...(forecast.hasEnoughData
      ? [{ month: "Next", actual: undefined, forecast: forecast.projectedNextMonth }]
      : []),
  ];
  if (forecast.hasEnoughData && forecastChartData.length >= 2) {
    const bridge = forecastChartData[forecastChartData.length - 2];
    if (bridge) bridge.forecast = bridge.actual;
  }

  // Computed signals
  const totalExpenseForConcentration = categoryData.reduce((s, c) => s + c.value, 0);
  const top2Share =
    totalExpenseForConcentration > 0
      ? ((categoryData[0]?.value ?? 0) + (categoryData[1]?.value ?? 0)) /
        totalExpenseForConcentration
      : 0;

  const budgetCategories = budget?.budget_categories ?? [];
  const spendByCategory = new Map<string, number>();
  transactions
    .filter((t) => t.type === "expense" && t.category_id)
    .forEach((t) =>
      spendByCategory.set(
        t.category_id!,
        (spendByCategory.get(t.category_id!) ?? 0) + Number(t.amount)
      )
    );
  const overBudgetCount = budgetCategories.filter((bc) => {
    const spent = spendByCategory.get(bc.category_id) ?? 0;
    return Number(bc.limit_amount) > 0 && spent / Number(bc.limit_amount) >= 0.8;
  }).length;

  const insights = [
    {
      title: "Category Drift & Velocity",
      desc:
        categoryDrift.length > 0
          ? `${categoryDrift.filter((d) => d.status === "Accelerating").length} categories accelerating in spend MoM.`
          : "Not enough historical data to measure velocity.",
      type: categoryDrift.some((d) => d.status === "Accelerating") ? "warning" : "neutral",
      icon: Activity,
      metric: `${categoryDrift.filter((d) => d.status === "Accelerating").length} Accelerating`,
    },
    {
      title: "Statistical Anomalies",
      desc: topAnomaly
        ? `Flagged ${anomalies.length} unusual transactions above 2.2σ.`
        : "No statistical outliers detected in current sample.",
      type: topAnomaly ? (topAnomaly.severity === "High" ? "warning" : "neutral") : "positive",
      icon: Radar,
      metric: topAnomaly ? `${topAnomaly.severity} (${topAnomaly.zScore}σ)` : "Clean",
    },
    {
      title: "90-Day Cash Flow Target",
      desc: `Projected balance: ₹${(
        cashFlowTimeline[cashFlowTimeline.length - 1]?.projectedBalance || 0
      ).toLocaleString("en-IN")}`,
      type:
        (cashFlowTimeline[cashFlowTimeline.length - 1]?.projectedBalance || 0) > currentBalance
          ? "positive"
          : "warning",
      icon: TrendingUp,
      metric: `₹${Math.round(
        (cashFlowTimeline[cashFlowTimeline.length - 1]?.projectedBalance || 0) / 1000
      )}k`,
    },
    {
      title: "Budget Risk Index",
      desc:
        budgetCategories.length === 0
          ? "No budget rules currently defined."
          : overBudgetCount === 0
          ? "100% of tracked categories within budget limits."
          : `${overBudgetCount} of ${budgetCategories.length} categories near capacity limit.`,
      type:
        budgetCategories.length === 0 ? "neutral" : overBudgetCount === 0 ? "positive" : "warning",
      icon: overBudgetCount === 0 ? CheckCircle2 : Lightbulb,
      metric:
        budgetCategories.length === 0
          ? "—"
          : overBudgetCount === 0
          ? "Optimal"
          : `${overBudgetCount} Risk`,
    },
  ];

  function handleDownloadSummary() {
    const monthLabel = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    const budgetRows = budgetCategories.map((bc) => ({
      name: categoryNameById.get(bc.category_id) ?? "Uncategorized",
      spent: spendByCategory.get(bc.category_id) ?? 0,
      limit: Number(bc.limit_amount),
    }));
    generateMonthlySummaryPdf({
      monthLabel,
      income,
      expenses,
      transactionCount: transactions.length,
      categoryBreakdown: categoryData,
      budgetCategories: budgetRows,
      anomalies: anomalies.slice(0, 10).map((a) => ({
        merchant: a.transaction.merchant ?? "Transaction",
        amount: Number(a.transaction.amount),
        category: a.categoryLabel,
        zScore: a.zScore,
      })),
      forecast,
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-signal">
            <Zap className="size-3" /> Bloomberg Terminal Intelligence Engine
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
            Financial Analytics & Forecasting
          </h1>
          <p className="mt-2 text-sm text-mute">
            Deep liquidity projections, category drift acceleration, and statistical outlier radar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSummary}
            disabled={transactions.length === 0}
          >
            <FileDown className="mr-1.5 size-3.5" /> Monthly Summary (PDF)
          </Button>
          <div className="flex rounded-lg border border-line bg-panel p-1">
            {(["7d", "30d", "6m", "1y"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`rounded-md px-3 py-1.5 text-xs font-mono transition ${
                  timeRange === r
                    ? "bg-signal text-signal-foreground font-semibold"
                    : "text-mute hover:text-ink"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-line bg-panel p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-mute">
            Total Telemetry Volume
          </div>
          <div className="mt-2 font-mono text-2xl font-bold">
            ₹{totalVolume.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-xs text-signal font-mono">
            {transactions.length} records processed
          </div>
        </div>
        <div className="rounded-xl border border-line bg-panel p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-mute">
            Liquidity Pool
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-signal">
            ₹{currentBalance.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-xs text-mute font-mono">Real-time aggregate balance</div>
        </div>
        <div className="rounded-xl border border-line bg-panel p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-mute">
            Monthly Inflow Velocity
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-signal">
            ₹{income.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-xs text-signal flex items-center gap-1">
            <TrendingUp className="size-3" /> Net cash incoming
          </div>
        </div>
        <div className="rounded-xl border border-line bg-panel p-5 shadow-sm">
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-mute">
            Monthly Outflow Velocity
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-warning-signal">
            ₹{expenses.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-xs text-warning-signal flex items-center gap-1">
            <TrendingDown className="size-3" /> Net cash outgoing
          </div>
        </div>
      </div>

      {/* Actionable Financial Signals Grid */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="size-5 text-signal" />
          <h2 className="font-display text-xl font-bold">Actionable Financial Signals</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {insights.map(({ title, desc, type, icon: Icon, metric }) => (
            <div
              key={title}
              className={`rounded-xl border p-5 transition ${
                type === "warning"
                  ? "border-warning-signal/30 bg-warning-signal/5"
                  : type === "positive"
                  ? "border-signal/30 bg-signal/5"
                  : "border-line bg-panel"
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon
                  className={`size-5 ${
                    type === "warning"
                      ? "text-warning-signal"
                      : type === "positive"
                      ? "text-signal"
                      : "text-mute"
                  }`}
                />
                <span className="font-mono text-xs font-bold">{metric}</span>
              </div>
              <div className="mt-3 font-display font-semibold text-sm">{title}</div>
              <p className="mt-1 text-xs text-mute leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 90-Day Cash-Flow Projection Engine */}
      <div className="rounded-xl border border-line bg-panel p-6 shadow-sm">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-signal" />
              <h3 className="font-display font-bold text-lg">
                90-Day Cash-Flow Liquidity Projection
              </h3>
            </div>
            <p className="text-xs text-mute mt-1">
              Forecasted cash balances factoring in active recurring income, fixed recurring
              commitments, discretionary spending, and savings goal targets.
            </p>
          </div>
          <div className="font-mono text-xs text-signal">
            Target 90D Balance: ₹
            {(
              cashFlowTimeline[cashFlowTimeline.length - 1]?.projectedBalance || 0
            ).toLocaleString("en-IN")}
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashFlowTimeline}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="period" stroke="#737373" fontSize={12} />
              <YAxis stroke="#737373" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#171717",
                  borderColor: "#262626",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Balance"]}
              />
              <Area
                type="monotone"
                dataKey="projectedBalance"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#balanceGrad)"
                name="Projected Balance"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Drift Matrix & Forecasting */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Spending Drift Matrix */}
        <div className="rounded-xl border border-line bg-panel p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-signal" />
                <h3 className="font-display font-bold text-lg">Category Drift & Velocity</h3>
              </div>
              <p className="text-xs text-mute mt-1">
                Month-over-month category spending momentum and acceleration indicators.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {categoryDrift.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-mute">
                No category drift telemetry recorded yet.
              </div>
            ) : (
              categoryDrift.slice(0, 5).map((drift) => (
                <div
                  key={drift.categoryName}
                  className="flex items-center justify-between rounded-lg border border-line bg-raise p-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${
                        drift.status === "Accelerating"
                          ? "border border-warning-signal/30 bg-warning-signal/10 text-warning-signal"
                          : drift.status === "Decelerating"
                          ? "border border-signal/30 bg-signal/10 text-signal"
                          : "border border-line bg-panel text-mute"
                      }`}
                    >
                      {drift.status === "Accelerating" ? (
                        <ArrowUpRight className="size-3" />
                      ) : drift.status === "Decelerating" ? (
                        <ArrowDownRight className="size-3" />
                      ) : null}
                      {drift.status}
                    </span>
                    <span className="font-medium text-ink">{drift.categoryName}</span>
                  </div>
                  <div className="text-right font-mono">
                    <div
                      className={`font-semibold ${
                        drift.changePct > 0 ? "text-warning-signal" : "text-signal"
                      }`}
                    >
                      {drift.changePct > 0 ? `+${drift.changePct}%` : `${drift.changePct}%`}
                    </div>
                    <div className="text-[10px] text-mute">
                      ₹{drift.currentMonth.toLocaleString("en-IN")} vs ₹
                      {drift.previousMonth.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expense Trend & Forecast */}
        <div className="rounded-xl border border-line bg-panel p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-display font-bold text-lg">Expense Trend & Forecast</h3>
            <p className="text-xs text-mute mt-1">
              Historical monthly spend vs. next-month moving average prediction curve.
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecast.hasEnoughData ? forecastChartData : monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="month" stroke="#737373" fontSize={12} />
                <YAxis stroke="#737373" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171717",
                    borderColor: "#262626",
                    borderRadius: "8px",
                  }}
                />
                {forecast.hasEnoughData ? (
                  <>
                    <Bar
                      dataKey="actual"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                      name="Actual Expense"
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      strokeDasharray="5 4"
                      dot={{ r: 4 }}
                      name="Forecasted Target"
                    />
                  </>
                ) : (
                  <>
                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                    <Bar dataKey="expense" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Expenses" />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Statistical Anomaly Detection Radar */}
      <div className="rounded-xl border border-warning-signal/30 bg-warning-signal/5 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar className="size-5 text-warning-signal" />
            <h3 className="font-display font-bold text-lg">
              Statistical Anomaly Radar (Z-Score + Outliers)
            </h3>
          </div>
          <span className="font-mono text-xs text-warning-signal">
            {anomalies.length} Flagged Outliers
          </span>
        </div>
        <p className="mb-4 text-xs text-mute">
          Transactions flagged by z-score statistical variance against your historical category
          averages.
        </p>

        {anomalies.length === 0 ? (
          <div className="rounded-lg border border-line bg-panel p-6 text-center text-xs font-mono text-signal">
            <CheckCircle2 className="mx-auto size-6 mb-2 text-signal" />
            All transactions are operating within normal statistical deviation bounds (Z &lt;
            2.2σ).
          </div>
        ) : (
          <div className="space-y-2">
            {anomalies.slice(0, 6).map((a) => (
              <div
                key={a.transaction.id}
                className="flex items-center justify-between rounded-lg border border-line bg-panel px-4 py-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">
                      {a.transaction.merchant ?? "Transaction"}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase ${
                        a.severity === "High"
                          ? "bg-danger-signal/20 text-danger-signal"
                          : "bg-warning-signal/20 text-warning-signal"
                      }`}
                    >
                      {a.severity}
                    </span>
                  </div>
                  <div className="text-mute text-[11px] mt-0.5">
                    {a.categoryLabel} · {a.reason}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold text-warning-signal">
                    ₹{Number(a.transaction.amount).toLocaleString("en-IN")}
                  </div>
                  <div className="font-mono text-[10px] text-mute">{a.zScore}σ deviation</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
