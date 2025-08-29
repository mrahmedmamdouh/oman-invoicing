import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Typography, 
  Progress,
  Tag,
  Button,
  Space,
  DatePicker,
  Select
} from 'antd';
import {
  FileTextOutlined,
  UserOutlined,
  DollarOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Line, Column, Pie } from '@ant-design/plots';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { selectCurrentUser } from '../../store/slices/authSlice';
import { formatCurrency, formatDate } from '../../utils/formatters';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Dashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);

  // Mock data - replace with real API calls
  const dashboardStats = {
    totalInvoices: 156,
    totalRevenue: 45678.125,
    activeCustomers: 89,
    paidInvoices: 134,
    pendingInvoices: 22,
    overdueInvoices: 8,
    vatCollected: 2283.906,
    avgInvoiceValue: 292.807
  };

  const recentInvoices = [
    {
      id: '1',
      invoiceNumber: 'INV-2025-001234',
      customerName: 'شركة عمان للتجارة',
      amount: 1050.000,
      status: 'paid',
      date: '2025-08-29'
    },
    {
      id: '2', 
      invoiceNumber: 'INV-2025-001235',
      customerName: 'مؤسسة الخليج التجارية',
      amount: 787.500,
      status: 'pending',
      date: '2025-08-28'
    }
  ];

  const salesData = [
    { month: 'يناير', sales: 35000 },
    { month: 'فبراير', sales: 42000 },
    { month: 'مارس', sales: 38000 },
    { month: 'أبريل', sales: 55000 },
    { month: 'مايو', sales: 48000 },
    { month: 'يونيو', sales: 61000 }
  ];

  const statusData = [
    { type: 'مدفوع', value: 134, color: '#52c41a' },
    { type: 'معلق', value: 22, color: '#faad14' },
    { type: 'متأخر', value: 8, color: '#ff4d4f' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      paid: 'success',
      pending: 'processing',
      overdue: 'error',
      draft: 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      paid: 'مدفوع',
      pending: 'معلق',
      overdue: 'متأخر',
      draft: 'مسودة'
    };
    return texts[status] || status;
  };

  const salesConfig = {
    data: salesData,
    xField: 'month',
    yField: 'sales',
    smooth: true,
    color: '#C8102E',
    point: {
      size: 5,
      shape: 'diamond',
      style: {
        fill: 'white',
        stroke: '#C8102E',
        lineWidth: 2,
      },
    },
    tooltip: {
      formatter: (datum) => {
        return { name: 'المبيعات', value: formatCurrency(datum.sales, 'OMR') };
      },
    },
  };

  const statusConfig = {
    data: statusData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} ({percentage})',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    color: statusData.map(item => item.color),
  };

  const invoiceColumns = [
    {
      title: t('invoice.number'),
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: t('customer.name'),
      dataIndex: 'customerName',
      key: 'customerName'
    },
    {
      title: t('invoice.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatCurrency(amount, 'OMR'),
      align: 'right'
    },
    {
      title: t('invoice.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: t('invoice.date'),
      dataIndex: 'date',
      key: 'date',
      render: (date) => formatDate(date)
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>
          {t('dashboard.welcome', 'مرحباً')}, {currentUser?.fullName || 'المستخدم'}
        </Title>
        <Text type="secondary">
          {t('dashboard.overview', 'نظرة عامة على أداء نشاطك التجاري')}
        </Text>
      </div>

      {/* Date Range Filter */}
      <Card style={{ marginBottom: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              {t('dashboard.analytics', 'التحليلات والإحصائيات')}
            </Title>
          </Col>
          <Col>
            <Space>
              <Text>{t('dashboard.period', 'الفترة')}:</Text>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.totalInvoices', 'إجمالي الفواتير')}
              value={dashboardStats.totalInvoices}
              prefix={<FileTextOutlined style={{ color: '#C8102E' }} />}
              valueStyle={{ color: '#C8102E' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.totalRevenue', 'إجمالي الإيرادات')}
              value={dashboardStats.totalRevenue}
              precision={3}
              prefix={<DollarOutlined style={{ color: '#009639' }} />}
              suffix="OMR"
              valueStyle={{ color: '#009639' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.activeCustomers', 'العملاء النشطون')}
              value={dashboardStats.activeCustomers}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.collectionRate', 'معدل التحصيل')}
              value={((dashboardStats.paidInvoices / dashboardStats.totalInvoices) * 100).toFixed(1)}
              prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts and Data */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={t('dashboard.salesTrend', 'اتجاه المبيعات')} style={{ height: 400 }}>
            <Line {...salesConfig} height={300} />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title={t('dashboard.invoiceStatus', 'حالة الفواتير')} style={{ height: 400 }}>
            <Pie {...statusConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12} lg={8}>
          <Card title={t('dashboard.vatSummary', 'ملخص ضريبة القيمة المضافة')}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>{t('dashboard.vatCollected', 'ضريبة محصلة')}:</Text>
                <Text strong>{formatCurrency(dashboardStats.vatCollected, 'OMR')}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>{t('dashboard.vatRate', 'المعدل')}:</Text>
                <Text>5%</Text>
              </div>
              <Progress 
                percent={75} 
                status="active" 
                strokeColor="#C8102E"
                format={() => '75% من الهدف الشهري'}
              />
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} md={12} lg={8}>
          <Card title={t('dashboard.paymentStatus', 'حالة المدفوعات')}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>{t('dashboard.paidInvoices', 'فواتير مدفوعة')}:</Text>
                <div>
                  <Text strong style={{ color: '#52c41a' }}>{dashboardStats.paidInvoices}</Text>
                  <ArrowUpOutlined style={{ color: '#52c41a', marginLeft: 8 }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>{t('dashboard.pendingInvoices', 'فواتير معلقة')}:</Text>
                <div>
                  <Text strong style={{ color: '#faad14' }}>{dashboardStats.pendingInvoices}</Text>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>{t('dashboard.overdueInvoices', 'فواتير متأخرة')}:</Text>
                <div>
                  <Text strong style={{ color: '#ff4d4f' }}>{dashboardStats.overdueInvoices}</Text>
                  <ArrowDownOutlined style={{ color: '#ff4d4f', marginLeft: 8 }} />
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} md={24} lg={8}>
          <Card title={t('dashboard.compliance', 'الامتثال والضرائب')}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>{t('compliance.digitalSignature', 'التوقيع الرقمي')}:</Text>
                <Tag color="success">نشط</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>{t('compliance.peppol', 'شبكة PEPPOL')}:</Text>
                <Tag color="success">متصل</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>{t('compliance.otaReporting', 'تقارير هيئة الضرائب')}:</Text>
                <Tag color="processing">آخر إرسال: أمس</Tag>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Invoices */}
      <Card 
        title={t('dashboard.recentInvoices', 'آخر الفواتير')}
        extra={
          <Button type="link">
            {t('dashboard.viewAll', 'عرض الكل')}
          </Button>
        }
      >
        <Table
          dataSource={recentInvoices}
          columns={invoiceColumns}
          pagination={false}
          rowKey="id"
          size="small"
        />
      </Card>
    </div>
  );
};

export default Dashboard;