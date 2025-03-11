const Section = require("../models/Section");

/**
 * Get all sections or filter by section group
 * @route GET /api/sections
 */
async function getAllSections(req, res) {
  try {
    let query = {};
    
    // Filter by class range if sectionGroup is specified
    if (req.query.sectionGroup) {
      const sectionGroup = parseInt(req.query.sectionGroup);
      
      if (sectionGroup === 1) {
        query.class = { $gte: 4, $lte: 6 };
      } else if (sectionGroup === 2) {
        query.class = { $gte: 7, $lte: 9 };
      } else if (sectionGroup === 3) {
        query.class = { $gte: 10, $lte: 12 };
      }
    }
    
    // Filter by status if specified
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    const sections = await Section.find(query).sort({ class: 1, name: 1 }).exec();
    
    res.status(200).json(sections);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "An error occurred while fetching sections."
    });
  }
}

/**
 * Get a single section by ID
 * @route GET /api/sections/:id
 */
async function getSectionById(req, res) {
  try {
    const section = await Section.findById(req.params.id).exec();
    
    if (section) {
      res.status(200).json(section);
    } else {
      res.status(404).json({
        message: `Section not found with id ${req.params.id}.`
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "An error occurred while fetching the section."
    });
  }
}

/**
 * Create a new section
 * @route POST /api/sections
 */
async function createSection(req, res) {
  try {
    // Check if section with same name and class already exists
    const existingSection = await Section.findOne({
      name: req.body.name,
      class: req.body.class
    }).exec();
    
    if (existingSection) {
      return res.status(409).json({
        message: `A section with name ${req.body.name} for class ${req.body.class} already exists.`
      });
    }
    
    // Create new section
    const newSection = new Section(req.body);
    const savedSection = await newSection.save();
    
    res.status(201).json({
      message: "Section created successfully.",
      section: savedSection
    });
  } catch (err) {
    console.error(err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: Object.values(err.errors).map(val => val.message).join(', ')
      });
    }
    
    res.status(500).json({
      message: "An error occurred while creating the section."
    });
  }
}

/**
 * Update a section
 * @route PUT /api/sections/:id
 */
async function updateSection(req, res) {
  try {
    // Check if updating to a name that already exists in the same class
    if (req.body.name && req.body.class) {
      const existingSection = await Section.findOne({
        _id: { $ne: req.params.id },
        name: req.body.name,
        class: req.body.class
      }).exec();
      
      if (existingSection) {
        return res.status(409).json({
          message: `Another section with name ${req.body.name} for class ${req.body.class} already exists.`
        });
      }
    }
    
    const updatedSection = await Section.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).exec();
    
    if (updatedSection) {
      res.status(200).json({
        message: "Section updated successfully.",
        section: updatedSection
      });
    } else {
      res.status(404).json({
        message: `Section not found with id ${req.params.id}.`
      });
    }
  } catch (err) {
    console.error(err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: Object.values(err.errors).map(val => val.message).join(', ')
      });
    }
    
    res.status(500).json({
      message: "An error occurred while updating the section."
    });
  }
}

/**
 * Delete a section
 * @route DELETE /api/sections/:id
 */
async function deleteSection(req, res) {
  try {
    const section = await Section.findByIdAndDelete(req.params.id).exec();
    
    if (section) {
      res.status(200).json({
        message: "Section deleted successfully."
      });
    } else {
      res.status(404).json({
        message: `Section not found with id ${req.params.id}.`
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "An error occurred while deleting the section."
    });
  }
}

/**
 * Get sections count by group
 * @route GET /api/sections/stats
 */
async function getSectionStats(req, res) {
  try {
    const stats = {
      total: await Section.countDocuments(),
      section1: await Section.countDocuments({ class: { $gte: 4, $lte: 6 } }),
      section2: await Section.countDocuments({ class: { $gte: 7, $lte: 9 } }),
      section3: await Section.countDocuments({ class: { $gte: 10, $lte: 12 } }),
      active: await Section.countDocuments({ status: 'active' }),
      inactive: await Section.countDocuments({ status: 'inactive' })
    };
    
    res.status(200).json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "An error occurred while fetching section statistics."
    });
  }
}

module.exports = {
  getAllSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  getSectionStats
};