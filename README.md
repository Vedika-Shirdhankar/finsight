# FinSight — Personal Finance Intelligence Platform

> A full-stack financial management and analytics platform for tracking transactions, managing budgets, monitoring savings goals, and turning financial data into actionable insights.

## Overview

**FinSight** is a full-stack personal finance platform designed to help users understand and manage their finances from a single dashboard.

Instead of functioning as a simple expense tracker, FinSight combines transaction management, budgeting, savings goals, recurring transactions, financial analytics, automated categorization, duplicate detection, shared accounts, notifications, and security controls into one system.

The project focuses on building a secure, data-driven financial application with a scalable architecture and clear separation between the frontend, backend services, and database layer.

---

## Key Features

### 📊 Financial Dashboard

* Overview of income, expenses, savings, and account balances
* Monthly financial summaries
* Spending trends
* Category-wise expense breakdown
* Recent transaction activity
* Financial insights and alerts

### 💳 Transaction Management

* Create, edit, and delete transactions
* Income and expense tracking
* Transaction categorization
* Search and filtering
* Date-based filtering
* Automatic transaction categorization
* Duplicate transaction detection
* Recurring transaction support

### 📈 Financial Analytics

FinSight provides analytical views for understanding spending behavior, including:

* Income vs. expense trends
* Monthly spending analysis
* Category-wise spending
* Savings rate
* Spending patterns
* Budget utilization
* Financial trends over time

### 🎯 Budget Management

* Create category-based budgets
* Track spending against budgets
* Monitor budget utilization
* Identify overspending
* View budget progress over time

### 💰 Savings Goals

* Create personalized savings goals
* Define target amounts
* Track progress
* Monitor contributions
* Visualize progress toward financial targets

### 🔄 Recurring Transactions

Support for recurring financial commitments such as:

* Rent
* Subscriptions
* EMIs
* Salaries
* Utility payments
* Other recurring income or expenses

### 🤝 Shared Accounts

Users can collaborate on shared financial accounts with support for:

* Account members
* Shared transactions
* Transaction splitting
* Member-level access control

### 🧠 Intelligent Transaction Processing

FinSight includes automated financial-data processing such as:

* Merchant normalization
* Automatic categorization
* Duplicate detection
* Transaction pattern analysis
* Confidence-based categorization

### 📥 CSV Import

Users can import transaction data from CSV files.

The import workflow is designed to:

1. Parse uploaded transaction data
2. Validate records
3. Normalize transaction information
4. Categorize transactions
5. Detect potential duplicates
6. Store valid records

### 🔐 Security

Security is treated as a core part of the application rather than an afterthought.

The application includes:

* Authentication
* Role-based authorization
* Supabase Row Level Security (RLS)
* User-scoped financial data
* Protected backend operations
* Audit logging
* Environment-based secret management
* Input validation

Sensitive credentials such as Supabase service-role keys are kept on the server and are never exposed to the frontend.

---

# Architecture

```text
                         ┌─────────────────────┐
                         │       User          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │ React + TypeScript        │
                    │                           │
                    │ UI / Pages / Components   │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │ TanStack Router / Query   │
                    │                           │
                    │ Routing & Server State    │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │ Application/API Layer     │
                    │                           │
                    │ Validation                │
                    │ Business Logic            │
                    │ Authorization              │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │ Express Backend           │
                    │                           │
                    │ Protected Operations      │
                    │ Integrations               │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │ Supabase                  │
                    │                           │
                    │ PostgreSQL                │
                    │ Authentication            │
                    │ Row Level Security        │
                    │ Database Policies          │
                    └───────────────────────────┘
```

---

# Technology Stack

## Frontend

* **React**
* **TypeScript**
* **Vite**
* **TanStack Router**
* **TanStack Query**
* **Tailwind CSS**
* **Recharts**
* **Lucide React**

## Backend

* **Node.js**
* **Express.js**
* **TypeScript / JavaScript**
* REST-style API architecture

## Database & Authentication

* **Supabase**
* **PostgreSQL**
* **Supabase Authentication**
* **Row Level Security (RLS)**

## Validation & Data Processing

* **Zod**
* CSV parsing
* Transaction normalization
* Duplicate detection
* Automated categorization

## Development & Deployment

* Git
* GitHub
* Environment variables
* Vite
* Node.js

---

# Database Design

The application uses PostgreSQL through Supabase.

The core data model is centered around users, accounts, and transactions.

```text
Users
 │
 ├── Accounts
 │      │
 │      ├── Transactions
 │      │       └── Transaction Splits
 │      │
 │      └── Account Members
 │
 ├── Budgets
 │
 ├── Savings Goals
 │
 ├── Recurring Transactions
 │
 └── Notifications

Transactions
      │
      └── Audit Logs
```

The database uses Row Level Security policies to ensure users can only access resources they are authorized to access.

---

# Security Model

Financial applications require strong data isolation.

FinSight uses multiple layers of security:

### Authentication

Users authenticate through Supabase Authentication.

### Authorization

Application-level authorization determines which operations a user can perform.

### Row Level Security

PostgreSQL RLS policies provide database-level protection.

This means that even if an application-level check is accidentally bypassed, database policies can still prevent unauthorized access to another user's financial records.

### Service Role Protection

The Supabase service-role key is intended only for trusted backend/server environments.

It must never be exposed through frontend code or committed to the repository.

### Audit Logging

Important financial operations can be recorded for traceability and accountability.

---

# Financial Analytics

FinSight converts raw transaction data into useful financial metrics.

Examples include:

### Savings Rate

```text
Savings Rate =
(Income - Expenses) / Income × 100
```

### Budget Utilization

