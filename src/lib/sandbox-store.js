/**
 * FinSight Resilient Sandbox & Local State Engine
 * 
 * Provides fallback data store and offline simulation capabilities when Supabase
 * network is unreachable or when running in Demo/Guest evaluation mode.
 */

const STORAGE_KEYS = {
    USER: "finsight_auth_user",
    TRANSACTIONS: "finsight_sandbox_transactions",
    ACCOUNTS: "finsight_sandbox_accounts",
    CATEGORIES: "finsight_sandbox_categories",
    BUDGETS: "finsight_sandbox_budgets",
    GOALS: "finsight_sandbox_goals",
    RECURRING: "finsight_sandbox_recurring",
    NOTIFICATIONS: "finsight_sandbox_notifications",
    AUDIT_LOGS: "finsight_sandbox_audit_logs",
    PROFILE: "finsight_sandbox_profile",
};

export const DEMO_USER_ID = "00000000-0000-4000-a000-000000000001";

export const DEMO_USER = {
    id: DEMO_USER_ID,
    email: "demo@finsight.app",
    user_metadata: {
        full_name: "Aarav Mehta",
        avatar_url: null,
    },
    app_metadata: {
        provider: "email",
        role: "user",
    },
    created_at: "2026-01-01T00:00:00.000Z",
};

const DEFAULT_CATEGORIES = [
    { id: "cat_food", name: "Food & Dining", kind: "expense", color_token: "accent-green", icon_key: "utensils", is_system: true },
    { id: "cat_shop", name: "Shopping", kind: "expense", color_token: "accent-blue", icon_key: "shopping-bag", is_system: true },
    { id: "cat_travel", name: "Transport", kind: "expense", color_token: "accent-warn", icon_key: "car-front", is_system: true },
    { id: "cat_bills", name: "Bills & Utilities", kind: "expense", color_token: "accent-red", icon_key: "receipt", is_system: true },
    { id: "cat_ent", name: "Entertainment", kind: "expense", color_token: "accent-violet", icon_key: "film", is_system: true },
    { id: "cat_health", name: "Healthcare", kind: "expense", color_token: "accent-teal", icon_key: "heart-pulse", is_system: true },
    { id: "cat_edu", name: "Education", kind: "expense", color_token: "accent-cyan", icon_key: "graduation-cap", is_system: true },
    { id: "cat_salary", name: "Salary", kind: "income", color_token: "accent-green", icon_key: "briefcase-business", is_system: true },
    { id: "cat_freelance", name: "Freelance", kind: "income", color_token: "accent-blue", icon_key: "laptop", is_system: true },
    { id: "cat_savings", name: "Savings & Investments", kind: "expense", color_token: "accent-green", icon_key: "piggy-bank", is_system: true },
    { id: "cat_other", name: "Other", kind: "expense", color_token: "muted-foreground", icon_key: "circle-dashed", is_system: true },
];

const DEFAULT_ACCOUNTS = [
    { id: "acc_hdfc", user_id: DEMO_USER_ID, name: "HDFC Salary Account", type: "checking", balance: 84500, currency: "INR", created_at: "2026-01-01T00:00:00Z" },
    { id: "acc_icici", user_id: DEMO_USER_ID, name: "ICICI High-Yield Savings", type: "savings", balance: 165000, currency: "INR", created_at: "2026-01-01T00:00:00Z" },
    { id: "acc_wallet", user_id: DEMO_USER_ID, name: "PayTM / UPI Wallet", type: "wallet", balance: 6200, currency: "INR", created_at: "2026-01-01T00:00:00Z" },
];

