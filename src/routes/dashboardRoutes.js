const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Rota para obter os dados do dashboard
router.get('/summary', dashboardController.getSummary);

// Nova rota o feed de atividades recentes
router.get("/activities", dashboardController.getActivities);

module.exports = router;