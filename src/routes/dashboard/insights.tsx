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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTransactions } from "@/hooks/queries/use-transactions";
import { useAccounts } from "@/hooks/queries/use-accounts";
import { useCategories } from "@/hooks/queries/use-categories";
import { useBudget } from "@/hooks/queries/use-budgets";
import { detectAnomalies, forecastNextMonthSpend } from "@/lib/analytics";
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

  const transactions = txns || [];
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalVolume = income + expenses;
  const avgTxnValue = transactions.length > 0 ? totalVolume / transactions.length : 0;

  const categoryNameById = new Map((categories ?? []).map((c) => [c.id, c.name]));

  // Category aggregation for pie chart — grouped by actual category, not merchant.
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

  // Monthly trend from real transactions, keyed by calendar month so it sorts correctly.
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

  // ---- Real analytics: anomaly detection + next-month forecast ----
  const anomalies = detectAnomalies(transactions, categoryNameById);
  const topAnomaly = anomalies[0];
  const forecast = forecastNextMonthSpend(transactions);

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
  // Bridge the line between the last actual point and the forecast point.
  if (forecast.hasEnoughData && forecastChartData.length >= 2) {
    const bridge = forecastChartData[forecastChartData.length - 2];
    if (bridge) bridge.forecast = bridge.actual;
  }

  // ---- Real, computed insights (replacing what used to be hardcoded sample copy) ----
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
        (spendByCategory.get(t.category_id!) ?? 0) + Number(t.amount),
      ),
    );
  const overBudgetCount = budgetCategories.filter((bc) => {
    const spent = spendByCategory.get(bc.category_id) ?? 0;
    return Number(bc.limit_amount) > 0 && spent / Number(bc.limit_amount) >= 0.8;
  }).length;

  const insights = [
    {
      title: "Category Concentration",
      desc:
        categoryData.length > 0
          ? `Your top ${Math.min(2, categoryData.length)} spending ${categoryData.length > 1 ? "categories represent" : "category represents"} ${(top2Share * 100).toFixed(1)}% of tracked expenses.`
          : "Not enough categorized expense data yet to measure concentration.",
      type: top2Share > 0.5 ? "warning" : "neutral",
      icon: AlertTriangle,
      metric: categoryData.length > 0 ? `${(top2Share * 100).toFixed(1)}%` : "—",
    },
    {
      title: "Unusual Transaction",
      desc: topAnomaly
        ? `${topAnomaly.transaction.merchant ?? "A transaction"} in ${topAnomaly.categoryLabel} was ₹${Number(
            topAnomaly.transaction.amount,
          ).toLocaleString("en-IN")} — well above your usual spend there.`
        : "No transactions stand out as unusual compared to your recent history.",
      type: topAnomaly ? "warning" : "positive",
      icon: Radar,
      metric: topAnomaly ? `${topAnomaly.zScore.toFixed(1)}σ` : "Clear",
    },
    {
      title: "Next Month Forecast",
      desc: forecast.hasEnoughData
        ? `Based on your last ${Math.min(3, forecast.history.length)} months, projected spend is ₹${Math.round(
            forecast.projectedNextMonth,
          ).toLocaleString(
            "en-IN",
          )}, ${forecast.trendPct >= 0 ? "up" : "down"} ${Math.abs(forecast.trendPct).toFixed(1)}% vs last month.`
        : "Add a couple more months of transactions for a reliable forecast.",
      type: forecast.hasEnoughData && forecast.trendPct > 10 ? "warning" : "neutral",
      icon: forecast.trendPct >= 0 ? TrendingUp : TrendingDown,
      metric: forecast.hasEnoughData
        ? `₹${Math.round(forecast.projectedNextMonth).toLocaleString("en-IN")}`
        : "—",
    },
    {
      title: "Budget Health",
      desc:
        budgetCategories.length === 0
          ? "No budget set up for this month yet."
          : overBudgetCount === 0
            ? "All budget categories remain within safe operational bounds."
            : `${overBudgetCount} of ${budgetCategories.length} budget categories are at or near their limit.`,
      type:
        budgetCategories.length === 0 ? "neutral" : overBudgetCount === 0 ? "positive" : "warning",
      icon: overBudgetCount === 0 ? CheckCircle2 : Lightbulb,
      metric:
        budgetCategories.length === 0
          ? "—"
          : overBudgetCount === 0
            ? "Healthy"
            : `${overBudgetCount} at risk`,
    },
  ];

  // ---- Monthly PDF summary ----
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
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.2em] text-signal">
            Intelligence Engine
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
            Financial Analytics & Insights
          </h1>
          <p className="mt-2 text-sm text-mute">
            Transform raw payment telemetry into actionable financial decision signals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSummary}
            disabled={transactions.length === 0}
          >
            <FileDown className="mr-1.5 size-3.5" /> Monthly summary (PDF)
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
        <div className="rounded-xl border border-line bg-panel p-5">
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-mute">
            Total Volume
          </div>
          <div className="mt-2 font-mono text-2xl font-bold">
            ₹{totalVolume.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-xs text-signal">From {transactions.length} transactions</div>
        </div>
        <div className="rounded-xl border border-line bg-panel p-5">
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-mute">
            Avg Transaction
          </div>
          <div className="mt-2 font-mono text-2xl font-bold">
            ₹{Math.round(avgTxnValue).toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-xs text-mute">Per transaction mean</div>
        </div>
        <div className="rounded-xl border border-line bg-panel p-5">
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-mute">
            Total Income
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-signal">
            ₹{income.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-xs text-signal flex items-center gap-1">
            <TrendingUp className="size-3" /> Incoming flows
          </div>
        </div>
        <div className="rounded-xl border border-line bg-panel p-5">
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-mute">
            Total Expenses
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-warning-signal">
            ₹{expenses.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-xs text-warning-signal flex items-center gap-1">
            <TrendingDown className="size-3" /> Outgoing flows
          </div>
        </div>
      </div>

      {/* Actionable Insights Section */}
      <div className="mt-8">
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

      {/* Charts Section */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Income vs Expenses Chart, with next-month forecast */}
        <div className="rounded-xl border border-line bg-panel p-6">
          <div className="mb-4">
            <h3 className="font-display font-bold">Expense Trend & Forecast</h3>
            <p className="text-xs text-mute">
              {forecast.hasEnoughData
                ? "Actual monthly spend, with a projected next month based on a moving average."
                : "Comparative monthly activity timeline"}
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
                      name="Actual expense"
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      strokeDasharray="5 4"
                      dot={{ r: 3 }}
                      name="Forecast"
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

        {/* Spending Category Breakdown */}
        <div className="rounded-xl border border-line bg-panel p-6">
          <div className="mb-4">
            <h3 className="font-display font-bold">Category Distribution</h3>
            <p className="text-xs text-mute">Expenditure breakdown by merchant & category</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            {categoryData.length === 0 ? (
              <div className="text-sm text-mute font-mono">No expense data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#171717",
                      borderColor: "#262626",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Anomaly detection */}
      {anomalies.length > 0 && (
        <div className="mt-8 rounded-xl border border-warning-signal/30 bg-warning-signal/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Radar className="size-5 text-warning-signal" />
            <h3 className="font-display font-bold">Unusual Transactions</h3>
          </div>
          <p className="mb-4 text-xs text-mute">
            Transactions flagged as statistical outliers vs. your typical spend in the same
            category.
          </p>
          <div className="space-y-2">
            {anomalies.slice(0, 6).map((a) => (
              <div
                key={a.transaction.id}
                className="flex items-center justify-between rounded-lg border border-line bg-panel px-4 py-2.5 text-xs"
              >
                <div>
                  <div className="font-medium text-ink">
                    {a.transaction.merchant ?? "Transaction"}
                  </div>
                  <div className="text-mute">
                    {a.categoryLabel} ·{" "}
                    {new Date(a.transaction.transaction_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold text-warning-signal">
                    ₹{Number(a.transaction.amount).toLocaleString("en-IN")}
                  </div>
                  <div className="font-mono text-[10px] text-mute">
                    {a.zScore.toFixed(1)}σ above usual
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
