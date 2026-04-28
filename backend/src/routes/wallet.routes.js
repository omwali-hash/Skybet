// backend/src/routes/wallet.routes.js
const express = require('express');
const walletController = require('../controllers/walletController');

const router = express.Router();

router.get('/balance', walletController.getBalance);
router.post('/deposit', walletController.initiateDeposit);
router.get('/transactions', walletController.getTransactions);
router.post('/withdraw', walletController.initiateWithdrawal);

module.exports = router;
