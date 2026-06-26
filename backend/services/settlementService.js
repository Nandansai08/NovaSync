/**
 * Settlement Service
 * Calculates net balances and generates a minimized settlement plan.
 */

/**
 * Calculate balance for a single member in a group.
 * Handles its own data fetching so the controller doesn't need to import Expense/GroupMember directly.
 * @returns {Promise<{balance: number|null, isMember: boolean}>}
 */
exports.getMemberBalance = async (groupId, userId, session) => {
  const Expense = require('../models/Expense');
  const GroupMember = require('../models/GroupMember');
  const membership = await (session ? GroupMember.findOne({ groupId, userId }).session(session) : GroupMember.findOne({ groupId, userId }));
  if (!membership) return { balance: null, isMember: false };

  const expenses = await (session ? Expense.find({ groupId }).session(session) : Expense.find({ groupId }));
  const members = await (session ? GroupMember.find({ groupId }).session(session) : GroupMember.find({ groupId }));
  const { balances } = exports.calculateBalances(expenses, members);
  const uid = userId.toString();
  return { balance: balances[uid] !== undefined ? balances[uid] : 0, isMember: true };
};

exports.calculateBalances = (expenses, members) => {
    // 1. Initialize balances
    let balances = {};
    members.forEach(m => {
        balances[m.userId._id.toString()] = 0;
    });

    // 2. Process Expenses
    expenses.forEach(ex => {
        const payerId = ex.paidBy._id.toString();
        const amount = ex.amount;

        // Credit the payer
        if (balances[payerId] !== undefined) {
            balances[payerId] += amount;
        }

        // Debit the splitters
        if (ex.splits && ex.splits.length > 0) {
            ex.splits.forEach(split => {
                const debtorId = split.userId.toString();
                if (balances[debtorId] !== undefined) {
                    balances[debtorId] -= split.amount;
                }
            });
        }
    });

    // 3. Round balances to avoid micro-pennies due to floating point math
    for (const uid in balances) {
        balances[uid] = Math.round(balances[uid] * 100) / 100;
    }

    // 4. Generate Settlement Plan (Simplistic Greedy)
    let debtors = [];
    let creditors = [];

    for (const [uid, bal] of Object.entries(balances)) {
        if (bal < -0.01) debtors.push({ uid, amount: bal });
        if (bal > 0.01) creditors.push({ uid, amount: bal });
    }

    debtors.sort((a, b) => a.amount - b.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    let plan = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        let debtor = debtors[i];
        let creditor = creditors[j];

        let amount = Math.min(Math.abs(debtor.amount), creditor.amount);
        amount = Math.round(amount * 100) / 100;

        if (amount > 0) {
            plan.push({ from: debtor.uid, to: creditor.uid, amount });
        }

        debtor.amount += amount;
        creditor.amount -= amount;

        if (Math.abs(debtor.amount) < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return { balances, plan };
};
