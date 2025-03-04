// 后端服务的基础URL - 使用相对路径避免CORS问题
// const BASE_URL = 'http://127.0.0.1:8000';

// 使用相对路径，依赖于代理配置
const URL_CONS = {
    PROFILE_URL: '/api/profile',
    DEAL_DICT_URL: '/api/deal-dict',
    SEARCH_DEAL_URL: '/api/search-deal',
    DEAL_DETAIL_URL: '/api/deal-detail',
    DEAL_PAYMENT_VERIFIED: 'caffe-web/dealing/api/deal-payment-verified',
    GROUP_COMPANY_FUZZY_SEARCH_URL: '/api/groupCompany/queryGroupCompanyNameMappingFuzzy'
}

export default URL_CONS;
