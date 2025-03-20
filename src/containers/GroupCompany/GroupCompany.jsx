import React from 'react';
import AppLayout from './components/Layout';
import AccountTable from './components/AccountTable';
import './styles/GroupCompany.css';

// 假设这里是 GroupCompany 的原始内容
const GroupCompanyContent = () => {
  return (
    <div className="group-company-container">
      <AccountTable />
    </div>
  );
};

const GroupCompany = () => {
  return (
    <AppLayout title="Account List">
      <GroupCompanyContent />
    </AppLayout>
  );
};

export default GroupCompany; 