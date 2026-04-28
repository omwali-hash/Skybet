// backend/src/controllers/walletController.js
const walletService = require('../services/wallet.service');
const darajaService = require('../services/daraja.service');

exports.getBalance = async (req, res, next) => {
  try {
    const wallet = await walletService.getWallet(req.userId);

    res.json({
      data: {
        balance: wallet.balance,
        frozenBalance: wallet.frozenBalance,
        availableBalance: wallet.balance - wallet.frozenBalance,
        currency: wallet.currency
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.initiateDeposit = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const user = await require('../services/auth.service').getUserById(req.userId);

    if (!amount || amount < 10 || amount > 50000) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be between KES 10 and KES 50,000'
      });
    }

    // Check daily limit
    const limit = await walletService.checkDailyLimit(req.userId);
    if (limit.remaining < amount) {
      return res.status(400).json({
        error: 'Limit exceeded',
        message: `Daily limit exceeded. Remaining: KES ${limit.remaining}`
      });
    }

    // Initiate M-Pesa payment
    const reference = `SKYBET-${req.userId}-${Date.now()}`;
    const mpesaResult = await darajaService.initiateSTKPush(
      user.phone,
      amount,
      reference,
      'SkyBet Deposit'
    );

    res.json({
      message: 'Payment prompt sent to your phone',
      data: {
        merchantRequestID: mpesaResult.merchantRequestID,
        checkoutRequestID: mpesaResult.checkoutRequestID,
        amount,
        reference
      }
    });
  } catch (error) {
    res.status(400).json({
      error: 'Deposit failed',
      message: error.message
    });
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const transactions = await walletService.getTransactionHistory(
      req.userId,
      parseInt(limit),
      parseInt(skip)
    );

    res.json({
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

exports.initiateWithdrawal = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Minimum withdrawal is KES 50'
      });
    }

    const result = await walletService.initiateWithdrawal(req.userId, amount);

    res.json({
      message: 'Withdrawal initiated. Processing may take 24-48 hours.',
      data: {
        transactionId: result.transaction.id,
        amount,
        status: 'pending'
      }
    });
  } catch (error) {
    if (error.message.includes('Insufficient')) {
      return res.status(400).json({
        error: 'Insufficient balance',
        message: error.message
      });
    }
    next(error);
  }
};
