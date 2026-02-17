import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/auth';
import './LoginPage.scss';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { identifier: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.identifier, values.password);
      message.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-header">
          <h1>Loyalty POC</h1>
          <p>Sign in to your account</p>
        </div>
        <Form name="login" onFinish={onFinish} size="large">
          <Form.Item
            name="identifier"
            rules={[{ required: true, message: 'Please input your email or username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email or Username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
