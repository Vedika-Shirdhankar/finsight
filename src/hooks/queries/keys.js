// Central query key factory. Every hook in src/hooks/queries uses these so
// that invalidation (e.g. after adding a transaction) is consistent across
// the whole app. Add new keys here rather than inlining string arrays.
export const queryKeys = {
    accounts: (userId) => ["accounts", userId],
    accountMembers: (accountId) => ["account-members", accountId],
    transactionSplits: (transactionId) => ["transaction-splits", transactionId],
    transactions: (userId, filters) => ["transactions", userId, filters ?? {}],
    categories: (userId) => ["categories", userId],
    budgets: (userId, monthStart) => ["budgets", userId, monthStart ?? "current"],
    budgetCategories: (budgetId) => ["budget-categories", budgetId],
    savingsGoals: (userId) => ["savings-goals", userId],
    profile: (userId) => ["profile", userId],
    notifications: (userId) => ["notifications", userId],
    recurringTransactions: (userId) => ["recurring-transactions", userId],
};
