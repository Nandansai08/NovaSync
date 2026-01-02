/**
 * Settlement Service
 * Calculates net balances and generates a minimized settlement plan.
 */

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
        // If splitType is EQUAL, we divide by count of splits (or all members if not specified)
        // For MVP we implemented "Split Equally among ALL members" strategy in expenseController.js
        // So we look at ex.splits if available, or assume all members.

        // Re-construct logic: In expenseController, we stored `splits`.
        if (ex.splits && ex.splits.length > 0) {
            ex.splits.forEach(split => {
                const debtorId = split.userId.toString();
                if (balances[debtorId] !== undefined) {
                    balances[debtorId] -= split.amount;
                }
            });
        }
    });

    // 3. Generate Settlement Plan (Simplistic Greedy)
    // Positive = Creditor (needs to be paid)
    // Negative = Debtor (needs to pay)

    // Round balances to avoid micro-pennies due to floating point math
    for (const uid in balances) {
        balances[uid] = Math.round(balances[uid] * 100) / 100;
    }

    let debtors = [];
    let creditors = [];

    for (const [uid, bal] of Object.entries(balances)) {
        if (bal < -0.01) debtors.push({ uid, amount: bal }); // negative
        if (bal > 0.01) creditors.push({ uid, amount: bal }); // positive
    }

    // Sort by magnitude (largest debt/credit first) to minimize transactions
    debtors.sort((a, b) => a.amount - b.amount); // ascending (most negative first)
    creditors.sort((a, b) => b.amount - a.amount); // descending (most positive first)

    let plan = [];
    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        let debtor = debtors[i];
        let creditor = creditors[j];

        // The amount to settle is the min of abs(debt) and credit
        let amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        // Round to 2 decimals
        amount = Math.round(amount * 100) / 100;

        if (amount > 0) {
            // Find names (we only have UIDs here, controller needs to map names)
            plan.push({ from: debtor.uid, to: creditor.uid, amount });
        }

        // Adjust remaining
        debtor.amount += amount;
        creditor.amount -= amount;

        // If settled, move pointers
        if (Math.abs(debtor.amount) < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return { balances, plan };
};
