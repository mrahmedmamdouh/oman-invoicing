import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  fetchInvoices,
  fetchInvoiceById,
  createInvoice,
  updateInvoice,
  finalizeInvoice,
  selectInvoices,
  selectCurrentInvoice,
  selectInvoicesLoading,
  selectInvoicesError,
  selectInvoicesPagination,
  selectInvoicesStatistics,
  clearError,
  setPagination
} from '../store/slices/invoicesSlice';

export const useInvoices = () => {
  const dispatch = useDispatch();
  
  const invoices = useSelector(selectInvoices);
  const currentInvoice = useSelector(selectCurrentInvoice);
  const loading = useSelector(selectInvoicesLoading);
  const error = useSelector(selectInvoicesError);
  const pagination = useSelector(selectInvoicesPagination);
  const statistics = useSelector(selectInvoicesStatistics);

  const getInvoices = useCallback((params = {}) => {
    return dispatch(fetchInvoices(params));
  }, [dispatch]);

  const getInvoiceById = useCallback((id) => {
    return dispatch(fetchInvoiceById(id));
  }, [dispatch]);

  const createNewInvoice = useCallback((invoiceData) => {
    return dispatch(createInvoice(invoiceData));
  }, [dispatch]);

  const updateExistingInvoice = useCallback((id, data) => {
    return dispatch(updateInvoice({ id, data }));
  }, [dispatch]);

  const finalizeExistingInvoice = useCallback((id) => {
    return dispatch(finalizeInvoice(id));
  }, [dispatch]);

  const updatePagination = useCallback((newPagination) => {
    dispatch(setPagination(newPagination));
  }, [dispatch]);

  const clearInvoicesError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    invoices,
    currentInvoice,
    loading,
    error,
    pagination,
    statistics,
    getInvoices,
    getInvoiceById,
    createInvoice: createNewInvoice,
    updateInvoice: updateExistingInvoice,
    finalizeInvoice: finalizeExistingInvoice,
    updatePagination,
    clearError: clearInvoicesError,
  };
};
