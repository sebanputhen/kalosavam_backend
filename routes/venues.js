const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');

// Get venues by parish
router.get('/parish/:parishId', venueController.getVenuesByParish);

// Create a new venue
router.post('/', venueController.createVenue);

// Update a venue
router.put('/:id', venueController.updateVenue);

// Delete a venue
router.delete('/:id', venueController.deleteVenue);

module.exports = router;