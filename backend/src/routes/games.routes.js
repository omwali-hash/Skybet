// backend/src/routes/games.routes.js
const express = require('express');

const router = express.Router();

// TODO: Implement game routes
router.get('/current', (req, res) => {
  res.json({ message: 'Get current game' });
});

router.post('/next', (req, res) => {
  res.json({ message: 'Start next game' });
});

router.get('/history', (req, res) => {
  res.json({ message: 'Get game history' });
});

module.exports = router;
