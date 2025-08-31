import React, { useState, useEffect } from 'react';
import {
  Card,
  DatePicker,
  Select,
  Row,
  Col,
  Button,
  Table,
  Typography,
  Space,
  Statistic
} from 'antd';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { 
  fetchSalesReport,
  exportReport,
  selectSalesReport,
  selectReportsLoading 
} from '../../store/slices/reportsSlice';
import { formatCurrency, formatDate } from '../../utils/formatters';
import SalesChart from '../../components/charts/SalesChart';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const SalesReport = () => {
  const [filters, setFilters] = useState({
    dateRange: [dayjs().subtract(30, 'days'), dayjs()],
    groupBy: 'day',
    currency: 'OMR'
  });

  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  const salesReport = useSelector(selectSalesReport);
  const loading = useSelector(selectReportsLoading);

  useEffect(() => {
    handleGenerateReport();
  }, []);

  const handleGenerateReport = async () => {
    const params = {
      startDate: filters.dateRange[0].toISOString(),
      endDate: filters.dateRange[1].toISOString(),
      groupBy: filters.groupBy,
      currency: filters.currency
    };

    dispatch(fetchSalesReport(params));
  };

  const handleExport = (format) => {
    const params = {
      type: 'sales',
      format,
      startDate: filters.dateRange[0].toISOString(),
      endDate: filters.dateRange[1].toISOString(),
      groupBy: filters.groupBy
    };

    dispatch(exportReport(params));
  };

  const columns = [
    {
      title: t('reports.period'),
      dataIndex: 'period',
      key: 'period',
      render: (date) => formatDate(date, { format: 'DD/MM/YYYY' })
    },
    {
      title: t('reports.invoices'),
      dataIndex: 'invoiceCount',
      key: 'invoiceCount',
      align: 'center'
    },
    {
      title: t('reports.grossSales'),
      dataIndex: 'grossSales',
      key: 'grossSales',
      render: (amount) => formatCurrency(amount, filters.currency),
      align: 'right'
    },
    {
      title: t('reports.vat'),
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      render: (amount) => formatCurrency(amount, filters.currency),
      align: 'right'
    },
    {
      title: t('reports.netSales'),
      dataIndex: 'netSales',
      key: 'netSales',
      render: (amount) => formatCurrency(amount, filters.currency),
      align: 'right'
    }
  ];

  return (
    <div className="sales-report">
      <Card>
        <div className="report-header">
          <Title level={2}>{t('reports.sales')}</Title>
          
          <Row gutter={16} align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <RangePicker
                value={filters.dateRange}
                onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                format="DD/MM/YYYY"
              />
            </Col>
            
            <Col>
              <Select
                value={filters.groupBy}
                onChange={(value) => setFilters({ ...filters, groupBy: value })}
                style={{ width: 120 }}
              >
                <Option value="day">{t('reports.daily')}</Option>
                <Option value="week">{t('reports.weekly')}</Option>
                <Option value="month">{t('reports.monthly')}</Option>
              </Select>
            </Col>
            
            <Col>
              <Button type="primary" onClick={handleGenerateReport} loading={loading}>
                {t('reports.generate')}
              </Button>
            </Col>
            
            <Col>
              <Space>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => handleExport('pdf')}
                >
                  PDF
                </Button>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => handleExport('excel')}
                >
                  Excel
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {salesReport && (
          <>
            {/* Summary Statistics */}
            <Row gutter={24} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={6}>
                <Statistic
                  title={t('reports.totalSales')}
                  value={salesReport.summary?.totalSales || 0}
                  precision={3}
                  suffix="OMR"
                  valueStyle={{ color: '#C8102E' }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title={t('reports.totalInvoices')}
                  value={salesReport.summary?.totalInvoices || 0}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title={t('reports.averageValue')}
                  value={salesReport.summary?.averageInvoiceValue || 0}
                  precision={3}
                  suffix="OMR"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title={t('reports.totalVAT')}
                  value={salesReport.summary?.totalVAT || 0}
                  precision={3}
                  suffix="OMR"
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
            </Row>

            {/* Sales Chart */}
            <SalesChart
              data={salesReport.chartData || []}
              title={t('reports.salesTrend')}
              height={300}
            />

            {/* Detailed Table */}
            <Table
              dataSource={salesReport.data || []}
              columns={columns}
              rowKey="period"
              pagination={false}
              style={{ marginTop: 24 }}
              summary={(data) => {
                if (!data.length) return null;
                
                const totals = data.reduce((acc, item) => ({
                  invoiceCount: acc.invoiceCount + item.invoiceCount,
                  grossSales: acc.grossSales + item.grossSales,
                  vatAmount: acc.vatAmount + item.vatAmount,
                  netSales: acc.netSales + item.netSales
                }), { invoiceCount: 0, grossSales: 0, vatAmount: 0, netSales: 0 });

                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <strong>{t('total')}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <strong>{totals.invoiceCount}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <strong>{formatCurrency(totals.grossSales, filters.currency)}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>
                      <strong>{formatCurrency(totals.vatAmount, filters.currency)}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4}>
                      <strong>{formatCurrency(totals.netSales, filters.currency)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default SalesReport;
