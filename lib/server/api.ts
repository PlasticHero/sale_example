import axios from "axios";
import { BASE_URL } from "lib/define";

async function fetchData(url: string) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return null;
  }
}

export const api = {
  // /api/history?{user=유저지갑}&{offset=[페이지] 오프셋 인덱스 ( 0 : 첫페이지 )}&{limit=[페이지] 요청 수량 제한}
  user_info: async (address: string, offset: number, limit: number): Promise<{success: boolean, data: any}> => {
    const res = await fetchData(`${BASE_URL}/api/history?user=${address}&offset=${offset}&limit=${limit}`)
    return res;
  },

  tx_receipt: async (chain_id: number, txHash: string) => {
    const res = await fetchData(`${BASE_URL}/api/tx_receipt?chain_id=${chain_id}&tx_hash=${txHash}`)
    return res;
  },

  point_info: async (address: string, offset: number, limit: number): Promise<{success: boolean, data: any}> => {
    const res = await fetchData(`${BASE_URL}/api/point?user=${address}&offset=${offset}&limit=${limit}`)
    return res;
  },

}
