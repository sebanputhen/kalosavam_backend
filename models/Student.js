const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Location Details
  forane: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Forane',
    required: [true, 'Forane is required']
  },
  parish: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parish',
    required: [true, 'Parish is required']
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    enum: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  },
  division: {
    type: String,
    required: [true, 'Division is required'],
    enum: ['A', 'B', 'C']
  },

  // Student Personal Details
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  baptismName: {
    type: String,
    trim: true
  },
  houseName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },

  // Date Fields
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of Birth is required']
  },
  dateOfBaptism: {
    type: Date
  },
  dateOfConfirmation: {
    type: Date
  },

  // Family Details
  fatherName: {
    type: String,
    required: [true, 'Father name is required'],
    trim: true
  },
  fatherBaptismName: {
    type: String,
    trim: true
  },
  motherName: {
    type: String,
    required: [true, 'Mother name is required'],
    trim: true
  },
  motherBaptismName: {
    type: String,
    trim: true
  },

  // Admission Details
  admissionNo: {
    type: String,
    required: [true, 'Admission number is required'],
    //unique: true,
    trim: true
  },
  
  // Image Upload
  image: {
    type: {
      filename: String,
      path: String,
      mimetype: String
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes to improve query performance
studentSchema.index({ parish: 1, class: 1, division: 1 });
studentSchema.index({ admissionNo: 1 });

// Pre-save middleware to update timestamps
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Custom method to generate admission number (modified to include more details)
// studentSchema.statics.generateAdmissionNo = async function(forane, parish, academicYear) {
//   // Find the last student in this parish for the year
//   const lastStudent = await this.findOne(
//     { 
//       parish: parish, 
//       createdAt: { 
//         $gte: new Date(`${academicYear}-01-01`), 
//         $lt: new Date(`${academicYear + 1}-01-01`) 
//       }
//     },
//     {},
//     { sort: { admissionNo: -1 } }
//   );

//   // Generate new admission number
//   const year = academicYear.toString().slice(-2);
//   const foraneCode = await mongoose.model('Forane').findById(forane).select('code');
//   const parishCode = await mongoose.model('Parish').findById(parish).select('code');
  
//   let newAdmissionNo;
//   if (lastStudent) {
//     const lastNo = parseInt(lastStudent.admissionNo.slice(-4));
//     newAdmissionNo = `${year}${foraneCode.code}${parishCode.code}${String(lastNo + 1).padStart(4, '0')}`;
//   } else {
//     newAdmissionNo = `${year}${foraneCode.code}${parishCode.code}0001`;
//   }

//   return newAdmissionNo;
// };

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;