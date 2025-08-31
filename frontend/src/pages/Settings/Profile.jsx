import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Avatar,
  Upload,
  message,
  Divider,
  Typography,
  Switch,
  Select
} from 'antd';
import { UserOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { selectCurrentUser, updateProfile } from '../../store/slices/authSlice';

const { Title, Text } = Typography;
const { Option } = Select;

const Profile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        fullName: currentUser.fullName,
        email: currentUser.email,
        phone: currentUser.phone,
        language: i18n.language,
        notifications: {
          email: currentUser.notifications?.email ?? true,
          sms: currentUser.notifications?.sms ?? false,
          browser: currentUser.notifications?.browser ?? true
        }
      });
      
      if (currentUser.avatar) {
        setAvatarUrl(currentUser.avatar);
      }
    }
  }, [currentUser, form, i18n.language]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await dispatch(updateProfile({
        ...values,
        avatar: avatarUrl
      })).unwrap();
      
      // Update language if changed
      if (values.language !== i18n.language) {
        i18n.changeLanguage(values.language);
      }
      
      message.success(t('profile.updateSuccess'));
    } catch (error) {
      message.error(error.message || t('error.general'));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = ({ file }) => {
    if (file.status === 'uploading') {
      setLoading(true);
      return;
    }

    if (file.status === 'done') {
      setLoading(false);
      setAvatarUrl(file.response?.url || '');
      message.success(t('profile.avatarUploadSuccess'));
    } else if (file.status === 'error') {
      setLoading(false);
      message.error(t('profile.avatarUploadError'));
    }
  };

  const uploadButton = (
    <div>
      <UploadOutlined />
      <div style={{ marginTop: 8 }}>{t('upload')}</div>
    </div>
  );

  return (
    <div className="profile-page">
      <Card>
        <Title level={2}>{t('settings.profile')}</Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 800 }}
        >
          {/* Avatar Section */}
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item label={t('profile.avatar')}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar 
                    size={120} 
                    src={avatarUrl}
                    icon={!avatarUrl ? <UserOutlined /> : null}
                  />
                  <div style={{ marginTop: 16 }}>
                    <Upload
                      name="avatar"
                      listType="picture"
                      showUploadList={false}
                      action="/api/upload"
                      onChange={handleAvatarUpload}
                      accept="image/*"
                    >
                      <Button icon={<UploadOutlined />} size="small">
                        {t('profile.changeAvatar')}
                      </Button>
                    </Upload>
                  </div>
                </div>
              </Form.Item>
            </Col>

            <Col xs={24} md={16}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="fullName"
                    label={t('profile.fullName')}
                    rules={[
                      { required: true, message: t('validation.required') },
                      { min: 2, max: 50, message: t('validation.nameLength') }
                    ]}
                  >
                    <Input placeholder={t('profile.fullNamePlaceholder')} />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label={t('profile.email')}
                    rules={[
                      { required: true, message: t('validation.required') },
                      { type: 'email', message: t('validation.email') }
                    ]}
                  >
                    <Input placeholder={t('profile.emailPlaceholder')} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label={t('profile.phone')}
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

                <Col xs={24} md={12}>
                  <Form.Item
                    name="language"
                    label={t('profile.language')}
                  >
                    <Select>
                      <Option value="ar">العربية</Option>
                      <Option value="en">English</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>

          <Divider orientation="left">{t('profile.notifications')}</Divider>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                name={['notifications', 'email']}
                label={t('profile.emailNotifications')}
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
                name={['notifications', 'sms']}
                label={t('profile.smsNotifications')}
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
                name={['notifications', 'browser']}
                label={t('profile.browserNotifications')}
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren={t('enabled')}
                  unCheckedChildren={t('disabled')}
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
                {t('save')}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
