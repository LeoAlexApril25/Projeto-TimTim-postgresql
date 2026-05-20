const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');


router.get('/stats', saleController.getStats);

// Rota para criar uma venda (POST)
router.post('/',saleController.create);

// 2. GET para LISTAR (Buscar dados) - Mudei de .post para .get
router.get('/', saleController.getAll);

module.exports = router;