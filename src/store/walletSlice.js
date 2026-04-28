// src/store/walletSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const fetchWallet = createAsyncThunk(
  'wallet/fetchWallet',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/wallet`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch wallet');
    }
  }
);

export const deposit = createAsyncThunk(
  'wallet/deposit',
  async ({ amount, phone }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(
        `${API_URL}/wallet/deposit`,
        { amount, phone },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Deposit failed');
    }
  }
);

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
    updateBalance: (state, action) => {
      state.balance = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.balance = action.payload.balance;
        state.frozenBalance = action.payload.frozenBalance;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deposit.fulfilled, (state, action) => {
        state.balance = action.payload.balance;
      });
  },
});

export const { updateBalance } = walletSlice.actions;
export default walletSlice.reducer;
