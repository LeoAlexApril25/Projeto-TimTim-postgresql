const express = require('express');
const router = express.Router();
const ingredientController = require ('../controllers/ingredientController');

// Rota pra LISTAR (GET)
router.get('/', ingredientController.getAll);

// Define que quando o app fizer um POST para '/', ele chama a função 'create'
router.post('/', ingredientController.create);

module.exports = router;