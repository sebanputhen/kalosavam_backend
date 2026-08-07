const express = require('express');
const router = express.Router();
// const { protect, authorize } = require('../middleware/auth');
const {
  saveEventScoring,
  getEventScoring,
  getAllEventScorings,
  getDashboardData,
  getForaneEventScorings,
  getParishPointsSummary,
  deleteEventScoring
} = require('../controllers/eventScoringController');

// Route to save/update event scoring
router.post('/',  saveEventScoring);

// Route to get scoring for a specific event in a forane
router.get('/forane/:foraneId/event/:eventId',  getEventScoring);

// Route to get all scorings
router.get('/',  getAllEventScorings);

// Route to get all scorings for a forane
router.get('/forane/:foraneId',  getForaneEventScorings);

// Route to get parish scorings by parishId
router.get('/parish/:parishId',  (req, res) => {
  try {
    const { parishId } = req.params;
    
    if (!parishId) {
      return res.status(400).json({
        success: false,
        message: 'Parish ID is required'
      });
    }
    
    EventScoring.find({ parishId })
      .populate('eventId', 'eventName section stage gender')
      .populate('foraneId', 'name')
      .sort({ 'eventId.section': 1, 'eventId.eventName': 1 })
      .then(eventScorings => {
        return res.status(200).json({
          success: true,
          count: eventScorings.length,
          data: { eventScorings }
        });
      })
      .catch(error => errorHandler(error, res));
  } catch (error) {
    return errorHandler(error, res);
  }
});

// Route to get parish-wise points summary for a forane
router.get('/points/forane/:foraneId',  getParishPointsSummary);
router.get('/event-scoring/forane/:foraneId/dashboard', getDashboardData);
// Route to delete a scoring
router.delete('/:id',  deleteEventScoring);

module.exports = router;