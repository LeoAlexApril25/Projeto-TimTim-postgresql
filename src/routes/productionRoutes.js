const express = require('express');
const router = express.Router();
const productionController = require('../controllers/productionController');

router.get('/summary', productionController.getSummary);
router.get('/stats', productionController.getStats);
router.post('/', productionController.create);
router.get('/', productionController.getAll);
router.patch('/:id/stage', productionController.updateStage);

module.exports = router;