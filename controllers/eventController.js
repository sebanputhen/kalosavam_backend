const Event = require('../models/Event');
const Category = require('../models/Category');

// Create new event
exports.createEvent = async (req, res) => {
  try {
    // Check if category exists
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid category'
      });
    }

    // Additional validation for cross-section participation
    if (req.body.eventType === 'group' && req.body.allowCrossSectionParticipation) {
      // Validate cross-section settings
      if (!req.body.crossSectionMaxParticipants || req.body.crossSectionMaxParticipants <= 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Cross-section max participants must be greater than 0'
        });
      }

      // Validate allowed sections
      if (!req.body.crossSectionAllowedSections || req.body.crossSectionAllowedSections.length === 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Please select at least one section for cross-section participation'
        });
      }

      // Ensure allowed sections don't include the main section
      if (req.body.crossSectionAllowedSections.includes(req.body.section)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Allowed sections cannot include the main event section'
        });
      }
    }

    // Check if a mixed gender event already exists for this category and section
    // or if we're trying to add a mixed event when gendered events exist
    if (req.body.gender === 'common') {
      const genderedEvents = await Event.find({
        category: req.body.category,
        section: req.body.section,
        gender: { $ne: 'common' }
      });

      if (genderedEvents.length > 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Cannot add a mixed gender event when male or female events exist for this category and section'
        });
      }
    } else {
      const mixedEvent = await Event.findOne({
        category: req.body.category,
        section: req.body.section,
        gender: 'common'
      });

      if (mixedEvent) {
        return res.status(400).json({
          status: 'fail',
          message: 'Cannot add a gendered event when a mixed gender event exists for this category and section'
        });
      }
    }

    // Check for duplicate entry with all fields
    const duplicateEvent = await Event.findOne({
      category: req.body.category,
      section: req.body.section,
      gender: req.body.gender,
      eventType: req.body.eventType,
      maxParticipants: req.body.maxParticipants
    });

    if (duplicateEvent) {
      return res.status(400).json({
        status: 'fail',
        message: 'An identical event already exists with the same category, section, gender, event type, and max participants'
      });
    }

    // Check for duplicate event name
    // const duplicateNameEvent = await Event.findOne({
    //   eventName: { $regex: new RegExp(`^${req.body.eventName}$`, 'i') } // Case insensitive match
    // });

    // if (duplicateNameEvent) {
    //   return res.status(400).json({
    //     status: 'fail',
    //     message: `An event with the name "${req.body.eventName}" already exists. Please use a different name`
    //   });
    // }

    const newEvent = await Event.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        event: newEvent
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('category', 'name');

    res.status(200).json({
      status: 'success',
      results: events.length,
      data: {
        events
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get single event
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('category', 'name');

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'No event found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    // If updating category, check if it exists
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid category'
        });
      }
    }

    // Get current event data
    const currentEvent = await Event.findById(req.params.id);
    if (!currentEvent) {
      return res.status(404).json({
        status: 'fail',
        message: 'No event found with that ID'
      });
    }

    // Determine the values to check (use new values or fall back to current values)
    const updatedEvent = {
      gender: req.body.gender || currentEvent.gender,
      category: req.body.category || currentEvent.category,
      section: req.body.section || currentEvent.section,
      eventType: req.body.eventType || currentEvent.eventType,
      maxParticipants: req.body.maxParticipants || currentEvent.maxParticipants,
      eventName: req.body.eventName || currentEvent.eventName,
      rules: req.body.rules !== undefined ? req.body.rules : currentEvent.rules,
      // New cross-section fields
      allowCrossSectionParticipation: 
        req.body.allowCrossSectionParticipation !== undefined 
          ? req.body.allowCrossSectionParticipation 
          : currentEvent.allowCrossSectionParticipation,
      crossSectionMaxParticipants: 
        req.body.crossSectionMaxParticipants || currentEvent.crossSectionMaxParticipants,
      crossSectionAllowedSections: 
        req.body.crossSectionAllowedSections || currentEvent.crossSectionAllowedSections
    };

    // Additional validation for cross-section participation
    if (updatedEvent.eventType === 'group' && updatedEvent.allowCrossSectionParticipation) {
      // Validate cross-section settings
      if (!updatedEvent.crossSectionMaxParticipants || updatedEvent.crossSectionMaxParticipants <= 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Cross-section max participants must be greater than 0'
        });
      }

      // Validate allowed sections
      if (!updatedEvent.crossSectionAllowedSections || updatedEvent.crossSectionAllowedSections.length === 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Please select at least one section for cross-section participation'
        });
      }

      // Ensure allowed sections don't include the main section
      if (updatedEvent.crossSectionAllowedSections.includes(updatedEvent.section)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Allowed sections cannot include the main event section'
        });
      }
    }

    // If updating gender, category, or section, perform gender conflict validation
    if (req.body.gender || req.body.category || req.body.section) {
      // Check for conflicts
      if (updatedEvent.gender === 'common') {
        const genderedEvents = await Event.find({
          _id: { $ne: req.params.id },
          category: updatedEvent.category,
          section: updatedEvent.section,
          gender: { $ne: 'common' }
        });

        if (genderedEvents.length > 0) {
          return res.status(400).json({
            status: 'fail',
            message: 'Cannot change to a mixed gender event when male or female events exist for this category and section'
          });
        }
      } else {
        const mixedEvent = await Event.findOne({
          _id: { $ne: req.params.id },
          category: updatedEvent.category,
          section: updatedEvent.section,
          gender: 'common'
        });

        if (mixedEvent) {
          return res.status(400).json({
            status: 'fail',
            message: 'Cannot change to a gendered event when a mixed gender event exists for this category and section'
          });
        }
      }
    }

    // Check for duplicate entry with all fields (excluding this event)
    const duplicateEvent = await Event.findOne({
      _id: { $ne: req.params.id },
      category: updatedEvent.category,
      section: updatedEvent.section,
      gender: updatedEvent.gender,
      eventType: updatedEvent.eventType,
      maxParticipants: updatedEvent.maxParticipants
    });

    if (duplicateEvent) {
      return res.status(400).json({
        status: 'fail',
        message: 'An identical event already exists with the same category, section, gender, event type, and max participants'
      });
    }

    // Check for duplicate event name (excluding this event)
    if (req.body.eventName) {
      const duplicateNameEvent = await Event.findOne({
        _id: { $ne: req.params.id },
        eventName: { $regex: new RegExp(`^${updatedEvent.eventName}$`, 'i') } // Case insensitive match
      });

      if (duplicateNameEvent) {
        return res.status(400).json({
          status: 'fail',
          message: `An event with the name "${updatedEvent.eventName}" already exists. Please use a different name`
        });
      }
    }

    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('category', 'name');

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'No event found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'No event found with that ID'
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

