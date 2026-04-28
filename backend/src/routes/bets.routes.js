// backend/src/routes/bets.routes.js
const express = require('express');

const router = express.Router();

// TODO: Implement bet routes
router.post('/place', (req, res) => {
  res.json({ message: 'Place bet' });
});

router.post('/:id/cashout', (req, res) => {
  res.json({ message: 'Cashout bet' });
});

router.get('/active', (req, res) => {
  res.json({ message: 'Get active bets' });
});

router.get('/history', (req, res) => {
  res.json({ message: 'Get bet history' });
});

module.exports = router;
