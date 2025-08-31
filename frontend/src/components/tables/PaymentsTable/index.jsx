import React from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Dropdown, 
  Space, 
  Typography, 
  Progress 
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { formatCurrency, formatDate } from '../../../utils/formatters';
import { usePermissions } from '../../../hooks/usePermissions';

const { Text } = Typography;

const PaymentsTable = ({
  dataSource = [],
  loading = false,
  pagination = {},
  onChange,
  onEdit,
  onDelete,
  onView,
  onDownload
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const getPaymentStatusColor = (status) => {
    const colors = {
      completed: 'success',
      pending: 'processing',
      failed: 'error',
      cancelled: 'default',
      partial: 'warning'
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusIcon = (status) => {
    const icons = {
      completed: <CheckCircleOutlined />,
      pending: <ClockCircleOutlined />,
      failed: <ExclamationCircleOutlined />,
      cancelled: <DeleteOutlined />,
      partial: <ClockCircleOutlined />
    };
    return icons[status];
  };

  const getActionItems = (record) => {
    const items = [
      {
        key: 'view',
        label: t('view'),
        icon: <EyeOutlined />,
        onClick: () => onView ? onView(record) : navigate(`/payments/${record.id}`)
      }
    ];

    if (hasPermission('edit_payment') && ['pending', 'partial'].includes(record.status)) {
      items.push({
        key: 'edit',
        label: t('edit'),
        icon: <EditOutlined />,
        onClick: () => onEdit?.(record)
      });
    }

    items.push({
      key: 'download',
      label: t('download'),
      icon: <DownloadOutlined />,
      onClick: () => onDownload?.(record)
    });

    if (hasPermission('delete_payment') && record.status === 'pending') {
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
      title: t('payment.id'),
      dataIndex: 'paymentId',
      key: 'paymentId',
      width: 150,
      fixed: 'left',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/payments/${record.id}`)}
          style={{ padding: 0, height: 'auto' }}
        >
          <Text code>{text}</Text>
        </Button>
      ),
    },
    {
      title: t('payment.invoice'),
      dataIndex: ['invoice', 'invoiceNumber'],
      key: 'invoice',
      width: 150,
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/invoices/${record.invoice?.id}`)}
          style={{ padding: 0, height: 'auto' }}
        >
          <Text code>{text}</Text>
        </Button>
      ),
    },
    {
      title: t('payment.customer'),
      dataIndex: ['customer', 'name'],
      key: 'customer',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.customer?.name}</div>
          {record.customer?.nameAr && (
            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              direction: 'rtl' 
            }}>
              {record.customer.nameAr}
            </div>
          )}
        </div>
      ),
    },
    {
      title: t('payment.amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (amount, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {formatCurrency(amount, record.currency)}
          </div>
          {record.invoiceAmount && record.invoiceAmount !== amount && (
            <Progress 
              percent={Math.round((amount / record.invoiceAmount) * 100)}
              size="small"
              status="active"
              style={{ marginTop: 4 }}
            />
          )}
        </div>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: t('payment.method'),
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120,
      render: (method) => {
        const methodMap = {
          cash: { text: t('payment.cash'), color: 'green' },
          bank_transfer: { text: t('payment.bankTransfer'), color: 'blue' },
          credit_card: { text: t('payment.creditCard'), color: 'purple' },
          cheque: { text: t('payment.cheque'), color: 'orange' }
        };
        
        const methodInfo = methodMap[method] || { text: method, color: 'default' };
        return <Tag color={methodInfo.color}>{methodInfo.text}</Tag>;
      },
      filters: [
        { text: t('payment.cash'), value: 'cash' },
        { text: t('payment.bankTransfer'), value: 'bank_transfer' },
        { text: t('payment.creditCard'), value: 'credit_card' },
        { text: t('payment.cheque'), value: 'cheque' },
      ],
    },
    {
      title: t('payment.date'),
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 120,
      render: (date, record) => (
        <div>
          <div>{formatDate(date, { format: 'DD/MM/YYYY' })}</div>
          {record.paymentDateHijri && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.paymentDateHijri}
            </div>
          )}
        </div>
      ),
      sorter: (a, b) => new Date(a.paymentDate) - new Date(b.paymentDate),
    },
    {
      title: t('payment.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag 
          color={getPaymentStatusColor(status)} 
          icon={getPaymentStatusIcon(status)}
        >
          {t(`payment.status.${status}`)}
        </Tag>
      ),
      filters: [
        { text: t('payment.status.completed'), value: 'completed' },
        { text: t('payment.status.pending'), value: 'pending' },
        { text: t('payment.status.failed'), value: 'failed' },
        { text: t('payment.status.cancelled'), value: 'cancelled' },
        { text: t('payment.status.partial'), value: 'partial' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: t('payment.reference'),
      dataIndex: 'reference',
      key: 'reference',
      width: 150,
      render: (text) => text ? <Text code>{text}</Text> : '—',
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
      className="payments-table"
      rowClassName={(record) => {
        if (record.status === 'failed') return 'row-error';
        if (record.status === 'completed') return 'row-success';
        return '';
      }}
      summary={(data) => {
        if (data.length === 0) return null;
        
        const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
        const completedAmount = data
          .filter(item => item.status === 'completed')
          .reduce((sum, item) => sum + item.amount, 0);
        
        return (
          <Table.Summary.Row style={{ background: '#fafafa' }}>
            <Table.Summary.Cell index={0} colSpan={3}>
              <Text strong>{t('total')}</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1}>
              <div style={{ textAlign: 'right' }}>
                <div><Text strong>{formatCurrency(totalAmount, 'OMR')}</Text></div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {t('payment.completed')}: {formatCurrency(completedAmount, 'OMR')}
                </div>
              </div>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} colSpan={4} />
          </Table.Summary.Row>
        );
      }}
    />
  );
};

export default PaymentsTable;