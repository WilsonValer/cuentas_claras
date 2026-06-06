const { Router } = require('express');
const { getLunchEventSummary } = require('../controllers/summary.controller');

const router = Router();

router.get('/lunch-events/:id/summary', getLunchEventSummary);

module.exports = router;