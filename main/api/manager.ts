import { RpcClient } from "@ironfish/sdk";

import { Ironfish } from "./ironfish/Ironfish";
import { userSettingsStore } from "../stores/userSettingsStore";

export type InitialState =
  | "onboarding"
  | "snapshot-download-prompt"
  | "start-node"
  | "encryption-not-supported";

export class Manager {
  private _ironfish: Ironfish | null = null;

  async getIronfish(): Promise<Ironfish> {
    if (this._ironfish) return this._ironfish;

    const networkId = await userSettingsStore.getSetting("networkId");

    this._ironfish = new Ironfish({
      networkId,
    });
    return this._ironfish;
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
