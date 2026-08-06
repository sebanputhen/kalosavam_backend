const jwt = require('jsonwebtoken');
const ParishCredential = require('../models/parishCredential.model');

// GET /parish-credentials — list all (password excluded)
const getAll = async (req, res) => {
  try {
    const credentials = await ParishCredential.find()
      .select('-password')
      .populate('parish', 'name forane')
      .sort({ createdAt: -1 });
    res.json({ data: credentials });
  } catch (error) {
    console.error('Get credentials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /parish-credentials — create
const create = async (req, res) => {
  try {
    const { parish, username, password } = req.body;

    if (!parish || !username || !password) {
      return res.status(400).json({ message: 'Parish, username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check duplicate parish
    const existingParish = await ParishCredential.findOne({ parish });
    if (existingParish) {
      return res.status(400).json({ message: 'Credentials already exist for this parish' });
    }

    // Check duplicate username
    const existingUsername = await ParishCredential.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const credential = new ParishCredential({
      parish,
      username: username.toLowerCase(),
      password
    });
    await credential.save();

    const result = await ParishCredential.findById(credential._id)
      .select('-password')
      .populate('parish', 'name forane');

    res.status(201).json({ data: result });
  } catch (error) {
    console.error('Create credential error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /parish-credentials/:id — reset password
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const credential = await ParishCredential.findById(req.params.id);
    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }

    credential.password = password;
    await credential.save(); // triggers pre-save hash

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /parish-credentials/:id
const remove = async (req, res) => {
  try {
    const credential = await ParishCredential.findByIdAndDelete(req.params.id);
    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }
    res.json({ message: 'Credential deleted successfully' });
  } catch (error) {
    console.error('Delete credential error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /parish-credentials/login — parish user login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const credential = await ParishCredential.findOne({
      username: username.toLowerCase(),
      isActive: true
    }).populate('parish', 'name forane');

    if (!credential) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await credential.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: credential._id,
        parishId: credential.parish._id,
        parishName: credential.parish.name,
        username: credential.username,
        role: 'parish'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: credential._id,
        username: credential.username,
        parishId: credential.parish._id,
        parishName: credential.parish.name,
        role: 'parish'
      }
    });
  } catch (error) {
    console.error('Parish login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAll, create, resetPassword, remove, login };