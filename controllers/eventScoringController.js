const EventScoring = require('../models/EventScoring');
const Event = require('../models/Event');
const { errorHandler } = require('../utils/errorHandler');

/**
 * Save or update event scoring
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with saved scoring data
 */
exports.saveEventScoring = async (req, res) => {
  try {
    const { foraneId, parishId, eventId, section, maxMarks, participants } = req.body;

    if (!foraneId || !eventId || !section || !participants || !Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields or invalid data format'
      });
    }

    // Check if scoring exists for this event and forane
    let eventScoring = await EventScoring.findOne({ foraneId, eventId });

    if (eventScoring) {
      // Update existing scoring
      eventScoring.section = section;
      eventScoring.maxMarks = maxMarks;
      eventScoring.participants = participants;
      eventScoring.parishId = parishId || eventScoring.parishId;
      eventScoring.updatedAt = Date.now();
      
      if (req.user) {
        eventScoring.scoredBy = req.user._id;
      }

      await eventScoring.save();

      return res.status(200).json({
        success: true,
        message: 'Event scoring updated successfully',
        data: { eventScoring }
      });
    } else {
      // Create new scoring
      eventScoring = new EventScoring({
        foraneId,
        parishId,
        eventId,
        section,
        maxMarks,
        participants,
        scoredBy: req.user ? req.user._id : null
      });

      await eventScoring.save();

      return res.status(201).json({
        success: true,
        message: 'Event scoring saved successfully',
        data: { eventScoring }
      });
    }
  } catch (error) {
    return errorHandler(error, res);
  }
};

/**
 * Get event scoring by forane and event
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with scoring data
 */
exports.getEventScoring = async (req, res) => {
  try {
    const { foraneId, eventId } = req.params;

    if (!foraneId || !eventId) {
      return res.status(400).json({
        success: false,
        message: 'Forane ID and Event ID are required'
      });
    }

    const eventScoring = await EventScoring.findOne({ foraneId, eventId })
      .populate('foraneId', 'name')
      .populate('parishId', 'name')
      .populate('eventId', 'eventName section stage gender');

    if (!eventScoring) {
      return res.status(404).json({
        success: false,
        message: 'No scoring found for this event and forane'
      });
    }

    return res.status(200).json({
      success: true,
      data: { eventScoring }
    });
  } catch (error) {
    return errorHandler(error, res);
  }
};

/**
 * Get all event scorings
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with all scoring data
 */
exports.getAllEventScorings = async (req, res) => {
  try {
    const eventScorings = await EventScoring.find()
      .populate('foraneId', 'name')
      .populate('parishId', 'name')
      .populate('eventId', 'eventName section stage gender')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: eventScorings.length,
      data: { eventScorings }
    });
  } catch (error) {
    return errorHandler(error, res);
  }
};
// exports.getDashboardData = async (req, res) => {
//   try {
//     const { foraneId } = req.params;

//     if (!foraneId) {
//       return res.status(400).json({ success: false, message: 'Forane ID is required' });
//     }

//     const Parish = require('../models/Parish');

//     const [eventScorings, events, parishes] = await Promise.all([
//       EventScoring.find({ foraneId })
//         .populate('eventId', 'eventName section stage gender eventType'),
//       Event.find().populate('category', 'name stage'),
//       Parish.find({ $or: [{ forane: foraneId }, { 'forane._id': foraneId }] })
//         .select('name phone forane')
//     ]);

//     return res.status(200).json({
//       success: true,
//       data: { eventScorings, events, parishes }
//     });
//   } catch (error) {
//     return errorHandler(error, res);
//   }
// };
// exports.getDashboardData = async (req, res) => {
//   try {
//     const { foraneId } = req.params;
//     if (!foraneId) {
//       return res.status(400).json({ success: false, message: 'Forane ID is required' });
//     }

//     const Parish = require('../models/Parish');

//     const [eventScorings, events, parishes] = await Promise.all([
//       EventScoring.find({ foraneId })
//         .populate('eventId', 'eventName section stage gender eventType category'),
//       Event.find().populate('category', 'name stage'),
//       Parish.find({ $or: [{ forane: foraneId }, { 'forane._id': foraneId }] })
//         .select('name phone forane')
//     ]);

//     return res.status(200).json({
//       success: true,
//       data: { eventScorings, events, parishes }
//     });
//   } catch (error) {
//     return errorHandler(error, res);
//   }
// };

exports.getDashboardData = async (req, res) => {
  try {
    const { foraneId } = req.params;
    if (!foraneId) {
      return res.status(400).json({ success: false, message: 'Forane ID is required' });
    }

    const Parish = require('../models/Parish');
    const StageAllocation = require('../models/StageAllocation');

    const [eventScorings, events, parishes, stageAllocation] = await Promise.all([
      EventScoring.find({ foraneId })
        .populate('eventId', 'eventName section stage gender eventType category'),
      Event.find().populate('category', 'name stage'),
      Parish.find({ $or: [{ forane: foraneId }, { 'forane._id': foraneId }] })
        .select('name phone forane'),
      StageAllocation.findOne({ forane: foraneId })
        .populate({ path: 'venues.venueId', select: 'name capacity parish' })
        .populate({ path: 'venues.eventIds', select: 'eventName section gender eventType category', populate: { path: 'category', select: 'name stage' } })
    ]);

    return res.status(200).json({
      success: true,
      data: { eventScorings, events, parishes, stageAllocation }
    });
  } catch (error) {
    return errorHandler(error, res);
  }
};
/**
 * Get all event scorings for a forane
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with forane's scoring data
 */
exports.getForaneEventScorings = async (req, res) => {
  try {
    const { foraneId } = req.params;

    if (!foraneId) {
      return res.status(400).json({
        success: false,
        message: 'Forane ID is required'
      });
    }

    const eventScorings = await EventScoring.find({ foraneId })
      .populate('eventId', 'eventName section stage gender')
      .sort({ 'eventId.section': 1, 'eventId.eventName': 1 });

    return res.status(200).json({
      success: true,
      count: eventScorings.length,
      data: { eventScorings }
    });
  } catch (error) {
    return errorHandler(error, res);
  }
};

/**
 * Get parish-wise points summary for a forane
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with parish points summary
 */
exports.getParishPointsSummary = async (req, res) => {
  try {
    const { foraneId } = req.params;

    if (!foraneId) {
      return res.status(400).json({
        success: false,
        message: 'Forane ID is required'
      });
    }

    const parishPoints = await EventScoring.getParishPoints(foraneId);

    return res.status(200).json({
      success: true,
      count: parishPoints.length,
      data: { parishPoints }
    });
  } catch (error) {
    return errorHandler(error, res);
  }
};

/**
 * Delete event scoring
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with deletion status
 */
exports.deleteEventScoring = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Event Scoring ID is required'
      });
    }

    const eventScoring = await EventScoring.findByIdAndDelete(id);

    if (!eventScoring) {
      return res.status(404).json({
        success: false,
        message: 'Event scoring not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Event scoring deleted successfully'
    });
  } catch (error) {
    return errorHandler(error, res);
  }
};