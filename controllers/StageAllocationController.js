const StageAllocation = require('../models/StageAllocation');
const mongoose = require('mongoose');

class StageAllocationController {
  // Get all stage allocations for a specific forane
  async getAllocations(req, res) {
    try {
      const { foraneId } = req.params;

      // Validate foraneId
      if (!mongoose.Types.ObjectId.isValid(foraneId)) {
        return res.status(400).json({
          message: 'Invalid Forane ID',
          success: false
        });
      }

      // Find allocations with populated references
      const allocations = await StageAllocation.findOne({ forane: foraneId })
        .populate({
          path: 'venues.venueId',
          select: 'name capacity parish'
        })
        .populate({
          path: 'venues.eventIds',
          select: 'eventName section gender eventType category'
        });

      // If no allocations found, return empty array
      if (!allocations) {
        return res.status(200).json({
          message: 'No allocations found',
          data: [],
          success: true
        });
      }

      // Transform allocations to match frontend expectation
      const transformedAllocations = allocations.venues.map(venue => ({
        venueId: venue.venueId._id,
        eventIds: venue.eventIds.map(event => event._id)
      }));

      res.status(200).json({
        message: 'Allocations retrieved successfully',
        data: transformedAllocations,
        success: true
      });
    } catch (error) {
      console.error('Error fetching allocations:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message,
        success: false
      });
    }
  }

  // Create or update stage allocations
  async createAllocations(req, res) {
    try {
      const { foraneId, allocations } = req.body;
      const userId = req.user?._id; // Assuming you have authentication middleware
  
      // Validate input
      if (!foraneId || !Array.isArray(allocations)) {
        return res.status(400).json({
          message: 'Invalid input. Forane ID and allocations array are required.',
          success: false
        });
      }
  
      // Filter out allocations with 'unallocated' venues
      const validAllocations = allocations.filter(alloc => 
        alloc.venueId !== 'unallocated' && 
        mongoose.Types.ObjectId.isValid(alloc.venueId)
      );
  
      // Remove existing allocation for this forane
      await StageAllocation.findOneAndDelete({ forane: foraneId });
  
      // Create new allocation
      const newAllocation = new StageAllocation({
        forane: foraneId,
        venues: validAllocations.map(alloc => ({
          venueId: alloc.venueId,
          eventIds: alloc.eventIds
        })),
        createdBy: userId,
        status: 'draft'
      });
  
      // Save the new allocation
      await newAllocation.save();
  
      res.status(201).json({
        message: 'Allocations saved successfully',
        data: {
          foraneId,
          allocationsCount: validAllocations.length
        },
        success: true
      });
    } catch (error) {
      console.error('Error saving allocations:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message,
        success: false
      });
    }
  }

  // Delete allocations for a forane
  async deleteAllocations(req, res) {
    try {
      const { foraneId } = req.params;

      // Validate foraneId
      if (!mongoose.Types.ObjectId.isValid(foraneId)) {
        return res.status(400).json({
          message: 'Invalid Forane ID',
          success: false
        });
      }

      // Find and delete allocations
      const result = await StageAllocation.findOneAndDelete({ forane: foraneId });

      if (!result) {
        return res.status(404).json({
          message: 'No allocations found for this forane',
          success: false
        });
      }

      res.status(200).json({
        message: 'Allocations deleted successfully',
        data: {
          foraneId,
          deletedCount: result.venues.length
        },
        success: true
      });
    } catch (error) {
      console.error('Error deleting allocations:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message,
        success: false
      });
    }
  }

  // Get statistics for stage allocations
  async getAllocationStatistics(req, res) {
    try {
      const { foraneId } = req.params;

      // Validate foraneId
      if (!mongoose.Types.ObjectId.isValid(foraneId)) {
        return res.status(400).json({
          message: 'Invalid Forane ID',
          success: false
        });
      }

      // Find allocation
      const allocation = await StageAllocation.findOne({ forane: foraneId });

      if (!allocation) {
        return res.status(200).json({
          message: 'No allocations found',
          data: {
            totalVenues: 0,
            totalEvents: 0,
            allocatedVenues: 0,
            status: 'Not Allocated'
          },
          success: true
        });
      }

      // Calculate statistics
      const statistics = {
        totalVenues: allocation.venues.length,
        totalEvents: allocation.venues.reduce((total, venue) => total + venue.eventIds.length, 0),
        allocatedVenues: allocation.venues.filter(v => v.eventIds.length > 0).length,
        status: allocation.status || 'Draft'
      };

      res.status(200).json({
        message: 'Allocation statistics retrieved',
        data: statistics,
        success: true
      });
    } catch (error) {
      console.error('Error fetching allocation statistics:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message,
        success: false
      });
    }
  }
}

// Export an instance of the controller
module.exports = new StageAllocationController();