import React, { useEffect } from 'react';
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
  useEffect(() => {
    document.title = 'Employer Data Maintenance'
  }, [])
  return (
    <AppLayout title="Group-Company Mapping">
      <GroupCompanyContent />
    </AppLayout>
  );
};

export default GroupCompany; 