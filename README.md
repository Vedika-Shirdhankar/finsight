# FinSight Analytics

Build a production-quality full-stack FinTech web application called "FinSight".

IMPORTANT:

This is NOT a simple expense tracker.

The project must demonstrate strong Software Engineering + FinTech + Data Analytics capabilities.

CORE IDEA:

FinSight is a financial intelligence platform that allows users to manage digital financial transactions while transforming transaction data into meaningful, actionable financial insights.

PROBLEM:

Digital payment platforms generate large amounts of transaction data, but users often only see basic transaction histories and balances. They lack meaningful tools to understand spending patterns, financial trends, category-wise expenses, savings behavior, and changes in their financial activity.

FinSight solves this by combining:

1. Financial transaction management

2. Personal financial management

3. Advanced data analytics

4. Interactive dashboards

5. Actionable financial insights

==================================================

TECH STACK

==================================================

Frontend:

- React

- Vite

- Tailwind CSS

- React Router

- Recharts

- Lucide React

Backend:

- Node.js

- Express.js

- REST APIs

- JWT authentication

- bcrypt password hashing

Database:

- PostgreSQL

Analytics:

- SQL

- Python

- Pandas

- NumPy

Do NOT use Firebase as the primary database.

Structure the application so that the backend and database can later be connected to real services.

==================================================

DESIGN DIRECTION

==================================================

Create a premium modern FinTech interface.

The UI should feel like a combination of:

- modern digital banking

- Bloomberg-style financial analytics

- Stripe-level product polish

- modern SaaS dashboards

Do NOT make it look like a generic admin template.

Design principles:

- Clean

- Professional

- Minimal

- Trustworthy

- Financial

- Data-focused

- Excellent typography

- Strong visual hierarchy

- Spacious layouts

- Subtle animations

- Rounded cards

- High-quality charts

- Consistent iconography

Use a sophisticated financial color system with neutral backgrounds and restrained green/blue accents.

Support both light and dark mode.

Make the interface fully responsive for:

- desktop

- tablet

- mobile

==================================================

APPLICATION STRUCTURE

==================================================

Create these major sections:

1. Landing Page

2. Authentication

3. User Dashboard

4. Transactions

5. Analytics

6. Budgets

7. Savings Goals

8. Accounts

9. Profile / Settings

10. Admin Dashboard

==================================================

LANDING PAGE

==================================================

Create a polished landing page explaining:

"Turn transactions into financial intelligence."

Hero section:

- Strong headline

- Short explanation

- Get Started button

- View Demo button

- Modern financial dashboard visual

Sections:

- Why FinSight

- Transaction Management

- Financial Analytics

- Smart Insights

- Budget Tracking

- Data-driven financial decisions

- Security section

- Final CTA

Avoid excessive marketing text.

==================================================

AUTHENTICATION

==================================================

Create:

- Sign Up

- Login

- Logout

- Forgot Password UI

- Protected routes

Sign up fields:

- Full name

- Email

- Password

- Confirm password

Login:

- Email

- Password

Use JWT-based authentication architecture.

Create proper validation and error states.

==================================================

USER DASHBOARD

==================================================

The dashboard should be the main experience.

Top section:

"Good morning, [User Name]"

Show KPI cards:

Total Balance

Monthly Income

Monthly Expenses

Savings

Savings Rate

Example:

Total Balance       ₹85,420

Monthly Income      ₹65,000

Monthly Expenses    ₹42,350

Savings             ₹22,650

Savings Rate        34.8%

Each KPI should show:

- current value

- percentage change

- comparison with previous month

- small visual indicator

==================================================

DASHBOARD ANALYTICS

==================================================

Create beautiful interactive charts.

1. Income vs Expenses

Line/bar chart showing:

- income

- expenses

- savings

with:

- 7 days

- 30 days

- 6 months

- 1 year filters

2. Spending by Category

Donut chart:

Food

Shopping

Transport

Bills

Entertainment

Healthcare

Education

Other

3. Spending Trend

Line chart showing daily/weekly spending.

