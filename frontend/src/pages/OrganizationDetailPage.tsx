import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Table, Button, Modal, Form, Select, message, Tag, Row, Col, Statistic } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import AppLayout from '../components/Layout/AppLayout';
import { useOrganization, useAddOrgMember, useRemoveOrgMember } from '../hooks/useOrganizations';
import { useUsers, useCurrentUser } from '../hooks/useUsers';
import { getStoredUser } from '../lib/auth';
import type { OrganizationMember } from '../types';
import './OrganizationDetailPage.scss';

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { data: org, isLoading } = useOrganization(id!);
  const { data: users } = useUsers();
  const { data: currentUser } = useCurrentUser();
  const addMember = useAddOrgMember(id!);
  const removeMember = useRemoveOrgMember(id!);
  const effectiveUser = currentUser || getStoredUser();

  const managers = org?.organizationMembers?.filter((om) => om.role === 'manager') || [];
  const allMembers = org?.organizationMembers || [];
  const userRole = org?.organizationMembers?.find((om) => om.user.id === effectiveUser?.id)?.role;
  const canManage = userRole === 'manager' || effectiveUser?.role?.name === 'Admin';

  const existingMemberIds = allMembers.map((om) => om.user.id);
  const availableUsers = users?.filter((u) => !existingMemberIds.includes(u.id));

  const handleAddMember = async (values: { userId: number; role: 'manager' | 'employee' }) => {
    try {
      await addMember.mutateAsync(values);
      message.success('Member added successfully');
      setIsModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: number) => {
    Modal.confirm({
      title: 'Remove Member',
      content: 'Are you sure you want to remove this member?',
      okText: 'Remove',
      okType: 'danger',
      onOk: async () => {
        try {
          await removeMember.mutateAsync(userId);
          message.success('Member removed successfully');
        } catch (error: any) {
          message.error(error.response?.data?.error?.message || 'Failed to remove member');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: ['user', 'username'],
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: ['user', 'email'],
      key: 'email',
      responsive: ['md'] as any,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'manager' ? 'blue' : 'default'}>
          {role === 'manager' ? 'Manager' : 'Employee'}
        </Tag>
      ),
    },
    ...(canManage
      ? [
          {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: OrganizationMember) => (
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveMember(record.user.id)}
                loading={removeMember.isPending}
              >
                Remove
              </Button>
            ),
          },
        ]
      : []),
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div>Loading...</div>
      </AppLayout>
    );
  }

  if (!org) {
    return (
      <AppLayout>
        <div>Organization not found</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="organization-detail-page">
        <div className="page-header">
          <Link to="/organizations" className="back-link">
            <ArrowLeftOutlined /> Back to Organizations
          </Link>
          <h2>
            <TeamOutlined /> {org.name}
          </h2>
          {org.description && <p className="description">{org.description}</p>}
        </div>

        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} md={12}>
            <Card>
              <Statistic
                title="Managers"
                value={managers.length}
                suffix={`/ ${allMembers.length} total`}
              />
              <div className="manager-list">
                {managers.map((om) => (
                  <div key={om.user.id} className="manager-item">
                    <strong>{om.user.username}</strong>
                    <span>{om.user.email}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card>
              <Statistic title="Total Members" value={allMembers.length} />
              <div className="member-breakdown">
                <div>
                  <Tag color="blue">{managers.length} Manager{managers.length !== 1 ? 's' : ''}</Tag>
                </div>
                <div>
                  <Tag>{allMembers.length - managers.length} Employee{allMembers.length - managers.length !== 1 ? 's' : ''}</Tag>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Card
          title="Members"
          extra={
            canManage && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                Add Member
              </Button>
            )
          }
          className="members-card"
        >
          <div className="desktop-view">
            <Table
              columns={columns}
              dataSource={allMembers}
              rowKey={(record) => record.user.id}
              pagination={false}
            />
          </div>

          <div className="mobile-view">
            {allMembers.map((om) => (
              <Card key={om.user.id} className="member-card" size="small">
                <div className="member-info">
                  <div>
                    <strong>{om.user.username}</strong>
                    <div className="email">{om.user.email}</div>
                  </div>
                  <Tag color={om.role === 'manager' ? 'blue' : 'default'}>
                    {om.role === 'manager' ? 'Mgr' : 'Emp'}
                  </Tag>
                </div>
                {canManage && (
                  <Button
                    type="primary"
                    danger
                    size="small"
                    block
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveMember(om.user.id)}
                    loading={removeMember.isPending}
                    style={{ marginTop: 8 }}
                  >
                    Remove
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </Card>

        <Modal
          title="Add Member"
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleAddMember}>
            <Form.Item
              name="userId"
              label="User"
              rules={[{ required: true, message: 'Please select a user' }]}
            >
              <Select
                showSearch
                placeholder="Select a user"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={availableUsers?.map((u) => ({
                  value: u.id,
                  label: `${u.username} (${u.email})`,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select
                placeholder="Select a role"
                options={[
                  { value: 'manager', label: 'Manager' },
                  { value: 'employee', label: 'Employee' },
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={addMember.isPending} block>
                Add Member
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
}
