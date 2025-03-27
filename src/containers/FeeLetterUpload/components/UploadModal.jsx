import React, { useState } from 'react';
import { Modal, Button, Form, Input, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const UploadModal = ({ visible, onCancel, onUpload }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 文件类型验证
  const isValidFileType = (file) => {
    const acceptedTypes = ['.msg', '.pdf', '.xlsx'];
    const fileName = file.name.toLowerCase();
    return acceptedTypes.some(type => fileName.endsWith(type));
  };

  // 文件大小验证（10MB）
  const isValidFileSize = (file) => {
    return file.size / 1024 / 1024 < 10;
  };

  // 处理文件选择
  const handleFileChange = ({ fileList }) => {
    setFileList(fileList.slice(-1)); // 只保留最新选择的文件
  };

  // 处理文件上传前的验证
  const beforeUpload = (file) => {
    if (!isValidFileType(file)) {
      message.error('Only .msg, .pdf, .xlsx files are allowed');
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
      if (fileList.length === 0) {
        message.error('Please select a file to upload');
        return;
      }

      const values = await form.validateFields();
      setUploading(true);

      // 如果没有填写备注，使用文件名作为备注
      let comment = values.note || '';
      if (!comment.trim()) {
        comment = fileList[0].name;
      }

      // 调用父组件的上传方法
      const file = fileList[0].originFileObj;
      await onUpload(file, comment);

      // 重置表单和文件列表
      form.resetFields();
      setFileList([]);
      setUploading(false);

    } catch (error) {
      setUploading(false);
      console.error('Form submission error:', error);
    }
  };

  // 关闭并重置
  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  return (
    <Modal
      title="Upload New File"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      className="upload-file-modal"
      destroyOnClose
    >
      <div className="upload-file-container">
        <div className="upload-file-info">
          <div className="upload-file-name">
            {fileList.length > 0 ? fileList[0].name : 'No file selected'}
          </div>
          <Upload
            beforeUpload={beforeUpload}
            onChange={handleFileChange}
            showUploadList={false}
            maxCount={1}
            className="upload-file-btn"
          >
            <Button icon={<UploadOutlined />}>Upload file</Button>
          </Upload>
        </div>

        <Form form={form} layout="vertical" className="upload-note-container">
          <Form.Item
            label="Note"
            name="note"
            rules={[{ max: 40, message: 'Note cannot exceed 40 characters!' }]}
          >
            <Input.TextArea 
              placeholder="input description for your upload file" 
              className="upload-note-textarea"
              maxLength={40}
            />
          </Form.Item>
        </Form>
      </div>

      <div className="upload-modal-footer">
        <Button 
          type="primary" 
          onClick={handleSubmit} 
          loading={uploading}
        >
          Upload
        </Button>
        <Button onClick={handleCancel}>Cancel</Button>
      </div>
    </Modal>
  );
};

export default UploadModal;
