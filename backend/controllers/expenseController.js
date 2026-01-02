const Expense = require('../models/Expense');
const GroupMember = require('../models/GroupMember');
const Activity = require('../models/Activity');
const settlementService = require('../services/settlementService');

exports.addExpense = async (req, res) => {
    try {
        const { description, amount, groupId, category, splitType, splits: providedSplits } = req.body;
        const userId = req.user.id; // Payer

        if (!description || !amount || !groupId) {
            return res.status(400).json({ error: "Missing fields" });
        }

        // Validate amount is positive
        const expenseAmount = Number(amount);
        if (expenseAmount <= 0) {
            return res.status(400).json({ error: "Amount must be greater than zero" });
        }

        // Get all members
        const members = await GroupMember.find({ groupId });
        if (!members.length) {
            console.log("AddExpense: No members found for group", groupId);
            return res.status(400).json({ error: "Group has no members" });
        }

        let splits;
        const expenseSplitType = splitType || 'EQUAL';

        if (expenseSplitType === 'EXACT') {
            // Validate exact splits
            if (!providedSplits || !Array.isArray(providedSplits) || providedSplits.length === 0) {
                return res.status(400).json({ error: "Splits required for EXACT type" });
            }

            // Validate all split amounts are positive
            const hasNegative = providedSplits.some(s => Number(s.amount) <= 0);
            if (hasNegative) {
                return res.status(400).json({ error: "All split amounts must be greater than zero" });
            }

            // Validate sum equals total (with small tolerance for floating point)
            const sum = providedSplits.reduce((acc, s) => acc + Number(s.amount), 0);
            const totalAmount = Number(amount);

            if (Math.abs(sum - totalAmount) > 0.01) {
                return res.status(400).json({
                    error: `Split amounts (₹${sum.toFixed(2)}) must equal total (₹${totalAmount.toFixed(2)})`
                });
            }

            // Use provided splits
            splits = providedSplits.map(s => ({
                userId: s.userId,
                amount: Number(s.amount)
            }));

        } else if (expenseSplitType === 'PERCENT') {
            // Validate percent splits
            if (!providedSplits || !Array.isArray(providedSplits) || providedSplits.length === 0) {
                return res.status(400).json({ error: "Splits required for PERCENT type" });
            }

            // Validate sum equals 100%
            const sum = providedSplits.reduce((acc, s) => acc + Number(s.percentage), 0);
            if (Math.abs(sum - 100) > 0.01) {
                return res.status(400).json({
                    error: `Percentages must sum to 100% (Current: ${sum}%)`
                });
            }

            splits = [];
            let totalCalculated = 0;
            const totalAmount = Number(amount);

            // Calculate amounts
            for (let i = 0; i < providedSplits.length; i++) {
                const s = providedSplits[i];
                // Calculate share: (percent / 100) * total
                let share = Number(((Number(s.percentage) / 100) * totalAmount).toFixed(2));

                splits.push({
                    userId: s.userId,
                    amount: share
                });
                totalCalculated += share;
            }

            // Fix rounding difference
            let diff = Number((totalAmount - totalCalculated).toFixed(2));
            if (diff !== 0) {
                // Add difference to first user (simplest approach for small pennies)
                splits[0].amount = Number((splits[0].amount + diff).toFixed(2));
            }

        } else {
            // EQUAL split - divide equally among all members
            const splitAmount = Number((Number(amount) / members.length).toFixed(2));
            splits = members.map(m => ({
                userId: m.userId,
                amount: splitAmount
            }));

            // Fix rounding difference (e.g., 100 / 3 = 33.33 * 3 = 99.99 -> diff 0.01)
            const totalCalculated = splits.reduce((sum, s) => sum + s.amount, 0);
            let diff = Number((Number(amount) - totalCalculated).toFixed(2));

            if (diff !== 0) {
                // Add difference to the first member
                splits[0].amount = Number((splits[0].amount + diff).toFixed(2));
            }
        }

        // Create Expense
        const expense = await Expense.create({
            description,
            amount: Number(amount),
            paidBy: userId,
            groupId,
            category: category || 'Other',
            splitType: expenseSplitType,
            splits,
            date: new Date(),
            isRecurring: req.body.isRecurring || false
        });

        // Log Activity
        await Activity.create({
            groupId,
            userId: req.user.id,
            type: 'EXPENSE_ADDED',
            description: `${req.user.name} added '${description}' (₹${amount})`
        });

        res.json(expense);
    } catch (err) {
        console.error("Add expense error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// Helper: Process recurring expenses for a group
async function processRecurringExpenses(groupId) {
    try {
        // Find recurring expenses that need to be generated
        // Simple logic: If today > lastGenerated + 1 month
        // We iterate and check manually to be safe with dates

        const recurring = await Expense.find({ groupId, isRecurring: true });

        const now = new Date();

        for (const exp of recurring) {
            let nextDue = new Date(exp.lastGenerated);
            nextDue.setMonth(nextDue.getMonth() + 1);

            // While next due date is in the past (or today)
            // Loop allows catching up multiple months if needed
            while (nextDue <= now) {
                console.log(`Generating recurring expense for: ${exp.description}`);

                // Clone the expense
                await Expense.create({
                    description: `${exp.description} (Recurring)`,
                    amount: exp.amount,
                    paidBy: exp.paidBy,
                    groupId: exp.groupId,
                    category: exp.category,
                    splitType: exp.splitType,
                    splits: exp.splits,
                    date: nextDue, // Date is the due date
                    isRecurring: false // The copy is NOT recurring itself
                });

                // Update the original's lastGenerated
                exp.lastGenerated = nextDue;
                await exp.save();

                // Move nextDue forward
                nextDue.setMonth(nextDue.getMonth() + 1);
            }
        }

    } catch (e) {
        console.error("Error processing recurring expenses:", e);
        // Don't block the main request if this fails
    }
}

exports.getGroupExpenses = async (req, res) => {
    try {
        const { groupId } = req.params;

        // Process recurring checks before fetching
        await processRecurringExpenses(groupId);

        const { search, category, startDate, endDate } = req.query;

        // Build Query
        const query = { groupId };

        // Search Filter (Description)
        if (search) {
            query.description = { $regex: search, $options: 'i' };
        }

        // Category Filter
        if (category && category !== 'All') {
            query.category = category;
        }

        // Date Filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            // End date needs to be end of that day effectively, or just simple check
            // Usually valid to set $lte to end of day, but for simple date pickers:
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.date.$lte = end;
            }
        }

        // Sort by date desc
        const expenses = await Expense.find(query)
            .sort({ date: -1 })
            .populate('paidBy', 'name username')
            .populate('splits.userId', 'name username');

        res.json(expenses);
    } catch (err) {
        console.error("Get expenses error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getGroupBalances = async (req, res) => {
    try {
        const { groupId } = req.params;

        const expenses = await Expense.find({ groupId });
        const members = await GroupMember.find({ groupId }).populate('userId', 'name username');

        const { balances, plan } = settlementService.calculateBalances(expenses, members);

        const userMap = {};
        members.forEach(m => {
            if (m.userId) userMap[m.userId._id.toString()] = m.userId;
        });

        const readablePlan = plan.map(p => ({
            from: userMap[p.from]?.name || 'Unknown',
            to: userMap[p.to]?.name || 'Unknown',
            amount: p.amount
        }));

        res.json({ balances, plan: readablePlan });
    } catch (err) {
        console.error("Balance calc error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const { expenseId } = req.params;
        const userId = req.user.id;

        const expense = await Expense.findById(expenseId);
        if (!expense) return res.status(404).json({ error: "Expense not found" });

        // Authorization: Only payer or group creator can delete? For now, only payer.
        // Assuming paidBy is ObjectId
        if (expense.paidBy.toString() !== userId) {
            return res.status(403).json({ error: "Only the payer can delete this expense" });
        }

        await Expense.findByIdAndDelete(expenseId);

        // Log Activity
        await Activity.create({
            groupId: expense.groupId,
            userId: req.user.id,
            type: 'EXPENSE_DELETED',
            description: `${req.user.name} deleted '${expense.description}'`
        });

        res.json({ message: "Expense deleted" });

    } catch (err) {
        console.error("Delete expense error", err);
        res.status(500).json({ error: "Server error" });
    }
};
