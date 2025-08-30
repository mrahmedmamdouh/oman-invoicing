import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Row, 
  Col, 
  Switch, 
  InputNumber,
  Divider,
  Typography,
  Alert
} from 'antd';
import { useTranslation } from 'react-i18next';
import { CUSTOMER_TYPES, OMAN_GOVERNORATES, CURRENCIES, PAYMENT_TERMS } from '../../../utils/constants';

const { Title } = Typography;
const { Option } = Select;

const CustomerForm = ({ 
  initialValues, 
  onSubmit, 
  loading = false, 
  mode = 'create' // 'create' or 'edit'
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [customerType, setCustomerType] = useState('individual');

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        address: initialValues.address || {}
      });
      setCustomerType(initialValues.customerType || 'individual');
    }
  }, [initialValues, form]);

  const handleSubmit = (values) => {
    const formData = {
      ...values,
      // Ensure address is an object
      address: {
        street: values.address?.street || '',
        streetAr: values.address?.streetAr || '',
        city: values.address?.city || '',
        cityAr: values.address?.cityAr || '',
        state: values.address?.state || '',
        stateAr: values.address?.stateAr || '',
        postalCode: values.address?.postalCode || '',
        country: values.address?.country || 'OM',
        countryAr: values.address?.countryAr || 'عُمان'
      }
    };

    onSubmit(formData);
  };

  const handleCustomerTypeChange = (value) => {
    setCustomerType(value);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        customerType: 'individual',
        currency: 'OMR',
        paymentTerms: 30,
        isActive: true,
        address: {
          country: 'OM',
          countryAr: 'عُمان'
        }
      }}
    >
      <Title level={4}>{t('customer.basicInfo', 'معلومات أساسية')}</Title>
      
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="name"
            label={t('customer.name')}
            rules={[
              { required: true, message: t('validation.required') },
              { min: 2, max: 100, message: t('validation.length', { min: 2, max: 100 }) }
            ]}
          >
            <Input placeholder={t('customer.namePlaceholder', 'اسم العميل')} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="nameAr"
            label={t('customer.nameAr', 'الاسم بالعربية')}
          >
            <Input 
              placeholder={t('customer.nameArPlaceholder', 'الاسم بالعربية')} 
              style={{ direction: 'rtl' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            name="customerType"
            label={t('customer.type')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Select onChange={handleCustomerTypeChange}>
              <Option value="individual">{t('customer.individual', 'فرد')}</Option>
              <Option value="business">{t('customer.business', 'شركة')}</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            name="email"
            label={t('customer.email')}
            rules={[
              { required: true, message: t('validation.required') },
              { type: 'email', message: t('validation.email') }
            ]}
          >
            <Input placeholder="customer@example.om" />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            name="phone"
            label={t('customer.phone')}
            rules={[
              {
                pattern: /^(\+968|968|0)?[972]\d{7}$/,
                message: t('validation.omanPhone')
              }
            ]}
          >
            <Input placeholder="+968 XX XXX XXX" />
          </Form.Item>
        </Col>
      </Row>

      {customerType === 'business' && (
        <>
          <Alert
            message={t('customer.businessRequired', 'معلومات إضافية مطلوبة للشركات')}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="taxRegistrationNumber"
                label={t('customer.taxNumber')}
                rules={[
                  { required: customerType === 'business', message: t('validation.required') },
                  { len: 15, message: t('validation.taxNumberLength') },
                  { pattern: /^\d{15}$/, message: t('validation.taxNumberFormat') }
                ]}
              >
                <Input 
                  placeholder="123456789012345"
                  maxLength={15}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="commercialRegistrationNumber"
                label={t('customer.commercialNumber')}
                rules={[
                  { required: customerType === 'business', message: t('validation.required') },
                  { min: 8, max: 10, message: t('validation.commercialNumberLength') }
                ]}
              >
                <Input placeholder="12345678" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="peppolId"
                label={t('customer.peppolId', 'معرف PEPPOL')}
                rules={[
                  {
                    pattern: /^\d{4}:\d{15}$/,
                    message: t('validation.peppolIdFormat')
                  }
                ]}
              >
                <Input placeholder="9956:123456789012345" />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      <Divider orientation="left">{t('customer.address')}</Divider>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name={['address', 'street']}
            label={t('customer.street')}
          >
            <Input placeholder={t('customer.streetPlaceholder')} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name={['address', 'streetAr']}
            label={t('customer.streetAr', 'الشارع بالعربية')}
          >
            <Input 
              placeholder={t('customer.streetArPlaceholder')} 
              style={{ direction: 'rtl' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            name={['address', 'city']}
            label={t('customer.city')}
          >
            <Input placeholder={t('customer.cityPlaceholder')} />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            name={['address', 'state']}
            label={t('customer.governorate')}
          >
            <Select placeholder={t('customer.selectGovernorate')}>
              {OMAN_GOVERNORATES.map(gov => (
                <Option key={gov.value} value={gov.value}>
                  {gov.label_ar} - {gov.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            name={['address', 'postalCode']}
            label={t('customer.postalCode')}
            rules={[
              {
                pattern: /^\d{3}$/,
                message: t('validation.postalCode')
              }
            ]}
          >
            <Input placeholder="100" maxLength={3} />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">{t('customer.paymentInfo')}</Divider>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            name="paymentTerms"
            label={t('customer.paymentTerms')}
          >
            <Select>
              {PAYMENT_TERMS.map(term => (
                <Option key={term.value} value={term.value}>
                  {term.label_ar} - {term.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            name="currency"
            label={t('customer.currency')}
          >
            <Select>
              {Object.entries(CURRENCIES).map(([key, value]) => (
                <Option key={key} value={value}>{value}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            name="creditLimit"
            label={t('customer.creditLimit')}
          >
            <InputNumber
              min={0}
              max={999999.999}
              precision={3}
              style={{ width: '100%' }}
              placeholder="0.000"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            name="isActive"
            label={t('customer.status')}
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
            loading={loading}
          >
            {mode === 'create' ? t('create') : t('save')}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default CustomerForm;
