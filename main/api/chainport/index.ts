import log from "electron-log/main";
import { z } from "zod";

import {
  handleSendChainportBridgeTransaction,
  handleSendChainportBridgeTransactionInput,
} from "./handleSendChainportBridgeTransaction";
import {
  fetchChainportBridgeTransaction,
  fetchChainportNetworks,
  fetchChainportTokenPaths,
  fetchChainportTokens,
  fetchChainportTransactionStatus,
} from "./vendor/requests";
import { ChainportTokenWithNetwork } from "./vendor/types";
import {
  assertTokenPathsApiResponse,
  assertTokensApiResponse,
} from "../../../shared/chainport";
import { manager } from "../manager";
import { t } from "../trpc";

export const chainportRouter = t.router({
  getChainportTokens: t.procedure.query(async () => {
    const ironfish = await manager.getIronfish();
    const rpcClient = await ironfish.rpcClient();
    const network = await rpcClient.chain.getNetworkInfo();

    try {
      const tokensResponse = await fetchChainportTokens(
        network.content.networkId,
      );
      const tokensData = assertTokensApiResponse(tokensResponse);

      return {
        chainportTokensMap: Object.fromEntries(
          tokensData.map((token) => [token.web3_address, token]),
        ),
      };
    } catch (err) {
      log.error(`Failed to fetch Chainport tokens data.

${err}
`);
      throw err;
    }
  }),
  getChainportTokenPaths: t.procedure
    .input(
      z.object({
        tokenId: z.number(),
      }),
    )
    .query(
      async (
        opts,
      ): Promise<{ chainportTokenPaths: ChainportTokenWithNetwork[] }> => {
        const ironfish = await manager.getIronfish();
        const rpcClient = await ironfish.rpcClient();
        const network = await rpcClient.chain.getNetworkInfo();

        try {
          const tokenPathsResponse = await fetchChainportTokenPaths(
            network.content.networkId,
            opts.input.tokenId,
          );
          const tokenPathsData =
            assertTokenPathsApiResponse(tokenPathsResponse);

          return {
            chainportTokenPaths: tokenPathsData,
          };
        } catch (err) {
          log.error(`Failed to fetch Chainport token paths data.

${err}
`);
          throw err;
        }
      },
    ),
  getChainportBridgeTransactionDetails: t.procedure
    .input(
      z.object({
        amount: z.string(),
        assetId: z.string(),
        to: z.string(),
        selectedNetwork: z.number(),
        fromAccount: z.string(),
      }),
    )
    .query(async (opts) => {
      const ironfish = await manager.getIronfish();
      const rpcClient = await ironfish.rpcClient();
      const network = await rpcClient.chain.getNetworkInfo();

      const { amount, assetId, to, selectedNetwork, fromAccount } = opts.input;
      const publicAddressResponse = await rpcClient.wallet.getAccountPublicKey({
        account: fromAccount,
      });
      const sourceAddress = publicAddressResponse.content.publicKey;
      try {
        return await fetchChainportBridgeTransaction(
          network.content.networkId,
          BigInt(amount),
          assetId,
          selectedNetwork,
          to,
          sourceAddress,
        );
      } catch (err) {
        log.error(`Failed to fetch Chainport bridge transaction details.

${err}
`);
        throw err;
      }
    }),
  sendChainportBridgeTransaction: t.procedure
    .input(handleSendChainportBridgeTransactionInput)
    .mutation(async (opts) => {
      const result = await handleSendChainportBridgeTransaction(opts.input);
      return result;
    }),
  getChainportTransactionStatus: t.procedure
    .input(
      z.object({
        transactionHash: z.string(),
      }),
    )
    .query(async (opts) => {
      const ironfish = await manager.getIronfish();
      const rpcClient = await ironfish.rpcClient();
      const network = await rpcClient.chain.getNetworkInfo();

      return await fetchChainportTransactionStatus(
        network.content.networkId,
        opts.input.transactionHash,
      );
    }),
  getChainportNetworks: t.procedure.query(async () => {
    const ironfish = await manager.getIronfish();
    const rpcClient = await ironfish.rpcClient();
    const network = await rpcClient.chain.getNetworkInfo();

    return await fetchChainportNetworks(network.content.networkId);
  }),
});
