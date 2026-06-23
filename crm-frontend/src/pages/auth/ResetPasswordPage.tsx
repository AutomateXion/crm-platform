import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../services/api';

const { Title, Text } = Typography;

export default function ResetPasswordPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) setError('This reset link is missing its token. Please use the link from your email, or request a new one.');
  }, [token]);

  const handleSubmit = async (values: any) => {
    setError(null);
    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: values.newPassword });
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Could not reset your password. The link may be invalid or expired.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0d1b2a 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32,
        backdropFilter: 'blur(10px)',
      }}>
        <Title level={3} style={{ color: '#fff', textAlign: 'center', marginBottom: 4 }}>Set a new password</Title>
        <Text style={{ display: 'block', textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 24 }}>
          Choose a strong password you haven't used before.
        </Text>

        {done ? (
          <Alert type="success" showIcon
            message="Password reset"
            description="Your password has been updated. Redirecting you to sign in…" />
        ) : (
          <>
            {error && <Alert type="error" showIcon style={{ marginBottom: 16 }} message={error} />}
            <Form form={form} layout="vertical" onFinish={handleSubmit} size="large">
              <Form.Item
                name="newPassword"
                label={<span style={{ color: 'rgba(255,255,255,0.65)' }}>New password</span>}
                rules={[
                  { required: true, message: 'Enter a new password' },
                  { min: 8, message: 'Use at least 8 characters' },
                ]}
                hasFeedback
              >
                <Input.Password prefix={<LockOutlined />} placeholder="New password" disabled={!token} />
              </Form.Item>
              <Form.Item
                name="confirm"
                label={<span style={{ color: 'rgba(255,255,255,0.65)' }}>Confirm password</span>}
                dependencies={['newPassword']}
                hasFeedback
                rules={[
                  { required: true, message: 'Confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                      return Promise.reject(new Error('The two passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirm password" disabled={!token} />
              </Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading} disabled={!token}>
                Reset password
              </Button>
            </Form>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Typography.Link onClick={() => navigate('/login')} style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                Back to sign in
              </Typography.Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
