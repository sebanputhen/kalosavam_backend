const express = require('express');
const router = express.Router();
const {
  getAll,
  create,
  resetPassword,
  remove,
  login
} = require('../controllers/parishCredential.controller');

// Public
router.post('/parish-credentials/login', login);

// Protected (add your auth middleware as needed)
router.get('/parish-credentials', getAll);
router.post('/parish-credentials', create);
router.put('/parish-credentials/:id', resetPassword);
router.delete('/parish-credentials/:id', remove);

module.exports = router;