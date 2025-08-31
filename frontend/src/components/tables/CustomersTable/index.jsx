// frontend/src/components/tables/CustomersTable/index.jsx
import React from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Dropdown, 
  Space, 
  Tooltip, 
  Typography,
  Avatar
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  BuildOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { formatDate, formatCurrency } from '../../../utils/formatters';
import { usePermissions } from '../../../hooks/usePermissions';

const { Text } = Typography;

const CustomersTable = ({
  dataSource = [],
  loading = false,
  pagination = {},
  onChange,
  onEdit,
  onDelete,
  onView
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canManageCustomers, hasPermission } = usePermissions();

  const getCustomerTypeIcon = (type) => {
    return type === 'business' ? <BuildOutlined /> : <UserOutlined />;
  };

  const getCustomerTypeColor = (type) => {
    return type === 'business' ? 'blue' : 'green';
  };

  const getActionItems = (record) => {
    const items = [
      {
        key: 'view',
        label: t('view'),
        icon: <EyeOutlined />,
        onClick: () => onView ? onView(record) : navigate(`/customers/${record.id}`)
      }
    ];

    if (hasPermission('edit_customer') || canManageCustomers()) {
      items.push({
        key: 'edit',
        label: t('edit'),
        icon: <EditOutlined />,
        onClick: () => onEdit ? onEdit(record) : navigate(`/customers/${record.id}/edit`)
      });
    }

    items.push({
      key: 'invoices',
      label: t('customer.invoices'),
      onClick: () => navigate(`/invoices?customerId=${record.id}`)
    });

    if (hasPermission('delete_customer') || canManageCustomers()) {
      items.push(
        { type: 'divider' },
        {
          key: 'delete',
          label: t('delete'),
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => onDelete?.(record)
        }
      );
    }

    return items;
  };

  const columns = [
    {
      title: t('customer.name'),
      dataIndex: 'name',
      key: 'name',
      width: 250,
      fixed: 'left',
      render: (text, record) => (
        <Space>
          <Avatar 
            icon={getCustomerTypeIcon(record.customerType)}
            style={{ 
              backgroundColor: record.customerType === 'business' ? '#1890ff' : '#52c41a'
            }}
          />
          <div>
            <Button 
              type="link" 
              onClick={() => navigate(`/customers/${record.id}`)}
              style={{ padding: 0, height: 'auto', fontWeight: 500 }}
            >
              {text}
            </Button>
            {record.nameAr && (
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                direction: 'rtl' 
              }}>
                {record.nameAr}
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: t('customer.type'),
      dataIndex: 'customerType',
      key: 'customerType',
      width: 120,
      render: (type) => (
        <Tag 
          color={getCustomerTypeColor(type)}
          icon={getCustomerTypeIcon(type)}
        >
          {type === 'business' ? t('customer.business') : t('customer.individual')}
        </Tag>
      ),
      filters: [
        { text: t('customer.business'), value: 'business' },
        { text: t('customer.individual'), value: 'individual' },
      ],
      onFilter: (value, record) => record.customerType === value,
    },
    {
      title: t('customer.contact'),
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '14px' }}>{record.email}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.phone}
          </div>
        </div>
      ),
    },
    {
      title: t('customer.taxNumber'),
      dataIndex: 'taxRegistrationNumber',
      key: 'taxRegistrationNumber',
      width: 150,
      render: (text, record) => {
        if (!text && record.customerType === 'business') {
          return <Text type="warning">—</Text>;
        }
        return text ? <Text code>{text}</Text> : '—';
      },
    },
    {
      title: t('customer.address'),
      key: 'address',
      width: 180,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const address = record.address;
        if (!address || (!address.city && !address.state)) {
          return '—';
        }
        
        const fullAddress = [address.city, address.state].filter(Boolean).join(', ');
        return (
          <Tooltip title={`${address.street || ''} ${fullAddress}`}>
            <Text ellipsis>{fullAddress}</Text>
          </Tooltip>
        );
      },
    },
    {
      title: t('customer.paymentTerms'),
      dataIndex: 'paymentTerms',
      key: 'paymentTerms',
      width: 120,
      render: (days) => `${days || 30} ${t('days')}`,
      sorter: (a, b) => (a.paymentTerms || 30) - (b.paymentTerms || 30),
    },
    {
      title: t('customer.creditLimit'),
      dataIndex: 'creditLimit',
      key: 'creditLimit',
      width: 120,
      align: 'right',
      render: (amount) => amount ? formatCurrency(amount, 'OMR') : '—',
      sorter: (a, b) => (a.creditLimit || 0) - (b.creditLimit || 0),
    },
    {
      title: t('customer.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag 
          color={isActive ? 'success' : 'default'}
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {isActive ? t('active') : t('inactive')}
        </Tag>
      ),
      filters: [
        { text: t('active'), value: true },
        { text: t('inactive'), value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: t('customer.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => formatDate(date, { format: 'DD/MM/YYYY' }),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />}
            onClick={(e) => e.preventDefault()}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey="id"
      loading={loading}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          t('pagination.total', {
            start: range[0],
            end: range[1],
            total
          }),
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      onChange={onChange}
      scroll={{ x: 1200 }}
      size="small"
      className="customers-table"
      rowClassName={(record) => {
        if (!record.isActive) return 'row-inactive';
        if (record.customerType === 'business' && !record.taxRegistrationNumber) return 'row-warning';
        return '';
      }}
      summary={(data) => {
        if (data.length === 0) return null;
        
        const totalCreditLimit = data.reduce((sum, item) => sum + (item.creditLimit || 0), 0);
        const activeCount = data.filter(item => item.isActive).length;
        const businessCount = data.filter(item => item.customerType === 'business').length;
        
        return (
          <Table.Summary.Row style={{ background: '#fafafa' }}>
            <Table.Summary.Cell index={0} colSpan={2}>
              <Text strong>{t('summary')}</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1}>
              <Text type="secondary">{activeCount} {t('active')}</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2}>
              <Text type="secondary">{businessCount} {t('customer.business')}</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3} colSpan={2} />
            <Table.Summary.Cell index={4}>
              <div style={{ textAlign: 'right' }}>
                <Text strong>{formatCurrency(totalCreditLimit, 'OMR')}</Text>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {t('customer.totalCreditLimit')}
                </div>
              </div>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={5} colSpan={3} />
          </Table.Summary.Row>
        );
      }}
    />
  );
};

export default CustomersTable;
