
export const IS_MAINNET = process.env.NEXT_PUBLIC_CHAIN_MAINNET === 'true' ? true : false
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://babi-api.logbrix.ai'
export const USER_HISTORY_PAGING_LIMIT = 5;