```text
Budget Utilization =
Amount Spent / Budget Limit × 100
```

### Average Transaction Value

```text
Average Transaction =
Total Transaction Amount / Number of Transactions
```

### Month-over-Month Spending

```text
MoM Change =
(Current Month Spending - Previous Month Spending)
-------------------------------------------------- × 100
              Previous Month Spending
```

These metrics allow users to identify changes in spending behavior rather than simply viewing raw transactions.

---

# Intelligent Transaction Categorization

Transactions can be automatically categorized using transaction metadata and merchant information.

The processing pipeline follows the general pattern:

```text
Raw Transaction
       │
       ▼
Merchant Normalization
       │
       ▼
Rule / Pattern Matching
       │
       ▼
Category Prediction
       │
       ▼
Confidence Score
       │
       ▼
User Confirmation / Storage
```

For example:

```text
"SWIGGY ORDER"
      ↓
Food & Dining
      ↓
High Confidence
```

This reduces manual categorization while still allowing users to correct classifications.

---

# Duplicate Detection

Imported or synchronized financial data can contain duplicate transactions.

FinSight can compare transaction attributes such as:

* Amount
* Date
* Merchant
* Account
* Transaction type

to identify potential duplicate records before they are treated as separate expenses.

---

# CSV Import Pipeline

```text
CSV File
   │
   ▼
Parse
   │
   ▼
Validate
   │
   ▼
Normalize
   │
   ▼
Categorize
   │
   ▼
Duplicate Detection
   │
   ▼
Database
```

Invalid records can be rejected without compromising the rest of the import process.

---

# Project Structure

A simplified structure of the application:

```text
insightful-fin-flows/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── hooks/
│   ├── lib/
│   └── ...
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── ...
│
├── supabase/
│   └── migrations/
│
├── public/
│
├── package.json
├── vite.config.*
├── tsconfig.*
├── .gitignore
└── README.md
```

> The exact structure may evolve as the project grows.

---

# Getting Started

## Prerequisites

Make sure you have installed:

* Node.js 18+
* npm
* Git
* A Supabase project

---

## 1. Clone the repository

```bash
git clone https://github.com/Vedika-Shirdhankar/insightful-fin-flows.git
cd insightful-fin-flows
```

---

## 2. Install dependencies

```bash
npm install
```

If the backend has a separate package configuration, install its dependencies as well.

---

## 3. Configure environment variables

Create a `.env` file based on the project's environment configuration.

Example:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Additional variables may be required for optional integrations.

### Important

Never commit `.env` files or production credentials.

Use:

```gitignore
.env
.env.*
```

in `.gitignore`.

---

## 4. Configure Supabase

Create a Supabase project and configure:

* Database
* Authentication
* Database migrations
* Row Level Security policies

Apply the migrations included in:

```text
supabase/migrations/
```

---

## 5. Start the development server

```bash
npm run dev
```

Open the local URL displayed by Vite.

---

# Testing

The project is intended to be tested at multiple levels:

### Unit Tests

Test individual utilities and business logic.

### Integration Tests

Test interactions between services, APIs, and the database.

### End-to-End Tests

Important user journeys should be tested from the UI.

Example:

```text
Login
  ↓
Create Transaction
  ↓
Transaction Stored
  ↓
Dashboard Updated
  ↓
Analytics Updated
```

---

# Performance & Scalability Considerations

The application is designed with scalability in mind.

Potential scaling strategies include:

* Database indexing on frequently queried fields
* Server-side pagination
* Server-side filtering
* Efficient aggregation queries
* Query caching
* Separation of frontend and backend responsibilities
* Asynchronous processing for expensive operations
* Provider-agnostic external integrations

For large transaction datasets, filtering and aggregation should be performed at the database layer rather than loading the entire dataset into the browser.

---

# Future Improvements

Potential future improvements include:

* Real-time bank synchronization
* Open Banking / Account Aggregator integrations
* Advanced financial forecasting
* Machine-learning-based spending predictions
* Personalized financial health scoring
* Anomaly detection for unusual transactions
* Advanced recurring-payment detection
* Investment tracking
* Multi-currency support
* Mobile application
* Expanded automated testing
* Background job processing
* Observability and monitoring

---

# Engineering Challenges

Some of the key engineering challenges addressed by the project include:

### 1. Protecting financial data

Financial information must remain isolated between users. Database-level RLS provides an additional security layer beyond frontend authorization.

### 2. Handling inconsistent transaction data

Imported transaction data can have inconsistent merchant names, formats, and duplicate records. Normalization and validation help produce cleaner financial datasets.

### 3. Designing for external integrations

Banking providers can have different APIs and failure modes. A provider-agnostic integration layer allows external providers to be added without tightly coupling the rest of the application to one service.

### 4. Maintaining consistent analytics

Financial dashboards depend on accurate aggregation of transactions. Analytics should therefore be derived from a consistent transaction model rather than duplicated across multiple frontend components.

---

# Why FinSight?

Traditional expense trackers primarily answer:

> **"Where did my money go?"**

FinSight aims to answer a broader question:

> **"What is happening with my finances, why is it happening, and what should I pay attention to?"**

By combining transaction management with analytics, budgeting, savings goals, intelligent categorization, and security controls, the platform provides a foundation for more informed financial decision-making.

---

# Project Status

🚧 **Active Development**

Core financial management functionality is implemented, with ongoing improvements focused on:

* Security hardening
* Automated testing
* Analytics
* Performance
* External financial integrations
* Production deployment

---

# Author

**Vedika Shirdankar**

Computer Science & Engineering

---

## License

This project is intended for educational, portfolio, and demonstration purposes.
