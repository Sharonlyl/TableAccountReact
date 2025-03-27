import React from 'react';
import { Button, Space } from 'antd';
import { SearchOutlined, UploadOutlined } from '@ant-design/icons';

const ActionButtons = ({ onSearch, uploadProps, canSearch = true, canUpload = true }) => {
  return (
    <div className="fee-action-buttons">
      <Space>
        <Button 
          type="primary" 
          icon={<SearchOutlined />} 
          onClick={onSearch}
          disabled={!canSearch}
        >
          Search
        </Button>
        
        <Button 
          icon={<UploadOutlined />}
          disabled={!canUpload || uploadProps.disabled}
          onClick={uploadProps.onClick}
        >
          Upload New File
        </Button>
      </Space>
    </div>
  );
};

export default ActionButtons; 