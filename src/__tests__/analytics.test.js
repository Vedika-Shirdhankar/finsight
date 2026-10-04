/**
 * FinSight Analytics Engine Test Suite
 * Validates Z-Score Anomaly Detection, Financial Health Score, Forecasting, and Monthly Insights.
 */
import {
    detectAnomalies,
    calculateFinancialHealthScore,
    forecastNextMonthSpend,
    calculateCategoryDrift,
    generateMonthlyInsights,
    projectCashFlow,
} from "../lib/analytics.js";

export async function runAnalyticsTests() {
    console.log("=== 1. Analytics Engine & Algorithmic Tests ===");
    let passed = 0;
    let total = 0;

    function assert(condition, message) {
        total++;
        if (condition) {
            console.log(`  ✓ PASS: ${message}`);
            passed++;
        } else {
            console.error(`  ✗ FAIL: ${message}`);
            process.exitCode = 1;
        }
    }

    // 1. Anomaly Detection Tests
    console.log("  [Anomaly Detection]");
    const sampleCategoryMap = new Map([
        ["cat_dining", "Food & Dining"],
        ["cat_shopping", "Shopping"],
    ]);

    const normalDiningTxns = [
        { id: "1", amount: 250, type: "expense", category_id: "cat_dining", transaction_date: "2026-09-01" },
        { id: "2", amount: 300, type: "expense", category_id: "cat_dining", transaction_date: "2026-09-02" },
        { id: "3", amount: 280, type: "expense", category_id: "cat_dining", transaction_date: "2026-09-03" },
        { id: "4", amount: 320, type: "expense", category_id: "cat_dining", transaction_date: "2026-09-04" },
        { id: "5", amount: 260, type: "expense", category_id: "cat_dining", transaction_date: "2026-09-05" },
        { id: "6", amount: 310, type: "expense", category_id: "cat_dining", transaction_date: "2026-09-06" },
        { id: "7", amount: 290, type: "expense", category_id: "cat_dining", transaction_date: "2026-09-07" },
        { id: "8", amount: 270, type: "expense", category_id: "cat_dining", transaction_date: "2026-09-08" },
        // Severe outlier (₹4,500 vs baseline ~₹285)
        { id: "9", amount: 4500, type: "expense", category_id: "cat_dining", transaction_date: "2026-09-09" },
    ];

    const anomalies = detectAnomalies(normalDiningTxns, sampleCategoryMap);
    assert(anomalies.length === 1, "Correctly flagged single large outlier in dining");
    assert(anomalies[0].transaction.id === "9", "Identified correct transaction ID as anomaly");
    assert(anomalies[0].severity === "High", "Assigned High severity to 15x mean outlier");
    assert(anomalies[0].zScore >= 2.2, `Computed correct Z-Score (${anomalies[0].zScore} >= 2.2)`);
    assert(anomalies[0].reason.includes("Food & Dining"), "Generated human-readable category reason");

    // Edge case: Small sample size (< 3) should not trigger false positives
    const smallSampleTxns = [
        { id: "s1", amount: 100, type: "expense", category_id: "cat_shopping" },
        { id: "s2", amount: 1000, type: "expense", category_id: "cat_shopping" },
    ];
    const smallAnomalies = detectAnomalies(smallSampleTxns, sampleCategoryMap);
    assert(smallAnomalies.length === 0, "Small sample (<3 items) correctly skipped to prevent false confidence");

    // Edge case: Zero standard deviation
    const zeroStdDevTxns = [
        { id: "z1", amount: 500, type: "expense", category_id: "cat_dining" },
        { id: "z2", amount: 500, type: "expense", category_id: "cat_dining" },
        { id: "z3", amount: 500, type: "expense", category_id: "cat_dining" },
    ];
    const zeroStdAnomalies = detectAnomalies(zeroStdDevTxns, sampleCategoryMap);
    assert(zeroStdAnomalies.length === 0, "Zero standard deviation handled without division by zero");

    // 2. Financial Health Score Tests
    console.log("  [Financial Health Score]");
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonthStr = String(now.getMonth() + 1).padStart(2, "0");
    const prevMonthStr = String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2, "0");
    const prevYearStr = now.getMonth() === 0 ? curYear - 1 : curYear;

    const healthTxns = [
        { amount: 100000, type: "income", transaction_date: `${prevYearStr}-${prevMonthStr}-01` },
        { amount: 60000, type: "expense", category_id: "cat_dining", transaction_date: `${prevYearStr}-${prevMonthStr}-15` },
        { amount: 100000, type: "income", transaction_date: `${curYear}-${curMonthStr}-01` },
        { amount: 62000, type: "expense", category_id: "cat_dining", transaction_date: `${curYear}-${curMonthStr}-15` },
    ];
    const budgets = {
        budget_categories: [
            { category_id: "cat_dining", limit_amount: 70000 },
        ],
    };
    const goals = [
        { target_amount: 50000, current_amount: 35000 },
    ];
    const recurring = [
        { amount: 15000, type: "expense", is_active: true },
    ];

    const health = calculateFinancialHealthScore(healthTxns, budgets, goals, recurring);
    assert(health.score >= 70 && health.score <= 100, `Healthy profile receives good score: ${health.score}/100`);
    assert(health.hasEnoughData === true, "Marks profile as having enough data");
    assert(health.components.savingsRate.score === 30, "Savings rate of 38-40% receives maximum 30 points");
    assert(health.components.budgetAdherence.score === 20, "100% budget adherence receives full 20 points");
    assert(health.explanations.length >= 3, "Generates multiple explainable narrative bullets");

    // Edge case: Empty transactions
    const emptyHealth = calculateFinancialHealthScore([], [], [], []);
    assert(emptyHealth.score === 0, "Empty transaction ledger returns 0 score");
    assert(emptyHealth.hasEnoughData === false, "Correctly flags insufficient data");
    assert(emptyHealth.dataWarnings.length > 0, "Provides actionable data warning");

    // Edge case: No income recorded
    const noIncomeTxns = [{ amount: 5000, type: "expense", transaction_date: "2026-09-01" }];
    const noIncomeHealth = calculateFinancialHealthScore(noIncomeTxns, [], [], []);
    assert(noIncomeHealth.dataWarnings.some((w) => w.includes("No income")), "Flags missing income warning gracefully");

    // 3. Spending Forecasting Tests
    console.log("  [Spending Forecasting]");
    const multiMonthTxns = [
        { amount: 40000, type: "expense", transaction_date: "2026-06-15" },
        { amount: 42000, type: "expense", transaction_date: "2026-07-15" },
        { amount: 44000, type: "expense", transaction_date: "2026-08-15" },
    ];
    const forecast = forecastNextMonthSpend(multiMonthTxns, 3);
    assert(forecast.hasEnoughData === true, "Identified sufficient history for projection");
    assert(forecast.projectedNextMonth === 42000, `Accurate 3-month moving average (expected 42000, got ${forecast.projectedNextMonth})`);

    // Edge case: Less than 2 months
    const singleMonthTxn = [{ amount: 40000, type: "expense", transaction_date: "2026-08-15" }];
    const singleForecast = forecastNextMonthSpend(singleMonthTxn);
    assert(singleForecast.hasEnoughData === false, "Correctly identifies insufficient data for forecasting");

    // 4. Monthly Comparative Insights Tests
    console.log("  [Monthly Insights]");
    const monthlyInsights = generateMonthlyInsights(healthTxns, budgets, sampleCategoryMap);
    assert(monthlyInsights.currentMonth.monthKey !== undefined, "Returns valid current month structure");
    assert(monthlyInsights.previousMonth.monthKey !== undefined, "Returns valid previous month structure");
    assert(Array.isArray(monthlyInsights.narratives), "Returns array of narrative insights");
    assert(monthlyInsights.narratives.length > 0, "Generated at least one insight observation");

    console.log(`Analytics Suite: ${passed}/${total} passed.\n`);
    return { passed, total };
}
