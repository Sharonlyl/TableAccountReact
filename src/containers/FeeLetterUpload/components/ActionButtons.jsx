import React from 'react';
import { Button, Space, Upload } from 'antd';
import { SearchOutlined, UploadOutlined } from '@ant-design/icons';

const ActionButtons = ({ onSearch, onUpload, uploadProps }) => {
  return (
    <div className="fee-action-buttons">
      <Space>
        <Button 
          type="primary" 
          icon={<SearchOutlined />} 
          onClick={onSearch}
        >
          Search
        </Button>
        
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>Upload New File</Button>
        </Upload>
      </Space>
    </div>
  );
};

export default ActionButtons; 