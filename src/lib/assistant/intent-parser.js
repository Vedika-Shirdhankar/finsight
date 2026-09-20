/**
 * FinSight Privacy-Preserving Intent Parser & Entity Extractor
 * 
 * Translates unstructured natural language prompts into strictly validated, typed intent schemas.
 * 
 * PRIVACY GUARANTEE:
 * Operates strictly on the user query string. Zero financial transactions, account numbers,
 * or personal database records are passed to external models.
 */

// Supported Allowlisted Intent Types
export const INTENTS = {
    GET_SPENDING: "GET_SPENDING",             // "How much did I spend on food this month?"
    GET_TRANSACTIONS: "GET_TRANSACTIONS",     // "Show transactions above ₹5000"
    GET_BUDGET_STATUS: "GET_BUDGET_STATUS",   // "Am I close to exceeding my food budget?"
    GET_GOALS: "GET_GOALS",                   // "Show my savings goals"
    GET_RECURRING: "GET_RECURRING",           // "What are my upcoming recurring payments?"
    GET_ANOMALIES: "GET_ANOMALIES",           // "Show unusual transactions"
    GET_FORECAST: "GET_FORECAST",             // "What is my spending forecast for next month?"
    GET_HEALTH_SCORE: "GET_HEALTH_SCORE",     // "What is my financial health score?"
    NAVIGATE: "NAVIGATE",                     // "Take me to my budgets"
    PREPARE_TRANSACTION: "PREPARE_TRANSACTION", // "Add a ₹500 food expense" (Requires Confirmation)
    UNKNOWN: "UNKNOWN",
};

// Allowlisted internal application navigation routes
export const ALLOWLISTED_ROUTES = {
    dashboard: { path: "/dashboard", label: "Overview Dashboard" },
    overview: { path: "/dashboard", label: "Overview Dashboard" },
    transactions: { path: "/dashboard/transactions", label: "Transactions Ledger" },
    ledger: { path: "/dashboard/transactions", label: "Transactions Ledger" },
    budgets: { path: "/dashboard/budgets", label: "Monthly Budgets" },
    budget: { path: "/dashboard/budgets", label: "Monthly Budgets" },
    goals: { path: "/dashboard/goals", label: "Savings Goals" },
    savings: { path: "/dashboard/goals", label: "Savings Goals" },
    recurring: { path: "/dashboard/recurring", label: "Recurring & Bills" },
    bills: { path: "/dashboard/recurring", label: "Recurring & Bills" },
    subscriptions: { path: "/dashboard/recurring", label: "Recurring & Bills" },
    insights: { path: "/dashboard/insights", label: "Analytics & Insights" },
    analytics: { path: "/dashboard/insights", label: "Analytics & Insights" },
    accounts: { path: "/dashboard/accounts", label: "Bank Accounts" },
    audit: { path: "/dashboard/audit-logs", label: "Audit Trail" },
    "audit logs": { path: "/dashboard/audit-logs", label: "Audit Trail" },
    settings: { path: "/dashboard/settings", label: "Account Settings" },
};

// Patterns indicating potential prompt injection or unauthorized access attempts
const PROMPT_INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
    /system\s+prompt/i,
    /drop\s+table/i,
    /select\s+\*\s+from/i,
    /show\s+(me\s+)?other\s+users?/i,
    /another\s+user/i,
    /user_id\s*=/i,
    /bypass\s+(rls|security|auth)/i,
    /service_role/i,
    /api_key/i,
    /access_token/i,
    /password/i,
];

/**
 * Validates whether a user prompt contains malicious injection or privilege escalation attempts.
 * 
 * @param {string} prompt - Raw user input
 * @returns {{ isSafe: boolean, reason?: string }}
 */
export function checkPromptSafety(prompt) {
    if (!prompt || typeof prompt !== "string") {
        return { isSafe: false, reason: "Empty or invalid prompt format." };
    }

    const trimmed = prompt.trim();
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
        if (pattern.test(trimmed)) {
            return {
                isSafe: false,
                reason: "Security Guard: Request contains restricted instructions or unauthorized access attempts. I can only assist with your personal authorized FinSight account data.",
            };
        }
    }

    return { isSafe: true };
}