4. Top Spending Categories

Rank categories by expenditure.

5. Recent Transactions

Show:

- merchant

- category

- amount

- date

- transaction type

- status

==================================================

ACTIONABLE INSIGHTS

==================================================

This is a VERY IMPORTANT feature.

Do not only display charts.

Create an "Financial Insights" section.

Examples:

"Food spending increased 23% compared with last month."

"Your average monthly savings increased 11% over the last 3 months."

"Shopping represents 31% of your discretionary spending."

"Your highest spending day this month was Saturday."

"Your current savings rate is above your 3-month average."

Each insight should have:

- icon

- title

- explanation

- relevant metric

- severity/type such as Positive, Warning, Neutral

Use realistic calculated demo data.

==================================================

TRANSACTIONS

==================================================

Create a complete transaction management system.

Transaction fields:

- Transaction ID

- Date

- Amount

- Sender

- Receiver

- Merchant

- Category

- Payment method

- Transaction type

- Status

- Description

Transaction types:

- Income

- Expense

- Transfer

Statuses:

- Completed

- Pending

- Failed

Payment methods:

- UPI

- Debit Card

- Credit Card

- Bank Transfer

- Cash

Features:

- Add transaction

- Edit transaction

- Delete transaction

- Search

- Filter

- Sort

- Pagination

- Date range filter

- Category filter

- Amount filter

- Transaction type filter

- Status filter

Create a professional transaction table.

==================================================

TRANSACTION DETAILS

==================================================

Clicking a transaction should open a detailed view/modal.

Show:

Transaction ID

Amount

Date & Time

Sender

Receiver

Merchant

Category

Payment Method

Status

Description

Add a visual transaction timeline.

==================================================

BUDGET MANAGEMENT

==================================================

Users can create monthly budgets.

Example:

Food

Budget: ₹8,000

Spent: ₹6,450

Remaining: ₹1,550

Display progress bars.

Budget states:

Healthy

Near Limit

Exceeded

Create analytics showing:

- total budget

- total spent

- remaining budget

- category-wise budget utilization

Generate insights such as:

"You have used 81% of your Food budget."

==================================================

SAVINGS GOALS

==================================================

Allow users to create goals.

Example:

Emergency Fund

Target: ₹1,00,000

Saved: ₹65,000

Progress: 65%

Other examples:

Laptop

Travel

Education

Emergency Fund

Show:

- target

- current amount

- remaining amount

- progress

- target date

==================================================

ACCOUNTS

==================================================

Create simulated financial accounts.

Examples:

Savings Account

₹52,400

Checking Account

₹21,300

Digital Wallet

₹11,720

Credit Card

-₹4,500

Allow users to:

- add account

- edit account

- view account details

- view account transaction history

Clearly label these as simulated/demo financial accounts.

Do NOT connect to real banks or payment systems.

==================================================

ANALYTICS PAGE

==================================================

Create a dedicated advanced Analytics page.

This should be one of the strongest parts of the application.

Add filters:

- Date range

- Category

- Account

- Transaction type

KPIs:

Total Transaction Volume

Total Income

Total Expenses

Average Transaction Value

Savings Rate

Number of Transactions

Charts:

1. Monthly spending trend

2. Income vs expenses

3. Category distribution

4. Transaction volume

5. Average transaction value

6. Savings trend

7. Top merchants

8. Spending by payment method

9. Weekday vs weekend spending

10. Month-over-month growth

==================================================

DATA ANALYTICS

==================================================

Design the system so analytics can later be generated using SQL and Python/Pandas.

Include a dedicated "Data Insights" section.

Examples:

- Month-over-month expense growth

- Top 5 spending categories

- Top merchants

- Average transaction value

- Repeat transaction behavior

- Category growth

- Spending concentration

- Savings trends

- User activity trends

Use realistic demo data so charts look meaningful.

Avoid random meaningless charts.

Every chart should answer a business/financial question.

==================================================

ADMIN DASHBOARD

==================================================

Create an Admin Dashboard for platform-level analytics.

KPIs:

