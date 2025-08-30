import React from 'react';
import { Card, Typography, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import CustomerForm from '../../components/forms/CustomerForm';
import { createCustomer } from '../../store/slices/customersSlice';

const { Title } = Typography;

const CreateCustomer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (customerData) => {
    try {
      const result = await dispatch(createCustomer(customerData)).unwrap();
      
      message.success(t('success.customerCreated', 'تم إنشاء العميل بنجاح'));
      navigate(`/customers/${result.id}`);
    } catch (error) {
      message.error(error.message || t('error.general'));
    }
  };

  return (
    <div className="create-customer">
      <Card>
        <Title level={2}>{t('customer.create', 'إضافة عميل جديد')}</Title>
        
        <CustomerForm 
          onSubmit={handleSubmit}
          mode="create"
        />
      </Card>
    </div>
  );
};

export default CreateCustomer;
