import React from 'react';
import { Layout, Typography, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Layout.css';

const { Header, Content } = Layout;
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
      mode="horizontal"
      selectedKeys={[getSelectedKey(location.pathname)]}
      defaultSelectedKeys={['group-company']}
      className="app-menu"
      items={menuItems}
    />
  );
};

const AppLayout = ({ children, title }) => {
  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="header-wrapper">
          <Title level={3} className="app-title">Business Management System</Title>
          <AppMenu />
        </div>
      </Header>
      <Content className="app-content">
        <div className="page-container">
          {title && <Title level={4} className="page-title">{title}</Title>}
          {children}
        </div>
      </Content>
    </Layout>
  );
};

export default AppLayout; 