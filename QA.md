# 🧪 Common Cents v1 - QA Checklist

**Version:** v1.0.0-pre-release

**Status:** 🟡 In Progress

---

# 📊 Progress

| Module                | Status | Notes |
| --------------------- | ------ | ----- |
| Dashboard             | ⬜     |       |
| Vaults                | ⬜     |       |
| Transactions          | ⬜     |       |
| Payment Methods       | ⬜     |       |
| Goals                 | ⬜     |       |
| Budgets               | ⬜     |       |
| Subscriptions         | ⬜     |       |
| Achievements          | ⬜     |       |
| Financial Journal     | ⬜     |       |
| Wrapped               | ⬜     |       |
| Settings              | ⬜     |       |
| Notifications         | ⬜     |       |
| Mobile Responsiveness | ⬜     |       |
| Performance           | ⬜     |       |
| Final Polish          | ⬜     |       |

---

# 🏠 Dashboard

## Widgets

- [yes] Net Worth displays correctly
- [yes] Safe to Spend updates correctly
- [ ] Spending Heatmap renders (ability to edit daily spend heatmap, red for lotds of spending, etc)
- [yes] Vault Quick View works
- [yes] Recent Transactions updates
- [yes] Dashboard refreshes correctly

## Empty State

- [ ] No accounts
- [ ] No transactions

---

# 💰 Vaults

## Create

- [yes] Cash
- [ ] Bank
- [ ] Wallet
- [ ] Credit Card
- [ ] Investment

## Edit

- [ ] Name
- [ ] Icon
- [ ] Color
- [ ] Balance

## Delete

- [ ] Delete works
- [ ] Refresh persists deletion

## Edge Cases

- [ ] ₹0 balance
- [ ] Large balances
- [ ] Decimal balances

---

# 💸 Transactions

## Income

- [ ] Add
- [ ] Edit
- [ ] Delete

## Expense

- [ ] Add
- [ ] Edit
- [ ] Delete

## Validation

- [ ] Amount validation
- [ ] Empty description
- [ ] Category selection
- [ ] Date selection
- [ ] Payment Method selection

## Persistence

- [ ] Refresh
- [ ] Dashboard updates
- [ ] Journal updates
- [ ] Wrapped updates

---

# 💳 Payment Methods

- [ ] Create
- [ ] Edit
- [ ] Delete
- [ ] Refresh

---

# 🎯 Goals

- [ ] Create
- [ ] Edit
- [ ] Delete
- [ ] Progress updates
- [ ] Completion works

---

# 📦 Budgets

- [ ] Create
- [ ] Edit
- [ ] Delete
- [ ] Progress bar
- [ ] Over budget state
- [ ] Under budget state

---

# 🔁 Subscriptions

- [ ] Create
- [ ] Edit
- [ ] Delete
- [ ] Monthly
- [ ] Yearly
- [ ] Active / Inactive

---

# 🏆 Achievements

- [ ] Hydration
- [ ] Unlock
- [ ] Refresh
- [ ] Duplicate unlock prevention

---

# 📖 Financial Journal

## Today

- [ ] Summary
- [ ] Hero card
- [ ] Quick Insights

## This Week

- [ ] Correct calculations

## This Month

- [ ] Correct calculations

## This Year

- [ ] Correct calculations

## Custom Range

- [ ] Valid range
- [ ] Invalid range
- [ ] Empty state

---

# 🎵 Wrapped

- [ ] Opens
- [ ] All slides
- [ ] Charts
- [ ] Animations
- [ ] Share
- [ ] Export (if implemented)

---

# ⚙️ Settings

- [ ] Preferences save
- [ ] Notifications
- [ ] Reminder settings

---

# 🔔 Notifications

- [ ] Browser permission
- [ ] Reminder
- [ ] Disable reminder

---

# 📱 Responsive Testing

## Desktop

- [ ] Chrome
- [ ] Edge

## Mobile

- [ ] iPhone
- [ ] Android

## Tablet

- [ ] iPad

---

# ⚡ Performance

- [ ] Fast loading
- [ ] No lag
- [ ] No unnecessary rerenders
- [ ] No console errors
- [ ] No console warnings

---

# 🎨 UI Polish

- [ ] Icons aligned
- [ ] Buttons aligned
- [ ] Cards aligned
- [ ] Consistent spacing
- [ ] Empty states
- [ ] Hover states
- [ ] Loading states

---

# 🐞 Bugs

| Priority  | Module | Description | Status |
| --------- | ------ | ----------- | ------ |
| 🔴 High   |        |             | ⬜     |
| 🟠 Medium |        |             | ⬜     |
| 🟢 Low    |        |             | ⬜     |

---

# ✨ Ideas

Write down ideas during testing instead of implementing them immediately.

- [ ] Compare Periods
- [ ] AI Coach
- [ ] Net Worth Timeline
- [ ] CSV Export
- [ ] Calendar View
- [ ] Receipt Attachments

---

# 🚀 Release Checklist

- [ ] No TypeScript errors
- [ ] No console errors
- [ ] No broken UI
- [ ] No placeholder/mock data
- [ ] Mobile responsive
- [ ] Build succeeds
- [ ] README updated
- [ ] Environment variables documented

---

## Notes

```
Use this space to write observations during testing.

Example:

- Journal feels too long on mobile.
- Budget progress bar overflows at 100%.
- Wrapped export button should show a loading state.
```
