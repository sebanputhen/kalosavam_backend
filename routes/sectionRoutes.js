const express = require("express");
const router = express.Router();
const {
  getAllSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  getSectionStats
} = require("../controllers/sectionController");
const { verifyToken, isAdmin } = require("../middleware/auth.middleware");

// Apply authentication middleware to all routes
router.use(verifyToken);

// Stats route
router.get("/stats", getSectionStats);

// Base routes
router.route("/")
  .get(getAllSections)
  .post(isAdmin, createSection);

// ID-specific routes
router.route("/:id")
  .get(getSectionById)
  .put(isAdmin, updateSection)
  .delete(isAdmin, deleteSection);

module.exports = router;