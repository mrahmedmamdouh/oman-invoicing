import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Row,
  Col,
  Space,
  Tag,
  Typography,
  Dropdown,
  Modal
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  fetchCustomers,
  deleteCustomer,
  selectCustomers,
  selectCustomersLoading,
  selectCustomersPagination,
  setPagination
} from '../../store/slices/customersSlice';
import { formatDate } from '../../utils/formatters';
import { CUSTOMER_TYPES } from '../../utils/constants';

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const CustomersList = () => {
  const [filters, setFilters] = useState({
    search: '',
    customerType: '',
    isActive: true
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const customers = useSelector(selectCustomers);
  const loading = useSelector(selectCustomersLoading);
  const pagination = useSelector(selectCustomersPagination);

  useEffect(() => {
    fetchCustomersData();
  }, [dispatch, pagination.current, pagination.pageSize]);

  const fetchCustomersData = () => {
    dispatch(fetchCustomers({
      page: pagination.current,
      limit: pagination.pageSize,
      ...filters
    }));
  };

  const handleSearch = () => {
    dispatch(setPagination({ current: 1 }));
    fetchCustomersData();
  };

  const handleTableChange = (newPagination) => {
    dispatch(setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));
  };

  const handleDelete = (id, name) => {
    confirm({
      title: t('customer.confirmDelete'),
      content: t('customer.deleteWarning', { name }),
      okText: t('yes'),
      cancelText: t('no'),
      okType: 'danger',
      onOk: async () => {
        try {
          await dispatch(deleteCustomer(id)).unwrap();
          message.success(t('success.customerDeleted'));
        } catch (error) {
          message.error(error.message || t('error.general'));
        }
      }
    });
  };

  const getActionItems = (record) => [
    {
      key: 'view',
      label: t('view'),
      icon: <EyeOutlined />,
      onClick: () => navigate(`/customers/${record.id}`)
    },
    {
      key: 'edit',
      label: t('edit'),
      icon: <EditOutlined />,
      onClick: () => navigate(`/customers/${record.id}/edit`)
    },
    {
      key: 'invoices',
      label: t('customer.invoices'),
      onClick: () => navigate(`/invoices?customerId=${record.id}`)
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      label: t('delete'),
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(record.id, record.name)
    }
  ];

  const columns = [
    {
      title: t('customer.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Button 
            type="link" 
            onClick={() => navigate(`/customers/${record.id}`)}
            style={{ padding: 0, height: 'auto' }}
          >
            {text}
          </Button>
          {record.nameAr && (
            <div style={{ fontSize: '12px', color: '#666', direction: 'rtl' }}>
              {record.nameAr}
            </div>
          )}
        </div>
      )
    },
    {
      title: t('customer.type'),
      dataIndex: 'customerType',
      key: 'customerType',
      render: (type) => (
        <Tag color={type === 'business' ? 'blue' : 'green'}>
          {type === 'business' ? t('customer.business') : t('customer.individual')}
        </Tag>
      )
    },
    {
      title: t('customer.contact'),
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>{record.email}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.phone}
          </div>
        </div>
      )
    },
    {
      title: t('customer.taxNumber'),
      dataIndex: 'taxRegistrationNumber',
      key: 'taxRegistrationNumber',
      render: (text) => text || '—'
    },
    {
      title: t('customer.paymentTerms'),
      dataIndex: 'paymentTerms',
      key: 'paymentTerms',
      render: (days) => `${days} ${t('days')}`
    },
    {
      title: t('customer.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? t('active') : t('inactive')}
        </Tag>
      )
    },
    {
      title: t('customer.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date)
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionItems(record) }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  return (
    <div className="customers-list">
      <Card>
        <div className="page-header">
          <Title level={2}>{t('customers')}</Title>
          <Space>
            <Button 
              icon={<ExportOutlined />}
              onClick={() => {/* Handle export */}}
            >
              {t('export')}
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/customers/create')}
            >
              {t('customer.create')}
            </Button>
          </Space>
        </div>

        <div className="filters-section">
          <Row gutter={16} align="middle">
            <Col xs={24} md={8}>
              <Input
                placeholder={t('search.customers', 'البحث في العملاء...')}
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onPressEnter={handleSearch}
              />
            </Col>

            <Col xs={24} md={4}>
              <Select
                placeholder={t('customer.type')}
                value={filters.customerType}
                onChange={(value) => setFilters({ ...filters, customerType: value })}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="individual">{t('customer.individual')}</Option>
                <Option value="business">{t('customer.business')}</Option>
              </Select>
            </Col>

            <Col xs={24} md={4}>
              <Select
                placeholder={t('status')}
                value={filters.isActive}
                onChange={(value) => setFilters({ ...filters, isActive: value })}
                style={{ width: '100%' }}
              >
                <Option value={true}>{t('active')}</Option>
                <Option value={false}>{t('inactive')}</Option>
                <Option value="">{t('all')}</Option>
              </Select>
            </Col>

            <Col xs={24} md={2}>
              <Button type="primary" onClick={handleSearch}>
                {t('search')}
              </Button>
            </Col>
          </Row>
        </div>

        <Table
          dataSource={customers}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              t('pagination.total', {
                start: range[0],
                end: range[1],
                total
              })
          }}
          onChange={handleTableChange}
          className="customers-table"
        />
      </Card>
    </div>
  );
};

export default CustomersList;
