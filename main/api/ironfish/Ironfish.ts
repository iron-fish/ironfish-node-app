import { BoxKeyPair } from "@ironfish/rust-nodejs";
import {
  ALL_API_NAMESPACES,
  IronfishSdk,
  NodeUtils,
  RpcClient,
  RpcMemoryClient,
  getPackageFrom,
} from "@ironfish/sdk";
import { v4 as uuid } from "uuid";

import packageJson from "../../../package.json";
import { SnapshotManager } from "../snapshot/snapshotManager";
import { SplitPromise, splitPromise } from "../utils";
import { logger } from "./logger";

function getPrivateIdentity(sdk: IronfishSdk) {
  const networkIdentity = sdk.internal.get("networkIdentity");
  if (
    !sdk.config.get("generateNewIdentity") &&
    networkIdentity !== undefined &&
    networkIdentity.length > 31
  ) {
    return BoxKeyPair.fromHex(networkIdentity);
  }
}

export class Ironfish {
  public snapshotManager: SnapshotManager = new SnapshotManager();

  private rpcClientPromise: SplitPromise<RpcClient> = splitPromise();
  private sdkPromise: SplitPromise<IronfishSdk> = splitPromise();
  private _started: boolean = false;
  private _initialized: boolean = false;
  private _dataDir: string;

  constructor(dataDir: string) {
    this._dataDir = dataDir;
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

    const sdk = await this.sdk();
    await this.snapshotManager.run(sdk);
  }

  async init() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;

    console.log("Initializing IronFish SDK...");

    const sdk = await IronfishSdk.init({
      dataDir: this._dataDir,
      logger: logger,
      pkg: getPackageFrom(packageJson),
    });

    this.sdkPromise.resolve(sdk);
  }

  async start() {
    if (this._started) {
      return;
    }
    this._started = true;

    if (this.snapshotManager.started) {
      await this.snapshotManager.result();
    }

    console.log("Starting IronFish Node...");

    const sdk = await this.sdk();
    const node = await sdk.node({
      privateIdentity: getPrivateIdentity(sdk),
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

    await node.start();

    const rpcClient = new RpcMemoryClient(
      node.logger,
      node.rpc.getRouter(ALL_API_NAMESPACES),
    );

    this.rpcClientPromise.resolve(rpcClient);
  }
}
