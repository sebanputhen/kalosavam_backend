// controllers/managerController.js
const Manager = require('../models/Manager');

// Get all managers with populated parish data
exports.getAllManagers = async (req, res) => {
  try {
    const managers = await Manager.find()
      .populate('parish', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json(managers);
  } catch (err) {
    console.error('Error fetching managers:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get managers by parish ID
exports.getManagersByParish = async (req, res) => {
  try {
    const managers = await Manager.find({ parish: req.params.parishId })
      .populate('parish', 'name')
      .sort({ section: 1 }); // Sort by section for better organization
    
    res.status(200).json(managers);
  } catch (err) {
    console.error('Error fetching managers by parish:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get managers by parish and section
exports.getManagersByParishAndSection = async (req, res) => {
  try {
    const managers = await Manager.find({ 
      parish: req.params.parishId,
      section: req.params.section
    })
      .populate('parish', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json(managers);
  } catch (err) {
    console.error('Error fetching managers by parish and section:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create new manager
exports.createManager = async (req, res) => {
  const { parish, section, managers } = req.body;
  
  // Validate request
  if (!parish || !section || !managers || managers.length === 0) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }
  
  try {
    // Check if entry for this parish and section already exists
    const existingEntry = await Manager.findOne({ parish, section });
    
    if (existingEntry) {
      // Update existing entry
      existingEntry.managers = managers;
      existingEntry.updatedAt = Date.now(); // Add update timestamp
      await existingEntry.save();
      
      const populatedEntry = await Manager.findById(existingEntry._id)
        .populate('parish', 'name');
      
      return res.status(200).json({
        manager: populatedEntry,
        message: 'Manager record updated successfully'
      });
    } 
    
    // Create new entry
    const newEntry = new Manager({
      parish,
      section,
      managers
    });
    
    const savedEntry = await newEntry.save();
    
    // Populate the parish field in the response
    const populatedEntry = await Manager.findById(savedEntry._id)
      .populate('parish', 'name');
    
    res.status(201).json({
      manager: populatedEntry,
      message: 'Manager record created successfully'
    });
  } catch (err) {
    console.error('Error creating/updating manager:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update manager
exports.updateManager = async (req, res) => {
  try {
    const { parish, section, managers } = req.body;
    
    // Validate request
    if (!parish || !section || !managers || managers.length === 0) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    const updatedEntry = await Manager.findByIdAndUpdate(
      req.params.id,
      { 
        $set: {
          parish,
          section,
          managers,
          updatedAt: Date.now() // Add update timestamp
        } 
      },
      { new: true }
    ).populate('parish', 'name');
    
    if (!updatedEntry) {
      return res.status(404).json({ message: 'Manager entry not found' });
    }
    
    res.status(200).json({
      manager: updatedEntry,
      message: 'Manager record updated successfully'
    });
  } catch (err) {
    console.error('Error updating manager:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete manager
exports.deleteManager = async (req, res) => {
  try {
    const deletedEntry = await Manager.findByIdAndDelete(req.params.id);
    
    if (!deletedEntry) {
      return res.status(404).json({ message: 'Manager entry not found' });
    }
    
    res.status(200).json({ 
      message: 'Manager entry deleted successfully',
      deletedId: req.params.id
    });
  } catch (err) {
    console.error('Error deleting manager:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all sections for a specific parish
exports.getSectionsByParish = async (req, res) => {
  try {
    const managers = await Manager.find({ parish: req.params.parishId });
    
    // Extract unique sections
    const sections = [...new Set(managers.map(manager => manager.section))];
    
    res.status(200).json(sections);
  } catch (err) {
    console.error('Error fetching sections by parish:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};