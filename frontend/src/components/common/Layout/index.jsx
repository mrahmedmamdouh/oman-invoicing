import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Dropdown, Avatar, Switch, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GlobalOutlined,
  BellOutlined,
} from '@ant-design/icons';

import { logoutUser, selectCurrentUser } from '../../../store/slices/authSlice';
import './Layout.css';

const { Header, Sider, Content } = AntLayout;

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentUser = useSelector(selectCurrentUser);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('dashboard'),
    },
    {
      key: '/invoices',
      icon: <FileTextOutlined />,
      label: t('invoices'),
      children: [
        { key: '/invoices', label: t('invoices.list', 'All Invoices') },
        { key: '/invoices/create', label: t('invoices.create') },
      ],
    },
    {
      key: '/customers',
      icon: <UserOutlined />,
      label: t('customers'),
      children: [
        { key: '/customers', label: t('customers.list', 'All Customers') },
        { key: '/customers/create', label: t('customers.create', 'Add Customer') },
      ],
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: t('reports'),
      children: [
        { key: '/reports/sales', label: t('reports.sales', 'Sales Report') },
        { key: '/reports/tax', label: t('reports.tax', 'Tax Report') },
        { key: '/reports/compliance', label: t('reports.compliance', 'Compliance Report') },
      ],
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('settings'),
      children: [
        { key: '/settings/profile', label: t('settings.profile', 'Profile') },
        { key: '/settings/tax', label: t('settings.tax', 'Tax Settings') },
      ],
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('settings.profile', 'Profile'),
      onClick: () => navigate('/settings/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('settings'),
      onClick: () => navigate('/settings/profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('auth.logout', 'Logout'),
      onClick: handleLogout,
    },
  ];

  return (
    <AntLayout className="layout-container">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="layout-sider"
        width={250}
      >
        <div className="logo">
          <img src="/logo.png" alt="Logo" className="logo-img" />
          {!collapsed && <span className="logo-text">نظام الفوترة</span>}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="main-menu"
        />
      </Sider>
      
      <AntLayout>
        <Header className="layout-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="trigger"
            />
          </div>
          
          <div className="header-right">
            <Button
              type="text"
              icon={<GlobalOutlined />}
              onClick={toggleLanguage}
              className="lang-toggle"
            >
              {i18n.language.toUpperCase()}
            </Button>
            
            <Button
              type="text"
              icon={<BellOutlined />}
              className="notifications"
            />
            
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
            >
              <div className="user-info">
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="username">{currentUser?.fullName}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="layout-content">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
