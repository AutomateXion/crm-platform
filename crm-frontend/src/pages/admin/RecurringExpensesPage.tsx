import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Button, Input, Tag, Space, Modal, Form,
  Typography, Row, Col, message, Popconfirm, Tooltip, Select,
  InputNumber, DatePicker, Radio, Badge, Statistic, Divider,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined,
  HistoryOutlined, ReloadOutlined,
} from '@ant-design/icons';
import salesApi, { recurringApi } from '../../services/salesApi';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const FREQ_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly', MONTHLY: 'Monthly', QUARTERLY: 'Quarterly', YEARLY: 'Yearly',
};

export default function RecurringExpensesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dueCount, setDueCount] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [logOpen, setLogOpen] = useState(false);
  const [logRows, setLogRows] = useState<any[]>([]);
  const [logName, setLogName] = useState('');
  const [form] = Form.useForm();
  const genType = Form.useWatch('genType', form);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await recurringApi.getAll();
      setRows(r.data || []);
      const d = await recurringApi.dueCount();
      setDueCount(d.data?.due || 0);
    } catch (e: any) {
      message.error('Could not load recurring expenses');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadAccounts = async () => {
    try {
      const r = await salesApi.get('/sales/chart-of-accounts');
      const list = Array.isArray(r.data) ? r.data : (r.data?.data || []);
      setAccounts(list);
    } catch {
      setAccounts([]);
    }
  };

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    form.setFieldsValue({
      genType: 'JOURNAL', frequency: 'MONTHLY', intervalCount: 1,
      currencyCode: 'OMR', postMode: 'DRAFT', vatRate: 0,
      startDate: dayjs(), nextDueDate: dayjs(),
    });
    if (!accounts.length) loadAccounts();
    setModalOpen(true);
  };

  const openEdit = (r: any) => {
    setEditRecord(r);
    form.setFieldsValue({
      ...r,
      genType: r.gen_type,
      expenseAccountCode: r.expense_account_code,
      creditAccountCode: r.credit_account_code,
      supplierName: r.supplier_name,
      currencyCode: r.currency_code,
      vatRate: r.vat_rate,
      intervalCount: r.interval_count,
      dayOfMonth: r.day_of_month,
      maxOccurrences: r.max_occurrences,
      postMode: r.post_mode,
      startDate: r.start_date ? dayjs(r.start_date) : null,
      endDate: r.end_date ? dayjs(r.end_date) : null,
      nextDueDate: r.next_due_date ? dayjs(r.next_due_date) : null,
    });
    if (!accounts.length) loadAccounts();
    setModalOpen(true);
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const amount = Number(values.amount || 0);
      const vatRate = Number(values.vatRate || 0);
      const payload: any = {
        ...values,
        amount,
        vatRate,
        vatAmount: Math.round(amount * vatRate) / 100,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        nextDueDate: values.nextDueDate ? values.nextDueDate.format('YYYY-MM-DD') : undefined,
      };
      if (editRecord) await recurringApi.update(editRecord.id, payload);
      else await recurringApi.create(payload);
      message.success(editRecord ? 'Schedule updated' : 'Schedule created');
      setModalOpen(false);
      load();
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Could not save the schedule');
    } finally { setSaving(false); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const r = await recurringApi.generateDue();
      const { generated, skipped, failed } = r.data || {};
      if (generated > 0) message.success(`Generated ${generated} draft ${generated === 1 ? 'entry' : 'entries'}${failed ? `, ${failed} failed` : ''}`);
      else if (failed > 0) message.warning(`${failed} failed to generate — check the schedule accounts`);
      else message.info('Nothing due right now');
      load();
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Generation failed');
    } finally { setGenerating(false); }
  };

  const handleDeactivate = async (r: any) => {
    try { await recurringApi.remove(r.id); message.success('Schedule deactivated'); load(); }
    catch { message.error('Could not deactivate'); }
  };

  const openLog = async (r: any) => {
    setLogName(r.name); setLogOpen(true);
    try { const res = await recurringApi.log(r.id); setLogRows(res.data || []); }
    catch { setLogRows([]); }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name',
      render: (v: string, r: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>{v}</Text>
          {r.description && <Text type="secondary" style={{ fontSize: 12 }}>{r.description}</Text>}
        </Space>
      ) },
    { title: 'Type', dataIndex: 'gen_type', key: 'gen_type',
      render: (v: string) => <Tag color={v === 'BILL' ? 'purple' : 'blue'}>{v === 'BILL' ? 'Supplier Bill' : 'Journal'}</Tag> },
    { title: 'Amount', dataIndex: 'amount', key: 'amount',
      render: (v: number, r: any) => `${r.currency_code || 'OMR'} ${Number(v).toFixed(3)}` },
    { title: 'Frequency', dataIndex: 'frequency', key: 'frequency',
      render: (v: string, r: any) => {
        const lbl = FREQ_LABELS[v] || v;
        return r.interval_count > 1 ? `Every ${r.interval_count} ${lbl.toLowerCase()}` : lbl;
      } },
    { title: 'Next due', dataIndex: 'next_due_date', key: 'next_due_date',
      render: (v: string) => {
        if (!v) return '—';
        const due = dayjs(v).isSame(dayjs(), 'day') || dayjs(v).isBefore(dayjs(), 'day');
        return <Text type={due ? 'danger' : undefined}>{dayjs(v).format('DD MMM YYYY')}</Text>;
      } },
    { title: 'Posting', dataIndex: 'post_mode', key: 'post_mode',
      render: (v: string) => <Tag>{v === 'POSTED' ? 'Auto-post' : 'Draft'}</Tag> },
    { title: 'Status', dataIndex: 'is_active', key: 'is_active',
      render: (v: boolean) => v ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag> },
    { title: 'Actions', key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
          <Tooltip title="History"><Button size="small" icon={<HistoryOutlined />} onClick={() => openLog(r)} /></Tooltip>
          {r.is_active && (
            <Popconfirm title="Deactivate this schedule?" onConfirm={() => handleDeactivate(r)}>
              <Tooltip title="Deactivate"><Button size="small" danger icon={<DeleteOutlined />} /></Tooltip>
            </Popconfirm>
          )}
        </Space>
      ) },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>Recurring Expenses</Title>
          <Text type="secondary">Schedule rent, subscriptions, utilities and other regular costs. Entries are generated as drafts for your review.</Text>
        </Col>
        <Col>
          <Space>
            <Badge count={dueCount} offset={[-4, 4]}>
              <Button icon={<PlayCircleOutlined />} loading={generating} onClick={handleGenerate}>
                Generate due now
              </Button>
            </Badge>
            <Button icon={<ReloadOutlined />} onClick={load} />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New schedule</Button>
          </Space>
        </Col>
      </Row>

      {dueCount > 0 && (
        <Card size="small" style={{ marginBottom: 16, borderColor: '#faad14', background: '#fffbe6' }}>
          <Text>{dueCount} {dueCount === 1 ? 'schedule is' : 'schedules are'} due. Click <b>Generate due now</b> to create the draft entries.</Text>
        </Card>
      )}

      <Card>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={rows}
          columns={columns as any}
          pagination={{ pageSize: 20 }}
          locale={{ emptyText: 'No recurring expenses yet. Create your first schedule to automate regular costs.' }}
        />
      </Card>

      {/* Create / Edit */}
      <Modal
        title={editRecord ? 'Edit recurring expense' : 'New recurring expense'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        width={640}
        okText={editRecord ? 'Save changes' : 'Create schedule'}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Give the schedule a name' }]}>
                <Input placeholder="e.g. Office Rent - Muscat" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="genType" label="Generates" rules={[{ required: true }]}>
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="JOURNAL">Journal</Radio.Button>
                  <Radio.Button value="BILL">Bill</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <Input placeholder="Optional note" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Enter the amount' }]}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.001} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="vatRate" label="VAT %">
                <InputNumber style={{ width: '100%' }} min={0} max={100} step={0.5} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="currencyCode" label="Currency">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* Conditional: JOURNAL accounts vs BILL supplier */}
          {genType === 'BILL' ? (
            <Form.Item name="supplierName" label="Supplier" rules={[{ required: true, message: 'Enter the supplier name' }]}>
              <Input placeholder="e.g. Omantel — created automatically if new" />
            </Form.Item>
          ) : (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="expenseAccountCode" label="Expense account (debit)" rules={[{ required: true, message: 'Choose the expense account' }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Select expense account">
                    {accounts.map((a: any) => (
                      <Option key={a.accountCode || a.account_code} value={a.accountCode || a.account_code}>
                        {(a.accountCode || a.account_code)} — {(a.accountName || a.account_name)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="creditAccountCode" label="Paid from (credit)" rules={[{ required: true, message: 'Choose the credit account' }]}>
                  <Select showSearch optionFilterProp="children" placeholder="Bank / Cash / Accrued">
                    {accounts.map((a: any) => (
                      <Option key={a.accountCode || a.account_code} value={a.accountCode || a.account_code}>
                        {(a.accountCode || a.account_code)} — {(a.accountName || a.account_name)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          <Divider orientation="left" plain>Schedule</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="frequency" label="Frequency" rules={[{ required: true }]}>
                <Select>
                  <Option value="WEEKLY">Weekly</Option>
                  <Option value="MONTHLY">Monthly</Option>
                  <Option value="QUARTERLY">Quarterly</Option>
                  <Option value="YEARLY">Yearly</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="intervalCount" label="Every" tooltip="e.g. every 2 months">
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dayOfMonth" label="Day of month" tooltip="Preferred day (1-31), for monthly+">
                <InputNumber style={{ width: '100%' }} min={1} max={31} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="startDate" label="Start date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="nextDueDate" label="First run on" tooltip="Defaults to the start date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="endDate" label="End date" tooltip="Optional — leave blank for open-ended">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="maxOccurrences" label="Max occurrences" tooltip="Optional cap on total generations">
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="postMode" label="Posting" tooltip="Draft lets you review before posting">
                <Radio.Group>
                  <Radio value="DRAFT">Draft for review</Radio>
                  <Radio value="POSTED">Auto-post</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Generation log */}
      <Modal
        title={`Generation history — ${logName}`}
        open={logOpen}
        onCancel={() => setLogOpen(false)}
        footer={null}
        width={640}
      >
        <Table
          rowKey="id"
          size="small"
          dataSource={logRows}
          pagination={false}
          locale={{ emptyText: 'No entries generated yet.' }}
          columns={[
            { title: 'Period', dataIndex: 'period_date', render: (v: string) => dayjs(v).format('DD MMM YYYY') },
            { title: 'Type', dataIndex: 'result_type', render: (v: string) => v === 'BILL' ? 'Bill' : 'Journal' },
            { title: 'Number', dataIndex: 'result_number' },
            { title: 'Amount', dataIndex: 'amount', render: (v: number) => Number(v).toFixed(3) },
            { title: 'Status', dataIndex: 'status',
              render: (v: string) => <Tag color={v === 'FAILED' ? 'red' : v === 'POSTED' ? 'green' : 'blue'}>{v}</Tag> },
          ] as any}
        />
      </Modal>
    </div>
  );
}
