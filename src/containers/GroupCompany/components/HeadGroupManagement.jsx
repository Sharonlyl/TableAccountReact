import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Card, Checkbox, Table, Space, Row, Col, Empty } from 'antd';
import { PlusOutlined, SearchOutlined, ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { queryHeadGroup, addHeadGroup, saveHeadGroup, removeHeadGroup } from '../../../api/groupCompany';
import dayjs from 'dayjs';
import '../styles/AddAccountModal.css';

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
  const handleSave = () => {
    form.validateFields()
      .then(values => {
        onSave(values);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
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
    pageSize: 20,
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
      setPagination({ ...pagination, current: 1 });
      // 重置搜索参数
      setSearchParams(null);
    }
  }, [visible]);

  // 处理搜索操作
  const handleSearch = (values) => {
    const { groupName, orphanGroupY, orphanGroupN } = values;
    
    // 构建基础参数
    const params = {
      groupName: groupName || '',
      pageNum: 1,
      pageSize: 20 // 强制设置为20
    };
    
    // 根据选择决定是否添加orphanGroup参数及其值
    if (orphanGroupY) {
      params.orphanGroup = true;
    } else if (orphanGroupN) {
      params.orphanGroup = false;
    }
    // 如果都未选择，则不添加orphanGroup参数
    
    setSearchParams(params);
    fetchData(params);
  };

  // 处理Orphan Group Y选项变化
  const handleOrphanGroupYChange = (e) => {
    // 如果选中Y，则取消选中N
    if (e.target.checked) {
      form.setFieldsValue({ orphanGroupN: false });
    }
  };
  
  // 处理Orphan Group N选项变化
  const handleOrphanGroupNChange = (e) => {
    // 如果选中N，则取消选中Y
    if (e.target.checked) {
      form.setFieldsValue({ orphanGroupY: false });
    }
  };

  // 处理表格分页、排序等变化
  const handleTableChange = (pagi) => {
    const params = {
      ...searchParams,
      pageNum: pagi.current,
      pageSize: 20 // 强制设置为20
    };
    setPagination({
      ...pagination,
      current: pagi.current,
      pageSize: 20 // 强制设置为20
    });
    fetchData(params);
  };

  // 获取数据
  const fetchData = async (params) => {
    if (!params) return;
    
    // 确保pageSize始终为20
    const requestParams = {
      ...params,
      pageSize: 20
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
        setPagination({
          ...pagination,
          current: pageInfoData.pageNum,
          pageSize: 20, // 强制保持pageSize为20
          total: pageInfoData.total
        });
      } else {
        messageApi.error(response.errMessage || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching head group data:', error);
      messageApi.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // 处理打开新建Modal
  const handleOpenNewModal = () => {
    // 先清空当前记录，然后再设置模态类型和显示状态
    setCurrentRecord(null);
    setModalType('new');
    setModalVisible(true);
  };

  // 处理打开更新Modal
  const handleOpenUpdateModal = (record) => {
    setModalType('update');
    setCurrentRecord(record);
    setModalVisible(true);
  };

  // 处理关闭Modal
  const handleCloseModal = () => {
    setModalVisible(false);
    // 延迟清空当前记录，避免闪烁
    setTimeout(() => {
      if (modalType === 'update') {
        setCurrentRecord(null);
      }
    }, 100);
  };

  // 处理保存Modal
  const handleSaveModal = (values) => {
    if (modalType === 'new') {
      handleAddHeadGroup(values);
    } else {
      handleUpdateHeadGroup(values);
    }
  };

  // 处理新增Head Group
  const handleAddHeadGroup = async (values) => {
    setConfirmLoading(true);
    try {
      const response = await addHeadGroup({
        groupName: values.groupName
      });
      if (response.success) {
        messageApi.success('Head Group added successfully');
        setModalVisible(false);
        // 重新加载数据
        if (searchParams) {
          // 确保使用pageSize为20的搜索参数
          const updatedParams = {
            ...searchParams,
            pageSize: 20
          };
          setSearchParams(updatedParams);
          fetchData(updatedParams);
        }
      } else {
        messageApi.error(response.errMessage || 'Failed to add Head Group');
      }
    } catch (error) {
      console.error('Error adding head group:', error);
      messageApi.error('Failed to add Head Group');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 处理更新Head Group
  const handleUpdateHeadGroup = async (values) => {
    setConfirmLoading(true);
    try {
      const response = await saveHeadGroup({
        headGroupId: currentRecord.headGroupId,
        groupName: values.groupName
      });
      if (response.success) {
        messageApi.success('Head Group updated successfully');
        setModalVisible(false);
        // 重新加载数据
        if (searchParams) {
          // 确保使用pageSize为20的搜索参数
          const updatedParams = {
            ...searchParams,
            pageSize: 20
          };
          setSearchParams(updatedParams);
          fetchData(updatedParams);
        }
      } else {
        messageApi.error(response.errMessage || 'Failed to update Head Group');
      }
    } catch (error) {
      console.error('Error updating head group:', error);
      messageApi.error('Failed to update Head Group');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 处理打开删除确认对话框
  const handleOpenDeleteConfirm = (record) => {
    setRecordToDelete(record);
    setDeleteConfirmVisible(true);
  };

  // 处理关闭删除确认对话框
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmVisible(false);
    setRecordToDelete(null);
  };

  // 处理删除Head Group
  const handleDeleteHeadGroup = async () => {
    if (!recordToDelete) return;
    
    setConfirmLoading(true);
    try {
      const response = await removeHeadGroup(recordToDelete.headGroupId);
      if (response.success) {
        messageApi.success('Head Group deleted successfully');
        setDeleteConfirmVisible(false);
        setRecordToDelete(null);
        // 重新加载数据
        if (searchParams) {
          // 确保使用pageSize为20的搜索参数
          const updatedParams = {
            ...searchParams,
            pageSize: 20
          };
          setSearchParams(updatedParams);
          fetchData(updatedParams);
        }
      } else {
        messageApi.error(response.errMessage || 'Failed to delete Head Group');
      }
    } catch (error) {
      console.error('Error deleting head group:', error);
      messageApi.error('Failed to delete Head Group');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 返回上一页 - 当在新窗口中时，关闭窗口
  const handleBack = () => {
    if (window.opener) {
      // 如果是通过window.open打开的，则关闭窗口
      window.close();
    } else if (onBack) {
      // 如果有传入onBack回调函数，则调用它
      onBack();
    }
  };

  // 自定义空状态展示
  const customEmpty = () => (
    <Empty 
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description="No Data" 
    />
  );

  // 表格列定义
  const columns = [
    {
      title: 'Head Group Name',
      dataIndex: 'groupName',
      key: 'groupName',
      ellipsis: true,
      width: 300,
    },
    {
      title: 'Last Update By',
      dataIndex: 'lastUpdatedBy',
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
  ];
  
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
          locale={{ emptyText: customEmpty() }}
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