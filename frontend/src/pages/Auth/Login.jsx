import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Select, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, GlobalOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginUser, selectAuthLoading, selectAuthError, clearError } from '../../store/slices/authSlice';
import './Auth.css';

const { Title, Text } = Typography;
const { Option } = Select;

const Login = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (values) => {
    try {
      await dispatch(loginUser(values)).unwrap();
      message.success(t('auth.loginSuccess', 'تم تسجيل الدخول بنجاح'));
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by useEffect
    }
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="oman-flag">
          <div className="flag-red"></div>
          <div className="flag-white"></div>
          <div className="flag-green"></div>
        </div>
      </div>
      
      <Card className="auth-card">
        <div className="auth-header">
          <div className="logo-section">
            <div className="app-logo">🇴🇲</div>
            <Title level={2} style={{ margin: 0, color: '#C8102E' }}>
              {t('app.title', 'نظام الفوترة العُماني')}
            </Title>
            <Text type="secondary">
              {t('app.subtitle', 'Oman Invoicing Management System')}
            </Text>
          </div>
          
          <div className="language-selector">
            <Select
              value={i18n.language}
              onChange={handleLanguageChange}
              style={{ width: 80 }}
              bordered={false}
            >
              <Option value="ar">العربية</Option>
              <Option value="en">English</Option>
            </Select>
          </div>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label={t('auth.email', 'البريد الإلكتروني')}
            rules={[
              { required: true, message: t('validation.emailRequired', 'البريد الإلكتروني مطلوب') },
              { type: 'email', message: t('validation.emailInvalid', 'البريد الإلكتروني غير صالح') }
            ]}
          >
            <Input 
              prefix={<UserOutlined />}
              placeholder={t('auth.emailPlaceholder', 'أدخل البريد الإلكتروني')}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={t('auth.password', 'كلمة المرور')}
            rules={[
              { required: true, message: t('validation.passwordRequired', 'كلمة المرور مطلوبة') },
              { min: 6, message: t('validation.passwordMin', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل') }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder={t('auth.passwordPlaceholder', 'أدخل كلمة المرور')}
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>{t('auth.rememberMe', 'تذكرني')}</Checkbox>
              </Form.Item>
              <Button type="link" style={{ padding: 0 }}>
                {t('auth.forgotPassword', 'نسيت كلمة المرور؟')}
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: '100%', height: 48 }}
            >
              {t('auth.login', 'تسجيل الدخول')}
            </Button>
          </Form.Item>
        </Form>

        <div className="auth-footer">
          <Text type="secondary">
            {t('auth.demoCredentials', 'بيانات التجربة')}:
          </Text>
          <br />
          <Text code>admin@oman-invoicing.om / admin123</Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
