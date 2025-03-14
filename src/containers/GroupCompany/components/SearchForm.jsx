import React, { useMemo } from 'react';
import { Form, Input, Checkbox, Select, Row, Col, Space } from 'antd';

// 自定义表单项样式
const formItemStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: '16px'
};

// 自定义标签样式 - 左对齐，与表格字体保持一致
const labelStyle = {
  flex: '0 0 120px',
  textAlign: 'left',
  marginRight: '12px',
  whiteSpace: 'nowrap',
  fontWeight: '600' // 调整加粗程度，与表格保持一致
};

// 自定义输入控件容器样式
const inputContainerStyle = {
  flex: '1 1 auto', // 自动填充剩余空间
  minWidth: '0' // 防止内容溢出
};

// 确保Select和Input样式一致
const selectStyle = {
  width: '100%' // 使Select宽度与容器一致
};

// 表单字段组件
const FormField = ({ label, name, children, valuePropName }) => (
  <div style={formItemStyle}>
    <div style={labelStyle}>{label}:</div>
    <div style={inputContainerStyle}>
      <Form.Item name={name} noStyle valuePropName={valuePropName}>
        {children}
      </Form.Item>
    </div>
  </div>
);

const SearchForm = ({ form, onFormChange, rmUsers = [] }) => {
  // 统一的onChange处理函数
  const handleChange = () => onFormChange && onFormChange();
  
  // 处理Global Client Y选项变化
  const handleGlobalClientYChange = (e) => {
    // 如果选中Y，则取消选中N
    if (e.target.checked) {
      form.setFieldsValue({ globalClientN: false });
    }
    handleChange();
  };
  
  // 处理Global Client N选项变化
  const handleGlobalClientNChange = (e) => {
    // 如果选中N，则取消选中Y
    if (e.target.checked) {
      form.setFieldsValue({ globalClientY: false });
    }
    handleChange();
  };
  
  // 使用useMemo缓存表单配置，避免重复创建
  const formConfig = useMemo(() => ({
    firstRow: [
      {
        label: 'Head Group',
        name: 'headGroup',
        component: <Input onChange={handleChange} />
      },
      {
        label: 'GFAS Account No',
        name: 'gfasAccountNo',
        component: <Input onChange={handleChange} />
      },
      {
        label: 'RM',
        name: 'rm',
        component: (
          <Select 
            style={selectStyle} 
            onChange={handleChange}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            <Select.Option key="cso" value="Client Service Officer">
              Client Service Officer
            </Select.Option>
            {rmUsers.map(user => (
              <Select.Option key={user.userId} value={user.userName}>
                {user.userName}
              </Select.Option>
            ))}
          </Select>
        )
      }
    ],
    secondRow: [
      {
        label: 'WI Group',
        name: 'wiGroup',
        component: <Input onChange={handleChange} />
      },
      {
        label: 'Fund Class',
        name: 'fundClass',
        component: <Input onChange={handleChange} />
      },
      {
        label: 'Global Client',
        name: 'globalClientOptions',
        component: (
          <Space>
            <Form.Item name="globalClientY" valuePropName="checked" noStyle>
              <Checkbox onChange={handleGlobalClientYChange}>Y</Checkbox>
            </Form.Item>
            <Form.Item name="globalClientN" valuePropName="checked" noStyle>
              <Checkbox onChange={handleGlobalClientNChange}>N</Checkbox>
            </Form.Item>
          </Space>
        )
      }
    ]
  }), [handleChange, handleGlobalClientYChange, handleGlobalClientNChange, rmUsers]);

  return (
    // 不使用search-form类，避免全局样式影响
    <div>
      <Form form={form} layout="horizontal" initialValues={{ globalClientY: false, globalClientN: false }}>
        <Row gutter={24}>
          {formConfig.firstRow.map((field, index) => (
            <Col xs={24} md={8} key={`first-row-${index}`}>
              <FormField
                label={field.label}
                name={field.name}
                valuePropName={field.valuePropName}
              >
                {field.component}
              </FormField>
            </Col>
          ))}
        </Row>
        <Row gutter={24}>
          {formConfig.secondRow.map((field, index) => (
            <Col xs={24} md={8} key={`second-row-${index}`}>
              <FormField
                label={field.label}
                name={field.name}
                valuePropName={field.valuePropName}
              >
                {field.component}
              </FormField>
            </Col>
          ))}
        </Row>
      </Form>
    </div>
  );
};

export default React.memo(SearchForm); 