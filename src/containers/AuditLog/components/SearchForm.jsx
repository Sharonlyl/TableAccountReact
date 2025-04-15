import React from 'react';
import { Form, Input, Button, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

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

const SearchForm = ({ form, onSearch, loading }) => {
  // 统一的onChange处理函数
  const handleChange = () => {
    onSearch();
  };
  
  return (
    <div className="audit-log-search-form">
      <Form form={form} layout="horizontal">
        <Row>
          <Col xs={24} sm={12} md={6} style={{ paddingRight: '5px' }}>
            <FormField label="GFAS Account No" name="gfasAccountNo">
              <Input
                allowClear 
                onChange={handleChange}
              />
            </FormField>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <FormField label="GFAS Account Name" name="gfasAccountName">
              <Input 
                allowClear
                onChange={handleChange}
              />
            </FormField>
          </Col>
        </Row>
        <Row>
          <Col xs={24} style={{ textAlign: 'right', marginTop: '16px' }}>
            <Button 
              type="primary" 
              onClick={() => onSearch(form.getFieldsValue())}
              icon={<SearchOutlined />} 
              loading={loading}
            >
              Search
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default React.memo(SearchForm); 