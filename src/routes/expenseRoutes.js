const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const {validateExpense} = require("../middlewares/validator");

router.post('/', validateExpense, expenseController.create);
router.get('/', expenseController.getAll);


module.exports = router;