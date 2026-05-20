const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { validateCustomer } = require('../middlewares/validator');

router.post('/', validateCustomer, customerController.create);
router.get('/',customerController.getAll);
router.get('/summary', customerController.getSummary);
router.get('/defaulters',  customerController.getDefaulters);
router.get('/active-orders', customerController.getActiveOrders);
router.get('/search', customerController.search);

module.exports = router;