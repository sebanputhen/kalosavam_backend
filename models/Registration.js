// registrationModel.js
const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    standard: {
      type: String,
      required: [true, 'Class/Standard is required'],
      enum: ['IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['M', 'F']
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event is required']
    },
    parish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parish',
      required: [true, 'Parish is required']
    },
    section: {
      type: String,
      enum: ['Dominic Savio', 'Alphonsa', 'Saint Thomas']
    },
    isCrossSectionParticipation: {
      type: Boolean,
      default: false
    },
    groupRegistrationNumber: {
      type: String,
      default: null
    },
    groupEventUniqueKey: {
      type: String, // Combination of event ID and parish ID
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Create a compound index to prevent duplicate registrations
registrationSchema.index(
  { 
    name: 1, 
    event: 1, 
    parish: 1, 
    dob: 1, 
    gender: 1, 
    standard: 1,
    groupEventUniqueKey: 1 // Add this to ensure unique group event registrations
  },
  { unique: true }
);

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;