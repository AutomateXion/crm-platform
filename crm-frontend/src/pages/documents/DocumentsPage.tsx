import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Button, Input, Select, Tag, Space, Modal, Form,
  Typography, Row, Col, message, Tooltip, Upload, Progress,
  Avatar, Statistic, Popconfirm, Badge,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, UploadOutlined, DownloadOutlined,
  DeleteOutlined, FileTextOutlined, FilePdfOutlined, FileExcelOutlined,
  FileImageOutlined, FileOutlined, ShareAltOutlined, EyeOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

const FILE_ICONS: Record<string, React.ReactNode> = {
  'application/pdf':    <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />,
  'application/vnd.ms-excel': <FileExcelOutlined style={{ color: '#52c41a', fontSize: 20 }} />,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': <FileExcelOutlined style={{ color: '#52c41a', fontSize: 20 }} />,
  'image/jpeg':  <FileImageOutlined style={{ color: '#1890ff', fontSize: 20 }} />,
  'image/png':   <FileImageOutlined style={{ color: '#1890ff', fontSize: 20 }} />,
  'default':     <FileOutlined style={{ color: '#8c8c8c', fontSize: 20 }} />,
};

const TYPE_COLORS: Record<string, string> = {
  CONTRACT: '#2E6DA4', PROPOSAL: '#1890ff', NDA: '#fa8c16',
  INVOICE: '#52c41a', SOW: '#13c2c2', OTHER: '#8c8c8c',
};

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [uploadModal, setUploadModal] = useState(false);
  const [shareModal, setShareModal] = useState<any>(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/documents', { params: { page, limit: 20, search: search || undefined, typeCode: typeFilter || undefined } });
      setDocs(r.data.data); setTotal(r.data.total);
    } catch {} finally { setLoading(false); }
  }, [page, search, typeFilter]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (values: any) => {
    setUploading(true);
    try {
      const formData = new FormData();
      if (values.file?.fileList?.[0]) formData.append('file', values.file.fileList[0].originFileObj);
      formData.append('documentName', values.documentName);
      formData.append('documentTypeCode', values.documentTypeCode || 'OTHER');
      if (values.description) formData.append('description', values.description);
      if (values.relatedToType) formData.append('relatedToType', values.relatedToType);
      if (values.tags) formData.append('tags', JSON.stringify(values.tags));

      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('Document uploaded successfully');
      setUploadModal(false); form.resetFields(); load();
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDelete = async (docId: string) => {
    try {
      await api.delete(`/documents/${docId}`);
      message.success('Document removed');
      load();
    } catch { message.error('Delete failed'); }
  };

  const handleDownload = async (doc: any) => {
    try {
      const r = await api.get(`/documents/${doc.documentId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.fileName || doc.documentName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch { message.error('Download failed'); }
  };

  const handleShare = async () => {
    try {
      const r = await api.post(`/documents/${shareModal.documentId}/share`, { expiresInDays: 7 });
      const shareUrl = `${window.location.origin}/shared/${r.data.shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      message.success('Share link copied to clipboard (valid 7 days)');
      setShareModal(null);
    } catch { message.error('Failed to generate share link'); }
  };

  // Stats
  const totalSize = docs.reduce((s, d) => s + (d.fileSize || 0), 0);
  const expiringCount = docs.filter(d => {
    if (!d.expiryDate) return false;
    const days = (new Date(d.expiryDate).getTime() - Date.now()) / 86400000;
    return days <= 30 && days > 0;
  }).length;

  const columns = [
    {
      title: 'Document', key: 'doc',
      render: (_: any, r: any) => (
        <Space>
          <div style={{
            width: 40, height: 40, borderRadius: 8, background: '#f5f5f5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {FILE_ICONS[r.mimeType] || FILE_ICONS.default}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.documentName}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>{r.fileName} · {formatBytes(r.fileSize)}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Type', dataIndex: 'documentTypeCode',
      render: (v: string) => v ? (
        <Tag style={{ background: `${TYPE_COLORS[v] || '#8c8c8c'}20`, color: TYPE_COLORS[v] || '#8c8c8c',
          border: `1px solid ${TYPE_COLORS[v] || '#8c8c8c'}40`, borderRadius: 20 }}>
          {v}
        </Tag>
      ) : '—',
    },
    {
      title: 'Related To', key: 'related',
      render: (_: any, r: any) => r.relatedToName ? (
        <div>
          <Tag style={{ borderRadius: 6, fontSize: 10 }}>{r.relatedToType}</Tag>
          <div style={{ fontSize: 12, marginTop: 2 }}>{r.relatedToName}</div>
        </div>
      ) : '—',
    },
    {
      title: 'Version', dataIndex: 'version',
      render: (v: number) => <Badge count={`v${v}`} style={{ background: '#1890ff' }} />,
    },
    {
      title: 'Expiry', dataIndex: 'expiryDate',
      render: (v: string) => {
        if (!v) return '—';
        const days = (new Date(v).getTime() - Date.now()) / 86400000;
        const color = days < 0 ? 'red' : days <= 30 ? 'orange' : 'default';
        return <Tag color={color}>{new Date(v).toLocaleDateString('en-GB')}</Tag>;
      },
    },
    {
      title: 'Uploaded', dataIndex: 'createdAt',
      render: (v: string) => new Date(v).toLocaleDateString('en-GB'),
    },
    {
      title: '', key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          <Tooltip title="Download"><Button size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(r)} /></Tooltip>
          <Tooltip title="Share Link"><Button size="small" icon={<ShareAltOutlined />} onClick={() => setShareModal(r)} /></Tooltip>
          <Popconfirm title="Delete document?" onConfirm={() => handleDelete(r.documentId)}>
            <Tooltip title="Delete"><Button size="small" danger icon={<DeleteOutlined />} /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Document Management</Title>
          <Text type="secondary">Centralized repository for all contracts, proposals and files</Text>
        </div>
        <Button type="primary" icon={<UploadOutlined />} onClick={() => setUploadModal(true)} style={{ borderRadius: 8 }}>
          Upload Document
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        {[
          { label: 'Total Documents', value: total, icon: <FileTextOutlined />, color: '#1890ff', bg: '#e6f7ff' },
          { label: 'Total Size', value: formatBytes(totalSize), icon: <FolderOutlined />, color: '#2E6DA4', bg: '#f9f0ff' },
          { label: 'Expiring Soon', value: expiringCount, icon: <FileTextOutlined />, color: '#fa8c16', bg: '#fff7e6' },
        ].map(s => (
          <Col xs={24} sm={8} key={s.label}>
            <Card size="small" style={{ borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Statistic title={<Text style={{ fontSize: 11, color: '#8c8c8c' }}>{s.label}</Text>}
                  value={s.value} valueStyle={{ color: s.color, fontSize: 20 }} />
                <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: s.color }}>
                  {s.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 12, borderRadius: 12 }}>
        <Row gutter={12}>
          <Col flex="auto">
            <Input prefix={<SearchOutlined />} placeholder="Search documents..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} allowClear style={{ borderRadius: 8 }} />
          </Col>
          <Col>
            <Select placeholder="Document Type" allowClear style={{ width: 180 }}
              onChange={v => { setTypeFilter(v || ''); setPage(1); }}>
              {Object.keys(TYPE_COLORS).map(t => <Option key={t} value={t}>{t}</Option>)}
            </Select>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table dataSource={docs} columns={columns} rowKey="documentId" loading={loading}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage, showTotal: t => `${t} documents` }} />
      </Card>

      {/* Upload Modal */}
      <Modal title="Upload Document" open={uploadModal} onCancel={() => setUploadModal(false)} footer={null} width={540}>
        <Form form={form} layout="vertical" onFinish={handleUpload} style={{ marginTop: 16 }}>
          <Form.Item name="file" label="File" rules={[{ required: true, message: 'Please select a file' }]}>
            <Dragger maxCount={1} beforeUpload={() => false} style={{ borderRadius: 8 }}>
              <p style={{ fontSize: 24 }}><UploadOutlined /></p>
              <p>Click or drag file to upload</p>
              <p style={{ color: '#8c8c8c', fontSize: 12 }}>PDF, Word, Excel, Images — max 25MB</p>
            </Dragger>
          </Form.Item>
          <Form.Item name="documentName" label="Document Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Service Agreement 2024" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="documentTypeCode" label="Type">
                <Select placeholder="Select type" allowClear>
                  {Object.keys(TYPE_COLORS).map(t => <Option key={t} value={t}>{t}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="relatedToType" label="Related To">
                <Select placeholder="Record type" allowClear>
                  <Option value="ACCOUNT">Account</Option>
                  <Option value="CONTACT">Contact</Option>
                  <Option value="OPPORTUNITY">Opportunity</Option>
                  <Option value="TICKET">Support Ticket</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="expiryDate" label="Expiry Date (optional)">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Brief description..." />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setUploadModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={uploading} icon={<UploadOutlined />}>
              Upload
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Share Confirmation Modal */}
      <Modal title="Share Document" open={!!shareModal} onCancel={() => setShareModal(null)}
        onOk={handleShare} okText="Copy Share Link">
        <p>Generate a shareable link for <strong>{shareModal?.documentName}</strong>.</p>
        <p style={{ color: '#8c8c8c', fontSize: 13 }}>The link will expire in <strong>7 days</strong> and can be accessed without login.</p>
      </Modal>
    </div>
  );
}
