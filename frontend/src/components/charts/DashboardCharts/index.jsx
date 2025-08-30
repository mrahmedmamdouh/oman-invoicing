import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, Space, Tag } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  DollarOutlined,
  FileTextOutlined,
  UserOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { Line, Column, Pie, Area } from '@ant-design/plots';
import { useTranslation } from 'react-i18next';

import { formatCurrency } from '../../../utils/formatters';

const { Title, Text } = Typography;

const DashboardCharts = ({
  salesData = [],
  invoiceStats = {},
  customerStats = {},
  complianceStats = {},
  loading = false
}) => {
  const { t } = useTranslation();

  // Sales trend chart configuration
  const salesTrendConfig = {
    data: salesData,
    xField: 'month',
    yField: 'amount',
    smooth: true,
    color: '#C8102E',
    point: {
      size: 4,
      shape: 'diamond',
      style: {
        fill: 'white',
        stroke: '#C8102E',
        lineWidth: 2,
      },
    },
    area: {
      style: {
        fill: 'l(270) 0:#C8102E 0.5:#ff7875 1:#fff1f0',
      },
    },
    tooltip: {
      formatter: (datum) => {
        return {
          name: t('dashboard.sales'),
          value: formatCurrency(datum.amount, 'OMR')
        };
      },
    },
    annotations: salesData.length > 0 ? [
      {
        type: 'text',
        position: ['max', 'median'],
        content: t('dashboard.trend'),
        offsetY: -4,
        style: {
          textBaseline: 'bottom',
        },
      },
    ] : [],
  };

  // Invoice status pie chart
  const invoiceStatusData = [
    { type: t('status.paid'), value: invoiceStats.paidCount || 0, color: '#52c41a' },
    { type: t('status.sent'), value: invoiceStats.sentCount || 0, color: '#1890ff' },
    { type: t('status.draft'), value: invoiceStats.draftCount || 0, color: '#d9d9d9' },
    { type: t('status.overdue'), value: invoiceStats.overdueCount || 0, color: '#ff4d4f' },
  ].filter(item => item.value > 0);

  const statusPieConfig = {
    appendPadding: 10,
    data: invoiceStatusData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    color: invoiceStatusData.map(item => item.color),
    label: {
      type: 'outer',
      content: '{name} ({percentage})',
      style: {
        fontSize: 12,
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        content: `${t('total')}\n${invoiceStats.totalCount || 0}`,
      },
    },
  };

  // Monthly revenue comparison
  const monthlyRevenueData = salesData.map(item => ({
    month: item.month,
    currentYear: item.amount,
    previousYear: item.previousYearAmount || item.amount * 0.8, // Mock previous year data
  }));

  const revenueComparisonConfig = {
    data: monthlyRevenueData,
    isGroup: true,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    color: ['#C8102E', '#009639'],
    columnStyle: {
      radius: [2, 2, 0, 0],
    },
    tooltip: {
      formatter: (datum) => {
        return {
          name: datum.type,
          value: formatCurrency(datum.value, 'OMR')
        };
      },
    },
  };

  // Transform data for grouped column chart
  const transformedRevenueData = monthlyRevenueData.flatMap(item => [
    {
      month: item.month,
      value: item.currentYear,
      type: t('dashboard.currentYear', '2025')
    },
    {
      month: item.month,
      value: item.previousYear,
      type: t('dashboard.previousYear', '2024')
    }
  ]);

  const groupedRevenueConfig = {
    data: transformedRevenueData,
    isGroup: true,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    color: ['#C8102E', '#009639'],
    columnStyle: {
      radius: [2, 2, 0, 0],
    },
  };

  return (
    <div className="dashboard-charts">
      {/* Key Metrics Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.totalRevenue')}
              value={invoiceStats.totalRevenue || 0}
              precision={3}
              valueStyle={{ color: '#C8102E' }}
              prefix={<DollarOutlined />}
              suffix="OMR"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ArrowUpOutlined style={{ color: '#52c41a' }} />
                {' +12.5% '}{t('dashboard.fromLastMonth')}
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.totalInvoices')}
              value={invoiceStats.totalCount || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<FileTextOutlined />}
            />
            <Progress
              percent={Math.round(((invoiceStats.paidCount || 0) / (invoiceStats.totalCount || 1)) * 100)}
              size="small"
              status="active"
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t('dashboard.collectionRate')}
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.activeCustomers')}
              value={customerStats.activeCount || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<UserOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Space>
                <Tag color="blue">{customerStats.newThisMonth || 0} {t('dashboard.new')}</Tag>
                <Tag color="green">{customerStats.businessCount || 0} {t('customer.business')}</Tag>
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.avgInvoiceValue')}
              value={invoiceStats.averageValue || 0}
              precision={3}
              valueStyle={{ color: '#722ed1' }}
              prefix={<TrophyOutlined />}
              suffix="OMR"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ArrowUpOutlined style={{ color: '#52c41a' }} />
                {' +8.2% '}{t('dashboard.fromLastPeriod')}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={16}>
          <Card 
            title={t('dashboard.salesTrend')}
            loading={loading}
            extra={
              <Space>
                <Tag color="processing">{t('dashboard.last6Months')}</Tag>
              </Space>
            }
          >
            {salesData.length > 0 ? (
              <Area {...salesTrendConfig} height={320} />
            ) : (
              <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text type="secondary">{t('noData')}</Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card 
            title={t('dashboard.invoiceStatus')}
            loading={loading}
          >
            {invoiceStatusData.length > 0 ? (
              <Pie {...statusPieConfig} height={320} />
            ) : (
              <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text type="secondary">{t('noData')}</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Revenue Comparison */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card 
            title={t('dashboard.revenueComparison')}
            loading={loading}
          >
            {transformedRevenueData.length > 0 ? (
              <Column {...groupedRevenueConfig} height={280} />
            ) : (
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text type="secondary">{t('noData')}</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Compliance Dashboard */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={8}>
          <Card title={t('compliance.digitalSignature')}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={Math.round(((complianceStats.signedInvoices || 0) / (invoiceStats.totalCount || 1)) * 100)}
                strokeColor="#52c41a"
                size={120}
                format={(percent) => (
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{percent}%</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{t('compliance.signed')}</div>
                  </div>
                )}
              />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">
                  {complianceStats.signedInvoices || 0} {t('of')} {invoiceStats.totalCount || 0} {t('invoices')}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title={t('compliance.peppol')}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={Math.round(((complianceStats.peppolInvoices || 0) / (invoiceStats.totalCount || 1)) * 100)}
                strokeColor="#1890ff"
                size={120}
                format={(percent) => (
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{percent}%</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{t('compliance.submitted')}</div>
                  </div>
                )}
              />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">
                  {complianceStats.peppolInvoices || 0} {t('dashboard.peppolSubmissions')}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title={t('tax.vatCompliance')}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={95} // Mock compliance percentage
                strokeColor="#C8102E"
                size={120}
                format={(percent) => (
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{percent}%</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{t('compliance.compliant')}</div>
                  </div>
                )}
              />
              <div style={{ marginTop: 16 }}>
                <Space direction="vertical" size="small">
                  <Tag color="success">{t('tax.vatReporting')}: {t('upToDate')}</Tag>
                  <Tag color="processing">{t('tax.nextDue')}: 28/09/2025</Tag>
                </Space>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardCharts;