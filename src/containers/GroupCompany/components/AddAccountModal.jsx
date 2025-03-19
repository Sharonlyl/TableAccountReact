import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Select, Checkbox, Radio, Button, Row, Col, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { queryImrReferenceByCategory, queryUserByDepartments, queryHeadGroup, queryWIGroup, queryWICustomizedGroup, queryGfasAccountName, addGroupCompanyMapping } from '../../../api/groupCompany';
import axios from 'axios';
import '../styles/AddAccountModal.css';

const AddAccountModal = ({ visible, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [accountName, setAccountName] = useState('');
  const [showAltId, setShowAltId] = useState(false);
  const [options, setOptions] = useState({
    FUND_CLASS: [],
    PORTOFOLIO_NATURE: [],
    PENSION_CATEGORY: [],
    MEMBER_CHOICE: []
  });
  const [originalAccountName, setOriginalAccountName] = useState('');
  const [rmOptions, setRmOptions] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  
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
  // 添加一个状态来控制确认按钮的loading状态
  const [confirmLoading, setConfirmLoading] = useState(false);

  // 添加状态来跟踪GFAS Account No的值
  const [gfasAccountNoValue, setGfasAccountNoValue] = useState('');

  // 添加一个状态来跟踪是否已经尝试过查询账户名称
  const [hasAttemptedNameLookup, setHasAttemptedNameLookup] = useState(false);

  // 在组件挂载和visible变化时获取下拉框选项数据
  useEffect(() => {
    if (visible) {
      fetchOptions();
      fetchRmOptions();
      // 重置表单错误状态
      setFormErrors({});
      // 重置账户名称和GFAS Account No值
      setAccountName('');
      setOriginalAccountName('');
      setGfasAccountNoValue('');
      // 重置查询标志
      setHasAttemptedNameLookup(false);
      // 重置Alt Id显示状态
      setShowAltId(false);
    }
  }, [visible]);

  // 在组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  // 监听confirmModalVisible的变化，当它变为false时恢复原始账户名称
  useEffect(() => {
    if (!confirmModalVisible && originalAccountName) {
      setAccountName(originalAccountName);
    }
  }, [confirmModalVisible, originalAccountName]);

  // 获取下拉框选项数据
  const fetchOptions = async () => {
    try {
      const response = await queryImrReferenceByCategory({
        categoryList: 'FUND_CLASS,PORTOFOLIO_NATURE,PENSION_CATEGORY,MEMBER_CHOICE'
      });
      
      // 检查返回的数据结构
      if (response && Array.isArray(response)) {
        // 直接使用返回的数组
        const data = response;
        
        // 按category分类整理数据
        const newOptions = {
          FUND_CLASS: [],
          PORTOFOLIO_NATURE: [],
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
          return;
        }
        
        // 按category分类整理数据
        const newOptions = {
          FUND_CLASS: [],
          PORTOFOLIO_NATURE: [],
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
      }
    } catch (error) {
      // 处理错误
    }
  };

  // 获取RM下拉框选项数据
  const fetchRmOptions = async () => {
    try {
      const response = await queryUserByDepartments({
        departments: 'RM'
      });
      
      if (response && response.data) {
        let users = [];
        
        // 根据实际返回数据结构处理
        if (response.data.data && Array.isArray(response.data.data)) {
          users = response.data.data;
        } else if (Array.isArray(response.data)) {
          users = response.data;
        }
        
        // 转换为下拉框选项格式
        const userOptions = users.map(user => ({
          value: user.name || user.userName || user.id,
          label: user.name || user.userName || user.id
        }));
        
        // 添加"Client Service Officer"选项
        userOptions.push({
          value: 'Client Service Officer',
          label: 'Client Service Officer'
        });
        
        setRmOptions(userOptions);
      }
    } catch (error) {
      // 处理错误
    }
  };

  // 处理账号输入并转换为大写
  const handleAccountNoChange = async (value) => {
    // 转换为大写
    const upperCaseValue = value ? value.toUpperCase() : '';
    
    // 更新状态
    setGfasAccountNoValue(upperCaseValue);
    
    // 更新表单字段值为大写
    form.setFieldsValue({
      gfasAccountNo: upperCaseValue
    });
    
    // 如果有值，清除错误状态
    if (upperCaseValue && upperCaseValue.trim() !== '') {
      setFormErrors(prev => ({
        ...prev,
        gfasAccountNo: false
      }));
    }
    
    // 检查是否为特殊账号CCC 111111
    const isCCC111111 = upperCaseValue === 'CCC 111111';
    
    // 设置是否显示Alt Id字段
    setShowAltId(isCCC111111);
    
    // 如果是CCC 111111，需要等待Alt Id输入后再查询
    if (isCCC111111) {
      // 清空账户名称
      setAccountName('');
      setOriginalAccountName('');
      return;
    }
    
    if (upperCaseValue) {
      try {
        // 设置已尝试查询账户名称的标志
        setHasAttemptedNameLookup(true);
        
        // 调用新的API获取账户名称
        const response = await queryGfasAccountName({
          gfasAccountNo: upperCaseValue
        });
        
        // 检查API响应
        if (response && response.success && response.data) {
          // 获取账户名称 - 现在从data字段获取
          const accountNameValue = response.data;
          
          // 检查gfasAccountName是否为空
          if (accountNameValue) {
            setAccountName(accountNameValue);
            setOriginalAccountName(accountNameValue);
            // 如果账户名称有值，清除错误状态
            setFormErrors(prev => ({
              ...prev,
              gfasAccountName: false
            }));
          } else {
            // 如果gfasAccountName为空，清空账户名称
            setAccountName('');
            setOriginalAccountName('');
            // 显示提示信息
            messageApi.warning('No matching GFAS Account Name found');
          }
        } else {
          // 如果没有找到匹配的账户，清空账户名称
          setAccountName('');
          setOriginalAccountName('');
          if (response && response.errMessage) {
            messageApi.warning(response.errMessage);
          } else {
            messageApi.warning('No matching GFAS Account Name found');
          }
        }
      } catch (error) {
        console.error('Error fetching account name:', error);
        // 发生错误时，清空账户名称
        setAccountName('');
        setOriginalAccountName('');
        messageApi.error('Failed to fetch account name');
      }
    } else {
      // 如果账号为空，重置查询标志
      setHasAttemptedNameLookup(false);
      // 如果输入为空，清空账户名称
      setAccountName('');
      setOriginalAccountName('');
      setShowAltId(false);
    }
  };
  
  // 处理Alt ID输入并转换为大写
  const handleAltIdChange = async (value) => {
    // 转换为大写
    const upperCaseValue = value ? value.toUpperCase() : '';
    
    // 更新表单字段值为大写
    form.setFieldsValue({
      altId: upperCaseValue
    });
    
    // 如果有值，清除错误状态
    if (upperCaseValue && upperCaseValue.trim() !== '') {
      setFormErrors(prev => ({
        ...prev,
        altId: false
      }));
      
      // 如果GFAS Account No是CCC 111111并且Alt Id有值，则调用API查询账户名称
      if (gfasAccountNoValue === 'CCC 111111') {
        try {
          // 设置已尝试查询账户名称的标志
          setHasAttemptedNameLookup(true);
          
          // 调用新的API获取账户名称，同时传入alternativeId
          const response = await queryGfasAccountName({
            gfasAccountNo: gfasAccountNoValue,
            alternativeId: upperCaseValue
          });
          
          // 检查API响应
          if (response && response.success && response.data) {
            // 获取账户名称 - 现在从data字段获取
            const accountNameValue = response.data;
            
            // 检查返回的账户名称是否为空
            if (accountNameValue) {
              setAccountName(accountNameValue);
              setOriginalAccountName(accountNameValue);
              // 如果账户名称有值，清除错误状态
              setFormErrors(prev => ({
                ...prev,
                gfasAccountName: false
              }));
            } else {
              // 如果账户名称为空，清空账户名称
              setAccountName('');
              setOriginalAccountName('');
              // 显示提示信息
              messageApi.warning('No matching GFAS Account Name found');
            }
          } else {
            // 如果没有找到匹配的账户，清空账户名称
            setAccountName('');
            setOriginalAccountName('');
            if (response && response.errMessage) {
              messageApi.warning(response.errMessage);
            } else {
              messageApi.warning('No matching GFAS Account Name found');
            }
          }
        } catch (error) {
          console.error('Error fetching account name with Alt Id:', error);
          // 发生错误时，清空账户名称
          setAccountName('');
          setOriginalAccountName('');
          messageApi.error('Failed to fetch account name');
        }
      }
    }
  };
  
  // 处理字母数字输入校验
  const handleAlphanumericInput = (e) => {
    // 只允许字母、数字和空格
    const { value } = e.target;
    const reg = /^[a-zA-Z0-9\s]*$/;
    
    if (!reg.test(value)) {
      e.preventDefault();
      // 移除提示信息，但保留输入限制
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

  // 搜索组信息的通用函数
  const searchGroup = async (value, groupType) => {
    if (!value || value.length < 4) {
      // 如果输入少于4个字符，清空选项并返回
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
      return;
    }

    // 设置正在搜索状态
    setIsSearching(prev => ({ ...prev, [groupType]: true }));

    try {
      // 根据不同的组类型调用不同的API
      if (groupType === 'headGroup') {
        try {
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
              // 转换为下拉框选项格式 - 根据实际数据结构调整
              const options = list.map((item, index) => ({
                key: item.headGroupId.toString() ,
                value: item.headGroupId.toString(),
                label: item.groupName ,
              }));
            
              
              // 更新选项
              setHeadGroupOptions(options);
              
              // 如果结果超过10个，提示用户输入更多信息
              if (total > 10 && options.length === 10) {
                messageApi.info('Please input more characters to narrow down the search');
              }
            } else {
              // 没有找到匹配项
              setHeadGroupOptions([]);
            }
          } else {
            // 处理API错误
            setHeadGroupOptions([]);
            if (response && response.errMessage) {
              messageApi.error(response.errMessage);
            } else {
              messageApi.error('Failed to fetch head group data');
            }
          }
        } catch (error) {
          console.error('Error fetching head group:', error);
          setHeadGroupOptions([]);
          messageApi.error('Failed to fetch head group data');
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
          
          console.log('WI Group API response:', response); // 添加日志以便调试
          
          // 检查API响应
          if (response && response.success && response.pageInfoData) {
            const { list, total } = response.pageInfoData;
            
            if (Array.isArray(list) && list.length > 0) {
              // 转换为下拉框选项格式 - 根据真实数据结构调整
              const options = list.map((item, index) => ({
                key: item.wiGroupId.toString(),
                value: item.wiGroupId.toString(),
                label: item.groupName,
                data: item
              }));
              
              console.log('WI Group options after mapping:', options); // 添加日志以便调试
              
              // 更新选项
              setWiGroupOptions(options);
              console.log('Updated wiGroupOptions:', options);
              
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
                key: item.wiCustomizedGroupId.toString(),
                value: item.wiCustomizedGroupId.toString(),
                label: item.groupName,
                data: item
              }));
              
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
            // 处理API错误
            console.log('API response error or invalid format');
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
    // 如果需要，可以在这里处理选择后的逻辑
    console.log(`Selected ${groupType}:`, option);
    
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

  // 防抖处理的搜索函数
  const debouncedSearch = useRef({
    headGroup: debounce((value) => searchGroup(value, 'headGroup'), 300),
    wiGroup: debounce((value) => searchGroup(value, 'wiGroup'), 300),
    wiCustomizedGroup: debounce((value) => searchGroup(value, 'wiCustomizedGroup'), 300)
  }).current;

  // 处理Fund Class变更
  const handleFundClassChange = (value) => {
    if (value === 'FRMT') {
      // 当选择FRMT时，自动设置相关字段
      // 从options中查找对应的值
      const dcFullService = options.PORTOFOLIO_NATURE.find(option => 
        option.value === 'DC(full service)'
      )?.value || '';
      
      const mpfDirect = options.PENSION_CATEGORY.find(option => 
        option.value === 'MPF- Direct'
      )?.value || '';
      
      const memberChoice = options.MEMBER_CHOICE.find(option => 
        option.value === 'Member Choice'
      )?.value || '';
      
      form.setFieldsValue({
        portfolioNature: dcFullService,
        pensionCategory: mpfDirect,
        memberChoice
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
        if (values.gfasAccountNo) {
          values.gfasAccountNo = values.gfasAccountNo.toUpperCase();
        }
        if (values.altId) {
          values.altId = values.altId.toUpperCase();
        }
        
        // 检查必填字段
        const mandatoryFields = [
          'headGroup',
          'wiGroup',
          'gfasAccountNo',
          'fundClass',
          'pensionCategory',
          'portfolioNature',
          'memberChoice',
          'agent',
          'isGlobalClient'
        ];

        // 如果Alt Id显示，则添加到必填字段列表
        if (showAltId) {
          mandatoryFields.push('altId');
        }

        const emptyFields = mandatoryFields.filter(field => {
          const value = values[field];
          if (field === 'isGlobalClient') {
            return value === undefined || value === null || value === '';
          }
          return value === undefined || value === null || value === '';
        });

        // 检查账户名称是否为空
        if (emptyFields.length > 0 || !accountName) {
          // 设置错误状态
          const errors = {};
          emptyFields.forEach(field => {
            errors[field] = true;
          });
          if (!accountName) {
            errors.gfasAccountName = true;
          }
          setFormErrors(errors);

          // 显示错误消息
          messageApi.error('Please enter all mandatory fields');
          return;
        }

        // 获取组名称
        const headGroupOption = headGroupOptions.find(option => option.value === values.headGroup);
        const wiGroupOption = wiGroupOptions.find(option => option.value === values.wiGroup);
        const wiCustomizedGroupOption = wiCustomizedGroupOptions.find(option => option.value === values.wiCustomizedGroup);

        // 保存表单值并显示确认对话框
        setFormValues({
          ...values,
          gfasAccountName: accountName,
          headGroupName: headGroupOption ? headGroupOption.label : values.headGroup,
          wiGroupName: wiGroupOption ? wiGroupOption.label : values.wiGroup,
          wiCustomizedGroupName: wiCustomizedGroupOption ? wiCustomizedGroupOption.label : (values.wiCustomizedGroup || 'xxx')
        });
        setConfirmModalVisible(true);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
        
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
        
        // 检查GFAS Account Name是否为空
        if (!accountName) {
          errors.gfasAccountName = true;
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
    setHasAttemptedNameLookup(false); // 重置查询标志
    setFormErrors({}); // 重置错误状态
    setAccountName(''); // 重置账户名称状态
    setOriginalAccountName(''); // 重置原始账户名称状态
    setGfasAccountNoValue(''); // 重置GFAS Account No值
    setShowAltId(false); // 重置Alt Id显示状态
    onCancel();
  };

  // 处理跳转到其他页面的按钮点击（暂未实现）
  const handleNavigate = (type) => {

    // 这里将来会实现跳转功能
  };

  // 处理确认对话框的确认按钮点击
  const handleConfirm = () => {
    // 设置loading状态为true
    setConfirmLoading(true);
    
    // 准备API请求参数
    const params = {
      gfasAccountNo: formValues.gfasAccountNo,
      alternativeId: formValues.altId || '',
      gfasAccountName: formValues.gfasAccountName,
      fundClass: formValues.fundClass,
      pensionCategory: formValues.pensionCategory,
      portfolioNature: formValues.portfolioNature,
      memberChoice: formValues.memberChoice,
      rmName: formValues.rm || '',
      isGlobalClient: formValues.isGlobalClient,
      agent: formValues.agent,
      headGroupId: formValues.headGroup,
      wiGroupId: formValues.wiGroup,
      wiCustomizedGroupId: formValues.wiCustomizedGroup || ''
    };

    // 调用API
    addGroupCompanyMapping(params)
      .then(response => {
        if (response.success) {
          messageApi.success('Record added successfully');
          setConfirmModalVisible(false);
          form.resetFields();
          setFormErrors({}); // 清空错误状态
          setHasAttemptedNameLookup(false); // 重置查询标志
          setAccountName(''); // 重置账户名称状态
          setOriginalAccountName(''); // 重置原始账户名称状态
          setGfasAccountNoValue(''); // 重置GFAS Account No值
          onSave(formValues);
          // 添加记录后返回Search页面
          onCancel(); // 关闭Add页面，返回Search页面
        } else {
          messageApi.error(response.errMessage || 'Failed to add record');
          setConfirmModalVisible(false);
        }
      })
      .catch(error => {
        console.error('API error:', error);
        messageApi.error('An error occurred while adding the record');
        setConfirmModalVisible(false);
      })
      .finally(() => {
        // 无论API调用成功还是失败，都重置loading状态
        setConfirmLoading(false);
      });
  };

  // 处理确认对话框的取消按钮点击
  const handleConfirmCancel = () => {
    setConfirmModalVisible(false);
  };

  // 处理清除选择
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

  return (
    <>
      <Modal
        title="Add Group Company Mapping"
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        {contextHolder}
        <div className="form-container" style={{ marginTop: '20px' }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              altId: '',
              isGlobalClient: undefined
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
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  placeholder="Type at least 4 characters to search"
                  className={`input-style ${formErrors.headGroup ? 'input-error' : ''}`}
                  filterOption={false}
                  onSearch={(value) => debouncedSearch.headGroup(value)}
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
                  suffixIcon={
                    <Button 
                      type="text" 
                      icon={<PlusOutlined />} 
                      className="add-button"
                      onClick={() => handleNavigate('headGroup')}
                    />
                  }
                >
                  {headGroupOptions.map((option, index) => (
                    <Select.Option 
                      key={option.key || `head-group-${index}`} 
                      value={option.value}
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
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  placeholder="Type at least 4 characters to search"
                  className={`input-style ${formErrors.wiGroup ? 'input-error' : ''}`}
                  filterOption={false}
                  onSearch={(value) => debouncedSearch.wiGroup(value)}
                  onSelect={(value, option) => handleGroupSelect(value, option, 'wiGroup')}
                  onFocus={() => {
                    // 如果没有选中值，则清除搜索结果
                    if (!form.getFieldValue('wiGroup')) {
                      setWiGroupOptions([]);
                    }
                  }}
                  notFoundContent={isSearching.wiGroup ? 'Searching...' : 'No matching WI Groups found'}
                  options={wiGroupOptions}
                  allowClear
                  onClear={() => handleClear('wiGroup')}
                  autoClearSearchValue={true}
                  defaultOpen={false}
                  suffixIcon={
                    <Button 
                      type="text" 
                      icon={<PlusOutlined />} 
                      className="add-button"
                      onClick={() => handleNavigate('wiGroup')}
                    />
                  }
                />
              </Form.Item>
            </div>

            {/* WI Customized Group */}
            <div className="form-item">
              <div className="label">WI Customized Group</div>
              <Form.Item
                name="wiCustomizedGroup"
                noStyle
              >
                <Select
                  showSearch
                  placeholder="Type at least 4 characters to search"
                  className="input-style"
                  filterOption={false}
                  onSearch={(value) => debouncedSearch.wiCustomizedGroup(value)}
                  onSelect={(value, option) => handleGroupSelect(value, option, 'wiCustomizedGroup')}
                  onFocus={() => {
                    // 如果没有选中值，则清除搜索结果
                    if (!form.getFieldValue('wiCustomizedGroup')) {
                      setWiCustomizedGroupOptions([]);
                    }
                  }}
                  notFoundContent={isSearching.wiCustomizedGroup ? 'Searching...' : 'No matching WI Customized Groups found'}
                  options={wiCustomizedGroupOptions}
                  allowClear
                  onClear={() => handleClear('wiCustomizedGroup')}
                  autoClearSearchValue={true}
                  defaultOpen={false}
                  suffixIcon={
                    <Button 
                      type="text" 
                      icon={<PlusOutlined />} 
                      className="add-button"
                      onClick={() => handleNavigate('wiCustomizedGroup')}
                    />
                  }
                />
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
                rules={[
                  { required: true },
                  { 
                    pattern: /^[a-zA-Z0-9\s]*$/, 
                    message: 'Only letters, numbers and spaces' 
                  }
                ]}
                className={formErrors.gfasAccountNo ? 'has-error' : ''}
              >
                <Input 
                  placeholder="Letters, numbers and spaces only" 
                  className={`input-style ${formErrors.gfasAccountNo && (!form.getFieldValue('gfasAccountNo') || form.getFieldValue('gfasAccountNo').trim() === '') ? 'input-error' : ''}`}
                  onBlur={(e) => handleAccountNoChange(e.target.value)}
                  onChange={(e) => {
                    const { value } = e.target;
                    // 如果有值，清除错误状态
                    if (value && value.trim() !== '') {
                      setFormErrors(prev => ({
                        ...prev,
                        gfasAccountNo: false
                      }));
                    }
                  }}
                  onKeyPress={handleAlphanumericInput}
                />
              </Form.Item>
            </div>

            {/* Alt Id */}
            {showAltId && (
              <div className="form-item">
                <div className="label">
                  Alt Id
                  <span className="required-mark">*</span>
                </div>
                <Form.Item
                  name="altId"
                  noStyle
                  rules={[
                    { required: true, message: 'Please input Alt Id' },
                    { 
                      pattern: /^[a-zA-Z0-9\s]*$/, 
                      message: 'Only letters, numbers and spaces' 
                    }
                  ]}
                >
                  <Input 
                    placeholder="Letters, numbers and spaces only" 
                    className={`input-style ${formErrors.altId ? 'input-error' : ''}`}
                    onBlur={(e) => handleAltIdChange(e.target.value)}
                    onKeyPress={handleAlphanumericInput}
                  />
                </Form.Item>
              </div>
            )}

            {/* GFAS Account Name */}
            <div className="form-item">
              <div className="label">
                GFAS Account Name
                <span className="required-mark">*</span>
              </div>
              <Input 
                value={accountName} 
                disabled 
                placeholder={hasAttemptedNameLookup && !accountName ? "" : "Auto display based on Account No."}
                className={`input-style ${formErrors.gfasAccountName && !accountName ? 'input-error' : ''}`}
                onChange={(e) => {
                  // 虽然这是一个禁用的输入框，但仍然添加onChange处理程序以保持一致性
                  const { value } = e.target
                  if (value && value.trim() !== '') {
                    setFormErrors(prev => ({
                      ...prev,
                      gfasAccountName: false
                    }));
                  }
                }}
              />
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
                rules={[{ required: true }]}
              >
                <Select 
                  placeholder="Please select Fund Class"
                  className={`input-style ${formErrors.fundClass ? 'input-error' : ''}`}
                  onChange={handleFundClassChange}
                >
                  {options.FUND_CLASS.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
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
                rules={[{ required: true }]}
              >
                <Select 
                  placeholder="Please select Pension Category"
                  className={`input-style ${formErrors.pensionCategory ? 'input-error' : ''}`}
                >
                  {options.PENSION_CATEGORY.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
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
                rules={[{ required: true }]}
              >
                <Select 
                  placeholder="Please select Portfolio Nature"
                  className={`input-style ${formErrors.portfolioNature ? 'input-error' : ''}`}
                >
                  {options.PORTOFOLIO_NATURE.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
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
                rules={[{ required: true }]}
              >
                <Select 
                  placeholder="Please select Member Choice"
                  className={`input-style ${formErrors.memberChoice ? 'input-error' : ''}`}
                >
                  {options.MEMBER_CHOICE.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            {/* RM */}
            <div className="form-item">
              <div className="label">RM</div>
              <Form.Item
                name="rm"
                noStyle
              >
                <Select 
                  placeholder="Please select RM"
                  className="input-style"
                >
                  {rmOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
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
                rules={[{ required: true }]}
              >
                <Input 
                  placeholder="Please input Agent" 
                  className={`input-style ${formErrors.agent && (!form.getFieldValue('agent') || form.getFieldValue('agent').trim() === '') ? 'input-error' : ''}`}
                  onChange={(e) => {
                    const { value } = e.target;
                    // 如果有值，清除错误状态
                    if (value && value.trim() !== '') {
                      setFormErrors(prev => ({
                        ...prev,
                        agent: false
                      }));
                    }
                  }}
                />
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
                rules={[{ required: true, message: 'Please select Global Client' }]}
                className={formErrors.isGlobalClient ? 'has-error' : ''}
              >
                <Radio.Group 
                  className={formErrors.isGlobalClient ? 'radio-error' : ''}
                  onChange={(e) => {
                    // 当用户选择了一个选项，清除错误状态
                    if (e.target.value) {
                      setFormErrors(prev => ({
                        ...prev,
                        isGlobalClient: false
                      }));
                    }
                  }}
                >
                  <Radio value="Y">Y</Radio>
                  <Radio value="N">N</Radio>
                </Radio.Group>
              </Form.Item>
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
          </Form>
        </div>
      </Modal>

      {/* 确认对话框 */}
      <Modal
        title="Please confirm to create the mapping record:"
        open={confirmModalVisible}
        onCancel={handleConfirmCancel}
        footer={
          <div className="confirm-button-container">
            <Button key="confirm" type="primary" onClick={handleConfirm} loading={confirmLoading}>
              Confirm
            </Button>
            <Button key="cancel" onClick={handleConfirmCancel} disabled={confirmLoading}>
              Cancel
            </Button>
          </div>
        }
        width={550}
        centered
      >
        <div className="confirm-content" style={{marginTop:'20px'}}>
          <div style={{ paddingLeft: '60px' }}>
            <Row gutter={[16, 8]}>
              <Col span={24}>
                <div className="confirm-item">
                  <span className="confirm-label">Head Group</span>
                  <span className="confirm-value">{formValues.headGroupName}</span>
                </div>
              </Col>
              
              <Col span={24}>
                <div className="confirm-item">
                  <span className="confirm-label">WI Group</span>
                  <span className="confirm-value">{formValues.wiGroupName}</span>
                </div>
              </Col>
              
              <Col span={24}>
                <div className="confirm-item">
                  <span className="confirm-label">WI Customized Group</span>
                  <span className="confirm-value">{formValues.wiCustomizedGroupName || 'xxx'}</span>
                </div>
              </Col>
              
              <Col span={24}>
                <div className="confirm-item">
                  <span className="confirm-label">GFAS Account No</span>
                  <span className="confirm-value">{formValues.gfasAccountNo}</span>
                </div>
              </Col>
              
              {/* 只在GFAS Account No为"CCC 111111"时显示Alt Id */}
              {formValues.gfasAccountNo === 'CCC 111111' && (
                <Col span={24}>
                  <div className="confirm-item">
                    <span className="confirm-label">Alt Id</span>
                    <span className="confirm-value">{formValues.altId || ''}</span>
                  </div>
                </Col>
              )}
              
              <Col span={24}>
                <div className="confirm-item">
                  <span className="confirm-label">GFAS Account Name</span>
                  <span className="confirm-value">{formValues.gfasAccountName}</span>
                </div>
              </Col>
              
              <Col span={24}>
                <div className="confirm-item">
                  <span className="confirm-label">Fund Class</span>
                  <span className="confirm-value">{formValues.fundClass}</span>
                </div>
              </Col>
              
              <Col span={24}>
                <div className="confirm-item">
                  <span className="confirm-label">Pension Category</span>
                  <span className="confirm-value">{formValues.pensionCategory}</span>
                </div>
              </Col>
              
              <Col span={24}>
                <div className="confirm-item">
                  <span className="confirm-label">Portfolio Nature</span>
                  <span className="confirm-value">{formValues.portfolioNature}</span>
                </div>
              </Col>
              
              <Col span={24}>
                <div className="confirm-item">
                  <span className="confirm-label">Member Choice</span>
                  <span className="confirm-value">{formValues.memberChoice}</span>
                </div>
              </Col>
              
              <Col span={24}>
                <div className="confirm-item">
                  <span className="confirm-label">RM</span>
                  <span className="confirm-value">{formValues.rm}</span>
                </div>
              </Col>
              
              <Col span={24}>
                <div className="confirm-item">
                  <span className="confirm-label">Agent</span>
                  <span className="confirm-value">{formValues.agent}</span>
                </div>
              </Col>
              
              <Col span={24}>
                <div className="confirm-item">
                  <span className="confirm-label">Global Client</span>
                  <span className="confirm-value">{formValues.isGlobalClient}</span>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AddAccountModal;