// Central query key factory. Every hook in src/hooks/queries uses these so
// that invalidation (e.g. after adding a transaction) is consistent across
// the whole app. Add new keys here rather than inlining string arrays.

export const queryKeys = {
  accounts: (userId: string) => ["accounts", userId] as const,
  accountMembers: (accountId: string) => ["account-members", accountId] as const,
  transactionSplits: (transactionId: string) => ["transaction-splits", transactionId] as const,
  transactions: (userId: string, filters?: Record<string, unknown>) =>
    ["transactions", userId, filters ?? {}] as const,
  categories: (userId: string) => ["categories", userId] as const,
  budgets: (userId: string, monthStart?: string) =>
    ["budgets", userId, monthStart ?? "current"] as const,
  budgetCategories: (budgetId: string) => ["budget-categories", budgetId] as const,
  savingsGoals: (userId: string) => ["savings-goals", userId] as const,
  profile: (userId: string) => ["profile", userId] as const,
  notifications: (userId: string) => ["notifications", userId] as const,
  recurringTransactions: (userId: string) => ["recurring-transactions", userId] as const,
};
