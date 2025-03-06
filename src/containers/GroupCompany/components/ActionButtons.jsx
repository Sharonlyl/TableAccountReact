import React from "react";
import { Button, Space } from "antd";
import {
  SearchOutlined,
  ClearOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const ActionButtons = ({
  onSearch,
  onClear,
  onAdd,
  onEdit,
  onDelete,
  selectedRowKeys = [],
  userRoleInfo = {},
  selectedRows = [],
}) => {
  // 获取当前用户角色和用户名
  const { groupCompanyRole, userName } = userRoleInfo || {};
  
  // 检查是否为只读角色
  const isReadOnly = groupCompanyRole === 'GROUP_COMPANY_READ_ROLE';
  
  // 检查是否为写入角色
  const isWriteRole = groupCompanyRole === 'GROUP_COMPANY_WRITE_ROLE';
  
  // 检查是否为管理员角色
  const isAdminRole = groupCompanyRole === 'GROUP_COMPANY_ADMIN_ROLE';

  // 对于写入角色，检查选中的行是否可以编辑或删除
  const canEditSelected = () => {
    if (isAdminRole) return true;
    if (isReadOnly) return false;
    
    if (isWriteRole && selectedRows.length > 0) {
      // 检查所有选中的行是否都可以编辑
      return selectedRows.every(row => {
        // 如果rm字段为空或者等于当前用户名，则可以编辑
        return !row.rm || row.rm === userName;
      });
    }
    
    return false;
  };
  
  // 对于写入角色，检查选中的行是否可以删除
  const canDeleteSelected = () => {
    if (isAdminRole) return true;
    if (isReadOnly) return false;
    
    if (isWriteRole && selectedRows.length > 0) {
      // 检查所有选中的行是否都可以删除
      return selectedRows.every(row => {
        // 如果rm字段为空或者等于当前用户名，则可以删除
        return !row.rm || row.rm === userName;
      });
    }
    
    return false;
  };

  // 判断Edit Selected按钮是否应该禁用
  const isEditSelectedDisabled = () => {
    // 如果没有选中行，所有角色都禁用
    if (selectedRowKeys.length === 0) return true;
    
    // 如果是管理员角色，有选中行就可用
    if (isAdminRole) return false;
    
    // 如果是只读角色，始终禁用
    if (isReadOnly) return true;
    
    // 如果是写入角色，根据选中行的情况决定
    if (isWriteRole) return !canEditSelected();
    
    // 默认禁用
    return true;
  };
  
  // 判断Delete Selected按钮是否应该禁用
  const isDeleteSelectedDisabled = () => {
    // 如果没有选中行，所有角色都禁用
    if (selectedRowKeys.length === 0) return true;
    
    // 如果是管理员角色，有选中行就可用
    if (isAdminRole) return false;
    
    // 如果是只读角色，始终禁用
    if (isReadOnly) return true;
    
    // 如果是写入角色，根据选中行的情况决定
    if (isWriteRole) return !canDeleteSelected();
    
    // 默认禁用
    return true;
  };

  return (
    <div className="action-buttons-container">
      <Space>
        <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
          Search
        </Button>

        <Button icon={<ClearOutlined />} onClick={onClear}>
          Clear Search Criteria
        </Button>
        
        {/* Add按钮：只有写入角色和管理员角色可用 */}
        <Button 
          icon={<PlusOutlined />} 
          onClick={onAdd}
          disabled={isReadOnly}
        >
          Add
        </Button>
        
        {/* Edit Selected按钮：根据角色和选中行的情况决定是否可用 */}
        <Button
          icon={<EditOutlined />}
          onClick={onEdit}
          disabled={isEditSelectedDisabled()}
        >
          Edit Selected
        </Button>
        
        {/* Delete Selected按钮：根据角色和选中行的情况决定是否可用 */}
        <Button
          icon={<DeleteOutlined />}
          onClick={onDelete}
          disabled={isDeleteSelectedDisabled()}
        >
          Delete Selected
        </Button>
      </Space>
    </div>
  );
};

export default ActionButtons;
