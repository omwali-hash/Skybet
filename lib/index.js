// lib/index.js - Central export point for lib modules
const authService = require('./services/auth.service.js');
const { checkSelfExclusion } = require('./middleware/responsibleGambling.js');

module.exports = {
  authService,
  checkSelfExclusion
};
