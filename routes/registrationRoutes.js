// routes/registrationRoutes.js
const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

// Regular routes
router.get('/', registrationController.getAllRegistrations);
router.get('/:id', registrationController.getRegistration);
router.post('/batch', registrationController.batchCreateRegistrations);
router.post('/', registrationController.createRegistration);
router.put('/:id', registrationController.updateRegistration);
router.patch('/:id', registrationController.updateRegistration);
router.delete('/:id', registrationController.deleteRegistration);

// Get all registrations for a specific parish
router.get('/parish/:parishId', registrationController.getRegistrationsByParish);
// In your routes file
router.get('/parish/:parishId/sections/:section', registrationController.getParishSectionDetails);
router.get('/forane/:foraneId/event/:eventId', registrationController.getRegistrationsByForaneAndEvent);
// Registration count routes
router.get('/counts/event/:eventId', registrationController.getRegistrationsCountByParish);

// New parish-specific event and section counts
router.get('/counts/parish/:parishId/events', registrationController.getEventRegistrationCountsByParish);
router.get('/counts/parish/:parishId/sections', registrationController.getSectionRegistrationCountsByParish);

module.exports = router;