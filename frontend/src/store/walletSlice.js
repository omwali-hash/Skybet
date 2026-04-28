// frontend/src/store/walletSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  balance: 0,
  frozenBalance: 0,
  transactions: [],
  loading: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setBalance: (state, action) => {
      state.balance = action.payload.balance;
      state.frozenBalance = action.payload.frozenBalance;
    },
    setTransactions: (state, action) => {
      state.transactions = action.payload;
    },
    updateBalance: (state, action) => {
      state.balance += action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setLoading, 
  setBalance, 
  setTransactions, 
  updateBalance, 
  setError, 
  clearError 
} = walletSlice.actions;

export default walletSlice.reducer;
