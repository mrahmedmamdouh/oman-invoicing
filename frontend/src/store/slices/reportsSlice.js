import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reportsService from '../../services/reports';

// Async thunks
export const fetchSalesReport = createAsyncThunk(
  'reports/fetchSalesReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportsService.getSalesReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales report');
    }
  }
);

export const fetchTaxReport = createAsyncThunk(
  'reports/fetchTaxReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportsService.getTaxReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tax report');
    }
  }
);

export const fetchComplianceReport = createAsyncThunk(
  'reports/fetchComplianceReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportsService.getComplianceReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch compliance report');
    }
  }
);

export const exportReport = createAsyncThunk(
  'reports/exportReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportsService.exportReport(params);
      
      // Create download link
      const blob = new Blob([response.data], {
        type: params.format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${params.type}_report.${params.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export report');
    }
  }
);

const initialState = {
  salesReport: null,
  taxReport: null,
  complianceReport: null,
  loading: false,
  error: null
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReports: (state) => {
      state.salesReport = null;
      state.taxReport = null;
      state.complianceReport = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Sales report
      .addCase(fetchSalesReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.loading = false;
        state.salesReport = action.payload;
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Tax report
      .addCase(fetchTaxReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaxReport.fulfilled, (state, action) => {
        state.loading = false;
        state.taxReport = action.payload;
      })
      .addCase(fetchTaxReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Compliance report
      .addCase(fetchComplianceReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComplianceReport.fulfilled, (state, action) => {
        state.loading = false;
        state.complianceReport = action.payload;
      })
      .addCase(fetchComplianceReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Export report
      .addCase(exportReport.fulfilled, (state) => {
        // Export completed successfully
      })
      .addCase(exportReport.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearError, clearReports } = reportsSlice.actions;

// Selectors
export const selectSalesReport = (state) => state.reports.salesReport;
export const selectTaxReport = (state) => state.reports.taxReport;
export const selectComplianceReport = (state) => state.reports.complianceReport;
export const selectReportsLoading = (state) => state.reports.loading;
export const selectReportsError = (state) => state.reports.error;

export default reportsSlice.reducer;
