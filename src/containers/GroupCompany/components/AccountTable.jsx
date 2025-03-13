import React, { useState, useEffect, useCallback } from "react";
import { Form, Row, Col, message, ConfigProvider, Spin, Modal } from "antd";
import "../../../styles/account/AccountTable.css";
import axios from "axios";
import SearchForm from "./SearchForm";
import ActionButtons from "./ActionButtons";
import AccountDataTable from "./AccountDataTable";
import AddAccountModal from "./AddAccountModal";
import EditAccountModal from "./EditAccountModal";
import URL_CONS from '../../../constants/url';
import { queryUserByDepartments, queryUserRole } from '../../../api/groupCompany';

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
          content: "Failed to fetch user role: " + (response?.errMessage || "Unknown error"),
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
          content: "Failed to load RM users: " + (response?.errMessage || "Unknown error"),
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
      isGlobalClient: formValues.globalClient === true ? 'Y' : formValues.globalClient === false ? 'N' : "",
      isGlobalClient: (() => {
        if (formValues.globalClient === true) return 'Y'
        if (formValues.globalClient === false) return 'N'
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
  const searchGroupCompany = async (params) => {
    try {
      const response = await axios.post(URL_CONS.GROUP_COMPANY_FUZZY_SEARCH_URL, params);
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };

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
      } else {
        setTableData([]);
        messageApi.warning({
          content: "No data found",
          duration: 3
        });
      }
    } else {
      messageApi.error({
        content: response.errMessage || "Search failed",
        duration: 3
      });
      return false;
    }
  };

  // 验证表单至少有一个字段有值
  const validateForm = (formValues) => {
    const requiredFields = ['headGroup', 'gfasAccountNo', 'rm', 'wiGroup', 'fundClass', 'globalClient'];
    
    const hasAtLeastOneField = requiredFields.some(field => {
      const value = formValues[field];
      return value !== undefined && value !== null && value !== "";
    });
    
    if (!hasAtLeastOneField) {
      messageApi.error({
        content: "Please input one search criteria at least",
        duration: 3
      });
      return false;
    }
    
    return true;
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

    await executeSearch(formValues, pagination);
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
    // 刷新表格数据
    executeSearch(form.getFieldsValue(), pagination);
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
    // 刷新表格数据
    executeSearch(form.getFieldsValue(), pagination);
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
    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete the record for ${record.gfasAccountNo}?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        // 这里应该调用删除API
        console.log('Delete record:', record);
        messageApi.success('Record deleted successfully');
        // 刷新表格数据
        executeSearch(form.getFieldsValue(), pagination);
      }
    });
  };

  // 处理删除按钮点击
  const handleDelete = () => {
    if (selectedRows.length > 0) {
      Modal.confirm({
        title: 'Confirm Delete',
        content: `Are you sure you want to delete ${selectedRows.length} selected record(s)?`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk() {
          // 这里应该调用批量删除API
          console.log('Delete records:', selectedRows);
          messageApi.success('Records deleted successfully');
          // 清空选中状态
          setSelectedRowKeys([]);
          setSelectedRows([]);
          // 刷新表格数据
          executeSearch(form.getFieldsValue(), pagination);
        }
      });
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
        </div>
      </Spin>
    </ConfigProvider>
  );
};

export default AccountTable;
