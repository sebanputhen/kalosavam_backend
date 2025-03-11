const mongoose = require('mongoose');

const eventScoringSchema = new mongoose.Schema({
  foraneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Forane',
    required: true
  },
  parishId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parish',
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  section: {
    type: String,
    required: true
  },
  maxMarks: {
    type: Number,
    required: true,
    default: 100
  },
  participants: [{
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    participantName: {
      type: String,
      required: true
    },
    participantType: {
      type: String,
      enum: ['Individual', 'Group'],
      required: true
    },
    registrationNumber: {
      type: String
    },
    parish: {
      type: String
    },
    parishId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parish'
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 0
    },
    grade: {
      type: String,
      enum: ['A', 'B', 'C', '']
    },
    position: {
      type: String,
      enum: ['1', '2', '3', '']
    },
    gradePoints: {
      type: Number,
      default: 0
    },
    positionPoints: {
      type: Number,
      default: 0
    },
    totalPoints: {
      type: Number,
      default: 0
    }
  }],
  scoredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster lookups
eventScoringSchema.index({ foraneId: 1, eventId: 1 });
eventScoringSchema.index({ parishId: 1, eventId: 1 });
eventScoringSchema.index({ 'participants.parishId': 1 }); // Add index for participant parish IDs

// Pre-save hook to update timestamps
eventScoringSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get total points by parish
eventScoringSchema.statics.getParishPoints = async function(foraneId) {
  const results = await this.aggregate([
    { 
      $match: { foraneId: mongoose.Types.ObjectId(foraneId) } 
    },
    { 
      $unwind: '$participants' 
    },
    {
      $group: {
        _id: '$participants.parishId', // Use parishId instead of parish name for more accurate grouping
        parishName: { $first: '$participants.parish' },
        totalPoints: { $sum: '$participants.totalPoints' }
      }
    },
    {
      $sort: { totalPoints: -1 }
    }
  ]);
  
  return results;
};

// Create and export the model
const EventScoring = mongoose.model('EventScoring', eventScoringSchema);
module.exports = EventScoring;