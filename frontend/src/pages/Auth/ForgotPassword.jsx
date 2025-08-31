import React, { useEffect, useState } from 'react';
import { Card, Typography, message, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import CustomerForm from '../../components/forms/CustomerForm';
import {
  fetchCustomerById,
  updateCustomer,
  selectCurrentCustomer,
  selectCustomersLoading
} from '../../store/slices/customersSlice';

const { Title } = Typography;

const EditCustomer = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const customer = useSelector(selectCurrentCustomer);
  const loading = useSelector(selectCustomersLoading);

  useEffect(() => {
    if (id) {
      dispatch(fetchCustomerById(id));
    }
  }, [dispatch, id]);

  const handleSubmit = async (customerData) => {
    try {
      await dispatch(updateCustomer({ id, data: customerData })).unwrap();
      
      message.success(t('success.customerUpdated'));
      navigate(`/customers/${id}`);
    } catch (error) {
      message.error(error.message || t('error.general'));
    }
  };

  if (loading || !customer) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <div className="edit-customer">
      <Card>
        <Title level={2}>{t('customer.edit')}</Title>
        
        <CustomerForm 
          initialValues={customer}
          onSubmit={handleSubmit}
          loading={loading}
          mode="edit"
        />
      </Card>
    </div>
  );
};

export default EditCustomer;
