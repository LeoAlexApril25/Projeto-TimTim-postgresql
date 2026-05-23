const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Rota para Cadastrarum produto (POST)
router.post('/', productController.create);
router.get('/', productController.getAll);
router.get('/:id/cost', productController.getProductCost);

module.exports = router;