Total Users

Active Users

Total Transactions

Transaction Volume

Average Transaction Value

Failed Transactions

Pending Transactions

Charts:

- Transaction volume over time

- User growth

- Transaction success/failure

- Category distribution

- Payment method usage

- Daily active users

- Monthly transaction growth

Admin tables:

Users

Transactions

Categories

Admin capabilities:

- View users

- Search users

- Filter users

- View transaction activity

- Manage categories

- View platform analytics

Use role-based access control.

==================================================

USER PROFILE

==================================================

Create:

- Personal information

- Email

- Profile picture

- Account preferences

- Notification settings

- Theme settings

- Security settings

==================================================

NOTIFICATIONS

==================================================

Create a notification center.

Examples:

"Your Food budget is almost exhausted."

"Your monthly spending increased by 18%."

"Your savings goal is 65% complete."

"Unusual transaction detected."

==================================================

FUTURE ML ARCHITECTURE

==================================================

Design the backend so ML can be added later.

Do NOT make ML the main feature initially.

Create a placeholder architecture for:

1. Financial anomaly detection

2. Expense forecasting

Example future insight:

"Your projected expenses next month are ₹4,200 higher than your current monthly average."

Another:

"An unusually large transaction was detected compared with your normal transaction behavior."

Do not claim actual ML is running unless implemented.

==================================================

DATABASE DESIGN

==================================================

Create a clean relational database architecture.

Tables should include approximately:

users

accounts

transactions

categories

budgets

budget_categories

savings_goals

notifications

Use proper relationships and foreign keys.

Transactions should contain:

id

user_id

account_id

amount

type

category_id

merchant

payment_method

status

description

transaction_date

created_at

Use appropriate indexes for:

user_id

transaction_date

category_id

status

==================================================

API ARCHITECTURE

==================================================

Structure the backend using clean REST APIs.

Example:

POST /api/auth/register

POST /api/auth/login

GET /api/users/profile

GET /api/accounts

POST /api/accounts

GET /api/transactions

POST /api/transactions

GET /api/transactions/:id

PUT /api/transactions/:id

DELETE /api/transactions/:id

GET /api/budgets

POST /api/budgets

GET /api/goals

POST /api/goals

GET /api/analytics/overview

GET /api/analytics/spending

GET /api/analytics/categories

GET /api/admin/users

GET /api/admin/transactions

GET /api/admin/analytics

Use proper:

- controllers

- routes

- middleware

- services

- database layer

- validation

- error handling

Do not put all backend logic into one file.

==================================================

SECURITY

==================================================

Implement proper software engineering practices.

- Password hashing

- JWT authentication

- Protected routes

- Role-based authorization

- Input validation

- API error handling

- Environment variables

- No hardcoded secrets

- Basic rate limiting architecture

- Secure API structure

Never expose passwords or sensitive authentication data in frontend responses.

Since this is a student/demo project, clearly state that financial accounts and transactions are simulated and no real banking credentials are collected.

==================================================

UX REQUIREMENTS

==================================================

Add:

- Loading states

- Skeleton loaders

- Empty states

- Error states

- Success notifications

- Confirmation dialogs

- Form validation

- Responsive navigation

- Sidebar

- Top navigation

- Breadcrumbs where useful

Use smooth but subtle animations.

Do not overuse animations.

==================================================

DEMO DATA

==================================================

Populate the application with realistic demo data.

Create:

- multiple users

- multiple accounts

- hundreds of transactions

- different categories

- different transaction dates

- different transaction amounts

- successful/failed/pending transactions

The dashboard should look populated immediately after login.

Use Indian financial context:

Currency: INR (₹)

Payment methods should prominently include:

- UPI

- Cards

- Bank Transfer

Use realistic Indian merchants/categories without using real sensitive financial information.

==================================================

IMPORTANT PRODUCT PRINCIPLES

==================================================

1. This must feel like a real FinTech product.

2. It must NOT look like a basic CRUD college project.

3. Analytics must be a core part of the application.

