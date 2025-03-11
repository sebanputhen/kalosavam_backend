const Venue = require('../models/Venue');

// Get venues by parish
exports.getVenuesByParish = async (req, res) => {
  try {
    const { parishId } = req.params;
    
    const venues = await Venue.find({ parish: parishId });
    
    res.status(200).json({
      status: 'success',
      results: venues.length,
      data: venues
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Create a new venue
exports.createVenue = async (req, res) => {
  try {
    const newVenue = await Venue.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: newVenue
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update a venue
exports.updateVenue = async (req, res) => {
  try {
    const updatedVenue = await Venue.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!updatedVenue) {
      return res.status(404).json({
        status: 'fail',
        message: 'No venue found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: updatedVenue
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete a venue
exports.deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    
    if (!venue) {
      return res.status(404).json({
        status: 'fail',
        message: 'No venue found with that ID'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};