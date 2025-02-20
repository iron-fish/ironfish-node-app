import { RpcClient } from "@ironfish/sdk";
import log from "electron-log";

import { getExternalChainHead } from "./accounts/utils/getExternalChainHead";
import { Ironfish } from "./ironfish/Ironfish";
import { userSettingsStore } from "../stores/userSettingsStore";

export type InitialState =
  | "onboarding"
  | "snapshot-download-prompt"
  | "start-node"
  | "encryption-not-supported";

export class Manager {
  private _ironfish: Ironfish | null = null;
  private _externalChainHead?: { sequence: number; hash: string };

  async getIronfish(): Promise<Ironfish> {
    if (this._ironfish) return this._ironfish;

    const networkId = await userSettingsStore.getSetting("networkId");

    this._ironfish = new Ironfish({
      networkId,
    });
    return this._ironfish;
  }

  async getExternalChainHead(): Promise<
    { sequence: number; hash: string } | undefined
  > {
    const networkId = await userSettingsStore.getSetting("networkId");
    return getExternalChainHead(networkId);
  }

  async shouldDownloadSnapshot(): Promise<boolean> {
    const ironfish = await this.getIronfish();
    const rpcClient = await ironfish.rpcClient();
    return await this.isSnapshotStale(rpcClient);
  }

  private isSnapshotStale = async (rpcClient: RpcClient) => {
    const statusResponse = await rpcClient.node.getStatus();
    const headTimestamp = statusResponse.content.blockchain.headTimestamp;
    const hoursSinceLastBlock = (Date.now() - headTimestamp) / 1000 / 60 / 60;
    // If the last block was more than 2 weeks ago, prompt the user to download a snapshot
    return hoursSinceLastBlock > 24 * 7 * 2;
  };

  private async handleUnnamedAccounts(
    rpcClient: RpcClient,
    accountsResponse: { content: { accounts: string[] } },
  ) {
    // Create a set of existing account names and find unnamed accounts in one pass
    const existingNames = new Set<string>();
    const unnamedAccounts = accountsResponse.content.accounts.filter(
      (account) => {
        existingNames.add(account);
        if (account.trim()) {
          return false;
        }
        return true;
      },
    );

    // Handle each unnamed account sequentially
    for (const account of unnamedAccounts) {
      const publicKey = await rpcClient.wallet.getAccountPublicKey({
        account,
      });
      const accountAddress = publicKey.content.publicKey;
      let newName = `account-${accountAddress.slice(0, 4)}`;
      try {
        const MAX_ATTEMPTS = 5;
        let attempts = 0;
        while (existingNames.has(newName) && attempts < MAX_ATTEMPTS) {
          const randomString = `-${Math.floor(Math.random() * 100000)
            .toString()
            .padStart(5, "0")}`;
          newName = `${newName}${randomString}`;
          attempts++;
        }

        if (attempts === MAX_ATTEMPTS && existingNames.has(newName)) {
          const errorMsg =
            "Could not generate unique account name after maximum attempts";
          log.error(errorMsg);
          throw new Error(errorMsg);
        }

        existingNames.add(newName); // Add the new name to the set
        await rpcClient.wallet.renameAccount({
          account,
          newName,
        });
      } catch (error) {
        log.error(`Failed to rename account ${accountAddress}: ${error}`);
      }
    }
  }

  async getInitialState(): Promise<InitialState> {
    const ironfish = await this.getIronfish();

    if (!ironfish.isStarted()) {
      await ironfish.init();
    }

    const rpcClient = await ironfish.rpcClient();

    const walletStatus = await rpcClient.wallet.getAccountsStatus();
    if (walletStatus.content.encrypted) {
      return "encryption-not-supported";
    }

    const accountsResponse = await rpcClient.wallet.getAccounts();

    // Pass accountsResponse to handleUnnamedAccounts
    await this.handleUnnamedAccounts(rpcClient, accountsResponse);

    if (accountsResponse.content.accounts.length === 0) {
      return "onboarding";
    }

    const shouldDownloadSnapshot = await this.isSnapshotStale(rpcClient);

    if (shouldDownloadSnapshot) {
      return "snapshot-download-prompt";
    }

    return "start-node";
  }
}

export const manager = new Manager();
