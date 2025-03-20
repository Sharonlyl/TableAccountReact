import React, { useState, useEffect } from 'react';
import { Table, Form, message, Button, Space, Modal, Pagination, Upload, Empty } from 'antd';
import { DownloadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import SearchForm from './SearchForm';
import ActionButtons from './ActionButtons';
import { searchFeeLetter, uploadFeeLetter, downloadFeeLetter, deleteFeeLetter, queryUserByDepartments } from '../../../api/groupCompany';
import '../styles/FeeLetterUpload.css';
import dayjs from 'dayjs';

const FileTable = () => {
  // 状态管理
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [uploadUsers, setUploadUsers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleteConfirmLoading, setDeleteConfirmLoading] = useState(false);

  // 初始化获取上传者列表
  useEffect(() => {
    fetchUploadUsers();
  }, []);

  // 获取上传者列表
  const fetchUploadUsers = async () => {
    try {
      setLoading(true);
      
      // 使用与GroupCompany相同的接口获取用户列表
      const response = await queryUserByDepartments({
        departments: 'RM' // 与GroupCompany保持一致，使用RM部门
      });
      
      if (response && response.success) {
        setUploadUsers(response.data || []);
      } else {
        console.error('Failed to fetch users:', response?.errMessage);
        messageApi.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      messageApi.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  // 文件上传配置
  const uploadProps = {
    name: 'file',
    action: '', // 实际上传通过自定义函数实现
    showUploadList: false,
    beforeUpload: (file) => {
      const isValidFileType = file.type === 'application/pdf' || 
                             file.type === 'application/msword' || 
                             file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                             file.type === 'application/vnd.ms-excel' ||
                             file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
      if (!isValidFileType) {
        messageApi.error('You can only upload PDF, Word or Excel files');
        return Upload.LIST_IGNORE;
      }
      
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        messageApi.error('File must be smaller than 10MB');
        return Upload.LIST_IGNORE;
      }
      
      handleUpload(file);
      return false; // 阻止默认上传行为
    }
  };

  // 处理文件上传
  const handleUpload = async (file) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await uploadFeeLetter(formData);
      
      if (response && response.success) {
        messageApi.success('Upload successful');
        handleSearch();
      } else {
        messageApi.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      messageApi.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = async () => {
    try {
      setLoading(true);
      
      // 重置页码到第一页
      setPagination(prev => ({
        ...prev,
        current: 1
      }));
      
      // 获取表单数据
      const formValues = form.getFieldsValue();
      
      // 构建请求参数（按照实际接口格式）
      const params = {
        pageSize: pagination.pageSize,
        pageNum: 1,  // 搜索时使用第一页
        letterId: "",
        comment: formValues.note || "",
        lastUpdatedDate: formValues.uploadDate ? formValues.uploadDate.format('YYYY-MM-DD') : "",
        lastUpdatedBy: formValues.uploadBy || ""
      };
      
      // 调用实际接口
      const response = await searchFeeLetter(params);
      
      if (response && response.success) {
        // 处理返回数据
        const pageInfoData = response.pageInfoData || {};
        const list = pageInfoData.list || [];
        
        if (list.length === 0) {
          setTableData([]);
          return;
        }
        
        // 转换日期格式为YYYY/MM/DD
        const formattedData = list.map(item => ({
          id: item.letterId.toString(),
          note: item.comment,
          uploadBy: item.lastUpdatedBy,
          uploadDate: dayjs(item.lastUpdatedDate).format('YYYY/MM/DD'),
          s3ObjectId: item.s3ObjectId
        }));
        
        setTableData(formattedData);
        setPagination(prev => ({
          ...prev,
          total: pageInfoData.total || 0
        }));
      } else {
        console.error('Search failed:', response?.errMessage);
        messageApi.error('Search failed');
        setTableData([]);
      }
    } catch (error) {
      console.error('Error executing search:', error);
      messageApi.error('Error fetching data');
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // 处理下载文件
  const handleDownload = async (record) => {
    try {
      setLoading(true);
      
      const response = await downloadFeeLetter(record.id);
      
      // 处理二进制数据
      const blob = new Blob([response], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = record.note;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      messageApi.success('Download successful');
    } catch (error) {
      console.error('Download error:', error);
      messageApi.error('Download failed');
    } finally {
      setLoading(false);
    }
  };

  // 处理删除文件
  const handleDelete = (record) => {
    setFileToDelete(record);
    setDeleteModalVisible(true);
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    
    try {
      setDeleteConfirmLoading(true);
      
      const response = await deleteFeeLetter(fileToDelete.id);
      
      if (response && response.success) {
        messageApi.success('Delete successful');
        setTableData(prev => prev.filter(item => item.id !== fileToDelete.id));
        setDeleteModalVisible(false);
      } else {
        messageApi.error('Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      messageApi.error('Failed to delete file');
    } finally {
      setDeleteConfirmLoading(false);
    }
  };

  // 取消删除
  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setFileToDelete(null);
  };

  // 处理编辑文件
  const handleEdit = (record) => {
    messageApi.info('Update function not available');
  };

  // 处理页码变化
  const handlePageChange = async (page) => {
    await setPagination(prev => ({
      ...prev,
      current: page
    }));
    
    try {
      setLoading(true);
      
      // 获取表单数据
      const formValues = form.getFieldsValue();
      
      // 构建请求参数
      const params = {
        pageSize: 20,
        pageNum: page,
        letterId: "",
        comment: formValues.note || "",
        lastUpdatedDate: formValues.uploadDate ? formValues.uploadDate.format('YYYY-MM-DD') : "",
        lastUpdatedBy: formValues.uploadBy || ""
      };
      
      // 调用搜索接口
      const response = await searchFeeLetter(params);
      
      if (response && response.success) {
        const pageInfoData = response.pageInfoData || {};
        const list = pageInfoData.list || [];
        
        if (list.length === 0) {
          setTableData([]);
          return;
        }
        
        // 转换数据格式
        const formattedData = list.map(item => ({
          id: item.letterId.toString(),
          note: item.comment,
          uploadBy: item.lastUpdatedBy,
          uploadDate: dayjs(item.lastUpdatedDate).format('YYYY/MM/DD'),
          s3ObjectId: item.s3ObjectId
        }));
        
        setTableData(formattedData);
        setPagination(prev => ({
          ...prev,
          total: pageInfoData.total || 0
        }));
      } else {
        messageApi.error('Search failed');
        setTableData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      messageApi.error('Error fetching data');
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // 自定义空状态组件
  const customEmpty = () => (
    <Empty 
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description="No data"
    />
  );

  // 表格列定义
  const columns = [
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      width: '55%',
      render: (text) => <span style={{ wordBreak: 'break-word' }}>{text}</span>
    },
    {
      title: 'Upload By',
      dataIndex: 'uploadBy',
      key: 'uploadBy',
      width: '15%'
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      width: '15%'
    },
    {
      title: 'Action',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <Space size={0}>
          <Button
            type="link"
            size="small"
            onClick={() => handleDownload(record)}
          >
            Download
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleEdit(record)}
          >
            Update
          </Button>
          <Button
            type="link"
            size="small"
            className="delete-btn"
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  // 配置分页选项，当数据为空时不显示分页
  const paginationConfig = tableData.length > 0 ? {
    current: pagination.current,
    pageSize: 20,
    total: pagination.total,
    showSizeChanger: false,
    onChange: handlePageChange
  } : false;

  // Modal 配置
  const modalConfig = {
    title: "Delete Confirmation",
    open: deleteModalVisible,
    onOk: handleConfirmDelete,
    confirmLoading: deleteConfirmLoading,
    onCancel: handleCancelDelete,
    children: <p>Are you sure you want to delete this file?</p>
  };

  return (
    <div className="fee-letter-table-container">
      {contextHolder}
      
      {/* 搜索表单 */}
      <SearchForm 
        form={form} 
        uploadUsers={uploadUsers} 
      />
      
      {/* 操作按钮 */}
      <ActionButtons 
        onSearch={handleSearch} 
        uploadProps={uploadProps} 
      />
      
      {/* 文件表格 */}
      <Table
        className="fee-file-table"
        columns={columns}
        dataSource={tableData}
        rowKey="id"
        loading={loading}
        pagination={paginationConfig}
        locale={{ emptyText: customEmpty() }}
        size="small"
        bordered
      />
      
      {/* 删除确认对话框 */}
      <Modal
        {...modalConfig}
      />
    </div>
  );
};

export default FileTable; 