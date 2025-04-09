import React, { useState } from 'react';
import { Modal, Button, Form, Input, Upload, message, Space, Typography, Divider } from 'antd';
import { UploadOutlined, FileOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const UploadModal = ({ visible, onCancel, onUpload }) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 文件类型验证
  const isValidFileType = (file) => {
    const acceptedTypes = ['.msg', '.pdf', '.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    return acceptedTypes.some(type => fileName.endsWith(type));
  };

  // 文件大小验证（10MB）
  const isValidFileSize = (file) => {
    return file.size / 1024 / 1024 < 10;
  };

  // 处理文件选择
  const handleFileChange = (info) => {
    if (info.file.status !== 'uploading') {
      setFile(info.file.originFileObj || info.file);
    }
    if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed`);
    }
  };

  // 处理文件上传前的验证
  const beforeUpload = (file) => {
    if (!isValidFileType(file)) {
      message.error('The uploaded file format is incorrect');
      return Upload.LIST_IGNORE;
    }
    
    if (!isValidFileSize(file)) {
      message.error('File must be smaller than 10MB');
      return Upload.LIST_IGNORE;
    }
    
    return false; // 阻止自动上传
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      if (!file) {
        message.error('Please select a file to upload');
        return;
      }

      const values = await form.validateFields();
      setUploading(true);

      // 如果没有填写备注，使用文件名作为备注
      let comment = values.note || '';
      if (!comment.trim()) {
        comment = file.name;
      }

      // 调用父组件的上传方法
      await onUpload(file, comment);

      // 重置表单和文件
      form.resetFields();
      setFile(null);
      setUploading(false);

    } catch (error) {
      setUploading(false);
      console.error('Form submission error:', error);
    }
  };

  // 关闭并重置
  const handleCancel = () => {
    form.resetFields();
    setFile(null);
    onCancel();
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      width={520}
      style={{ padding: '24px 24px 16px' }}
      className="file-upload-modal"
    >
      <div style={{ marginBottom: 24 }}>
         <div style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, marginBottom: 20 }}>
           Upload New File
         </div>
      </div>

      <Form form={form} layout="vertical">
        <div 
          style={{ 
            padding: '20px', 
            background: '#f9f9f9', 
            borderRadius: '8px',
            border: '1px dashed #d9d9d9',
            marginBottom: 16,
            textAlign: 'center'
          }}
        >
          {!file ? (
            <>
              <Upload
                beforeUpload={beforeUpload}
                onChange={handleFileChange}
                showUploadList={false}
                maxCount={1}
              >
                <Button 
                  icon={<UploadOutlined />} 
                  type="primary" 
                  size="large"
                  style={{ height: '48px', padding: '0 24px' }}
                >
                  Select File
                </Button>
              </Upload>
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">
                  Drag and drop or click to select
                </Text>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'left' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '12px 16px',
                background: 'white',
                borderRadius: '4px',
                border: '1px solid #e8e8e8'
              }}>
                <FileOutlined style={{ fontSize: 20, color: '#1890ff', marginRight: 12 }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <Text ellipsis style={{ width: '100%' }} strong>{file.name}</Text>
                </div>
                <Button 
                  type="text" 
                  size="small"
                  onClick={() => setFile(null)}
                  style={{ color: '#ff4d4f' }}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <Text type="secondary">
            <Space align="center">
              <InfoCircleOutlined style={{ fontSize: 14, color: '#1890ff' }} />
              Supported Formats: .msg .pdf .xlsx .xls | Max size: 10MB
            </Space>
          </Text>
        </div>

        <Form.Item
          label="Note"
          name="note"
          rules={[{ max: 200, message: 'Note cannot exceed 200 characters!' }]}
        >
          <Input.TextArea 
            placeholder="Please enter file description (optional)" 
            maxLength={200}
            showCount
            autoSize={{ minRows: 2, maxRows: 4 }}
            style={{ resize: 'vertical' }}
          />
        </Form.Item>

        <Divider style={{ margin: '24px 0 16px' }} />

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space size="middle">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button 
              type="primary" 
              onClick={handleSubmit} 
              loading={uploading}
              disabled={!file}
              size="middle"
            >
              Upload
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UploadModal;
