import React, { useState } from 'react';
import { ConfigProvider, Layout, Typography, Menu } from 'antd';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import enUS from 'antd/locale/en_US';  // 引入英文语言包
import GroupCompany from './containers/GroupCompany/GroupCompany';
import FeeLetterUpload from './containers/FeeLetterUpload/FeeLetterUpload';
import './App.css';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

// 创建一个包含菜单的组件
const AppMenu = () => {
  const location = useLocation();
  
  // 根据当前路径确定选中的菜单项
  const getSelectedKey = (pathname) => {
    if (pathname === '/' || pathname.includes('group-company')) return 'group-company';
    if (pathname.includes('fee-letter')) return 'fee-letter';
    return 'group-company';  // 默认返回 group-company
  };

  const menuItems = [
    {
      key: 'group-company',
      label: <Link to="/group-company">Group-Company Mapping</Link>
    },
    {
      key: 'fee-letter',
      label: <Link to="/fee-letter">Fee Letter</Link>
    }
  ];

  return (
    <Menu
      mode="inline"
      selectedKeys={[getSelectedKey(location.pathname)]}
      defaultSelectedKeys={['group-company']}
      style={{ height: '100%', borderRight: 0 }}
      items={menuItems}
    />
  );
};

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ConfigProvider locale={enUS}>
      <Router>
        <Layout className="app-layout">
          <Header className="app-header">
            <Title level={3} className="app-title">Account Management System</Title>
          </Header>
          <Layout>
            <Sider 
              width={200} 
              className="app-sider"
              collapsible
              collapsed={collapsed}
              onCollapse={(value) => setCollapsed(value)}
            >
              <AppMenu />
            </Sider>
            <Content className="app-content">
              <div className="page-container">
                <Routes>
                  <Route path="/group-company" element={
                    <>
                      <Title level={4} className="page-title">Account List</Title>
                      <GroupCompany />
                    </>
                  } />
                  <Route path="/fee-letter" element={
                    <>
                      <Title level={4} className="page-title">Fee Letter</Title>
                      <FeeLetterUpload />
                    </>
                  } />
                  <Route path="/" element={<Navigate to="/group-company" replace />} />
                </Routes>
              </div>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App; 