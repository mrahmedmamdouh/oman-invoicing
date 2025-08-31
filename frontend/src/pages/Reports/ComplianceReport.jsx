import React, { useState, useEffect } from 'react';
import {
  Card,
  DatePicker,
  Row,
  Col,
  Button,
  Table,
  Typography,
  Space,
  Statistic,
  Progress,
  Tag,
  Alert
} from 'antd';
import { 
  DownloadOutlined, 
  CheckCircleOutlined, 
  WarningOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { 
  fetchComplianceReport,
  exportReport,
  selectComplianceReport,
  selectReportsLoading 
} from '../../store/slices/reportsSlice';
import { formatDate, formatPercentage } from '../../utils/formatters';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ComplianceReport = () => {
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);

  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  const complianceReport = useSelector(selectComplianceReport);
  const loading = useSelector(selectReportsLoading);

  useEffect(() => {
    handleGenerateReport();
  }, []);

  const handleGenerateReport = async () => {
    const params = {
      startDate: dateRange[0].toISOString(),
      endDate: dateRange[1].toISOString()
    };

    dispatch(fetchComplianceReport(params));
  };

  const handleExport = (format) => {
    const params = {
      type: 'compliance',
      format,
      startDate: dateRange[0].toISOString(),
      endDate: dateRange[1].toISOString()
    };

    dispatch(exportReport(params));
  };

  const getComplianceStatus = (rate) => {
    if (rate >= 95) return { status: 'success', icon: <CheckCircleOutlined />, text: t('compliance.excellent') };
    if (rate >= 80) return { status: 'warning', icon: <WarningOutlined />, text: t('compliance.good') };
    return { status: 'error', icon: <ExclamationCircleOutlined />, text: t('compliance.needsImprovement') };
  };

  const complianceColumns = [
    {
      title: t('compliance.requirement'),
      dataIndex: 'requirement',
      key: 'requirement',
      width: 250
    },
    {
      title: t('compliance.compliantItems'),
      dataIndex: 'compliantItems',
      key: 'compliantItems',
      align: 'center',
      width: 120
    },
    {
      title: t('compliance.totalItems'),
      dataIndex: 'totalItems',
      key: 'totalItems',
      align: 'center',
      width: 120
    },
    {
      title: t('compliance.rate'),
      key: 'rate',
      width: 200,
      render: (_, record) => {
        const rate = Math.round((record.compliantItems / record.totalItems) * 100);
        const status = getComplianceStatus(rate);
        
        return (
          <Space>
            <Progress 
              percent={rate} 
              size="small" 
              status={status.status}
              style={{ minWidth: 100 }}
            />
            <Tag color={status.status} icon={status.icon}>
              {status.text}
            </Tag>
          </Space>
        );
      }
    },
    {
      title: t('compliance.status'),
      key: 'status',
      width: 120,
      render: (_, record) => {
        const rate = Math.round((record.compliantItems / record.totalItems) * 100);
        const status = getComplianceStatus(rate);
        
        return (
          <Tag color={status.status} icon={status.icon}>
            {formatPercentage(rate / 100)}
          </Tag>
        );
      }
    }
  ];

  const mockComplianceData = [
    {
      id: 1,
      requirement: t('compliance.digitalSignature'),
      compliantItems: 142,
      totalItems: 150,
      details: t('compliance.digitalSignatureDetails')
    },
    {
      id: 2,
      requirement: t('compliance.peppolSubmission'),
      compliantItems: 89,
      totalItems: 95,
      details: t('compliance.peppolSubmissionDetails')
    },
    {
      id: 3,
      requirement: t('compliance.vatCompliance'),
      compliantItems: 148,
      totalItems: 150,
      details: t('compliance.vatComplianceDetails')
    },
    {
      id: 4,
      requirement: t('compliance.invoiceNumbering'),
      compliantItems: 150,
      totalItems: 150,
      details: t('compliance.invoiceNumberingDetails')
    },
    {
      id: 5,
      requirement: t('compliance.customerData'),
      compliantItems: 134,
      totalItems: 150,
      details: t('compliance.customerDataDetails')
    }
  ];

  const overallCompliance = complianceReport?.overallCompliance || 
    Math.round(mockComplianceData.reduce((acc, item) => 
      acc + (item.compliantItems / item.totalItems), 0
    ) / mockComplianceData.length * 100);

  return (
    <div className="compliance-report">
      <Card>
        <div className="report-header">
          <Title level={2}>{t('reports.compliance')}</Title>
          
          <Row gutter={16} align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
              />
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

        {/* Compliance Status Alert */}
        <Alert
          message={
            overallCompliance >= 95 
              ? t('compliance.excellentStatus') 
              : overallCompliance >= 80 
                ? t('compliance.goodStatus')
                : t('compliance.needsAttention')
          }
          description={
            overallCompliance >= 95 
              ? t('compliance.excellentDescription')
              : overallCompliance >= 80 
                ? t('compliance.goodDescription')
                : t('compliance.improvementDescription')
          }
          type={overallCompliance >= 95 ? 'success' : overallCompliance >= 80 ? 'warning' : 'error'}
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* Overall Compliance Statistics */}
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title={t('compliance.overall')}
                value={overallCompliance}
                suffix="%"
                valueStyle={{ 
                  color: overallCompliance >= 95 ? '#52c41a' : 
                         overallCompliance >= 80 ? '#faad14' : '#ff4d4f'
                }}
              />
              <Progress 
                percent={overallCompliance} 
                size="small" 
                status={overallCompliance >= 95 ? 'success' : overallCompliance >= 80 ? 'active' : 'exception'}
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={6}>
            <Card size="small">
              <Statistic
                title={t('compliance.digitalSignatureRate')}
                value={95}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={6}>
            <Card size="small">
              <Statistic
                title={t('compliance.peppolRate')}
                value={94}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={6}>
            <Card size="small">
              <Statistic
                title={t('compliance.vatRate')}
                value={99}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Detailed Compliance Table */}
        <Table
          title={() => <Title level={4}>{t('compliance.detailedBreakdown')}</Title>}
          dataSource={complianceReport?.data || mockComplianceData}
          columns={complianceColumns}
          rowKey="id"
          pagination={false}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ margin: 16 }}>
                <Text>{record.details}</Text>
              </div>
            ),
            rowExpandable: (record) => !!record.details,
          }}
        />

        {/* Compliance Recommendations */}
        <Card 
          title={t('compliance.recommendations')} 
          size="small" 
          style={{ marginTop: 24 }}
        >
          <Space direction="vertical">
            <Text>• {t('compliance.recommendation1')}</Text>
            <Text>• {t('compliance.recommendation2')}</Text>
            <Text>• {t('compliance.recommendation3')}</Text>
            <Text>• {t('compliance.recommendation4')}</Text>
          </Space>
        </Card>
      </Card>
    </div>
  );
};

export default ComplianceReport;
