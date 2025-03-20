import React from 'react';
import AppLayout from '../GroupCompany/components/Layout';
import FileTable from './components/FileTable';
import './styles/FeeLetterUpload.css';

// 原始 FeeLetterUpload 组件的内容
const FeeLetterUploadContent = () => {
  return (
    <div className="fee-letter-container">
      <FileTable />
    </div>
  );
};

const FeeLetterUpload = () => {
  return (
    <AppLayout title="Fee Letter">
      <FeeLetterUploadContent />
    </AppLayout>
  );
};

export default FeeLetterUpload; 