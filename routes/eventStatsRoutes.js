// routes/eventStatsRoutes.js
const express = require('express');
const router = express.Router();
const eventStatsController = require('../controllers/eventStatsController');

router.get('/event-stats/parish/:parishId', eventStatsController.getEventStats);
router.get('/section-stats/parish/:parishId', eventStatsController.getSectionStats);
router.get('/event-stats/parish/:parishId/cross-section', eventStatsController.getCrossSectionEventStats);

module.exports = router;