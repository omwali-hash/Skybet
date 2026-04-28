// backend/src/routes/user.routes.js
const express = require('express');

const router = express.Router();

// TODO: Implement user routes
router.get('/stats', (req, res) => {
  res.json({ message: 'Get user stats' });
});

router.put('/profile', (req, res) => {
  res.json({ message: 'Update profile' });
});

module.exports = router;
