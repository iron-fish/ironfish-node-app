import { BoxKeyPair } from "@ironfish/rust-nodejs";
import {
  ALL_API_NAMESPACES,
  IronfishSdk,
  NodeUtils,
  PromiseResolve,
  PromiseUtils,
  RpcClient,
  RpcMemoryClient,
  getPackageFrom,
} from "@ironfish/sdk";

import packageJson from "../../../package.json";

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
  public rpcClient: RpcClient | null = null;
  private rpcClientPromise: Promise<RpcClient>;
  private rpcClientResolve: PromiseResolve<RpcClient>;

  constructor() {
    const [promise, resolve] = PromiseUtils.split<RpcClient>();
    this.rpcClientPromise = promise;
    this.rpcClientResolve = resolve;
  }

  getRpcClient(): Promise<RpcClient> {
    return this.rpcClientPromise;
  }

  async init() {
    console.log("Starting IronFish...");

    const sdk = await IronfishSdk.init({
      pkg: getPackageFrom(packageJson),
      configOverrides: {
        enableRpcTcp: true,
      },
    });

    const node = await sdk.node({
      privateIdentity: getPrivateIdentity(sdk),
      autoSeed: true,
    });

    await NodeUtils.waitForOpen(node);
    await node.rpc.start();

    this.rpcClient = new RpcMemoryClient(
      node.logger,
      node.rpc.getRouter(ALL_API_NAMESPACES),
    );

    this.rpcClientResolve(this.rpcClient);
  }
}

const ironfish = new Ironfish();

export { ironfish };