4. Every dashboard visualization should answer a meaningful financial question.

5. SDE architecture should be clean and scalable.

6. Keep the product focused on transaction management and financial analytics.

7. Do not add healthcare, social media, crypto trading, stock trading, or unrelated features.

8. Do not make medical/health features.

9. Do not integrate real banking credentials.

10. Use simulated financial data.

==================================================

FINAL QUALITY BAR

==================================================

Before considering the project complete, verify:

- All routes work

- Authentication flow works

- Dashboard loads correctly

- Transactions CRUD works

- Search/filter/sort works

- Budgets work

- Savings goals work

- Analytics charts work

- Admin dashboard works

- Role-based access works

- Responsive UI works

- Dark mode works

- Loading/error/empty states exist

- No broken buttons

- No placeholder lorem ipsum

- No dead navigation

- No fake functionality presented as real

- No console errors

- Clean component structure

- Clean API structure

- Clean database architecture

Prioritize functionality, data consistency, UX, and maintainable architecture over adding unnecessary features.

Build the application incrementally, starting with the core architecture and database, then authentication, transactions, dashboard, analytics, budgets, goals, and finally admin functionality.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://insightful-fin-flows.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6dc1561f-b6cc-4da7-b743-058ac9493b8e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Audit Logging System

FinSight includes a production-grade, compliance-ready **Audit Logging System** designed to track and record all financial data changes and user access events.

### 1. Objective & Capability
The audit system answers five core compliance questions for any state mutation:
> **Who did what, to which resource, when, and what changed?**

### 2. Database Design (`public.audit_logs`)
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key `auth.users(id)`)
- `action`: Operations recorded (`CREATE`, `UPDATE`, `DELETE`, `IMPORT`, `MEMBER_ADDED`, `MEMBER_REMOVED`, `PERMISSION_CHANGED`)
- `resource_type`: Affected category (`transaction`, `account`, `budget`, `budget_category`, `savings_goal`, `recurring_transaction`, `account_member`)
- `resource_id`: Affected entity ID
- `old_data`: Prior state snapshot (for UPDATE / DELETE)
- `new_data`: Updated state snapshot (for CREATE / UPDATE)
- `metadata`: Contextual statistics (`filename`, `number_of_rows`, `successful_rows`, `failed_rows`, `duplicate_rows`, field diffs)
- `created_at`: TIMESTAMPTZ timestamp

### 3. Security & Append-Only RLS Model
Row-Level Security (RLS) policies strictly enforce:
- **Append-Only Access**: Authenticated users can `INSERT` and `SELECT` their own audit entries.
- **Strict Prohibition of Tampering**: **No `UPDATE` or `DELETE` policies exist for application roles**. Once recorded, audit logs cannot be edited or deleted by users.
- **Admin Visibility**: Authorized administrators can view and query platform-wide audit logs via `get_audit_logs(...)` Security Definer RPC.
- **Secret Redaction**: Passwords, tokens, API keys, and private parameters are automatically sanitized before audit log persistence.

### 4. Audited Financial Operations
- **Transactions**: `CREATE`, `UPDATE` (with before/after field diff), `DELETE`
- **Accounts**: `CREATE`, `UPDATE`, `DELETE`
- **Budgets & Categories**: `CREATE`, `UPDATE`, `DELETE`
- **Savings Goals**: `CREATE`, `UPDATE`, `DELETE`, progress updates
- **Recurring Transactions**: `CREATE`, `UPDATE`, `DELETE`
- **Shared Accounts**: `MEMBER_ADDED`, `MEMBER_REMOVED`, `PERMISSION_CHANGED`
- **CSV Imports**: `IMPORT` with metrics (`filename`, `number_of_rows`, `successful_rows`, `failed_rows`, `duplicate_rows`)

