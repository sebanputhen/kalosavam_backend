// routes/managerRoutes.js
const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');

// Get all managers
router.get('/', managerController.getAllManagers);

// Get managers by parish
router.get('/parish/:parishId', managerController.getManagersByParish);

// Get managers by parish and section
router.get('/parish/:parishId/section/:section', managerController.getManagersByParishAndSection);
router.get('/parish/:parishId/sections', managerController.getSectionsByParish);
// Create new manager
router.post('/', managerController.createManager);

// Update manager
router.put('/:id', managerController.updateManager);

// Delete manager
router.delete('/:id', managerController.deleteManager);

module.exports = router;