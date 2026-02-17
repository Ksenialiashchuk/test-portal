import React, { useState } from 'react';
import { Table, Button, Tag, Modal, Form, Input, message, Card } from 'antd';
import { PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import { useOrganizations, useCreateOrganization } from '../hooks/useOrganizations';
import { useCurrentUser } from '../hooks/useUsers';
import { isAdmin, getStoredUser } from '../lib/auth';
import type { Organization } from '../types';
import './OrganizationsPage.scss';

export default function OrganizationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { data: allOrganizations, isLoading } = useOrganizations();
  const { data: currentUser } = useCurrentUser();
  const createOrg = useCreateOrganization();
  const effectiveUser = currentUser || getStoredUser();

  let organizations = allOrganizations;
  if (!isAdmin(effectiveUser)) {
    organizations = allOrganizations?.filter((org) =>
      org.organizationMembers?.some((om) => om.user.id === effectiveUser?.id)
    );
  }

  const handleCreate = async (values: { name: string; description?: string }) => {
    try {
      await createOrg.mutateAsync(values);
      message.success('Organization created successfully');
      setIsModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Failed to create organization');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Organization) => {
        const userRole = record.organizationMembers?.find(
          (om) => om.user.id === effectiveUser?.id
        )?.role;
        const isManager = userRole === 'manager';

        return (
          <div className="org-name-cell">
            <Link to={`/organizations/${record.documentId}`}>{text}</Link>
            {isManager && <Tag color="blue">Manager</Tag>}
          </div>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '—',
      responsive: ['md'] as any,
    },
    {
      title: 'Managers',
      key: 'managers',
      render: (_: any, record: Organization) => {
        const managers = record.organizationMembers?.filter((om) => om.role === 'manager') || [];
        return managers.length > 0 ? (
          <Tag color="processing">{managers.length} manager{managers.length !== 1 ? 's' : ''}</Tag>
        ) : (
          <span style={{ color: '#999' }}>None</span>
        );
      },
      responsive: ['sm'] as any,
    },
    {
      title: 'Total Members',
      key: 'members',
      render: (_: any, record: Organization) => {
        const totalMembers = record.organizationMembers?.length || 0;
        return <Tag>{totalMembers} member{totalMembers !== 1 ? 's' : ''}</Tag>;
      },
    },
  ];

  return (
    <AppLayout>
      <div className="organizations-page">
        <div className="page-header">
          <h2>
            <TeamOutlined /> Organizations
          </h2>
          {isAdmin(effectiveUser) && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
              Create Organization
            </Button>
          )}
        </div>

        <div className="desktop-view">
          <Table
            columns={columns}
            dataSource={organizations}
            loading={isLoading}
            rowKey="id"
            rowClassName={(record) => {
              const userRole = record.organizationMembers?.find(
                (om) => om.user.id === effectiveUser?.id
              )?.role;
              return userRole === 'manager' ? 'manager-row' : '';
            }}
          />
        </div>

        <div className="mobile-view">
          {organizations?.map((org) => {
            const managers = org.organizationMembers?.filter((om) => om.role === 'manager') || [];
            const totalMembers = org.organizationMembers?.length || 0;
            const userRole = org.organizationMembers?.find(
              (om) => om.user.id === effectiveUser?.id
            )?.role;
            const isManager = userRole === 'manager';

            return (
              <Card
                key={org.id}
                className={`org-card ${isManager ? 'manager-card' : ''}`}
                hoverable
              >
                <div className="card-header">
                  <Link to={`/organizations/${org.documentId}`}>
                    <h3>{org.name}</h3>
                  </Link>
                  {isManager && <Tag color="blue">Manager</Tag>}
                </div>
                {org.description && <p className="description">{org.description}</p>}
                <div className="card-footer">
                  {managers.length > 0 ? (
                    <Tag color="processing">{managers.length} mgr{managers.length !== 1 ? 's' : ''}</Tag>
                  ) : (
                    <Tag>No mgrs</Tag>
                  )}
                  <Tag>{totalMembers} mbr{totalMembers !== 1 ? 's' : ''}</Tag>
                </div>
              </Card>
            );
          })}
        </div>

        <Modal
          title="Create Organization"
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleCreate}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter organization name' }]}
            >
              <Input placeholder="Organization name" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} placeholder="Organization description" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={createOrg.isPending} block>
                Create
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
}