function getSampleTransactions() {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, "0");
    const prevMonth = String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2, "0");
    const prevYear = now.getMonth() === 0 ? curYear - 1 : curYear;

    return [
        {
            id: "txn_sal_cur",
            user_id: DEMO_USER_ID,
            account_id: "acc_hdfc",
            category_id: "cat_salary",
            amount: 95000,
            type: "income",
            merchant: "Acme Corp Payroll",
            payment_method: "NEFT",
            description: "Monthly salary credit",
            status: "completed",
            transaction_date: `${curYear}-${curMonth}-01T09:00:00Z`,
        },
        {
            id: "txn_rent_cur",
            user_id: DEMO_USER_ID,
            account_id: "acc_hdfc",
            category_id: "cat_bills",
            amount: 22000,
            type: "expense",
            merchant: "Apartment Rent",
            payment_method: "UPI",
            description: "Monthly flat rent",
            status: "completed",
            transaction_date: `${curYear}-${curMonth}-02T10:30:00Z`,
        },
        {
            id: "txn_swiggy_1",
            user_id: DEMO_USER_ID,
            account_id: "acc_hdfc",
            category_id: "cat_food",
            amount: 450,
            type: "expense",
            merchant: "Swiggy",
            payment_method: "UPI",
            description: "Dinner delivery",
            status: "completed",
            transaction_date: `${curYear}-${curMonth}-04T20:15:00Z`,
        },
        {
            id: "txn_amazon_1",
            user_id: DEMO_USER_ID,
            account_id: "acc_hdfc",
            category_id: "cat_shop",
            amount: 2499,
            type: "expense",
            merchant: "Amazon India",
            payment_method: "Credit Card",
            description: "Ergonomic keyboard",
            status: "completed",
            transaction_date: `${curYear}-${curMonth}-06T14:20:00Z`,
        },
        {
            id: "txn_netflix_cur",
            user_id: DEMO_USER_ID,
            account_id: "acc_hdfc",
            category_id: "cat_ent",
            amount: 649,
            type: "expense",
            merchant: "Netflix",
            payment_method: "Autopay",
            description: "Premium Plan subscription",
            status: "completed",
            transaction_date: `${curYear}-${curMonth}-08T06:00:00Z`,
        },
        {
            id: "txn_uber_1",
            user_id: DEMO_USER_ID,
            account_id: "acc_wallet",
            category_id: "cat_travel",
            amount: 320,
            type: "expense",
            merchant: "Uber India",
            payment_method: "UPI",
            description: "Office commute",
            status: "completed",
            transaction_date: `${curYear}-${curMonth}-09T08:45:00Z`,
        },
        {
            id: "txn_groceries_1",
            user_id: DEMO_USER_ID,
            account_id: "acc_hdfc",
            category_id: "cat_food",
            amount: 3200,
            type: "expense",
            merchant: "Blinkit",
            payment_method: "UPI",
            description: "Weekly kitchen groceries",
            status: "completed",
            transaction_date: `${curYear}-${curMonth}-11T11:00:00Z`,
        },
        {
            id: "txn_freelance_1",
            user_id: DEMO_USER_ID,
            account_id: "acc_icici",
            category_id: "cat_freelance",
            amount: 18500,
            type: "income",
            merchant: "Stripe Client Payout",
            payment_method: "Wire",
            description: "UI Design sprint consulting",
            status: "completed",
            transaction_date: `${curYear}-${curMonth}-12T16:00:00Z`,
        },
        {
            id: "txn_swiggy_2",
            user_id: DEMO_USER_ID,
            account_id: "acc_wallet",
            category_id: "cat_food",
            amount: 580,
            type: "expense",
            merchant: "Swiggy",
            payment_method: "UPI",
            description: "Lunch order",
            status: "completed",
            transaction_date: `${curYear}-${curMonth}-14T13:00:00Z`,
        },
        {
            id: "txn_savings_dep",
            user_id: DEMO_USER_ID,
            account_id: "acc_icici",
            category_id: "cat_savings",
            amount: 15000,
            type: "expense",
            merchant: "Emergency Fund Deposit",
            payment_method: "Transfer",
            description: "Monthly savings allocation",
            status: "completed",
            transaction_date: `${curYear}-${curMonth}-15T18:00:00Z`,
        },
        // Previous month data for comparisons and trends
        {
            id: "txn_sal_prev",
            user_id: DEMO_USER_ID,
            account_id: "acc_hdfc",
            category_id: "cat_salary",
            amount: 95000,
            type: "income",
            merchant: "Acme Corp Payroll",
            payment_method: "NEFT",
            description: "Monthly salary credit",
            status: "completed",
            transaction_date: `${prevYear}-${prevMonth}-01T09:00:00Z`,
        },
        {
            id: "txn_rent_prev",
            user_id: DEMO_USER_ID,
            account_id: "acc_hdfc",
            category_id: "cat_bills",
            amount: 22000,
            type: "expense",
            merchant: "Apartment Rent",
            payment_method: "UPI",
            description: "Monthly flat rent",
            status: "completed",
            transaction_date: `${prevYear}-${prevMonth}-02T10:30:00Z`,
        },
        {
            id: "txn_food_prev",
            user_id: DEMO_USER_ID,
            account_id: "acc_hdfc",
            category_id: "cat_food",
            amount: 7800,
            type: "expense",
            merchant: "Food & Dining Aggregate",
            payment_method: "UPI",
            description: "Previous month food spend",
            status: "completed",
            transaction_date: `${prevYear}-${prevMonth}-15T19:00:00Z`,
        },
        {
            id: "txn_shop_prev",
            user_id: DEMO_USER_ID,
            account_id: "acc_hdfc",
            category_id: "cat_shop",
            amount: 5400,
            type: "expense",
            merchant: "Shopping Aggregate",
            payment_method: "Credit Card",
            description: "Previous month shopping",
            status: "completed",
            transaction_date: `${prevYear}-${prevMonth}-20T14:00:00Z`,
        },
    ];
}

