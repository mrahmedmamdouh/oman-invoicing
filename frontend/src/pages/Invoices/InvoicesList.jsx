import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Select, 
  DatePicker, 
  Row, 
  Col,
  Typography,
  Tooltip,
  Dropdown
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EyeOutlined, 
  EditOutlined,
  SendOutlined,
  DownloadOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { 
  fetchInvoices, 
  selectInvoices, 
  selectInvoicesLoading,
  selectInvoicesPagination,
  setPagination
} from '../../store/slices/invoicesSlice';
import { formatCurrency, formatDate } from '../../utils/formatters';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const InvoicesList = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: null
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const invoices = useSelector(selectInvoices);
  const loading = useSelector(selectInvoicesLoading);
  const pagination = useSelector(selectInvoicesPagination);

  useEffect(() => {
    fetchInvoicesData();
  }, [dispatch, pagination.current, pagination.pageSize]);

  const fetchInvoicesData = () => {
    dispatch(fetchInvoices({
      page: pagination.current,
      limit: pagination.pageSize,
      ...filters
    }));
  };

  const handleSearch = () => {
    dispatch(setPagination({ current: 1 }));
    fetchInvoicesData();
  };

  const handleTableChange = (newPagination) => {
    dispatch(setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));
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

  const getActionItems = (record) => [
    {
      key: 'view',
      label: t('view'),
      icon: <EyeOutlined />,
      onClick: () => navigate(`/invoices/${record.id}`)
    },
    {
      key: 'edit',
      label: t('edit'),
      icon: <EditOutlined />,
      onClick: () => navigate(`/invoices/${record.id}/edit`),
      disabled: ['sent', 'paid'].includes(record.status)
    },
    {
      key: 'send',
      label: t('send'),
      icon: <SendOutlined />,
      onClick: () => handleSendInvoice(record.id),
      disabled: record.status !== 'draft'
    },
    {
      key: 'download',
      label: t('download'),
      icon: <DownloadOutlined />,
      onClick: () => handleDownloadInvoice(record.id)
    }
  ];

  const handleSendInvoice = (id) => {
    // Implement send invoice logic
    console.log('Send invoice:', id);
  };

  const handleDownloadInvoice = (id) => {
    // Implement download logic
    console.log('Download invoice:', id);
  };

  const columns = [
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
      ),
    },
    {
      title: t('invoice.customer'),
      dataIndex: ['customer', 'name'],
      key: 'customer',
      render: (text, record) => (
        <div>
          <div>{record.customer?.name}</div>
          <div style={{ fontSize: '12px', color: '#666', direction: 'rtl' }}>
            {record.customer?.nameAr}
          </div>
        </div>
      ),
    },
    {
      title: t('invoice.date'),
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date, record) => (
        <div>
          <div>{formatDate(date)}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.issueDateHijri}
          </div>
        </div>
      ),
    },
    {
      title: t('invoice.dueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date, record) => (
        <div>
          <div>{formatDate(date)}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.dueDateHijri}
          </div>
        </div>
      ),
    },
    {
      title: t('invoice.amount'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount, record) => formatCurrency(amount, record.currency),
      align: 'right',
    },
    {
      title: t('invoice.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {t(`status.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (text, record) => (
        <Dropdown
          menu={{ items: getActionItems(record) }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="invoices-list">
      <Card>
        <div className="page-header">
          <Title level={2}>{t('invoices')}</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/invoices/create')}
          >
            {t('invoice.create')}
          </Button>
        </div>

        <div className="filters-section">
          <Row gutter={16} align="middle">
            <Col xs={24} md={8}>
              <Input
                placeholder={t('search.placeholder', 'البحث في الفواتير...')}
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onPressEnter={handleSearch}
              />
            </Col>
            
            <Col xs={24} md={4}>
              <Select
                placeholder={t('invoice.status')}
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="draft">{t('status.draft')}</Option>
                <Option value="sent">{t('status.sent')}</Option>
                <Option value="paid">{t('status.paid')}</Option>
                <Option value="overdue">{t('status.overdue')}</Option>
                <Option value="cancelled">{t('status.cancelled')}</Option>
              </Select>
            </Col>
            
            <Col xs={24} md={6}>
              <RangePicker
                value={filters.dateRange}
                onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                style={{ width: '100%' }}
              />
            </Col>
            
            <Col xs={24} md={2}>
              <Button type="primary" onClick={handleSearch}>
                {t('search')}
              </Button>
            </Col>
          </Row>
        </div>

        <Table
          dataSource={invoices}
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
              }),
          }}
          onChange={handleTableChange}
          className="invoices-table"
        />
      </Card>
    </div>
  );
};

export default InvoicesList;