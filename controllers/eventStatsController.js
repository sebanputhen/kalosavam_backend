// controllers/eventStatsController.js
const Registration = require('../models/Registration');
const mongoose = require('mongoose');

// Get event participation stats
exports.getEventStats = async (req, res) => {
  try {
    // Get parish from URL param instead of query param
    const { parishId } = req.params;
    
    // Build query based on parish ID from URL params
    const query = {};
    if (parishId) query.parish = new mongoose.Types.ObjectId(parishId);
    
    const stats = await Registration.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: '$event',
          participantCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'eventDetails'
        }
      },
      {
        $unwind: '$eventDetails'
      },
      {
        $project: {
          _id: 0,
          eventId: '$_id',
          eventName: '$eventDetails.eventName',
          eventType: '$eventDetails.eventType',
          section: '$eventDetails.section',
          gender: '$eventDetails.gender',
          participantCount: 1
        }
      },
      {
        $sort: { section: 1, eventName: 1 }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      results: stats.length,
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get section participation stats
exports.getSectionStats = async (req, res) => {
  try {
    // Get parish from URL param instead of query param
    const { parishId } = req.params;
    
    // Build query based on parish ID from URL params
    const query = {};
    if (parishId) query.parish = new mongoose.Types.ObjectId(parishId);
    
    const stats = await Registration.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'eventDetails'
        }
      },
      {
        $unwind: '$eventDetails'
      },
      {
        $group: {
          _id: '$eventDetails.section',
          participantCount: { $sum: 1 },
          uniqueParticipants: { $addToSet: { name: '$name', standard: '$standard' } }
        }
      },
      {
        $project: {
          _id: 0,
          section: '$_id',
          participantCount: 1,
          uniqueParticipantCount: { $size: '$uniqueParticipants' }
        }
      },
      {
        $sort: { section: 1 }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      results: stats.length,
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get cross-section event participation stats
exports.getCrossSectionEventStats = async (req, res) => {
  try {
    const { parishId } = req.params;
    
    // Create query with parish ID and cross-section flag
    const query = {
      parish: new mongoose.Types.ObjectId(parishId),
      isCrossSectionParticipation: true // Filter only cross-section participations
    };
    
    const stats = await Registration.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: '$event',
          participantCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'eventDetails'
        }
      },
      {
        $unwind: '$eventDetails'
      },
      {
        $project: {
          _id: 0,
          eventId: '$_id',
          eventName: '$eventDetails.eventName',
          eventType: '$eventDetails.eventType',
          section: '$eventDetails.section',
          gender: '$eventDetails.gender',
          participantCount: 1
        }
      },
      {
        $sort: { section: 1, eventName: 1 }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      results: stats.length,
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
}; 