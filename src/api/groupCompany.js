import URL_CONS from '../constants/url';
import { service } from '@/utils/httputil';
import axios from 'axios';

export const getProfile = () => service.get(URL_CONS.PROFILE_URL);

export const searchGroupCompany = (params) => service.post(URL_CONS.GROUP_COMPANY_FUZZY_SEARCH_URL, params);

export const queryUserByDepartments = (params) => service.get(URL_CONS.QUERY_USER_BY_DEPARTMENTS_URL, { params });

export const queryUserRole = () => service.get(URL_CONS.QUERY_USER_ROLE_URL);

export const queryImrReferenceByCategory = (params) => service.get(URL_CONS.QUERY_IMR_REFERENCE_BY_CATEGORY_URL, { params });

export const queryHeadGroup = (params) => service.post(URL_CONS.QUERY_HEAD_GROUP_URL, params);

export const queryWIGroup = (params) => service.post(URL_CONS.QUERY_WI_GROUP_URL, params);

export const queryWICustomizedGroup = (params) => service.post(URL_CONS.QUERY_WI_CUSTOMIZED_GROUP_URL, params);

export const queryGroupCompanyByCondition = (params) => service.post(URL_CONS.QUERY_GROUP_COMPANY_BY_CONDITION_URL, params);

export const addGroupCompanyMapping = (params) => service.post(URL_CONS.ADD_GROUP_COMPANY_MAPPING_URL, params);

export const saveGroupMapping = (params) => service.put(URL_CONS.SAVE_GROUP_MAPPING_URL, params);

export const removeGroupMapping = (mappingId) => service.delete(`${URL_CONS.REMOVE_GROUP_MAPPING_URL}?mappingId=${mappingId}`);