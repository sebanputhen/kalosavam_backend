// models/Manager.js
const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
  parish: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parish',
    required: true
  },
  section: {
    type: String,
    required: true
  },
  managers: [
    {
      name: {
        type: String,
        required: true
      },
      contactNumber: {
        type: String,
        required: true
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Manager', managerSchema);