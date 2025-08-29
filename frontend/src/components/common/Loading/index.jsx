import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './Loading.css';

const Loading = ({ size = 'large', tip = 'جاري التحميل...' }) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
  
  return (
    <div className="loading-container">
      <Spin indicator={antIcon} size={size} tip={tip} />
    </div>
  );
};

export default Loading;
