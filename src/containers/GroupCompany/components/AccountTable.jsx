import React, { useState } from "react";
import { Form, Row, Col, message, ConfigProvider } from "antd";
import "../../../styles/account/AccountTable.css";
import SearchForm from "./SearchForm";
import ActionButtons from "./ActionButtons";
import AccountDataTable from "./AccountDataTable";

const AccountTable = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // 模拟当前用户
  const currentUser = "Vivian Fung";

  // 模拟数据 - 可以设置为空数组[]来测试无数据状态
  const data = [
    {
      key: "1",
      gfasAccountNo: "CLA4103832",
      altId: "ALT001",
      gfasAccountName: "FIDELITY PRESERVED ACCOUNT",
      headGroup: "FRUIT - PERSONAL A/C",
      wiGroup: "FRUIT - PERSONAL A/C",
      wiCustomizedGroup: "xxx",
      fundClass: "FRUIT",
      pensionCategory: "MPF-Direct",
      portfolioNature: "Pension",
      memberChoice: "Member Choice",
      rm: "Customer Services Officer",
      agent: "",
      globalClient: true,
    },
    {
      key: "2",
      gfasAccountNo: "CLA4104677",
      altId: "ALT002",
      gfasAccountName: "CLEARSTREAM BANKING SA - LIEF",
      headGroup: "MANULIFE",
      wiGroup: "MANULIFE",
      wiCustomizedGroup: "xxx",
      fundClass: "FQIF - B",
      pensionCategory: "MPF-Intermediary",
      portfolioNature: "Pension",
      memberChoice: "Member Choice",
      rm: "Vivian Fung",
      agent: "",
      globalClient: false,
    },
    {
      key: "3",
      gfasAccountNo: "HOSP410330",
      altId: "ALT003",
      gfasAccountName: "HOSPITAL AUTHORITY",
      headGroup: "HOSPITAL AUTHORITY",
      wiGroup: "HA",
      wiCustomizedGroup: "xxx",
      fundClass: "FRUIT",
      pensionCategory: "MPF-Direct",
      portfolioNature: "Pension",
      memberChoice: "Member Choice",
      rm: "Silvia Kong",
      agent: "",
      globalClient: false,
    },
  ];

  // 处理搜索
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    console.log("Search:", dataIndex, selectedKeys[0]);
  };

  // 处理重置
  const handleReset = (clearFilters) => {
    clearFilters();
  };

  // 处理筛选
  const handleFilter = (selectedKeys, confirm, dataIndex) => {
    confirm();
    console.log("Filter:", dataIndex, selectedKeys[0]);
  };

  // 处理关闭筛选
  const handleCloseFilter = (confirm) => {
    confirm();
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleSearchClick = () => {
    console.log("Search button clicked");
    
    // 获取表单所有字段的值
    const formValues = form.getFieldsValue();
    console.log('Form values:', formValues);

    // 指定需要检查的字段
    const requiredFields = ['headGroup', 'gfasAccountNo', 'rm', 'wiGroup', 'fundClass', 'globalClient'];
    
    // 检查指定字段中是否至少有一个有值
    const hasAtLeastOneField = requiredFields.some(field => {
      const value = formValues[field];
      return value !== undefined && value !== null && value !== "";
    });
    
    console.log('Has at least one required field:', hasAtLeastOneField);

    if (!hasAtLeastOneField) {
      // 如果没有填写任何必填搜索条件，显示提示信息
      console.log("No search criteria entered, showing error message");
      messageApi.error({
        content: "Please input one search criteria at least",
        duration: 3 // 显示3秒
      });
      return;
    }

    // 有搜索条件，继续搜索
    console.log("Search with:", formValues);
  };

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

  return (
    <ConfigProvider componentDisabled={false}>
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
              data={data}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={onSelectChange}
              handleSearch={handleSearch}
              handleReset={handleReset}
              handleFilter={handleFilter}
              handleCloseFilter={handleCloseFilter}
              currentUser={currentUser}
            />
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
};

export default AccountTable;
