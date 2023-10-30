import { AddressBookStorage } from "./address-book/v1/AddressBookStorage";
import { Ironfish } from "./ironfish/Ironfish";
import {
  UserSettingsStore,
  loadUserSettings,
} from "./user-settings/userSettings";

export type InitialState =
  | "create-account"
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
    const sdk = await ironfish.sdk();

    if (sdk.internal.get("isFirstRun")) {
      this._initialState = "snapshot-download-prompt";
    } else {
      this._initialState = "start-node";
    }

    return this._initialState;
  }
}

export const manager = new Manager();