### 5. UI Features & Pagination
- **Dedicated Audit Trail Page**: Available under `/dashboard/audit-logs`.
- **Filtering & Search**: Filter by Action, Resource Type, Date Range, and Search Query.
- **Server-Side Pagination**: Efficient database-level pagination (`get_audit_logs` RPC) returning `total_count` and paginated log records.
- **Visual Inspector Modal**: Shows formatted before $\rightarrow$ after diffs (`₹2,500 ↓ ₹2,200`), structured event summaries, and developer JSON tabs.
- **Admin Control Integration**: Integrated tab in Admin Control Center (`/admin`) for multi-user audit management.


## Machine Learning Anomaly Detection Microservice

FinSight includes a standalone, production-ready Machine Learning transaction anomaly detection service extending the platform's baseline statistical (Z-score) analytics.

### 1. Architecture Flow

```text
React / TanStack Frontend (Insights Dashboard)
        │
        ▼ (POST /predict with sanitized transaction data)
FastAPI REST Microservice (`ml/app.py` on port 8000)
        │
        ▼
Feature Engineering Pipeline (`ml/feature_engineering.py`)
├── Numerical & Log Scaling (`log_amount = np.log1p(amount)`)
├── Temporal Extraction (`hour_of_day`, `day_of_week`, `is_weekend`)
├── Text Length Metric (`description_length`)
├── Frequency Encoding (`merchant_frequency`)
└── Fixed One-Hot Encodings (`type_*`, `payment_method_*`)
        │
        ▼
Isolation Forest ML Model (`ml/model.py` - sklearn IsolationForest)
        │
        ▼
Anomaly Scoring & Explanation Engine
├── Anomaly Decision Boundary (Score > 0.0)
├── Severity Classification (`High`, `Medium`, `Low`, `Normal`)
└── Human-Readable Reason Generator
        │
        ▼
Insights Dashboard UI Visualization
```

### 2. Key Machine Learning Concepts
- **Isolation Forest Unsupervised Model**: Isolates anomalies directly by randomly selecting features and splitting values. Anomalous transactions require fewer tree splits (shorter depth) to isolate than normal spending patterns.
- **Statistical Z-Score vs ML Anomaly Detection**:
  - *Statistical Z-Score*: Single-variable standard deviation limit ($Z > 2.2\sigma$) evaluating amount against category averages.
  - *Isolation Forest ML*: Multi-variable model simultaneously evaluating interactions between amount, log-scale, temporal hour, merchant frequency, and payment channel.
- **Interpretation Note**: An anomaly indicates an unusual transaction pattern flagged by decision tree splits. It does not necessarily indicate fraud.

### 3. Local Setup & Execution Instructions

#### 1. Configure Environment Variables
Copy `.env.example` to `.env` or verify:
```bash
VITE_ML_API_URL=http://localhost:8000
```

#### 2. Install ML Dependencies & Train Model
```bash
pip install -r ml/requirements.txt
python ml/train.py
```

#### 3. Run FastAPI Microservice
```bash
uvicorn ml.app:app --host 0.0.0.0 --port 8000 --reload
```

#### 4. Run Pytest Verification Suite
```bash
python -m pytest ml/tests/test_ml.py -v
```

#### 5. Launch React Frontend
```bash
npm run dev
```
Navigate to `/dashboard/insights` and click **"Analyze Transactions"**.



==================================================

## 🚀 Engineering Enhancements & System Verification

### 1. Transparent Financial Health Score (0–100)
- **Mathematical Formula**:
  $$\text{Health Score} = \text{Savings}(30\%) + \text{Budgets}(20\%) + \text{Stability}(20\%) + \text{Goals}(15\%) + \text{Overhead}(15\%)$$
- **Explainable Components**:
  1. *Savings Rate (30 pts)*: Net savings ratio vs 20% benchmark.
  2. *Budget Adherence (20 pts)*: Percentage of category limits respected.
  3. *Spending Stability (20 pts)*: Coefficient of variation ($CV = \sigma / \mu$) across monthly expenses.
  4. *Goal Progress (15 pts)*: Average progress towards target dates.
  5. *Recurring Overhead (15 pts)*: Committed fixed bills vs income ratio ($<30\%$ is optimal).
- **Edge Case Robustness**: Zero denominators, missing income, and new user profiles handle gracefully with explicit data warning banners.

