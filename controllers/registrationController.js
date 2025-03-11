// controllers/registrationController.js
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Parish = require('../models/Parish');
const mongoose = require('mongoose');

// Section configuration
const SECTION_CONFIG = {
  'Dominic Savio': { classes: ['IV', 'V', 'VI'] },
  'Alphonsa': { classes: ['VII', 'VIII', 'IX'] },
  'Saint Thomas': { classes: ['X', 'XI', 'XII'] }
};

// Helper function to determine section based on class
const getParticipantSection = (standard) => {
  for (const [section, config] of Object.entries(SECTION_CONFIG)) {
    if (config.classes.includes(standard)) {
      return section;
    }
  }
  return null;
};

// Get all registrations
exports.getAllRegistrations = async (req, res) => {
  try {
    // Initialize query object
    const query = {};
    
    // Check for params first, then fall back to query string
    if (req.params.eventId) {
      query.event = req.params.eventId;
    } else if (req.query.event) {
      query.event = req.query.event;
    }
    
    if (req.params.parishId) {
      query.parish = req.params.parishId;
    } else if (req.query.parish) {
      query.parish = req.query.parish;
    }
    
    const registrations = await Registration.find(query)
      .populate('event', 'eventName eventType gender section')
      .populate('parish', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: registrations.length,
      data: {
        registrations
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get registrations by parish ID (new function for path parameter)
exports.getRegistrationsByParish = async (req, res) => {
  try {
    const { parishId } = req.params;
    
    if (!parishId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Parish ID is required'
      });
    }
    
    const registrations = await Registration.find({ parish: parishId })
      .populate('event', 'eventName eventType gender section')
      .populate('parish', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: registrations.length,
      data: {
        registrations
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get registration by ID
exports.getRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event', 'eventName eventType gender section')
      .populate('parish', 'name');
    
    if (!registration) {
      return res.status(404).json({
        status: 'fail',
        message: 'No registration found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        registration
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};



// exports.createRegistration = async (req, res) => {
//   try {
//     const { 
//       name, 
//       standard, 
//       gender, 
//       dob, 
//       event, 
//       parish,
//       isCrossSectionParticipation = false,
//       registrationNumber = null // Accept registration number from frontend
//     } = req.body;
    
//     // Validate required fields
//     if (!name || !standard || !gender || !dob || !event || !parish) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Please provide all required fields'
//       });
//     }
    
//     // Validate that event and parish exist
//     const eventDetails = await Event.findById(event);
//     const parishExists = await Parish.findById(parish);
    
//     if (!eventDetails || !parishExists) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Invalid event or parish ID'
//       });
//     }
    
//     // Determine participant's section based on class
//     const participantSection = getParticipantSection(standard);
//     if (!participantSection) {
//       return res.status(400).json({
//         status: 'fail',
//         message: `Invalid class selection. Available classes: ${
//           Object.values(SECTION_CONFIG)
//             .map(c => c.classes.join(', '))
//             .join(' or ')
//         }`
//       });
//     }
    
//     // Validate cross-section participation
//     if (isCrossSectionParticipation) {
//       // Check if cross-section participation is allowed for this event
//       if (!eventDetails.allowCrossSectionParticipation) {
//         return res.status(400).json({
//           status: 'fail',
//           message: 'Cross-section participation is not allowed for this event'
//         });
//       }
      
//       // Check if this section is allowed for cross-section participation
//       if (!eventDetails.crossSectionAllowedSections || 
//           !eventDetails.crossSectionAllowedSections.includes(participantSection)) {
//         return res.status(400).json({
//           status: 'fail',
//           message: `Cross-section participation not allowed for ${participantSection} section in this event`
//         });
//       }
//     } else {
//       // Validate that event section matches participant's section for home section events
//       if (eventDetails.section && eventDetails.section !== participantSection) {
//         return res.status(400).json({
//           status: 'fail',
//           message: `Students in class ${standard} (${participantSection} section) cannot register for events in the ${eventDetails.section} section`
//         });
//       }
//     }
    
//     // Validate gender against event gender requirement
//     if (eventDetails.gender !== 'common') {
//       const genderMismatch = 
//         (gender === 'M' && eventDetails.gender !== 'male') ||
//         (gender === 'F' && eventDetails.gender !== 'female');
      
//       if (genderMismatch) {
//         return res.status(400).json({
//           status: 'fail',
//           message: `This event is for ${
//             eventDetails.gender === 'male' ? 'Boys' : 'Girls'
//           } only`
//         });
//       }
//     }
    
//     // Check for existing registrations for this participant - check only within parish
//     const existingRegistrations = await Registration.find({
//       name,
//       parish,
//       standard,
//       gender,
//       dob: { $gte: new Date(dob), $lt: new Date(new Date(dob).getTime() + 24 * 60 * 60 * 1000) }
//     }).populate('event', 'eventType');
    
//     // Count events by type for this participant
//     const singleEventsCount = existingRegistrations.filter(reg => 
//       reg.event.eventType === 'single'
//     ).length;
    
//     const groupEventsCount = existingRegistrations.filter(reg => 
//       reg.event.eventType === 'group'
//     ).length;
    
//     // Apply registration limits
//     if (eventDetails.eventType === 'single' && singleEventsCount >= 2) {
//       return res.status(400).json({
//         status: 'fail',
//         message: `You can only register for a maximum of 2 individual events per parish. You already have ${singleEventsCount} individual events registered for ${parishExists.name}.`
//       });
//     }
    
//     if (eventDetails.eventType === 'group' && groupEventsCount >= 1) {
//       return res.status(400).json({
//         status: 'fail',
//         message: `You can only register for one group event per parish. You already have a group event registered for ${parishExists.name}.`
//       });
//     }
    
//     // Check maximum participants for the event (per parish)
//     const currentParticipantsCount = await Registration.countDocuments({
//       event,
//       parish, // Filter by parish
//       ...(isCrossSectionParticipation ? { isCrossSectionParticipation: true } : { isCrossSectionParticipation: false })
//     });
    
//     const maxParticipants = isCrossSectionParticipation 
//       ? eventDetails.crossSectionMaxParticipants 
//       : eventDetails.maxParticipants;
    
//     if (currentParticipantsCount >= maxParticipants) {
//       return res.status(400).json({
//         status: 'fail',
//         message: `Maximum participants (${maxParticipants}) have already been reached for this event from ${parishExists.name} parish`
//       });
//     }
    
//     // Check for duplicate registration
//     const existingRegistration = await Registration.findOne({
//       name,
//       event,
//       parish,
//       dob: { $gte: new Date(dob), $lt: new Date(new Date(dob).getTime() + 24 * 60 * 60 * 1000) },
//       gender,
//       standard
//     });
    
//     if (existingRegistration) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'You are already registered for this event'
//       });
//     }
    
//     // Prepare registration data
//     const registrationData = {
//       name,
//       standard,
//       gender,
//       dob: new Date(dob),
//       event,
//       parish,
//       section: participantSection,
//       isCrossSectionParticipation,
//       registrationNumber // Store the registration number if provided
//     };
    
//     // Create new registration
//     const newRegistration = await Registration.create(registrationData);
    
//     // Populate references for response
//     const populatedRegistration = await Registration.findById(newRegistration._id)
//       .populate('event', 'eventName eventType gender section')
//       .populate('parish', 'name');
    
//     res.status(201).json({
//       status: 'success',
//       data: {
//         registration: populatedRegistration
//       }
//     });
//   } catch (err) {
//     console.error('Registration Error:', err);
    
//     // Handle specific Mongoose validation errors
//     if (err.name === 'ValidationError') {
//       const errors = Object.values(err.errors).map(el => el.message);
//       return res.status(400).json({
//         status: 'fail',
//         message: `Invalid input data. ${errors.join('. ')}`
//       });
//     }
    
//     // Handle duplicate key error
//     if (err.code === 11000) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Duplicate registration. This participant is already registered for this event.'
//       });
//     }
    
//     res.status(500).json({
//       status: 'fail',
//       message: 'An unexpected error occurred while registering the participant.'
//     });
//   }
// };
// Get registrations by Forane and Event
exports.getRegistrationsByForaneAndEvent = async (req, res) => {
  try {
    const { foraneId, eventId } = req.params;

    // Validate input
    if (!foraneId || !eventId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Forane ID and Event ID are required'
      });
    }

    // Find parishes in the specified forane
    const parishes = await Parish.find({ forane: foraneId }).select('_id');
    const parishIds = parishes.map(parish => parish._id);

    // Find registrations that match:
    // 1. Parishes in the specified forane
    // 2. The specified event
    const registrations = await Registration.find({
      parish: { $in: parishIds },
      event: eventId
    })
    .populate({
      path: 'parish',
      select: 'name forane',
      populate: {
        path: 'forane',
        select: 'name'
      }
    })
    .populate({
      path: 'event',
      select: 'eventName eventType gender section stage'
    })
    .select('name standard gender parish event section isCrossSectionParticipation registrationNumber groupRegistrationNumber');

    // Respond with the registrations
    res.status(200).json({
      status: 'success',
      results: registrations.length,
      data: {
        registrations: registrations
      }
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Route to add to your routes file
// router.get('/registrations/forane/:foraneId/event/:eventId', registrationController.getRegistrationsByForaneAndEvent);
exports.createRegistration = async (req, res) => {
  try {
    const { 
      name, 
      standard, 
      gender, 
      dob, 
      event, 
      parish,
      isCrossSectionParticipation = false,
      registrationNumber = null
    } = req.body;
    
    // Validate required fields
    if (!name || !standard || !gender || !dob || !event || !parish) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields'
      });
    }
    
    // Validate that event and parish exist
    const eventDetails = await Event.findById(event);
    const parishExists = await Parish.findById(parish).populate('forane');
    
    if (!eventDetails || !parishExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid event or parish ID'
      });
    }
    
    // Determine participant's section based on class
    const participantSection = getParticipantSection(standard);
    if (!participantSection) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid class selection. Available classes: ${
          Object.values(SECTION_CONFIG)
            .map(c => c.classes.join(', '))
            .join(' or ')
        }`
      });
    }
    
    // Validate cross-section participation
    if (isCrossSectionParticipation) {
      // Check if cross-section participation is allowed for this event
      if (!eventDetails.allowCrossSectionParticipation) {
        return res.status(400).json({
          status: 'fail',
          message: 'Cross-section participation is not allowed for this event'
        });
      }
      
      // Check if this section is allowed for cross-section participation
      if (!eventDetails.crossSectionAllowedSections || 
          !eventDetails.crossSectionAllowedSections.includes(participantSection)) {
        return res.status(400).json({
          status: 'fail',
          message: `Cross-section participation not allowed for ${participantSection} section in this event`
        });
      }
    } else {
      // Validate that event section matches participant's section for home section events
      if (eventDetails.section && eventDetails.section !== participantSection) {
        return res.status(400).json({
          status: 'fail',
          message: `Students in class ${standard} (${participantSection} section) cannot register for events in the ${eventDetails.section} section`
        });
      }
    }
    
    // Validate gender against event gender requirement
    if (eventDetails.gender !== 'common') {
      const genderMismatch = 
        (gender === 'M' && eventDetails.gender !== 'male') ||
        (gender === 'F' && eventDetails.gender !== 'female');
      
      if (genderMismatch) {
        return res.status(400).json({
          status: 'fail',
          message: `This event is for ${
            eventDetails.gender === 'male' ? 'Boys' : 'Girls'
          } only`
        });
      }
    }
    
    // Check for existing registrations for this participant - check only within parish
    const existingRegistrations = await Registration.find({
      name,
      parish,
      standard,
      gender,
      dob: { $gte: new Date(dob), $lt: new Date(new Date(dob).getTime() + 24 * 60 * 60 * 1000) }
    }).populate('event', 'eventType');
    
    // Count events by type for this participant
    const singleEventsCount = existingRegistrations.filter(reg => 
      reg.event.eventType === 'single'
    ).length;
    
    const groupEventsCount = existingRegistrations.filter(reg => 
      reg.event.eventType === 'group'
    ).length;
    
    // Apply registration limits
    if (eventDetails.eventType === 'single' && singleEventsCount >= 2) {
      return res.status(400).json({
        status: 'fail',
        message: `You can only register for a maximum of 2 individual events per parish. You already have ${singleEventsCount} individual events registered for ${parishExists.name}.`
      });
    }
    
    if (eventDetails.eventType === 'group' && groupEventsCount >= 1) {
      return res.status(400).json({
        status: 'fail',
        message: `You can only register for one group event per parish. You already have a group event registered for ${parishExists.name}.`
      });
    }
    
    // Check maximum participants for the event (per parish)
    const currentParticipantsCount = await Registration.countDocuments({
      event,
      parish,
      ...(isCrossSectionParticipation ? { isCrossSectionParticipation: true } : { isCrossSectionParticipation: false })
    });
    
    const maxParticipants = isCrossSectionParticipation 
      ? eventDetails.crossSectionMaxParticipants 
      : eventDetails.maxParticipants;
    
    if (currentParticipantsCount >= maxParticipants) {
      return res.status(400).json({
        status: 'fail',
        message: `Maximum participants (${maxParticipants}) have already been reached for this event from ${parishExists.name} parish`
      });
    }
    
    // Check for duplicate registration
    const existingRegistration = await Registration.findOne({
      name,
      event,
      parish,
      dob: { $gte: new Date(dob), $lt: new Date(new Date(dob).getTime() + 24 * 60 * 60 * 1000) },
      gender,
      standard
    });
    
    if (existingRegistration) {
      return res.status(400).json({
        status: 'fail',
        message: 'You are already registered for this event'
      });
    }
    
    // Prepare registration data
    const registrationData = {
      name,
      standard,
      gender,
      dob: new Date(dob),
      event,
      parish,
      section: participantSection,
      isCrossSectionParticipation,
      registrationNumber
    };
    
    // For group events, handle unique registration number
    if (eventDetails.eventType === 'group') {
      // Create a unique key for this group event in this parish
      const groupEventUniqueKey = `${event}_${parish}`;
      
      // Check if a group registration number already exists for this group event in this parish
      const existingGroupRegistration = await Registration.findOne({
        event,
        parish,
        groupEventUniqueKey
      });
      
      let groupRegistrationNumber;
      
      if (existingGroupRegistration) {
        // Use existing group registration number
        groupRegistrationNumber = existingGroupRegistration.groupRegistrationNumber;
      } else {
        // Generate new group registration number
        const forane = parishExists.forane;
        const currentGroupRegNumber = forane.groupRegistrationNumber || 1;
        
        // Generate format: ForaneShortCode-GRP-SequentialNumber
        groupRegistrationNumber = `${forane.shortCode}-GRP-${currentGroupRegNumber}`;
        
        // Increment forane's group registration number
        forane.groupRegistrationNumber = currentGroupRegNumber + 1;
        await forane.save();
      }
      
      // Add group registration details to registration data
      registrationData.groupRegistrationNumber = groupRegistrationNumber;
      registrationData.groupEventUniqueKey = groupEventUniqueKey;
    }
    
    // Create new registration
    const newRegistration = await Registration.create(registrationData);
    
    // Populate references for response
    const populatedRegistration = await Registration.findById(newRegistration._id)
      .populate('event', 'eventName eventType gender section')
      .populate('parish', 'name');
    
    res.status(201).json({
      status: 'success',
      data: {
        registration: populatedRegistration
      }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    
    // Handle specific Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      return res.status(400).json({
        status: 'fail',
        message: `Invalid input data. ${errors.join('. ')}`
      });
    }
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'Duplicate registration. This participant is already registered for this event.'
      });
    }
    
    res.status(500).json({
      status: 'fail',
      message: 'An unexpected error occurred while registering the participant.'
    });
  }
};

// Update registration
exports.updateRegistration = async (req, res) => {
  try {
    // Get current registration
    const currentRegistration = await Registration.findById(req.params.id);
    if (!currentRegistration) {
      return res.status(404).json({
        status: 'fail',
        message: 'No registration found with that ID'
      });
    }
    
    const { standard, gender } = req.body;
    
    // If standard is being updated, validate section
    if (standard) {
      const participantSection = getParticipantSection(standard);
      if (!participantSection) {
        return res.status(400).json({
          status: 'fail',
          message: `Invalid class selection. Available classes: ${Object.values(SECTION_CONFIG).map(c => c.classes.join(', ')).join(' or ')}`
        });
      }
      
      // Get event details to validate section match
      const eventDetails = await Event.findById(currentRegistration.event);
      if (eventDetails.section && eventDetails.section !== participantSection) {
        return res.status(400).json({
          status: 'fail',
          message: `Students in class ${standard} (${participantSection} section) cannot register for events in the ${eventDetails.section} section`
        });
      }
    }
    
    // If gender is being updated, validate against event gender requirement
    if (gender) {
      const eventDetails = await Event.findById(currentRegistration.event);
      
      if (eventDetails.gender !== 'common' &&
          (gender === 'M' && eventDetails.gender !== 'male' ||
           gender === 'F' && eventDetails.gender !== 'female')) {
        return res.status(400).json({
          status: 'fail',
          message: `This event is for ${eventDetails.gender} participants only`
        });
      }
    }
    
    // Set updated timestamp
    req.body.updatedAt = Date.now();
    
    const updatedRegistration = await Registration.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('event', 'eventName eventType gender section')
      .populate('parish', 'name');
    
    if (!updatedRegistration) {
      return res.status(404).json({
        status: 'fail',
        message: 'No registration found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        registration: updatedRegistration
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete registration
exports.deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    
    if (!registration) {
      return res.status(404).json({
        status: 'fail',
        message: 'No registration found with that ID'
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

// Get registrations count by parish for an event
exports.getRegistrationsCountByParish = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const registrationsByParish = await Registration.aggregate([
      { $match: { event: mongoose.Types.ObjectId(eventId) } },
      { $group: { _id: "$parish", count: { $sum: 1 } } },
      { $lookup: {
          from: "parishes",
          localField: "_id",
          foreignField: "_id",
          as: "parishDetails"
        }
      },
      { $unwind: "$parishDetails" },
      { $project: {
          parishId: "$_id",
          parishName: "$parishDetails.name",
          count: 1,
          _id: 0
        }
      },
      { $sort: { parishName: 1 } }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        registrationsByParish
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};
exports.getEventRegistrationCountsByParish = async (req, res) => {
  try {
    const { parishId } = req.params;
    
    if (!parishId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Parish ID is required'
      });
    }

    // Convert string ID to MongoDB ObjectId
    const parishObjectId = new mongoose.Types.ObjectId(parishId);
    
    const registrationsByEvent = await Registration.aggregate([
      { 
        $match: { parish: parishObjectId } 
      },
      { 
        $group: { 
          _id: "$event", 
          count: { $sum: 1 },
          crossSectionCount: {
            $sum: { $cond: [{ $eq: ["$isCrossSectionParticipation", true] }, 1, 0] }
          },
          regularCount: {
            $sum: { $cond: [{ $eq: ["$isCrossSectionParticipation", false] }, 1, 0] }
          }
        } 
      },
      { 
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "_id",
          as: "eventDetails"
        }
      },
      { 
        $unwind: "$eventDetails" 
      },
      { 
        $project: {
          eventId: "$_id",
          eventName: "$eventDetails.eventName",
          eventType: "$eventDetails.eventType",
          section: "$eventDetails.section",
          gender: "$eventDetails.gender",
          totalCount: "$count",
          crossSectionCount: 1,
          regularCount: 1,
          _id: 0
        }
      },
      { 
        $sort: { section: 1, eventName: 1 } 
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      results: registrationsByEvent.length,
      data: {
        registrationsByEvent
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};
// Add this to your registrationController.js
exports.getParishSectionDetails = async (req, res) => {
  try {
    const { parishId, section } = req.params;
    
    if (!parishId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Parish ID is required'
      });
    }

    // Convert string ID to MongoDB ObjectId
    const parishObjectId = new mongoose.Types.ObjectId(parishId);
    
    // Base match stage
    const matchStage = { 
      parish: parishObjectId 
    };

    // Add section filter if provided and not 'all'
    if (section && section !== 'all') {
      matchStage.section = decodeURIComponent(section);
    }

    const sectionDetails = await Registration.aggregate([
      { 
        $match: matchStage
      },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "eventDetails"
        }
      },
      {
        $unwind: "$eventDetails"
      },
      {
        $group: {
          _id: "$section",
          totalParticipants: { $sum: 1 },
          uniqueParticipants: { $addToSet: "$name" },
          participantDetails: {
            $addToSet: {
              name: "$name",
              standard: "$standard",
              gender: "$gender",
              events: "$eventDetails.eventName"
            }
          },
          events: { $addToSet: "$eventDetails.eventName" },
          eventTypes: { $addToSet: "$eventDetails.eventType" },
          standards: { $addToSet: "$standard" }
        }
      },
      {
        $project: {
          section: "$_id",
          totalParticipants: 1,
          uniqueParticipantsCount: { $size: "$uniqueParticipants" },
          participantDetails: 1,
          events: 1,
          eventTypes: 1,
          standards: 1,
          _id: 0
        }
      },
      {
        $sort: { section: 1 }
      }
    ]);
    
    // If no registrations found, return empty array
    if (sectionDetails.length === 0) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: {
          sectionDetails: []
        }
      });
    }

    res.status(200).json({
      status: 'success',
      results: sectionDetails.length,
      data: {
        sectionDetails: sectionDetails
      }
    });
  } catch (err) {
    console.error('Error fetching parish section details:', err);
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error',
      error: err.message
    });
  }
};

// Update routes
// router.get('/registrations/parish/:parishId/sections/:section?', registrationController.getParishSectionDetails);
// Get section registration counts for a specific parish
exports.getSectionRegistrationCountsByParish = async (req, res) => {
  try {
    const { parishId } = req.params;
    
    if (!parishId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Parish ID is required'
      });
    }

    // Convert string ID to MongoDB ObjectId
    const parishObjectId = new mongoose.Types.ObjectId(parishId);
    
    const registrationsBySection = await Registration.aggregate([
      { 
        $match: { parish: parishObjectId } 
      },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "eventDetails"
        }
      },
      {
        $unwind: "$eventDetails"
      },
      {
        $group: {
          _id: "$eventDetails.section",
          totalParticipants: { $sum: 1 },
          uniqueParticipants: { $addToSet: "$name" },
          uniqueParticipantDetails: {
            $addToSet: {
              name: "$name",
              standard: "$standard",
              gender: "$gender"
            }
          }
        }
      },
      {
        $project: {
          section: "$_id",
          totalParticipants: 1,
          uniqueParticipantCount: { $size: "$uniqueParticipants" },
          participantDetails: "$uniqueParticipantDetails",
          _id: 0
        }
      },
      {
        $sort: { section: 1 }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      results: registrationsBySection.length,
      data: {
        registrationsBySection
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};