// New method to get events by section
exports.getEventsBySection = async (req, res) => {
  try {
    const { section } = req.params;

    // Validate section
    const validSections = ['Dominic Savio', 'Alphonsa', 'Saint Thomas'];
    if (!validSections.includes(section)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid section'
      });
    }

    // Find events for the specific section
    const events = await Event.find({ section })
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: events.length,
      data: {
        events
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Method to get cross-section eligible events
exports.getCrossSectionEvents = async (req, res) => {
  try {
    const { section } = req.params;

    // Validate section
    const validSections = ['Dominic Savio', 'Alphonsa', 'Saint Thomas'];
    if (!validSections.includes(section)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid section'
      });
    }

    // Find group events that allow cross-section participation 
    // and include the current section in their allowed sections
    const events = await Event.find({
      eventType: 'group',
      allowCrossSectionParticipation: true,
      crossSectionAllowedSections: section
    }).populate('category', 'name');

    res.status(200).json({
      status: 'success',
      results: events.length,
      data: {
        events
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Method to check cross-section participation eligibility
exports.checkCrossSectionEligibility = async (req, res) => {
  try {
    const { eventId, section } = req.params;

    // Find the event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Event not found'
      });
    }

    // Check cross-section participation rules
    const isEligible = 
      event.eventType === 'group' &&
      event.allowCrossSectionParticipation &&
      event.crossSectionAllowedSections.includes(section);

    res.status(200).json({
      status: 'success',
      data: {
        isEligible,
        maxCrossSectionParticipants: isEligible ? event.crossSectionMaxParticipants : 0
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};
exports.getEventsByStage = async (req, res) => {
  try {
    const { stage } = req.params;
    
    // Validate stage value
    if (!['On Stage', 'Off Stage'].includes(stage)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid stage parameter. Must be "On Stage" or "Off Stage"'
      });
    }
    
    // Find categories matching the requested stage
    const categories = await Category.find({ stage });
    
    if (categories.length === 0) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: {
          events: []
        }
      });
    }
    
    // Get array of category IDs
    const categoryIds = categories.map(cat => cat._id);
    
    // Find events in those categories
    const events = await Event.find({ category: { $in: categoryIds } })
      .populate('category', 'name stage minutes');
    
    res.status(200).json({
      status: 'success',
      results: events.length,
      data: {
        events
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};
// module.exports = {
//   createEvent,
//   getAllEvents,
//   getEvent,
//   updateEvent,
//   deleteEvent,
//   getEventsBySection,
//   getCrossSectionEvents, 
//   checkCrossSectionEligibility
// };