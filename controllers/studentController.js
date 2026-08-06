const Student = require('../models/Student');
const Forane = require('../models/Forane');
const Parish = require('../models/Parish');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Get current academic year
const getCurrentAcademicYear = () => {
  const currentDate = new Date();
  return currentDate.getMonth() >= 6 
    ? currentDate.getFullYear() 
    : currentDate.getFullYear() - 1;
};

// @desc    Get students by parish, class, and division
// @route   GET /api/students
// @access  Public
exports.getStudents = async (req, res) => {
    try {
      const { 
        parish, 
        class: studentClass, 
        division, 
        forane,
        includeInactive 
      } = req.query;
  
      // Validate input
      if (!parish) {
        return res.status(400).json({
          success: false,
          message: 'Parish is required'
        });
      }
  
      if (!studentClass) {
        return res.status(400).json({
          success: false,
          message: 'Class is required'
        });
      }
  
      if (!division) {
        return res.status(400).json({
          success: false,
          message: 'Division is required'
        });
      }
  
      // Build query object
      const queryObj = {
        parish: new mongoose.Types.ObjectId(parish),
        class: studentClass,
        division: division
      };
  
      // Add forane to query if provided
      if (forane) {
        queryObj.forane = new mongoose.Types.ObjectId(forane);
      }
  
      // Handle active/inactive filtering
      if (includeInactive === 'true') {
        // If includeInactive is true, find only inactive students
        queryObj.isActive = false;
      } else {
        // By default, find only active students
        queryObj.isActive = true;
      }
  
      // Find students with all details and populate references
      const students = await Student.find(queryObj)
        .populate('forane', 'name')  // Populate forane details
        .populate('parish', 'name')  // Populate parish details
        .sort({ name: 1 });  // Sort by name
  
      res.status(200).json({
        success: true,
        count: students.length,
        students: students
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching students',
        error: error.message
      });
    }
  };

// @desc    Create a new student
// @route   POST /api/students
// @access  Public
exports.createStudent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      // Location Details
      forane,
      parish,
      class: studentClass,
      division,

      // Personal Details
      name,
      baptismName,
      houseName,
      email,
      phone,

      // Date Fields
      dateOfBirth,
      dateOfBaptism,
      dateOfConfirmation,
      admissionNo,
      // Family Details
      fatherName,
      fatherBaptismName,
      motherName,
      motherBaptismName
    } = req.body;

    // Validate required fields
    if (!forane || !parish || !studentClass || !division || 
        !name || !phone || !dateOfBirth || 
        !fatherName || !motherName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate forane and parish exist
    const existingForane = await Forane.findById(forane);
    const existingParish = await Parish.findById(parish);
    
    if (!existingForane || !existingParish) {
      return res.status(404).json({
        success: false,
        message: 'Invalid forane or parish'
      });
    }

    // Generate admission number
    const academicYear = getCurrentAcademicYear();
    //const admissionNo = await Student.generateAdmissionNo(forane, parish, academicYear);

    // Handle image upload if exists
    let imageData = null;
    if (req.file) {
      imageData = {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype
      };
    }

    // Create new student
    const newStudent = new Student({
      // Location Details
      forane,
      parish,
      class: studentClass,
      division,

      // Personal Details
      name,
      baptismName,
      houseName,
      email,
      phone,

      // Date Fields
      dateOfBirth,
      dateOfBaptism,
      dateOfConfirmation,

      // Family Details
      fatherName,
      fatherBaptismName,
      motherName,
      motherBaptismName,

      // Admission Details
      admissionNo,

      // Image
      image: imageData
    });

    // Save student
    await newStudent.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student: {
        _id: newStudent._id,
        name: newStudent.name,
        admissionNo: newStudent.admissionNo,
        class: newStudent.class,
        division: newStudent.division
      }
    });
  } catch (error) {
    // Rollback transaction
    await session.abortTransaction();
    session.endSession();

    console.error('Error creating student:', error);

    // Handle unique constraint violation
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Admission number must be unique'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating student',
      error: error.message
    });
  }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Public
exports.updateStudent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating admission number
    if (updateData.admissionNo) {
      return res.status(400).json({
        success: false,
        message: 'Admission number cannot be modified'
      });
    }

    // Handle image upload if exists
    if (req.file) {
      updateData.image = {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype
      };

      // Delete old image if exists
      const oldStudent = await Student.findById(id);
      if (oldStudent.image && oldStudent.image.path) {
        try {
          fs.unlinkSync(oldStudent.image.path);
        } catch (unlinkError) {
          console.warn('Could not delete old image:', unlinkError);
        }
      }
    }

    // Find and update student
    const student = await Student.findByIdAndUpdate(
      id, 
      updateData, 
      { 
        new: true, 
        runValidators: true,
        session 
      }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      student: {
        _id: student._id,
        name: student.name,
        class: student.class,
        division: student.division
      }
    });
  } catch (error) {
    // Rollback transaction
    await session.abortTransaction();
    session.endSession();

    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating student',
      error: error.message
    });
  }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Public
exports.deleteStudent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // Find student to get image path before deletion
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Delete image if exists
    if (student.image && student.image.path) {
      try {
        fs.unlinkSync(student.image.path);
      } catch (unlinkError) {
        console.warn('Could not delete student image:', unlinkError);
      }
    }

    // Delete student
    await Student.findByIdAndDelete(id, { session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      student: {
        _id: student._id,
        name: student.name
      }
    });
  } catch (error) {
    // Rollback transaction
    await session.abortTransaction();
    session.endSession();

    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting student',
      error: error.message
    });
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Public
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .populate('forane', 'name')
      .populate('parish', 'name');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      student
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student',
      error: error.message
    });
  }
};