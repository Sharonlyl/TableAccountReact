import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import FileTable from './components/FileTable';
import './styles/FeeLetterUpload.css';

// FeeLetterUpload 内容组件，不再包含布局和queryUserRole调用
const FeeLetterUploadContent = () => {
  const {groupCompanyRole, userId} = useOutletContext();

  useEffect(() => {
    document.title = 'Employer Data Maintenance'
  }, []);

  return (
    <div className="fee-letter-container">
      <FileTable userRoleInfo={{ groupCompanyRole, userId }} />
    </div>
  );
};

export default FeeLetterUploadContent; 