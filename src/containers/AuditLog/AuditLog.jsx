import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import AuditLogTable from './components/AuditLogTable';
import './styles/AuditLog.css';

// AuditLog 内容组件
const AuditLogContent = () => {
  const {groupCompanyRole, userId, userName} = useOutletContext();
  
  useEffect(() => {
    document.title = 'Employer Data Maintenance'
  }, []);

  return (
    <div className="audit-log-container">
      <AuditLogTable userRoleInfo={{ groupCompanyRole, userId, userName }} />
    </div>
  );
};

export default AuditLogContent; 