/**
 * FinSight Advanced Analytics & Financial Intelligence Engine
 * 
 * Provides:
 * 1. Explainable Statistical Anomaly Detection (Z-Score + Category Sampling)
 * 2. 5-Component Transparent Financial Health Score (0-100)
 * 3. Explainable Spending Forecasting (Moving Window Baseline)
 * 4. Month-over-Month Category Drift & Momentum
 * 5. 90-Day Liquidity & Cash Flow Trajectory
 * 6. Dynamic Monthly Financial Summary & Insights Narratives
 */

/**
 * Flags expense transactions that are unusually large relative to category historical baseline.
 * Uses explainable Z-Score statistical anomaly detection with sample size safety guards.
 *
 * @param {Array} transactions - List of transaction objects
 * @param {Map|Object} categoryNameById - Category ID to Name mapping
 * @param {Object} [opts={}] - Options (zThreshold, minSample)
 * @returns {Array} Sorted list of detected anomalies with explanations
 */
export function detectAnomalies(transactions = [], categoryNameById = new Map(), opts = {}) {
    const zThreshold = opts.zThreshold ?? 2.2;
    const minSample = opts.minSample ?? 3;
    const expenses = (transactions || []).filter((t) => t.type === "expense");

    const getCatName = (id) => {
        if (!id) return "Uncategorized";
        if (categoryNameById instanceof Map) return categoryNameById.get(id) || "General";
        return categoryNameById[id] || "General";
    };

    // Group expenses by category
    const groups = new Map();
    for (const t of expenses) {
        const key = t.category_id ?? "__uncategorized__";
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(t);
    }

    const anomalies = [];
    for (const [key, group] of groups) {
        // Guard: Skip categories with insufficient sample size to avoid false confidence
        if (group.length < minSample) continue;

        const amounts = group.map((t) => Number(t.amount)).filter((a) => !isNaN(a) && a > 0);
        if (amounts.length < minSample) continue;

        const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length;
        const variance = amounts.reduce((s, a) => s + (a - mean) ** 2, 0) / amounts.length;
        const stdDev = Math.sqrt(variance);

        // Guard: Skip if zero variance (all transactions same amount)
        if (stdDev === 0) continue;

        const catLabel = key === "__uncategorized__" ? "Uncategorized" : getCatName(key);

        for (const t of group) {
            const amount = Number(t.amount);
            const z = (amount - mean) / stdDev;

            if (z >= zThreshold) {
                let severity = "Low";
                if (z >= 3.5 || amount >= mean * 3) {
                    severity = "High";
                } else if (z >= 2.5) {
                    severity = "Medium";
                }

                anomalies.push({
                    transaction: t,
                    zScore: Number(z.toFixed(2)),
                    mean: Math.round(mean),
                    stdDev: Math.round(stdDev),
                    sampleSize: group.length,
                    categoryLabel: catLabel,
                    severity,
                    reason: `This ₹${Math.round(amount).toLocaleString("en-IN")} transaction is ${z.toFixed(1)}σ above your typical ${catLabel} average (₹${Math.round(mean).toLocaleString("en-IN")})`,
                });
            }
        }
    }

    return anomalies.sort((a, b) => b.zScore - a.zScore);
}

/**
 * Calculates a transparent, explainable Financial Health Score from 0 to 100.
 * 
 * Components (Total 100 pts):
 * - Savings Rate (30 pts): benchmarked at 20%+ savings
 * - Budget Adherence (20 pts): percentage of budget categories within limit
 * - Spending Stability (20 pts): month-over-month expenditure volatility (lower CV = higher score)
 * - Goal Progress (15 pts): average funding progress across active savings goals
 * - Recurring Overhead (15 pts): committed recurring expenses as % of income (<=30% is optimal)
 *
 * @param {Array} transactions - All transactions
 * @param {Object|Array} budgets - Budget data or list of budgets
 * @param {Array} goals - Savings goals list
 * @param {Array} recurringTxns - Recurring transactions list
 * @param {Array} accounts - Accounts list
 * @returns {Object} Score breakdown, grade, explanation narratives, and data warnings
 */
