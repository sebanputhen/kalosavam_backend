const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['male', 'female', 'common'],
      message: 'Gender must be male, female, or common'
    }
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Maximum number of participants is required'],
    min: [1, 'Maximum participants must be at least 1']
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: {
      values: ['single', 'group'],
      message: 'Event type must be either single or group'
    }
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    enum: {
      values: ['Dominic Savio', 'Alphonsa', 'Saint Thomas'],
      message: 'Please select a valid section'
    }
  },
  // New fields for cross-section participation
  allowCrossSectionParticipation: {
    type: Boolean,
    default: false
  },
  crossSectionMaxParticipants: {
    type: Number,
    default: 0,
    validate: {
      validator: function(v) {
        // Only validate if cross-section participation is allowed
        return !this.allowCrossSectionParticipation || v > 0;
      },
      message: 'Cross-section max participants must be greater than 0 when allowed'
    }
  },
  crossSectionAllowedSections: {
    type: [String],
    validate: {
      validator: function(v) {
        // Validate if cross-section participation is allowed
        if (this.allowCrossSectionParticipation && (!v || v.length === 0)) {
          return false;
        }
        
        // Ensure no duplicate sections
        const uniqueSections = new Set(v);
        return uniqueSections.size === v.length;
      },
      message: 'Invalid cross-section allowed sections'
    },
    default: []
  },
  rules: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Validation to prevent main section from being in allowed sections
eventSchema.pre('validate', function(next) {
  if (this.allowCrossSectionParticipation) {
    if (this.crossSectionAllowedSections.includes(this.section)) {
      this.invalidate('crossSectionAllowedSections', 'Main section cannot be in allowed sections');
      return next(new Error('Main section cannot be in allowed sections'));
    }
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;