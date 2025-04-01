import React from 'react';
import { Layout, Typography, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Layout.css';
import Footer from './Footer';
import DeafFooter from './Footer';

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
      label: <Link to="/groupCompany">Group-Company Mapping</Link>
    },
    {
      key: 'feeLetter',
      label: <Link to="/feeLetter">Fee Letter Filing</Link>
    }
  ];

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[getSelectedKey(location.pathname)]}
      defaultSelectedKeys={['groupCompany']}
      className="app-menu"
      items={menuItems}
      style={{
        fontSize: '16px', 
        fontWeight: 'medium'
      }}
    />
  );
};

const AppLayout = ({ children, title }) => {
  const items = [
    {
      key: '1',
      label: (
        <a rel="noopener noreferrer" href="/caffe-web/j_spring_security_logout">
          Logout
        </a>
      ),
    },
  ];

  return (
    <Layout className="app-layout">
      <Header className="navbar-header">
        <div>
          <div>
            <a href="/">
              <div className="logo">
                CSS
                  <b>DEV</b>
              </div>
            </a>
            {/* headerProfile.env !== '' ? <PageHeader headerData={headerProfile}></PageHeader> : null */}
          </div>
          {/* <div className="userInfo">
            <Dropdown menu={{ items }} trigger={['hover']}>
              <span>{props.headerData.profileName}</span>
            </Dropdown>
          </div> */}
        </div>
      </Header>
      <Content className="app-content">
        <AppMenu />
        <div className="page-container">
          {title && (
            <Title level={4} className="page-title">
              {title}
            </Title>
          )}
          {children}
        </div>
      </Content>
      <Footer>
        <DeafFooter />
      </Footer>
    </Layout>
  );
};

export default AppLayout; 