export function calculateFinancialHealthScore(transactions = [], budgets = [], goals = [], recurringTxns = [], accounts = []) {
    const dataWarnings = [];
    const explanations = [];

    const txns = transactions || [];
    const totalIncome = txns
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + Number(t.amount || 0), 0);
    const totalExpense = txns
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + Number(t.amount || 0), 0);

    const hasTransactions = txns.length > 0;
    const hasIncome = totalIncome > 0;

    if (!hasTransactions) {
        return {
            score: 0,
            grade: "Insufficient Data",
            hasEnoughData: false,
            components: {
                savingsRate: { score: 0, max: 30, value: "0%", status: "No Data" },
                budgetAdherence: { score: 0, max: 20, value: "N/A", status: "No Data" },
                spendingStability: { score: 0, max: 20, value: "N/A", status: "No Data" },
                goalProgress: { score: 0, max: 15, value: "N/A", status: "No Data" },
                recurringOverhead: { score: 0, max: 15, value: "N/A", status: "No Data" },
            },
            explanations: ["Add your income and expense transactions to calculate your Financial Health Score."],
            dataWarnings: ["No transactions recorded yet."],
        };
    }

    if (!hasIncome) {
        dataWarnings.push("No income transactions found. Savings rate and recurring ratios use baseline estimates.");
    }

    // 1. Savings Rate Score (Max 30 pts)
    let savingsRatePts = 0;
    let savingsRatePct = 0;
    if (hasIncome) {
        const netSavings = totalIncome - totalExpense;
        savingsRatePct = Math.max(0, (netSavings / totalIncome) * 100);
        // 20%+ savings rate gets full 30 pts
        savingsRatePts = Math.min(30, Math.round((savingsRatePct / 20) * 30));
        if (savingsRatePct >= 20) {
            explanations.push(`Outstanding savings rate of ${savingsRatePct.toFixed(1)}% (exceeds the 20% benchmark).`);
        } else if (savingsRatePct >= 10) {
            explanations.push(`Moderate savings rate of ${savingsRatePct.toFixed(1)}%. Aim for 20% for optimal score.`);
        } else {
            explanations.push(`Low savings rate of ${savingsRatePct.toFixed(1)}%. Expenditures are consuming most income.`);
        }
    } else {
        savingsRatePts = totalExpense === 0 ? 15 : 5;
        explanations.push("Log your monthly income to unlock full savings rate scoring.");
    }

    // 2. Budget Adherence Score (Max 20 pts)
    let budgetPts = 0;
    const budgetList = Array.isArray(budgets) ? budgets : (budgets?.budget_categories ? [budgets] : []);
    const budgetCategories = budgetList.flatMap((b) => b.budget_categories || []);

    if (budgetCategories.length > 0) {
        const spendByCat = new Map();
        txns.filter((t) => t.type === "expense" && t.category_id).forEach((t) => {
            spendByCat.set(t.category_id, (spendByCat.get(t.category_id) || 0) + Number(t.amount));
        });

        const withinBudgetCount = budgetCategories.filter((bc) => {
            const spent = spendByCat.get(bc.category_id) || 0;
            const limit = Number(bc.limit_amount) || 0;
            return limit > 0 && spent <= limit;
        }).length;

        const adherenceRatio = withinBudgetCount / budgetCategories.length;
        budgetPts = Math.round(adherenceRatio * 20);
        explanations.push(`${withinBudgetCount} of ${budgetCategories.length} budget categories remain within set limits.`);
    } else {
        // Neutral baseline if no budgets set
        budgetPts = 14;
        dataWarnings.push("No budget limits set. Create category budgets to get precise budget adherence scoring.");
        explanations.push("Create monthly budget limits to improve budget adherence tracking.");
    }

    // 3. Spending Stability Score (Max 20 pts)
    let stabilityPts = 15;
    const monthlyExpenses = new Map();
    txns.filter((t) => t.type === "expense").forEach((t) => {
        const monthKey = t.transaction_date ? t.transaction_date.slice(0, 7) : "current";
        monthlyExpenses.set(monthKey, (monthlyExpenses.get(monthKey) || 0) + Number(t.amount));
    });

    const monthTotals = Array.from(monthlyExpenses.values());
    if (monthTotals.length >= 2) {
        const avgMonthly = monthTotals.reduce((s, a) => s + a, 0) / monthTotals.length;
        const variance = monthTotals.reduce((s, a) => s + (a - avgMonthly) ** 2, 0) / monthTotals.length;
        const stdDev = Math.sqrt(variance);
        const cv = avgMonthly > 0 ? stdDev / avgMonthly : 0; // Coefficient of Variation

        if (cv <= 0.15) {
            stabilityPts = 20;
            explanations.push("Highly consistent month-over-month spending with minimal volatility.");
        } else if (cv <= 0.35) {
            stabilityPts = 16;
            explanations.push("Stable monthly expenditures with moderate fluctuations.");
        } else if (cv <= 0.60) {
            stabilityPts = 11;
            explanations.push("Noticeable expenditure volatility between months.");
        } else {
            stabilityPts = 7;
            explanations.push("High spending volatility detected. Significant spikes observed across months.");
        }
    } else {
        stabilityPts = 15;
        dataWarnings.push("Less than 2 months of history available for spending volatility analysis.");
    }

    // 4. Goal Progress Score (Max 15 pts)
    let goalPts = 0;
    const activeGoals = (goals || []).filter((g) => Number(g.target_amount) > 0);
    if (activeGoals.length > 0) {
        const avgProgress = activeGoals.reduce((s, g) => {
            const current = Number(g.current_amount || 0);
            const target = Number(g.target_amount || 1);
            return s + Math.min(1.0, current / target);
        }, 0) / activeGoals.length;

        goalPts = Math.round(avgProgress * 15);
        explanations.push(`Active savings goals are on average ${(avgProgress * 100).toFixed(0)}% funded.`);
    } else {
        goalPts = 10;
        dataWarnings.push("No active savings goals found. Set savings targets to track goal health.");
        explanations.push("Set savings goals to build targeted reserves and boost your score.");
    }

    // 5. Recurring Expense Overhead Score (Max 15 pts)
    let recurringPts = 12;
    const activeRecurringExpenses = (recurringTxns || [])
        .filter((r) => r.type === "expense" && r.is_active)
        .reduce((s, r) => s + Number(r.amount || 0), 0);

    if (hasIncome && activeRecurringExpenses > 0) {
        const recurringRatio = activeRecurringExpenses / totalIncome;
        if (recurringRatio <= 0.30) {
            recurringPts = 15;
            explanations.push(`Committed recurring subscriptions/bills are ${(recurringRatio * 100).toFixed(0)}% of income (safe <30% threshold).`);
        } else if (recurringRatio <= 0.50) {
            recurringPts = 10;
            explanations.push(`Fixed recurring commitments are ${(recurringRatio * 100).toFixed(0)}% of monthly income.`);
        } else {
            recurringPts = 5;
            explanations.push(`High fixed overhead: ${(recurringRatio * 100).toFixed(0)}% of income is committed to recurring expenses.`);
        }
    } else if (activeRecurringExpenses === 0) {
        recurringPts = 14;
        explanations.push("Low fixed recurring overhead detected.");
    }

    const totalScore = Math.max(0, Math.min(100, savingsRatePts + budgetPts + stabilityPts + goalPts + recurringPts));

    let grade = "Fair";
    if (totalScore >= 80) grade = "Excellent";
    else if (totalScore >= 65) grade = "Good";
    else if (totalScore >= 50) grade = "Fair";
    else grade = "Needs Attention";

    return {
        score: totalScore,
        grade,
        hasEnoughData: true,
        components: {
            savingsRate: { score: savingsRatePts, max: 30, value: `${savingsRatePct.toFixed(1)}%`, status: savingsRatePts >= 24 ? "Optimal" : savingsRatePts >= 15 ? "Moderate" : "Low" },
            budgetAdherence: { score: budgetPts, max: 20, value: budgetCategories.length > 0 ? `${Math.round((budgetPts / 20) * 100)}%` : "N/A", status: budgetPts >= 16 ? "Optimal" : budgetPts >= 12 ? "Fair" : "At Risk" },
            spendingStability: { score: stabilityPts, max: 20, value: monthTotals.length >= 2 ? "Calculated" : "Baseline", status: stabilityPts >= 16 ? "Stable" : "Volatile" },
            goalProgress: { score: goalPts, max: 15, value: activeGoals.length > 0 ? `${activeGoals.length} Goals` : "None", status: goalPts >= 12 ? "On Track" : "In Progress" },
            recurringOverhead: { score: recurringPts, max: 15, value: `₹${Math.round(activeRecurringExpenses).toLocaleString("en-IN")}/mo`, status: recurringPts >= 12 ? "Low Risk" : "High Overhead" },
        },
        explanations,
        dataWarnings,
    };
}

