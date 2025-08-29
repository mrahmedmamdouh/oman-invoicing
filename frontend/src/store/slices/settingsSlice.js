import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchTaxConfiguration = createAsyncThunk(
  'tax/fetchConfiguration',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tax/config');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tax configuration');
    }
  }
);

export const updateTaxConfiguration = createAsyncThunk(
  'tax/updateConfiguration',
  async (configData, { rejectWithValue }) => {
    try {
      const response = await api.put('/tax/config', configData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update tax configuration');
    }
  }
);

export const validateTaxNumber = createAsyncThunk(
  'tax/validateTaxNumber',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/tax/validate-tax-number', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Tax number validation failed');
    }
  }
);

export const submitVATReturn = createAsyncThunk(
  'tax/submitVATReturn',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/tax/vat-return', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'VAT return submission failed');
    }
  }
);

export const getTaxRates = createAsyncThunk(
  'tax/getTaxRates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tax/rates');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tax rates');
    }
  }
);

const initialState = {
  taxConfig: null,
  taxRates: null,
  vatReturn: null,
  loading: false,
  error: null
};

const taxSlice = createSlice({
  name: 'tax',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTaxData: (state) => {
      state.taxConfig = null;
      state.taxRates = null;
      state.vatReturn = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch tax configuration
      .addCase(fetchTaxConfiguration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaxConfiguration.fulfilled, (state, action) => {
        state.loading = false;
        state.taxConfig = action.payload;
      })
      .addCase(fetchTaxConfiguration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update tax configuration
      .addCase(updateTaxConfiguration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaxConfiguration.fulfilled, (state, action) => {
        state.loading = false;
        state.taxConfig = action.payload;
      })
      .addCase(updateTaxConfiguration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Validate tax number
      .addCase(validateTaxNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateTaxNumber.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(validateTaxNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit VAT return
      .addCase(submitVATReturn.fulfilled, (state, action) => {
        state.vatReturn = action.payload;
      })
      // Get tax rates
      .addCase(getTaxRates.fulfilled, (state, action) => {
        state.taxRates = action.payload;
      });
  }
});

export const { clearError, clearTaxData } = taxSlice.actions;

// Selectors
export const selectTaxConfig = (state) => state.tax.taxConfig;
export const selectTaxRates = (state) => state.tax.taxRates;
export const selectVATReturn = (state) => state.tax.vatReturn;
export const selectTaxLoading = (state) => state.tax.loading;
export const selectTaxError = (state) => state.tax.error;

export default taxSlice.reducer;
