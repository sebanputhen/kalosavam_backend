// In routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
// Import the Student model
const Student = require('../models/Student');
const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentById
} = require('../controllers/studentController');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/students');
    // Ensure the directory exists
    require('fs').mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    cb(null, `student-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// Route for getting students (original method with query params)
router.get('/', getStudents);

// New route for getting students using path parameters
router.get('/parish/:parish/class/:class/division/:division', async (req, res) => {
    try {
      // Extract parameters from URL path
      const { parish, class: studentClass, division } = req.params;
      const { includeInactive } = req.query;
      
      // Create a new request object to avoid modifying the original
      const modifiedReq = {
        ...req,
        query: {
          parish,
          class: studentClass,
          division,
          includeInactive
        }
      };
      
      // If forane is not provided in query but required, try to fetch it
      if (!modifiedReq.query.forane) {
        const Parish = require('../models/Parish');
        try {
          const parishData = await Parish.findById(parish);
          if (parishData && parishData.forane) {
            modifiedReq.query.forane = parishData.forane.toString();
          }
        } catch (error) {
          console.error('Error fetching forane from parish:', error);
        }
      }
      
      // Call the original controller with modified request
      return getStudents(modifiedReq, res);
    } catch (error) {
      console.error('Error in route handler:', error);
      res.status(500).json({
        success: false,
        message: 'Server error in route handler',
        error: error.message
      });
    }
  });

// Route for deactivating a student
router.put('/:id/deactivate', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // Find and update student to set isActive to false
    const student = await Student.findByIdAndUpdate(
      id, 
      { isActive: false }, 
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
      message: 'Student deactivated successfully',
      student: {
        _id: student._id,
        name: student.name,
        isActive: student.isActive
      }
    });
  } catch (error) {
    // Rollback transaction
    await session.abortTransaction();
    session.endSession();

    console.error('Error deactivating student:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deactivating student',
      error: error.message
    });
  }
});

// Route for getting a specific student by ID
router.get('/:id', getStudentById);

// Route for creating a new student with optional image upload
router.post('/', upload.single('image'), createStudent);

// Route for updating a student with optional image upload
router.put('/:id', upload.single('image'), updateStudent);

// Route for deleting a student
router.delete('/:id', deleteStudent);

module.exports = router;