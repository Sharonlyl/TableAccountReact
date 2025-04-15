import React from 'react';
import { BrowserRouter as Router, useRoutes, Navigate, Outlet } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import GroupCompanyContent from './containers/GroupCompany/GroupCompany';
import FeeLetterUploadContent from './containers/FeeLetterUpload/FeeLetterUpload';
import AppLayout from './containers/GroupCompany/components/Layout';
import HeadGroupManagement from './containers/GroupCompany/components/HeadGroupManagement';
import WIGroupManagement from './containers/GroupCompany/components/WIGroupManagement';
import WICustomizedGroupManagement from './containers/GroupCompany/components/WICustomizedGroupManagement';
import AuditLogContent from './containers/AuditLog/AuditLog';

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
          path: 'groupCompany/headGroup',
          element: <HeadGroupManagement visible={true} onBack={() => window.close()} />
        },
        {
          path: 'groupCompany/wiGroup',
          element: <WIGroupManagement visible={true} onBack={() => window.close()} />
        },
        {
          path: 'groupCompany/wiCustomizedGroup',
          element: <WICustomizedGroupManagement visible={true} onBack={() => window.close()} />
        },
        {
          path: 'feeLetter',
          element: <FeeLetterUploadContent />
        },
        {
          path: 'auditLog',
          element: <AuditLogContent />
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

const App = () => {
  return (
    <ConfigProvider
      theme={{
        cssVar: { prefix: 'caffe' },
        hashed: false,
        token: {
          zIndexPopupBase: 1200,
        },
        components: {
          Layout: {
            headerBg: '#007cc1',
            headerHeight: 30,
            bodyBg: 'transparent',
            footerBg: '#fff',
          },
          Select: {
            zIndexPopup: 1050,
          },
          Menu: {
            itemBorderRadius: 0,
            darkItemBg: '#007cc1',
            darkItemColor: '#fff',
            darkPopupBg: '#007cc1',
          },
          Table: {
            headerBg: '#DDE3F8',
            headerBorderRadius: 0,
            rowHoverBg: '#f5f5f5',
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