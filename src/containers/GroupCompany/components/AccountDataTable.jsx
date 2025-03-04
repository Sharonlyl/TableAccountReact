import React, { useState } from 'react';
import { Table, Form, Input, Button, Space, Empty, Row, Col, Typography, Card } from 'antd';
import { 
  SearchOutlined, FilterOutlined, CloseOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import '../../../styles/account/AccountTable.css';

const { Text } = Typography;

// 定义样式对象
const styles = {
  tableContainer: {
    width: '100%'
  },
  table: {
    width: '100%'
  },
  filterDropdown: {
    padding: '12px',
    borderRadius: '4px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    position: 'absolute',
    bottom: '100%',
    transform: 'translateY(-40px) translateX(-50%)'
  },
  filterSpace: {
    marginTop: '12px',
    display: 'flex',
    justifyContent: 'flex-start'
  },
  filterButton: {
    marginRight: '8px'
  },
  expandedRowContent: {
    padding: '12px',
    flex: 1
  },
  tableCellStyle: {
    whiteSpace: 'normal',
    wordBreak: 'break-word'
  }
};

// 表头样式
const headerStyle = {
  backgroundColor: '#e6f7ff',
  color: 'black',
  fontWeight: 600,
  whiteSpace: 'normal',
  wordBreak: 'break-word'
};

const AccountDataTable = ({ 
  data, 
  selectedRowKeys, 
  onSelectChange, 
  handleSearch, 
  handleReset, 
  handleFilter, 
  handleCloseFilter,
  currentUser,
  pagination,
  onChange
}) => {
  const [searchForm] = Form.useForm();
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  // 增强版的重置函数，确保清空输入框并展示结果
  const handleResetFilter = (clearFilters, fieldName) => {
    // 清空表单中对应字段的值
    searchForm.setFieldsValue({
      [`${fieldName}Search`]: undefined
    });
    // 调用原有的handleReset函数
    handleReset(clearFilters);
    // 确认筛选器已重置
    clearFilters && clearFilters();
  };

  // 自定义空状态
  const customEmpty = () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description="No data"
      className="custom-empty"
    />
  );

  // 展开行的渲染函数 - 使用行列布局而不是表格
  const expandedRowRender = (record) => {
    const labelStyle = { 
      fontWeight: '600',
      marginRight: '8px',
      display: 'inline-block',
      textAlign: 'left'
    };
    
    const valueStyle = { 
      display: 'inline-block'
    };
    
    const itemStyle = {
      marginBottom: '8px'
    };

    return (
      <div style={{ display: 'flex' }}>
        <div style={{ width: '40px' }}></div> {/* 第一列的空白 */}
        <div style={{ width: '40px' }}></div> {/* 第二列的空白 */}
        <div style={styles.expandedRowContent}>
          <Row gutter={[24, 8]}>
            <Col span={8} style={itemStyle}>
              <div>
                <Text style={labelStyle}>GFAS Account No:</Text>
                <Text style={valueStyle}>{record.gfasAccountNo}</Text>
              </div>
            </Col>
            <Col span={8} style={itemStyle}>
              <div>
                <Text style={labelStyle}>Member Choice:</Text>
                <Text style={valueStyle}>{record.memberChoice}</Text>
              </div>
            </Col>
            <Col span={8} style={itemStyle}>
              <div>
                <Text style={labelStyle}>Pension Category:</Text>
                <Text style={valueStyle}>{record.pensionCategory}</Text>
              </div>
            </Col>
          </Row>
          <Row gutter={[24, 8]}>
            <Col span={8} style={itemStyle}>
              <div>
                <Text style={labelStyle}>Alt Id:</Text>
                <Text style={valueStyle}>{record.altId}</Text>
              </div>
            </Col>
            <Col span={8} style={itemStyle}>
              <div>
                <Text style={labelStyle}>Agent:</Text>
                <Text style={valueStyle}>{record.agent || '-'}</Text>
              </div>
            </Col>
            <Col span={8} style={itemStyle}>
              <div>
                <Text style={labelStyle}>Fund Class:</Text>
                <Text style={valueStyle}>{record.fundClass}</Text>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  // 处理展开/收起行
  const onExpandedRowsChange = (expandedRows) => {
    // 只保留最后一个展开的行，实现单行展开效果
    if (expandedRows.length > 0) {
      const lastExpandedRow = expandedRows[expandedRows.length - 1];
      setExpandedRowKeys([lastExpandedRow]);
    } else {
      setExpandedRowKeys([]);
    }
  };

  // 主表格列定义
  const columns = [
    {
      title: 'Head Group',
      dataIndex: 'headGroup',
      key: 'headGroup',
      ellipsis: false,
      width: 120,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={styles.filterDropdown}>
          <Form form={searchForm} layout="vertical">
            <Form.Item name="headGroupSearch">
              <Input 
                placeholder="Search Head Group" 
                value={selectedKeys[0]}
                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              />
            </Form.Item>
            <Space style={styles.filterSpace}>
              <Button 
                type="primary" 
                onClick={() => handleFilter(selectedKeys, confirm, 'headGroup')}
                icon={<FilterOutlined />}
                size="small"
                style={styles.filterButton}
              >
                Filter
              </Button>
              <Button 
                onClick={() => {
                  clearFilters();
                  handleResetFilter(clearFilters, 'headGroup');
                }}
                size="small"
                style={styles.filterButton}
              >
                Reset
              </Button>
              <Button 
                onClick={() => handleCloseFilter(confirm)}
                icon={<CloseOutlined />}
                size="small"
              >
                Close
              </Button>
            </Space>
          </Form>
        </div>
      ),
      filterIcon: filtered => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => 
        record.headGroup.toString().toLowerCase().includes(value.toLowerCase()),
      filterDropdownProps: {
        placement: 'topLeft',
      },
    },
    {
      title: 'WI Group',
      dataIndex: 'wiGroup',
      key: 'wiGroup',
      ellipsis: false,
      width: 120,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={styles.filterDropdown}>
          <Form form={searchForm} layout="vertical">
            <Form.Item name="wiGroupSearch">
              <Input 
                placeholder="Search WI Group" 
                value={selectedKeys[0]}
                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              />
            </Form.Item>
            <Space style={styles.filterSpace}>
              <Button 
                type="primary" 
                onClick={() => handleFilter(selectedKeys, confirm, 'wiGroup')}
                icon={<FilterOutlined />}
                size="small"
                style={styles.filterButton}
              >
                Filter
              </Button>
              <Button 
                onClick={() => {
                  clearFilters();
                  handleResetFilter(clearFilters, 'wiGroup');
                }}
                size="small"
                style={styles.filterButton}
              >
                Reset
              </Button>
              <Button 
                onClick={() => handleCloseFilter(confirm)}
                icon={<CloseOutlined />}
                size="small"
              >
                Close
              </Button>
            </Space>
          </Form>
        </div>
      ),
      filterIcon: filtered => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => 
        record.wiGroup.toString().toLowerCase().includes(value.toLowerCase()),
      filterDropdownProps: {
        placement: 'topLeft',
      },
    },
    {
      title: 'WI Customized Group',
      dataIndex: 'wiCustomizedGroup',
      key: 'wiCustomizedGroup',
      ellipsis: false,
      width: 280,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={styles.filterDropdown}>
          <Form form={searchForm} layout="vertical">
            <Form.Item name="wiCustomizedGroupSearch">
              <Input 
                placeholder="Search WI Customized Group" 
                value={selectedKeys[0]}
                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              />
            </Form.Item>
            <Space style={styles.filterSpace}>
              <Button 
                type="primary" 
                onClick={() => handleFilter(selectedKeys, confirm, 'wiCustomizedGroup')}
                icon={<FilterOutlined />}
                size="small"
                style={styles.filterButton}
              >
                Filter
              </Button>
              <Button 
                onClick={() => {
                  clearFilters();
                  handleResetFilter(clearFilters, 'wiCustomizedGroup');
                }}
                size="small"
                style={styles.filterButton}
              >
                Reset
              </Button>
              <Button 
                onClick={() => handleCloseFilter(confirm)}
                icon={<CloseOutlined />}
                size="small"
              >
                Close
              </Button>
            </Space>
          </Form>
        </div>
      ),
      filterIcon: filtered => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => 
        record.wiCustomizedGroup.toString().toLowerCase().includes(value.toLowerCase()),
      filterDropdownProps: {
        placement: 'topLeft',
      },
    },
    {
      title: 'GFAS Account Name',
      dataIndex: 'gfasAccountName',
      key: 'gfasAccountName',
      ellipsis: false,
      width: 280,
    },
    {
      title: 'RM',
      dataIndex: 'rm',
      key: 'rm',
      ellipsis: false,
      width: 100,
    },
    {
      title: 'Global Client',
      dataIndex: 'globalClient',
      key: 'globalClient',
      ellipsis: false,
      width: 100,
    },
    {
      title: 'Portfolio Nature',
      dataIndex: 'portfolioNature',
      key: 'portfolioNature',
      ellipsis: false,
      width: 120,
    },
    {
      title: 'Action',
      key: 'action',
      width: 160,
      render: (_, record) => {
        // 当RM为空或是当前用户时，按钮可用
        const isEditable = !record.rm || record.rm === currentUser;
        
        return (
          <Space size={4}>
            <Button 
              type="primary" 
              size="small"
              icon={<EditOutlined />}
              disabled={!isEditable}
              onClick={() => console.log('Edit:', record.key)}
            >
              Edit
            </Button>
            <Button 
              danger
              type="primary"
              size="small"
              icon={<DeleteOutlined />}
              disabled={!isEditable}
              onClick={() => console.log('Delete:', record.key)}
            >
              Delete
            </Button>
          </Space>
        );
      },
    },
  ];

  // 自定义选择逻辑，处理子表格的选择
  const handleRowSelection = (record, selected) => {
    let newSelectedRowKeys = [...selectedRowKeys];
    
    if (selected) {
      // 如果选中，添加到已选择的行中
      if (!newSelectedRowKeys.includes(record.key)) {
        newSelectedRowKeys.push(record.key);
      }
    } else {
      // 如果取消选中，从已选择的行中移除
      newSelectedRowKeys = newSelectedRowKeys.filter(key => key !== record.key);
    }
    
    onSelectChange(newSelectedRowKeys);
  };

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    onSelect: handleRowSelection,
  };

  return (
    <div style={styles.tableContainer}>
      <Table 
        className="account-data-table"
        rowSelection={rowSelection}
        columns={columns} 
        dataSource={data}
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpandedRowsChange,
        }}
        pagination={pagination || { 
          position: ['bottomRight'],
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `Prev ${range[0]} to ${range[1]} — ${total} Next`,
          pageSize: 20
        }}
        onChange={onChange}
        size="small"
        bordered
        locale={{ emptyText: customEmpty() }}
        style={styles.table}
        scroll={undefined}
        components={{
          header: {
            cell: props => <th {...props} style={{...props.style, ...headerStyle}} />
          },
          body: {
            cell: props => <td {...props} style={{...props.style, ...styles.tableCellStyle}} />
          }
        }}
      />
    </div>
  );
};

export default AccountDataTable; 