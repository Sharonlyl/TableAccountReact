import React, { useState, useEffect } from 'react';
import AppLayout from '../GroupCompany/components/Layout';
import FileTable from './components/FileTable';
import './styles/FeeLetterUpload.css';
import { queryUserRole } from '../../api/groupCompany';
import { message } from 'antd';

// FeeLetterUpload 组件的内容
const FeeLetterUploadContent = () => {
  const [userRole, setUserRole] = useState({
    groupCompanyRole: '',
    username: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRole();
  }, []);

  // 获取用户角色信息
  const fetchUserRole = async () => {
    try {
      setLoading(true);
      const response = await queryUserRole();
      
      if (response && response.success) {
        setUserRole({
          groupCompanyRole: response.data?.groupCompanyRole || '',
          username: response.data?.userName || ''
        });
      } else {
        message.error('Failed to fetch user role');
        console.error('Failed to fetch user role:', response?.errMessage);
      }
    } catch (error) {
      message.error('Error fetching user role');
      console.error('Error fetching user role:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fee-letter-container">
      <FileTable userRole={userRole} />
    </div>
  );
};

const FeeLetterUpload = () => {
  return (
    <AppLayout title="Fee Letter Filling">
      <FeeLetterUploadContent />
    </AppLayout>
  );
};

export default FeeLetterUpload; 