import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import taxService from '../../services/tax';

// Async thunks
export const fetchTaxConfiguration = createAsyncThunk(
  'tax/fetchConfiguration',
  async (_, { rejectWithValue }) => {
    try {
      const response = await taxService.getTaxConfiguration();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tax configuration');
    }
  }
);

export const updateTaxConfiguration = createAsyncThunk(
  'tax/updateConfiguration',
  async (configData, { rejectWithValue }) => {
    try {
      const response = await taxService.updateTaxConfiguration(configData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update tax configuration');
    }
  }
);

export const validateTaxNumber = createAsyncThunk(
  'tax/validateTaxNumber',
  async (data, { rejectWithValue }) => {
    try {
      const response = await taxService.validateTaxNumber(data.taxNumber);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Tax number validation failed');
    }
  }
);

export const submitVATReturn = createAsyncThunk(
  'tax/submitVATReturn',
  async (data, { rejectWithValue }) => {
    try {
      const response = await taxService.submitVATReturn(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'VAT return submission failed');
    }
  }
);

export const getTaxRates = createAsyncThunk(
  'tax/getTaxRates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await taxService.getCurrentTaxRates();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tax rates');
    }
  }
);

export const calculateTax = createAsyncThunk(
  'tax/calculateTax',
  async (invoiceData, { rejectWithValue }) => {
    try {
      const response = await taxService.calculateTax(invoiceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Tax calculation failed');
    }
  }
);

const initialState = {
  taxConfig: null,
  taxRates: {
    vatRate: 0.05,
    corporateTaxRate: 0.15,
    withholdingTaxRate: 0.10,
    exemptionThreshold: 38500
  },
  vatReturn: null,
  taxCalculation: null,
  validationResult: null,
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
      state.taxRates = initialState.taxRates;
      state.vatReturn = null;
      state.taxCalculation = null;
      state.validationResult = null;
    },
    clearValidationResult: (state) => {
      state.validationResult = null;
    },
    setTaxRates: (state, action) => {
      state.taxRates = { ...state.taxRates, ...action.payload };
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
        if (action.payload.rates) {
          state.taxRates = { ...state.taxRates, ...action.payload.rates };
        }
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
        if (action.payload.rates) {
          state.taxRates = { ...state.taxRates, ...action.payload.rates };
        }
      })
      .addCase(updateTaxConfiguration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Validate tax number
      .addCase(validateTaxNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationResult = null;
      })
      .addCase(validateTaxNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.validationResult = action.payload;
      })
      .addCase(validateTaxNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.validationResult = { isValid: false, error: action.payload };
      })
      // Submit VAT return
      .addCase(submitVATReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitVATReturn.fulfilled, (state, action) => {
        state.loading = false;
        state.vatReturn = action.payload;
      })
      .addCase(submitVATReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get tax rates
      .addCase(getTaxRates.fulfilled, (state, action) => {
        state.taxRates = { ...state.taxRates, ...action.payload };
      })
      // Calculate tax
      .addCase(calculateTax.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateTax.fulfilled, (state, action) => {
        state.loading = false;
        state.taxCalculation = action.payload;
      })
      .addCase(calculateTax.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearError, 
  clearTaxData, 
  clearValidationResult, 
  setTaxRates 
} = taxSlice.actions;

// Selectors
export const selectTaxConfig = (state) => state.tax.taxConfig;
export const selectTaxRates = (state) => state.tax.taxRates;
export const selectVATReturn = (state) => state.tax.vatReturn;
export const selectTaxCalculation = (state) => state.tax.taxCalculation;
export const selectValidationResult = (state) => state.tax.validationResult;
export const selectTaxLoading = (state) => state.tax.loading;
export const selectTaxError = (state) => state.tax.error;

// Helper selectors
export const selectCurrentVATRate = (state) => state.tax.taxRates?.vatRate || 0.05;
export const selectCurrentCorporateTaxRate = (state) => state.tax.taxRates?.corporateTaxRate || 0.15;
export const selectExemptionThreshold = (state) => state.tax.taxRates?.exemptionThreshold || 38500;

export default taxSlice.reducer;