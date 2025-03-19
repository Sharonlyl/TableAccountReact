import React, { useState, useEffect, useCallback } from "react";
import { Form, Row, Col, message, ConfigProvider, Spin, Modal, Button } from "antd";
import "../../../styles/account/AccountTable.css";
import "../styles/GroupCompany.css";
import axios from "axios";
import SearchForm from "./SearchForm";
import ActionButtons from "./ActionButtons";
import AccountDataTable from "./AccountDataTable";
import AddAccountModal from "./AddAccountModal";
import EditAccountModal from "./EditAccountModal";
import URL_CONS from '../../../constants/url';
import { queryUserByDepartments, queryUserRole, searchGroupCompany, removeGroupMapping } from '../../../api/groupCompany';

// 防抖函数
const debounce = (func, delay) => {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const AccountTable = () => {
  // 状态管理
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [rmUsers, setRmUsers] = useState([]);
  const [userRoleInfo, setUserRoleInfo] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [filterParams, setFilterParams] = useState({});
  // 添加选中行数据的状态
  const [selectedRows, setSelectedRows] = useState([]);
  // 添加弹窗可见性状态
  const [addModalVisible, setAddModalVisible] = useState(false);
  // 添加编辑弹窗可见性状态
  const [editModalVisible, setEditModalVisible] = useState(false);
  // 添加当前编辑的记录
  const [currentRecord, setCurrentRecord] = useState(null);
  // 添加删除确认对话框状态
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  // 添加要删除的记录状态
  const [recordToDelete, setRecordToDelete] = useState(null);
  // 添加删除确认按钮loading状态
  const [deleteConfirmLoading, setDeleteConfirmLoading] = useState(false);

  // 使用useCallback和防抖函数优化搜索函数
  const debouncedExecuteSearch = useCallback(
    debounce((formValues, paginationParams, filterParams) => {
      executeSearchWithFilters(formValues, paginationParams, filterParams);
    }, 300),
    []
  );

  // 在组件挂载时获取用户角色信息
  useEffect(() => {
    fetchUserRole();
    fetchRmUsers();
  }, []);

  // 获取用户角色信息
  const fetchUserRole = async () => {
    try {
      setLoading(true);
      
      const response = await queryUserRole();
      
      if (response && response.success) {
        setUserRoleInfo(response.data);
        
      } else {
        console.error('Failed to fetch user role:', response?.errMessage);
        messageApi.warning({
          content: "Failed to fetch user role: ",
          duration: 3
        });
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      messageApi.error('Error fetching user role');
    } finally {
      setLoading(false);
    }
  };

  // 获取RM用户列表
  const fetchRmUsers = async () => {
    try {
      setLoading(true);
      
      const response = await queryUserByDepartments({
        departments: 'RM' // 硬编码为RM
      });

      if (response && response.success) {
        setRmUsers(response.data || []);
      } else {
        console.error('Failed to fetch RM users:', response?.errMessage);
        messageApi.warning({
          content: "Failed to load RM users: ",
          duration: 3
        });
      }
    } catch (error) {
      console.error('Error fetching RM users:', error);
      showError(error);
      // 即使API调用失败，也不阻止应用程序的其他功能
      setRmUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // 显示错误信息
  const showError = (error) => {
    console.error('Error details:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (axios.isAxiosError(error)) {
      // 处理Axios错误
      if (error.response) {
        // 服务器返回了错误状态码
        console.error('Response error data:', error.response.data);
        errorMessage = `Server error: ${error.response.status} - ${error.response.data.message || error.message}`;
      } else if (error.request) {
        // 请求已发送但没有收到响应
        errorMessage = 'No response from server. Please check your network connection.';
      } else {
        // 请求设置时出错
        errorMessage = `Request error: ${error.message}`;
      }
    } else if (error instanceof Error) {
      // 处理普通JS错误
      errorMessage = error.message;
    }
    
    messageApi.open({
      type: 'error',
      content: (
        <div>
          <p>System Error</p>
          <p>{errorMessage}</p>
        </div>
      ),
      duration: 5
    });
  };

  // 表格筛选相关函数
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    
    // 如果表格数据为空，则不执行搜索
    if (tableData.length === 0) {
      return;
    }
    
    // 获取当前表单值
    const formValues = form.getFieldsValue();
    
    // 更新筛选参数，只移除当前重置的筛选条件
    const newFilterParams = { ...filterParams };
    if (dataIndex === 'headGroup') {
      delete newFilterParams.headGroupNameFilter;
    } else if (dataIndex === 'wiGroup') {
      delete newFilterParams.wiGroupNameFilter;
    } else if (dataIndex === 'wiCustomizedGroup') {
      delete newFilterParams.wiCustomizedGroupName;
    }
    
    // 更新筛选参数状态
    setFilterParams(newFilterParams);
    
    // 使用更新后的筛选参数重新搜索
    executeSearchWithFilters(formValues, pagination, newFilterParams);
  };

  const handleFilter = (selectedKeys, confirm, dataIndex) => {
    confirm();
    
    // 如果表格数据为空，则不执行搜索
    if (tableData.length === 0) {
      return;
    }
    
    // 获取当前表单值
    const formValues = form.getFieldsValue();
    
    // 根据筛选的字段名添加对应的筛选参数
    const newFilterParams = { ...filterParams };
    if (dataIndex === 'headGroup' && selectedKeys[0]) {
      const [firstSelectedKey] = selectedKeys
      newFilterParams.headGroupNameFilter = firstSelectedKey;
    } else if (dataIndex === 'wiGroup' && selectedKeys[0]) {
      const [firstSelectedKey] = selectedKeys
      newFilterParams.wiGroupNameFilter = firstSelectedKey;
    } else if (dataIndex === 'wiCustomizedGroup' && selectedKeys[0]) {
      const [firstSelectedKey] = selectedKeys
      newFilterParams.wiCustomizedGroupName = firstSelectedKey;
    } else if (dataIndex && !selectedKeys[0]) {
      // 如果清除了某个筛选条件
      if (dataIndex === 'headGroup') delete newFilterParams.headGroupNameFilter;
      if (dataIndex === 'wiGroup') delete newFilterParams.wiGroupNameFilter;
      if (dataIndex === 'wiCustomizedGroup') delete newFilterParams.wiCustomizedGroupName;
    }
    
    // 更新筛选参数状态
    setFilterParams(newFilterParams);
    
    // 使用防抖函数执行搜索
    debouncedExecuteSearch(formValues, pagination, newFilterParams);
  };

  const handleCloseFilter = (confirm) => {
    confirm();
  };

  const onSelectChange = (newSelectedRowKeys, newSelectedRows) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRows);
  };

  // 将表单值转换为API请求参数，包含筛选条件
  const getRequestParams = (formValues, paginationParams, filterParams = {}) => {
    return {
      headGroupName: formValues.headGroup || "",
      gfasAccountNo: formValues.gfasAccountNo || "",
      rmName: formValues.rm || "",
      fundClass: formValues.fundClass || "",
      wiGroupName: formValues.wiGroup || "",
      isGlobalClient: (() => {
        if (formValues.globalClientY === true) return 'Y'
        if (formValues.globalClientN === true) return 'N'
        return ''
      })(),
      pageSize: paginationParams.pageSize,
      pageNum: paginationParams.current,
      // 添加筛选参数
      ...filterParams
    };
  };

  // 将API响应数据转换为表格数据
  const formatResponseData = (list) => {
    return list.map(item => ({
      key: item.mappingId,
      mappingId: item.mappingId,
      gfasAccountNo: item.gfasAccountNo,
      alternativeId: item.alternativeId,
      altId: item.alternativeId, // 为了兼容性添加altId字段
      gfasAccountName: item.gfasAccountName,
      headGroup: item.headGroupName,
      headGroupId: item.headGroupId,
      headGroupName: item.headGroupName,
      wiGroup: item.wiGroupName,
      wiGroupId: item.wiGroupId,
      wiGroupName: item.wiGroupName,
      wiCustomizedGroup: item.wiCustomizedGroupName,
      wiCustomizedGroupId: item.wiCustomizedGroupId,
      wiCustomizedGroupName: item.wiCustomizedGroupName,
      fundClass: item.fundClass,
      pensionCategory: item.pensionCategory,
      portfolioNature: item.portfolioNature,
      memberChoice: item.memberChoice,
      rm: item.rmName,
      agent: item.agent,
      globalClient: item.isGlobalClient,
      lastUpdatedBy: item.lastUpdatedBy,
      lastUpdatedDate: item.lastUpdatedDate,
      createdBy: item.createdBy,
      createdDate: item.createdDate
    }));
  };

  // 调用API进行搜索
  // 删除内部定义的searchGroupCompany函数，使用导入的函数

  // 处理API响应
  const handleApiResponse = (response) => {
    if (response.success) {
      const { list, total, pageNum, pageSize } = response.pageInfoData;
      
      if (list && Array.isArray(list) && list.length > 0) {
        const formattedData = formatResponseData(list);
        setTableData(formattedData);
        setPagination(prev => ({
          ...prev,
          current: pageNum,
          pageSize,
          total
        }));
        return true;
      } 
    } else {
      messageApi.error({
        content: response.errMessage || "Search failed",
        duration: 3
      });
      return false;
    }
  };

  // 添加一个辅助函数来检查搜索条件是否全部为空
  const hasAnySearchCriteria = (formValues) => {
    const fields = ['headGroup', 'gfasAccountNo', 'rm', 'wiGroup', 'fundClass'];
    
    return fields.some(field => {
      const value = formValues[field];
      return value !== undefined && value !== null && value !== "";
    }) || formValues.globalClientY === true || formValues.globalClientN === true;
  };

  // 验证表单至少有一个字段有值
  const validateForm = (formValues) => {
    const hasAtLeastOneField = hasAnySearchCriteria(formValues);
    
    if (!hasAtLeastOneField) {
      messageApi.error({
        content: "Please input one search criteria at least",
        duration: 3
      });
      return false;
    }
    
    return true;
  };

  // 刷新表格数据前检查搜索条件
  const refreshDataIfHasCriteria = () => {
    const formValues = form.getFieldsValue();
    
    // 只有当搜索条件不全为空时才调用查询接口
    if (hasAnySearchCriteria(formValues)) {
      executeSearch(formValues, pagination);
    } else {
      // 如果搜索条件全部为空，则不调用查询接口，只显示成功消息
      console.log('No search criteria, skipping data refresh');
    }
  };

  // 执行带筛选条件的搜索
  const executeSearchWithFilters = async (formValues, paginationParams, filterParams = {}) => {
    try {
      setLoading(true);
      const params = getRequestParams(formValues, paginationParams, filterParams);
      const response = await searchGroupCompany(params);
      return handleApiResponse(response);
    } catch (error) {
      showError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 执行搜索
  const executeSearch = async (formValues, paginationParams) => {
    return executeSearchWithFilters(formValues, paginationParams);
  };

  // 搜索按钮点击处理
  const handleSearchClick = async () => {
    const formValues = form.getFieldsValue();

    if (!validateForm(formValues)) {
      return;
    }

    // 清空所有筛选参数
    setFilterParams({});
    
    // 通知AccountDataTable组件清空筛选条件
    if (window.clearTableFilters) {
      window.clearTableFilters();
    }

    // 重置分页到第一页
    const resetPagination = {
      ...pagination,
      current: 1,
      pageSize: 20
    };
    
    // 更新分页状态
    setPagination(resetPagination);

    // 使用重置后的分页参数执行搜索
    await executeSearch(formValues, resetPagination);
  };

  // 表单操作函数
  const handleClear = () => {
    form.resetFields();
  };

  const handleAdd = () => {
    setAddModalVisible(true);
  };

  // 处理保存新账户
  const handleSaveAccount = (values) => {
    // 刷新表格数据前检查搜索条件
    refreshDataIfHasCriteria();
  };

  // 处理取消添加
  const handleCancelAdd = () => {
    setAddModalVisible(false);
  };

  // 处理编辑按钮点击
  const handleEdit = () => {
    if (selectedRows.length === 1) {
      setCurrentRecord(selectedRows[0]);
      setEditModalVisible(true);
    } else {
      messageApi.warning('Please select one record to edit');
    }
  };

  // 处理取消编辑
  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setCurrentRecord(null);
  };

  // 处理保存编辑
  const handleSaveEdit = (values) => {
    // 刷新表格数据前检查搜索条件
    refreshDataIfHasCriteria();
  };

  // 处理行内编辑按钮点击
  const handleEditRow = (record) => {
    console.log('AccountTable接收到的编辑记录:', record);
    setCurrentRecord(record);
    console.log('设置currentRecord后的值:', record);
    setEditModalVisible(true);
  };

  // 处理行内删除按钮点击
  const handleDeleteRow = (record) => {
    // 设置要删除的记录
    setRecordToDelete(record);
    // 显示删除确认对话框
    setDeleteModalVisible(true);
  };

  // 处理确认删除
  const handleConfirmDelete = async () => {
    if (recordToDelete) {
      try {
        setLoading(true);
        // 设置删除确认按钮的loading状态为true
        setDeleteConfirmLoading(true);
        const response = await removeGroupMapping(recordToDelete.mappingId);
        if (response.success) {
          messageApi.success('Record deleted successfully');
          // 关闭确认对话框
          setDeleteModalVisible(false);
          // 清空要删除的记录
          setRecordToDelete(null);
          
          // 刷新表格数据前检查搜索条件
          refreshDataIfHasCriteria();
        } else {
          messageApi.error({
            content: response.errMessage || "Failed to delete record",
            duration: 3
          });
        }
      } catch (error) {
        showError(error);
      } finally {
        setLoading(false);
        // 设置删除确认按钮的loading状态为false
        setDeleteConfirmLoading(false);
      }
    }
  };

  // 处理取消删除
  const handleCancelDelete = () => {
    // 关闭确认对话框
    setDeleteModalVisible(false);
    // 清空要删除的记录
    setRecordToDelete(null);
  };

  // 处理删除按钮点击
  const handleDelete = () => {
    if (selectedRows.length > 0) {
      // 这里应该调用批量删除API
      console.log('Delete records:', selectedRows);
      messageApi.success('Records deleted successfully');
      // 清空选中状态
      setSelectedRowKeys([]);
      setSelectedRows([]);
      
      // 刷新表格数据前检查搜索条件
      refreshDataIfHasCriteria();
    } else {
      messageApi.warning('Please select at least one record to delete');
    }
  };

  // 处理分页变化
  const handleTableChange = (newPagination) => {
    const updatedPagination = {
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    };
    
    setPagination(updatedPagination);
    
    // 使用新的分页参数和当前的筛选条件重新搜索
    const formValues = form.getFieldsValue();
    // 使用防抖函数执行搜索
    debouncedExecuteSearch(formValues, updatedPagination, filterParams);
  };

  return (
    <ConfigProvider componentDisabled={false}>
      <Spin spinning={loading} tip="Loading...">
        <div className="account-table-container">
          {contextHolder}
          {/* 隐藏的 Form 组件，用于连接 form 实例，解决 useForm 警告 */}
          <Form form={form} style={{ display: 'none' }}></Form>
          {/* 第一行：表单组件 */}
          <Row className="form-row" gutter={[0, 16]}>
            <Col span={24}>
              <SearchForm 
                form={form} 
                onFormChange={() => {}} 
                rmUsers={rmUsers}
              />
            </Col>
          </Row>

          {/* 第二行：按钮组件（靠右对齐） */}
          <Row className="buttons-row" gutter={[0, 16]} justify="end">
            <Col>
              <ActionButtons
                onSearch={handleSearchClick}
                onClear={handleClear}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                selectedRowKeys={selectedRowKeys}
                userRoleInfo={userRoleInfo}
                selectedRows={selectedRows}
              />
            </Col>
          </Row>

          {/* 第三行：表格组件 */}
          <Row className="table-row" gutter={[0, 16]}>
            <Col span={24}>
              <AccountDataTable
                data={tableData}
                selectedRowKeys={selectedRowKeys}
                onSelectChange={onSelectChange}
                handleSearch={handleSearch}
                handleReset={handleReset}
                handleFilter={handleFilter}
                handleCloseFilter={handleCloseFilter}
                pagination={pagination}
                onChange={handleTableChange}
                userRoleInfo={userRoleInfo}
                onEditRow={handleEditRow}
                onDeleteRow={handleDeleteRow}
              />
            </Col>
          </Row>

          {/* 添加账户弹窗 */}
          <AddAccountModal
            visible={addModalVisible}
            onCancel={handleCancelAdd}
            onSave={handleSaveAccount}
          />

          {/* 编辑账户弹窗 */}
          <EditAccountModal
            visible={editModalVisible}
            onCancel={handleCancelEdit}
            onSave={handleSaveEdit}
            record={currentRecord}
          />

          {/* 删除确认对话框 */}
          <Modal
            title="Delete Group Company Mapping"
            open={deleteModalVisible}
            onCancel={handleCancelDelete}
            footer={
              <div className="confirm-button-container">
                <Button key="confirm" type="primary" danger onClick={handleConfirmDelete} loading={deleteConfirmLoading}>
                  Delete
                </Button>
                <Button key="cancel" onClick={handleCancelDelete} disabled={deleteConfirmLoading}>
                  Cancel
                </Button>
              </div>
            }
            width={550}
            centered
          >
            {recordToDelete && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ paddingLeft: '60px' }}>
                  <Row gutter={[16, 8]}>
                    <Col span={24}>
                      <div className="confirm-item">
                        <span className="confirm-label">Head Group</span>
                        <span className="confirm-value">{recordToDelete.headGroupName || recordToDelete.headGroup}</span>
                      </div>
                    </Col>
                    
                    <Col span={24}>
                      <div className="confirm-item">
                        <span className="confirm-label">WI Group</span>
                        <span className="confirm-value">{recordToDelete.wiGroupName || recordToDelete.wiGroup}</span>
                      </div>
                    </Col>
                    
                    <Col span={24}>
                      <div className="confirm-item">
                        <span className="confirm-label">WI Customized Group</span>
                        <span className="confirm-value">{recordToDelete.wiCustomizedGroupName || recordToDelete.wiCustomizedGroup || 'xxx'}</span>
                      </div>
                    </Col>
                    
                    <Col span={24}>
                      <div className="confirm-item">
                        <span className="confirm-label">GFAS Account No</span>
                        <span className="confirm-value">{recordToDelete.gfasAccountNo}</span>
                      </div>
                    </Col>
                    
                    {recordToDelete.gfasAccountNo === 'CCC 111111' && (
                      <Col span={24}>
                        <div className="confirm-item">
                          <span className="confirm-label">Alt Id</span>
                          <span className="confirm-value">{recordToDelete.alternativeId || ''}</span>
                        </div>
                      </Col>
                    )}
                    
                    <Col span={24}>
                      <div className="confirm-item">
                        <span className="confirm-label">GFAS Account Name</span>
                        <span className="confirm-value">{recordToDelete.gfasAccountName}</span>
                      </div>
                    </Col>
                    
                    <Col span={24}>
                      <div className="confirm-item">
                        <span className="confirm-label">Fund Class</span>
                        <span className="confirm-value">{recordToDelete.fundClass}</span>
                      </div>
                    </Col>
                    
                    <Col span={24}>
                      <div className="confirm-item">
                        <span className="confirm-label">Pension Category</span>
                        <span className="confirm-value">{recordToDelete.pensionCategory}</span>
                      </div>
                    </Col>
                    
                    <Col span={24}>
                      <div className="confirm-item">
                        <span className="confirm-label">Portfolio Nature</span>
                        <span className="confirm-value">{recordToDelete.portfolioNature}</span>
                      </div>
                    </Col>
                    
                    <Col span={24}>
                      <div className="confirm-item">
                        <span className="confirm-label">Member Choice</span>
                        <span className="confirm-value">{recordToDelete.memberChoice}</span>
                      </div>
                    </Col>
                    
                    <Col span={24}>
                      <div className="confirm-item">
                        <span className="confirm-label">RM</span>
                        <span className="confirm-value">{recordToDelete.rm}</span>
                      </div>
                    </Col>
                    
                    <Col span={24}>
                      <div className="confirm-item">
                        <span className="confirm-label">Agent</span>
                        <span className="confirm-value">{recordToDelete.agent}</span>
                      </div>
                    </Col>
                    
                    <Col span={24}>
                      <div className="confirm-item">
                        <span className="confirm-label">Global Client</span>
                        <span className="confirm-value">{recordToDelete.globalClient}</span>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </Spin>
    </ConfigProvider>
  );
};

export default AccountTable;