const DEFAULT_BUDGET = {
    id: "bgt_cur",
    user_id: DEMO_USER_ID,
    name: "Monthly Master Budget",
    month_start: new Date().toISOString().slice(0, 8) + "01",
    total_limit: 45000,
    budget_categories: [
        { id: "bc_food", budget_id: "bgt_cur", category_id: "cat_food", limit_amount: 10000 },
        { id: "bc_shop", budget_id: "bgt_cur", category_id: "cat_shop", limit_amount: 8000 },
        { id: "bc_bills", budget_id: "bgt_cur", category_id: "cat_bills", limit_amount: 25000 },
        { id: "bc_ent", budget_id: "bgt_cur", category_id: "cat_ent", limit_amount: 2000 },
    ],
};

const DEFAULT_GOALS = [
    {
        id: "goal_emergency",
        user_id: DEMO_USER_ID,
        name: "6-Month Emergency Fund",
        target_amount: 250000,
        current_amount: 165000,
        target_date: "2026-12-31",
        color_token: "accent-green",
        created_at: "2026-01-01T00:00:00Z",
    },
    {
        id: "goal_trip",
        user_id: DEMO_USER_ID,
        name: "Tokyo Trip 2027",
        target_amount: 180000,
        current_amount: 72000,
        target_date: "2027-04-15",
        color_token: "accent-blue",
        created_at: "2026-02-01T00:00:00Z",
    },
];

const DEFAULT_RECURRING = [
    {
        id: "rec_netflix",
        user_id: DEMO_USER_ID,
        account_id: "acc_hdfc",
        category_id: "cat_ent",
        merchant: "Netflix Premium",
        amount: 649,
        frequency: "monthly",
        is_active: true,
        next_due_date: new Date(Date.now() + 86400000 * 14).toISOString().slice(0, 10),
        remind_days_before: 3,
        type: "expense",
    },
    {
        id: "rec_wifi",
        user_id: DEMO_USER_ID,
        account_id: "acc_hdfc",
        category_id: "cat_bills",
        merchant: "Airtel Xstream Fiber",
        amount: 1179,
        frequency: "monthly",
        is_active: true,
        next_due_date: new Date(Date.now() + 86400000 * 8).toISOString().slice(0, 10),
        remind_days_before: 2,
        type: "expense",
    },
    {
        id: "rec_rent",
        user_id: DEMO_USER_ID,
        account_id: "acc_hdfc",
        category_id: "cat_bills",
        merchant: "Apartment Rent",
        amount: 22000,
        frequency: "monthly",
        is_active: true,
        next_due_date: new Date(Date.now() + 86400000 * 22).toISOString().slice(0, 10),
        remind_days_before: 5,
        type: "expense",
    },
];

