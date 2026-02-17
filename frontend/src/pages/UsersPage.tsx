import React from 'react';
import { Table, Tag, Card } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import AppLayout from '../components/Layout/AppLayout';
import { useUsers } from '../hooks/useUsers';
import type { StrapiUser } from '../types';
import './UsersPage.scss';

export default function UsersPage() {
  const { data: users, isLoading } = useUsers();

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['md'] as any,
    },
    {
      title: 'Role',
      dataIndex: ['role', 'name'],
      key: 'role',
      render: (role: string) => {
        let color = 'default';
        if (role === 'Admin') color = 'red';
        else if (role === 'Manager') color = 'blue';
        else if (role === 'Authenticated') color = 'green';
        
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: StrapiUser) => (
        <>
          {record.confirmed ? (
            <Tag color="success">Confirmed</Tag>
          ) : (
            <Tag color="warning">Unconfirmed</Tag>
          )}
          {record.blocked && <Tag color="error">Blocked</Tag>}
        </>
      ),
      responsive: ['sm'] as any,
    },
  ];

  return (
    <AppLayout>
      <div className="users-page">
        <div className="page-header">
          <h2>
            <UserOutlined /> Users
          </h2>
        </div>

        <div className="desktop-view">
          <Table
            columns={columns}
            dataSource={users}
            loading={isLoading}
            rowKey="id"
          />
        </div>

        <div className="mobile-view">
          {users?.map((user) => {
            let roleColor = 'default';
            if (user.role?.name === 'Admin') roleColor = 'red';
            else if (user.role?.name === 'Manager') roleColor = 'blue';
            else if (user.role?.name === 'Authenticated') roleColor = 'green';

            return (
              <Card key={user.id} className="user-card">
                <div className="card-header">
                  <h3>{user.username}</h3>
                  <Tag color={roleColor}>{user.role?.name || 'No role'}</Tag>
                </div>
                <p className="email">{user.email}</p>
                <div className="card-footer">
                  {user.confirmed ? (
                    <Tag color="success">Confirmed</Tag>
                  ) : (
                    <Tag color="warning">Unconfirmed</Tag>
                  )}
                  {user.blocked && <Tag color="error">Blocked</Tag>}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
