import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  fetchCustomers,
  fetchCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  selectCustomers,
  selectSearchResults,
  selectCurrentCustomer,
  selectCustomersLoading,
  selectSearchLoading,
  selectCustomersError,
  selectCustomersPagination,
  clearError,
  clearCurrentCustomer,
  clearSearchResults,
  setPagination
} from '../store/slices/customersSlice';

export const useCustomers = () => {
  const dispatch = useDispatch();
  
  const customers = useSelector(selectCustomers);
  const searchResults = useSelector(selectSearchResults);
  const currentCustomer = useSelector(selectCurrentCustomer);
  const loading = useSelector(selectCustomersLoading);
  const searchLoading = useSelector(selectSearchLoading);
  const error = useSelector(selectCustomersError);
  const pagination = useSelector(selectCustomersPagination);

  const getCustomers = useCallback((params = {}) => {
    return dispatch(fetchCustomers(params));
  }, [dispatch]);

  const getCustomerById = useCallback((id) => {
    return dispatch(fetchCustomerById(id));
  }, [dispatch]);

  const createNewCustomer = useCallback((customerData) => {
    return dispatch(createCustomer(customerData));
  }, [dispatch]);

  const updateExistingCustomer = useCallback((id, data) => {
    return dispatch(updateCustomer({ id, data }));
  }, [dispatch]);

  const deleteExistingCustomer = useCallback((id) => {
    return dispatch(deleteCustomer(id));
  }, [dispatch]);

  const searchForCustomers = useCallback((query) => {
    return dispatch(searchCustomers(query));
  }, [dispatch]);

  const updatePagination = useCallback((newPagination) => {
    dispatch(setPagination(newPagination));
  }, [dispatch]);

  const clearCustomersError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentCustomer());
  }, [dispatch]);

  const clearSearch = useCallback(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  // Helper methods
  const getActiveCustomers = useCallback(() => {
    return customers.filter(customer => customer.isActive);
  }, [customers]);

  const getBusinessCustomers = useCallback(() => {
    return customers.filter(customer => customer.customerType === 'business');
  }, [customers]);

  const getIndividualCustomers = useCallback(() => {
    return customers.filter(customer => customer.customerType === 'individual');
  }, [customers]);

  const getCustomersByPaymentTerms = useCallback((days) => {
    return customers.filter(customer => customer.paymentTerms === days);
  }, [customers]);

  const getCustomersWithTaxNumbers = useCallback(() => {
    return customers.filter(customer => customer.taxRegistrationNumber);
  }, [customers]);

  const getCustomersWithPeppolIds = useCallback(() => {
    return customers.filter(customer => customer.peppolId);
  }, [customers]);

  const getCustomersByCity = useCallback((city) => {
    return customers.filter(customer => 
      customer.address?.city?.toLowerCase() === city.toLowerCase() ||
      customer.address?.cityAr?.includes(city)
    );
  }, [customers]);

  const getCustomersByState = useCallback((state) => {
    return customers.filter(customer => 
      customer.address?.state === state ||
      customer.address?.stateAr?.includes(state)
    );
  }, [customers]);

  const getTotalCreditLimit = useCallback(() => {
    return customers.reduce((total, customer) => total + (customer.creditLimit || 0), 0);
  }, [customers]);

  const getCustomersStats = useCallback(() => {
    const active = getActiveCustomers().length;
    const inactive = customers.length - active;
    const business = getBusinessCustomers().length;
    const individual = getIndividualCustomers().length;
    const withTaxNumbers = getCustomersWithTaxNumbers().length;
    const withPeppol = getCustomersWithPeppolIds().length;
    const totalCreditLimit = getTotalCreditLimit();

    return {
      total: customers.length,
      active,
      inactive,
      business,
      individual,
      withTaxNumbers,
      withPeppol,
      totalCreditLimit
    };
  }, [
    customers,
    getActiveCustomers,
    getBusinessCustomers,
    getIndividualCustomers,
    getCustomersWithTaxNumbers,
    getCustomersWithPeppolIds,
    getTotalCreditLimit
  ]);

  const findCustomerByEmail = useCallback((email) => {
    return customers.find(customer => 
      customer.email?.toLowerCase() === email.toLowerCase()
    );
  }, [customers]);

  const findCustomerByTaxNumber = useCallback((taxNumber) => {
    return customers.find(customer => 
      customer.taxRegistrationNumber === taxNumber
    );
  }, [customers]);

  const findCustomerByCommercialNumber = useCallback((commercialNumber) => {
    return customers.find(customer => 
      customer.commercialRegistrationNumber === commercialNumber
    );
  }, [customers]);

  const findCustomerByPeppolId = useCallback((peppolId) => {
    return customers.find(customer => 
      customer.peppolId === peppolId
    );
  }, [customers]);

  // Validation helpers
  const validateCustomerEmail = useCallback((email, excludeId = null) => {
    const existing = findCustomerByEmail(email);
    return !existing || existing.id === excludeId;
  }, [findCustomerByEmail]);

  const validateTaxNumber = useCallback((taxNumber, excludeId = null) => {
    const existing = findCustomerByTaxNumber(taxNumber);
    return !existing || existing.id === excludeId;
  }, [findCustomerByTaxNumber]);

  const validateCommercialNumber = useCallback((commercialNumber, excludeId = null) => {
    const existing = findCustomerByCommercialNumber(commercialNumber);
    return !existing || existing.id === excludeId;
  }, [findCustomerByCommercialNumber]);

  // Sorting helpers
  const sortCustomersByName = useCallback((ascending = true) => {
    return [...customers].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (ascending) {
        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
      } else {
        return nameA > nameB ? -1 : nameA < nameB ? 1 : 0;
      }
    });
  }, [customers]);

  const sortCustomersByDate = useCallback((field = 'createdAt', ascending = false) => {
    return [...customers].sort((a, b) => {
      const dateA = new Date(a[field]);
      const dateB = new Date(b[field]);
      if (ascending) {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }, [customers]);

  const sortCustomersByCreditLimit = useCallback((ascending = false) => {
    return [...customers].sort((a, b) => {
      const limitA = a.creditLimit || 0;
      const limitB = b.creditLimit || 0;
      if (ascending) {
        return limitA - limitB;
      } else {
        return limitB - limitA;
      }
    });
  }, [customers]);

  // Filter helpers
  const filterCustomersByDateRange = useCallback((startDate, endDate, field = 'createdAt') => {
    return customers.filter(customer => {
      const customerDate = new Date(customer[field]);
      return customerDate >= startDate && customerDate <= endDate;
    });
  }, [customers]);

  const filterCustomersByPaymentTermsRange = useCallback((minDays, maxDays) => {
    return customers.filter(customer => {
      const terms = customer.paymentTerms || 0;
      return terms >= minDays && terms <= maxDays;
    });
  }, [customers]);

  const filterCustomersByCreditLimitRange = useCallback((minLimit, maxLimit) => {
    return customers.filter(customer => {
      const limit = customer.creditLimit || 0;
      return limit >= minLimit && limit <= maxLimit;
    });
  }, [customers]);

  // Export helpers
  const getCustomersForExport = useCallback((format = 'csv') => {
    const exportData = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      nameAr: customer.nameAr,
      email: customer.email,
      phone: customer.phone,
      customerType: customer.customerType,
      taxRegistrationNumber: customer.taxRegistrationNumber,
      commercialRegistrationNumber: customer.commercialRegistrationNumber,
      peppolId: customer.peppolId,
      street: customer.address?.street,
      city: customer.address?.city,
      state: customer.address?.state,
      postalCode: customer.address?.postalCode,
      country: customer.address?.country,
      paymentTerms: customer.paymentTerms,
      creditLimit: customer.creditLimit,
      currency: customer.currency,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    }));

    if (format === 'csv') {
      // Convert to CSV format
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => 
            typeof row[header] === 'string' && row[header].includes(',') 
              ? `"${row[header]}"` 
              : row[header] || ''
          ).join(',')
        )
      ].join('\n');
      
      return csvContent;
    }

    return exportData;
  }, [customers]);

  // Auto-refresh functionality
  const enableAutoRefresh = useCallback((intervalMs = 30000) => {
    const interval = setInterval(() => {
      if (!loading) {
        dispatch(fetchCustomers({ 
          page: pagination.current, 
          limit: pagination.pageSize 
        }));
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [dispatch, loading, pagination]);

  return {
    // Data
    customers,
    searchResults,
    currentCustomer,
    loading,
    searchLoading,
    error,
    pagination,

    // Actions
    getCustomers,
    getCustomerById,
    createCustomer: createNewCustomer,
    updateCustomer: updateExistingCustomer,
    deleteCustomer: deleteExistingCustomer,
    searchCustomers: searchForCustomers,
    updatePagination,

    // Clear functions
    clearError: clearCustomersError,
    clearCurrentCustomer: clearCurrent,
    clearSearchResults: clearSearch,

    // Helper methods
    getActiveCustomers,
    getBusinessCustomers,
    getIndividualCustomers,
    getCustomersByPaymentTerms,
    getCustomersWithTaxNumbers,
    getCustomersWithPeppolIds,
    getCustomersByCity,
    getCustomersByState,
    getTotalCreditLimit,
    getCustomersStats,

    // Find methods
    findCustomerByEmail,
    findCustomerByTaxNumber,
    findCustomerByCommercialNumber,
    findCustomerByPeppolId,

    // Validation methods
    validateCustomerEmail,
    validateTaxNumber,
    validateCommercialNumber,

    // Sorting methods
    sortCustomersByName,
    sortCustomersByDate,
    sortCustomersByCreditLimit,

    // Filter methods
    filterCustomersByDateRange,
    filterCustomersByPaymentTermsRange,
    filterCustomersByCreditLimitRange,

    // Export methods
    getCustomersForExport,

    // Utility methods
    enableAutoRefresh
  };
};