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
  InputNumber,
  TimePicker,
  Alert,
  message
} from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const SystemSettings = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Mock settings data - replace with actual API call
      const mockSettings = {
        companyName: process.env.REACT_APP_COMPANY_NAME || 'Your Company Name',
        companyNameAr: 'اسم شركتك',
        taxRegistrationNumber: '',
        commercialRegistrationNumber: '',
        address: {
          street: '',
          city: 'Muscat',
          state: 'muscat',
          postalCode: '100',
          country: 'OM'
        },
        contact: {
          email: process.env.REACT_APP_SUPPORT_EMAIL || 'info@company.om',
          phone: process.env.REACT_APP_SUPPORT_PHONE || '+968-24-123456',
          website: 'https://www.company.om'
        },
        invoiceSettings: {
          prefix: 'INV',
          startingNumber: 1,
          numberLength: 6,
          resetAnnually: true,
          defaultTerms: 30,
          defaultCurrency: 'OMR',
          includeHijriDate: true,
          autoGenerateQR: true
        },
        taxSettings: {
          vatRate: 0.05,
          corporateTaxRate: 0.15,
          vatRegistrationNumber: '',
          otaEnvironment: 'sandbox'
        },
        emailSettings: {
          smtpHost: '',
          smtpPort: 587,
          smtpUser: '',
          smtpPassword: '',
          fromEmail: '',
          fromName: ''
        },
        systemSettings: {
          defaultLanguage: 'ar',
          dateFormat: 'DD/MM/YYYY',
          numberFormat: 'ar-OM',
          timezone: 'Asia/Muscat',
          sessionTimeout: 30,
          enableAuditLog: true,
          enableNotifications: true,
          maintenanceMode: false
        }
      };
      
      setSettings(mockSettings);
      form.setFieldsValue(mockSettings);
    } catch (error) {
      message.error(t('error.loadSettings'));
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettings(values);
      message.success(t('success.settingsUpdated'));
    } catch (error) {
      message.error(error.message || t('error.general'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="system-settings">
      <Card>
        <Title level={2}>{t('settings.system')}</Title>
        
        <Alert
          message={t('settings.systemWarning')}
          description={t('settings.systemWarningDescription')}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={settings}
        >
          {/* Company Information */}
          <Card title={t('settings.companyInfo')} size="small" style={{ marginBottom: 24 }}>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="companyName"
                  label={t('settings.companyName')}
                  rules={[{ required: true, message: t('validation.required') }]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="companyNameAr"
                  label={t('settings.companyNameAr')}
                >
                  <Input style={{ direction: 'rtl' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="taxRegistrationNumber"
                  label={t('settings.taxRegistrationNumber')}
                  rules={[
                    { len: 15, message: t('validation.taxNumberLength') },
                    { pattern: /^\d{15}$/, message: t('validation.taxNumberFormat') }
                  ]}
                >
                  <Input maxLength={15} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="commercialRegistrationNumber"
                  label={t('settings.commercialRegistrationNumber')}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item
                  name={['contact', 'email']}
                  label={t('settings.contactEmail')}
                  rules={[
                    { required: true, message: t('validation.required') },
                    { type: 'email', message: t('validation.email') }
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name={['contact', 'phone']}
                  label={t('settings.contactPhone')}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name={['contact', 'website']}
                  label={t('settings.website')}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Invoice Settings */}
          <Card title={t('settings.invoiceSettings')} size="small" style={{ marginBottom: 24 }}>
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item
                  name={['invoiceSettings', 'prefix']}
                  label={t('settings.invoicePrefix')}
                >
                  <Input placeholder="INV" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name={['invoiceSettings', 'startingNumber']}
                  label={t('settings.startingNumber')}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name={['invoiceSettings', 'numberLength']}
                  label={t('settings.numberLength')}
                >
                  <InputNumber min={4} max={10} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item
                  name={['invoiceSettings', 'defaultTerms']}
                  label={t('settings.defaultPaymentTerms')}
                >
                  <Select>
                    <Option value={0}>{t('settings.cashOnDelivery')}</Option>
                    <Option value={7}>7 {t('days')}</Option>
                    <Option value={15}>15 {t('days')}</Option>
                    <Option value={30}>30 {t('days')}</Option>
                    <Option value={60}>60 {t('days')}</Option>
                    <Option value={90}>90 {t('days')}</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name={['invoiceSettings', 'defaultCurrency']}
                  label={t('settings.defaultCurrency')}
                >
                  <Select>
                    <Option value="OMR">OMR - Omani Rial</Option>
                    <Option value="USD">USD - US Dollar</Option>
                    <Option value="EUR">EUR - Euro</Option>
                    <Option value="SAR">SAR - Saudi Riyal</Option>
                    <Option value="AED">AED - UAE Dirham</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name={['invoiceSettings', 'resetAnnually']}
                  label={t('settings.resetNumberingAnnually')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['invoiceSettings', 'includeHijriDate']}
                  label={t('settings.includeHijriDate')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name={['invoiceSettings', 'autoGenerateQR']}
                  label={t('settings.autoGenerateQR')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* System Settings */}
          <Card title={t('settings.systemPreferences')} size="small" style={{ marginBottom: 24 }}>
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item
                  name={['systemSettings', 'defaultLanguage']}
                  label={t('settings.defaultLanguage')}
                >
                  <Select>
                    <Option value="ar">العربية</Option>
                    <Option value="en">English</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name={['systemSettings', 'dateFormat']}
                  label={t('settings.dateFormat')}
                >
                  <Select>
                    <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                    <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                    <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name={['systemSettings', 'timezone']}
                  label={t('settings.timezone')}
                >
                  <Select>
                    <Option value="Asia/Muscat">Asia/Muscat (GMT+4)</Option>
                    <Option value="UTC">UTC (GMT+0)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item
                  name={['systemSettings', 'sessionTimeout']}
                  label={t('settings.sessionTimeout')}
                >
                  <InputNumber 
                    min={5} 
                    max={120} 
                    addonAfter={t('minutes')}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name={['systemSettings', 'enableAuditLog']}
                  label={t('settings.enableAuditLog')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name={['systemSettings', 'enableNotifications']}
                  label={t('settings.enableNotifications')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Divider />

          <Row justify="end" gutter={16}>
            <Col>
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => {
                  form.resetFields();
                  loadSettings();
                }}
              >
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
      </Card>
    </div>
  );
};

export default SystemSettings;