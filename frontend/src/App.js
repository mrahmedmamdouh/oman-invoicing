import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ConfigProvider, App as AntApp } from 'antd';
import { useTranslation } from 'react-i18next';
import arEG from 'antd/locale/ar_EG';
import enUS from 'antd/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';

import { getOmanTheme } from './theme';
import Layout from './components/common/Layout';
import Loading from './components/common/Loading';
import ProtectedRoute from './components/common/ProtectedRoute';
import { selectCurrentUser, selectIsAuthenticated } from './store/slices/authSlice';

// Lazy load pages
const Login = React.lazy(() => import('./pages/Auth/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const InvoicesList = React.lazy(() => import('./pages/Invoices/InvoicesList'));
const CreateInvoice = React.lazy(() => import('./pages/Invoices/CreateInvoice'));
const EditInvoice = React.lazy(() => import('./pages/Invoices/EditInvoice'));
const InvoiceDetail = React.lazy(() => import('./pages/Invoices/InvoiceDetail'));
const CustomersList = React.lazy(() => import('./pages/Customers/CustomersList'));
const CreateCustomer = React.lazy(() => import('./pages/Customers/CreateCustomer'));
const CustomerDetail = React.lazy(() => import('./pages/Customers/CustomerDetail'));
const SalesReport = React.lazy(() => import('./pages/Reports/SalesReport'));
const TaxReport = React.lazy(() => import('./pages/Reports/TaxReport'));
const ComplianceReport = React.lazy(() => import('./pages/Reports/ComplianceReport'));
const Profile = React.lazy(() => import('./pages/Settings/Profile'));
const TaxSettings = React.lazy(() => import('./pages/Settings/TaxSettings'));

// Configure dayjs
dayjs.extend(customParseFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);

function App() {
  const { i18n } = useTranslation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const isRTL = i18n.language === 'ar';
  const antdLocale = isRTL ? arEG : enUS;

  useEffect(() => {
    // Set dayjs locale
    dayjs.locale(i18n.language);
    
    // Set document direction
    document.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
    
    // Set HTML classes for styling
    document.documentElement.classList.toggle('rtl', isRTL);
    document.documentElement.classList.toggle('ltr', !isRTL);
  }, [i18n.language, isRTL]);

  return (
    <ConfigProvider
      locale={antdLocale}
      direction={isRTL ? 'rtl' : 'ltr'}
      theme={getOmanTheme(isRTL)}
    >
      <AntApp>
        <div className={`app ${isRTL ? 'rtl' : 'ltr'}`}>
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
                } 
              />
              
              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                {/* Dashboard */}
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* Invoices */}
                <Route path="invoices" element={<InvoicesList />} />
                <Route path="invoices/create" element={<CreateInvoice />} />
                <Route path="invoices/:id" element={<InvoiceDetail />} />
                <Route path="invoices/:id/edit" element={<EditInvoice />} />
                
                {/* Customers */}
                <Route path="customers" element={<CustomersList />} />
                <Route path="customers/create" element={<CreateCustomer />} />
                <Route path="customers/:id" element={<CustomerDetail />} />
                
                {/* Reports */}
                <Route path="reports/sales" element={<SalesReport />} />
                <Route path="reports/tax" element={<TaxReport />} />
                <Route path="reports/compliance" element={<ComplianceReport />} />
                
                {/* Settings */}
                <Route path="settings/profile" element={<Profile />} />
                <Route path="settings/tax" element={<TaxSettings />} />
              </Route>
              
              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </div>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
