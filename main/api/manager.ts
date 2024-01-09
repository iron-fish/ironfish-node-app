import { Ironfish } from "./ironfish/Ironfish";
import { getUserSettings } from "./user-settings/userSettings";

export type InitialState =
  | "onboarding"
  | "snapshot-download-prompt"
  | "start-node";

export class Manager {
  private _ironfish: Ironfish | null = null;
  private _initialState: InitialState | null = null;

  async getIronfish(): Promise<Ironfish> {
    if (this._ironfish) return this._ironfish;

    const userSettings = await getUserSettings();
    const dataDir = userSettings.get("dataDir");
    this._ironfish = new Ironfish(dataDir);
    return this._ironfish;
  }

  async getInitialState(): Promise<InitialState> {
    if (this._initialState) return this._initialState;

    const ironfish = await this.getIronfish();

    if (!ironfish.isStarted()) {
      await ironfish.init();
    }

    const rpcClient = await ironfish.rpcClient();

    const accountsResponse = await rpcClient.wallet.getAccounts();

    if (accountsResponse.content.accounts.length === 0) {
      return "onboarding";
    }

    const statusResponse = await rpcClient.node.getStatus();
    const headTimestamp = statusResponse.content.blockchain.headTimestamp;
    const hoursSinceLastBlock = (Date.now() - headTimestamp) / 1000 / 60 / 60;

    // If the last block was more than 2 weeks ago, prompt the user to download a snapshot
    if (hoursSinceLastBlock > 24 * 7 * 2) {
      return "snapshot-download-prompt";
    }

    return "start-node";
  }
}

export const manager = new Manager();
