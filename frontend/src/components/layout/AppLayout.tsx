import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  ProjectOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useCurrentUser } from '../../hooks/useUsers';
import { logout, getStoredUser, isAdmin } from '../../lib/auth';
import './AppLayout.scss';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();
  const effectiveUser = currentUser || getStoredUser();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/organizations',
      icon: <TeamOutlined />,
      label: 'Organizations',
    },
    {
      key: '/missions',
      icon: <ProjectOutlined />,
      label: 'Missions',
    },
    ...(isAdmin(effectiveUser)
      ? [
          {
            key: '/users',
            icon: <UserOutlined />,
            label: 'Users',
          },
        ]
      : []),
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

  return (
    <Layout className="app-layout">
      <Sider width={240} className="app-sider">
        <div className="logo">
          <h2>Loyalty POC</h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <div className="header-content">
            <h1 className="page-title">
              {menuItems.find((item) => item.key === location.pathname)?.label || 'Dashboard'}
            </h1>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" className="user-button">
                <Avatar icon={<UserOutlined />} />
                <span className="username">{effectiveUser?.username}</span>
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content className="app-content">{children}</Content>
      </Layout>
    </Layout>
  );
}
