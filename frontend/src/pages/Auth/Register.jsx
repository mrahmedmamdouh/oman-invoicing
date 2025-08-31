import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Select,
  Checkbox,
  Row,
  Col,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  BuildOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const Register = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register', values);
      
      // Set credentials in Redux store
      dispatch(setCredentials(response.data.data));
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || t('error.general'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card" style={{ maxWidth: 500, width: '100%' }}>
        <div className="auth-header">
          <div className="logo-section">
            <div className="oman-flag-mini">
              <div className="flag-stripe red"></div>
              <div className="flag-stripe white"></div>
              <div className="flag-stripe green"></div>
            </div>
          </div>
          
          <Title level={3} className="login-title">
            {t('auth.createAccount')}
          </Title>
          
          <Text type="secondary" className="login-subtitle">
            {t('auth.joinOmanInvoicing')}
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
            closable
            onClose={() => setError(null)}
          />
        )}

        <Form
          form={form}
          name="register"
          size="large"
          onFinish={handleSubmit}
          autoComplete="off"
          layout="vertical"
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="fullName"
                label={t('auth.fullName')}
                rules={[
                  { 
                    required: true, 
                    message: t('validation.required') 
                  },
                  { 
                    min: 2, 
                    max: 50, 
                    message: t('validation.nameLength') 
                  }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />}
                  placeholder={t('auth.fullNamePlaceholder')}
                  autoComplete="name"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label={t('auth.email')}
                rules={[
                  { 
                    required: true, 
                    message: t('validation.emailRequired') 
                  },
                  { 
                    type: 'email', 
                    message: t('validation.emailInvalid') 
                  }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />}
                  placeholder={t('auth.emailPlaceholder')}
                  autoComplete="email"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="password"
                label={t('auth.password')}
                rules={[
                  { 
                    required: true, 
                    message: t('validation.passwordRequired') 
                  },
                  { 
                    min: 8, 
                    message: t('validation.passwordMinLength8') 
                  },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: t('validation.passwordStrength')
                  }
                ]}
                hasFeedback
              >
                <Input.Password 
                  prefix={<LockOutlined />}
                  placeholder={t('auth.passwordPlaceholder')}
                  autoComplete="new-password"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="confirmPassword"
                label={t('auth.confirmPassword')}
                dependencies={['password']}
                hasFeedback
                rules={[
                  { 
                    required: true, 
                    message: t('validation.confirmPasswordRequired') 
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(t('validation.passwordsNotMatch')));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  autoComplete="new-password"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="companyName"
                label={t('auth.companyName')}
                rules={[
                  { 
                    required: true, 
                    message: t('validation.required') 
                  }
                ]}
              >
                <Input 
                  prefix={<BuildOutlined />}
                  placeholder={t('auth.companyNamePlaceholder')}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label={t('auth.phone')}
                rules={[
                  {
                    pattern: /^(\+968|968|0)?[972]\d{7}$/,
                    message: t('validation.omanPhone')
                  }
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined />}
                  placeholder="+968 XX XXX XXX"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="role"
            label={t('auth.role')}
            initialValue="user"
          >
            <Select>
              <Option value="user">{t('auth.roles.user')}</Option>
              <Option value="accountant">{t('auth.roles.accountant')}</Option>
              <Option value="manager">{t('auth.roles.manager')}</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="agree"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error(t('validation.agreeRequired'))),
              },
            ]}
          >
            <Checkbox>
              {t('auth.agreeToTerms')}{' '}
              <Link to="/terms">{t('auth.termsAndConditions')}</Link>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              className="login-submit-btn"
            >
              {t('auth.createAccount')}
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <Text type="secondary">{t('auth.or')}</Text>
        </Divider>

        <div className="auth-footer">
          <Text type="secondary">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login">{t('auth.signIn')}</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Register;
