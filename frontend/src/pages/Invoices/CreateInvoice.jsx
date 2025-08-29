import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Table, 
  Space, 
  Divider,
  Row, 
  Col, 
  InputNumber, 
  Typography,
  message 
} from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import moment from 'moment';
import momentHijri from 'moment-hijri';

import { createInvoice, selectInvoicesLoading } from '../../store/slices/invoicesSlice';
import { fetchCustomers, selectCustomers } from '../../store/slices/customersSlice';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const { Title, Text } = Typography;
const { Option } = Select;

const CreateInvoice = () => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([
    { 
      id: 1, 
      description: '', 
      descriptionAr: '', 
      quantity: 1, 
      unitPrice: 0, 
      total: 0,
      taxable: true 
    }
  ]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    vatAmount: 0,
    totalAmount: 0
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const loading = useSelector(selectInvoicesLoading);
  const customers = useSelector(selectCustomers);
  const vatRate = 0.05; // 5% VAT for Oman

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  useEffect(() => {
    calculateTotals();
  }, [items]);

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = subtotal * vatRate;
    const totalAmount = subtotal + vatAmount;

    setTotals({
      subtotal,
      vatAmount,
      totalAmount
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      descriptionAr: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      taxable: true
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const invoiceData = {
        ...values,
        issueDate: values.issueDate.toISOString(),
        dueDate: values.dueDate?.toISOString(),
        items: items.map(item => ({
          description: item.description,
          descriptionAr: item.descriptionAr,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxable: item.taxable
        }))
      };

      const result = await dispatch(createInvoice(invoiceData)).unwrap();
      
      message.success(t('success.invoiceCreated'));
      navigate(`/invoices/${result.id}`);
    } catch (error) {
      message.error(error.message || t('error.general'));
    }
  };

  const itemsTableColumns = [
    {
      title: t('invoice.item.description'),
      dataIndex: 'description',
      key: 'description',
      render: (text, record, index) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder={t('invoice.item.description')}
            value={record.description}
            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
          />
          <Input
            placeholder={t('invoice.item.descriptionAr', 'وصف البند')}
            value={record.descriptionAr}
            onChange={(e) => handleItemChange(index, 'descriptionAr', e.target.value)}
            style={{ direction: 'rtl' }}
          />
        </Space>
      ),
    },
    {
      title: t('invoice.item.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (text, record, index) => (
        <InputNumber
          min={0.01}
          step={0.01}
          value={record.quantity}
          onChange={(value) => handleItemChange(index, 'quantity', value || 0)}
        />
      ),
    },
    {
      title: t('invoice.item.unitPrice'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 150,
      render: (text, record, index) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.unitPrice}
          onChange={(value) => handleItemChange(index, 'unitPrice', value || 0)}
          formatter={(value) => formatCurrency(value, 'OMR')}
          parser={(value) => value.replace(/\D/g, '') / 100}
        />
      ),
    },
    {
      title: t('invoice.item.total'),
      dataIndex: 'total',
      key: 'total',
      width: 150,
      render: (text, record) => formatCurrency(record.total, 'OMR'),
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 80,
      render: (text, record, index) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(index)}
          disabled={items.length === 1}
        />
      ),
    },
  ];

  return (
    <div className="create-invoice">
      <Card>
        <Title level={2}>{t('invoice.create')}</Title>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            issueDate: dayjs(),
            dueDate: dayjs().add(30, 'days'),
            currency: 'OMR'
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="customerId"
                label={t('invoice.customer')}
                rules={[{ required: true, message: t('validation.customerRequired') }]}
              >
                <Select
                  placeholder={t('invoice.selectCustomer', 'اختر العميل')}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {customers.map(customer => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.nameAr})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={6}>
              <Form.Item
                name="issueDate"
                label={t('invoice.date')}
                rules={[{ required: true, message: t('validation.dateRequired') }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <div className="hijri-date">
                {t('hijri')}: {momentHijri().format('iYYYY/iM/iD')}
              </div>
            </Col>
            
            <Col xs={24} md={6}>
              <Form.Item
                name="dueDate"
                label={t('invoice.dueDate')}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">{t('invoice.items')}</Divider>
          
          <Table
            dataSource={items}
            columns={itemsTableColumns}
            pagination={false}
            rowKey="id"
            className="items-table"
          />
          
          <Button
            type="dashed"
            onClick={addItem}
            icon={<PlusOutlined />}
            style={{ width: '100%', marginTop: 16 }}
          >
            {t('invoice.addItem')}
          </Button>

          <Divider />

          <Row justify="end">
            <Col xs={24} md={8}>
              <div className="totals-section">
                <Row justify="space-between" className="total-row">
                  <Col>{t('invoice.subtotal')}:</Col>
                  <Col><Text strong>{formatCurrency(totals.subtotal, 'OMR')}</Text></Col>
                </Row>
                
                <Row justify="space-between" className="total-row">
                  <Col>{t('tax.vat')} (5%):</Col>
                  <Col><Text>{formatCurrency(totals.vatAmount, 'OMR')}</Text></Col>
                </Row>
                
                <Divider style={{ margin: '8px 0' }} />
                
                <Row justify="space-between" className="total-row">
                  <Col><Text strong>{t('invoice.total')}:</Text></Col>
                  <Col>
                    <Text strong style={{ fontSize: '18px', color: '#C8102E' }}>
                      {formatCurrency(totals.totalAmount, 'OMR')}
                    </Text>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          <Divider />

          <Row justify="end" gutter={16}>
            <Col>
              <Button onClick={() => navigate('/invoices')}>
                {t('cancel')}
              </Button>
            </Col>
            <Col>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                {t('save')}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default CreateInvoice;
