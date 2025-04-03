import React, { useState, useEffect } from 'react';
import { Layout, Typography, Menu, Dropdown } from 'antd';
import { Link, useLocation, Outlet, useOutletContext } from 'react-router-dom';
import '../styles/Layout.css';
import Footer from './Footer';
import DeafFooter from './Footer';
import { queryUserRole } from '../../../api/groupCompany';

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

const AppLayout = ({ title }) => {
  const [userInfo, setUserInfo] = useState({
    env: '',
    userId: '',
    userName: '',
    groupCompanyRole: '',
  });
  // const [loading, setLoading] = useState(true);
  const location = useLocation();

  // 根据路由路径确定页面标题
  const getPageTitle = () => {
    const {pathname} = location;
    if (pathname.includes('groupCompany')) return 'Group-Company Mapping';
    if (pathname.includes('feeLetter')) return 'Fee Letter Filing';
    return title || '';
  };

  useEffect(() => {
    fetchUserRole();
  }, []);

  // 获取用户角色信息
  const fetchUserRole = async () => {
    try {
      // setLoading(true);

      const response = await queryUserRole();

      if (response && response.success) {
        setUserInfo({
          env: response.data?.env || '',
          userId: response.data?.userId || '',
          userName: response.data?.userName || '',
          groupCompanyRole: response.data?.groupCompanyRole || '',
        });
      } else {
        console.error('Failed to fetch user role');
      }
    } catch (error) {
      console.error('Error fetching user role');
    } finally {
      // setLoading(false);
    }
  };

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
        <div className="group-container">
          <div>
            <div>
              <a href="/">
                <div className="logo">
                  CSS
                  <b>{userInfo.env}</b>
                </div>
              </a>
              {/* headerProfile.env !== '' ? <PageHeader headerData={headerProfile}></PageHeader> : null */}
            </div>
            <div className="userInfo">
              <Dropdown menu={{ items }} trigger={['hover']}>
                <span>{userInfo.userId?.toUpperCase()}</span>
              </Dropdown>
            </div>
          </div>
        </div>
      </Header>
      <Content className="app-content">
        <AppMenu />
        <div className="page-container">
          {getPageTitle() && (
            <Title level={4} className="page-title">
              {getPageTitle()}
            </Title>
          )}
          <Outlet
            context={{
              groupCompanyRole: userInfo.groupCompanyRole,
              userId: userInfo.userId,
              userName: userInfo.userName,
            }}
          />
        </div>
      </Content>
      <Footer>
        <DeafFooter />
      </Footer>
    </Layout>
  );
};

export default AppLayout;
