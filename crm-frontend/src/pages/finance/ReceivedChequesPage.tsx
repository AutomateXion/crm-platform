import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Typography, Row, Col, Tag, Statistic, Space, message, Popconfirm, DatePicker, Select, Alert } from 'antd';
import { BankOutlined, CheckCircleOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { pdcChequesApi, bankAccountsApi } from '../../services/salesApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function ReceivedChequesPage() {
  const [cheques, setCheques] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [depositing, setDepositing] = useState(false);
  const [banks, setBanks] = useState<any[]>([]);
  const [overrideBank, setOverrideBank] = useState<string | undefined>(undefined);
  const [filterDue, setFilterDue] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterDue) params.dueOnly = true;
      const r = await pdcChequesApi.getAll(params);
      setCheques(r.data || []);
    } catch { message.error('Failed to load cheques'); }
    finally { setLoading(false); }
  }, [filterDue]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { bankAccountsApi.getAll().then(r => setBanks(r.data || [])).catch(() => {}); }, []);

  const dueCheques = cheques.filter(c => c.isDue);
  const totalDue = dueCheques.reduce((s, c) => s + Number(c.amount || 0), 0);
  const totalHeld = cheques.reduce((s, c) => s + Number(c.amount || 0), 0);

  const selectDueToday = () => {
    setSelectedKeys(dueCheques.map(c => c.receiptId));
  };

  const handleDeposit = async () => {
    if (!selectedKeys.length) { message.warning('Select cheques to deposit'); return; }
    setDepositing(true);
    try {
      const r = await pdcChequesApi.deposit(selectedKeys, overrideBank);
      message.success(`${r.data.deposited} cheque(s) deposited and posted to journal on ${r.data.depositDate}`);
      setSelectedKeys([]);
      setOverrideBank(undefined);
      load();
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Deposit failed');
    } finally { setDepositing(false); }
  };

  const columns = [
    { title: 'Cheque Date', dataIndex: 'chequeDate', width: 120, render: (v: string, r: any) => (
      <Space direction="vertical" size={0}>
        <Text strong style={{ color: r.isDue ? '#cf1322' : '#000' }}>{v ? dayjs(v).format('DD MMM YYYY') : '—'}</Text>
        {r.isDue ? <Tag color="red" style={{ fontSize: 10 }}>DUE</Tag> :
          <Text type="secondary" style={{ fontSize: 11 }}>in {r.daysUntilDue} days</Text>}
      </Space>
    )},
    { title: 'Cheque No.', dataIndex: 'chequeNumber', width: 120, render: (v: string) => <Text code>{v || '—'}</Text> },
    { title: 'Customer', dataIndex: 'customerName', width: 220, render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Drawer Bank', dataIndex: 'chequeBankName', width: 160, render: (v: string) => v || '—' },
    { title: 'Deposit To', dataIndex: 'depositBankName', width: 160, render: (v: string) => v ? <Space size={4}><BankOutlined style={{ color: '#1890ff' }} />{v}</Space> : <Tag color="orange">Not set</Tag> },
    { title: 'Receipt', dataIndex: 'receiptNumber', width: 130, render: (v: string) => <Text type="secondary">{v}</Text> },
    { title: 'Amount', dataIndex: 'amount', width: 140, align: 'right' as const, render: (v: number) => <Text strong style={{ whiteSpace: 'nowrap' }}>OMR {Number(v).toFixed(3)}</Text> },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Received Cheques (PDC)</Title>
        <Text type="secondary">Post-dated cheques held in hand — deposit on cheque date to credit the bank</Text>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}><Card><Statistic title="Cheques in Hand" value={cheques.length} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={8}><Card><Statistic title="Due for Deposit Today" value={dueCheques.length} valueStyle={{ color: dueCheques.length > 0 ? '#cf1322' : '#3f8600' }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={8}><Card><Statistic title="Total Held (PDC)" value={totalHeld} precision={3} prefix="OMR" valueStyle={{ color: '#1890ff' }} /></Card></Col>
      </Row>

      {dueCheques.length > 0 && (
        <Alert
          type="warning" showIcon style={{ marginBottom: 16 }}
          message={`${dueCheques.length} cheque(s) totalling OMR ${totalDue.toFixed(3)} are due for deposit today or earlier`}
          action={<Button size="small" type="primary" onClick={selectDueToday}>Select All Due</Button>}
        />
      )}

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Button onClick={() => setFilterDue(!filterDue)} type={filterDue ? 'primary' : 'default'}>
            {filterDue ? 'Showing Due Only' : 'Show All'}
          </Button>
          <Select
            placeholder="Override deposit bank (optional)" allowClear style={{ width: 240 }}
            value={overrideBank} onChange={setOverrideBank}
            options={banks.map((b: any) => ({ value: b.bankAccountId, label: `${b.accountName} — ${b.bankName}` }))}
          />
          <Popconfirm
            title="Deposit selected cheques?"
            description={`This will post Dr Bank / Cr PDC journal entries dated today (${dayjs().format('DD MMM YYYY')}) for ${selectedKeys.length} cheque(s).`}
            onConfirm={handleDeposit} disabled={!selectedKeys.length}
          >
            <Button type="primary" icon={<DollarOutlined />} loading={depositing} disabled={!selectedKeys.length}>
              Deposit Selected ({selectedKeys.length})
            </Button>
          </Popconfirm>
        </Space>

        <Table
          rowKey="receiptId"
          dataSource={cheques}
          columns={columns}
          loading={loading}
          size="middle"
          scroll={{ x: 'max-content' }}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: (keys) => setSelectedKeys(keys as string[]),
          }}
          pagination={{ pageSize: 20 }}
          summary={(data) => {
            const total = data.reduce((s, r: any) => s + Number(r.amount || 0), 0);
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={6}><Text strong>Total</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right"><Text strong>OMR {total.toFixed(3)}</Text></Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Card>
    </div>
  );
}
