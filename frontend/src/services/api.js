// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  register: (phone, name, pin) => 
    api.post('/auth/register', { phone, name, pin }),
  
  login: (phone, pin) => 
    api.post('/auth/login', { phone, pin }),
  
  getProfile: () => 
    api.get('/auth/profile'),
};

// Wallet API
export const walletAPI = {
  getBalance: () => 
    api.get('/wallet/balance'),
  
  initiateDeposit: (amount) => 
    api.post('/wallet/deposit', { amount }),
  
  getTransactions: (limit = 50, skip = 0) => 
    api.get(`/wallet/transactions?limit=${limit}&skip=${skip}`),
  
  initiateWithdrawal: (amount) => 
    api.post('/wallet/withdraw', { amount }),
};

// Game API
export const gameAPI = {
  getCurrentGame: () => 
    api.get('/games/current'),
  
  startNextGame: () => 
    api.post('/games/next'),
  
  getGameHistory: () => 
    api.get('/games/history'),
};

// Bet API
export const betAPI = {
  placeBet: (gameId, amount) => 
    api.post('/bets/place', { gameId, amount }),
  
  cashoutBet: (betId, multiplier) => 
    api.post(`/bets/${betId}/cashout`, { multiplier }),
  
  getActiveBets: () => 
    api.get('/bets/active'),
  
  getBetHistory: () => 
    api.get('/bets/history'),
};

// User API
export const userAPI = {
  getStats: () => 
    api.get('/user/stats'),
  
  updateProfile: (data) => 
    api.put('/user/profile', data),
};

export default api;
