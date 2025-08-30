import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customersService from '../../services/customers';

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await customersService.getCustomers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await customersService.getCustomerById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await customersService.createCustomer(customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create customer');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await customersService.updateCustomer(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update customer');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (id, { rejectWithValue }) => {
    try {
      await customersService.deleteCustomer(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete customer');
    }
  }
);

export const searchCustomers = createAsyncThunk(
  'customers/searchCustomers',
  async (query, { rejectWithValue }) => {
    try {
      const response = await customersService.searchCustomers(query);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

const initialState = {
  customers: [],
  searchResults: [],
  currentCustomer: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0
  },
  loading: false,
  searchLoading: false,
  error: null
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch customer by ID
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.currentCustomer = action.payload;
      })
      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.unshift(action.payload);
        state.currentCustomer = action.payload;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update customer
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(customer => customer.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        state.currentCustomer = action.payload;
      })
      // Delete customer
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(customer => customer.id !== action.payload);
      })
      // Search customers
      .addCase(searchCustomers.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchCustomers.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchCustomers.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentCustomer, clearSearchResults, setPagination } = customersSlice.actions;

// Selectors
export const selectCustomers = (state) => state.customers.customers;
export const selectSearchResults = (state) => state.customers.searchResults;
export const selectCurrentCustomer = (state) => state.customers.currentCustomer;
export const selectCustomersLoading = (state) => state.customers.loading;
export const selectSearchLoading = (state) => state.customers.searchLoading;
export const selectCustomersError = (state) => state.customers.error;
export const selectCustomersPagination = (state) => state.customers.pagination;

export default customersSlice.reducer;
