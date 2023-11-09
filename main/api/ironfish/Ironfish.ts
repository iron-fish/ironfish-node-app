import fsAsync from "fs/promises";

import {
  ALL_API_NAMESPACES,
  FullNode,
  PEER_STORE_FILE_NAME,
  IronfishSdk,
  NodeUtils,
  RpcClient,
  RpcMemoryClient,
  getPackageFrom,
} from "@ironfish/sdk";
import log from "electron-log";
import { v4 as uuid } from "uuid";

import { logger } from "./logger";
import packageJson from "../../../package.json";
import { SnapshotManager } from "../snapshot/snapshotManager";
import { SplitPromise, splitPromise } from "../utils";

export class Ironfish {
  public snapshotManager: SnapshotManager = new SnapshotManager();

  private rpcClientPromise: SplitPromise<RpcClient> = splitPromise();
  private sdkPromise: SplitPromise<IronfishSdk> = splitPromise();
  private fullNodePromise: SplitPromise<FullNode> = splitPromise();
  private _started: boolean = false;
  private _fullNode: FullNode | null = null;
  private _initialized: boolean = false;
  private _dataDir: string;

  constructor(dataDir: string) {
    this._dataDir = dataDir;
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

  fullNode(): Promise<FullNode> {
    return this.fullNodePromise.promise;
  }

  async downloadSnapshot(): Promise<void> {
    if (this._started) {
      throw new Error("Cannot download snapshot after node has started");
    }

    const sdk = await this.sdk();
    const node = await this.fullNode();
    await this.snapshotManager.run(sdk, node);
  }

  async init() {
    if (this._initialized) {
      return;
    }

    this._initialized = true;

    log.log("Initializing Iron Fish SDK...");

    const sdk = await IronfishSdk.init({
      dataDir: this._dataDir,
      logger: logger,
      pkg: getPackageFrom(packageJson),
      configOverrides: {
        databaseMigrate: true,
      },
    });

    const node = await sdk.node({
      privateIdentity: sdk.getPrivateIdentity(),
      autoSeed: true,
    });

    await NodeUtils.waitForOpen(node);

    const newSecretKey = Buffer.from(
      node.peerNetwork.localPeer.privateIdentity.secretKey,
    ).toString("hex");

    node.internal.set("networkIdentity", newSecretKey);
    await node.internal.save();

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
    this.fullNodePromise.resolve(node);
    this.rpcClientPromise.resolve(rpcClient);
  }

  async start() {
    if (this._started) {
      return;
    }

    log.log("Starting Iron Fish Node...");

    this._started = true;

    const node = await this.fullNode();
    await node.start();
  }

  async stop() {
    if (this._fullNode) {
      log.log("Stopping Iron Fish Node...");
      await this._fullNode.shutdown();
      await this._fullNode.closeDB();
      this._fullNode = null;
    }

    this._started = false;

    this._initialized = false;
    this.rpcClientPromise = splitPromise();
    this.sdkPromise = splitPromise();
  }

  async restart() {
    await this.stop();
    await this.init();
    await this.start();
  }

  async reset() {
    // Implementation references the CLI reset command:
    // https://github.com/iron-fish/ironfish/blob/master/ironfish-cli/src/commands/reset.ts
    let sdk = await this.sdk();

    const chainDatabasePath = sdk.config.chainDatabasePath;
    const hostFilePath: string = sdk.config.files.join(
      sdk.config.dataDir,
      PEER_STORE_FILE_NAME,
    );

    await this.stop();

    log.log("Deleting databases...");

    await Promise.all([
      fsAsync.rm(chainDatabasePath, { recursive: true, force: true }),
      fsAsync.rm(hostFilePath, { recursive: true, force: true }),
    ]);

    await this.init();
    sdk = await this.sdk();

    const node = await sdk.node();
    await node.openDB();

    await node.wallet.reset();

    await node.closeDB();

    log.log("Databases deleted successfully");

    await this.start();
  }
}
