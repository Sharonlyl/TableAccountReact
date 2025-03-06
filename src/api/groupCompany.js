import URL_CONS from '../constants/url';
import { service } from '@/utils/httputil';
import axios from 'axios';

export const getProfile = () => service.get(URL_CONS.PROFILE_URL);
export const getDealDict = () => service.get(URL_CONS.DEAL_DICT_URL);

export const searchDealList = (params) => service.post(URL_CONS.SEARCH_DEAL_URL, params);

// export const login = (params) => service.post(URL_CONS.LOGIN_URL, params);

export const getDealDetail = (params) => service.get(URL_CONS.DEAL_DETAIL_URL, { params });

// export const savePaymentVerified = (params) => service.get(URL_CONS.DEAL_PAYMENT_VERIFIED, { params });

export const resubmitDeal = (params) => service.get(URL_CONS.DEAL_RESUBMIT_URL, { params });

export const closeDeal = (params) => service.get(URL_CONS.DEAL_CLOSE_URL, { params });

export const searchGroupCompany = (params) => service.get(URL_CONS.GROUP_COMPANY_SEARCH_URL, { params });

export const queryUserByDepartments = (params) => service.get(URL_CONS.QUERY_USER_BY_DEPARTMENTS_URL, { params });

export const queryUserRole = () => service.get(URL_CONS.QUERY_USER_ROLE_URL);