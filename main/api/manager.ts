import { AddressBookStorage } from "./address-book/v1/AddressBookStorage";
import { Ironfish } from "./ironfish/Ironfish";
import {
  UserSettingsStore,
  loadUserSettings,
} from "./user-settings/userSettings";

export type InitialState =
  | "onboarding"
  | "snapshot-download-prompt"
  | "start-node";

export class Manager {
  private _userSettings: UserSettingsStore | null = null;
  private _ironfish: Ironfish | null = null;
  private _initialState: InitialState | null = null;
  public v1AddressBook: AddressBookStorage = new AddressBookStorage();

  async getUserSettings(): Promise<UserSettingsStore> {
    if (this._userSettings) return this._userSettings;

    this._userSettings = await loadUserSettings();
    return this._userSettings;
  }

  async getIronfish(): Promise<Ironfish> {
    if (this._ironfish) return this._ironfish;

    const userSettings = await this.getUserSettings();
    const dataDir = userSettings.get("dataDir");
    this._ironfish = new Ironfish(dataDir);
    return this._ironfish;
  }

  async getInitialState(): Promise<InitialState> {
    if (this._initialState) return this._initialState;

    const ironfish = await this.getIronfish();
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
