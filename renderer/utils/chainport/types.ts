export type MetaApiResponse = {
  maintenance: boolean;
  sorted_networks: Array<string>;
  cp_network_ids: Record<
    string,
    {
      minimum_confirmation: number;
      explorer_url: string;
      public_rpc: string;
      chainport_network_id: number;
      shortname: string;
      name: string;
      utils_contract: string | null;
      chain_id: number;
      label: string;
      blockchain_type: string;
      native_token_symbol: string;
      button_colour: string;
      network_icon: string;
      bridges: Record<string, string>;
    }
  >;
  abis: {
    Sdk: string;
    ChainportMainBridge: string;
    ChainportSideBridge: string;
    LifiBridge: string;
    ChainportUtils: string;
    UsdcMessageTransmitter: string;
    BridgeMintableTokenV2: string;
    ChainportFeeManager: string;
    UsdcBridge: string;
    StablesWrapper: string;
    StablesSwap: string;
    ChainportStableBridge: string;
    StablesStaking: string;
  };
  tvl: string;
  native_coins_usd_values: Record<string, number>;
  fee_manager: string;
  perpetual_contract: string;
  portx_addresses: Record<string, string>;
  stables_staking_contracts: Record<string, string>;
  stable_coins_usd_values: Record<string, number>;
  usdc_destination_domains: Record<string, number>;
  usdc_token_addresses_by_network: Record<string, string>;
  port_time_estimates_secs: Record<string, number>;
};

export type TokensApiResponse = {
  verified_tokens: Array<{
    decimals: number;
    id: number;
    name: string;
    pinned: boolean;
    web3_address: string;
    symbol: string;
    token_image: string;
    target_networks: Array<number>;
    chain_id: null;
    network_name: string;
    network_id: number;
    blockchain_type: string;
    is_stable: boolean;
    is_lifi: boolean;
  }>;
  blacklisted_addresses: Array<unknown>;
  tokens_exact_amount: Array<unknown>;
};
