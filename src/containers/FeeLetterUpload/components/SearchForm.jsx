import React from 'react';
import { Form, Input, DatePicker, Select, Row, Col } from 'antd';

// 自定义表单项组件
const FormField = ({ label, name, children }) => {
  const inputId = `form-field-${name}`;
  
  return (
    <div className="form-item-container">
      <label htmlFor={inputId} className="form-item-label">
        {label}:
      </label>
      <div className="form-item-input">
        <Form.Item name={name} noStyle>
          {React.isValidElement(children) && !children.props.id ? 
            React.cloneElement(children, { id: inputId }) : 
            children}
        </Form.Item>
      </div>
    </div>
  );
};

const SearchForm = ({ form, onFormChange, uploadUsers = [] }) => {
  // 统一的onChange处理函数
  const handleChange = () => onFormChange && onFormChange();
  
  return (
    <div className="fee-letter-search-form">
      <Form form={form} layout="horizontal">
        <Row>
          <Col xs={24} md={8}>
            <FormField label="Note" name="note">
              <Input onChange={handleChange} />
            </FormField>
          </Col>
          <Col xs={24} md={8}>
            <FormField label="Upload Date" name="uploadDate">
              <DatePicker 
                onChange={handleChange}
                format="YYYY/MM/DD"
                placeholder=""
              />
            </FormField>
          </Col>
          <Col xs={24} md={8}>
            <FormField label="Upload By" name="uploadBy">
              <Select
                onChange={handleChange}
                allowClear
                showSearch
                optionFilterProp="children"
                placeholder=""
              >
                <Select.Option key="cso" value="Client Service Officer">
                  Client Service Officer
                </Select.Option>
                {uploadUsers.map(user => (
                  <Select.Option key={user.userId} value={user.userName}>
                    {user.userName}
                  </Select.Option>
                ))}
              </Select>
            </FormField>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default React.memo(SearchForm); 