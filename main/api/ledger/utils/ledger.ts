import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import IronfishApp, { IronfishKeys } from "@zondax/ledger-ironfish";

import { logger } from "../../ironfish/logger";

export const DERIVATION_PATH = "m/44'/1338'/0";
const OPEN_TIMEOUT = 3000;
const LISTEN_TIMEOUT = 3000;

let cachedApp: IronfishApp | null = null;

class LedgerManager {
  app: IronfishApp | null = null;
  DERIVATION_PATH = DERIVATION_PATH;

  connect = async () => {
    if (cachedApp) {
      return cachedApp;
    }

    const transport = await TransportNodeHid.create(
      OPEN_TIMEOUT,
      LISTEN_TIMEOUT,
    );

    const app = new IronfishApp(transport);

    const appInfo = await app.appInfo();

    const appName = appInfo.appName ?? "App name not found";
    logger.debug(appName);

    if (appName !== "Ironfish") {
      logger.debug(appName);
      logger.debug(appInfo.returnCode.toString());
      logger.debug(appInfo.errorMessage.toString());
      throw new Error(
        "Invalid app name. Please open the Iron Fish app on your ledger device.",
      );
    }

    if (appInfo.appVersion) {
      logger.debug(`Ironfish App Version: ${appInfo.appVersion}`);
    }

    cachedApp = app;
    return app;
  };

  disconnect = async () => {
    if (this.app) {
      await this.app.transport.close();
      this.app = null;
    }

    return true;
  };

  getPublicAddress = async () => {
    if (!this.app) {
      throw new Error("App not connected");
    }

    const response = await this.app.retrieveKeys(
      DERIVATION_PATH,
      IronfishKeys.PublicAddress,
      false,
    );

    const publicAddress =
      "publicAddress" in response ? response.publicAddress : null;

    if (!publicAddress) {
      logger.debug(`Failed to retrieve public address`);
      logger.debug(response.returnCode.toString());
      throw new Error(response.errorMessage);
    }

    return publicAddress.toString("hex");
  };
}

export const ledgerManager = new LedgerManager();
