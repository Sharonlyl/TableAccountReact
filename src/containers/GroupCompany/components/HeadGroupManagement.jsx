import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Form, Input, Button, message, Card, Checkbox, Table, Space, Row, Col, Empty } from 'antd';
import { PlusOutlined, SearchOutlined, ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { queryHeadGroup, addHeadGroup, saveHeadGroup, removeHeadGroup } from '../../../api/groupCompany';
import dayjs from 'dayjs';
import '../styles/AddAccountModal.css';

// 页面大小常量，避免魔法数字
const PAGE_SIZE = 20;

// 新增/更新弹窗组件
const HeadGroupFormModal = ({ 
  visible, 
  onCancel, 
  onSave, 
  title = 'Head Group', 
  buttonText = 'Save',
  initialValues = {}, 
  confirmLoading = false,
  modalType // 新增modalType参数以明确区分是新建还是更新
}) => {
  const [form] = Form.useForm();
  const formRef = React.useRef(null);
  const [messageApi, contextHolder] = message.useMessage();

  // 当Modal打开或类型/初始值变化时重置表单
  useEffect(() => {
    if (visible) {
      // 先重置表单，清除所有字段值
      form.resetFields();
      
      // 如果是更新模式且有初始值，则设置表单值
      if (modalType === 'update' && initialValues && initialValues.groupName) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [visible, modalType, initialValues, form]);

  // 处理保存按钮点击
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
    } catch (info) {
      console.log('Validate Failed:', info);
    }
  };

  // 处理取消按钮点击
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleCancel}
      destroyOnClose={true} // 确保关闭时完全销毁Modal内容
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={confirmLoading}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave} loading={confirmLoading}>
          {buttonText}
        </Button>
      ]}
      maskClosable={false}
    >
      {contextHolder}
      <Form
        form={form}
        ref={formRef}
        layout="vertical"
        // 不在这里设置initialValues，而是通过useEffect处理
      >
        <Form.Item
          name="groupName"
          label="Head Group Name"
          rules={[
            { required: true, message: 'Please enter Head Group Name' },
            { max: 110, message: 'Head Group Name cannot exceed 110 characters' }
          ]}
        >
          <Input 
            placeholder="Input the new Head Group name here" 
            maxLength={110}
            autoFocus
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// 主要的Head Group管理组件
const HeadGroupManagement = ({ visible = true, onBack }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    showSizeChanger: false,
    showQuickJumper: false
  });
  const [searchParams, setSearchParams] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('new'); // 'new' or 'update'
  const [currentRecord, setCurrentRecord] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  // 设置页面标题
  useEffect(() => {
    document.title = 'Head Group Management';
  }, []);

  // 当组件加载时，只进行初始化但不进行搜索
  useEffect(() => {
    if (visible) {
      // 重置表单
      form.resetFields();
      // 重置数据
      setData([]);
      // 重置页码
      setPagination(prev => ({ ...prev, current: 1 }));
      // 重置搜索参数
      setSearchParams(null);
    }
  }, [visible, form]);

  // 获取数据 - 使用useCallback包装以避免不必要的重新创建
  const fetchData = useCallback(async (params) => {
    if (!params) return;
    
    // 确保pageSize始终为定义的常量值
    const requestParams = {
      ...params,
      pageSize: PAGE_SIZE
    };
    
    setLoading(true);
    try {
      const response = await queryHeadGroup(requestParams);
      if (response.success) {
        const { pageInfoData } = response;
        setData(pageInfoData.list.map(item => ({
          ...item,
          key: item.headGroupId
        })));
        setPagination(prev => ({
          ...prev,
          current: pageInfoData.pageNum,
          pageSize: PAGE_SIZE, // 强制保持pageSize为常量值
          total: pageInfoData.total
        }));
      } else {
        messageApi.error(response.errMessage || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching head group data:', error);
      messageApi.error('Failed to fetch data');
    } finally {
      setLoading(false);
      // 确保所有搜索相关的loading消息都被关闭
      messageApi.destroy('searchLoading');
    }
  }, [messageApi]);

  // 处理搜索操作
  const handleSearch = useCallback((values) => {
    const { groupName, orphanGroupY, orphanGroupN } = values;
    
    // 构建基础参数
    const params = {
      groupName: groupName || '',
      pageNum: 1,
      pageSize: PAGE_SIZE // 强制设置为常量值
    };
    
    // 根据选择决定是否添加orphanGroup参数及其值
    if (orphanGroupY) {
      params.orphanGroup = true;
    } else if (orphanGroupN) {
      params.orphanGroup = false;
    }
    // 如果都未选择，则不添加orphanGroup参数
    
    // 显示Loading消息
    messageApi.loading({ content: 'Searching...', key: 'searchLoading', duration: 0 });
    setSearchParams(params);
    fetchData(params).then(() => {
      // 搜索完成后关闭Loading消息
      messageApi.destroy('searchLoading');
    });
  }, [fetchData, messageApi]);

  // 处理Orphan Group Y选项变化
  const handleOrphanGroupYChange = useCallback((e) => {
    // 如果选中Y，则取消选中N
    if (e.target.checked) {
      form.setFieldsValue({ orphanGroupN: false });
    }
  }, [form]);
  
  // 处理Orphan Group N选项变化
  const handleOrphanGroupNChange = useCallback((e) => {
    // 如果选中N，则取消选中Y
    if (e.target.checked) {
      form.setFieldsValue({ orphanGroupY: false });
    }
  }, [form]);

  // 处理表格分页、排序等变化
  const handleTableChange = useCallback((pagi) => {
    const params = {
      ...searchParams,
      pageNum: pagi.current,
      pageSize: PAGE_SIZE // 强制设置为常量值
    };
    setPagination(prev => ({
      ...prev,
      current: pagi.current,
      pageSize: PAGE_SIZE // 强制设置为常量值
    }));
    fetchData(params);
  }, [searchParams, fetchData]);

  // 处理打开新建Modal
  const handleOpenNewModal = useCallback(() => {
    // 先清空当前记录，然后再设置模态类型和显示状态
    setCurrentRecord(null);
    setModalType('new');
    setModalVisible(true);
  }, []);

  // 处理打开更新Modal
  const handleOpenUpdateModal = useCallback((record) => {
    setModalType('update');
    setCurrentRecord(record);
    setModalVisible(true);
  }, []);

  // 处理关闭Modal
  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    // 延迟清空当前记录，避免闪烁
    setTimeout(() => {
      if (modalType === 'update') {
        setCurrentRecord(null);
      }
    }, 100);
  }, [modalType]);

  // 刷新数据的通用函数
  const refreshData = useCallback(() => {
    if (searchParams) {
      // 确保使用pageSize为常量值的搜索参数
      const updatedParams = {
        ...searchParams,
        pageSize: PAGE_SIZE
      };
      // 显示Loading消息
      messageApi.loading({ content: 'Loading...', key: 'searchLoading', duration: 0 });
      setSearchParams(updatedParams);
      fetchData(updatedParams);
    }
  }, [searchParams, fetchData, messageApi]);

  // 处理新增Head Group
  const handleAddHeadGroup = useCallback(async (values) => {
    setConfirmLoading(true);
    try {
      const response = await addHeadGroup({
        groupName: values.groupName
      });
      if (response.success) {
        messageApi.success('Head Group added successfully');
        setModalVisible(false);
        refreshData();
      } else {
        messageApi.error(response.errMessage || 'Failed to add Head Group');
      }
    } catch (error) {
      console.error('Error adding head group:', error);
      messageApi.error('Failed to add Head Group');
    } finally {
      setConfirmLoading(false);
    }
  }, [messageApi, refreshData]);

  // 处理更新Head Group
  const handleUpdateHeadGroup = useCallback(async (values) => {
    if (!currentRecord) return;
    
    setConfirmLoading(true);
    try {
      const response = await saveHeadGroup({
        headGroupId: currentRecord.headGroupId,
        groupName: values.groupName
      });
      if (response.success) {
        messageApi.success('Head Group updated successfully');
        setModalVisible(false);
        refreshData();
      } else {
        messageApi.error(response.errMessage || 'Failed to update Head Group');
      }
    } catch (error) {
      console.error('Error updating head group:', error);
      messageApi.error('Failed to update Head Group');
    } finally {
      setConfirmLoading(false);
    }
  }, [currentRecord, messageApi, refreshData]);

  // 处理保存Modal
  const handleSaveModal = useCallback((values) => {
    if (modalType === 'new') {
      handleAddHeadGroup(values);
    } else {
      handleUpdateHeadGroup(values);
    }
  }, [modalType, handleAddHeadGroup, handleUpdateHeadGroup]);

  // 处理打开删除确认对话框
  const handleOpenDeleteConfirm = useCallback((record) => {
    setRecordToDelete(record);
    setDeleteConfirmVisible(true);
  }, []);

  // 处理关闭删除确认对话框
  const handleCloseDeleteConfirm = useCallback(() => {
    setDeleteConfirmVisible(false);
    setRecordToDelete(null);
  }, []);

  // 处理删除Head Group
  const handleDeleteHeadGroup = useCallback(async () => {
    if (!recordToDelete) return;
    
    setConfirmLoading(true);
    try {
      const response = await removeHeadGroup(recordToDelete.headGroupId);
      if (response.success) {
        messageApi.success('Head Group deleted successfully');
        setDeleteConfirmVisible(false);
        setRecordToDelete(null);
        refreshData();
      } else {
        messageApi.error(response.errMessage || 'Failed to delete Head Group');
      }
    } catch (error) {
      console.error('Error deleting head group:', error);
      messageApi.error('Failed to delete Head Group');
    } finally {
      setConfirmLoading(false);
    }
  }, [recordToDelete, messageApi, refreshData]);

  // 返回上一页 - 当在新窗口中时，关闭窗口
  const handleBack = useCallback(() => {
    if (window.opener) {
      // 如果是通过window.open打开的，则关闭窗口
      window.close();
    } else if (onBack) {
      // 如果有传入onBack回调函数，则调用它
      onBack();
    }
  }, [onBack]);

  // 自定义空状态展示
  const customEmpty = useMemo(() => (
    <Empty 
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description="No Data" 
    />
  ), []);

  // 表格列定义 - 使用useMemo避免不必要的重新渲染
  const columns = useMemo(() => [
    {
      title: 'Head Group Name',
      dataIndex: 'groupName',
      key: 'groupName',
      ellipsis: true,
      width: 300,
    },
    {
      title: 'Last Update By',
      dataIndex: 'lastUpdatedUserName',
      key: 'lastUpdatedBy',
      ellipsis: true,
      width: 150
    },
    {
      title: 'Last Update Date',
      dataIndex: 'lastUpdatedDate',
      key: 'lastUpdatedDate',
      ellipsis: true,
      width: 150,
      render: (text) => text ? dayjs(text).format('YYYY/MM/DD') : '-'
    },
    {
      title: 'Action',
      key: 'action',
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Space size="small" style={{gap: 16}}>
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleOpenUpdateModal(record)}
          >
            Update
          </Button>
          <Button 
            danger 
            type="primary" 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleOpenDeleteConfirm(record)}
            disabled={!record.orphanGroup}
          >
            Delete
          </Button>
        </Space>
      ),
    }
  ], [handleOpenUpdateModal, handleOpenDeleteConfirm]);
  
  return (
    <div>
      {contextHolder}
      <Card title="Head Group Management" extra={<Button icon={<ArrowLeftOutlined />} onClick={handleBack}>Back</Button>}>
        {/* 搜索表单 */}
        <Form
          form={form}
          name="headGroupSearch"
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
          initialValues={{ orphanGroupY: false, orphanGroupN: false }}
        >
          <Row style={{ width: '100%' }}>
            <Col flex="auto">
              <Space>
                <Form.Item name="groupName" label="Head Group Name">
                  <Input style={{ width: 300 }} />
                </Form.Item>
                <Form.Item label="Orphan Group" style={{ marginLeft: 8, marginBottom: 0 }}>
                  <Space>
                    <Form.Item name="orphanGroupY" valuePropName="checked" noStyle>
                      <Checkbox onChange={handleOrphanGroupYChange}>Y</Checkbox>
                    </Form.Item>
                    <Form.Item name="orphanGroupN" valuePropName="checked" noStyle>
                      <Checkbox onChange={handleOrphanGroupNChange}>N</Checkbox>
                    </Form.Item>
                  </Space>
                </Form.Item>
              </Space>
            </Col>
            <Col>
              <Space>
                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    Search
                  </Button>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenNewModal}>
                    New
                  </Button>
                </Form.Item>
              </Space>
            </Col>
          </Row>
        </Form>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          size="small"
          rowKey="headGroupId"
          locale={{ emptyText: customEmpty }}
          bordered
        />
      </Card>

      {/* 新增/更新Modal */}
      <HeadGroupFormModal
        visible={modalVisible}
        onCancel={handleCloseModal}
        onSave={handleSaveModal}
        title={modalType === 'new' ? 'New Head Group' : 'Update Head Group'}
        buttonText={modalType === 'new' ? 'Save' : 'Update'}
        initialValues={modalType === 'update' && currentRecord ? { groupName: currentRecord.groupName } : {}}
        confirmLoading={confirmLoading}
        modalType={modalType} // 传递modalType到Modal组件
      />

      {/* 删除确认对话框 */}
      <Modal
        title="Confirm Delete"
        open={deleteConfirmVisible}
        onOk={handleDeleteHeadGroup}
        onCancel={handleCloseDeleteConfirm}
        confirmLoading={confirmLoading}
      >
        <p>Are you sure to delete this group?</p>
      </Modal>
    </div>
  );
};

// 导出公共组件
export default HeadGroupManagement; 