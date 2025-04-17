import React, { useState, useEffect } from 'react';
import { Table, Form, message, Tag, Badge, Empty, Spin, Typography, Pagination } from 'antd';
import { searchAuditLog } from '../../../api/groupCompany';
import SearchForm from './SearchForm';
import dayjs from 'dayjs';

// 角色常量
const ROLES = {
  READ: 'GROUP_COMPANY_READ_ROLE',
  WRITE: 'GROUP_COMPANY_WRITE_ROLE',
  ADMIN: 'GROUP_COMPANY_ADMIN_ROLE'
};

const { Text } = Typography;

const AuditLogTable = ({ userRoleInfo }) => {
  // 状态管理
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: false,
  });

  // 检查权限
  const hasPermission = () => {
    const { groupCompanyRole } = userRoleInfo;
    return groupCompanyRole === ROLES.ADMIN || groupCompanyRole === ROLES.WRITE;
  };

  // 在组件挂载时检查权限并加载数据
  useEffect(() => {
    if (!hasPermission()) {
      messageApi.error('You do not have permission to access this page');
      return;
    }

    // 初始化查询
    handleSearch();
  }, []);

  // 格式化日期
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
  };

  // 根据action格式化变更内容
  const formatChanges = (record) => {
    const { action } = record;
    
    if (action === 'Add' || action === 'Bulk Add') {
      // 添加记录，展示所有新信息
      return formatAddChanges(record);
    } else if (action === 'Delete' || action === 'Bulk Delete') {
      // 删除记录，展示所有删除信息
      return formatDeleteChanges(record);
    } else if (action === 'Update' || action === 'Bulk Update') {
      // 更新记录，展示更新的字段
      return formatUpdateChanges(record);
    }
    
    return 'No changes recorded';
  };

  // 处理添加记录的变更
  const formatAddChanges = (record) => {
    const changes = [];
    
    // 检查新的值并添加到changes数组
    if (record.newFundClass !== undefined) {
      changes.push(`Fund Class: ${record.newFundClass || '-'}`);
    }
    if (record.newHeadGroup !== undefined) {
      changes.push(`Head Group: ${record.newHeadGroup || '-'}`);
    }
    if (record.newWiGroup !== undefined) {
      changes.push(`WI Group: ${record.newWiGroup || '-'}`);
    }
    if (record.newWiCustomizedGroup !== undefined) {
      changes.push(`WI Customized Group: ${record.newWiCustomizedGroup || '-'}`);
    }
    if (record.newPensionCategory !== undefined) {
      changes.push(`Pension Category: ${record.newPensionCategory || '-'}`);
    }
    if (record.newPortfolioNature !== undefined) {
      changes.push(`Portfolio Nature: ${record.newPortfolioNature || '-'}`);
    }
    if (record.newRmName !== undefined) {
      changes.push(`RM: ${record.newRmName || '-'}`);
    }
    if (record.newIsGlobalClient !== undefined) {
      changes.push(`Is Global Client: ${record.newIsGlobalClient || '-'}`);
    }
    if (record.newAgent !== undefined) {
      changes.push(`Agent: ${record.newAgent || '-'}`);
    }
    // 处理特殊字段 memberChoice
    if (record.memberChoice !== undefined) {
      changes.push(`Member Choice: ${record.memberChoice || '-'}`);
    }
    
    return changes.length > 0 
      ? (
        <div className="audit-log-changes-content">
          {changes.map((change, index) => (
            <div key={index} className="audit-log-change-item">
              <Tag color="green" className="audit-log-changes-tag" style={{ color: 'rgba(0, 0, 0, 0.85)', fontSize: '14px' }}>
                {change}
              </Tag>
            </div>
          ))}
        </div>
      ) 
      : 'No changes recorded';
  };

  // 处理删除记录的变更
  const formatDeleteChanges = (record) => {
    const changes = [];
    
    // 检查旧的值并添加到changes数组
    if (record.oldFundClass !== undefined) {
      changes.push(`Fund Class: ${record.oldFundClass || '-'}`);
    }
    if (record.oldHeadGroup !== undefined) {
      changes.push(`Head Group: ${record.oldHeadGroup || '-'}`);
    }
    if (record.oldWiGroup !== undefined) {
      changes.push(`WI Group: ${record.oldWiGroup || '-'}`);
    }
    if (record.oldWiCustomizedGroup !== undefined) {
      changes.push(`WI Customized Group: ${record.oldWiCustomizedGroup || '-'}`);
    }
    if (record.oldPensionCategory !== undefined) {
      changes.push(`Pension Category: ${record.oldPensionCategory || '-'}`);
    }
    if (record.oldPortfolioNature !== undefined) {
      changes.push(`Portfolio Nature: ${record.oldPortfolioNature || '-'}`);
    }
    if (record.oldRmName !== undefined) {
      changes.push(`RM: ${record.oldRmName || '-'}`);
    }
    if (record.oldIsGlobalClient !== undefined) {
      changes.push(`Is Global Client: ${record.oldIsGlobalClient || '-'}`);
    }
    if (record.oldAgent !== undefined) {
      changes.push(`Agent: ${record.oldAgent || '-'}`);
    }
    // 处理特殊字段 oldMemberChoice
    if (record.oldMemberChoice !== undefined) {
      changes.push(`Member Choice: ${record.oldMemberChoice || '-'}`);
    }
    
    return changes.length > 0 
      ? (
        <div className="audit-log-changes-content">
          {changes.map((change, index) => (
            <div key={index} className="audit-log-change-item">
              <Tag color="red" className="audit-log-changes-tag" style={{ color: 'rgba(0, 0, 0, 0.85)', fontSize: '14px' }}>
                {change}
              </Tag>
            </div>
          ))}
        </div>
      ) 
      : 'No changes recorded';
  };

  // 处理更新记录的变更
  const formatUpdateChanges = (record) => {
    const changes = [];
    
    // 比较旧值和新值，记录变更的字段，只要新值存在就显示变更
    if (record.newFundClass !== undefined) {
      changes.push(`Fund Class: ${record.oldFundClass || '-'} => ${record.newFundClass || '-'}`);
    }
    if (record.newHeadGroup !== undefined) {
      changes.push(`Head Group: ${record.oldHeadGroup || '-'} => ${record.newHeadGroup || '-'}`);
    }
    if (record.newWiGroup !== undefined) {
      changes.push(`WI Group: ${record.oldWiGroup || '-'} => ${record.newWiGroup || '-'}`);
    }
    if (record.newWiCustomizedGroup !== undefined) {
      changes.push(`WI Customized Group: ${record.oldWiCustomizedGroup || '-'} => ${record.newWiCustomizedGroup || '-'}`);
    }
    if (record.newPensionCategory !== undefined) {
      changes.push(`Pension Category: ${record.oldPensionCategory || '-'} => ${record.newPensionCategory || '-'}`);
    }
    if (record.newPortfolioNature !== undefined) {
      changes.push(`Portfolio Nature: ${record.oldPortfolioNature || '-'} => ${record.newPortfolioNature || '-'}`);
    }
    if (record.newRmName !== undefined) {
      changes.push(`RM: ${record.oldRmName || '-'} => ${record.newRmName || '-'}`);
    }
    if (record.newIsGlobalClient !== undefined) {
      changes.push(`Is Global Client: ${record.oldIsGlobalClient || '-'} => ${record.newIsGlobalClient || '-'}`);
    }
    if (record.newAgent !== undefined) {
      changes.push(`Agent: ${record.oldAgent || '-'} => ${record.newAgent || '-'}`);
    }
    
    // 处理特殊字段 memberChoice
    if (record.memberChoice !== undefined) {
      changes.push(`Member Choice: ${record.oldMemberChoice || '-'} => ${record.memberChoice || '-'}`);
    }
    
    return changes.length > 0 
      ? (
        <div className="audit-log-changes-content">
          {changes.map((change, index) => (
            <div key={index} className="audit-log-change-item">
              <Tag color="blue" className="audit-log-changes-tag" style={{ color: 'rgba(0, 0, 0, 0.85)', fontSize: '14px' }}>
                {change}
              </Tag>
            </div>
          ))}
        </div>
      ) 
      : 'No changes recorded';
  };

  // 获取Action对应的文本颜色
  const getActionText = (action) => {
    if (action === 'Add' || action === 'Bulk Add') {
      return <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>{action}</Text>;
    } else if (action === 'Delete' || action === 'Bulk Delete') {
      return <Text style={{ color: '#f5222d', fontWeight: 'bold' }}>{action}</Text>;
    } else if (action === 'Update' || action === 'Bulk Update') {
      return <Text style={{ color: '#1890ff', fontWeight: 'bold' }}>{action}</Text>;
    }
    return action;
  };

  // 表格列定义
  const columns = [
    {
      title: 'GFAS Account No',
      dataIndex: 'gfasAccountNo',
      key: 'gfasAccountNo',
      width: '15%',
      ellipsis: true,
    },
    {
      title: 'Alternative No',
      dataIndex: 'alternativeId',
      key: 'alternativeId',
      width: '15%',
      ellipsis: true,
      render: text => text || '-',
    },
    {
      title: 'Changed By',
      dataIndex: 'createdUserName',
      key: 'createdUserName',
      width: '12%',
      ellipsis: true,
    },
    {
      title: 'Change Date',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: '18%',
      render: text => formatDate(text),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: '10%',
      render: text => getActionText(text),
    },
    {
      title: 'Changes',
      dataIndex: 'changes',
      key: 'changes',
      width: '30%',
      render: (_, record) => formatChanges(record),
    },
  ];

  // 自定义空状态
  const customEmpty = () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description="No Data"
      className="audit-log-empty"
    />
  );

  // 处理搜索
  const handleSearch = async (values = {}) => {
    try {
      setLoading(true);
      
      // 如果没有搜索条件，则使用表单中的值
      const formValues = values || form.getFieldsValue();
      
      // 构建请求参数
      const params = {
        pageNum: 1,
        pageSize: pagination.pageSize,
        gfasAccountNo: formValues.gfasAccountNo || '',
        gfasAccountName: formValues.gfasAccountName || '',
      };
      
      // 调用API
      const response = await searchAuditLog(params);
      
      if (response && response.success) {
        const pageInfoData = response.pageInfoData || {};
        const list = pageInfoData.list || [];
        
        setTableData(list);
        setPagination({
          ...pagination,
          current: pageInfoData.pageNum || 1,
          total: pageInfoData.total || 0,
          pages: pageInfoData.pages || 1,
        });
      } else {
        messageApi.error('Query failed');
        setTableData([]);
      }
    } catch (error) {
      console.error('Query error:', error);
      messageApi.error('System error, please try again later');
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // 处理分页变化
  const handlePageChange = async (page) => {
    try {
      setLoading(true);
      
      // 获取当前表单值
      const formValues = form.getFieldsValue();
      
      // 构建请求参数
      const params = {
        pageNum: page,
        pageSize: pagination.pageSize,
        gfasAccountNo: formValues.gfasAccountNo || '',
        gfasAccountName: formValues.gfasAccountName || '',
      };
      
      // 调用API
      const response = await searchAuditLog(params);
      
      if (response && response.success) {
        const pageInfoData = response.pageInfoData || {};
        const list = pageInfoData.list || [];
        
        setTableData(list);
        setPagination({
          ...pagination,
          current: pageInfoData.pageNum || 1,
        });
      } else {
        messageApi.error('Query failed');
      }
    } catch (error) {
      console.error('Pagination error:', error);
      messageApi.error('System error, please try again later');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      
      {!hasPermission() ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Text type="danger">You do not have permission to access this page</Text>
        </div>
      ) : (
        <>
          <SearchForm 
            form={form} 
            onSearch={handleSearch} 
            loading={loading} 
          />
          
          <div className="audit-log-table">
            {loading && !tableData.length ? (
              <div className="audit-log-loading">
                <Spin tip="Loading..." size="large" />
              </div>
            ) : (
              <Table 
                columns={columns}
                dataSource={tableData}
                rowKey={record => record.logId}
                pagination={false}
                loading={loading && tableData.length > 0}
                locale={{ emptyText: customEmpty() }}
              />
            )}
            
            {tableData.length > 0 && (
              <div className="audit-log-pagination">
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default AuditLogTable; 