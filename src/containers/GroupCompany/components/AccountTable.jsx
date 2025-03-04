import React, { useState } from "react";
import { Form, Row, Col, message, ConfigProvider, Spin } from "antd";
import "../../../styles/account/AccountTable.css";
import SearchForm from "./SearchForm";
import ActionButtons from "./ActionButtons";
import AccountDataTable from "./AccountDataTable";
import axios from "axios";
import URL_CONS from '../../../constants/url';

const AccountTable = () => {
  // 状态管理
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  // 模拟当前用户
  const currentUser = "Vivian Fung";

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
    console.log("Search:", dataIndex, selectedKeys[0]);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
  };

  const handleFilter = (selectedKeys, confirm, dataIndex) => {
    confirm();
    console.log("Filter:", dataIndex, selectedKeys[0]);
  };

  const handleCloseFilter = (confirm) => {
    confirm();
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // 将表单值转换为API请求参数
  const getRequestParams = (formValues, paginationParams) => {
    return {
      headGroupName: formValues.headGroup || "",
      gfasAccountNo: formValues.gfasAccountNo || "",
      rmName: formValues.rm || "",
      fundClass: formValues.fundClass || "",
      wiGroupName: formValues.wiGroup || "",
      isGlobalClient: formValues.globalClient === true ? 'Y' : formValues.globalClient === false ? 'N' : "",
      pageSize: paginationParams.pageSize,
      pageNum: paginationParams.current
    };
  };

  // 将API响应数据转换为表格数据
  const formatResponseData = (list) => {
    return list.map(item => ({
      key: item.mappingId,
      gfasAccountNo: item.gfAsAccountNo,
      altId: item.afterNativelid,
      gfasAccountName: item.gfAsAccountName,
      headGroup: item.headGroupName,
      wiGroup: item.wiGroupName,
      wiCustomizedGroup: item.wiCustomizedGroupName,
      fundClass: item.fundClass,
      pensionCategory: item.pensionCategory,
      portfolioNature: item.portfolioNature,
      memberChoice: item.memberChoice,
      rm: item.rmName,
      agent: item.agent,
      globalClient: item.isGlobalClient === 'Y'
    }));
  };

  // 调用API进行搜索
  const searchGroupCompany = async (params) => {
    try {
      const config = {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };
      
      console.log('Sending request to:', URL_CONS.GROUP_COMPANY_FUZZY_SEARCH_URL);
      console.log('Request params:', JSON.stringify(params, null, 2));
      
      const response = await axios.post(URL_CONS.GROUP_COMPANY_FUZZY_SEARCH_URL, params, config);
      
      console.log('Response received:', response.data);
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
          pageSize: pageSize,
          total: total
        }));
        return true;
      } else {
        setTableData([]);
        messageApi.warning({
          content: "No data found",
          duration: 3
        });
        return false;
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

  // 执行搜索
  const executeSearch = async (formValues, paginationParams) => {
    try {
      setLoading(true);
      const params = getRequestParams(formValues, paginationParams);
      const response = await searchGroupCompany(params);
      return handleApiResponse(response);
    } catch (error) {
      showError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 搜索按钮点击处理
  const handleSearchClick = async () => {
    console.log("Search button clicked");
    
    const formValues = form.getFieldsValue();
    console.log('Form values:', formValues);

    if (!validateForm(formValues)) {
      return;
    }

    await executeSearch(formValues, pagination);
  };

  // 表单操作函数
  const handleClear = () => {
    form.resetFields();
  };

  const handleAdd = () => {
    console.log("Add new record");
  };

  const handleEdit = () => {
    console.log("Edit selected records:", selectedRowKeys);
  };

  const handleDelete = () => {
    console.log("Delete selected records:", selectedRowKeys);
  };

  // 处理分页变化
  const handleTableChange = (newPagination) => {
    const updatedPagination = {
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    };
    
    setPagination(updatedPagination);
    
    // 使用新的分页参数重新搜索
    const formValues = form.getFieldsValue();
    executeSearch(formValues, updatedPagination);
  };

  return (
    <ConfigProvider componentDisabled={false}>
      <Spin spinning={loading} tip="Loading...">
        <div className="account-table-container">
          {contextHolder}
          {/* 第一行：表单组件 */}
          <Row className="form-row" gutter={[0, 16]}>
            <Col span={24}>
              <SearchForm form={form} onFormChange={() => {}} />
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
                currentUser={currentUser}
                pagination={pagination}
                onChange={handleTableChange}
              />
            </Col>
          </Row>
        </div>
      </Spin>
    </ConfigProvider>
  );
};

export default AccountTable;
