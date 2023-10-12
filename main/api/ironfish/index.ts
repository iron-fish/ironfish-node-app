import { BoxKeyPair } from "@ironfish/rust-nodejs";
import {
  ALL_API_NAMESPACES,
  IronfishSdk,
  NodeUtils,
  RpcClient,
  RpcMemoryClient,
  getPackageFrom,
} from "@ironfish/sdk";

import packageJson from "../../../package.json";
import { SnapshotManager } from "../snapshot/snapshotManager";
import { SplitPromise, splitPromise } from "../utils";

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

class Ironfish {
  public snapshotManager: SnapshotManager = new SnapshotManager();

  private rpcClientPromise: SplitPromise<RpcClient> = splitPromise();
  private sdkPromise: SplitPromise<IronfishSdk> = splitPromise();
  private _started: boolean = false;
  private _initialized: boolean = false;

  rpcClient(): Promise<RpcClient> {
    return this.rpcClientPromise.promise;
  }

  sdk(): Promise<IronfishSdk> {
    return this.sdkPromise.promise;
  }

  async downloadSnapshot(): Promise<void> {
    if(this._started) {
      throw new Error("Cannot download snapshot after node has started")
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
      pkg: getPackageFrom(packageJson),
      configOverrides: {
        enableRpcTcp: true,
      },
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
    await node.rpc.start();

    node.internal.set("isFirstRun", false);

    const rpcClient = new RpcMemoryClient(
      node.logger,
      node.rpc.getRouter(ALL_API_NAMESPACES),
    );

    this.rpcClientPromise.resolve(rpcClient);
  }
}

const ironfish = new Ironfish();

export { ironfish };
