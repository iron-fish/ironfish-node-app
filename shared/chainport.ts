import { z } from "zod";

export type ChainportToken = {
  chainportId: number;
  ironfishId: string;
  symbol: string;
  name: string;
  decimals: number;
  targetNetworks: {
    chainportNetworkId: number;
    chainId: number | null;
    value: string;
    label: string;
    networkIcon: string;
  }[];
};

export type ChainportTargetNetwork = {
  chainportNetworkId: number;
  label: string;
  networkIcon: string;
  chainId: number | null;
  value: string;
};

const MetadataApiResponseSchema = z.object({
  maintenance: z.boolean(),
  sorted_networks: z.array(z.string()),
  cp_network_ids: z.record(
    z.object({
      minimum_confirmation: z.number().nullable(),
      explorer_url: z.string(),
      public_rpc: z.string().nullable(),
      chainport_network_id: z.number(),
      shortname: z.string(),
      name: z.string(),
      utils_contract: z.union([z.string(), z.null()]),
      chain_id: z.number().nullable(),
      label: z.string(),
      blockchain_type: z.string(),
      native_token_symbol: z.string(),
      button_colour: z.string(),
      network_icon: z.string(),
      bridges: z.record(z.string()),
    }),
  ),
  abis: z.object({
    Sdk: z.string(),
    ChainportMainBridge: z.string(),
    ChainportSideBridge: z.string(),
    LifiBridge: z.string(),
    ChainportUtils: z.string(),
    UsdcMessageTransmitter: z.string(),
    BridgeMintableTokenV2: z.string(),
    ChainportFeeManager: z.string(),
    UsdcBridge: z.string(),
    StablesWrapper: z.string(),
    StablesSwap: z.string(),
    ChainportStableBridge: z.string(),
    StablesStaking: z.string(),
  }),
  tvl: z.string(),
  native_coins_usd_values: z.record(z.number()),
  fee_manager: z.string(),
  perpetual_contract: z.string(),
  portx_addresses: z.record(z.string()),
  stables_staking_contracts: z.record(z.string()),
  stable_coins_usd_values: z.record(z.number()),
  usdc_destination_domains: z.record(z.number()),
  usdc_token_addresses_by_network: z.record(z.string()),
  port_time_estimates_secs: z.record(z.number()),
});

export type MetaApiResponse = z.infer<typeof MetadataApiResponseSchema>;

export function assertMetadataApiResponse(data: unknown): MetaApiResponse {
  try {
    return MetadataApiResponseSchema.parse(data);
  } catch (err) {
    throw new Error(`Chainport metadata is not formatted correctly

${err}
`);
  }
}

const TokensApiResponseSchema = z.object({
  verified_tokens: z.array(
    z.object({
      decimals: z.number(),
      id: z.number(),
      name: z.string(),
      pinned: z.boolean(),
      web3_address: z.string(),
      symbol: z.string(),
      token_image: z.string(),
      target_networks: z.array(z.number()),
      chain_id: z.null(),
      network_name: z.string(),
      network_id: z.number(),
      blockchain_type: z.string(),
      is_stable: z.boolean(),
      is_lifi: z.boolean(),
    }),
  ),
  blacklisted_addresses: z.array(z.string()),
  tokens_exact_amount: z.array(z.unknown()).optional(),
});

export type TokensApiResponse = z.infer<typeof TokensApiResponseSchema>;

export function assertTokensApiResponse(data: unknown): TokensApiResponse {
  try {
    return TokensApiResponseSchema.parse(data);
  } catch (err) {
    throw new Error(`Chainport tokens data is not formatted correctly.

${err}
`);
  }
}

export type ChainportBridgeTransaction = {
  bridge_output: {
    publicAddress: string;
    amount: string;
    memoHex: string;
    assetId: string;
  };
  gas_fee_output: {
    publicAddress: string;
    amount: string;
    memo: string;
  };
  bridge_fee: {
    source_token_fee_amount: number | null;
    portx_fee_amount: number;
    is_portx_fee_payment: boolean;
  };
};

export type ChainportTransactionStatus = {
  base_network_id?: number;
  base_tx_hash?: string;
  base_tx_status?: number;
  base_token_address?: string;
  target_network_id?: number;
  target_tx_hash?: string;
  target_tx_status?: number;
  target_token_address?: string;
  created_at?: string;
  port_in_ack?: boolean;
};
