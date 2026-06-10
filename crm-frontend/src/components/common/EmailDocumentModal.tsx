import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, message, Space } from 'antd';
import { MailOutlined, SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getMultiPagePdfBase64 } from '../../utils/pdfGenerator';

// Core API client (email endpoint lives on core, via /api proxy)
const Ft = axios.create({ baseURL: '/api/v1' });
Ft.interceptors.request.use((cfg: any) => {
  const t = localStorage.getItem('accessToken');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const { TextArea } = Input;

interface Props {
  open: boolean;
  onClose: () => void;
  /** ids of the rendered A4 page divs to turn into the PDF attachment */
  pageIds: string[];
  /** filename for the attachment, e.g. INV-2026-0023.pdf */
  fileName: string;
  /** default recipient (customer email) */
  defaultTo?: string;
  /** default subject */
  defaultSubject?: string;
  /** default message body */
  defaultMessage?: string;
  /** label shown in the modal title, e.g. "Invoice INV-2026-0023" */
  docLabel?: string;
}

export default function EmailDocumentModal({
  open, onClose, pageIds, fileName, defaultTo, defaultSubject, defaultMessage, docLabel,
}: Props) {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setTo(defaultTo || '');
      setCc('');
      setSubject(defaultSubject || (docLabel ? docLabel : 'Document'));
      setBody(defaultMessage || 'Dear Customer,\n\nPlease find the attached document.\n\nThank you.');
    }
  }, [open, defaultTo, defaultSubject, defaultMessage, docLabel]);

  const send = async () => {
    if (!to.trim()) { message.error('Please enter a recipient email'); return; }
    setSending(true);
    try {
      // Generate the PDF from the on-page A4 divs
      const pdfBase64 = await getMultiPagePdfBase64(pageIds);
      if (!pdfBase64) { message.error('Could not generate the PDF. Open the document preview first.'); setSending(false); return; }
      await Ft.post('/tenants/email/send-document', {
        to: to.trim(),
        cc: cc.trim() || undefined,
        subject: subject.trim(),
        message: body,
        pdfBase64,
        fileName,
      });
      message.success(`Email sent to ${to.trim()}`);
      onClose();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      title={<span><MailOutlined /> Email {docLabel || 'Document'}</span>}
      open={open}
      onCancel={onClose}
      width={480}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button key="send" type="primary" icon={<SendOutlined />} loading={sending} onClick={send}>Send</Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <div>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>To *</div>
          <Input placeholder="customer@example.com" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>CC (optional)</div>
          <Input placeholder="cc@example.com" value={cc} onChange={(e) => setCc(e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Subject</div>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Message</div>
          <TextArea rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div style={{ fontSize: 12, color: '#1890ff' }}>
          📎 {fileName} will be attached as PDF
        </div>
      </Space>
    </Modal>
  );
}
