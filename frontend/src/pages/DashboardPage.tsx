import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { TeamOutlined, ProjectOutlined, UserOutlined } from '@ant-design/icons';
import AppLayout from '../components/Layout/AppLayout';
import { useOrganizations } from '../hooks/useOrganizations';
import { useMissions } from '../hooks/useMissions';
import { useUsers, useCurrentUser } from '../hooks/useUsers';
import { isAdmin, getStoredUser } from '../lib/auth';
import './DashboardPage.scss';

export default function DashboardPage() {
  const { data: orgs } = useOrganizations();
  const { data: missions } = useMissions();
  const { data: users } = useUsers();
  const { data: currentUser } = useCurrentUser();
  const effectiveUser = currentUser || getStoredUser();

  return (
    <AppLayout>
      <div className="dashboard-page">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card stat-card-green">
              <Statistic
                title="Organizations"
                value={orgs?.length ?? 0}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card stat-card-blue">
              <Statistic
                title="Missions"
                value={missions?.length ?? 0}
                prefix={<ProjectOutlined />}
              />
            </Card>
          </Col>
          {isAdmin(effectiveUser) && (
            <Col xs={24} sm={12} lg={8}>
              <Card className="stat-card stat-card-red">
                <Statistic
                  title="Users"
                  value={users?.length ?? 0}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
          )}
        </Row>
      </div>
    </AppLayout>
  );
}
