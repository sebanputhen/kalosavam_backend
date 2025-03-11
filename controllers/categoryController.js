const Category = require('../models/Category');

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const newCategory = await Category.create({
      name: req.body.name,
      stage: req.body.stage,
      minutes: req.body.minutes
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        category: newCategory
      }
    });
  } catch (err) {
    // Handle duplicate key error (code 11000)
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'A category with this name already exists'
      });
    }
    
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id, 
      {
        name: req.body.name,
        stage: req.body.stage,
        minutes: req.body.minutes
      }, 
      {
        new: true, // Return the modified document
        runValidators: true // Run model validation
      }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({
        status: 'fail',
        message: 'No category found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        category: updatedCategory
      }
    });
  } catch (err) {
    // Handle duplicate key error (code 11000)
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'A category with this name already exists'
      });
    }
    
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get all categories with optional filtering
exports.getAllCategories = async (req, res) => {
  try {
    // Create a query object
    const queryObj = {};

    // Filter by stage if provided
    if (req.query.stage) {
      queryObj.stage = req.query.stage;
    }

    // Filter by name (case-insensitive search)
    if (req.query.search) {
      queryObj.name = { $regex: req.query.search, $options: 'i' };
    }

    // Execute query
    const categories = await Category.find(queryObj).sort({ name: 1 });
    
    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: {
        categories
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'No category found with that ID'
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