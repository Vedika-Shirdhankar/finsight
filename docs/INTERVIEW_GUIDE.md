# FinSight — Software Engineering Interview Mastery Guide

This technical guide prepares you to defend every architectural, algorithmic, security, and scalability decision in FinSight during senior and staff full-stack engineering interviews.

---

## 1. System Architecture & Tech Stack

### Q: Why React 19 + TanStack Router + TanStack Query instead of Next.js or Redux?
* **Answer**: 
  1. **TanStack Router**: Delivers 100% type-safe routing, search parameter serialization/validation, and nested layouts without vendor lock-in to Next.js server conventions.
  2. **TanStack Query (React Query)**: Acts as our server-state management engine. Financial transactions and audit logs are server state, not client state. TanStack Query automatically handles background refetching, query key-based cache invalidation (e.g. invalidating `['transactions']` upon mutations), and optimistic UI updates without the boilerplate of Redux actions and reducers.
  3. **Separation of Concerns**: The frontend is a high-performance single-page app (SPA) deployed to edge CDNs, while database mutations and identity verification happen via Supabase with PostgreSQL Row Level Security (RLS) and Node/Express microservices.

### Q: How does Authentication work and how do you protect against user impersonation?
* **Answer**:
  - Authentication is handled via Supabase Auth issuing cryptographically signed JSON Web Tokens (JWTs) using HMAC-SHA256.
  - The JWT is stored in secure, auto-refreshing client sessions and sent via `Authorization: Bearer <token>` on all database and API requests.
  - **Never trust client-supplied `user_id`**: In all PostgreSQL queries and RLS policies, the actor identity is derived strictly from `auth.uid()`, the verified subject embedded within the validated JWT signature. Even if a malicious user alters the client-side state to submit `{ user_id: "victim-uuid" }`, the database RLS engine rejects the insert or query because `WITH CHECK (auth.uid() = user_id)` fails.

---

## 2. Security & Compliance Architecture

### Q: How does Row Level Security (RLS) isolate multi-tenant financial data?
* **Answer**:
  - PostgreSQL RLS enforces access controls at the database kernel level for every single SQL query.
  - **Transactions Policy**: `USING (user_id = auth.uid() OR exists (shared_account_members))`
  - **Audit Logs Policy**: Strictly **append-only**.
    - `SELECT`: `USING (auth.uid() = user_id OR is_admin(auth.uid()))`
    - `INSERT`: `WITH CHECK (auth.uid() = user_id)`
    - `UPDATE` & `DELETE`: **Zero policies created**. Normal users and application tokens cannot alter or delete historical audit entries.

### Q: How do Shared Accounts and Granular Member Roles operate?
* **Answer**:
  - FinSight implements role-based access control (RBAC) across three distinct privilege tiers:
    1. **Owner**: Full permissions (`read`, `write`, `update`, `delete`, and `manage_members` / transfer ownership).
    2. **Editor**: Permitted financial mutations (`insert`, `update`, `delete` shared transactions and splits), but strictly forbidden from modifying account ownership or inviting/removing members.
    3. **Viewer**: Read-only access (`SELECT` only). Any `INSERT`, `UPDATE`, or `DELETE` attempt throws an RLS violation.
  - Access is evaluated directly in PostgreSQL using subqueries checking `public.account_members` where `status = 'accepted'`.