/**
 * Extracts normalized date range timeframe from user prompt.
 */
export function extractPeriod(prompt) {
    const text = prompt.toLowerCase();
    const now = new Date();

    if (text.includes("today")) {
        const todayStr = now.toISOString().slice(0, 10);
        return { type: "TODAY", from: todayStr, to: todayStr, label: "Today" };
    }

    if (text.includes("yesterday")) {
        const y = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
        return { type: "YESTERDAY", from: y, to: y, label: "Yesterday" };
    }

    if (text.includes("last month") || text.includes("previous month")) {
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        return {
            type: "LAST_MONTH",
            from: `${prevMonthKey}-01`,
            to: `${prevMonthKey}-${lastDay}`,
            label: prevMonthDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
        };
    }

    if (text.includes("this month") || text.includes("current month") || text.includes("month")) {
        const curMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const todayStr = now.toISOString().slice(0, 10);
        return {
            type: "CURRENT_MONTH",
            from: `${curMonthKey}-01`,
            to: todayStr,
            label: now.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
        };
    }

    if (text.includes("last 7 days") || text.includes("past week") || text.includes("this week")) {
        const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
        return { type: "LAST_7_DAYS", from: weekAgo, to: now.toISOString().slice(0, 10), label: "Past 7 Days" };
    }

    if (text.includes("last 30 days") || text.includes("past 30 days")) {
        const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);
        return { type: "LAST_30_DAYS", from: monthAgo, to: now.toISOString().slice(0, 10), label: "Past 30 Days" };
    }

    // Default to current month
    const curMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return {
        type: "CURRENT_MONTH",
        from: `${curMonthKey}-01`,
        to: now.toISOString().slice(0, 10),
        label: now.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    };
}

/**
 * Extracts numeric amounts and comparisons (e.g. "above 5000", "under 1000", "₹500").
 */
export function extractAmountCriteria(prompt) {
    const text = prompt.replace(/[,\s]/g, " ");

    // Check for "above ₹5000", "greater than 5000", "> 5000", "more than 5000"
    const aboveMatch = text.match(/(?:above|greater than|more than|>|over)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)/i);
    if (aboveMatch) {
        return { minAmount: parseFloat(aboveMatch[1]), maxAmount: null, operator: "GREATER_THAN" };
    }

    // Check for "under ₹1000", "less than 1000", "< 1000", "below 1000"
    const belowMatch = text.match(/(?:under|less than|below|<)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)/i);
    if (belowMatch) {
        return { minAmount: null, maxAmount: parseFloat(belowMatch[1]), operator: "LESS_THAN" };
    }

    // Check for explicit amount "₹500", "500 rs", "amount 500"
    const exactMatch = text.match(/(?:₹|rs\.?|inr|)\s*(\d+(?:\.\d+)?)\s*(?:rupees|rs|inr|)/i);
    if (exactMatch && !text.includes("month") && !text.includes("day") && !text.includes("year")) {
        const val = parseFloat(exactMatch[1]);
        if (!isNaN(val) && val > 0) {
            return { exactAmount: val, minAmount: null, maxAmount: null, operator: "EXACT" };
        }
    }

    return { minAmount: null, maxAmount: null, operator: null };
}

/**
 * Fuzzy matches category name from user prompt against available system/user categories.
 */
