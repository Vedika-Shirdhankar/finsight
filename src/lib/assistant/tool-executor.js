/**
 * FinSight Allowlisted Tool Executor
 * 
 * Safely executes authorized data analytics and query functions based on validated intent schemas.
 * 
 * PRIVACY & SECURITY RULES:
 * 1. Actor identity is strictly enforced via authenticated userId.
 * 2. Only allowlisted tools are callable.
 * 3. Minimal aggregated results are returned.
 * 4. Write operations are returned as STAGED proposals requiring explicit confirmation.
 */

import {
    detectAnomalies,
    calculateFinancialHealthScore,
    forecastNextMonthSpend,
    calculateCategoryDrift,
} from "../analytics.js";
import { INTENTS, ALLOWLISTED_ROUTES } from "./intent-parser.js";

/**
 * Tool 1: Get Spending Summary
 */
export function executeGetSpending(intent, context) {
    const { transactions = [], categories = [] } = context;
    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    const period = intent.period || { from: null, to: null, label: "All Time" };

    // Filter by date range and type
    let filtered = transactions.filter((t) => t.type === "expense");
    if (period.from) filtered = filtered.filter((t) => t.transaction_date >= period.from);
    if (period.to) filtered = filtered.filter((t) => t.transaction_date <= period.to + "T23:59:59");

    // Filter by category if specified
    if (intent.category?.id) {
        filtered = filtered.filter((t) => t.category_id === intent.category.id);
    } else if (intent.category?.name) {
        const catNameLower = intent.category.name.toLowerCase();
        filtered = filtered.filter((t) => {
            const name = t.category_id ? catMap.get(t.category_id) || "" : "";
            return name.toLowerCase().includes(catNameLower);
        });
    }

    // Filter by amount range
    if (intent.minAmount !== null && intent.minAmount !== undefined) {
        filtered = filtered.filter((t) => Number(t.amount) >= intent.minAmount);
    }
    if (intent.maxAmount !== null && intent.maxAmount !== undefined) {
        filtered = filtered.filter((t) => Number(t.amount) <= intent.maxAmount);
    }

    const totalAmount = filtered.reduce((s, t) => s + Number(t.amount || 0), 0);
    const count = filtered.length;
    const average = count > 0 ? Math.round(totalAmount / count) : 0;
    const categoryLabel = intent.category?.name || "All Categories";

    // Category breakdown
    const breakdown = {};
    filtered.forEach((t) => {
        const name = t.category_id ? catMap.get(t.category_id) || "Uncategorized" : "Uncategorized";
        breakdown[name] = (breakdown[name] || 0) + Number(t.amount);
    });

    const topCategories = Object.entries(breakdown)
        .map(([name, amount]) => ({ name, amount: Math.round(amount) }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 4);

    return {
        type: "SPENDING_SUMMARY",
        title: `${categoryLabel} Spending (${period.label})`,
        totalAmount: Math.round(totalAmount),
        transactionCount: count,
        averageAmount: average,
        categoryName: categoryLabel,
        periodLabel: period.label,
        topCategories,
        actionUrl: "/dashboard/transactions",
        actionLabel: "View in Transactions",
        message: `You spent ₹${Math.round(totalAmount).toLocaleString("en-IN")} on ${categoryLabel} during ${period.label} across ${count} transactions (avg ₹${average.toLocaleString("en-IN")}/txn).`,
    };
}

/**
 * Tool 2: Get Filtered Transactions List
 */
export function executeGetTransactions(intent, context) {
    const { transactions = [], categories = [] } = context;
    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    const period = intent.period || { from: null, to: null, label: "All Time" };

    let filtered = [...transactions];
    if (period.from) filtered = filtered.filter((t) => t.transaction_date >= period.from);
    if (period.to) filtered = filtered.filter((t) => t.transaction_date <= period.to + "T23:59:59");

    if (intent.category?.id) {
        filtered = filtered.filter((t) => t.category_id === intent.category.id);
    }

    if (intent.minAmount !== null && intent.minAmount !== undefined) {
        filtered = filtered.filter((t) => Number(t.amount) >= intent.minAmount);
    }
    if (intent.maxAmount !== null && intent.maxAmount !== undefined) {
        filtered = filtered.filter((t) => Number(t.amount) <= intent.maxAmount);
    }

    if (intent.isHighestFirst) {
        filtered.sort((a, b) => Number(b.amount) - Number(a.amount));
    } else {
        filtered.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
    }

    const matched = filtered.slice(0, 6).map((t) => ({
        id: t.id,
        merchant: t.merchant || "Transaction",
        amount: Number(t.amount),
        type: t.type,
        category: t.category_id ? catMap.get(t.category_id) || "General" : "Uncategorized",
        date: t.transaction_date.slice(0, 10),
    }));

    return {
        type: "TRANSACTION_LIST",
        title: intent.isHighestFirst ? "Highest Expense Transactions" : "Matching Transactions",
        totalFound: filtered.length,
        items: matched,
        actionUrl: "/dashboard/transactions",
        actionLabel: "Open Full Ledger",
        message: filtered.length > 0 
            ? `Found ${filtered.length} matching transactions (${intent.period?.label || "recent"}):`
            : "No transactions found matching the specified criteria.",
    };
}

/**
 * Tool 3: Get Budget Status
 */
export function executeGetBudgetStatus(intent, context) {
    const { budget, transactions = [], categories = [] } = context;
    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    const budgetCategories = budget?.budget_categories || [];

    if (budgetCategories.length === 0) {
        return {
            type: "BUDGET_STATUS",
            title: "Monthly Budget Status",
            status: "NO_BUDGETS",
            actionUrl: "/dashboard/budgets",
            actionLabel: "Create Budget Limits",
            message: "You haven't set up any category budget limits for this month yet.",
        };
    }

    const now = new Date();
    const curMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const curMonthExpenses = transactions.filter((t) => 
        t.type === "expense" && t.transaction_date && t.transaction_date.slice(0, 7) === curMonthKey
    );

    const spendByCat = new Map();
    curMonthExpenses.forEach((t) => {
        if (t.category_id) spendByCat.set(t.category_id, (spendByCat.get(t.category_id) || 0) + Number(t.amount));
    });

    const statusList = budgetCategories.map((bc) => {
        const spent = spendByCat.get(bc.category_id) || 0;
        const limit = Number(bc.limit_amount) || 1;
        const pct = Math.round((spent / limit) * 100);
        return {
            categoryName: catMap.get(bc.category_id) || "Category",
            limit: Math.round(limit),
            spent: Math.round(spent),
            percentage: pct,
            isExceeded: spent > limit,
            isNearLimit: pct >= 80 && spent <= limit,
        };
    });

    const atRisk = statusList.filter((s) => s.percentage >= 80);

    return {
        type: "BUDGET_STATUS",
        title: "Monthly Budget Status",
        totalBudgets: statusList.length,
        atRiskCount: atRisk.length,
        categories: statusList.slice(0, 5),
        actionUrl: "/dashboard/budgets",
        actionLabel: "Manage Budgets",
        message: atRisk.length > 0
            ? `⚠️ You have ${atRisk.length} category budgets near or exceeding their monthly limit.`
            : `✅ Excellent discipline! All ${statusList.length} budget categories are comfortably within limits.`,
    };
}

/**
 * Tool 4: Get Savings Goals Progress
 */
export function executeGetGoals(intent, context) {
    const { goals = [] } = context;

    if (goals.length === 0) {
        return {
            type: "SAVINGS_GOALS",
            title: "Savings Goals",
            items: [],
            actionUrl: "/dashboard/goals",
            actionLabel: "Set Savings Goal",
            message: "No savings goals created yet. Set up a target to track your progress!",
        };
    }

    const items = goals.map((g) => {
        const current = Number(g.current_amount || 0);
        const target = Number(g.target_amount || 1);
        const progress = Math.min(100, Math.round((current / target) * 100));
        return {
            id: g.id,
            name: g.name,
            currentAmount: Math.round(current),
            targetAmount: Math.round(target),
            progress,
            targetDate: g.target_date || "Open",
        };
    });

    return {
        type: "SAVINGS_GOALS",
        title: "Active Savings Goals",
        totalGoals: goals.length,
        items,
        actionUrl: "/dashboard/goals",
        actionLabel: "View All Goals",
        message: `Tracking ${goals.length} active savings goals:`,
    };
}

/**
 * Tool 5: Get Recurring Transactions
 */
export function executeGetRecurring(intent, context) {
    const { recurringTxns = [] } = context;
    const active = recurringTxns.filter((r) => r.is_active);

    const totalMonthly = active.reduce((s, r) => {
        const amt = Number(r.amount || 0);
        if (r.frequency === "weekly") return s + amt * 4.33;
        if (r.frequency === "yearly") return s + amt / 12;
        return s + amt;
    }, 0);

    return {
        type: "RECURRING_LIST",
        title: "Recurring Subscriptions & Bills",
        activeCount: active.length,
        totalMonthlyOverhead: Math.round(totalMonthly),
        items: active.slice(0, 5).map((r) => ({
            id: r.id,
            merchant: r.merchant,
            amount: Number(r.amount),
            frequency: r.frequency,
            nextDueDate: r.next_due_date || "Pending",
        })),
        actionUrl: "/dashboard/recurring",
        actionLabel: "Manage Recurring",
        message: `You have ${active.length} active recurring commitments totaling ₹${Math.round(totalMonthly).toLocaleString("en-IN")}/month.`,
    };
}

/**
 * Tool 6: Get Anomaly Detection
 */
export function executeGetAnomalies(intent, context) {
    const { transactions = [], categories = [] } = context;
    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    const anomalies = detectAnomalies(transactions, catMap);

    return {
        type: "ANOMALY_RADAR",
        title: "Unusual Spending Outliers",
        anomalyCount: anomalies.length,
        items: anomalies.slice(0, 5).map((a) => ({
            merchant: a.transaction.merchant || "Transaction",
            amount: Number(a.transaction.amount),
            category: a.categoryLabel,
            severity: a.severity,
            zScore: a.zScore,
            reason: a.reason,
        })),
        actionUrl: "/dashboard/insights",
        actionLabel: "Open Anomaly Radar",
        message: anomalies.length > 0
            ? `Detected ${anomalies.length} statistical anomaly transactions requiring review:`
            : "✅ No unusual transactions detected. Your spending patterns align with baseline history.",
    };
}

/**
 * Tool 7: Get Spending Forecast
 */
export function executeGetForecast(intent, context) {
    const { transactions = [] } = context;
    const forecast = forecastNextMonthSpend(transactions, 3);

    return {
        type: "FORECAST_SUMMARY",
        title: "Next Month Spending Projection",
        projectedSpend: forecast.projectedNextMonth,
        trendPercentage: forecast.trendPct,
        hasEnoughData: forecast.hasEnoughData,
        actionUrl: "/dashboard/insights",
        actionLabel: "View Analytics",
        message: forecast.hasEnoughData
            ? `Based on your recent 3-month moving average, your projected spending for next month is ₹${forecast.projectedNextMonth.toLocaleString("en-IN")} (${forecast.trendPct >= 0 ? "+" : ""}${forecast.trendPct}% trend).`
            : "Add at least 2 consecutive months of transactions to generate accurate projection baselines.",
    };
}

/**
 * Tool 8: Get Financial Health Summary
 */
export function executeGetHealthScore(intent, context) {
    const { transactions = [], budget, goals = [], recurringTxns = [], accounts = [] } = context;
    const health = calculateFinancialHealthScore(transactions, budget, goals, recurringTxns, accounts);

    return {
        type: "HEALTH_SCORE_SUMMARY",
        title: "Financial Health Score",
        score: health.score,
        grade: health.grade,
        components: health.components,
        explanations: health.explanations.slice(0, 3),
        actionUrl: "/dashboard/insights",
        actionLabel: "Full Health Score Breakdown",
        message: `Your FinSight Financial Health Score is ${health.score}/100 (${health.grade}).`,
    };
}

/**
 * Tool 9: Safe Route Navigation
 */
export function executeNavigate(intent) {
    return {
        type: "NAVIGATION_ACTION",
        title: `Navigate to ${intent.targetLabel}`,
        targetRoute: intent.targetRoute,
        targetLabel: intent.targetLabel,
        actionUrl: intent.targetRoute,
        actionLabel: `Go to ${intent.targetLabel}`,
        message: `Redirecting you to ${intent.targetLabel}... Click below if not redirected automatically.`,
    };
}

/**
 * Tool 10: Prepare Financial Write (Requires Confirmation)
 */
export function executePrepareTransaction(intent) {
    return {
        type: "TRANSACTION_STAGING",
        title: "Confirm New Transaction",
        requiresConfirmation: true,
        pendingAction: {
            type: "CREATE_TRANSACTION",
            payload: intent.transactionData,
        },
        message: "Please review and confirm this transaction before it is recorded:",
    };
}

/**
 * Master Tool Dispatcher
 * Maps parsed user intent to authorized tool execution.
 * 
 * @param {Object} intent - Validated intent object
 * @param {Object} context - Authenticated user context
 * @returns {Object} Structured UI result card payload
 */
export function dispatchToolExecution(intent, context) {
    if (!intent.isSafe) {
        return {
            type: "SECURITY_REFUSAL",
            title: "Access Restricted",
            message: intent.error || "Security policy violation detected.",
        };
    }

    switch (intent.intent) {
        case INTENTS.GET_SPENDING:
            return executeGetSpending(intent, context);
        case INTENTS.GET_TRANSACTIONS:
            return executeGetTransactions(intent, context);
        case INTENTS.GET_BUDGET_STATUS:
            return executeGetBudgetStatus(intent, context);
        case INTENTS.GET_GOALS:
            return executeGetGoals(intent, context);
        case INTENTS.GET_RECURRING:
            return executeGetRecurring(intent, context);
        case INTENTS.GET_ANOMALIES:
            return executeGetAnomalies(intent, context);
        case INTENTS.GET_FORECAST:
            return executeGetForecast(intent, context);
        case INTENTS.GET_HEALTH_SCORE:
            return executeGetHealthScore(intent, context);
        case INTENTS.NAVIGATE:
            return executeNavigate(intent);
        case INTENTS.PREPARE_TRANSACTION:
            return executePrepareTransaction(intent);
        default:
            return {
                type: "GENERAL_INFO",
                title: "Assistant Help",
                message: "I can help you analyze spending, track budgets, inspect unusual transactions, monitor savings goals, or calculate your financial health score.",
            };
    }
}
