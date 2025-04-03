import React, { useState, useEffect, useMemo } from 'react';
import { Table, Form, message, Button, Space, Modal, Pagination, Upload, Tooltip, Empty } from 'antd';
import { DownloadOutlined, DeleteOutlined, EditOutlined, FileExclamationOutlined } from '@ant-design/icons';
import SearchForm from './SearchForm';
import ActionButtons from './ActionButtons';
import { searchFeeLetter, uploadFeeLetter, downloadFeeLetter, deleteFeeLetter, queryUserByDepartments } from '../../../api/groupCompany';
import '../styles/FeeLetterUpload.css';
import dayjs from 'dayjs';
import UploadModal from './UploadModal';

// 角色常量
const ROLES = {
  READ: 'GROUP_COMPANY_READ_ROLE',
  WRITE: 'GROUP_COMPANY_WRITE_ROLE',
  ADMIN: 'GROUP_COMPANY_ADMIN_ROLE'
};

const FileTable = ({ userRoleInfo }) => {
  // 状态管理
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [uploadUsers, setUploadUsers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: true
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleteConfirmLoading, setDeleteConfirmLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  // 初始化获取上传者列表
  useEffect(() => {
    fetchUploadUsers();
  }, []);

  // 添加初始化加载时的搜索
  useEffect(() => {
    // 设置默认的上传日期
    form.setFieldsValue({
      uploadDate: dayjs()
    });
    
    // 初始化加载数据
    handleSearch();
  }, []);

  // 获取上传者列表
  const fetchUploadUsers = async () => {
    try {
      const response = await queryUserByDepartments({
        departments: 'RM' 
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
    }
  };

  // 检查是否有权限执行某个操作
  const hasPermission = (action, record = null) => {
    const { groupCompanyRole, userId } = userRoleInfo;
    
    // 如果角色是管理员，有所有权限
    if (groupCompanyRole === ROLES.ADMIN) {
      return true;
    }
    
    // 如果是只读角色，只能搜索
    if (groupCompanyRole === ROLES.READ) {
      return action === 'search' || action ==='download';
    }
    
    // 如果是写入角色
    if (groupCompanyRole === ROLES.WRITE) {
      switch (action) {
        case 'search':
        case 'upload':
          return true;
        case 'download':
          return true
        case 'delete':
          // 只有当前用户等于记录的创建者时才有权限
          return record && record.createdBy === userId;
        default:
          return false;
      }
    }
    
    return false;
  };

  // 上传按钮点击
  const handleUploadButtonClick = () => {
    setUploadModalVisible(true);
  };

  // 处理文件上传
  const handleFileUpload = async (file, comment) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      
      // 按照API所需格式创建feeLetter对象
      const feeLetter = {
        comment: comment
      };
      
      // 将feeLetter转换为Blob，并指定content-type为application/json
      const feeLetterBlob = new Blob([JSON.stringify(feeLetter)], {
        type: 'application/json'
      });
      
      // 添加带有content-type的feeLetter
      formData.append('feeLetter', feeLetterBlob);
      
      // 检查是否是.msg文件
      if (file.name.toLowerCase().endsWith('.msg')) {
        try {
          // 读取文件内容为ArrayBuffer
          const fileContent = await readFileAsArrayBuffer(file);
          
          // 创建新的File对象，不指定content-type
          const newFile = new File([fileContent], file.name);
          
          // 添加处理后的文件到FormData
          formData.append('file', newFile);
        } catch (error) {
          console.error('Error processing .msg file:', error);
          messageApi.error('Error processing .msg file');
          setLoading(false);
          return;
        }
      } else {
        // 其他类型的文件直接添加
        formData.append('file', file);
      }
      
      const response = await uploadFeeLetter(formData);
      
      if (response && response.success) {
        messageApi.success('Upload successful');
        setUploadModalVisible(false);
        await handleSearch();
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
  
  // 读取文件为ArrayBuffer的辅助函数
  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  // 文件上传配置
  const uploadProps = {
    name: 'file',
    showUploadList: false,
    disabled: !hasPermission('upload'),
    beforeUpload: () => false, // 禁用默认上传行为
    onClick: () => {
        handleUploadButtonClick();
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
      
      // 如果uploadDate为空，则使用当前日期
      if (!formValues.uploadDate) {
        formValues.uploadDate = dayjs();
      }
      
      // 构建请求参数（按照实际接口格式）
      const params = {
        pageSize: pagination.pageSize,
        pageNum: 1,  // 搜索时使用第一页
        letterId: "",
        comment: formValues.note || "",
        lastUpdatedDate: formValues.uploadDate ? formValues.uploadDate.format('YYYY-MM-DD') : "",
        uploadUserName: formValues.uploadBy || ""
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
          letterId: item.letterId,
          note: item.comment,
          uploadBy: item.uploadUserName,
          uploadDate: dayjs(item.lastUpdatedDate).format('YYYY/MM/DD'),
          createdBy: item.createdBy, // 保存createdBy字段用于权限判断
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
    if (!hasPermission('download', record)) {
      messageApi.error('You do not have permission to download this file');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await downloadFeeLetter({letterId: record.letterId});
      
      // 提取Content-Disposition头
      const contentDisposition = response.headers['content-disposition'];
      
      // 从Content-Disposition头中提取文件名
      let fileName = '';
      if (contentDisposition && contentDisposition.includes('fileName=')) {
        const fileNameMatch = contentDisposition.match(/fileName="(.+)"/);
        if (fileNameMatch && fileNameMatch[1]) {
          ;[, fileName] = fileNameMatch;
        }
      }
      
      // 如果没有从headers中获取到文件名，则使用记录的note作为备选
      if (!fileName) {
        fileName = record.note
      }
      
      // 创建Blob URL并下载
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
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
    if (!hasPermission('delete', record)) {
      messageApi.error('You do not have permission to delete this file');
      return;
    }
    
    setFileToDelete(record);
    setDeleteModalVisible(true);
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    
    if (!hasPermission('delete', fileToDelete)) {
      messageApi.error('You do not have permission to delete this file');
      setDeleteModalVisible(false);
      return;
    }
    
    try {
      setDeleteConfirmLoading(true);
      
      const response = await deleteFeeLetter({letterId: fileToDelete.letterId});
      
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
      
      // 如果uploadDate为空，则使用当前日期
      if (!formValues.uploadDate) {
        formValues.uploadDate = dayjs();
      }
      
      // 构建请求参数
      const params = {
        pageSize: 20,
        pageNum: page,
        letterId: "",
        comment: formValues.note || "",
        lastUpdatedDate: formValues.uploadDate ? formValues.uploadDate.format('YYYY-MM-DD') : "",
        uploadUserName: formValues.uploadBy || ""
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
          letterId: item.letterId,
          note: item.comment,
          uploadBy: item.uploadUserName,
          uploadDate: dayjs(item.lastUpdatedDate).format('YYYY/MM/DD'),
          createdBy: item.createdBy,
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
      align: 'center',
      render: (_, record) => (
        <Space size={8} className="action-buttons-container">
          <Button
            type="primary"
            size="small"
            onClick={() => handleDownload(record)}
            disabled={!hasPermission('download', record)}
            icon={<DownloadOutlined />}
          >
            Download
          </Button>
          <Button
            type="primary"
            size="small"
            danger
            onClick={() => handleDelete(record)}
            disabled={!hasPermission('delete', record)}
            icon={<DeleteOutlined />}
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
    children: <p>Are you sure to delete this record?</p>
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
        canSearch={true}
        canUpload={hasPermission('upload')}
      />
      
      {/* 文件表格 */}
      <Table
        className="fee-file-table"
        columns={columns}
        dataSource={tableData}
        rowKey="id"
        loading={{ spinning : loading, tip: 'Loading...'}}
        pagination={paginationConfig}
        locale={{ emptyText: customEmpty() }}
        size="small"
        bordered
      />
      
      {/* 删除确认对话框 */}
      <Modal
        {...modalConfig}
      />

      {/* 上传文件对话框 */}
      <UploadModal
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onUpload={handleFileUpload}
      />
    </div>
  );
};

export default FileTable; 