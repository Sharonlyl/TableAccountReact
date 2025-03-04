import URL_CONS from '../constants/url';
import { service } from '@/utils/httputil';

export const getProfile = () => service.get(URL_CONS.PROFILE_URL);
export const getDealDict = () => service.get(URL_CONS.DEAL_DICT_URL);

export const searchDealList = (params) => service.post(URL_CONS.SEARCH_DEAL_URL, params);

// export const login = (params) => service.post(URL_CONS.LOGIN_URL, params);

export const getDealDetail = (params) => service.get(URL_CONS.DEAL_DETAIL_URL, { params });

// export const savePaymentVerified = (params) => service.get(URL_CONS.DEAL_PAYMENT_VERIFIED, { params });

export const resubmitDeal = (params) => service.get(URL_CONS.DEAL_RESUBMIT_URL, { params });

export const closeDeal = (params) => service.get(URL_CONS.DEAL_CLOSE_URL, { params });

/**
 * 查询集团公司名称映射信息
 * @param {Object} params - 查询参数
 * @param {string} [params.headGroupName] - 总公司名称
 * @param {string} [params.gfasAccountNo] - GFAS账号
 * @param {string} [params.rmName] - RM名称
 * @param {string} [params.fundClass] - 基金类别
 * @param {string} [params.wiGroupName] - WI集团名称
 * @param {string} [params.isGlobalClient] - 是否全球客户 ('Y'/'N')
 * @param {number} [params.pageSize=20] - 每页记录数
 * @param {number} [params.pageNum=1] - 页码
 * @returns {Promise<Object>} 返回查询结果
 */
export const searchGroupCompany = (params) => service.get(URL_CONS.GROUP_COMPANY_SEARCH_URL, { params });