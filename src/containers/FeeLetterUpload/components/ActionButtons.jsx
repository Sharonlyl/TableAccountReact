import React from 'react';
import { Button, Space, Upload } from 'antd';
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
        
        <Upload {...uploadProps}>
          <Button 
            icon={<UploadOutlined />}
            disabled={!canUpload || uploadProps.disabled}
          >
            Upload New File
          </Button>
        </Upload>
      </Space>
    </div>
  );
};

export default ActionButtons; 