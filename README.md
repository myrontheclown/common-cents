# 💰 Common Cents

> **Your Personal Financial Operating System**

Common Cents is a modern personal finance management application built with **React**, **TypeScript**, **Zustand**, and **Supabase**. It helps users manage their finances through intelligent dashboards, budgeting, goal tracking, subscriptions, analytics, and yearly financial summaries.

---

## 📸 Preview

> _(Add screenshots/GIFs here once the UI is finalized.)_

| Dashboard      | Ledger         | Financial Journal |
| -------------- | -------------- | ----------------- |
| _(Screenshot)_ | _(Screenshot)_ | _(Screenshot)_    |

| Wrapped        | Goals          | Budgets        |
| -------------- | -------------- | -------------- |
| _(Screenshot)_ | _(Screenshot)_ | _(Screenshot)_ |

---

# ✨ Features

## 💸 Transaction Management

- Add income and expense transactions
- Edit transactions _(coming soon)_
- Delete transactions
- Categorize spending
- Payment method support
- Multi-vault support
- Automatic balance updates
- Cloud synchronization

---

## 🏦 Vault Management

Track money across multiple vaults.

Examples:

- Cash
- Wallet
- Bank Accounts
- Credit Cards
- Investments
- Crypto

Features:

- Add vaults
- Edit vaults _(coming soon)_
- Delete vaults
- Automatic balance synchronization

---

## 🎯 Goal Tracking

Create financial goals such as:

- Emergency Fund
- Vacation
- New Laptop
- Car
- House

Track:

- Target amount
- Current progress
- Deadline
- Completion status

---

## 📦 Budget Management

Set monthly budgets for spending categories.

Features:

- Category-wise budgets
- Live spending progress
- Budget exceeded indicators
- Budget dashboard

---

## 🔁 Subscription Tracker

Track recurring subscriptions.

Examples:

- Netflix
- Spotify
- ChatGPT
- Amazon Prime

Supports:

- Monthly subscriptions
- Yearly subscriptions
- Renewal dates
- Active / Inactive status

---

## 💳 Payment Methods

Manage:

- Cash
- Debit Card
- Credit Card
- UPI
- Bank Transfer

Used while creating transactions.

---

## 📖 Financial Journal

Your financial story over time.

Includes:

- Today
- This Week
- This Month
- This Year
- Custom Date Range

Shows:

- Income
- Expenses
- Savings
- Largest expense
- Top spending categories
- Budget performance
- Goal progress
- Payment method usage
- Deterministic financial insights

---

## 🎵 Financial Wrapped

Inspired by Spotify Wrapped.

Annual financial recap including:

- Spending habits
- Savings statistics
- Largest purchase
- Spending heatmap
- Category breakdown
- Payment method analysis
- Financial personality
- Achievements

---

## 🏆 Achievement System

Unlock achievements based on financial milestones.

Examples:

- First Transaction
- Budget Master
- Savings Champion

---

## ☁️ Cloud Sync

Powered by Supabase.

Supports:

- Authentication
- PostgreSQL
- Row Level Security
- Automatic data synchronization

All financial data is securely stored and synchronized across devices.

---

# 🏗️ Architecture

```
React
      │
      ▼
Zustand Store
      │
      ▼
Repository Layer
      │
      ▼
Supabase
      │
      ▼
PostgreSQL
```

---

# 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Recharts

### State Management

- Zustand
- Zustand Persist

### Backend

- Supabase
- PostgreSQL

### Database

- Row Level Security (RLS)
- PostgreSQL Triggers
- UUID Primary Keys

---

# 📂 Project Structure

```
src/

components/
    CommandCenter
    Ledger
    Journal
    Wrapped
    Settings
    FloatingHub

lib/
    analytics/
    db/
    financialHelpers.ts

providers/

store.ts

types.ts
```

---

# 🚀 Getting Started

## Clone

```bash
git clone https://github.com/<your-username>/common-cents.git
cd common-cents
```

---

## Install

```bash
npm install
```

---

## Environment Variables

Create:

```
.env
```

Example:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

---

## Run

```bash
npm run dev
```

---

## Production Build

```bash
npm run build
```

---

## Type Check

```bash
npx tsc --noEmit
```

---

# 📊 Current Status

| Module                | Status |
| --------------------- | ------ |
| Dashboard             | ✅     |
| Transactions          | ✅     |
| Vaults                | ✅     |
| Goals                 | ✅     |
| Budgets               | ✅     |
| Subscriptions         | ✅     |
| Payment Methods       | ✅     |
| Financial Journal     | ✅     |
| Wrapped               | ✅     |
| Cloud Sync            | ✅     |
| Financial Consistency | ✅     |
| Transaction Editing   | 🚧     |
| AI Coach              | 🚧     |

---

# 📈 Roadmap

## Version 1.0

- [x] Cloud Sync
- [x] Financial Journal
- [x] Wrapped
- [x] Budgets
- [x] Goals
- [x] Vaults
- [x] Transactions
- [x] Payment Methods
- [x] Subscriptions

---

## Version 1.1

- [ ] Transaction Editing
- [ ] Vault Editing
- [ ] Payment Method Editing
- [ ] Goal Editing
- [ ] Budget Editing
- [ ] Subscription Editing
- [ ] Compare Periods
- [ ] Export to PDF
- [ ] CSV Export

---

## Version 2.0

- [ ] AI Financial Coach
- [ ] Smart Budget Suggestions
- [ ] Net Worth Timeline
- [ ] Recurring Transactions
- [ ] Calendar View
- [ ] Receipt Attachments
- [ ] Spending Forecasts

---

# 🧪 Testing

A complete QA checklist is maintained in:

```
QA.md
```

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Myron D'Cruz**

Computer Science Undergraduate

Built with ❤️ using React, TypeScript and Supabase.
