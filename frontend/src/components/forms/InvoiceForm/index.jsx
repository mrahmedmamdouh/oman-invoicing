import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Table,
  Space,
  Row,
  Col,
  InputNumber,
  Typography,
  Switch,
  Divider,
  Card,
  Alert
} from 'antd';
import { PlusOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import momentHijri from 'moment-hijri';

import { formatCurrency, formatHijriDate } from '../../../utils/formatters';
import { UNITS_OF_MEASURE, CURRENCIES } from '../../../utils/constants';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const InvoiceForm = ({
  initialValues,
  customers = [],
  onSubmit,
  loading = false,
  mode = 'create' // 'create' or 'edit'
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [items, setItems] = useState([
    {
      id: 1,
      description: '',
      descriptionAr: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      taxable: true,
      unit: 'piece',
      vatRate: 0.05
    }
  ]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    vatAmount: 0,
    totalAmount: 0
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        issueDate: initialValues.issueDate ? dayjs(initialValues.issueDate) : dayjs(),
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : null
      });

      if (initialValues.items && initialValues.items.length > 0) {
        setItems(initialValues.items.map((item, index) => ({
          ...item,
          id: index + 1
        })));
      }

      if (initialValues.customerId) {
        const customer = customers.find(c => c.id === initialValues.customerId);
        setSelectedCustomer(customer);
      }
    }
  }, [initialValues, customers, form]);

  useEffect(() => {
    calculateTotals();
  }, [items]);

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const vatAmount = items.reduce((sum, item) => 
      sum + (item.taxable ? (item.total || 0) * (item.vatRate || 0.05) : 0), 0
    );
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

    // Recalculate total for the item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].unitPrice || 0);
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
      taxable: true,
      unit: 'piece',
      vatRate: 0.05
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleCustomerChange = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer);
    
    // Auto-fill payment terms if customer has them
    if (customer?.paymentTerms) {
      const dueDate = form.getFieldValue('issueDate')?.add(customer.paymentTerms, 'days');
      form.setFieldValue('dueDate', dueDate);
    }
  };

  const handleSubmit = (values) => {
    const formData = {
      ...values,
      items: items.map(item => ({
        description: item.description,
        descriptionAr: item.descriptionAr,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unit: item.unit,
        taxable: item.taxable,
        vatRate: item.vatRate
      })),
      subtotal: totals.subtotal,
      vatAmount: totals.vatAmount,
      totalAmount: totals.totalAmount
    };

    onSubmit(formData);
  };

  const itemColumns = [
    {
      title: t('invoice.item.description'),
      dataIndex: 'description',
      key: 'description',
      width: '25%',
      render: (_, record, index) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder={t('invoice.item.description')}
            value={record.description}
            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
          />
          <Input
            placeholder={t('invoice.item.descriptionAr', 'وصف البند بالعربية')}
            value={record.descriptionAr}
            onChange={(e) => handleItemChange(index, 'descriptionAr', e.target.value)}
            style={{ direction: 'rtl' }}
          />
        </Space>
      ),
    },
    {
      title: t('invoice.item.unit'),
      dataIndex: 'unit',
      key: 'unit',
      width: '12%',
      render: (_, record, index) => (
        <Select
          value={record.unit}
          onChange={(value) => handleItemChange(index, 'unit', value)}
          style={{ width: '100%' }}
        >
          {UNITS_OF_MEASURE.map(unit => (
            <Option key={unit.value} value={unit.value}>
              {unit.label_ar}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: t('invoice.item.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: '12%',
      render: (_, record, index) => (
        <InputNumber
          min={0.001}
          step={0.001}
          precision={3}
          value={record.quantity}
          onChange={(value) => handleItemChange(index, 'quantity', value || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: t('invoice.item.unitPrice'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '15%',
      render: (_, record, index) => (
        <InputNumber
          min={0}
          step={0.001}
          precision={3}
          value={record.unitPrice}
          onChange={(value) => handleItemChange(index, 'unitPrice', value || 0)}
          style={{ width: '100%' }}
          addonAfter="ر.ع"
        />
      ),
    },
    {
      title: t('tax.taxable'),
      dataIndex: 'taxable',
      key: 'taxable',
      width: '10%',
      render: (_, record, index) => (
        <Switch
          checked={record.taxable}
          onChange={(checked) => handleItemChange(index, 'taxable', checked)}
        />
      ),
    },
    {
      title: t('invoice.item.total'),
      dataIndex: 'total',
      key: 'total',
      width: '15%',
      render: (_, record) => (
        <Text strong>{formatCurrency(record.total, 'OMR')}</Text>
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      width: '8%',
      render: (_, record, index) => (
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
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        issueDate: dayjs(),
        currency: 'OMR',
        status: 'draft'
      }}
    >
      <Card title={t('invoice.basicInfo', 'المعلومات الأساسية')}>
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
                optionFilterProp="children"
                onChange={handleCustomerChange}
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

            {selectedCustomer && (
              <Alert
                message={
                  <div>
                    <div><strong>{t('customer.email')}:</strong> {selectedCustomer.email}</div>
                    <div><strong>{t('customer.phone')}:</strong> {selectedCustomer.phone}</div>
                    {selectedCustomer.taxRegistrationNumber && (
                      <div><strong>{t('customer.taxNumber')}:</strong> {selectedCustomer.taxRegistrationNumber}</div>
                    )}
                  </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
          </Col>

          <Col xs={24} md={6}>
            <Form.Item
              name="issueDate"
              label={t('invoice.date')}
              rules={[{ required: true, message: t('validation.dateRequired') }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                onChange={(date) => {
                  // Update Hijri date display
                  if (date) {
                    const hijriDate = formatHijriDate(date.toDate());
                    console.log('Hijri date:', hijriDate);
                  }
                }}
              />
            </Form.Item>
            <div className="hijri-date" style={{ fontSize: '12px', color: '#666', marginTop: -8, marginBottom: 16 }}>
              {t('hijri')}: {momentHijri().format('iYYYY/iM/iD')}
            </div>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item
              name="dueDate"
              label={t('invoice.dueDate')}
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Form.Item
              name="currency"
              label={t('invoice.currency')}
              rules={[{ required: true, message: t('validation.required') }]}
            >
              <Select>
                {Object.entries(CURRENCIES).map(([key, value]) => (
                  <Option key={key} value={value}>{value}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={16}>
            <Form.Item
              name="notes"
              label={t('invoice.notes', 'ملاحظات')}
            >
              <TextArea 
                rows={3} 
                placeholder={t('invoice.notesPlaceholder', 'ملاحظات إضافية...')}
                style={{ direction: 'rtl' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card 
        title={t('invoice.items')}
        extra={
          <Button 
            type="dashed" 
            icon={<PlusOutlined />} 
            onClick={addItem}
          >
            {t('invoice.addItem')}
          </Button>
        }
        style={{ marginTop: 24 }}
      >
        <Table
          dataSource={items}
          columns={itemColumns}
          pagination={false}
          rowKey="id"
          size="small"
          scroll={{ x: 800 }}
        />

        <Divider />

        <Row justify="end">
          <Col xs={24} md={8}>
            <div className="totals-section" style={{ 
              background: '#fafafa', 
              padding: 16, 
              borderRadius: 6,
              border: '1px solid #f0f0f0'
            }}>
              <Row justify="space-between" style={{ marginBottom: 8 }}>
                <Col><Text>{t('invoice.subtotal')}:</Text></Col>
                <Col><Text strong>{formatCurrency(totals.subtotal, 'OMR')}</Text></Col>
              </Row>

              <Row justify="space-between" style={{ marginBottom: 8 }}>
                <Col><Text>{t('tax.vat')} (5%):</Text></Col>
                <Col><Text>{formatCurrency(totals.vatAmount, 'OMR')}</Text></Col>
              </Row>

              <Divider style={{ margin: '8px 0' }} />

              <Row justify="space-between">
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
      </Card>

      <Divider />

      <Row justify="end" gutter={16}>
        <Col>
          <Button onClick={() => form.resetFields()}>
            {t('reset')}
          </Button>
        </Col>
        <Col>
          <Button 
            type="primary" 
            htmlType="submit"
            loading={loading}
          >
            {mode === 'create' ? t('create') : t('save')}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default InvoiceForm;
