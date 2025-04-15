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
    
    // Head Group管理相关URL
    ADD_HEAD_GROUP_URL: '/api/groupCompany/headGroup/addHeadGroup',
    SAVE_HEAD_GROUP_URL: '/api/groupCompany/headGroup/saveHeadGroup',
    REMOVE_HEAD_GROUP_URL: '/api/groupCompany/headGroup/removeHeadGroup',
    
    // WI Group管理相关URL
    ADD_WI_GROUP_URL: '/api/groupCompany/wiGroup/addWIGroup',
    SAVE_WI_GROUP_URL: '/api/groupCompany/wiGroup/saveWIGroup',
    REMOVE_WI_GROUP_URL: '/api/groupCompany/wiGroup/removeWIGroup',
    
    // WI Customized Group管理相关URL
    ADD_WI_CUSTOMIZED_GROUP_URL: '/api/groupCompany/wiCustomizedGroup/addWICustomizedGroup',
    SAVE_WI_CUSTOMIZED_GROUP_URL: '/api/groupCompany/wiCustomizedGroup/saveWICustomizedGroup',
    REMOVE_WI_CUSTOMIZED_GROUP_URL: '/api/groupCompany/wiCustomizedGroup/removeWICustomizedGroup',
    
    // FeeLetterUpload 相关URL
    FEE_LETTER_SEARCH_URL: '/api/groupCompany/feeLetter/queryFeeLetterByCondition',
    FEE_LETTER_UPLOAD_URL: '/api/groupCompany/feeLetter/uploadFeeLetter',
    FEE_LETTER_DOWNLOAD_URL: '/api/groupCompany/feeLetter/downloadFileByLetterId',
    FEE_LETTER_DELETE_URL: '/api/groupCompany/feeLetter/removeByLetterId',
    
    // AuditLog 相关URL
    AUDIT_LOG_SEARCH_URL: '/api/groupCompany/auditLog/mappingAuditLog'
}

export default URL_CONS;
