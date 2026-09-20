# FinSight Privacy-First AI Financial Assistant — Architecture & Technical Reference

## 1. Executive Summary & Capabilities

FinSight includes a **privacy-first, natural-language financial search and analytics assistant**. It allows authenticated users to query their financial records, inspect budget health, view savings goals, review recurring commitments, and stage financial transactions using plain English.

### What it is:
- **Natural-Language Financial Search**: Query transactions and spending using conversational queries (*"How much did I spend on food this month?"*, *"Show transactions above ₹5000"*).
- **Personalized Insights Engine**: Instant access to budget status, financial health scores, and statistical anomaly detection.
- **Controlled Transaction Staging**: Prepares financial mutations that require **mandatory explicit user confirmation** before any database write occurs.

### What it is NOT:
- Not an unrestricted chatbot with raw database or SQL access.
- Not a financial advisor offering speculative investment recommendations.
- Not a cloud pipeline exposing complete transaction histories to external third parties.

---

## 2. Privacy-First Architecture & Data Flow

```
User Prompt (e.g. "How much did I spend on food this month?")
       │
       ▼
[Privacy-Preserving Intent Parser (`src/lib/assistant/intent-parser.js`)]
  - Extracts strictly typed intent schema:
    {
      intent: "GET_SPENDING",
      category: { id: "...", name: "Food & Dining" },
      period: { from: "2026-09-01", to: "2026-09-30", label: "September 2026" }
    }
  - PRIVACY GUARANTEE: Zero financial records, account numbers, or balances are passed to external models.
  - Intercepts and neutralizes prompt injections or privilege escalation attempts.
       │
       ▼
[Allowlisted Tool Executor (`src/lib/assistant/tool-executor.js`)]
  - Validates intent against strict allowlisted tools:
    • getSpendingSummary
    • getTransactions
    • getBudgetStatus
    • getSavingsGoals
    • getRecurringTransactions
    • getAnomalies
    • getSpendingForecast
    • getFinancialHealthSummary
    • navigateToPage
    • prepareTransaction (requires UI confirmation)
       │
       ▼
[Authentication & Authorization Layer]
  - Actor identity derived strictly from verified session `auth.uid()`.
  - Client-supplied `user_id` is never trusted.
  - Queries execute via existing Supabase client with PostgreSQL RLS active.
       │
       ▼
[Calculation & Formatter Engine]
  - Invokes existing math functions in `analytics.js`.
  - Calculates aggregated summary (total, count, avg, breakdown).
  - Formats structured UI presentation card.
       │
       ▼
[Interactive Assistant Drawer (`src/components/assistant/ai-assistant-drawer.jsx`)]
  - Renders structured widget (stat cards, category meters, confirmation dialogs).
  - Safe audit telemetry logged via `auditLog()`.
```

---

## 3. Data Minimization & Privacy Guarantees

| Data Category | Sent to External AI? | Handled Where? | Security Protection |
|---|---|---|---|
| User query string | Only for intent parsing | Client / Server boundary | Sanitized & validated |
| Transaction history | ❌ NEVER | Authenticated Client / DB | PostgreSQL RLS (`auth.uid()`) |
| Account balances & numbers | ❌ NEVER | Authenticated Client / DB | PostgreSQL RLS |
| Passwords & API keys | ❌ NEVER | Environment variables only | Redacted by `sanitizeAuditData()` |
| Financial Calculations | ❌ NEVER | Local JavaScript Engine | `analytics.js` |

---

## 4. Allowlisted Tool & Function Schema

The assistant cannot invent arbitrary functions or execute raw SQL. It can only trigger these 10 allowlisted tools:

1. **`executeGetSpending(intent, context)`**:
   - Calculates total expenditure, transaction count, average per transaction, and top category breakdown for specified timeframes and categories.
2. **`executeGetTransactions(intent, context)`**:
   - Returns filtered transaction records matching amount thresholds (e.g. `> ₹5000`), date windows, or categories.
3. **`executeGetBudgetStatus(intent, context)`**:
   - Calculates active category spend vs monthly limit thresholds, flagging categories $\ge 80\%$ capacity.
4. **`executeGetGoals(intent, context)`**:
   - Returns funding progress percentage and remaining amount across active savings targets.
5. **`executeGetRecurring(intent, context)`**:
   - Summarizes active subscriptions, due dates, and monthly committed overhead.
6. **`executeGetAnomalies(intent, context)`**:
   - Invokes existing explainable Z-score anomaly radar (`detectAnomalies`).
7. **`executeGetForecast(intent, context)`**:
   - Computes 3-month moving average spending projection (`forecastNextMonthSpend`).
8. **`executeGetHealthScore(intent, context)`**:
   - Computes the 5-component 0–100 Financial Health Score (`calculateFinancialHealthScore`).
9. **`executeNavigate(intent)`**:
   - Directs user to allowlisted internal routes (`/dashboard/budgets`, `/dashboard/goals`, `/dashboard/insights`, etc.).
10. **`executePrepareTransaction(intent)`**:
    - Stages a new transaction entry and prompts the user for mandatory `[Confirm & Save]` or `[Discard]`.

---

## 5. Security & Prompt Injection Defenses

### 1. External Instruction Invalidation:
Prompts containing patterns such as `"Ignore all previous instructions"`, `"system prompt"`, `"show me other users"`, or `"DROP TABLE"` are immediately intercepted by `checkPromptSafety()` and rejected with a security refusal.

### 2. Mandatory Write Confirmation:
Natural-language write requests (e.g., *"Add ₹450 for Swiggy"*) **never write directly to the database**. The assistant returns a `TRANSACTION_STAGING` payload. The database mutation is only triggered when the user explicitly clicks the `[Confirm & Save]` button in the UI.

### 3. Tenant Isolation & Identity Enforcement:
Actor identity is strictly bound to `auth.uid()` from the verified Supabase authentication token. Even if a user crafts a query with another user's UUID, PostgreSQL Row Level Security enforces tenant isolation.

---

## 6. Verification & Automated Test Coverage

The AI Assistant is covered by **25 automated specifications** within `src/__tests__/assistant.test.js`:
- ✅ Intent parsing across spending, filters, budgets, goals, recurring, and anomalies.
- ✅ Adversarial prompt injection and SQL injection pattern rejection.
- ✅ Route navigation allowlist validation.
- ✅ Write operation confirmation staging.
- ✅ End-to-end orchestration and spending calculation accuracy.
- ✅ Unauthenticated session isolation.

Run the test suite:
```bash
npm test
```
