const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { addExpense, getGroupExpenses, getGroupBalances, deleteExpense } = require('../controllers/expenseController');

router.post('/add', auth, addExpense);
router.get('/group/:groupId', auth, getGroupExpenses);
router.get('/group/:groupId/balances', auth, getGroupBalances);
router.delete('/:expenseId', auth, deleteExpense);

module.exports = router;
