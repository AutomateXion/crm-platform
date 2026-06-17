import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Input, Divider, Empty, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import salesApi from '../../../services/salesApi';
import ExportButton from '../../../components/common/ExportButton';

const { Title, Text } = Typography;

export default function CashFlowPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const now = new Date();
    setFromDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
    setToDate(new Date().toISOString().slice(0, 10));
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await salesApi.get('/sales/cash-flow', { params: { fromDate: fromDate||undefined, toDate: toDate||undefined } });
      setData(r.data); setSearched(true);
    } catch {} finally { setLoading(false); }
  };

  const renderSection = (title: string, items: any[], color: string, total: number) => (
    <div style={{ marginBottom:20 }}>
      <div style={{ background:color+'15', padding:'8px 16px', borderLeft:`4px solid ${color}`, borderRadius:4, marginBottom:8 }}>
        <Text strong style={{ color, fontSize:14 }}>{title}</Text>
      </div>
      {(items||[]).map((item:any,i:number) => (
        <Row key={i} style={{ padding:'6px 16px', borderBottom:'1px solid #f0f0f0' }}>
          <Col span={18}><Text>{item.description}</Text></Col>
          <Col span={6} style={{ textAlign:'right' }}>
            <Text strong style={{ color: Number(item.amount||0) >= 0 ? '#52c41a' : '#ff4d4f' }}>
              {Number(item.amount||0) < 0 ? '(' : ''}OMR {Math.abs(Number(item.amount||0)).toFixed(3)}{Number(item.amount||0) < 0 ? ')' : ''}
            </Text>
          </Col>
        </Row>
      ))}
      <Row style={{ padding:'8px 16px', background:color+'10', borderRadius:4 }}>
        <Col span={18}><Text strong style={{ color }}>Net Cash from {title}</Text></Col>
        <Col span={6} style={{ textAlign:'right' }}>
          <Text strong style={{ color: Number(total||0) >= 0 ? color : '#ff4d4f' }}>
            OMR {Number(Math.abs(total||0)).toFixed(3)} {Number(total||0) < 0 ? '(Outflow)' : '(Inflow)'}
          </Text>
        </Col>
      </Row>
    </div>
  );

  return (
    <div id="cash-flow-report">
      <div style={{ marginBottom:20 }}>
        <Title level={4} style={{ margin:0 }}>Cash Flow Statement</Title>
        <Text type="secondary">Cash inflows and outflows for the selected period</Text>
      </div>
      <Card style={{ borderRadius:12, marginBottom:16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}><Text type="secondary" style={{ display:'block', marginBottom:4 }}>From Date</Text><Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></Col>
          <Col span={6}><Text type="secondary" style={{ display:'block', marginBottom:4 }}>To Date</Text><Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></Col>
          <Col span={4} style={{ paddingTop:22 }}><Button type="primary" icon={<SearchOutlined />} onClick={load} loading={loading} block>Generate</Button></Col>
          <Col span={4} style={{ paddingTop:22 }}>
            <ExportButton config={{ 
              elementId:'cash-flow-report', filename:'cash-flow',
              data: Array.isArray(data) ? data : (data?.items || data?.rows || data?.data || []),
            }} />
          </Col>
        </Row>
      </Card>
      {!searched ? <Card style={{ borderRadius:12 }}><Empty description="Select date range and click Generate" /></Card> : data && (
        <Card style={{ borderRadius:12 }}>
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <Title level={4} style={{ margin:0 }}>Cash Flow Statement</Title>
            <Text type="secondary">Period: {fromDate} to {toDate}</Text>
          </div>
          {renderSection('Operating Activities', data.operating?.items||[], '#52c41a', data.operating?.total||0)}
          {renderSection('Investing Activities', data.investing?.items||[], '#1890ff', data.investing?.total||0)}
          {renderSection('Financing Activities', data.financing?.items||[], '#2E6DA4', data.financing?.total||0)}
          <Divider />
          <Row style={{ padding:'16px', background:'#f6ffed', borderRadius:8, border:'2px solid #52c41a' }}>
            <Col span={12}><Text strong style={{ fontSize:16 }}>Opening Balance</Text></Col>
            <Col span={12} style={{ textAlign:'right' }}><Text strong style={{ fontSize:16 }}>OMR {Number(data.openingBalance||0).toFixed(3)}</Text></Col>
          </Row>
          <Row style={{ padding:'16px', marginTop:8, background:(data.netCashFlow||0)>=0?'#e6f7ff':'#fff2f0', borderRadius:8, border:`2px solid ${(data.netCashFlow||0)>=0?'#1890ff':'#ff4d4f'}` }}>
            <Col span={12}><Text strong style={{ fontSize:18 }}>Net Cash Flow</Text></Col>
            <Col span={12} style={{ textAlign:'right' }}>
              <Text strong style={{ fontSize:18, color:(data.netCashFlow||0)>=0?'#1890ff':'#ff4d4f' }}>
                OMR {Number(Math.abs(data.netCashFlow||0)).toFixed(3)} {(data.netCashFlow||0)<0?'(Deficit)':'(Surplus)'}
              </Text>
            </Col>
          </Row>
          <Row style={{ padding:'16px', marginTop:8, background:'#f6ffed', borderRadius:8, border:'2px solid #52c41a' }}>
            <Col span={12}><Text strong style={{ fontSize:16 }}>Closing Balance</Text></Col>
            <Col span={12} style={{ textAlign:'right' }}><Text strong style={{ fontSize:16, color:'#52c41a' }}>OMR {Number(data.closingBalance||0).toFixed(3)}</Text></Col>
          </Row>
        </Card>
      )}
    </div>
  );
}
