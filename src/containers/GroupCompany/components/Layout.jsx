import React, { useState } from 'react';
import { Layout, Typography, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Layout.css';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

// 创建菜单组件
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

const AppLayout = ({ children, title }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Title level={3} className="app-title">Business Management System</Title>
      </Header>
      <Layout>
        <Sider 
          width={140} 
          className="app-sider"
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <AppMenu />
        </Sider>
        <Content className="app-content">
          <div className="page-container">
            {title && <Title level={4} className="page-title">{title}</Title>}
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout; 