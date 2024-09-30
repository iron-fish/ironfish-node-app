import { z } from "zod";

import type {
  ChainportNetwork,
  ChainportToken,
} from "../main/api/chainport/vendor/types";

type ZodTypeValue<Value, ZodType extends z.ZodType> = undefined extends Value
  ? null extends Value
    ? z.ZodNullableType<z.ZodOptionalType<ZodType>>
    : z.ZodOptionalType<ZodType> | z.ZodDefault<ZodType>
  : null extends Value
  ? z.ZodNullableType<ZodType>
  : ZodType;

type SameOutputAndInputShape<Output> = {
  [K in keyof Output]: ZodTypeValue<Output[K], z.ZodType<Output[K]>>;
};

type AnotherOutputAndInputShape<Output, Input> = {
  [K in keyof (Output | Input)]: ZodTypeValue<
    Input[K],
    z.ZodType<Output[K], z.ZodTypeDef, Input[K]>
  >;
};

// From https://github.com/colinhacks/zod/issues/372#issuecomment-2027574367
const createSchema = <Output, Input = null>(
  shape: Input extends null
    ? Required<SameOutputAndInputShape<Output>>
    : Required<AnotherOutputAndInputShape<Output, Input>>,
) => {
  return z.object(shape);
};

export const chainportNetworkSchema = createSchema<ChainportNetwork>({
  chainport_network_id: z.number(),
  explorer_url: z.string(),
  label: z.string(),
  network_icon: z.string(),
});

const chainportTokenSchema = createSchema<ChainportToken>({
  decimals: z.number(),
  id: z.number(),
  name: z.string(),
  pinned: z.boolean(),
  web3_address: z.string(),
  symbol: z.string(),
  token_image: z.string(),
  chain_id: z.number().nullable(),
  network_name: z.string(),
  network_id: z.number(),
  blockchain_type: z.string(),
  is_stable: z.boolean(),
  is_lifi: z.boolean(),
});

const TokensApiResponseSchema = z.array(chainportTokenSchema);
const TokenPathsApiResponseSchema = z.array(chainportNetworkSchema);

export function assertTokensApiResponse(data: unknown): ChainportToken[] {
  try {
    return TokensApiResponseSchema.parse(data);
  } catch (err) {
    throw new Error(`Chainport tokens data is not formatted correctly.

${err}
`);
  }
}

export function assertTokenPathsApiResponse(data: unknown): ChainportNetwork[] {
  try {
    return TokenPathsApiResponseSchema.parse(data);
  } catch (err) {
    throw new Error(`Chainport token paths data is not formatted correctly.

${err}
`);
  }
}
