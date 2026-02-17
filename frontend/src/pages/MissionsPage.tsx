import React, { useState } from 'react';
import { Table, Button, Tag, Modal, Form, Input, message, Card } from 'antd';
import { PlusOutlined, ProjectOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import { useMissions, useCreateMission } from '../hooks/useMissions';
import { useCurrentUser } from '../hooks/useUsers';
import { isManager, getStoredUser } from '../lib/auth';
import type { Mission } from '../types';
import './MissionsPage.scss';

export default function MissionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { data: missions, isLoading } = useMissions();
  const { data: currentUser } = useCurrentUser();
  const createMission = useCreateMission();
  const effectiveUser = currentUser || getStoredUser();

  const handleCreate = async (values: { title: string; description?: string }) => {
    try {
      await createMission.mutateAsync(values);
      message.success('Mission created successfully');
      setIsModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Failed to create mission');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Mission) => (
        <Link to={`/missions/${record.documentId}`}>{text}</Link>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '—',
      responsive: ['md'] as any,
    },
    {
      title: 'Organization',
      key: 'organization',
      render: (_: any, record: Mission) => {
        return record.organization ? (
          <Tag color="blue">{record.organization.name}</Tag>
        ) : (
          <span style={{ color: '#999' }}>No organization</span>
        );
      },
      responsive: ['sm'] as any,
    },
    {
      title: 'Assigned Users',
      key: 'users',
      render: (_: any, record: Mission) => {
        const userCount = record.missionUsers?.length || 0;
        return <Tag>{userCount} user{userCount !== 1 ? 's' : ''}</Tag>;
      },
    },
  ];

  return (
    <AppLayout>
      <div className="missions-page">
        <div className="page-header">
          <h2>
            <ProjectOutlined /> Missions
          </h2>
          {isManager(effectiveUser) && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
              Create Mission
            </Button>
          )}
        </div>

        <div className="desktop-view">
          <Table
            columns={columns}
            dataSource={missions}
            loading={isLoading}
            rowKey="id"
          />
        </div>

        <div className="mobile-view">
          {missions?.map((mission) => {
            const userCount = mission.missionUsers?.length || 0;

            return (
              <Card key={mission.id} className="mission-card" hoverable>
                <div className="card-header">
                  <Link to={`/missions/${mission.documentId}`}>
                    <h3>{mission.title}</h3>
                  </Link>
                </div>
                {mission.description && <p className="description">{mission.description}</p>}
                <div className="card-footer">
                  {mission.organization && (
                    <Tag color="blue">{mission.organization.name}</Tag>
                  )}
                  <Tag>{userCount} user{userCount !== 1 ? 's' : ''}</Tag>
                </div>
              </Card>
            );
          })}
        </div>

        <Modal
          title="Create Mission"
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleCreate}>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please enter mission title' }]}
            >
              <Input placeholder="Mission title" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} placeholder="Mission description" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={createMission.isPending} block>
                Create
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
}
