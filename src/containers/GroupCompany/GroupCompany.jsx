import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import AccountTable from './components/AccountTable';
import './styles/GroupCompany.css';

// GroupCompany 内容组件，不再包含布局
const GroupCompanyContent = () => {
  const {groupCompanyRole, userId, userName} = useOutletContext();
  
  useEffect(() => {
    document.title = 'Employer Data Maintenance'
  }, []);

  return (
    <div className="group-company-container">
      <AccountTable userRoleInfo={{ groupCompanyRole, userId, userName }} />
    </div>
  );
};

export default GroupCompanyContent; 