import axios from 'axios';

// 基础 API URL，可以根据环境配置不同的 URL
const BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// 获取账户列表
export const getAccountList = async (params) => {
  try {
    const response = await axios.get(`${BASE_URL}/accounts`, { params });
    return response.data;
  } catch (error) {
    console.error('获取账户列表失败:', error);
    throw error;
  }
};

// 获取单个账户详情
export const getAccountDetail = async (accountId) => {
  try {
    const response = await axios.get(`${BASE_URL}/accounts/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('获取账户详情失败:', error);
    throw error;
  }
};

// 创建新账户
export const createAccount = async (accountData) => {
  try {
    const response = await axios.post(`${BASE_URL}/accounts`, accountData);
    return response.data;
  } catch (error) {
    console.error('创建账户失败:', error);
    throw error;
  }
};

// 更新账户信息
export const updateAccount = async (accountId, accountData) => {
  try {
    const response = await axios.put(`${BASE_URL}/accounts/${accountId}`, accountData);
    return response.data;
  } catch (error) {
    console.error('更新账户失败:', error);
    throw error;
  }
};

// 删除账户
export const deleteAccount = async (accountId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/accounts/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('删除账户失败:', error);
    throw error;
  }
};

// 批量删除账户
export const batchDeleteAccounts = async (accountIds) => {
  try {
    const response = await axios.post(`${BASE_URL}/accounts/batch-delete`, { accountIds });
    return response.data;
  } catch (error) {
    console.error('批量删除账户失败:', error);
    throw error;
  }
};

// 获取 Head Group 列表（用于下拉选择）
export const getHeadGroups = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/head-groups`);
    return response.data;
  } catch (error) {
    console.error('获取 Head Group 列表失败:', error);
    throw error;
  }
};

// 获取 WI Group 列表（用于下拉选择）
export const getWIGroups = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/wi-groups`);
    return response.data;
  } catch (error) {
    console.error('获取 WI Group 列表失败:', error);
    throw error;
  }
};

// 获取 RM 列表（用于下拉选择）
export const getRMList = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/rm-list`);
    return response.data;
  } catch (error) {
    console.error('获取 RM 列表失败:', error);
    throw error;
  }
};

export default {
  getAccountList,
  getAccountDetail,
  createAccount,
  updateAccount,
  deleteAccount,
  batchDeleteAccounts,
  getHeadGroups,
  getWIGroups,
  getRMList
}; 