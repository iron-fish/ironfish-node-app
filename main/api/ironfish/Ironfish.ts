import fsAsync from "fs/promises";

import {
  ALL_API_NAMESPACES,
  DEFAULT_DATA_DIR,
  DatabaseIsLockedError,
  FullNode,
  IronfishSdk,
  NodeFileProvider,
  PEER_STORE_FILE_NAME,
  RpcClient,
  RpcMemoryClient,
  getPackageFrom,
} from "@ironfish/sdk";
import log from "electron-log";
import { v4 as uuid } from "uuid";

import { logger } from "./logger";
import packageJson from "../../../package.json";
import { userSettingsStore } from "../../stores/userSettingsStore";
import { SnapshotManager } from "../snapshot/snapshotManager";
import { SplitPromise, splitPromise } from "../utils";

export class Ironfish {
  public snapshotManager: SnapshotManager = new SnapshotManager();

  private rpcClientPromise: SplitPromise<RpcClient> = splitPromise();
  private sdkPromise: SplitPromise<IronfishSdk> = splitPromise();
  private _started: boolean = false;
  private _fullNode: FullNode | null = null;
  private _initialized: boolean = false;
  private _networkId: number;

  constructor({ networkId }: { networkId: number }) {
    this._networkId = networkId;
  }

  private async constructSdk() {
    const dataDir = await this.getDataDir();
    return await IronfishSdk.init({
      dataDir,
      logger: logger,
      pkg: getPackageFrom(packageJson),
      configOverrides: {
        databaseMigrate: true,
      },
      internalOverrides: {
        networkId: this._networkId,
      },
    });
  }

  private async getDataDir() {
    const fileSystem = new NodeFileProvider();
    await fileSystem.init();
    const path = fileSystem.resolve(DEFAULT_DATA_DIR);

    return this._networkId === 0 ? path + "-testnet" : path;
  }

  private constructNode(sdk: IronfishSdk) {
    return sdk.node({
      privateIdentity: sdk.getPrivateIdentity(),
      autoSeed: true,
      networkId: this._networkId,
    });
  }

  isStarted(): boolean {
    return this._started;
  }

  rpcClient(): Promise<RpcClient> {
    return this.rpcClientPromise.promise;
  }

  sdk(): Promise<IronfishSdk> {
    return this.sdkPromise.promise;
  }

  async downloadSnapshot(): Promise<void> {
    if (this._started) {
      throw new Error("Cannot download snapshot after node has started");
    }

    if (!this._fullNode) {
      throw new Error("Node not initialized");
    }

    const sdk = await this.sdk();
    const node = this._fullNode;
    await this.snapshotManager.run(sdk, node);
  }

  async init() {
    if (this._initialized) {
      return;
    }

    this._initialized = true;

    try {
      log.log("Initializing Iron Fish SDK...");

      const sdk = await this.constructSdk();
      const node = await this.constructNode(sdk);

      this._fullNode = node;

      if (!node.started) {
        try {
          await node.openDB();
        } catch (err) {
          if (err instanceof DatabaseIsLockedError) {
            throw new Error(
              "Another instance of Iron Fish is already running. Please close it and try again.",
            );
          } else {
            throw err;
          }
        }
      }

      if (node.internal.get("isFirstRun")) {
        node.internal.set("isFirstRun", false);
        node.internal.set("telemetryNodeId", uuid());
        await node.internal.save();
      }

      const rpcClient = new RpcMemoryClient(
        node.logger,
        node.rpc.getRouter(ALL_API_NAMESPACES),
      );

      this.sdkPromise.resolve(sdk);
      this.rpcClientPromise.resolve(rpcClient);
    } catch (e) {
      log.log(e);
      this._initialized = false;
      throw e;
    }
  }

  async start() {
    if (this._started) {
      return;
    }

    if (!this._fullNode) {
      throw new Error("Node not initialized");
    }

    try {
      log.log("Starting Iron Fish Node...");

      this._started = true;

      await this._fullNode.start();
      log.log("Started Iron Fish Node.");
    } catch (e) {
      log.log(e);
    }
  }

  async stop() {
    if (this._fullNode) {
      log.log("Stopping Iron Fish Node...");
      await this._fullNode.shutdown();
      await this._fullNode.closeDB();
    }

    this._started = false;
    this._initialized = false;

    this.rpcClientPromise = splitPromise();
    this.sdkPromise = splitPromise();
  }

  async changeNetwork(networkId: number) {
    if (this._networkId === networkId) {
      return;
    }

    await this.stop();

    this._networkId = networkId;

    await userSettingsStore.setSettings({
      networkId,
    });

    await this.init();
  }

  async restart() {
    await this.stop();
    await this.init();
    await this.start();
  }

  async reset() {
    // Implementation references the CLI reset command:
    // https://github.com/iron-fish/ironfish/blob/master/ironfish-cli/src/commands/reset.ts
    let sdk = this._initialized ? await this.sdk() : await this.constructSdk();

    const chainDatabasePath = sdk.config.chainDatabasePath;
    const peerStoreFilePath: string = sdk.config.files.join(
      sdk.config.dataDir,
      PEER_STORE_FILE_NAME,
    );

    await this.stop();

    log.log("Deleting databases...");

    await Promise.all([
      fsAsync.rm(chainDatabasePath, { recursive: true, force: true }),
      fsAsync.rm(peerStoreFilePath, { recursive: true, force: true }),
    ]);

    sdk = await this.constructSdk();
    const node = await this.constructNode(sdk);

    await node.wallet.open();
    await node.wallet.reset();
    await node.shutdown();
    await node.closeDB();

    log.log("Databases deleted successfully");

    await this.init();
  }
}
