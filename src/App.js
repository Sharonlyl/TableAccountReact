import React from 'react';
import { ConfigProvider, Layout, Typography } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import GroupCompany from './containers/GroupCompany/GroupCompany';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Layout className="app-layout">
        <Header className="app-header">
          <Title level={3} className="app-title">Account Management System</Title>
        </Header>
        <Content className="app-content">
          <div className="page-container">
            <Title level={4} className="page-title">Account List</Title>
            <GroupCompany />
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App; 