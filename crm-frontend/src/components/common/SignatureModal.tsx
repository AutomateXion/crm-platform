import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Modal, Input, Button, message, Space, Tag, Typography } from 'antd';
import { EnvironmentOutlined, ClearOutlined, CheckOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;

const Lt = axios.create({ baseURL: '/sales-api' });
Lt.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('accessToken');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

interface Props {
  docType: 'DN' | 'INVOICE';
  docId: string;
  docNumber?: string;
  open: boolean;
  viewMode?: boolean;
  onClose: () => void;
  onSigned?: () => void;
}

export default function SignatureModal({ docType, docId, docNumber, open, viewMode, onClose, onSigned }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);
  const [signerName, setSignerName] = useState('');
  const [signerTitle, setSignerTitle] = useState('');
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<any>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    hasInk.current = false;
  }, []);

  useEffect(() => {
    if (open) {
      if (viewMode) {
        setLoadingExisting(true);
        setExisting(null);
        Lt.get(`/sales/signatures/${docType}/${docId}`)
          .then((r) => { setExisting((r.data && r.data[0]) || null); })
          .catch(() => { setExisting(null); })
          .finally(() => setLoadingExisting(false));
      } else {
        // slight delay so the canvas is mounted/visible before we size it
        setTimeout(setupCanvas, 50);
        setSignerName('');
        setSignerTitle('');
        setGps(null);
        setExisting(null);
      }
    }
  }, [open, viewMode, docType, docId, setupCanvas]);

  const pos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const isTouch = 'touches' in e;
    const clientX = isTouch ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = isTouch ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    hasInk.current = true;
  };

  const end = () => { drawing.current = false; };

  const clear = () => setupCanvas();

  const captureGps = () => {
    if (!navigator.geolocation) {
      message.warning('Geolocation not supported on this device');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setGps({ lat: p.coords.latitude, lng: p.coords.longitude });
        setGpsLoading(false);
        message.success('Location captured');
      },
      () => {
        setGpsLoading(false);
        message.warning('Could not get location (permission denied or unavailable)');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const save = async () => {
    if (!signerName.trim()) { message.error('Please enter the signer name'); return; }
    if (!hasInk.current) { message.error('Please capture a signature'); return; }
    setSaving(true);
    try {
      const signatureImage = canvasRef.current!.toDataURL('image/png');
      await Lt.post('/sales/signatures/in-person', {
        docType,
        docId,
        signerName: signerName.trim(),
        signerTitle: signerTitle.trim() || undefined,
        signatureImage,
        gpsLat: gps?.lat,
        gpsLng: gps?.lng,
      });
      message.success('Signature saved');
      onSigned?.();
      onClose();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to save signature');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`${viewMode ? 'Signature' : 'Capture Signature'}${docNumber ? ` — ${docNumber}` : ''}`}
      open={open}
      onCancel={onClose}
      width={460}
      footer={viewMode ? [
        <Button key="close" onClick={onClose}>Close</Button>,
      ] : [
        <Button key="clear" icon={<ClearOutlined />} onClick={clear}>Clear</Button>,
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button key="save" type="primary" icon={<CheckOutlined />} loading={saving} onClick={save}>
          Save Signature
        </Button>,
      ]}
    >
      {viewMode ? (
        <div style={{ marginTop: 8 }}>
          {loadingExisting ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#8c8c8c' }}>Loading signature…</div>
          ) : existing ? (
            <Space direction="vertical" style={{ width: '100%' }} size={10}>
              <div><Text type="secondary">Signed by:</Text> <Text strong>{existing.signerName}</Text>
                {existing.signerTitle ? <Text type="secondary"> ({existing.signerTitle})</Text> : null}</div>
              <div><Text type="secondary">Date:</Text> {new Date(existing.signedAt).toLocaleString('en-GB')}</div>
              {existing.gpsLat != null && existing.gpsLng != null && (
                <div>
                  <Text type="secondary">Location:</Text>{' '}
                  <a href={`https://maps.google.com/?q=${existing.gpsLat},${existing.gpsLng}`} target="_blank" rel="noreferrer">
                    {Number(existing.gpsLat).toFixed(5)}, {Number(existing.gpsLng).toFixed(5)}
                  </a>
                </div>
              )}
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Signature:</Text>
                <img
                  src={existing.signatureImage}
                  alt="signature"
                  style={{ width: '100%', border: '1px solid #f0f0f0', borderRadius: 8, background: '#fff' }}
                />
              </div>
            </Space>
          ) : (
            <div style={{ textAlign: 'center', padding: 32, color: '#8c8c8c' }}>No signature found.</div>
          )}
        </div>
      ) : (
      <div style={{ marginTop: 8 }}>
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <Input
            placeholder="Signer name *"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
          />
          <Input
            placeholder="Title / designation (optional)"
            value={signerTitle}
            onChange={(e) => setSignerTitle(e.target.value)}
          />

          <div>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Sign below:</div>
            <canvas
              ref={canvasRef}
              width={412}
              height={180}
              style={{
                width: '100%',
                height: 180,
                border: '1px dashed #d9d9d9',
                borderRadius: 8,
                touchAction: 'none',
                cursor: 'crosshair',
                background: '#fff',
              }}
              onMouseDown={start}
              onMouseMove={move}
              onMouseUp={end}
              onMouseLeave={end}
              onTouchStart={start}
              onTouchMove={move}
              onTouchEnd={end}
            />
          </div>

          <Space>
            <Button
              icon={<EnvironmentOutlined />}
              loading={gpsLoading}
              onClick={captureGps}
              type={gps ? 'default' : 'dashed'}
            >
              {gps ? 'Location captured' : 'Capture GPS location'}
            </Button>
            {gps && (
              <Tag color="green">
                {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
              </Tag>
            )}
          </Space>
        </Space>
      </div>
      )}
    </Modal>
  );
}
