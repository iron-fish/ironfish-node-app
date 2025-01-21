import { RpcClient } from "@ironfish/sdk";
import log from "electron-log";

import { getAccount } from "./accounts/utils/getAccount";
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

  private async handleUnnamedAccounts(rpcClient: RpcClient) {
    const accountsResponse = await rpcClient.wallet.getAccounts();
    const fullAccounts = await Promise.all(
      accountsResponse.content.accounts.map((account) => getAccount(account)),
    );

    // Create a set of existing account names and find unnamed accounts in one pass
    const existingNames = new Set<string>();
    const unnamedAccounts = fullAccounts.filter((account) => {
      const trimmedName = account.name.trim();
      if (trimmedName) {
        existingNames.add(trimmedName);
        return false;
      }
      return true;
    });

    await Promise.all(
      unnamedAccounts.map(async (account) => {
        let newName = `account-${account.address.slice(0, 4)}`;
        try {
          const MAX_ATTEMPTS = 5;
          let attempts = 0;
          let randomString = "-";
          while (existingNames.has(newName) && attempts < MAX_ATTEMPTS) {
            const randomNum = Math.floor(Math.random() * 10); // 0-9
            randomString = `${randomString}${randomNum}`;
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
            account: account.name,
            newName,
          });
        } catch (error) {
          log.error(`Failed to rename account ${account.address}: ${error}`);
        }
      }),
    );
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

    // Checks if any accounts are unnamed and renames them
    await this.handleUnnamedAccounts(rpcClient);

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
