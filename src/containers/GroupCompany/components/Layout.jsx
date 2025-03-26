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
    if (pathname === '/' || pathname.includes('groupCompany')) return 'groupCompany';
    if (pathname.includes('feeLetter')) return 'feeLetter';
    return 'groupCompany';  // 默认返回 groupCompany
  };

  const menuItems = [
    {
      key: 'groupCompany',
      label: <Link to="/groupCompany">groupCompany Mapping</Link>
    },
    {
      key: 'feeLetter',
      label: <Link to="/feeLetter">Fee Letter Filling</Link>
    }
  ];

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[getSelectedKey(location.pathname)]}
      defaultSelectedKeys={['groupCompany']}
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