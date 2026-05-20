const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');


// Rota para adicionar um item na receita (POST)
router.post('/', recipeController.addItem);



module.exports = router;