### 2. Genuine Server-Side Database Pagination
- **Query Architecture**: React $\rightarrow$ TanStack Query $\rightarrow$ Supabase/PostgreSQL $\rightarrow$ `.range((page - 1) * limit, page * limit - 1)` with exact row counts.
- **Frontend Controls**: Server-driven `Previous` / `Next` pagination bar with total records count and page counter.

### 3. Database Performance Indexes
- `idx_transactions_account_id`: Accelerates shared account and ledger queries.
- `idx_transactions_type`: Speeds up income vs expense query separation.
- `idx_transactions_user_type_date`: Composite index on `(user_id, type, transaction_date DESC)`.
- `idx_transactions_user_category_date`: Composite index on `(user_id, category_id, transaction_date DESC)`.
- `idx_recurring_txns_user_active`: Composite index on `(user_id, is_active)`.
- `idx_savings_goals_user_target_date`: Ordered index on `(user_id, target_date ASC)`.

### 4. Hardened Duplicate Detection & Recurrence Safety
- **Merchant Semantic Normalization**: Tokenizes and strips channel prefixes (`UPI-`, `POS*`, `NEFT-`) and legal affixes (`Pvt Ltd`, `India`).
- **Recurrence Discrimination**: Prevents false-positive duplicate flags on legitimate monthly recurring subscriptions (e.g. Netflix billed every 30 days).

### 5. Multi-Layer Security Architecture
- **Append-Only Audit Trail**: `audit_logs` table has zero `UPDATE` or `DELETE` RLS policies.
- **Actor Identity Verification**: Derived strictly from `auth.uid()` via cryptographically verified JWT tokens. Client-supplied IDs are never trusted.
- **Secret Sanitization**: Recursive scanner in `audit-logger.js` automatically redacts credentials, passwords, and tokens.
- **Service Role Isolation**: `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to server-side Node.js environments.

### 6. Sandbox / Demo Mode Bank Synchronization
- Clearly labeled Sandbox / Demo Mode indicator across all Bank Sync dialogs.
- Clean provider abstraction (`SandboxProvider`, `AccountAggregatorProvider`, `PlaidProvider`).

### 7. Automated Verification & Testing Suite
```bash
# Run 45/45 JavaScript Unit, Security, and Algorithmic Specs
npm test

# Run 9/9 Python Machine Learning Isolation Forest Specs
python -m pytest ml/tests/test_ml.py

# Run Production Frontend Build (Vite)
npm run build
```


==================================================

## 🤖 Privacy-First AI Financial Assistant & Natural-Language Search

FinSight features a dedicated **Natural-Language Financial Search & Assistant Drawer** accessible directly from the dashboard header and sidebar.

### Capabilities:
- **Conversational Spending Queries**: *"How much did I spend on food this month?"*, *"What were my biggest expenses last week?"*
- **Filtered Transaction Search**: *"Show transactions above ₹5,000"*, *"Show Amazon shopping expenses"*
- **Budget & Health Tracking**: *"Am I close to exceeding my budgets?"*, *"What is my financial health score?"*
- **Controlled Transaction Staging**: *"Add a ₹450 food expense for Swiggy"* $\rightarrow$ Opens a visual confirmation card requiring explicit user confirmation before recording.
- **Safe Route Navigation**: *"Open my budgets"*, *"Take me to savings goals"*

### Privacy & Security Guarantees:
- **Zero Financial Data Sent to External LLMs**: Intent parsing extracts only structured action schemas (`GET_SPENDING`, `GET_BUDGET_STATUS`).
- **PostgreSQL RLS Enforcement**: Actor identity is derived strictly from verified JWT sessions (`auth.uid()`).
- **Allowlisted Tool Architecture**: Only 10 authorized tools are callable. No raw SQL or unrestricted database access.
- **Prompt Injection Defense**: Intercepts and rejects prompt injection and privilege escalation attempts.

### Verification:
```bash
# Run 70/70 Master Automated Tests (including 25 AI Assistant specs)
npm test
```
