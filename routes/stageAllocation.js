const express = require('express');
const router = express.Router();
const stageAllocationController = require('../controllers/StageAllocationController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Get allocations for a specific forane
router.get('/forane/:foraneId', 
  verifyToken,
  (req, res) => stageAllocationController.getAllocations(req, res)
);

// Create or update allocations
router.post('/', 
  verifyToken,
  isAdmin,
  (req, res) => stageAllocationController.createAllocations(req, res)
);

// Delete allocations for a forane
router.delete('/forane/:foraneId', 
  verifyToken,
  isAdmin,
  (req, res) => stageAllocationController.deleteAllocations(req, res)
);

// Get allocation statistics for a forane
router.get('/statistics/:foraneId', 
  verifyToken,
  (req, res) => stageAllocationController.getAllocationStatistics(req, res)
);

module.exports = router;