const mongoose = require("mongoose");

const foraneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    shortCode: {
      type: String,
      required: true,
      trim: true
    },
    building: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    street: {
      type: String,
    },
    city: {
      type: String,
      required: false,
    },
    district: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
    pincode: {
      type: String,
      required: false,
    },
    registrationNumbers: {
      type: Map,
      of: Number,
      default: {
        'Dominic Savio': 301,
        'Alphonsa': 501,
        'Saint Thomas': 701
      }
    },
    groupRegistrationNumber: { 
      type: Number, 
      default: 1 
    }
  },
  {
    timestamps: true,
  }
);

const Forane = mongoose.model("Forane", foraneSchema);

module.exports = Forane;