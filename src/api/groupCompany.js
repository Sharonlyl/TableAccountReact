import URL_CONS from '../constants/url';
import { service } from '@/utils/httputil';
import axios from 'axios';

export const getProfile = () => service.get(URL_CONS.PROFILE_URL);

export const searchGroupCompany = (params) => service.get(URL_CONS.GROUP_COMPANY_FUZZY_SEARCH_URL, { params });

export const queryUserByDepartments = (params) => service.get(URL_CONS.QUERY_USER_BY_DEPARTMENTS_URL, { params });

export const queryUserRole = () => service.get(URL_CONS.QUERY_USER_ROLE_URL);

export const querylmrReferenceByCategory = (params) => service.get(URL_CONS.QUERY_LMR_REFERENCE_BY_CATEGORY_URL, { params });

export const queryHeadGroup = (params) => service.post(URL_CONS.QUERY_HEAD_GROUP_URL, params);

export const queryWIGroup = (params) => service.post(URL_CONS.QUERY_WI_GROUP_URL, params);

export const queryWICustomizedGroup = (params) => service.post(URL_CONS.QUERY_WI_CUSTOMIZED_GROUP_URL, params);

export const queryGroupCompanyByCondition = (params) => service.post(URL_CONS.QUERY_GROUP_COMPANY_BY_CONDITION_URL, params);

export const addGroupCompanyMapping = (params) => service.post(URL_CONS.ADD_GROUP_COMPANY_MAPPING_URL, params);

export const updateGroupCompanyMapping = (params) => service.put(URL_CONS.UPDATE_GROUP_COMPANY_MAPPING_URL, params);