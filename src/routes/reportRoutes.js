const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController')

router.get('/profit', reportController.getProfitReport);

module.exports = router;