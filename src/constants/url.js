// 使用相对路径，依赖于代理配置
const URL_CONS = {
    PROFILE_URL: '/api/profile',
    DEAL_DICT_URL: '/api/deal-dict',
    SEARCH_DEAL_URL: '/api/search-deal',
    DEAL_DETAIL_URL: '/api/deal-detail',
    DEAL_PAYMENT_VERIFIED: 'caffe-web/dealing/api/deal-payment-verified',
    GROUP_COMPANY_FUZZY_SEARCH_URL: '/api/groupCompany/queryGroupCompanyNameMappingFuzzy',
    QUERY_USER_BY_DEPARTMENTS_URL: '/api/common/user/queryUserByDepartments',
    QUERY_USER_ROLE_URL: '/api/groupCompany/queryUserRole',
    QUERY_HEAD_GROUP_URL: '/api/groupCompany/headGroup/queryHeadGroupFuzzy',
    QUERY_IMR_REFERENCE_BY_CATEGORY_URL: '/api/groupCompany/queryImrReferenceByCategory',
    QUERY_WI_GROUP_URL: '/api/groupCompany/wiGroup/queryWIGroupFuzzy',
    QUERY_WI_CUSTOMIZED_GROUP_URL: '/api/groupCompany/wiCustomizedGroup/queryWICustomizedGroupFuzzy',
    QUERY_GFAS_ACCOUNT_NAME_URL: '/api/groupCompany/queryGfasAccountName',
    ADD_GROUP_COMPANY_MAPPING_URL: '/api/groupCompany/addGroupCompanyMapping',
    SAVE_GROUP_MAPPING_URL: '/api/groupCompany/saveGroupMapping',
    REMOVE_GROUP_MAPPING_URL: '/api/groupCompany/removeGroupMapping',
    
    // FeeLetterUpload 相关URL
    FEE_LETTER_SEARCH_URL: '/api/groupCompany/feeLetter/queryFeeLetterByCondition',
    FEE_LETTER_UPLOAD_URL: '/api/fee-letter/upload',
    FEE_LETTER_DOWNLOAD_URL: '/api/fee-letter/download',
    FEE_LETTER_DELETE_URL: '/api/fee-letter/delete',
    FEE_LETTER_UPDATE_URL: '/api/fee-letter/update'
}

export default URL_CONS;
