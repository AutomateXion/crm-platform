import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Alert, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, BankOutlined, SafetyOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';

const { Text, Link } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, accessToken, requiresTwoFactor } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    if (accessToken) navigate('/dashboard');
  }, [accessToken]);

  useEffect(() => {
    if (requiresTwoFactor) setShowTwoFactor(true);
  }, [requiresTwoFactor]);

  const handleSubmit = async (values: any) => {
    dispatch(clearError());
    dispatch(login(values));
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0d1b2a 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            background: `radial-gradient(circle, rgba(24,144,255,0.08) 0%, transparent 70%)`,
            width: 400 + i * 100, height: 400 + i * 100,
            left: `${i * 20 - 10}%`, top: `${i * 15 - 5}%`,
          }} />
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        {/* Logo / Brand */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '16px 26px', display: 'inline-block',
                          margin: '0 auto 18px', boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}>
              <img src="/envoiso_logo_full.png" alt="Envoiso" style={{ height: 58, width: 'auto', display: 'block' }} />
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
              Sign in to your workspace
            </Text>
          </div>

          {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
          padding: '36px 40px', boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          {error && (
            <Alert
              message={error} type="error" showIcon closable
              onClose={() => dispatch(clearError())}
              style={{ marginBottom: 20, borderRadius: 8 }}
            />
          )}

          <Form form={form} layout="vertical" onFinish={handleSubmit} size="large">
            {/* Tenant Code */}
            <Form.Item
              name="tenantCode"
              label={<span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>Company Code</span>}
              rules={[{ required: true, message: 'Please enter your company code' }]}
            >
              <Input
                prefix={<BankOutlined style={{ color: '#2E6DA4' }} />}
                placeholder="e.g. ACME_CORP"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: 10 }}
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              name="email"
              label={<span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>Email Address</span>}
              rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#2E6DA4' }} />}
                placeholder="your@email.com"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: 10 }}
              />
            </Form.Item>

            {/* Password */}
            <Form.Item
              name="password"
              label={<span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>Password</span>}
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#2E6DA4' }} />}
                placeholder="••••••••"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: 10 }}
              />
            </Form.Item>

            {/* 2FA Code (shown when required) */}
            {showTwoFactor && (
              <Form.Item
                name="twoFactorCode"
                label={<span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>Two-Factor Code</span>}
                rules={[{ required: true, len: 6, message: 'Enter the 6-digit code from your authenticator app' }]}
              >
                <Input
                  prefix={<SafetyOutlined style={{ color: '#2E6DA4' }} />}
                  placeholder="000000" maxLength={6}
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(114,46,209,0.5)', color: '#fff', borderRadius: 10, letterSpacing: 8, textAlign: 'center' }}
                />
              </Form.Item>
            )}

            <Form.Item style={{ marginBottom: 16, marginTop: 8 }}>
              <Button
                type="primary" htmlType="submit" block loading={loading}
                style={{
                  height: 48, borderRadius: 10, fontWeight: 600, fontSize: 15,
                  background: 'linear-gradient(135deg, #0C2446, #2E6DA4)',
                  border: 'none', boxShadow: '0 4px 16px rgba(24,144,255,0.4)',
                }}
              >
                {showTwoFactor ? 'Verify & Sign In' : 'Sign In'}
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />
          <div style={{ textAlign: 'center' }}>
            <Link style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
              Forgot your password?
            </Link>
          </div>
        </div>

        <Text style={{ display: 'block', textAlign: 'center', marginTop: 24, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
          © 2026 Envoiso. All rights reserved.
        </Text>
      </div>
    </div>
  );
}
