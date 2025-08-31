import React, { useEffect } from 'react';
import {
  Form,
  InputNumber,
  Select,
  Switch,
  Button,
  Row,
  Col,
  Divider,
  Card,
  Typography,
  Alert
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { Option } = Select;

const TaxForm = ({
  initialValues,
  onSubmit,
  loading = false,
  mode = 'create'
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        vatRate: initialValues.vatRate * 100, // Convert to percentage
        corporateTaxRate: initialValues.corporateTaxRate * 100,
      });
    }
  }, [initialValues, form]);

  const handleSubmit = (values) => {
    const formData = {
      ...values,
      vatRate: values.vatRate / 100, // Convert back to decimal
      corporateTaxRate: values.corporateTaxRate / 100,
    };
    onSubmit(formData);
  };

  return (
    <Card title={t('tax.configuration')}>
      <Alert
        message={t('tax.configurationNote')}
        description={t('tax.configurationDescription')}
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          vatRate: 5, // 5%
          corporateTaxRate: 15, // 15%
          exemptionThreshold: 38500, // OMR 38,500
          reportingFrequency: 'quarterly',
          isActive: true
        }}
      >
        <Title level={4}>{t('tax.rates')}</Title>

        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Form.Item
              name="vatRate"
              label={t('tax.vatRate')}
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
              label={t('tax.corporateTaxRate')}
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
              label={t('tax.exemptionThreshold')}
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
              label={t('tax.reportingFrequency')}
              rules={[{ required: true, message: t('validation.required') }]}
            >
              <Select>
                <Option value="monthly">{t('tax.monthly')}</Option>
                <Option value="quarterly">{t('tax.quarterly')}</Option>
                <Option value="annually">{t('tax.annually')}</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="isActive"
              label={t('tax.activeConfiguration')}
              valuePropName="checked"
            >
              <Switch 
                checkedChildren={t('active')}
                unCheckedChildren={t('inactive')}
              />
            </Form.Item>
          </Col>
        </Row>

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
              {mode === 'create' ? t('create') : t('save')}
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default TaxForm;
