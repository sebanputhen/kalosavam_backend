const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Existing routes
router.post('/', eventController.createEvent);
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEvent);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.get('/stage/:stage', eventController.getEventsByStage);
router.get('/section/:section', eventController.getEventsBySection);
// New cross-section routes
router.get('/cross-section/:section', eventController.getCrossSectionEvents);
router.get('/cross-section-eligibility/:eventId/:section', eventController.checkCrossSectionEligibility);

module.exports = router;