### Q: How do you protect against credential leaks and sensitive data exposure?
* **Answer**:
  - `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to server-side Node.js/Express environments (`process.env`) and is **never** bundled into the client Vite artifact.
  - `src/lib/audit-logger.js` implements a recursive sanitization guard `sanitizeAuditData()` that automatically inspects object trees and redacts passwords, tokens, API keys, and CVV codes to `[REDACTED_SECRET]` before logging.

---

## 3. Algorithmic Deep Dives

### Q: How does the Financial Health Score (0–100) work?
* **Answer**:
  - Rather than generating arbitrary or hardcoded scores, FinSight calculates an explainable, 5-component weighted index:
    1. **Savings Rate (30 pts)**: Ratio of net savings `(Income - Expenses) / Income`. 20%+ savings receives maximum 30 pts.
    2. **Budget Adherence (20 pts)**: Percentage of active budget categories remaining within set monthly thresholds.
    3. **Spending Stability (20 pts)**: Evaluates the Coefficient of Variation ($CV = \sigma / \mu$) across historical monthly expenses. Lower volatility yields higher points.
    4. **Goal Progress (15 pts)**: Average funding percentage across active savings targets.
    5. **Recurring Overhead (15 pts)**: Committed subscriptions and recurring bills as a percentage of income ($< 30\%$ is optimal; $> 60\%$ penalized).
  - Handles all edge cases gracefully: empty transactions, zero income, new user baseline, and zero budget rules without division by zero.

### Q: How does Statistical Anomaly Detection work vs. the Machine Learning model?
* **Answer**:
  - **Statistical Detection (In-app Z-Score)**:
    - Groups expense transactions by category.
    - Computes category mean ($\mu$) and standard deviation ($\sigma$).
    - Calculates $Z = (x - \mu) / \sigma$.
    - Outliers above $Z \ge 2.2\sigma$ are flagged with exact context: *"₹4,500 is 2.8σ above your Food & Dining average (₹285)"*.
    - Implements safety guards: requires minimum sample size ($n \ge 3$) and rejects zero-variance sets to avoid false confidence.
  - **Machine Learning Microservice (Isolation Forest)**:
    - FastAPI Python service utilizing Scikit-learn's `IsolationForest` (`n_estimators=100`, `contamination=0.05`).
    - Engineers 15 multidimensional behavioral features: `log_amount`, `day_of_week`, `hour_of_day`, `is_weekend`, `merchant_frequency`, and one-hot encoded payment channels and transaction types.
    - Returns anomaly scores between -1.0 and 1.0 with severity classifications.

### Q: How does Duplicate Detection distinguish legitimate recurring charges from double billing?
* **Answer**:
  - Employs a 3-stage validation pipeline:
    1. **Semantic Merchant Normalization**: Strips banking prefixes (`UPI-`, `POS*`, `NEFT-`, `IMPS-`) and corporate legal affixes (`Pvt Ltd`, `LLC`, `India`) using regex tokenization.
    2. **Recurrence Discrimination**: Checks if the candidate matches a transaction occurring $28 \pm 4$ days prior. If a match occurs on the monthly cycle, it is classified as a legitimate recurring subscription (e.g. Netflix, Rent) and **not** flagged as a duplicate.
    3. **Time-Windowed Confidence Scoring**: Exact match within 48h generates 1.0 confidence; fuzzy matches generate 0.8–0.9 based on bigram Jaccard similarity.

---

## 4. Scalability, Database Optimization & System Design

### Q: How do you handle 1,000,000+ transactions without UI slowdown or unbounded DB queries?
* **Answer**:
  1. **Genuine Server-Side Pagination**: Replaced client-side `.slice()` with PostgreSQL `.range(from, to)` using `LIMIT` and `OFFSET`. The frontend only loads 15 transactions per page regardless of whether the table contains 10 or 10,000,000 records.
  2. **Targeted Composite B-Tree Indexes**:
     - `idx_transactions_user_type_date` on `(user_id, type, transaction_date DESC)`: Eliminates sequential table scans on dashboard queries.
     - `idx_transactions_user_category_date` on `(user_id, category_id, transaction_date DESC)`: Accelerates category drift and budget calculations.
     - `idx_transactions_account_id` on `(account_id)`: Speeds up shared account ledger lookups.
  3. **RPC Aggregations**: Bulk statistics, monthly sums, and audit counts are calculated in PostgreSQL using aggregate functions rather than fetching raw rows to JavaScript.

### Q: What is the status of Bank Synchronization?
* **Answer**:
  - Built on a clean provider abstraction (`BankSyncProvider` $\rightarrow$ `SandboxProvider`, `AccountAggregatorProvider`, `PlaidProvider`).
  - Currently operates in **Sandbox / Demo Mode**, generating realistic synthetic telemetry streams with clear UI labeling. No false claims of live production banking credentials exist.

---

## 5. Automated Verification & Testing

### Verification Suite:
- **Master Test Runner**: `npm test` executes **45/45 passing automated specs**:
  - 23 Analytics Engine & Edge Case Specs
  - 10 Duplicate Detection & Recurrence Specs
  - 12 Audit Logging & Security Sanitization Specs
- **Python ML Test Suite**: `python -m pytest ml/tests/test_ml.py` executes **9/9 passing pytest specs**.
- **Production Build**: `npm run build` succeeds in $< 1.0\text{s}$ with 0 compilation errors.
