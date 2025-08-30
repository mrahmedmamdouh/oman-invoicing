import React from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Dropdown, 
  Space, 
  Tooltip, 
  Progress,
  Typography 
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  DownloadOutlined,
  CopyOutlined,
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

const InvoicesTable = ({
  dataSource = [],
  loading = false,
  pagination = {},
  onChange,
  onEdit,
  onDelete,
  onSend,
  onDownload,
  onDuplicate
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canFinalizeInvoices, hasPermission } = usePermissions();

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      sent: 'processing', 
      paid: 'success',
      overdue: 'error',
      cancelled: 'default',
      partially_paid: 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: <EditOutlined />,
      sent: <ClockCircleOutlined />,
      paid: <CheckCircleOutlined />,
      overdue: <ExclamationCircleOutlined />,
      cancelled: <DeleteOutlined />
    };
    return icons[status];
  };

  const getStatusText = (status) => {
    const statusMap = {
      draft: t('status.draft', 'مسودة'),
      sent: t('status.sent', 'مُرسل'),
      paid: t('status.paid', 'مدفوع'),
      overdue: t('status.overdue', 'متأخر'),
      cancelled: t('status.cancelled', 'ملغى'),
      partially_paid: t('status.partiallyPaid', 'مدفوع جزئياً')
    };
    return statusMap[status] || status;
  };

  const getPaymentProgress = (invoice) => {
    if (invoice.status === 'paid') return 100;
    if (invoice.status === 'partially_paid') {
      return Math.round((invoice.paidAmount / invoice.totalAmount) * 100);
    }
    return 0;
  };

  const getActionItems = (record) => {
    const items = [
      {
        key: 'view',
        label: t('view'),
        icon: <EyeOutlined />,
        onClick: () => navigate(`/invoices/${record.id}`)
      }
    ];

    if (hasPermission('edit_invoice') && record.status === 'draft') {
      items.push({
        key: 'edit',
        label: t('edit'),
        icon: <EditOutlined />,
        onClick: () => onEdit?.(record)
      });
    }

    if (canFinalizeInvoices() && record.status === 'draft') {
      items.push({
        key: 'send',
        label: t('send'),
        icon: <SendOutlined />,
        onClick: () => onSend?.(record)
      });
    }

    items.push(
      {
        key: 'download',
        label: t('download'),
        icon: <DownloadOutlined />,
        onClick: () => onDownload?.(record)
      },
      {
        key: 'duplicate',
        label: t('duplicate'),
        icon: <CopyOutlined />,
        onClick: () => onDuplicate?.(record)
      }
    );

    if (hasPermission('delete_invoice') && record.status === 'draft') {
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
      title: t('invoice.number'),
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 150,
      fixed: 'left',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/invoices/${record.id}`)}
          style={{ padding: 0, height: 'auto' }}
        >
          <Text code>{text}</Text>
        </Button>
      ),
    },
    {
      title: t('invoice.customer'),
      dataIndex: ['customer', 'name'],
      key: 'customer',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text, record) => (
        <Tooltip title={`${record.customer?.name} (${record.customer?.nameAr})`}>
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
        </Tooltip>
      ),
    },
    {
      title: t('invoice.date'),
      dataIndex: 'issueDate',
      key: 'issueDate',
      width: 120,
      render: (date, record) => (
        <div>
          <div>{formatDate(date, { format: 'DD/MM/YYYY' })}</div>
          {record.issueDateHijri && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.issueDateHijri}
            </div>
          )}
        </div>
      ),
      sorter: true,
    },
    {
      title: t('invoice.dueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date, record) => {
        const isOverdue = date && new Date(date) < new Date() && record.status === 'sent';
        return (
          <div>
            <div style={{ color: isOverdue ? '#ff4d4f' : undefined }}>
              {formatDate(date, { format: 'DD/MM/YYYY' })}
            </div>
            {record.dueDateHijri && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                {record.dueDateHijri}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: t('invoice.amount'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right',
      render: (amount, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {formatCurrency(amount, record.currency)}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {t('tax.vat')}: {formatCurrency(record.vatAmount, record.currency)}
          </div>
        </div>
      ),
      sorter: true,
    },
    {
      title: t('invoice.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status, record) => (
        <div>
          <Tag 
            color={getStatusColor(status)} 
            icon={getStatusIcon(status)}
          >
            {getStatusText(status)}
          </Tag>
          
          {status === 'partially_paid' && (
            <Progress 
              percent={getPaymentProgress(record)}
              size="small"
              status="active"
              style={{ marginTop: 4 }}
            />
          )}
        </div>
      ),
      filters: [
        { text: t('status.draft'), value: 'draft' },
        { text: t('status.sent'), value: 'sent' },
        { text: t('status.paid'), value: 'paid' },
        { text: t('status.overdue'), value: 'overdue' },
        { text: t('status.cancelled'), value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: t('compliance'),
      key: 'compliance',
      width: 100,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tooltip title={t('compliance.digitalSignature')}>
            <Tag 
              color={record.digitalSignature ? 'success' : 'default'} 
              size="small"
            >
              {record.digitalSignature ? '🔐' : '🔓'}
            </Tag>
          </Tooltip>
          
          {record.peppolId && (
            <Tooltip title={t('compliance.peppol')}>
              <Tag color="processing" size="small">PEPPOL</Tag>
            </Tooltip>
          )}
          
          {record.qrCode && (
            <Tooltip title={t('compliance.qrCode')}>
              <Tag color="success" size="small">QR</Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: t('invoice.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => formatDate(date, { format: 'DD/MM/YYYY' }),
      sorter: true,
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
      className="invoices-table"
      rowClassName={(record) => {
        if (record.status === 'overdue') return 'row-overdue';
        if (record.status === 'paid') return 'row-paid';
        return '';
      }}
      summary={(data) => {
        if (data.length === 0) return null;
        
        const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);
        const totalVAT = data.reduce((sum, item) => sum + item.vatAmount, 0);
        
        return (
          <Table.Summary.Row style={{ background: '#fafafa' }}>
            <Table.Summary.Cell index={0} colSpan={4}>
              <Text strong>{t('total')}</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1}>
              <div style={{ textAlign: 'right' }}>
                <div><Text strong>{formatCurrency(totalAmount, 'OMR')}</Text></div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {t('tax.vat')}: {formatCurrency(totalVAT, 'OMR')}
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

export default InvoicesTable;