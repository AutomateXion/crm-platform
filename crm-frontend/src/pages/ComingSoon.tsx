import React from 'react';
import { useLocation } from 'react-router-dom';
import { Result } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

export default function ComingSoon() {
  const loc = useLocation();
  // Pull a readable name from the route, e.g. /reports/stock-aging -> "Stock Aging"
  const slug = loc.pathname.split('/').filter(Boolean).pop() || 'report';
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <Result
      icon={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
      title={`${name} — Coming Soon`}
      subTitle="This report is planned and will be available in an upcoming release."
    />
  );
}
