import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import invoicesService from '../../services/invoices';

// Async thunks
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await invoicesService.getInvoices(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices');
    }
  }
);

export const fetchInvoiceById = createAsyncThunk(
  'invoices/fetchInvoiceById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await invoicesService.getInvoiceById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoice');
    }
  }
);

export const createInvoice = createAsyncThunk(
  'invoices/createInvoice',
  async (invoiceData, { rejectWithValue }) => {
    try {
      const response = await invoicesService.createInvoice(invoiceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create invoice');
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'invoices/updateInvoice',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await invoicesService.updateInvoice(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update invoice');
    }
  }
);

export const finalizeInvoice = createAsyncThunk(
  'invoices/finalizeInvoice',
  async (id, { rejectWithValue }) => {
    try {
      const response = await invoicesService.finalizeInvoice(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to finalize invoice');
    }
  }
);

const initialState = {
  invoices: [],
  currentInvoice: null,
  statistics: {
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    overdueAmount: 0,
  },
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  loading: false,
  error: null,
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.data;
        state.pagination = action.payload.pagination;
        state.statistics = action.payload.statistics;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch invoice by ID
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.currentInvoice = action.payload;
      })
      // Create invoice
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices.unshift(action.payload);
        state.currentInvoice = action.payload;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update invoice
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
        state.currentInvoice = action.payload;
      })
      // Finalize invoice
      .addCase(finalizeInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
        state.currentInvoice = action.payload;
      });
  },
});

export const { clearError, clearCurrentInvoice, setPagination } = invoicesSlice.actions;

// Selectors
export const selectInvoices = (state) => state.invoices.invoices;
export const selectCurrentInvoice = (state) => state.invoices.currentInvoice;
export const selectInvoicesLoading = (state) => state.invoices.loading;
export const selectInvoicesError = (state) => state.invoices.error;
export const selectInvoicesPagination = (state) => state.invoices.pagination;
export const selectInvoicesStatistics = (state) => state.invoices.statistics;

export default invoicesSlice.reducer;
