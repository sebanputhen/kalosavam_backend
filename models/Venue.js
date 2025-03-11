const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Venue name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Venue capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  parish: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parish',
    required: [true, 'Parish is required']
  },
  contactPerson: {
    type: String,
    trim: true
  },
  contactNumber: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Venue = mongoose.model('Venue', venueSchema);

module.exports = Venue;