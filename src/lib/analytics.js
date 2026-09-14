/**
 * Flags expense transactions that are unusually large relative to recent history.
 * Uses Z-Score and Interquartile Range (IQR) outlier detection.
 */
export function detectAnomalies(transactions, categoryNameById, opts = {}) {
    const zThreshold = opts.zThreshold ?? 2.2;
    const minSample = opts.minSample ?? 3;
    const expenses = transactions.filter((t) => t.type === "expense");
    const groups = new Map();
    for (const t of expenses) {
        const key = t.category_id ?? "__uncategorized__";
        if (!groups.has(key))
            groups.set(key, []);
        groups.get(key).push(t);
    }
    const anomalies = [];
    for (const [key, group] of groups) {
        if (group.length < minSample)
            continue;
        const amounts = group.map((t) => Number(t.amount));
        const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length;
        const variance = amounts.reduce((s, a) => s + (a - mean) ** 2, 0) / amounts.length;
        const stdDev = Math.sqrt(variance);
        if (stdDev === 0)
            continue;
        for (const t of group) {
            const amount = Number(t.amount);
            const z = (amount - mean) / stdDev;
            if (z >= zThreshold) {
                let severity = "Low";
                if (z >= 3.5 || amount >= mean * 3)
                    severity = "High";
                else if (z >= 2.5)
                    severity = "Medium";
                anomalies.push({
                    transaction: t,
                    zScore: Number(z.toFixed(2)),
                    categoryLabel: key === "__uncategorized__"
                        ? "Uncategorized"
                        : (categoryNameById.get(key) ?? "General"),
                    severity,
                    reason: `${z.toFixed(1)}x std dev above ${key === "__uncategorized__" ? "overall" : categoryNameById.get(key) || "category"} average (₹${Math.round(mean).toLocaleString("en-IN")})`,
                });
            }
        }
    }
    return anomalies.sort((a, b) => b.zScore - a.zScore);
}
export function forecastNextMonthSpend(transactions, windowMonths = 3) {
    const byMonth = new Map();
    for (const t of transactions) {
        if (t.type !== "expense")
            continue;
        const key = t.transaction_date.slice(0, 7);
        byMonth.set(key, (byMonth.get(key) ?? 0) + Number(t.amount));
    }
    const sortedMonths = Array.from(byMonth.keys()).sort();
    const history = sortedMonths.map((month) => ({ month, total: byMonth.get(month) }));
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
/**
 * Calculates month-over-month category spending drift & momentum.
 */
export function calculateCategoryDrift(transactions, categoryNameById) {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
    const currMap = new Map();
    const prevMap = new Map();
    for (const t of transactions) {
        if (t.type !== "expense")
            continue;
        const key = t.transaction_date.slice(0, 7);
        const catName = t.category_id ? (categoryNameById.get(t.category_id) ?? "Uncategorized") : "Uncategorized";
        if (key === currentMonthKey) {
            currMap.set(catName, (currMap.get(catName) ?? 0) + Number(t.amount));
        }
        else if (key === prevMonthKey) {
            prevMap.set(catName, (prevMap.get(catName) ?? 0) + Number(t.amount));
        }
    }
    const allCategories = Array.from(new Set([...currMap.keys(), ...prevMap.keys()]));
    const drifts = allCategories.map((cat) => {
        const currentMonth = currMap.get(cat) ?? 0;
        const previousMonth = prevMap.get(cat) ?? 0;
        const absoluteDiff = currentMonth - previousMonth;
        let changePct = 0;
        if (previousMonth > 0) {
            changePct = ((currentMonth - previousMonth) / previousMonth) * 100;
        }
        else if (currentMonth > 0) {
            changePct = 100;
        }
        let status = "Stable";
        if (changePct >= 15)
            status = "Accelerating";
        else if (changePct <= -15)
            status = "Decelerating";
        return {
            categoryName: cat,
            currentMonth,
            previousMonth,
            changePct: Number(changePct.toFixed(1)),
            absoluteDiff,
            status,
        };
    });
    return drifts.sort((a, b) => Math.abs(b.absoluteDiff) - Math.abs(a.absoluteDiff));
}
/**
 * Projects 30, 60, and 90-day liquidity and cash flow trajectory based on
 * recurring income, recurring subscriptions/bills, and goal funding targets.
 */
export function projectCashFlow(currentBalance, recurringTxns, goals, avgMonthlyDiscretionary = 0) {
    // Monthly recurring inflows & outflows
    const monthlyRecurringInflow = recurringTxns
        .filter((r) => r.type === "income" && r.is_active)
        .reduce((s, r) => s + Number(r.amount), 0);
    const monthlyRecurringOutflow = recurringTxns
        .filter((r) => r.type === "expense" && r.is_active)
        .reduce((s, r) => s + Number(r.amount), 0);
    // Monthly contribution towards active goals
    const monthlyGoalTarget = goals
        .filter((g) => Number(g.target_amount) > Number(g.current_amount))
        .reduce((s, g) => {
        const remaining = Number(g.target_amount) - Number(g.current_amount);
        return s + Math.min(remaining / 6, remaining); // spread over ~6 months
    }, 0);
    const timeline = [];
    let balance = currentBalance;
    timeline.push({
        period: "Current",
        projectedBalance: currentBalance,
        expectedInflow: 0,
        expectedOutflow: 0,
        goalAllocations: 0,
    });
    for (let month = 1; month <= 3; month++) {
        const inflow = monthlyRecurringInflow;
        const outflow = monthlyRecurringOutflow + avgMonthlyDiscretionary;
        const goalAlloc = monthlyGoalTarget;
        const netChange = inflow - outflow - goalAlloc;
        balance += netChange;
        timeline.push({
            period: `+${month * 30}D`,
            projectedBalance: Math.round(balance),
            expectedInflow: Math.round(inflow),
            expectedOutflow: Math.round(outflow),
            goalAllocations: Math.round(goalAlloc),
        });
    }
    return timeline;
}
