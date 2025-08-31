import React, { useEffect } from 'react';
import { Card, Typography, message, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import InvoiceForm from '../../components/forms/InvoiceForm';
import {
  fetchInvoiceById,
  updateInvoice,
  selectCurrentInvoice,
  selectInvoicesLoading
} from '../../store/slices/invoicesSlice';
import { selectCustomers, fetchCustomers } from '../../store/slices/customersSlice';

const { Title } = Typography;

const EditInvoice = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const invoice = useSelector(selectCurrentInvoice);
  const loading = useSelector(selectInvoicesLoading);
  const customers = useSelector(selectCustomers);

  useEffect(() => {
    if (id) {
      dispatch(fetchInvoiceById(id));
    }
    dispatch(fetchCustomers());
  }, [dispatch, id]);

  const handleSubmit = async (invoiceData) => {
    try {
      await dispatch(updateInvoice({ id, data: invoiceData })).unwrap();
      
      message.success(t('success.invoiceUpdated'));
      navigate(`/invoices/${id}`);
    } catch (error) {
      message.error(error.message || t('error.general'));
    }
  };

  if (loading || !invoice) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  // Don't allow editing if invoice is not in draft status
  if (invoice.status !== 'draft') {
    return (
      <Card>
        <Title level={2}>{t('invoice.edit')}</Title>
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Title level={4} type="warning">
            {t('invoice.cannotEditNonDraft')}
          </Title>
        </div>
      </Card>
    );
  }

  return (
    <div className="edit-invoice">
      <Card>
        <Title level={2}>{t('invoice.edit')}</Title>
        
        <InvoiceForm 
          initialValues={{
            ...invoice,
            customerId: invoice.customer?.id,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
          }}
          customers={customers}
          onSubmit={handleSubmit}
          loading={loading}
          mode="edit"
        />
      </Card>
    </div>
  );
};

export default EditInvoice;