/**
 * Projects next month spending using moving historical average baseline.
 */
export function forecastNextMonthSpend(transactions = [], windowMonths = 3) {
    const byMonth = new Map();
    for (const t of (transactions || [])) {
        if (t.type !== "expense") continue;
        const key = t.transaction_date ? t.transaction_date.slice(0, 7) : null;
        if (!key) continue;
        byMonth.set(key, (byMonth.get(key) ?? 0) + Number(t.amount || 0));
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

    return { 
        history, 
        projectedNextMonth: Math.round(projectedNextMonth), 
        trendPct: Number(trendPct.toFixed(1)), 
        hasEnoughData: true 
    };
}

/**
 * Calculates month-over-month category spending drift & momentum.
 */
export function calculateCategoryDrift(transactions = [], categoryNameById = new Map()) {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

    const getCatName = (id) => {
        if (!id) return "Uncategorized";
        if (categoryNameById instanceof Map) return categoryNameById.get(id) || "Uncategorized";
        return categoryNameById[id] || "Uncategorized";
    };

    const currMap = new Map();
    const prevMap = new Map();

    for (const t of (transactions || [])) {
        if (t.type !== "expense") continue;
        const key = t.transaction_date ? t.transaction_date.slice(0, 7) : null;
        const catName = getCatName(t.category_id);

        if (key === currentMonthKey) {
            currMap.set(catName, (currMap.get(catName) ?? 0) + Number(t.amount || 0));
        } else if (key === prevMonthKey) {
            prevMap.set(catName, (prevMap.get(catName) ?? 0) + Number(t.amount || 0));
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
        } else if (currentMonth > 0) {
            changePct = 100;
        }

        let status = "Stable";
        if (changePct >= 15) status = "Accelerating";
        else if (changePct <= -15) status = "Decelerating";

        return {
            categoryName: cat,
            currentMonth: Math.round(currentMonth),
            previousMonth: Math.round(previousMonth),
            changePct: Number(changePct.toFixed(1)),
            absoluteDiff: Math.round(absoluteDiff),
            status,
        };
    });

    return drifts.sort((a, b) => Math.abs(b.absoluteDiff) - Math.abs(a.absoluteDiff));
}

