import React, { useEffect, useState } from 'react';
import {
  Card,
  Descriptions,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Tabs
} from 'antd';
import {
  EditOutlined,
  FileTextOutlined,
  DollarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import {
  fetchCustomerById,
  selectCurrentCustomer,
  selectCustomersLoading
} from '../../store/slices/customersSlice';
import { fetchInvoices } from '../../store/slices/invoicesSlice';
import { formatCurrency, formatDate } from '../../utils/formatters';

const { Title, Text } = Typography;

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  const customer = useSelector(selectCurrentCustomer);
  const loading = useSelector(selectCustomersLoading);
  
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchCustomerById(id));
      loadCustomerInvoices();
    }
  }, [dispatch, id]);

  const loadCustomerInvoices = async () => {
    setInvoicesLoading(true);
    try {
      // This would be a filtered call to get invoices for this customer
      const response = await dispatch(fetchInvoices({ customerId: id })).unwrap();
      setCustomerInvoices(response.data || []);
    } catch (error) {
      console.error('Failed to load customer invoices:', error);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      sent: 'processing',
      paid: 'success',
      overdue: 'error',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  };

  const invoiceColumns = [
    {
      title: t('invoice.number'),
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/invoices/${record.id}`)}
        >
          {text}
        </Button>
      )
    },
    {
      title: t('invoice.date'),
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date) => formatDate(date)
    },
    {
      title: t('invoice.dueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => formatDate(date)
    },
    {
      title: t('invoice.amount'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => formatCurrency(amount, customer?.currency || 'OMR'),
      align: 'right'
    },
    {
      title: t('invoice.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {t(`status.${status}`)}
        </Tag>
      )
    }
  ];

  if (loading || !customer) {
    return <Card loading={loading} />;
  }

  // Calculate customer statistics
  const totalInvoices = customerInvoices.length;
  const totalAmount = customerInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const paidInvoices = customerInvoices.filter(invoice => invoice.status === 'paid').length;
  const overdueInvoices = customerInvoices.filter(invoice => 
    invoice.status === 'sent' && new Date(invoice.dueDate) < new Date()
  ).length;

  const tabItems = [
    {
      key: '1',
      label: t('customer.details'),
      children: (
        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Descriptions title={t('customer.basicInfo')} bordered>
              <Descriptions.Item label={t('customer.name')} span={3}>
                <div>
                  <div>{customer.name}</div>
                  {customer.nameAr && (
                    <div style={{ fontSize: '12px', color: '#666', direction: 'rtl' }}>
                      {customer.nameAr}
                    </div>
                  )}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label={t('customer.type')}>
                <Tag color={customer.customerType === 'business' ? 'blue' : 'green'}>
                  {customer.customerType === 'business' ? t('customer.business') : t('customer.individual')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('customer.status')}>
                <Tag color={customer.isActive ? 'success' : 'default'}>
                  {customer.isActive ? t('active') : t('inactive')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('customer.email')}>
                {customer.email}
              </Descriptions.Item>
              <Descriptions.Item label={t('customer.phone')}>
                {customer.phone}
              </Descriptions.Item>
              <Descriptions.Item label={t('customer.createdAt')}>
                {formatDate(customer.createdAt)}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          
          <Col xs={24} lg={12}>
            {customer.customerType === 'business' && (
              <Descriptions title={t('customer.businessInfo')} bordered style={{ marginBottom: 16 }}>
                <Descriptions.Item label={t('customer.taxNumber')} span={3}>
                  {customer.taxRegistrationNumber || '—'}
                </Descriptions.Item>
                <Descriptions.Item label={t('customer.commercialNumber')} span={3}>
                  {customer.commercialRegistrationNumber || '—'}
                </Descriptions.Item>
                <Descriptions.Item label={t('customer.peppolId')} span={3}>
                  {customer.peppolId || '—'}
                </Descriptions.Item>
              </Descriptions>
            )}
            
            <Descriptions title={t('customer.address')} bordered>
              <Descriptions.Item label={t('customer.street')} span={3}>
                {customer.address?.street || '—'}
              </Descriptions.Item>
              <Descriptions.Item label={t('customer.city')}>
                {customer.address?.city || '—'}
              </Descriptions.Item>
              <Descriptions.Item label={t('customer.governorate')}>
                {customer.address?.state || '—'}
              </Descriptions.Item>
              <Descriptions.Item label={t('customer.postalCode')}>
                {customer.address?.postalCode || '—'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      )
    },
    {
      key: '2',
      label: t('customer.invoices'),
      children: (
        <Table
          dataSource={customerInvoices}
          columns={invoiceColumns}
          rowKey="id"
          loading={invoicesLoading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              t('pagination.total', {
                start: range[0],
                end: range[1],
                total
              })
          }}
        />
      )
    }
  ];

  return (
    <div className="customer-detail">
      {/* Action Bar */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              {customer.name}
            </Title>
          </Col>
          
          <Col>
            <Space>
              <Button 
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/customers/${id}/edit`)}
              >
                {t('edit')}
              </Button>
              
              <Button 
                icon={<FileTextOutlined />}
                onClick={() => navigate('/invoices/create', { 
                  state: { selectedCustomer: customer } 
                })}
              >
                {t('invoice.create')}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={24} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('customer.totalInvoices')}
              value={totalInvoices}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('customer.totalAmount')}
              value={totalAmount}
              precision={3}
              prefix={<DollarOutlined />}
              suffix="OMR"
              valueStyle={{ color: '#C8102E' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('customer.paidInvoices')}
              value={paidInvoices}
              suffix={`/ ${totalInvoices}`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title={t('customer.overdueInvoices')}
              value={overdueInvoices}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: overdueInvoices > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Card>
    </div>
  );
};

export default CustomerDetail;
