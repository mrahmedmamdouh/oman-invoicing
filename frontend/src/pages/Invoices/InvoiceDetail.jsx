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
  Divider,
  QRCode,
  Modal,
  message
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  SendOutlined,
  DownloadOutlined,
  PrinterOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import {
  fetchInvoiceById,
  selectCurrentInvoice,
  selectInvoicesLoading
} from '../../store/slices/invoicesSlice';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { downloadInvoicePDF, printInvoice } from '../../utils/pdf';

const { Title, Text, Paragraph } = Typography;

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  const invoice = useSelector(selectCurrentInvoice);
  const loading = useSelector(selectInvoicesLoading);
  
  const [qrModalVisible, setQrModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchInvoiceById(id));
    }
  }, [dispatch, id]);

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

  const handleEdit = () => {
    navigate(`/invoices/${id}/edit`);
  };

  const handleDownload = async () => {
    try {
      const element = document.getElementById('invoice-content');
      await downloadInvoicePDF(element, `invoice-${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      message.error(t('error.downloadFailed'));
    }
  };

  const handlePrint = () => {
    const element = document.getElementById('invoice-content');
    printInvoice(element);
  };

  const handleDuplicate = () => {
    navigate('/invoices/create', { 
      state: { duplicateFrom: invoice } 
    });
  };

  const itemColumns = [
    {
      title: t('invoice.item.description'),
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          {record.descriptionAr && (
            <div style={{ fontSize: '12px', color: '#666', direction: 'rtl' }}>
              {record.descriptionAr}
            </div>
          )}
        </div>
      )
    },
    {
      title: t('invoice.item.unit'),
      dataIndex: 'unit',
      key: 'unit',
      width: 80
    },
    {
      title: t('invoice.item.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
      render: (qty) => qty?.toFixed(3)
    },
    {
      title: t('invoice.item.unitPrice'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      align: 'right',
      render: (price) => formatCurrency(price, invoice?.currency || 'OMR')
    },
    {
      title: t('tax.taxable'),
      dataIndex: 'taxable',
      key: 'taxable',
      width: 80,
      align: 'center',
      render: (taxable) => (
        <Tag color={taxable ? 'success' : 'default'}>
          {taxable ? t('yes') : t('no')}
        </Tag>
      )
    },
    {
      title: t('invoice.item.total'),
      key: 'total',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <Text strong>
          {formatCurrency(record.quantity * record.unitPrice, invoice?.currency || 'OMR')}
        </Text>
      )
    }
  ];

  if (loading || !invoice) {
    return <Card loading={loading} />;
  }

  return (
    <div className="invoice-detail">
      {/* Action Bar */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button 
                icon={<EyeOutlined />}
                onClick={() => setQrModalVisible(true)}
              >
                {t('invoice.viewQR')}
              </Button>
              <Tag 
                color={getStatusColor(invoice.status)}
                style={{ marginLeft: 8 }}
              >
                {t(`status.${invoice.status}`)}
              </Tag>
            </Space>
          </Col>
          
          <Col>
            <Space>
              {invoice.status === 'draft' && (
                <>
                  <Button 
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                  >
                    {t('edit')}
                  </Button>
                  <Button 
                    type="primary"
                    icon={<SendOutlined />}
                  >
                    {t('send')}
                  </Button>
                </>
              )}
              
              <Button 
                icon={<DownloadOutlined />}
                onClick={handleDownload}
              >
                {t('download')}
              </Button>
              
              <Button 
                icon={<PrinterOutlined />}
                onClick={handlePrint}
              >
                {t('print')}
              </Button>
              
              <Button 
                icon={<CopyOutlined />}
                onClick={handleDuplicate}
              >
                {t('duplicate')}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Invoice Content */}
      <Card id="invoice-content">
        {/* Header */}
        <div className="invoice-header" style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#C8102E', marginBottom: 4 }}>
            {t('invoice.title')}
          </Title>
          <Text type="secondary">{t('invoice.subtitle')}</Text>
        </div>

        {/* Invoice Info */}
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
            <Descriptions title={t('invoice.details')} bordered size="small">
              <Descriptions.Item label={t('invoice.number')} span={3}>
                <Text code strong>{invoice.invoiceNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('invoice.date')}>
                {formatDate(invoice.issueDate)}
              </Descriptions.Item>
              <Descriptions.Item label={t('invoice.dueDate')}>
                {formatDate(invoice.dueDate)}
              </Descriptions.Item>
              <Descriptions.Item label={t('invoice.status')}>
                <Tag color={getStatusColor(invoice.status)}>
                  {t(`status.${invoice.status}`)}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Col>
          
          <Col xs={24} md={12}>
            <Descriptions title={t('customer.details')} bordered size="small">
              <Descriptions.Item label={t('customer.name')} span={3}>
                <div>
                  <div>{invoice.customer?.name}</div>
                  {invoice.customer?.nameAr && (
                    <div style={{ fontSize: '12px', color: '#666', direction: 'rtl' }}>
                      {invoice.customer.nameAr}
                    </div>
                  )}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label={t('customer.email')}>
                {invoice.customer?.email}
              </Descriptions.Item>
              <Descriptions.Item label={t('customer.phone')}>
                {invoice.customer?.phone}
              </Descriptions.Item>
              <Descriptions.Item label={t('customer.taxNumber')}>
                {invoice.customer?.taxRegistrationNumber || '—'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        {/* Items Table */}
        <Table
          dataSource={invoice.items || []}
          columns={itemColumns}
          pagination={false}
          rowKey={(record, index) => index}
          title={() => <Title level={4}>{t('invoice.items')}</Title>}
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <Text strong>{t('invoice.subtotal')}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2}>
                  <Text strong style={{ float: 'right' }}>
                    {formatCurrency(invoice.subtotal, invoice.currency)}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <Text>{t('tax.vat')} (5%)</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2}>
                  <Text style={{ float: 'right' }}>
                    {formatCurrency(invoice.vatAmount, invoice.currency)}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <Title level={4} style={{ margin: 0 }}>{t('invoice.total')}</Title>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2}>
                  <Title level={4} style={{ margin: 0, float: 'right', color: '#C8102E' }}>
                    {formatCurrency(invoice.totalAmount, invoice.currency)}
                  </Title>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />

        {/* Notes and Footer */}
        {invoice.notes && (
          <div style={{ marginTop: 24 }}>
            <Title level={4}>{t('invoice.notes')}</Title>
            <Paragraph style={{ direction: 'rtl' }}>
              {invoice.notes}
            </Paragraph>
          </div>
        )}

        <Divider />

        {/* Compliance Footer */}
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size="small">
              {invoice.digitalSignature && (
                <Tag color="success">{t('compliance.digitalSignature')}</Tag>
              )}
              {invoice.peppolId && (
                <Tag color="processing">PEPPOL: {invoice.peppolId}</Tag>
              )}
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {t('invoice.generatedBy')} {process.env.REACT_APP_COMPANY_NAME}
              </Text>
            </Space>
          </Col>
          
          <Col>
            {invoice.qrCode && (
              <div style={{ textAlign: 'center' }}>
                <QRCode value={invoice.qrCode} size={80} />
                <div style={{ fontSize: '10px', marginTop: 4 }}>
                  {t('invoice.scanQR')}
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Card>

      {/* QR Code Modal */}
      <Modal
        title={t('invoice.qrCode')}
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={null}
        centered
      >
        <div style={{ textAlign: 'center', padding: 20 }}>
          <QRCode value={invoice.qrCode || invoice.invoiceNumber} size={200} />
          <div style={{ marginTop: 16 }}>
            <Text>{t('invoice.qrCodeDescription')}</Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InvoiceDetail;
