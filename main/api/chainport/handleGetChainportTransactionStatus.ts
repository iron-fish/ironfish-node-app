import axios from "axios";

import { getChainportEndpoints } from "./utils/getChainportEndpoints";
import { ChainportTransactionStatus } from "../../../shared/chainport";

export async function handleGetChainportTransactionStatus(txHash: string) {
  const endpoints = await getChainportEndpoints();
  const url = `${endpoints.baseUrl}/api/port?base_tx_hash=${txHash}&base_network_id=22`;

  const response = await axios(url);
  const data = response.data as ChainportTransactionStatus;

  return data;
}