export function matchCategory(prompt, categories = []) {
    const text = prompt.toLowerCase();
    
    // Built-in category keyword dictionary
    const categoryKeywords = {
        "Food & Dining": ["food", "dining", "dinner", "lunch", "breakfast", "swiggy", "zomato", "restaurant", "cafe", "coffee", "groceries", "grocery"],
        "Shopping": ["shopping", "amazon", "flipkart", "clothes", "electronics", "retail", "store"],
        "Transport": ["transport", "travel", "uber", "ola", "metro", "fuel", "petrol", "cab", "auto", "train", "flight"],
        "Bills & Utilities": ["bills", "utilities", "electricity", "water", "wifi", "internet", "broadband", "mobile", "recharge", "rent"],
        "Entertainment": ["entertainment", "netflix", "movies", "cinema", "spotify", "prime", "hotstar", "games"],
        "Healthcare": ["health", "healthcare", "medical", "medicine", "pharmacy", "doctor", "hospital"],
        "Education": ["education", "courses", "books", "tuition", "school", "college"],
        "Salary": ["salary", "payroll", "stipend"],
        "Freelance": ["freelance", "consulting", "gig"],
    };

    // 1. Direct match with user categories
    for (const cat of categories) {
        const nameLower = cat.name.toLowerCase();
        if (text.includes(nameLower)) {
            return { id: cat.id, name: cat.name };
        }
    }

    // 2. Keyword heuristic match
    for (const [catName, keywords] of Object.entries(categoryKeywords)) {
        for (const kw of keywords) {
            const regex = new RegExp(`\\b${kw}\\b`, "i");
            if (regex.test(text)) {
                const found = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
                return { id: found?.id || null, name: catName };
            }
        }
    }

    return null;
}

/**
 * Primary Intent Parser
 * Converts natural-language user prompt into a strongly typed, validated intent object.
 * 
 * @param {string} prompt - User query
 * @param {Array} [categories=[]] - Known category list
 * @returns {Object} Structured validated intent payload
 */
