import React from 'react';
import { Card, Typography } from 'antd';
import { Line, Column } from '@ant-design/plots';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../utils/formatters';

const { Title } = Typography;

const SalesChart = ({
  data = [],
  type = 'line',
  title = 'Sales Chart',
  loading = false,
  height = 300
}) => {
  const { t } = useTranslation();

  const lineConfig = {
    data,
    xField: 'month',
    yField: 'amount',
    smooth: true,
    color: '#C8102E',
    point: {
      size: 4,
      shape: 'circle',
      style: {
        fill: 'white',
        stroke: '#C8102E',
        lineWidth: 2,
      },
    },
    tooltip: {
      formatter: (datum) => {
        return {
          name: t('sales'),
          value: formatCurrency(datum.amount, 'OMR')
        };
      },
    },
  };

  const columnConfig = {
    data,
    xField: 'month',
    yField: 'amount',
    color: '#C8102E',
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    tooltip: {
      formatter: (datum) => {
        return {
          name: t('sales'),
          value: formatCurrency(datum.amount, 'OMR')
        };
      },
    },
  };

  return (
    <Card title={title} loading={loading}>
      {type === 'line' ? (
        <Line {...lineConfig} height={height} />
      ) : (
        <Column {...columnConfig} height={height} />
      )}
    </Card>
  );
};

export default SalesChart;
