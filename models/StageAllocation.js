const mongoose = require('mongoose');

// Stage Allocation Schema
const stageAllocationSchema = new mongoose.Schema({
  forane: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Forane', 
    required: true 
  },
  venues: [{
    venueId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Venue', 
      required: true 
    },
    eventIds: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Event',
      required: true
    }],
    order: {
      type: Number,
      default: 0
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdBy: {
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to get total events
stageAllocationSchema.virtual('totalEvents').get(function() {
  return this.venues.reduce((total, venue) => total + venue.eventIds.length, 0);
});

// Indexes for performance
stageAllocationSchema.index({ forane: 1 });
stageAllocationSchema.index({ createdAt: -1 });

// Pre-save middleware to update timestamp
stageAllocationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to validate venue and event references
stageAllocationSchema.methods.validateReferences = async function() {
  const mongoose = require('mongoose');
  
  // Check forane exists
  const foraneExists = await mongoose.model('Forane').findById(this.forane);
  if (!foraneExists) {
    throw new Error('Invalid Forane reference');
  }

  // Check venue references
  const venueIds = this.venues.map(v => v.venueId);
  const venues = await mongoose.model('Venue').find({ _id: { $in: venueIds } });
  if (venues.length !== venueIds.length) {
    throw new Error('Some venues do not exist');
  }

  // Check event references
  const eventIds = this.venues.flatMap(v => v.eventIds);
  const events = await mongoose.model('Event').find({ _id: { $in: eventIds } });
  if (events.length !== eventIds.length) {
    throw new Error('Some events do not exist');
  }

  return true;
};

// Create the model
const StageAllocation = mongoose.model('StageAllocation', stageAllocationSchema);

module.exports = StageAllocation;