/**
 * Projects 30, 60, and 90-day liquidity and cash flow trajectory based on
 * recurring income, recurring subscriptions/bills, and goal funding targets.
 */
export function projectCashFlow(currentBalance = 0, recurringTxns = [], goals = [], avgMonthlyDiscretionary = 0) {
    const monthlyRecurringInflow = (recurringTxns || [])
        .filter((r) => r.type === "income" && r.is_active)
        .reduce((s, r) => s + Number(r.amount || 0), 0);

    const monthlyRecurringOutflow = (recurringTxns || [])
        .filter((r) => r.type === "expense" && r.is_active)
        .reduce((s, r) => s + Number(r.amount || 0), 0);

    const monthlyGoalTarget = (goals || [])
        .filter((g) => Number(g.target_amount) > Number(g.current_amount))
        .reduce((s, g) => {
            const remaining = Number(g.target_amount) - Number(g.current_amount);
            return s + Math.min(remaining / 6, remaining);
        }, 0);

    const timeline = [];
    let balance = currentBalance;

    timeline.push({
        period: "Current",
        projectedBalance: Math.round(currentBalance),
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

/**
 * Generates comprehensive Month-over-Month Financial Summary and explainable narratives.
 * 
 * @param {Array} transactions - All transactions
 * @param {Object|Array} budgets - Budget data
 * @param {Map|Object} categoryNameById - Category map
 * @returns {Object} Current vs previous month metrics and narrative insights
 */
export function generateMonthlyInsights(transactions = [], budgets = [], categoryNameById = new Map()) {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

    const currentMonthLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    const prevMonthLabel = prevDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

    let curIncome = 0, curExpense = 0;
    let prevIncome = 0, prevExpense = 0;

    for (const t of (transactions || [])) {
        const dStr = t.transaction_date ? t.transaction_date.slice(0, 7) : null;
        const amt = Number(t.amount || 0);

        if (dStr === currentMonthKey) {
            if (t.type === "income") curIncome += amt;
            if (t.type === "expense") curExpense += amt;
        } else if (dStr === prevMonthKey) {
            if (t.type === "income") prevIncome += amt;
            if (t.type === "expense") prevExpense += amt;
        }
    }

    const curSavings = curIncome - curExpense;
    const prevSavings = prevIncome - prevExpense;
    const curSavingsRate = curIncome > 0 ? (curSavings / curIncome) * 100 : 0;
    const prevSavingsRate = prevIncome > 0 ? (prevSavings / prevIncome) * 100 : 0;

    const expenseDeltaPct = prevExpense > 0 ? ((curExpense - prevExpense) / prevExpense) * 100 : 0;
    const incomeDeltaPct = prevIncome > 0 ? ((curIncome - prevIncome) / prevIncome) * 100 : 0;
    const savingsDeltaPct = prevSavings > 0 ? ((curSavings - prevSavings) / prevSavings) * 100 : 0;

    // Category drift for current vs prev
    const categoryDrifts = calculateCategoryDrift(transactions, categoryNameById);
    const topAccelerating = categoryDrifts.filter((c) => c.status === "Accelerating");
    const topDecelerating = categoryDrifts.filter((c) => c.status === "Decelerating");

    // Dynamic narratives
    const narratives = [];

    if (topAccelerating.length > 0) {
        const top = topAccelerating[0];
        narratives.push(`Your ${top.categoryName} spending increased ${Math.abs(top.changePct)}% (+₹${top.absoluteDiff.toLocaleString("en-IN")}) compared with ${prevMonthLabel}.`);
    }

    if (topDecelerating.length > 0) {
        const top = topDecelerating[0];
        narratives.push(`Great job trimming ${top.categoryName} expenses by ${Math.abs(top.changePct)}% (−₹${Math.abs(top.absoluteDiff).toLocaleString("en-IN")}) this month.`);
    }

    if (curSavingsRate >= prevSavingsRate && curSavingsRate > 0) {
        narratives.push(`Your savings rate improved from ${prevSavingsRate.toFixed(1)}% to ${curSavingsRate.toFixed(1)}%.`);
    } else if (curSavingsRate < prevSavingsRate && prevSavingsRate > 0) {
        narratives.push(`Savings rate decreased from ${prevSavingsRate.toFixed(1)}% to ${curSavingsRate.toFixed(1)}% due to higher monthly outlays.`);
    }

    return {
        currentMonth: {
            monthKey: currentMonthKey,
            label: currentMonthLabel,
            income: Math.round(curIncome),
            expenses: Math.round(curExpense),
            savings: Math.round(curSavings),
            savingsRate: Number(curSavingsRate.toFixed(1)),
        },
        previousMonth: {
            monthKey: prevMonthKey,
            label: prevMonthLabel,
            income: Math.round(prevIncome),
            expenses: Math.round(prevExpense),
            savings: Math.round(prevSavings),
            savingsRate: Number(prevSavingsRate.toFixed(1)),
        },
        deltas: {
            expenseDeltaPct: Number(expenseDeltaPct.toFixed(1)),
            incomeDeltaPct: Number(incomeDeltaPct.toFixed(1)),
            savingsDeltaPct: Number(savingsDeltaPct.toFixed(1)),
        },
        categoryDrifts,
        narratives: narratives.length > 0 ? narratives : ["Add consecutive months of transactions to generate automatic comparative spending insights."],
    };
}
