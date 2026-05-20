const express = require('express');
const router = express.Router();
const { setGoal, getGoals, getProgress } = require('../controllers/goalContoller');

router.get('/', getGoals);
router.post('/', setGoal);
router.get('/progress', getProgress);

module.exports = router;