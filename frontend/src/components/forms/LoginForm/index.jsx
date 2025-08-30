import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Checkbox, 
  Alert, 
  Typography,
  Space,
  Divider,
  Card,
  Row,
  Col
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone,
  LoginOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import './styles.css';

const { Title, Text, Link } = Typography;

const LoginForm = ({ 
  onSuccess, 
  loading: externalLoading = false,
  showForgotPassword = true,
  showRememberMe = true 
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { login, loading: authLoading, error, clearError } = useAuth();
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  const loading = externalLoading || authLoading;
  const maxAttempts = 5;
  const blockDurationMs = 15 * 60 * 1000; // 15 minutes

  useEffect(() => {
    if (error) {
      setLoginAttempts(prev => prev + 1);
      
      if (loginAttempts >= maxAttempts - 1) {
        setIsBlocked(true);
        setBlockTimeRemaining(blockDurationMs);
        
        const interval = setInterval(() => {
          setBlockTimeRemaining(prev => {
            if (prev <= 1000) {
              setIsBlocked(false);
              setLoginAttempts(0);
              clearInterval(interval);
              return 0;
            }
            return prev - 1000;
          });
        }, 1000);
      }
    }
  }, [error, loginAttempts, blockDurationMs, maxAttempts]);

  const handleSubmit = async (values) => {
    if (isBlocked) return;

    try {
      clearError();
      const result = await login(values);
      
      if (result.type === 'fulfilled') {
        setLoginAttempts(0);
        onSuccess?.(result.payload);
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleForgotPassword = () => {
    // Implement forgot password functionality
    console.log('Forgot password clicked');
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const remainingAttempts = Math.max(0, maxAttempts - loginAttempts);

  return (
    <div className="login-form-container">
      <Card 
        className="login-form-card"
        style={{ maxWidth: 400, width: '100%' }}
        bodyStyle={{ padding: '32px 24px' }}
      >
        {/* Header */}
        <div className="login-form-header">
          <div className="logo-container">
            <div className="oman-flag-mini">
              <div className="flag-stripe red"></div>
              <div className="flag-stripe white"></div>
              <div className="flag-stripe green"></div>
            </div>
          </div>
          
          <Title level={3} className="login-title">
            {t('auth.welcome', 'مرحباً بك')}
          </Title>
          
          <Text type="secondary" className="login-subtitle">
            {t('auth.loginToAccount', 'تسجيل الدخول إلى حسابك')}
          </Text>
        </div>

        {/* Error Messages */}
        {error && (
          <Alert
            message={
              <div>
                <div>{error}</div>
                {remainingAttempts > 0 && remainingAttempts < maxAttempts && (
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    {t('auth.attemptsRemaining', { count: remainingAttempts })}
                  </div>
                )}
              </div>
            }
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
            onClose={clearError}
            closable
          />
        )}

        {/* Account Blocked Alert */}
        {isBlocked && (
          <Alert
            message={t('auth.accountBlocked', 'تم حظر الحساب مؤقتاً')}
            description={
              <div>
                <div>{t('auth.tooManyAttempts', 'محاولات دخول كثيرة جداً')}</div>
                <div>{t('auth.tryAgainIn', { time: formatTime(blockTimeRemaining) })}</div>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {/* Login Form */}
        <Form
          form={form}
          name="login"
          size="large"
          onFinish={handleSubmit}
          autoComplete="off"
          disabled={isBlocked}
        >
          <Form.Item
            name="email"
            rules={[
              { 
                required: true, 
                message: t('validation.emailRequired', 'البريد الإلكتروني مطلوب') 
              },
              { 
                type: 'email', 
                message: t('validation.emailInvalid', 'البريد الإلكتروني غير صالح') 
              }
            ]}
          >
            <Input 
              prefix={<UserOutlined />}
              placeholder={t('auth.email', 'البريد الإلكتروني')}
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { 
                required: true, 
                message: t('validation.passwordRequired', 'كلمة المرور مطلوبة') 
              },
              { 
                min: 6, 
                message: t('validation.passwordMinLength', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل') 
              }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('auth.password', 'كلمة المرور')}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              autoComplete="current-password"
            />
          </Form.Item>

          {/* Options Row */}
          <Form.Item>
            <Row justify="space-between" align="middle">
              {showRememberMe && (
                <Col>
                  <Form.Item 
                    name="remember" 
                    valuePropName="checked" 
                    noStyle
                  >
                    <Checkbox>
                      {t('auth.rememberMe', 'تذكرني')}
                    </Checkbox>
                  </Form.Item>
                </Col>
              )}
              
              {showForgotPassword && (
                <Col>
                  <Link 
                    onClick={handleForgotPassword}
                    className="forgot-password-link"
                  >
                    {t('auth.forgotPassword', 'نسيت كلمة المرور؟')}
                  </Link>
                </Col>
              )}
            </Row>
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              disabled={isBlocked}
              icon={<LoginOutlined />}
              block
              className="login-submit-btn"
            >
              {loading 
                ? t('auth.loggingIn', 'جاري تسجيل الدخول...')
                : t('auth.login', 'تسجيل الدخول')
              }
            </Button>
          </Form.Item>
        </Form>

        {/* Demo Credentials */}
        <Divider plain>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {t('auth.demoAccount', 'حساب تجريبي')}
          </Text>
        </Divider>

        <div className="demo-credentials">
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div className="demo-credential-item">
              <Text code>admin@oman-invoicing.om</Text>
              <Text type="secondary"> - {t('auth.adminAccount', 'حساب مدير')}</Text>
            </div>
            <div className="demo-credential-item">
              <Text code>admin123</Text>
              <Text type="secondary"> - {t('auth.password', 'كلمة المرور')}</Text>
            </div>
          </Space>
        </div>

        {/* Footer */}
        <div className="login-form-footer">
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {t('auth.systemInfo', 'نظام الفوترة العُماني المتوافق مع متطلبات هيئة الضرائب')}
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;