export function parseUserIntent(prompt, categories = []) {
    const safety = checkPromptSafety(prompt);
    if (!safety.isSafe) {
        return {
            intent: INTENTS.UNKNOWN,
            isSafe: false,
            error: safety.reason,
            originalPrompt: prompt,
        };
    }

    const text = prompt.toLowerCase().trim();
    const period = extractPeriod(prompt);
    const amountCriteria = extractAmountCriteria(prompt);
    const category = matchCategory(prompt, categories);

    // 1. Navigation Intent Check ("take me to...", "open...", "go to...")
    // Only trigger if no amount or specific category filter criteria are present
    const cleanNavText = text.replace(/\b(my|the|our|page|tab|to|me)\b/g, "").replace(/\s+/g, " ").trim();
    if (amountCriteria.operator === null && !category) {
        for (const [key, route] of Object.entries(ALLOWLISTED_ROUTES)) {
            if (
                text.includes(`open ${key}`) ||
                cleanNavText.includes(`open ${key}`) ||
                text.includes(`go to ${key}`) ||
                cleanNavText.includes(`go ${key}`) ||
                text.includes(`take me to ${key}`) ||
                cleanNavText.includes(`take ${key}`) ||
                text.includes(`show ${key} page`) ||
                cleanNavText === `show ${key}` ||
                cleanNavText === `open ${key}`
            ) {
                return {
                    intent: INTENTS.NAVIGATE,
                    targetRoute: route.path,
                    targetLabel: route.label,
                    isSafe: true,
                };
            }
        }
    }

    // 2. Transaction / Financial Mutation Intent (Write Operation Staging)
    // E.g. "Add a ₹500 food expense", "Log expense 300 for uber", "i wanna add 60 in savings", "save 500 for emergency fund"
    const hasMutationVerb = (
        text.startsWith("add ") ||
        text.startsWith("log ") ||
        text.startsWith("create ") ||
        text.startsWith("record ") ||
        text.startsWith("save ") ||
        text.startsWith("deposit ") ||
        text.includes("wanna add") ||
        text.includes("want to add") ||
        text.includes("wanna save") ||
        text.includes("want to save") ||
        text.includes("put in savings") ||
        text.includes("deposit in") ||
        text.includes("deposit into") ||
        text.includes("transfer to savings")
    );

    if (hasMutationVerb) {
        const isIncome = text.includes("income") || text.includes("salary") || text.includes("received");
        const amountMatch = text.match(/(?:₹|rs\.?|inr|\$)?\s*(\d+(?:\.\d+)?)/i);
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

        // Try extracting merchant/description or goal
        let merchant = "Manual Entry";
        const isSavings = text.includes("saving") || text.includes("savings");
        if (isSavings) {
            merchant = "Savings Deposit";
        }
        if (text.includes("for ") || text.includes("on ") || text.includes("at ") || text.includes("in ") || text.includes("to ")) {
            const parts = text.split(/(?:for|on|at|in|to|into)\s+/i);
            if (parts[1]) {
                const rawMerchant = parts[1].split(/\s+(?:yesterday|today|this|using|via)/)[0].trim();
                if (rawMerchant && rawMerchant !== "savings") {
                    merchant = rawMerchant.charAt(0).toUpperCase() + rawMerchant.slice(1);
                }
            }
        }

        const resolvedCategoryName = isSavings ? "Savings" : (category?.name || "General");

        return {
            intent: INTENTS.PREPARE_TRANSACTION,
            transactionData: {
                amount,
                type: isIncome ? "income" : "expense",
                merchant: merchant.slice(0, 50),
                category_id: category?.id || null,
                categoryName: resolvedCategoryName,
                transaction_date: new Date().toISOString().slice(0, 10),
                payment_method: "UPI",
            },
            requiresConfirmation: true,
            isSafe: true,
        };
    }

    // 3. Financial Health Score Intent
    if (text.includes("health score") || text.includes("financial health") || text.includes("financial score") || text.includes("how healthy")) {
        return {
            intent: INTENTS.GET_HEALTH_SCORE,
            isSafe: true,
        };
    }

    // 4. Anomaly / Unusual Spending Intent
    if (text.includes("unusual") || text.includes("anomaly") || text.includes("anomalies") || text.includes("outlier") || text.includes("suspicious")) {
        return {
            intent: INTENTS.GET_ANOMALIES,
            period,
            category,
            isSafe: true,
        };
    }

    // 5. Spending Forecast Intent
    if (text.includes("forecast") || text.includes("predict") || text.includes("projected spend") || text.includes("next month spend")) {
        return {
            intent: INTENTS.GET_FORECAST,
            isSafe: true,
        };
    }

    // 6. Budget Status Intent
    if (text.includes("budget") || text.includes("overspending") || text.includes("limit") || text.includes("close to exceeding")) {
        return {
            intent: INTENTS.GET_BUDGET_STATUS,
            category,
            period,
            isSafe: true,
        };
    }

    // 7. Savings Goals Intent
    if (text.includes("goal") || text.includes("saving") || text.includes("savings progress") || text.includes("target")) {
        return {
            intent: INTENTS.GET_GOALS,
            isSafe: true,
        };
    }

    // 8. Recurring & Subscriptions Intent
    if (text.includes("recurring") || text.includes("subscription") || text.includes("upcoming bill") || text.includes("autopay")) {
        return {
            intent: INTENTS.GET_RECURRING,
            isSafe: true,
        };
    }

    // 9. Specific Transactions Query (e.g. "Show transactions above 5000", "Recent expenses")
    if (
        text.includes("show transactions") ||
        text.includes("list transactions") ||
        text.includes("transactions above") ||
        text.includes("transactions under") ||
        text.includes("biggest expense") ||
        text.includes("highest expense") ||
        amountCriteria.operator !== null
    ) {
        return {
            intent: INTENTS.GET_TRANSACTIONS,
            period,
            category,
            minAmount: amountCriteria.minAmount,
            maxAmount: amountCriteria.maxAmount,
            isHighestFirst: text.includes("biggest") || text.includes("highest") || text.includes("largest"),
            isSafe: true,
        };
    }

    // 10. General Spending Summary Intent ("How much did I spend on food this month?")
    if (text.includes("spend") || text.includes("spent") || text.includes("how much") || text.includes("total expense") || text.includes("cost")) {
        return {
            intent: INTENTS.GET_SPENDING,
            category,
            period,
            minAmount: amountCriteria.minAmount,
            maxAmount: amountCriteria.maxAmount,
            isSafe: true,
        };
    }

    // Default Fallback
    return {
        intent: INTENTS.GET_SPENDING,
        category: null,
        period,
        isSafe: true,
    };
}
