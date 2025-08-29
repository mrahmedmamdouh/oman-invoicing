import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  InputNumber, 
  Button, 
  Switch, 
  Select, 
  Divider,
  Row, 
  Col, 
  Typography,
  Alert,
  Space,
  Statistic,
  message
} from 'antd';
import { SaveOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { 
  fetchTaxConfiguration,
  updateTaxConfiguration,
  validateTaxNumber,
  selectTaxConfig,
  selectTaxLoading
} from '../../store/slices/taxSlice';

const { Title, Text } = Typography;
const { Option } = Select;

const TaxSettings = () => {
  const [form] = Form.useForm();
  const [testTaxNumber, setTestTaxNumber] = useState('');
  const [validationResult, setValidationResult] = useState(null);

  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  const taxConfig = useSelector(selectTaxConfig);
  const loading = useSelector(selectTaxLoading);

  useEffect(() => {
    dispatch(fetchTaxConfiguration());
  }, [dispatch]);

  useEffect(() => {
    if (taxConfig) {
      form.setFieldsValue({
        vatRate: taxConfig.vatRate * 100, // Convert to percentage
        corporateTaxRate: taxConfig.corporateTaxRate * 100,
        exemptionThreshold: taxConfig.exemptionThreshold,
        reportingFrequency: taxConfig.reportingFrequency,
        isActive: taxConfig.isActive
      });
    }
  }, [taxConfig, form]);

  const handleSubmit = async (values) => {
    try {
      const configData = {
        ...values,
        vatRate: values.vatRate / 100, // Convert back to decimal
        corporateTaxRate: values.corporateTaxRate / 100,
        effectiveFrom: new Date()
      };

      await dispatch(updateTaxConfiguration(configData)).unwrap();
      message.success(t('tax.updateSuccess', 'تم تحديث إعدادات الضرائب بنجاح'));
    } catch (error) {
      message.error(error.message || t('error.general'));
    }
  };

  const handleValidateTaxNumber = async () => {
    if (!testTaxNumber) {
      message.warning(t('tax.enterTaxNumber', 'يرجى إدخال الرقم الضريبي'));
      return;
    }

    try {
      const result = await dispatch(validateTaxNumber({ taxNumber: testTaxNumber })).unwrap();
      setValidationResult(result);
    } catch (error) {
      setValidationResult({ isValid: false, error: error.message });
    }
  };

  return (
    <div className="tax-settings">
      <Card>
        <Title level={2}>إعدادات الضرائب - Tax Settings</Title>
        
        {/* Current Tax Rates Display */}
        <Alert
          message="معدلات الضرائب الحالية في سلطنة عُمان"
          description="Current tax rates in Sultanate of Oman"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="ضريبة القيمة المضافة"
                value={5}
                suffix="%"
                valueStyle={{ color: '#C8102E' }}
              />
              <Text type="secondary">Value Added Tax</Text>
            </Card>
          </Col>
          
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="ضريبة الشركات"
                value={15}
                suffix="%"
                valueStyle={{ color: '#009639' }}
              />
              <Text type="secondary">Corporate Tax</Text>
            </Card>
          </Col>
          
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="حد الإعفاء"
                value={38500}
                suffix="ر.ع"
                valueStyle={{ color: '#faad14' }}
              />
              <Text type="secondary">Exemption Threshold OMR</Text>
            </Card>
          </Col>
        </Row>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Divider orientation="left">Tax Rate Configuration</Divider>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                name="vatRate"
                label={t('tax.vatRate', 'معدل ضريبة القيمة المضافة (%)')}
                rules={[
                  { required: true, message: t('validation.required') },
                  { type: 'number', min: 0, max: 100, message: t('validation.percentage') }
                ]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.1}
                  precision={1}
                  style={{ width: '100%' }}
                  formatter={value => `${value}%`}
                  parser={value => value.replace('%', '')}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="corporateTaxRate"
                label={t('tax.corporateTaxRate', 'معدل ضريبة الشركات (%)')}
                rules={[
                  { required: true, message: t('validation.required') },
                  { type: 'number', min: 0, max: 100, message: t('validation.percentage') }
                ]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.1}
                  precision={1}
                  style={{ width: '100%' }}
                  formatter={value => `${value}%`}
                  parser={value => value.replace('%', '')}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="exemptionThreshold"
                label={t('tax.exemptionThreshold', 'حد الإعفاء (ر.ع)')}
                rules={[
                  { required: true, message: t('validation.required') },
                  { type: 'number', min: 0, message: t('validation.positiveNumber') }
                ]}
              >
                <InputNumber
                  min={0}
                  step={1000}
                  precision={3}
                  style={{ width: '100%' }}
                  formatter={value => `${value} OMR`}
                  parser={value => value.replace(' OMR', '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="reportingFrequency"
                label={t('tax.reportingFrequency', 'تكرار التقارير')}
                rules={[{ required: true, message: t('validation.required') }]}
              >
                <Select>
                  <Option value="monthly">{t('tax.monthly', 'شهرياً')}</Option>
                  <Option value="quarterly">{t('tax.quarterly', 'ربع سنوي')}</Option>
                  <Option value="annually">{t('tax.annually', 'سنوياً')}</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="isActive"
                label={t('tax.activeConfiguration', 'التكوين النشط')}
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren={t('active', 'نشط')}
                  unCheckedChildren={t('inactive', 'غير نشط')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Tax Number Validation</Divider>

          <Row gutter={16} align="middle">
            <Col xs={24} md={12}>
              <Form.Item label={t('tax.testTaxNumber', 'اختبر الرقم الضريبي')}>
                <Input
                  placeholder="123-456-789-012-345"
                  value={testTaxNumber}
                  onChange={(e) => setTestTaxNumber(e.target.value)}
                  maxLength={17}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Button 
                icon={<SyncOutlined />}
                onClick={handleValidateTaxNumber}
                loading={loading}
              >
                {t('tax.validate', 'التحقق')}
              </Button>
            </Col>

            <Col xs={24} md={6}>
              {validationResult && (
                <div>
                  {validationResult.isValid ? (
                    <Text type="success">
                      <CheckCircleOutlined /> {t('tax.valid', 'صالح')}
                    </Text>
                  ) : (
                    <Text type="danger">
                      {t('tax.invalid', 'غير صالح')}
                    </Text>
                  )}
                </div>
              )}
            </Col>
          </Row>

          {validationResult && validationResult.isValid && validationResult.companyName && (
            <Alert
              message={t('tax.validationSuccess', 'نجح التحقق من الرقم الضريبي')}
              description={`Company: ${validationResult.companyName} | Status: ${validationResult.status}`}
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Divider orientation="left">OTA Integration Settings</Divider>

          <Alert
            message="إعدادات الاتصال مع هيئة الضرائب العُمانية"
            description="Oman Tax Authority Integration Settings"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item label={t('tax.otaApiUrl', 'رابط API هيئة الضرائب')}>
                <Input 
                  value={process.env.REACT_APP_OTA_API_URL || 'https://api.taxoman.gov.om'}
                  disabled
                  addonBefore="URL"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label={t('tax.otaEnvironment', 'البيئة')}>
                <Select 
                  value={process.env.REACT_APP_OTA_ENVIRONMENT || 'sandbox'}
                  disabled
                >
                  <Option value="sandbox">Sandbox (اختبار)</Option>
                  <Option value="production">Production (إنتاج)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row justify="end" gutter={16}>
            <Col>
              <Button onClick={() => form.resetFields()}>
                {t('reset', 'إعادة تعيين')}
              </Button>
            </Col>
            <Col>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                {t('save', 'حفظ الإعدادات')}
              </Button>
            </Col>
          </Row>
        </Form>

        <Divider />

        {/* Compliance Information */}
        <Card size="small" title={t('tax.complianceInfo', 'معلومات الامتثال')}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>
              <strong>{t('tax.vatImplementation', 'تطبيق ضريبة القيمة المضافة')}:</strong> 
              {' '}16 أبريل 2021 - April 16, 2021
            </Text>
            <Text>
              <strong>{t('tax.corporateTaxImplementation', 'تطبيق ضريبة الشركات')}:</strong> 
              {' '}1 يونيو 2024 - June 1, 2024
            </Text>
            <Text>
              <strong>{t('tax.registrationThreshold', 'حد التسجيل')}:</strong> 
              {' '}38,500 ر.ع سنوياً - OMR 38,500 annually
            </Text>
            <Text>
              <strong>{t('tax.filingDeadline', 'موعد تقديم الإقرار')}:</strong> 
              {' '}28 يوم من نهاية الفترة الضريبية - 28 days from end of tax period
            </Text>
          </Space>
        </Card>
      </Card>
    </div>
  );
};

export default TaxSettings;
