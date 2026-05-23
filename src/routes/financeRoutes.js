const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeControler');
 
// Resumo do mês atual (faturamento, gastos, lucro estimado, comparativo)
router.get('/summary', financeController.getMonthlySummary);
 
// Resumo do mês anterior (bruto, líquido, despesas)
router.get('/previous-month', financeController.getPreviousMonthSummary);
 
// Últimas movimentações (despesas + vendas)
router.get('/movements', financeController.getMovements);
 
module.exports = router;