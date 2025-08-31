import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Row,
  Col,
  Typography,
  Divider,
  Alert,
  Table,
  Tag,
  Space,
  Modal,
  message
} from 'antd';
import { 
  SaveOutlined, 
  TestOutlined, 
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SendOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/formatters';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const PeppolSettings = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [messageHistory, setMessageHistory] = useState([]);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    loadPeppolSettings();
    loadMessageHistory();
  }, []);

  const loadPeppolSettings = async () => {
    try {
      // Mock settings - replace with actual API call
      const mockSettings = {
        enabled: true,
        participantId: '9956:123456789012345',
        endpoint: 'https://peppol-gateway.example.com',
        certificatePath: '/certificates/peppol-cert.p12',
        certificatePassword: '********',
        environment: 'test', // test or production
        smlDomain: 'edelivery.tech.ec.europa.eu',
        documentTypes: [
          'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
          'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2'
        ],
        processIds: [
          'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0'
        ],
        autoSend: false,
        validateBeforeSend: true,
        retryAttempts: 3,
        timeoutSeconds: 30
      };
      
      setSettings(mockSettings);
      form.setFieldsValue(mockSettings);
    } catch (error) {
      message.error(t('error.loadSettings'));
    }
  };

  const loadMessageHistory = () => {
    // Mock message history - replace with actual API call
    const mockHistory = [
      {
        id: 1,
        messageId: 'MSG-2025-001',
        invoiceNumber: 'INV-2025-001234',
        recipientId: '9956:987654321098765',
        documentType: 'Invoice',
        status: 'delivered',
        sentAt: '2025-08-30T10:30:00Z',
        deliveredAt: '2025-08-30T10:32:15Z',
        error: null
      },
      {
        id: 2,
        messageId: 'MSG-2025-002',
        invoiceNumber: 'INV-2025-001235',
        recipientId: '9956:111222333444555',
        documentType: 'Invoice',
        status: 'failed',
        sentAt: '2025-08-29T15:45:00Z',
        deliveredAt: null,
        error: 'Recipient not found in SML'
      }
    ];
    
    setMessageHistory(mockHistory);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettings(values);
      message.success(t('success.peppolSettingsUpdated'));
    } catch (error) {
      message.error(error.message || t('error.general'));
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTestLoading(true);
    try {
      // Mock connection test - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        setConnectionStatus('connected');
        message.success(t('peppol.connectionTestSuccessful'));
      } else {
        setConnectionStatus('failed');
        message.error(t('peppol.connectionTestFailed'));
      }
    } catch (error) {
      setConnectionStatus('failed');
      message.error(error.message || t('peppol.connectionTestFailed'));
    } finally {
      setTestLoading(false);
    }
  };

  const validateParticipantId = async (participantId) => {
    try {
      // Mock validation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isValid = /^9956:\d{15}$/.test(participantId);
      
      if (isValid) {
        message.success(t('peppol.participantIdValid'));
      } else {
        message.error(t('peppol.participantIdInvalid'));
      }
      
      return isValid;
    } catch (error) {
      message.error(t('error.validationFailed'));
      return false;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: 'success',
      pending: 'processing',
      failed: 'error',
      timeout: 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      delivered: <CheckCircleOutlined />,
      pending: <SyncOutlined spin />,
      failed: <ExclamationCircleOutlined />,
      timeout: <ExclamationCircleOutlined />
    };
    return icons[status];
  };

  const messageColumns = [
    {
      title: t('peppol.messageId'),
      dataIndex: 'messageId',
      key: 'messageId',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: t('peppol.invoice'),
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: t('peppol.recipient'),
      dataIndex: 'recipientId',
      key: 'recipientId',
      ellipsis: true
    },
    {
      title: t('peppol.documentType'),
      dataIndex: 'documentType',
      key: 'documentType'
    },
    {
      title: t('peppol.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {t(`peppol.status.${status}`)}
        </Tag>
      )
    },
    {
      title: t('peppol.sentAt'),
      dataIndex: 'sentAt',
      key: 'sentAt',
      render: (date) => formatDate(date)
    },
    {
      title: t('peppol.deliveredAt'),
      dataIndex: 'deliveredAt',
      key: 'deliveredAt',
      render: (date) => date ? formatDate(date) : '—'
    }
  ];

  return (
    <div className="peppol-settings">
      <Card>
        <Title level={2}>
          {t('settings.peppolSettings')} 
          <span style={{ marginLeft: 16 }}>
            {connectionStatus === 'connected' && (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                {t('peppol.connected')}
              </Tag>
            )}
            {connectionStatus === 'failed' && (
              <Tag color="error" icon={<ExclamationCircleOutlined />}>
                {t('peppol.disconnected')}
              </Tag>
            )}
          </span>
        </Title>
        
        <Alert
          message={t('peppol.settingsInfo')}
          description={t('peppol.settingsDescription')}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={settings}
        >
          {/* Basic Configuration */}
          <Card title={t('peppol.basicConfiguration')} size="small" style={{ marginBottom: 24 }}>
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="enabled"
                  label={t('peppol.enablePeppol')}
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren={t('enabled')}
                    unCheckedChildren={t('disabled')}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="environment"
                  label={t('peppol.environment')}
                >
                  <Select>
                    <Option value="test">{t('peppol.testEnvironment')}</Option>
                    <Option value="production">{t('peppol.productionEnvironment')}</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item>
                  <Text>{t('peppol.connectionTest')}</Text>
                  <br />
                  <Button
                    icon={<TestOutlined />}
                    onClick={testConnection}
                    loading={testLoading}
                    style={{ marginTop: 8 }}
                  >
                    {t('peppol.testConnection')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="participantId"
                  label={t('peppol.participantId')}
                  rules={[
                    { required: true, message: t('validation.required') },
                    { pattern: /^9956:\d{15}$/, message: t('peppol.participantIdFormat') }
                  ]}
                >
                  <Input 
                    placeholder="9956:123456789012345"
                    addonAfter={
                      <Button
                        size="small"
                        onClick={() => {
                          const value = form.getFieldValue('participantId');
                          if (value) validateParticipantId(value);
                        }}
                      >
                        {t('validate')}
                      </Button>
                    }
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="endpoint"
                  label={t('peppol.accessPointUrl')}
                  rules={[
                    { required: true, message: t('validation.required') },
                    { type: 'url', message: t('validation.url') }
                  ]}
                >
                  <Input placeholder="https://peppol-gateway.example.com" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Certificate Configuration */}
          <Card title={t('peppol.certificateSettings')} size="small" style={{ marginBottom: 24 }}>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="certificatePath"
                  label={t('peppol.certificatePath')}
                  rules={[{ required: true, message: t('validation.required') }]}
                >
                  <Input placeholder="/certificates/peppol-cert.p12" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="certificatePassword"
                  label={t('peppol.certificatePassword')}
                  rules={[{ required: true, message: t('validation.required') }]}
                >
                  <Input.Password placeholder="Certificate password" />
                </Form.Item>
              </Col>
            </Row>

            <Alert
              message={t('peppol.certificateInfo')}
              description={t('peppol.certificateDescription')}
              type="warning"
              showIcon
            />
          </Card>

          {/* Advanced Settings */}
          <Card title={t('peppol.advancedSettings')} size="small" style={{ marginBottom: 24 }}>
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="autoSend"
                  label={t('peppol.autoSendInvoices')}
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren={t('enabled')}
                    unCheckedChildren={t('disabled')}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="validateBeforeSend"
                  label={t('peppol.validateBeforeSend')}
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren={t('enabled')}
                    unCheckedChildren={t('disabled')}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="retryAttempts"
                  label={t('peppol.retryAttempts')}
                >
                  <Select>
                    <Option value={1}>1</Option>
                    <Option value={3}>3</Option>
                    <Option value={5}>5</Option>
                  </Select>
                </Form.Item>
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
                icon={<SaveOutlined />}
                loading={loading}
              >
                {t('save')}
              </Button>
            </Col>
          </Row>
        </Form>

        <Divider />

        {/* Message History */}
        <Card title={t('peppol.messageHistory')} size="small">
          <Table
            dataSource={messageHistory}
            columns={messageColumns}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) =>
                t('pagination.total', {
                  start: range[0],
                  end: range[1],
                  total
                })
            }}
            expandable={{
              expandedRowRender: (record) => (
                <div>
                  {record.error && (
                    <Alert
                      message={t('peppol.errorDetails')}
                      description={record.error}
                      type="error"
                      style={{ marginBottom: 16 }}
                    />
                  )}
                  <Paragraph>
                    <strong>{t('peppol.recipient')}:</strong> {record.recipientId}
                  </Paragraph>
                  <Paragraph>
                    <strong>{t('peppol.documentType')}:</strong> {record.documentType}
                  </Paragraph>
                </div>
              )
            }}
          />
        </Card>
      </Card>
    </div>
  );
};

export default PeppolSettings;