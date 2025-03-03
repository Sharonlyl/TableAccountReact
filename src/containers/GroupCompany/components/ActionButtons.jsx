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
}) => {
  return (
    <div className="action-buttons-container">
      <Space>
        <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
          Search
        </Button>

        <Button icon={<ClearOutlined />} onClick={onClear}>
          Clear Search Criteria
        </Button>
        <Button icon={<PlusOutlined />} onClick={onAdd}>
          Add
        </Button>
        <Button
          icon={<EditOutlined />}
          onClick={onEdit}
          disabled={selectedRowKeys.length === 0}
        >
          Edit Selected
        </Button>
        <Button
          icon={<DeleteOutlined />}
          onClick={onDelete}
          disabled={selectedRowKeys.length === 0}
        >
          Delete Selected
        </Button>
      </Space>
    </div>
  );
};

export default ActionButtons;
