import React from 'react';
import { BrowserRouter as Router, useRoutes, Navigate, Outlet } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';

// 原有路由
import GroupCompany from './containers/GroupCompany/GroupCompany';
import FeeLetterUpload from './containers/FeeLetterUpload/FeeLetterUpload';

// 路由列表组件
const RouterList = () => {
  const routes = useRoutes([
    // 原有路由
    {
      path: '/group-company',
      element: <GroupCompany />
    },
    {
      path: '/fee-letter',
      element: <FeeLetterUpload />
    },
    // 重定向
    {
      path: '/',
      element: <Navigate to="/group-company" replace />
    },
    
    // 新增路由
    // {
    //   path: '/dealing',
    //   element: <Outlet />,
    //   children: [
    //     {
    //       path: 'dealExplorer',
    //       element: <DealExplorer />,
    //     },
    //   ],
    // },
    // {
    //   path: '/',
    //   element: <Outlet />,
    //   children: [
    //     {
    //       path: 'business-management',
    //       element: <BusinessManagement />,
    //     },
    //   ],
    // },
  ]);
  
  return routes;
};

function App() {
  return (
    <ConfigProvider
      locale={enUS}
      theme={{
        cssVar: { prefix: 'caffe' },
        hashed: false,
        token: {
          zIndexPopupBase: 1200,
        },
        components: {
          Layout: {
            headerBg: '#007ccl',
            headerHeight: 30,
            bodyBg: 'transparent',
            footerBg: '#fff',
          },
          Select: {
            zIndexPopup: 1050,
          },
          Menu: {
            itemBorderRadius: 0,
            darkItemBg: '#007ccl',
            darkPopupBg: '#fff',
          },
          Table: {
            headerBg: '#DDE3F8',
            headerBorderRadius: 0,
            rowHoverBg: '#F5F5F5',
          },
          Modal: {
            titleFontSize: 18,
          },
          DatePicker: {
            zIndexPopup: 1060,
          },
        },
      }}
    >
      <Router>
        <RouterList />
      </Router>
    </ConfigProvider>
  );
}

export default App; 