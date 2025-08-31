import React from 'react';
import { Card, Typography, Progress, Row, Col } from 'antd';
import { Pie, Gauge } from '@ant-design/plots';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../utils/formatters';

const { Title, Text } = Typography;

const TaxChart = ({
  data = {},
  loading = false,
  height = 300
}) => {
  const { t } = useTranslation();

  const {
    vatCollected = 0,
    vatDue = 0,
    corporateTax = 0,
    withholdingTax = 0,
    complianceRate = 95
  } = data;

  const taxBreakdownData = [
    { type: t('tax.vat'), value: vatCollected, color: '#C8102E' },
    { type: t('tax.corporate'), value: corporateTax, color: '#009639' },
    { type: t('tax.withholding'), value: withholdingTax, color: '#faad14' }
  ].filter(item => item.value > 0);

  const pieConfig = {
    data: taxBreakdownData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    color: taxBreakdownData.map(item => item.color),
    label: {
      type: 'outer',
      content: '{name}: {percentage}',
      style: { fontSize: 12 }
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

  const gaugeConfig = {
    percent: complianceRate / 100,
    type: 'meter',
    meter: {
      steps: 50,
      stepRatio: 0.6,
    },
    statistic: {
      content: {
        style: {
          fontSize: '24px',
          color: complianceRate >= 90 ? '#52c41a' : complianceRate >= 70 ? '#faad14' : '#ff4d4f',
        },
        formatter: () => `${complianceRate}%`,
      },
    },
  };

  return (
    <Card title={t('tax.dashboard')} loading={loading}>
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Title level={4}>{t('tax.breakdown')}</Title>
          {taxBreakdownData.length > 0 ? (
            <Pie {...pieConfig} height={height} />
          ) : (
            <Text type="secondary">{t('noData')}</Text>
          )}
        </Col>
        
        <Col xs={24} md={12}>
          <Title level={4}>{t('compliance.rate')}</Title>
          <Gauge {...gaugeConfig} height={height} />
          
          <div style={{ marginTop: 16 }}>
            <Row justify="space-between" style={{ marginBottom: 8 }}>
              <Text>{t('tax.vatDue')}:</Text>
              <Text strong>{formatCurrency(vatDue, 'OMR')}</Text>
            </Row>
            <Progress 
              percent={Math.min(100, (vatCollected / Math.max(vatDue, 1)) * 100)}
              status={vatCollected >= vatDue ? 'success' : 'active'}
              format={() => `${formatCurrency(vatCollected, 'OMR')} / ${formatCurrency(vatDue, 'OMR')}`}
            />
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default TaxChart;