const DEFAULT_PROFILE = {
    user_id: DEMO_USER_ID,
    full_name: "Aarav Mehta",
    avatar_url: null,
    currency: "INR",
    theme: "dark",
    notification_preferences: {
        budget_alerts: true,
        spending_insights: true,
        goal_updates: true,
        security_alerts: true,
    },
};

/**
 * Ensures Sandbox data is initialized in localStorage.
 */
export function initSandboxStore() {
    if (typeof window === "undefined") return;

    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(getSampleTransactions()));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BUDGETS)) {
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([DEFAULT_BUDGET]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(DEFAULT_GOALS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECURRING)) {
        localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(DEFAULT_RECURRING));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    }
}

export const sandboxStore = {
    // Auth Session
    getUser() {
        if (typeof window === "undefined") return null;
        const stored = localStorage.getItem(STORAGE_KEYS.USER);
        if (stored) {
            try { return JSON.parse(stored); } catch { return null; }
        }
        return null;
    },
    setUser(user) {
        if (typeof window === "undefined") return;
        if (user) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
            initSandboxStore();
        } else {
            localStorage.removeItem(STORAGE_KEYS.USER);
        }
    },

    // Categories
    getCategories() {
        initSandboxStore();
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES)) || DEFAULT_CATEGORIES;
        } catch {
            return DEFAULT_CATEGORIES;
        }
    },
    addCategory(cat) {
        const list = this.getCategories();
        const newCat = { id: `cat_${Date.now()}`, ...cat, is_system: false };
        list.push(newCat);
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
        return newCat;
    },

    // Accounts
    getAccounts() {
        initSandboxStore();
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) || DEFAULT_ACCOUNTS;
        } catch {
            return DEFAULT_ACCOUNTS;
        }
    },
    addAccount(acc) {
        const list = this.getAccounts();
        const newAcc = { id: `acc_${Date.now()}`, ...acc, created_at: new Date().toISOString() };
        list.push(newAcc);
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(list));
        return newAcc;
    },
    updateAccount(id, updates) {
        const list = this.getAccounts().map((a) => (a.id === id ? { ...a, ...updates } : a));
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(list));
        return list.find((a) => a.id === id);
    },
    deleteAccount(id) {
        const list = this.getAccounts().filter((a) => a.id !== id);
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(list));
    },

    // Transactions
    getTransactions(filters = {}) {
        initSandboxStore();
        let list = [];
        try {
            list = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) || getSampleTransactions();
        } catch {
            list = getSampleTransactions();
        }

        if (filters.categoryId && filters.categoryId !== "all") {
            list = list.filter((t) => t.category_id === filters.categoryId);
        }
        if (filters.accountId && filters.accountId !== "all") {
            list = list.filter((t) => t.account_id === filters.accountId);
        }
        if (filters.type && filters.type !== "all") {
            list = list.filter((t) => t.type === filters.type);
        }
        if (filters.search) {
            const s = filters.search.toLowerCase();
            list = list.filter((t) => 
                (t.merchant && t.merchant.toLowerCase().includes(s)) ||
                (t.description && t.description.toLowerCase().includes(s))
            );
        }
        if (filters.from) {
            list = list.filter((t) => t.transaction_date >= filters.from);
        }
        if (filters.to) {
            list = list.filter((t) => t.transaction_date <= filters.to + "T23:59:59");
        }
        if (filters.minAmount !== undefined && filters.minAmount !== null && filters.minAmount !== "") {
            list = list.filter((t) => Number(t.amount) >= Number(filters.minAmount));
        }
        if (filters.maxAmount !== undefined && filters.maxAmount !== null && filters.maxAmount !== "") {
            list = list.filter((t) => Number(t.amount) <= Number(filters.maxAmount));
        }

        list.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

        if (filters.page !== undefined && filters.page !== null) {
            const pageSize = filters.pageSize || 15;
            const page = Math.max(1, Number(filters.page) || 1);
            const totalCount = list.length;
            const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
            const items = list.slice((page - 1) * pageSize, page * pageSize);
            return { items, totalCount, totalPages, page, pageSize };
        }

        if (filters.limit) {
            return list.slice(0, filters.limit);
        }

        return list;
    },
    addTransaction(txn) {
        const list = this.getTransactions();
        const newTxn = {
            id: `txn_${Date.now()}`,
            ...txn,
            status: txn.status || "completed",
            transaction_date: txn.transaction_date || new Date().toISOString(),
            created_at: new Date().toISOString(),
        };
        list.unshift(newTxn);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
        return newTxn;
    },
    updateTransaction(id, updates) {
        const list = this.getTransactions().map((t) => (t.id === id ? { ...t, ...updates } : t));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
        return list.find((t) => t.id === id);
    },
    deleteTransaction(id) {
        const list = this.getTransactions().filter((t) => t.id !== id);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
    },

    // Budgets
    getBudget(monthStart) {
        initSandboxStore();
        const resolvedMonth = monthStart ?? new Date().toISOString().slice(0, 8) + "01";
        try {
            const budgets = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGETS)) || [DEFAULT_BUDGET];
            const found = budgets.find((b) => b.month_start === resolvedMonth);
            return found || { ...DEFAULT_BUDGET, month_start: resolvedMonth };
        } catch {
            return DEFAULT_BUDGET;
        }
    },
    updateBudget(id, updates) {
        let budgets = [];
        try { budgets = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGETS)) || [DEFAULT_BUDGET]; } catch { budgets = [DEFAULT_BUDGET]; }
        budgets = budgets.map((b) => (b.id === id ? { ...b, ...updates } : b));
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
        return budgets.find((b) => b.id === id);
    },
    addBudgetCategory(budgetCategory) {
        const budget = this.getBudget();
        const newBc = { id: `bc_${Date.now()}`, ...budgetCategory };
        budget.budget_categories = [...(budget.budget_categories || []), newBc];
        let budgets = [];
        try { budgets = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGETS)) || [DEFAULT_BUDGET]; } catch { budgets = [DEFAULT_BUDGET]; }
        budgets = budgets.map((b) => (b.id === budget.id ? budget : b));
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
        return newBc;
    },

    // Goals
    getGoals() {
        initSandboxStore();
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS)) || DEFAULT_GOALS;
        } catch {
            return DEFAULT_GOALS;
        }
    },
    addGoal(goal) {
        const list = this.getGoals();
        const newGoal = { id: `goal_${Date.now()}`, ...goal, created_at: new Date().toISOString() };
        list.push(newGoal);
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(list));
        return newGoal;
    },
    updateGoal(id, updates) {
        const list = this.getGoals().map((g) => (g.id === id ? { ...g, ...updates } : g));
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(list));
        return list.find((g) => g.id === id);
    },
    deleteGoal(id) {
        const list = this.getGoals().filter((g) => g.id !== id);
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(list));
    },

    // Recurring
    getRecurring() {
        initSandboxStore();
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECURRING)) || DEFAULT_RECURRING;
        } catch {
            return DEFAULT_RECURRING;
        }
    },
    addRecurring(item) {
        const list = this.getRecurring();
        const newItem = { id: `rec_${Date.now()}`, ...item, is_active: true };
        list.push(newItem);
        localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(list));
        return newItem;
    },
    updateRecurring(id, updates) {
        const list = this.getRecurring().map((r) => (r.id === id ? { ...r, ...updates } : r));
        localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(list));
        return list.find((r) => r.id === id);
    },
    deleteRecurring(id) {
        const list = this.getRecurring().filter((r) => r.id !== id);
        localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(list));
    },

    // Profile
    getProfile() {
        initSandboxStore();
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE)) || DEFAULT_PROFILE;
        } catch {
            return DEFAULT_PROFILE;
        }
    },
    updateProfile(updates) {
        const profile = { ...this.getProfile(), ...updates };
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
        return profile;
    },
};
