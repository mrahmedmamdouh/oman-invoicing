import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Table,
  Typography,
  Checkbox,
  Input,
  Space,
  Divider,
  Alert,
  Modal,
  message
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { formatCurrency, formatDate } from '../../utils/formatters';
import { downloadExcelReport, downloadCSVReport, printReport } from '../../utils/print';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const CustomReport = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    type: 'table',
    dataSource: 'invoices',
    dateRange: [dayjs().subtract(30, 'days'), dayjs()],
    fields: [],
    filters: [],
    groupBy: '',
    sortBy: '',
    sortOrder: 'desc'
  });

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [savedReports, setSavedReports] = useState([]);

  const availableFields = {
    invoices: [
      { key: 'invoiceNumber', label: 'Invoice Number', type: 'string' },
      { key: 'customerName', label: 'Customer Name', type: 'string' },
      { key: 'issueDate', label: 'Issue Date', type: 'date' },
      { key: 'dueDate', label: 'Due Date', type: 'date' },
      { key: 'totalAmount', label: 'Total Amount', type: 'currency' },
      { key: 'vatAmount', label: 'VAT Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'currency', label: 'Currency', type: 'string' },
      { key: 'paymentTerms', label: 'Payment Terms', type: 'number' }
    ],
    customers: [
      { key: 'name', label: 'Customer Name', type: 'string' },
      { key: 'email', label: 'Email', type: 'string' },
      { key: 'customerType', label: 'Type', type: 'string' },
      { key: 'taxRegistrationNumber', label: 'Tax Number', type: 'string' },
      { key: 'city', label: 'City', type: 'string' },
      { key: 'state', label: 'Governorate', type: 'string' },
      { key: 'createdAt', label: 'Created Date', type: 'date' },
      { key: 'isActive', label: 'Status', type: 'boolean' }
    ],
    payments: [
      { key: 'paymentId', label: 'Payment ID', type: 'string' },
      { key: 'invoiceNumber', label: 'Invoice Number', type: 'string' },
      { key: 'customerName', label: 'Customer Name', type: 'string' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'paymentMethod', label: 'Payment Method', type: 'string' },
      { key: 'paymentDate', label: 'Payment Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'string' }
    ]
  };

  useEffect(() => {
    loadSavedReports();
  }, []);

  const loadSavedReports = () => {
    // Load from localStorage or API
    const saved = localStorage.getItem('customReports');
    if (saved) {
      setSavedReports(JSON.parse(saved));
    }
  };

  const saveReport = () => {
    if (!reportConfig.name) {
      message.error(t('validation.reportNameRequired'));
      return;
    }

    const newReport = {
      id: Date.now(),
      ...reportConfig,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user' // Replace with actual user
    };

    const updated = [...savedReports, newReport];
    setSavedReports(updated);
    localStorage.setItem('customReports', JSON.stringify(updated));
    message.success(t('success.reportSaved'));
  };

  const loadReport = (report) => {
    setReportConfig(report);
    form.setFieldsValue(report);
  };

  const deleteReport = (reportId) => {
    const updated = savedReports.filter(r => r.id !== reportId);
    setSavedReports(updated);
    localStorage.setItem('customReports', JSON.stringify(updated));
    message.success(t('success.reportDeleted'));
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      // Mock report generation - replace with actual API call
      const mockData = generateMockData(reportConfig);
      setReportData(mockData);
      setPreviewVisible(true);
    } catch (error) {
      message.error(error.message || t('error.general'));
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (config) => {
    const { dataSource, fields, dateRange } = config;
    const mockCount = 50; // Generate 50 mock records
    const data = [];

    for (let i = 0; i < mockCount; i++) {
      const record = {};
      
      fields.forEach(field => {
        const fieldConfig = availableFields[dataSource].find(f => f.key === field);
        if (fieldConfig) {
          switch (fieldConfig.type) {
            case 'string':
              if (field === 'invoiceNumber') {
                record[field] = `INV-2025-${String(i + 1).padStart(6, '0')}`;
              } else if (field === 'customerName') {
                record[field] = `Customer ${i + 1}`;
              } else if (field === 'status') {
                const statuses = ['draft', 'sent', 'paid', 'overdue'];
                record[field] = statuses[Math.floor(Math.random() * statuses.length)];
              } else {
                record[field] = `Sample ${fieldConfig.label} ${i + 1}`;
              }
              break;
            case 'currency':
              record[field] = Math.random() * 1000 + 100;
              break;
            case 'number':
              record[field] = Math.floor(Math.random() * 90) + 7;
              break;
            case 'date':
              const start = dateRange[0].toDate();
              const end = dateRange[1].toDate();
              record[field] = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
              break;
            case 'boolean':
              record[field] = Math.random() > 0.5;
              break;
            default:
              record[field] = `Value ${i + 1}`;
          }
        }
      });
      
      data.push(record);
    }

    return data;
  };

  const getTableColumns = () => {
    return reportConfig.fields.map(field => {
      const fieldConfig = availableFields[reportConfig.dataSource].find(f => f.key === field);
      if (!fieldConfig) return null;

      const column = {
        title: fieldConfig.label,
        dataIndex: field,
        key: field,
        sorter: true
      };

      // Format based on field type
      if (fieldConfig.type === 'currency') {
        column.render = (value) => formatCurrency(value, 'OMR');
        column.align = 'right';
      } else if (fieldConfig.type === 'date') {
        column.render = (value) => formatDate(value);
      } else if (fieldConfig.type === 'boolean') {
        column.render = (value) => value ? t('yes') : t('no');
      }

      return column;
    }).filter(Boolean);
  };

  const handleExport = (format) => {
    if (reportData.length === 0) {
      message.warning(t('reports.noDataToExport'));
      return;
    }

    const filename = `${reportConfig.name || 'custom-report'}-${dayjs().format('YYYY-MM-DD')}.${format}`;
    
    try {
      if (format === 'excel') {
        downloadExcelReport(reportData, filename);
      } else if (format === 'csv') {
        downloadCSVReport(reportData, filename);
      }
      message.success(t('success.reportExported'));
    } catch (error) {
      message.error(t('error.exportFailed'));
    }
  };

  const handlePrint = () => {
    if (reportData.length === 0) {
      message.warning(t('reports.noDataToPrint'));
      return;
    }

    const reportElement = document.getElementById('custom-report-content');
    if (reportElement) {
      printReport(reportElement, reportConfig.name || 'Custom Report');
    }
  };

  return (
    <div className="custom-report">
      <Row gutter={24}>
        {/* Report Configuration */}
        <Col xs={24} lg={8}>
          <Card title={t('reports.reportConfiguration')}>
            <Form
              form={form}
              layout="vertical"
              onValuesChange={(changed, values) => {
                setReportConfig({ ...reportConfig, ...changed });
              }}
            >
              <Form.Item
                name="name"
                label={t('reports.reportName')}
                rules={[{ required: true, message: t('validation.required') }]}
              >
                <Input placeholder={t('reports.enterReportName')} />
              </Form.Item>

              <Form.Item
                name="description"
                label={t('reports.description')}
              >
                <TextArea rows={3} placeholder={t('reports.enterDescription')} />
              </Form.Item>

              <Form.Item
                name="dataSource"
                label={t('reports.dataSource')}
                rules={[{ required: true, message: t('validation.required') }]}
              >
                <Select
                  placeholder={t('reports.selectDataSource')}
                  onChange={(value) => {
                    setReportConfig({ ...reportConfig, dataSource: value, fields: [] });
                    form.setFieldValue('fields', []);
                  }}
                >
                  <Option value="invoices">{t('invoices')}</Option>
                  <Option value="customers">{t('customers')}</Option>
                  <Option value="payments">{t('payment.payments')}</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="fields"
                label={t('reports.selectFields')}
                rules={[{ required: true, message: t('validation.selectFields') }]}
              >
                <Select
                  mode="multiple"
                  placeholder={t('reports.selectFields')}
                  disabled={!reportConfig.dataSource}
                >
                  {availableFields[reportConfig.dataSource]?.map(field => (
                    <Option key={field.key} value={field.key}>
                      {field.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="dateRange"
                label={t('reports.dateRange')}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>

              <Form.Item
                name="groupBy"
                label={t('reports.groupBy')}
              >
                <Select
                  placeholder={t('reports.selectGroupBy')}
                  allowClear
                  disabled={!reportConfig.dataSource}
                >
                  {availableFields[reportConfig.dataSource]?.map(field => (
                    <Option key={field.key} value={field.key}>
                      {field.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Divider />

              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={generateReport}
                  loading={loading}
                  block
                >
                  {t('reports.generatePreview')}
                </Button>

                <Button
                  icon={<SaveOutlined />}
                  onClick={saveReport}
                  block
                >
                  {t('reports.saveReport')}
                </Button>
              </Space>
            </Form>
          </Card>

          {/* Saved Reports */}
          <Card 
            title={t('reports.savedReports')} 
            style={{ marginTop: 16 }}
            size="small"
          >
            {savedReports.length === 0 ? (
              <Text type="secondary">{t('reports.noSavedReports')}</Text>
            ) : (
              <div className="saved-reports-list">
                {savedReports.map(report => (
                  <div key={report.id} className="saved-report-item">
                    <div className="report-info">
                      <Text strong>{report.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {formatDate(report.createdAt)}
                      </Text>
                    </div>
                    <Space>
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => loadReport(report)}
                      />
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteReport(report.id)}
                      />
                    </Space>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* Report Preview */}
        <Col xs={24} lg={16}>
          <Card 
            title={t('reports.reportPreview')}
            extra={
              reportData.length > 0 && (
                <Space>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => handleExport('csv')}
                  >
                    CSV
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => handleExport('excel')}
                  >
                    Excel
                  </Button>
                  <Button
                    icon={<EyeOutlined />}
                    onClick={handlePrint}
                  >
                    {t('print')}
                  </Button>
                </Space>
              )
            }
          >
            {reportData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 50 }}>
                <Text type="secondary">{t('reports.generateReportToSeePreview')}</Text>
              </div>
            ) : (
              <div id="custom-report-content">
                <div className="report-header" style={{ marginBottom: 20 }}>
                  <Title level={4}>{reportConfig.name}</Title>
                  {reportConfig.description && (
                    <Text type="secondary">{reportConfig.description}</Text>
                  )}
                  <div style={{ marginTop: 10 }}>
                    <Text type="secondary">
                      {t('reports.generatedOn')}: {formatDate(new Date())}
                    </Text>
                  </div>
                </div>

                <Table
                  dataSource={reportData}
                  columns={getTableColumns()}
                  rowKey={(record, index) => index}
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
                  scroll={{ x: true }}
                  size="small"
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomReport;
