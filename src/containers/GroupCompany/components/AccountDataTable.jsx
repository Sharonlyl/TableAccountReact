import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Button, Space, Empty, Row, Col, Typography } from 'antd';
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
  },
  hiddenForm: {
    display: 'none'  // 隐藏表单样式
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
  handleReset, 
  handleFilter, 
  handleCloseFilter,
  pagination,
  onChange,
  userRoleInfo = {},
  onEditRow, // 添加编辑行的回调函数
  onDeleteRow // 添加删除行的回调函数
}) => {
  const [searchForm] = Form.useForm();
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  // 存储当前活动的筛选条件
  const [activeFilters, setActiveFilters] = useState({});
  // 存储表格的筛选状态
  const [filteredInfo, setFilteredInfo] = useState({});
  // 添加一个标志，用于标识是否是通过点击Filter按钮触发的筛选
  const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false);

  // 在组件挂载时，将清空筛选条件的函数暴露给全局
  useEffect(() => {
    // 清空所有筛选条件的函数
    window.clearTableFilters = () => {
      setActiveFilters({});
      setFilteredInfo({});
      // 重置表单中的筛选字段
      searchForm.setFieldsValue({
        headGroupSearch: undefined,
        wiGroupSearch: undefined,
        wiCustomizedGroupSearch: undefined
      });
    };

    // 组件卸载时清理
    return () => {
      window.clearTableFilters = undefined;
    };
  }, [searchForm]);

  // 增强版的重置函数，确保清空输入框并展示结果
  const handleResetFilter = (clearFilters, fieldName) => {
    // 设置标志，表示是通过点击Reset按钮触发的筛选重置
    setIsFilterButtonClicked(true);
    
    // 清空表单中对应字段的值
    searchForm.setFieldsValue({
      [`${fieldName}Search`]: undefined
    });
    
    // 更新筛选状态
    setFilteredInfo(prev => {
      const newFilteredInfo = { ...prev };
      delete newFilteredInfo[fieldName];
      return newFilteredInfo;
    });
    
    // 清除活动筛选条件
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[fieldName];
      return newFilters;
    });
    
    // 只有在数据不为空时才调用父组件的handleReset函数
    if (data && data.length > 0) {
      // 调用原有的handleReset函数，传递字段名
      handleReset(clearFilters, fieldName);
    } else {
      // 数据为空，跳过重置请求
    }
    
    // 确认筛选器已重置
    clearFilters && clearFilters();
    
    // 在下一个事件循环中重置标志
    setTimeout(() => {
      setIsFilterButtonClicked(false);
    }, 0);
  };

  // 处理筛选应用
  const handleFilterApply = (selectedKeys, confirm, dataIndex) => {
    // 设置标志，表示是通过点击Filter按钮触发的筛选
    setIsFilterButtonClicked(true);
    
    // 更新活动筛选条件
    setActiveFilters(prev => ({
      ...prev,
      [dataIndex]: selectedKeys[0]
    }));
    
    // 更新表格筛选状态
    setFilteredInfo(prev => ({
      ...prev,
      [dataIndex]: selectedKeys
    }));
    
    // 只有在数据不为空时才调用父组件的handleFilter函数
    if (data && data.length > 0) {
      // 调用父组件的筛选处理函数
      handleFilter(selectedKeys, confirm, dataIndex);
    } else {
      // 数据为空，跳过筛选请求
    }
    
    // 在下一个事件循环中重置标志
    setTimeout(() => {
      setIsFilterButtonClicked(false);
    }, 0);
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

    // 计算HeadGroup列的宽度，确保子表格的第一列与主表的HeadGroup列对齐
    const headGroupColumnWidth = 120; // 与主表中HeadGroup列的宽度保持一致

    return (
      <div style={{ display: 'flex' }}>
        <div style={{ width: `${headGroupColumnWidth}px`, flexShrink: 0 }}></div> {/* 第一列的空白，与HeadGroup列对齐 */}
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
                <Text style={labelStyle}>Portfolio Nature:</Text>
                <Text style={valueStyle}>{record.portfolioNature}</Text>
              </div>
            </Col>
          </Row>
          <Row gutter={[24, 8]}>
            <Col span={8} style={itemStyle}>
              <div>
                <Text style={labelStyle}>Alt Id:</Text>
                <Text style={valueStyle}>{record.alternativeId}</Text>
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
          <Row gutter={[24, 8]}>
            <Col span={8} style={itemStyle}>
              <div>
                <Text style={labelStyle}>Pension Category:</Text>
                <Text style={valueStyle}>{record.pensionCategory}</Text>
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
    setExpandedRowKeys(expandedRows);
  };

  // 检查单行是否可以编辑
  const canEditRow = (record) => {
    const { groupCompanyRole, userName } = userRoleInfo || {};
    
    // 管理员角色可以编辑所有行
    if (groupCompanyRole === 'GROUP_COMPANY_ADMIN_ROLE') {
      return true;
    }
    
    // 只读角色不能编辑任何行
    if (groupCompanyRole === 'GROUP_COMPANY_READ_ROLE') {
      return false;
    }
    
    // 写入角色可以编辑：rm字段为空、等于当前用户名或等于CSO的行
    if (groupCompanyRole === 'GROUP_COMPANY_WRITE_ROLE') {
      return !record.rm || record.rm === userName || record.rm === 'Client Service Officer';
    }
    
    return false;
  };
  
  // 检查单行是否可以删除
  const canDeleteRow = (record) => {
    const { groupCompanyRole, userName } = userRoleInfo || {};
    
    // 管理员角色可以删除所有行
    if (groupCompanyRole === 'GROUP_COMPANY_ADMIN_ROLE') {
      return true;
    }
    
    // 只读角色不能删除任何行
    if (groupCompanyRole === 'GROUP_COMPANY_READ_ROLE') {
      return false;
    }
    
    // 写入角色可以删除：rm字段为空、等于当前用户名或等于CSO的行
    if (groupCompanyRole === 'GROUP_COMPANY_WRITE_ROLE') {
      return !record.rm || record.rm === userName || record.rm === 'Client Service Officer';
    }
    
    return false;
  };

  // 主表格列定义
  const columns = [
    {
      title: 'Head Group',
      dataIndex: 'headGroup',
      key: 'headGroup',
      ellipsis: false,
      width: 120,
      filteredValue: filteredInfo.headGroup || null,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={styles.filterDropdown}>
          <Form form={searchForm} layout="vertical">
            <Form.Item name="headGroupSearch">
              <Input 
                placeholder="Search Head Group" 
                value={selectedKeys[0]}
                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={() => handleFilterApply(selectedKeys, confirm, 'headGroup')}
              />
            </Form.Item>
            <Space style={styles.filterSpace}>
              <Button 
                type="primary" 
                onClick={() => handleFilterApply(selectedKeys, confirm, 'headGroup')}
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
        <SearchOutlined style={{ color: filtered || activeFilters.headGroup ? '#1890ff' : undefined }} />
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
      filteredValue: filteredInfo.wiGroup || null,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={styles.filterDropdown}>
          <Form form={searchForm} layout="vertical">
            <Form.Item name="wiGroupSearch">
              <Input 
                placeholder="Search WI Group" 
                value={selectedKeys[0]}
                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={() => handleFilterApply(selectedKeys, confirm, 'wiGroup')}
              />
            </Form.Item>
            <Space style={styles.filterSpace}>
              <Button 
                type="primary" 
                onClick={() => handleFilterApply(selectedKeys, confirm, 'wiGroup')}
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
        <SearchOutlined style={{ color: filtered || activeFilters.wiGroup ? '#1890ff' : undefined }} />
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
      filteredValue: filteredInfo.wiCustomizedGroup || null,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={styles.filterDropdown}>
          <Form form={searchForm} layout="vertical">
            <Form.Item name="wiCustomizedGroupSearch">
              <Input 
                placeholder="Search WI Customized Group" 
                value={selectedKeys[0]}
                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={() => handleFilterApply(selectedKeys, confirm, 'wiCustomizedGroup')}
              />
            </Form.Item>
            <Space style={styles.filterSpace}>
              <Button 
                type="primary" 
                onClick={() => handleFilterApply(selectedKeys, confirm, 'wiCustomizedGroup')}
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
        <SearchOutlined style={{ color: filtered || activeFilters.wiCustomizedGroup ? '#1890ff' : undefined }} />
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
      width: 320,
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
      width: 60,
      align: 'center'
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      align: 'center',
      className: 'action-column',
      render: (_, record) => {
        // 根据权限控制按钮是否可用
        const isEditable = canEditRow(record);
        const isDeletable = canDeleteRow(record);
        
        return (
          <Space size={16} style={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              type="primary" 
              size="small"
              icon={<EditOutlined />}
              disabled={!isEditable}
              onClick={() => {
                onEditRow && onEditRow(record);
              }}
            >
              Edit
            </Button>
            <Button 
              danger
              type="primary"
              size="small"
              icon={<DeleteOutlined />}
              disabled={!isDeletable}
              onClick={() => onDeleteRow && onDeleteRow(record)}
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
    let newSelectedRows = data.filter(item => selectedRowKeys.includes(item.key));
    
    if (selected) {
      // 如果选中，添加到已选择的行中
      if (!newSelectedRowKeys.includes(record.key)) {
        newSelectedRowKeys.push(record.key);
        newSelectedRows.push(record);
      }
    } else {
      // 如果取消选中，从已选择的行中移除
      newSelectedRowKeys = newSelectedRowKeys.filter(key => key !== record.key);
      newSelectedRows = newSelectedRows.filter(row => row.key !== record.key);
    }
    
    onSelectChange(newSelectedRowKeys, newSelectedRows);
  };

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys, newSelectedRows) => {
      onSelectChange(newSelectedRowKeys, newSelectedRows);
    },
    onSelect: handleRowSelection,
  };

  return (
    <div style={styles.tableContainer}>
      {/* 添加隐藏的Form组件，连接searchForm实例 */}
      <Form form={searchForm} style={styles.hiddenForm}>
        <Form.Item name="headGroupSearch">
          <Input />
        </Form.Item>
        <Form.Item name="wiGroupSearch">
          <Input />
        </Form.Item>
        <Form.Item name="wiCustomizedGroupSearch">
          <Input />
        </Form.Item>
      </Form>
      
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
        onChange={(pagination, filters) => {
          setFilteredInfo(filters);
          // 只有当不是通过点击Filter按钮触发的筛选时，才调用onChange函数
          if (!isFilterButtonClicked) {
            onChange(pagination);
          }
        }}
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