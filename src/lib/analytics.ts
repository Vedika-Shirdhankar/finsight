import type { Database } from "@/integrations/supabase/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export interface AnomalousTransaction {
  transaction: Transaction;
  /** How many standard deviations this amount is above the category's mean. */
  zScore: number;
  categoryLabel: string;
}

/**
 * Flags expense transactions that are unusually large relative to the
 * recent history of transactions in the same category (or overall, for
 * transactions without a category). Uses a z-score against the trailing
 * population so it adapts per-user instead of a fixed rupee threshold.
 *
 * Requires at least MIN_SAMPLE transactions in a group before it will flag
 * anything in that group — small samples make z-scores meaningless.
 */
export function detectAnomalies(
  transactions: Transaction[],
  categoryNameById: Map<string, string>,
  opts: { zThreshold?: number; minSample?: number } = {},
): AnomalousTransaction[] {
  const zThreshold = opts.zThreshold ?? 2.5;
  const minSample = opts.minSample ?? 5;

  const expenses = transactions.filter((t) => t.type === "expense");
  const groups = new Map<string, Transaction[]>();
  for (const t of expenses) {
    const key = t.category_id ?? "__uncategorized__";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  const anomalies: AnomalousTransaction[] = [];
  for (const [key, group] of groups) {
    if (group.length < minSample) continue;
    const amounts = group.map((t) => Number(t.amount));
    const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const variance = amounts.reduce((s, a) => s + (a - mean) ** 2, 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev === 0) continue;

    for (const t of group) {
      const z = (Number(t.amount) - mean) / stdDev;
      if (z >= zThreshold) {
        anomalies.push({
          transaction: t,
          zScore: z,
          categoryLabel:
            key === "__uncategorized__"
              ? "Uncategorized"
              : (categoryNameById.get(key) ?? "a category"),
        });
      }
    }
  }

  return anomalies.sort((a, b) => b.zScore - a.zScore);
}

export interface SpendForecast {
  /** Historical monthly expense totals used to build the forecast, oldest first. */
  history: { month: string; total: number }[];
  /** Projected total expense for next month, from a trailing moving average. */
  projectedNextMonth: number;
  /** Percent change vs. the most recent complete month, positive = projected increase. */
  trendPct: number;
  /** True once there's enough history (2+ months) to produce a meaningful forecast. */
  hasEnoughData: boolean;
}

/**
 * Groups expense transactions by calendar month and forecasts next month's
 * spend as a simple moving average of up to the last `windowMonths` months.
 * Deliberately simple (no seasonality/regression) so it's easy to reason
 * about and explain to a user, rather than a black-box prediction.
 */
export function forecastNextMonthSpend(
  transactions: Transaction[],
  windowMonths = 3,
): SpendForecast {
  const byMonth = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const key = t.transaction_date.slice(0, 7); // YYYY-MM
    byMonth.set(key, (byMonth.get(key) ?? 0) + Number(t.amount));
  }

  const sortedMonths = Array.from(byMonth.keys()).sort();
  const history = sortedMonths.map((month) => ({ month, total: byMonth.get(month)! }));

  if (history.length < 2) {
    return {
      history,
      projectedNextMonth: history[0]?.total ?? 0,
      trendPct: 0,
      hasEnoughData: false,
    };
  }

  const window = history.slice(-windowMonths);
  const projectedNextMonth = window.reduce((s, m) => s + m.total, 0) / window.length;
  const lastMonth = history[history.length - 1]?.total ?? 0;
  const trendPct = lastMonth > 0 ? ((projectedNextMonth - lastMonth) / lastMonth) * 100 : 0;

  return { history, projectedNextMonth, trendPct, hasEnoughData: true };
}
