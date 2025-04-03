import React from 'react';
import { BrowserRouter as Router, useRoutes, Navigate, Outlet } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';

// 布局组件
import AppLayout from './containers/GroupCompany/components/Layout';

// 内容组件
import GroupCompanyContent from './containers/GroupCompany/GroupCompany';
import FeeLetterUploadContent from './containers/FeeLetterUpload/FeeLetterUpload';

// 路由列表组件
const RouterList = () => {
  const routes = useRoutes([
    // {
    //   path: '/dealing',
    //   element: <Outlet />,
    //   children: [
    //     {
    //       path: 'dealexplorer',
    //       element: <DealExplorer />
    //     }
    //   ]
    // },
    {
      path: '/',
      element: <AppLayout />,
      children: [
        {
          path: 'groupCompany',
          element: <GroupCompanyContent />
        },
        {
          path: 'feeLetter',
          element: <FeeLetterUploadContent />
        },
        {
          path: '',
          element: <Navigate to="/groupCompany" replace />
        }
      ]
    }
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