import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Select, Checkbox, Radio, Button, Row, Col, Space, message } from 'antd';
import { querylmrReferenceByCategory, queryUserByDepartments, queryHeadGroup, queryWIGroup, queryWICustomizedGroup, updateGroupCompanyMapping } from '../../../api/groupCompany';
import '../styles/AddAccountModal.css';

const EditAccountModal = ({ visible, onCancel, onSave, record }) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [options, setOptions] = useState({
    FUND_CLASS: [],
    PORTFOLIO_NATURE: [],
    PENSION_CATEGORY: [],
    MEMBER_CHOICE: []
  });
  const [rmOptions, setRmOptions] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  
  // 添加状态来控制Alt Id的显示
  const [showAltId, setShowAltId] = useState(false);
  
  // 添加组搜索相关状态
  const [headGroupOptions, setHeadGroupOptions] = useState([]);
  const [wiGroupOptions, setWiGroupOptions] = useState([]);
  const [wiCustomizedGroupOptions, setWiCustomizedGroupOptions] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState({
    headGroup: null,
    wiGroup: null,
    wiCustomizedGroup: null
  });
  const [isSearching, setIsSearching] = useState({
    headGroup: false,
    wiGroup: false,
    wiCustomizedGroup: false
  });

  // 防抖定时器引用
  const searchTimerRef = useRef(null);

  // 添加确认对话框相关状态
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [originalValues, setOriginalValues] = useState({});

  // 在组件挂载和visible变化时获取下拉框选项数据
  useEffect(() => {
    if (visible) {
      fetchOptions();
      fetchRmOptions();
      
      // 如果有记录数据，则填充表单
      if (record) {
        // 判断是否显示Alt Id
        setShowAltId(record.gfasAccountNo === 'CCC 111111');
        
        // 如果GFAS Account No为空，确保GFAS Account Name也为空
        if (!record.gfasAccountNo || record.gfasAccountNo.trim() === '') {
          record.gfasAccountName = '';
        }
        
        // 保存原始值用于比较
        setOriginalValues({
          mappingId: record.mappingId || '',
          gfasAccountNo: record.gfasAccountNo || '',
          gfasAccountName: record.gfasAccountName || '',
          altId: record.altId || record.alternativeId || '',
          fundClass: record.fundClass || '',
          pensionCategory: record.pensionCategory || '',
          portfolioNature: record.portfolioNature || '',
          memberChoice: record.memberChoice || '',
          rm: record.rm || '',
          isGlobalClient: record.globalClient || '',
          agent: record.agent || '',
          headGroup: record.headGroupId || '',
          headGroupName: record.headGroupName || record.headGroup || '',
          wiGroup: record.wiGroupId || '',
          wiGroupName: record.wiGroupName || record.wiGroup || '',
          wiCustomizedGroup: record.wiCustomizedGroupId || '',
          wiCustomizedGroupName: record.wiCustomizedGroupName || record.wiCustomizedGroup || '',
          lastUpdatedBy: record.lastUpdatedBy || '',
          lastUpdatedDate: record.lastUpdatedDate || '',
          createdBy: record.createdBy || '',
          createdDate: record.createdDate || ''
        });
        
        // 设置表单初始值
        form.setFieldsValue({
          gfasAccountNo: record.gfasAccountNo || '',
          gfasAccountName: record.gfasAccountName || '',
          altId: record.altId || record.alternativeId || '',
          fundClass: record.fundClass || '',
          pensionCategory: record.pensionCategory || '',
          portfolioNature: record.portfolioNature || '',
          memberChoice: record.memberChoice || '',
          rm: record.rm || '',
          isGlobalClient: record.globalClient || '',
          agent: record.agent || '',
          headGroup: {
            key: record.headGroupId?.toString() || '',
            value: record.headGroupId?.toString() || '',
            label: record.headGroupName || record.headGroup || ''
          },
          wiGroup: {
            key: record.wiGroupId?.toString() || '',
            value: record.wiGroupId?.toString() || '',
            label: record.wiGroupName || record.wiGroup || ''
          },
          wiCustomizedGroup: record.wiCustomizedGroupId ? {
            key: record.wiCustomizedGroupId?.toString() || '',
            value: record.wiCustomizedGroupId?.toString() || '',
            label: record.wiCustomizedGroupName || record.wiCustomizedGroup || ''
          } : undefined
        });
        
        // 初始化时检查GFAS Account No和GFAS Account Name是否有值，如果有值则不显示错误
        const initialFormErrors = { ...formErrors };
        if (record.gfasAccountNo) {
          initialFormErrors.gfasAccountNo = false;
        }
        if (record.gfasAccountName) {
          initialFormErrors.gfasAccountName = false;
        }
        setFormErrors(initialFormErrors);
        
        // 设置组选项
        if ((record.headGroupId && record.headGroupName) || record.headGroup) {
          const headGroupId = record.headGroupId || '';
          const headGroupName = record.headGroupName || record.headGroup || '';
          
          const headGroupOption = {
            key: headGroupId.toString(),
            value: headGroupId.toString(),
            label: headGroupName,
            data: {
              headGroupId: headGroupId,
              groupName: headGroupName
            }
          };

          setHeadGroupOptions([headGroupOption]);
        }
        
        if ((record.wiGroupId && record.wiGroupName) || record.wiGroup) {
          const wiGroupId = record.wiGroupId || '';
          const wiGroupName = record.wiGroupName || record.wiGroup || '';
          
          const wiGroupOption = {
            key: wiGroupId.toString(),
            value: wiGroupId.toString(),
            label: wiGroupName,
            data: {
              wiGroupId: wiGroupId,
              groupName: wiGroupName
            }
          };
          
          setWiGroupOptions([wiGroupOption]);
        }
        
        if ((record.wiCustomizedGroupId && record.wiCustomizedGroupName) || record.wiCustomizedGroup) {
          const wiCustomizedGroupId = record.wiCustomizedGroupId || '';
          const wiCustomizedGroupName = record.wiCustomizedGroupName || record.wiCustomizedGroup || '';
          
          const wiCustomizedGroupOption = {
            key: wiCustomizedGroupId.toString(),
            value: wiCustomizedGroupId.toString(),
            label: wiCustomizedGroupName,
            data: {
              wiCustomizedGroupId: wiCustomizedGroupId,
              groupName: wiCustomizedGroupName
            }
          };
          
          setWiCustomizedGroupOptions([wiCustomizedGroupOption]);
        }
        
        // 设置选中的组
        setSelectedGroups({
          headGroup: {
            headGroupId: record.headGroupId || '',
            groupName: record.headGroupName || record.headGroup || ''
          },
          wiGroup: {
            wiGroupId: record.wiGroupId || '',
            groupName: record.wiGroupName || record.wiGroup || ''
          },
          wiCustomizedGroup: (record.wiCustomizedGroupId || record.wiCustomizedGroup) ? {
            wiCustomizedGroupId: record.wiCustomizedGroupId || '',
            groupName: record.wiCustomizedGroupName || record.wiCustomizedGroup || ''
          } : null
        });
      }
    }
  }, [visible, record, form]);

  // 在组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  // 获取下拉框选项数据
  const fetchOptions = async () => {
    try {
      const response = await querylmrReferenceByCategory({
        categoryList: 'FUND_CLASS,PORTFOLIO_NATURE,PENSION_CATEGORY,MEMBER_CHOICE'
      });
      
      // 检查返回的数据结构
      if (response && Array.isArray(response)) {
        // 直接使用返回的数组
        const data = response;
        
        // 按category分类整理数据
        const newOptions = {
          FUND_CLASS: [],
          PORTFOLIO_NATURE: [],
          PENSION_CATEGORY: [],
          MEMBER_CHOICE: []
        };
        
        data.forEach(item => {
          if (item && item.category && newOptions[item.category]) {
            newOptions[item.category].push({
              value: item.optionName,  // 使用optionName作为值
              label: item.optionName   // 使用optionName作为显示标签
            });
          }
        });
        
        setOptions(newOptions);
      } else if (response && response.data) {
        // 如果返回的是包装在data字段中的数据
        let data;
        if (response.data.data && Array.isArray(response.data.data)) {
          // 如果数据在response.data.data中
          data = response.data.data;
        } else if (Array.isArray(response.data)) {
          // 如果数据直接在response.data中
          data = response.data;
        } else {
          console.error('Unexpected response format:', response);
          messageApi.error('Failed to load options');
          return;
        }
        
        // 按category分类整理数据
        const newOptions = {
          FUND_CLASS: [],
          PORTFOLIO_NATURE: [],
          PENSION_CATEGORY: [],
          MEMBER_CHOICE: []
        };
        
        data.forEach(item => {
          if (item && item.category && newOptions[item.category]) {
            newOptions[item.category].push({
              value: item.optionName,  // 使用optionName作为值
              label: item.optionName   // 使用optionName作为显示标签
            });
          }
        });
        
        setOptions(newOptions);
      } else {
        console.error('Unexpected response format:', response);
        messageApi.error('Failed to load options');
      }
    } catch (error) {
      console.error('Error fetching options:', error);
      messageApi.error('Error loading options');
    }
  };

  // 获取RM选项数据
  const fetchRmOptions = async () => {
    try {
      const response = await queryUserByDepartments({
        departments: 'RM'
      });
      
      if (response && response.success && response.data) {
        const rmData = response.data.map(user => ({
          value: user.userName,
          label: user.userName
        }));
        
        // 添加"Client Service Officer"选项
        rmData.push({
          value: 'Client Service Officer',
          label: 'Client Service Officer'
        });
        
        setRmOptions(rmData);
      } else {
        console.error('Failed to fetch RM options:', response?.errMessage);
        messageApi.error('Failed to load RM options');
      }
    } catch (error) {
      console.error('Error fetching RM options:', error);
      messageApi.error('Error loading RM options');
    }
  };

  // 防抖函数
  const debounce = (func, delay) => {
    return (...args) => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      searchTimerRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // 防抖处理的搜索函数
  const debouncedSearch = {
    headGroup: debounce((value) => searchGroup(value, 'headGroup'), 300),
    wiGroup: debounce((value) => searchGroup(value, 'wiGroup'), 300),
    wiCustomizedGroup: debounce((value) => searchGroup(value, 'wiCustomizedGroup'), 300)
  };

  // 搜索组
  const searchGroup = async (value, groupType) => {
    if (!value || value.trim() === '' || value.length < 4) {
      // 如果输入少于4个字符，不执行搜索
      if (value && value.length > 0 && value.length < 4) {
        messageApi.info('Please input at least 4 characters to search');
      }
      return;
    }
    
    // 设置搜索状态
    setIsSearching(prev => ({ ...prev, [groupType]: true }));
    
    try {
      // 根据组类型执行不同的搜索
      if (groupType === 'headGroup') {
        try {
          console.log(`Calling queryHeadGroup API with value: ${value}`);
          // 调用Head Group的API
          const response = await queryHeadGroup({
            pageSize: 10,
            pageNum: 1,
            groupName: value
          });
          
          // 检查API响应
          if (response && response.success && response.pageInfoData) {
            const { list, total } = response.pageInfoData;
            
            
            if (Array.isArray(list) && list.length > 0) {
              // 转换为下拉框选项格式 - 根据真实数据结构调整
              const options = list.map((item, index) => ({
                key: item.headGroupId.toString(),
                value: item.headGroupId.toString(),
                label: item.groupName,
                data: item
              }));
              
              // 更新选项
              setHeadGroupOptions(options);
              console.log('Updated headGroupOptions:', options);
              
              // 如果结果超过10个，提示用户输入更多信息
              if (total > 10 && options.length === 10) {
                messageApi.info('Please input more characters to narrow down the search');
              }
            } else {
              // 没有找到匹配项
              console.log('No matching Head groups found');
              setHeadGroupOptions([]);
            }
          } else {
            // 处理API错误
            console.log('API response error or invalid format');
            setHeadGroupOptions([]);
            if (response && response.errMessage) {
              messageApi.error(response.errMessage);
            } else {
              messageApi.error('Failed to fetch Head group data');
            }
          }
        } catch (error) {
          console.error('Error fetching Head group:', error);
          setHeadGroupOptions([]);
          messageApi.error('Failed to fetch Head group data');
        }
      } else if (groupType === 'wiGroup') {
        try {
          console.log(`Calling queryWIGroup API with value: ${value}`);
          // 调用WI Group的API
          const response = await queryWIGroup({
            pageSize: 10,
            pageNum: 1,
            groupName: value
          });
          
          
          // 检查API响应
          if (response && response.success && response.pageInfoData) {
            const { list, total } = response.pageInfoData;
            
            if (Array.isArray(list) && list.length > 0) {
              // 转换为下拉框选项格式 - 根据真实数据结构调整
              const options = list.map((item, index) => ({
                key:  item.wiGroupId.toString(),
                value: item.wiGroupId.toString(),
                label: item.groupName,
                data: item
              }));
              
              // 更新选项
              setWiGroupOptions(options);
              
              // 如果结果超过10个，提示用户输入更多信息
              if (total > 10 && options.length === 10) {
                messageApi.info('Please input more characters to narrow down the search');
              }
            } else {
              // 没有找到匹配项
              console.log('No matching WI groups found');
              setWiGroupOptions([]);
            }
          } else {
            // 处理API错误
            console.log('API response error or invalid format');
            setWiGroupOptions([]);
            if (response && response.errMessage) {
              messageApi.error(response.errMessage);
            } else {
              messageApi.error('Failed to fetch WI group data');
            }
          }
        } catch (error) {
          console.error('Error fetching WI group:', error);
          setWiGroupOptions([]);
          messageApi.error('Failed to fetch WI group data');
        }
      } else if (groupType === 'wiCustomizedGroup') {
        try {
          console.log(`Calling queryWICustomizedGroup API with value: ${value}`);
          // 调用WI Customized Group的API
          const response = await queryWICustomizedGroup({
            pageSize: 10,
            pageNum: 1,
            groupName: value
          });
          
          
          // 检查API响应
          if (response && response.success && response.pageInfoData) {
            const { list, total } = response.pageInfoData;
            
            
            if (Array.isArray(list) && list.length > 0) {
              // 转换为下拉框选项格式 - 根据真实数据结构调整
              const options = list.map((item, index) => ({
                key: item.wiCustomizedGroupId.toString() ,
                value:  item.wiCustomizedGroupId.toString(),
                label: item.groupName,
                data: item
              }));
              
              console.log('WI Customized Group options after mapping:', options); // 添加日志以便调试
              
              // 更新选项
              setWiCustomizedGroupOptions(options);
              console.log('Updated wiCustomizedGroupOptions:', options);
              
              // 如果结果超过10个，提示用户输入更多信息
              if (total > 10 && options.length === 10) {
                messageApi.info('Please input more characters to narrow down the search');
              }
            } else {
              // 没有找到匹配项
              console.log('No matching WI Customized groups found');
              setWiCustomizedGroupOptions([]);
            }
          } else {
            setWiCustomizedGroupOptions([]);
            if (response && response.errMessage) {
              messageApi.error(response.errMessage);
            } else {
              messageApi.error('Failed to fetch WI Customized group data');
            }
          }
        } catch (error) {
          console.error('Error fetching WI Customized group:', error);
          setWiCustomizedGroupOptions([]);
          messageApi.error('Failed to fetch WI Customized group data');
        }
      }
    } catch (error) {
      console.error(`Error searching for ${groupType}:`, error);
      messageApi.error(`Failed to search for ${groupType}`);
      
      // 清空选项
      switch (groupType) {
        case 'headGroup':
          setHeadGroupOptions([]);
          break;
        case 'wiGroup':
          setWiGroupOptions([]);
          break;
        case 'wiCustomizedGroup':
          setWiCustomizedGroupOptions([]);
          break;
        default:
          break;
      }
    } finally {
      // 清除搜索状态
      setIsSearching(prev => ({ ...prev, [groupType]: false }));
    }
  };

  // 处理组选择
  const handleGroupSelect = (value, option, groupType) => {
    
    // 清除相应的表单错误
    setFormErrors(prev => ({
      ...prev,
      [groupType]: false
    }));
    
    // 根据组类型处理选择
    if (groupType === 'headGroup') {
      // 存储选中的 Head Group 数据
      setSelectedGroups(prev => ({
        ...prev,
        headGroup: option.data
      }));
    } else if (groupType === 'wiGroup') {
      // 存储选中的 WI Group 数据
      setSelectedGroups(prev => ({
        ...prev,
        wiGroup: option.data
      }));
    } else if (groupType === 'wiCustomizedGroup') {
      // 存储选中的 WI Customized Group 数据
      setSelectedGroups(prev => ({
        ...prev,
        wiCustomizedGroup: option.data
      }));
    }
  };

  // 添加监听GFAS Account No值变化的函数
  const handleAccountNoChange = (value) => {
    setShowAltId(value === 'CCC 111111');
    
    // 当GFAS Account No被清空时，也清空GFAS Account Name的值
    if (!value || value.trim() === '') {
      form.setFieldsValue({
        gfasAccountName: ''
      });
    }
  };

  // 处理Fund Class变更
  const handleFundClassChange = (value) => {
    if (value === 'FRMT') {
      // 当选择FRMT时，自动设置相关字段
      // 从options中查找对应的值
      const dcFullService = options.PORTFOLIO_NATURE.find(option => 
        option.value === 'DC(full service)'
      )?.value || '';
      
      const mpfDirect = options.PENSION_CATEGORY.find(option => 
        option.value === 'MPF-Direct'
      )?.value || '';
      
      const memberChoice = options.MEMBER_CHOICE.find(option => 
        option.value === 'Member Choice'
      )?.value || '';
      
      form.setFieldsValue({
        portfolioNature: dcFullService,
        pensionCategory: mpfDirect,
        memberChoice: memberChoice
      });
    }
  };

  // 处理保存按钮点击
  const handleSave = () => {
    // 重置错误状态
    setFormErrors({});

    form.validateFields()
      .then(values => {
        
        // 确保GFAS Account No和Alt ID为大写
        if (values.altId) {
          values.altId = values.altId.toUpperCase();
        }
        
        // 处理组值，从对象中提取ID
        if (values.headGroup && typeof values.headGroup === 'object') {
          values.headGroup = values.headGroup.value;
        }
        
        if (values.wiGroup && typeof values.wiGroup === 'object') {
          values.wiGroup = values.wiGroup.value;
        }
        
        if (values.wiCustomizedGroup && typeof values.wiCustomizedGroup === 'object') {
          values.wiCustomizedGroup = values.wiCustomizedGroup.value;
        }
        
        // 检查必填字段
        const mandatoryFields = [
          'headGroup',
          'wiGroup',
          'fundClass',
          'pensionCategory',
          'portfolioNature',
          'memberChoice',
          'agent',
          'isGlobalClient'
        ];

        const emptyFields = mandatoryFields.filter(field => {
          const value = values[field];
          if (field === 'isGlobalClient') {
            return value === undefined || value === null;
          }
          return value === undefined || value === null || value === '';
        });

        // 检查是否有空字段
        if (emptyFields.length > 0) {
          // 设置错误状态
          const errors = {};
          emptyFields.forEach(field => {
            errors[field] = true;
          });
          setFormErrors(errors);

          // 显示错误消息
          messageApi.error('Please enter all mandatory fields');
          return;
        }

        // 获取组名称
        const headGroupData = selectedGroups.headGroup || {};
        const wiGroupData = selectedGroups.wiGroup || {};
        const wiCustomizedGroupData = selectedGroups.wiCustomizedGroup || {};

        // 保存表单值并显示确认对话框
        const formValuesWithDetails = {
          ...values,
          gfasAccountNo: record.gfasAccountNo || '',
          gfasAccountName: record.gfasAccountName || '',
          headGroupName: headGroupData.groupName || originalValues.headGroupName || '',
          wiGroupName: wiGroupData.groupName || originalValues.wiGroupName || '',
          wiCustomizedGroupName: wiCustomizedGroupData.groupName || originalValues.wiCustomizedGroupName || '',
          mappingId: originalValues.mappingId || ''
        };
        
        setFormValues(formValuesWithDetails);
        setConfirmModalVisible(true);
      })
      .catch(info => {
        // 处理验证失败的情况
        const errors = {};
        
        // 从验证错误信息中提取字段错误
        if (info && info.errorFields) {
          info.errorFields.forEach(({ name, errors: fieldErrors }) => {
            if (name && name.length > 0) {
              errors[name[0]] = true;
            }
          });
        }
        
        // 设置错误状态
        setFormErrors(errors);
        
        // 显示错误消息
        messageApi.error('Please enter all mandatory fields');
      });
  };

  // 处理取消按钮点击
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // 处理确认对话框的确认按钮点击
  const handleConfirm = () => {
    // 准备API请求参数
    const params = {
      mappingId: formValues.mappingId || '',
      gfAsAccountNo: formValues.gfasAccountNo || '',
      alternateId: formValues.altId || '',
      gfAsAccountName: formValues.gfasAccountName || '',
      fundClass: formValues.fundClass || '',
      pensionCategory: formValues.pensionCategory || '',
      portfolioNature: formValues.portfolioNature || '',
      memberChoice: formValues.memberChoice || '',
      rmName: formValues.rm || '',
      isGlobalClient: formValues.isGlobalClient || '',
      agent: formValues.agent || '',
      headGroupId: formValues.headGroup || '',
      wiGroupId: formValues.wiGroup || '',
      wiCustomizedGroupId: formValues.wiCustomizedGroup || null
    };
    
    // 调用API
    updateGroupCompanyMapping(params)
      .then(response => {
        if (response.success) {
          messageApi.success('Record updated successfully');
          setConfirmModalVisible(false);
          form.resetFields();
          setFormErrors({}); // 清空错误状态
          onSave(formValues);
          // 更新记录后返回Search页面
          onCancel(); // 关闭Edit页面，返回Search页面
        } else {
          messageApi.error(response.errMessage || 'Failed to update record');
          setConfirmModalVisible(false);
        }
      })
      .catch(error => {
        console.error('API error:', error);
        messageApi.error('An error occurred while updating the record');
        setConfirmModalVisible(false);
      });
  };

  // 处理确认对话框的取消按钮点击
  const handleConfirmCancel = () => {
    setConfirmModalVisible(false);
  };

  // 处理清除按钮点击
  const handleClear = (groupType) => {
    // 清除对应的搜索结果
    switch (groupType) {
      case 'headGroup':
        setHeadGroupOptions([]);
        // 清除表单中的值
        form.setFieldsValue({ headGroup: undefined });
        // 清除选中的组数据
        setSelectedGroups(prev => ({
          ...prev,
          headGroup: null
        }));
        break;
      case 'wiGroup':
        setWiGroupOptions([]);
        // 清除表单中的值
        form.setFieldsValue({ wiGroup: undefined });
        // 清除选中的组数据
        setSelectedGroups(prev => ({
          ...prev,
          wiGroup: null
        }));
        break;
      case 'wiCustomizedGroup':
        setWiCustomizedGroupOptions([]);
        // 清除表单中的值
        form.setFieldsValue({ wiCustomizedGroup: undefined });
        // 清除选中的组数据
        setSelectedGroups(prev => ({
          ...prev,
          wiCustomizedGroup: null
        }));
        break;
      default:
        break;
    }
  };

  // 检查字段是否被修改
  const isFieldChanged = (fieldName) => {
    const currentValue = formValues[fieldName];
    const originalValue = originalValues[fieldName];
    
    // 对于布尔值和字符串的特殊处理
    if (fieldName === 'isGlobalClient') {
      return currentValue !== originalValues.isGlobalClient;
    }
    
    return currentValue !== originalValue;
  };

  // 获取字段的原始值和新值的显示
  const getFieldValueDisplay = (fieldName) => {
    const currentValue = formValues[fieldName];
    let originalValue = originalValues[fieldName];
    
    // 对于布尔值的特殊处理
    if (fieldName === 'isGlobalClient') {
      return {
        old: originalValue || '',
        new: currentValue || ''
      };
    }
    
    // 对于组ID的特殊处理
    if (fieldName === 'headGroup') {
      return {
        old: originalValues.headGroupName || '',
        new: formValues.headGroupName || ''
      };
    }
    
    if (fieldName === 'wiGroup') {
      return {
        old: originalValues.wiGroupName || '',
        new: formValues.wiGroupName || ''
      };
    }
    
    if (fieldName === 'wiCustomizedGroup') {
      return {
        old: originalValues.wiCustomizedGroupName || '',
        new: formValues.wiCustomizedGroupName || ''
      };
    }
    
    return {
      old: originalValue || '',
      new: currentValue || ''
    };
  };

  // 在组件挂载时添加表单值变化的监听
  useEffect(() => {
    // 监听表单值变化
    const unsubscribe = form.getFieldsValue;
    
    // 添加一个调试函数，用于输出当前表单值
    window.debugFormValues = () => {
      const values = form.getFieldsValue();
      
      // 获取选项的标签
      const headGroupLabel = headGroupOptions.find(option => option.value === values.headGroup)?.label;
      const wiGroupLabel = wiGroupOptions.find(option => option.value === values.wiGroup)?.label;
      const wiCustomizedGroupLabel = wiCustomizedGroupOptions.find(option => option.value === values.wiCustomizedGroup)?.label;
    
    };
    
    return () => {
      // 清理函数
      window.debugFormValues = undefined;
    };
  }, [form, headGroupOptions, wiGroupOptions, wiCustomizedGroupOptions]);

  return (
    <>
      {contextHolder}
      <Modal
        title="Edit Account"
        open={visible}
        onCancel={handleCancel}
        width={600}
        footer={null}
      >
        <div className="form-container" style={{ marginTop: '20px' }}>
          <Form
            form={form}
            layout="vertical"
            className="edit-account-form"
            onValuesChange={(changedValues, allValues) => {
              
              // 检查GFAS Account No是否变化
              if ('gfasAccountNo' in changedValues) {
                handleAccountNoChange(changedValues.gfasAccountNo);
                
                // 如果GFAS Account No有值，清除错误状态
                if (changedValues.gfasAccountNo) {
                  setFormErrors(prev => ({
                    ...prev,
                    gfasAccountNo: false
                  }));
                }
              }
              
              // 检查GFAS Account Name是否变化
              if ('gfasAccountName' in changedValues) {
                
                // 如果GFAS Account Name有值，清除错误状态
                if (changedValues.gfasAccountName) {
                  setFormErrors(prev => ({
                    ...prev,
                    gfasAccountName: false
                  }));
                }
              }
              
              // 如果组值发生变化，输出更详细的信息
              if (changedValues.headGroup !== undefined) {
                const label = headGroupOptions.find(option => option.value === changedValues.headGroup)?.label;
              }
              
              if (changedValues.wiGroup !== undefined) {
                const label = wiGroupOptions.find(option => option.value === changedValues.wiGroup)?.label;
              }
              
              if (changedValues.wiCustomizedGroup !== undefined) {
                const label = wiCustomizedGroupOptions.find(option => option.value === changedValues.wiCustomizedGroup)?.label;
              }
            }}
          >
            {/* Head Group */}
            <div className="form-item">
              <div className="label">
                Head Group
                <span className="required-mark">*</span>
              </div>
              <Form.Item
                name="headGroup"
                noStyle
                className={formErrors.headGroup ? 'has-error' : ''}
                rules={[{ required: true, message: 'Please select Head Group' }]}
              >
                <Select
                  showSearch
                  placeholder="Type at least 4 characters to search"
                  className={`input-style ${formErrors.headGroup ? 'input-error' : ''}`}
                  filterOption={false}
                  onSearch={debouncedSearch.headGroup}
                  onSelect={(value, option) => handleGroupSelect(value, option, 'headGroup')}
                  onFocus={() => {
                    // 如果没有选中值，则清除搜索结果
                    if (!form.getFieldValue('headGroup')) {
                      setHeadGroupOptions([]);
                    }
                  }}
                  notFoundContent={isSearching.headGroup ? 'Searching...' : 'No matching Head Groups found'}
                  allowClear
                  onClear={() => handleClear('headGroup')}
                  autoClearSearchValue={true}
                  defaultOpen={false}
                  labelInValue
                  optionLabelProp="children"
                >
                  {headGroupOptions.map((option, index) => (
                    <Select.Option 
                      key={option.key || `head-group-${index}`} 
                      value={option.value}
                      data={option.data}
                      label={option.label}
                    >
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            {/* WI Group */}
            <div className="form-item">
              <div className="label">
                WI Group
                <span className="required-mark">*</span>
              </div>
              <Form.Item
                name="wiGroup"
                noStyle
                className={formErrors.wiGroup ? 'has-error' : ''}
                rules={[{ required: true, message: 'Please select WI Group' }]}
              >
                <Select
                  showSearch
                  placeholder="Type at least 4 characters to search"
                  className={`input-style ${formErrors.wiGroup ? 'input-error' : ''}`}
                  filterOption={false}
                  onSearch={debouncedSearch.wiGroup}
                  onSelect={(value, option) => handleGroupSelect(value, option, 'wiGroup')}
                  onFocus={() => {
                    // 如果没有选中值，则清除搜索结果
                    if (!form.getFieldValue('wiGroup')) {
                      setWiGroupOptions([]);
                    }
                  }}
                  notFoundContent={isSearching.wiGroup ? 'Searching...' : 'No matching WI Groups found'}
                  allowClear
                  onClear={() => handleClear('wiGroup')}
                  autoClearSearchValue={true}
                  defaultOpen={false}
                  labelInValue
                  optionLabelProp="children"
                >
                  {wiGroupOptions.map((option, index) => (
                    <Select.Option 
                      key={option.key || `wi-group-${index}`} 
                      value={option.value}
                      data={option.data}
                      label={option.label}
                    >
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            {/* WI Customized Group */}
            <div className="form-item">
              <div className="label">WI Customized Group:</div>
              <Form.Item
                name="wiCustomizedGroup"
                noStyle
                className={formErrors.wiCustomizedGroup ? 'has-error' : ''}
              >
                <Select
                  showSearch
                  placeholder="Type at least 4 characters to search"
                  className="input-style"
                  filterOption={false}
                  onSearch={debouncedSearch.wiCustomizedGroup}
                  onSelect={(value, option) => handleGroupSelect(value, option, 'wiCustomizedGroup')}
                  onFocus={() => {
                    // 如果没有选中值，则清除搜索结果
                    if (!form.getFieldValue('wiCustomizedGroup')) {
                      setWiCustomizedGroupOptions([]);
                    }
                  }}
                  notFoundContent={isSearching.wiCustomizedGroup ? 'Searching...' : 'No matching WI Customized Groups found'}
                  allowClear
                  onClear={() => handleClear('wiCustomizedGroup')}
                  autoClearSearchValue={true}
                  defaultOpen={false}
                  labelInValue
                  optionLabelProp="children"
                >
                  {wiCustomizedGroupOptions.map((option, index) => (
                    <Select.Option 
                      key={option.key || `wi-customized-group-${index}`} 
                      value={option.value}
                      data={option.data}
                      label={option.label}
                    >
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            {/* GFAS Account No */}
            <div className="form-item">
              <div className="label">
                GFAS Account No
                <span className="required-mark">*</span>
              </div>
              <Form.Item
                name="gfasAccountNo"
                noStyle
                className={formErrors.gfasAccountNo ? 'has-error' : ''}
              >
                <Input 
                  disabled 
                  className={`input-style ${formErrors.gfasAccountNo && (!form.getFieldValue('gfasAccountNo') || form.getFieldValue('gfasAccountNo').trim() === '') ? 'input-error' : ''}`} 
                  onChange={(e) => {
                    // 即使输入框是禁用的，也确保值变化能够被处理
                    const value = e.target.value;
                    handleAccountNoChange(value);
                    
                    // 如果有值，清除错误状态
                    if (value && value.trim() !== '') {
                      setFormErrors(prev => ({
                        ...prev,
                        gfasAccountNo: false
                      }));
                    }
                  }}
                />
              </Form.Item>
            </div>

            {/* Alt ID */}
            {showAltId && (
              <div className="form-item">
                <div className="label">Alt Id:</div>
                <Form.Item
                  name="altId"
                  noStyle
                  className={formErrors.altId ? 'has-error' : ''}
                >
                  <Input className="input-style" />
                </Form.Item>
              </div>
            )}

            {/* GFAS Account Name */}
            <div className="form-item">
              <div className="label">
                GFAS Account Name
                <span className="required-mark">*</span>
              </div>
              <Form.Item
                name="gfasAccountName"
                noStyle
                className={formErrors.gfasAccountName ? 'has-error' : ''}
              >
                <Input 
                  disabled 
                  className={`input-style ${formErrors.gfasAccountName && (!form.getFieldValue('gfasAccountName') || form.getFieldValue('gfasAccountName').trim() === '') ? 'input-error' : ''}`} 
                  onChange={(e) => {
                    const value = e.target.value;
                    // 如果有值，清除错误状态
                    if (value && value.trim() !== '') {
                      setFormErrors(prev => ({
                        ...prev,
                        gfasAccountName: false
                      }));
                    }
                  }}
                />
              </Form.Item>
            </div>

            {/* Fund Class */}
            <div className="form-item">
              <div className="label">
                Fund Class
                <span className="required-mark">*</span>
              </div>
              <Form.Item
                name="fundClass"
                noStyle
                className={formErrors.fundClass ? 'has-error' : ''}
                rules={[{ required: true, message: 'Please select Fund Class' }]}
              >
                <Select
                  placeholder="Select Fund Class"
                  options={options.FUND_CLASS}
                  className="input-style"
                  onChange={handleFundClassChange}
                />
              </Form.Item>
            </div>

            {/* Pension Category */}
            <div className="form-item">
              <div className="label">
                Pension Category
                <span className="required-mark">*</span>
              </div>
              <Form.Item
                name="pensionCategory"
                noStyle
                className={formErrors.pensionCategory ? 'has-error' : ''}
                rules={[{ required: true, message: 'Please select Pension Category' }]}
              >
                <Select
                  placeholder="Select Pension Category"
                  options={options.PENSION_CATEGORY}
                  className="input-style"
                />
              </Form.Item>
            </div>

            {/* Portfolio Nature */}
            <div className="form-item">
              <div className="label">
                Portfolio Nature
                <span className="required-mark">*</span>
              </div>
              <Form.Item
                name="portfolioNature"
                noStyle
                className={formErrors.portfolioNature ? 'has-error' : ''}
                rules={[{ required: true, message: 'Please select Portfolio Nature' }]}
              >
                <Select
                  placeholder="Select Portfolio Nature"
                  options={options.PORTFOLIO_NATURE}
                  className="input-style"
                />
              </Form.Item>
            </div>

            {/* Member Choice */}
            <div className="form-item">
              <div className="label">
                Member Choice
                <span className="required-mark">*</span>
              </div>
              <Form.Item
                name="memberChoice"
                noStyle
                className={formErrors.memberChoice ? 'has-error' : ''}
                rules={[{ required: true, message: 'Please select Member Choice' }]}
              >
                <Select
                  placeholder="Select Member Choice"
                  options={options.MEMBER_CHOICE}
                  className="input-style"
                />
              </Form.Item>
            </div>

            {/* RM */}
            <div className="form-item">
              <div className="label">RM:</div>
              <Form.Item
                name="rm"
                noStyle
                className={formErrors.rm ? 'has-error' : ''}
              >
                <Select
                  placeholder="Select RM"
                  options={rmOptions}
                  allowClear
                  className="input-style"
                />
              </Form.Item>
            </div>

            {/* Agent */}
            <div className="form-item">
              <div className="label">
                Agent
                <span className="required-mark">*</span>
              </div>
              <Form.Item
                name="agent"
                noStyle
                className={formErrors.agent ? 'has-error' : ''}
                rules={[{ required: true, message: 'Please enter Agent' }]}
              >
                <Input placeholder="Enter Agent" className="input-style" />
              </Form.Item>
            </div>

            {/* Global Client */}
            <div className="form-item">
              <div className="label">
                Global Client
                <span className="required-mark">*</span>
              </div>
              <Form.Item
                name="isGlobalClient"
                noStyle
                className={formErrors.isGlobalClient ? 'has-error' : ''}
                rules={[{ required: true, message: 'Please select Global Client' }]}
              >
                <Radio.Group>
                  <Radio value="Y">Y</Radio>
                  <Radio value="N">N</Radio>
                </Radio.Group>
              </Form.Item>
            </div>
          </Form>
        </div>

        {/* 按钮区域 */}
        <div className="button-container">
          <Button type="primary" onClick={handleSave} className="button">
            Save
          </Button>
          <Button onClick={handleCancel} className="button">
            Cancel
          </Button>
        </div>
      </Modal>

      {/* 确认对话框 */}
      <Modal
        title="Confirm Update"
        open={confirmModalVisible}
        onCancel={handleConfirmCancel}
        onOk={handleConfirm}
        width={800}
      >
        <div className="confirm-content">
          <p>Please confirm the following changes:</p>
          
          <table className="confirm-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Original Value</th>
                <th>New Value</th>
              </tr>
            </thead>
            <tbody>
              {/* GFAS Account No. 和 GFAS Account Name 不可编辑，所以不显示 */}
              {/* Alt ID */}
              {isFieldChanged('altId') && (
                <tr>
                  <td>Alt ID</td>
                  <td>{getFieldValueDisplay('altId').old}</td>
                  <td className="changed-value">{getFieldValueDisplay('altId').new}</td>
                </tr>
              )}
              
              {/* Fund Class */}
              {isFieldChanged('fundClass') && (
                <tr>
                  <td>Fund Class</td>
                  <td>{getFieldValueDisplay('fundClass').old}</td>
                  <td className="changed-value">{getFieldValueDisplay('fundClass').new}</td>
                </tr>
              )}
              
              {/* Pension Category */}
              {isFieldChanged('pensionCategory') && (
                <tr>
                  <td>Pension Category</td>
                  <td>{getFieldValueDisplay('pensionCategory').old}</td>
                  <td className="changed-value">{getFieldValueDisplay('pensionCategory').new}</td>
                </tr>
              )}
              
              {/* Portfolio Nature */}
              {isFieldChanged('portfolioNature') && (
                <tr>
                  <td>Portfolio Nature</td>
                  <td>{getFieldValueDisplay('portfolioNature').old}</td>
                  <td className="changed-value">{getFieldValueDisplay('portfolioNature').new}</td>
                </tr>
              )}
              
              {/* Member Choice */}
              {isFieldChanged('memberChoice') && (
                <tr>
                  <td>Member Choice</td>
                  <td>{getFieldValueDisplay('memberChoice').old}</td>
                  <td className="changed-value">{getFieldValueDisplay('memberChoice').new}</td>
                </tr>
              )}
              
              {/* RM */}
              {isFieldChanged('rm') && (
                <tr>
                  <td>RM</td>
                  <td>{getFieldValueDisplay('rm').old}</td>
                  <td className="changed-value">{getFieldValueDisplay('rm').new}</td>
                </tr>
              )}
              
              {/* Global Client */}
              {isFieldChanged('isGlobalClient') && (
                <tr>
                  <td>Global Client</td>
                  <td>{getFieldValueDisplay('isGlobalClient').old}</td>
                  <td className="changed-value">{getFieldValueDisplay('isGlobalClient').new}</td>
                </tr>
              )}
              
              {/* Agent */}
              {isFieldChanged('agent') && (
                <tr>
                  <td>Agent</td>
                  <td>{getFieldValueDisplay('agent').old}</td>
                  <td className="changed-value">{getFieldValueDisplay('agent').new}</td>
                </tr>
              )}
              
              {/* Head Group */}
              {isFieldChanged('headGroup') && (
                <tr>
                  <td>Head Group</td>
                  <td>{getFieldValueDisplay('headGroup').old}</td>
                  <td className="changed-value">{getFieldValueDisplay('headGroup').new}</td>
                </tr>
              )}
              
              {/* WI Group */}
              {isFieldChanged('wiGroup') && (
                <tr>
                  <td>WI Group</td>
                  <td>{getFieldValueDisplay('wiGroup').old}</td>
                  <td className="changed-value">{getFieldValueDisplay('wiGroup').new}</td>
                </tr>
              )}
              
              {/* WI Customized Group */}
              {isFieldChanged('wiCustomizedGroup') && (
                <tr>
                  <td>WI Customized Group</td>
                  <td>{getFieldValueDisplay('wiCustomizedGroup').old}</td>
                  <td className="changed-value">{getFieldValueDisplay('wiCustomizedGroup').new}</td>
                </tr>
              )}
              
              {/* 如果没有任何字段被修改，显示提示信息 */}
              {!Object.keys(formValues).some(key => isFieldChanged(key)) && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center' }}>No changes detected</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
};

export default EditAccountModal; 