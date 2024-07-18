import { randomUUID } from "crypto";

import { TransportError } from "@ledgerhq/errors";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import IronfishApp, {
  IronfishKeys,
  ResponseAddress,
} from "@zondax/ledger-ironfish";

import { logger } from "../../ironfish/logger";

export const DERIVATION_PATH = "m/44'/1338'/0";
const IRONFISH_APP_NAME = "Ironfish";
const OPEN_TIMEOUT = 3000;
const LISTEN_TIMEOUT = 3000;
const POLL_INTERVAL = 1000;

const ERROR_TYPES = [
  "UNKNOWN_ERROR",
  "LEDGER_NOT_FOUND",
  "LEDGER_LOCKED",
  "IRONFISH_NOT_OPEN",
  "CANNOT_OPEN_DEVICE",
];

type Transport = Awaited<ReturnType<typeof TransportNodeHid.create>>;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type ConnectionStatus = {
  isLedgerConnected: boolean;
  isLedgerUnlocked: boolean;
  isIronfishAppOpen: boolean;
  publicAddress: string;
  deviceName: string;
};

type ManagerResponse<T> = Promise<
  | {
      status: "SUCCESS";
      data: T;
      error: null;
    }
  | {
      status: "ERROR";
      data: null;
      error: {
        type: (typeof ERROR_TYPES)[number];
        message: string;
      };
    }
>;

const EMPTY_CONNECTION_STATUS: ConnectionStatus = {
  isLedgerConnected: false,
  isLedgerUnlocked: false,
  isIronfishAppOpen: false,
  publicAddress: "",
  deviceName: "",
};

class LedgerManager {
  transport: Transport | null = null;

  subscribers: Map<string, (status: ConnectionStatus) => void> = new Map();
  connectionStatus: ConnectionStatus = { ...EMPTY_CONNECTION_STATUS };

  private connect = async (): ManagerResponse<Transport> => {
    let error: unknown;

    try {
      this.transport =
        this.transport ||
        (await TransportNodeHid.create(OPEN_TIMEOUT, LISTEN_TIMEOUT));

      return {
        status: "SUCCESS",
        data: this.transport,
        error: null,
      };
    } catch (err) {
      error = err;
      logger.debug("Disconnecting ledger");
      await this.disconnect();
    }

    if (
      error instanceof TransportError &&
      [
        TransportNodeHid.ErrorMessage_ListenTimeout,
        TransportNodeHid.ErrorMessage_NoDeviceFound,
      ].includes(error.id)
    ) {
      logger.debug(`LEDGER_NOT_FOUND: ${error.message}`);

      return {
        status: "ERROR",
        data: null,
        error: {
          type: "LEDGER_NOT_FOUND",
          message: error.message,
        },
      };
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    const errorType = message.includes("cannot open device")
      ? "CANNOT_OPEN_DEVICE"
      : "UNKNOWN_ERROR";

    logger.error(`${errorType}: ${message}`);

    return {
      status: "ERROR",
      data: null,
      error: {
        type: errorType,
        message,
      },
    };
  };

  private getIronfishApp = async (
    transport: Transport,
  ): ManagerResponse<IronfishApp> => {
    const app = new IronfishApp(transport);
    let appInfo: Awaited<ReturnType<IronfishApp["appInfo"]>> | null = null;
    let retries = 3;

    while (retries > 0 && appInfo?.appName !== IRONFISH_APP_NAME) {
      try {
        appInfo = await app.appInfo();

        if (appInfo.appName !== IRONFISH_APP_NAME) {
          console.log("Unable to open Ironfish app");
          console.log(appInfo);
          throw new Error(`Invalid app name: ${appInfo.appName}`);
        }
      } catch (err) {
        retries -= 1;
      }
    }

    if (app && appInfo?.appName === IRONFISH_APP_NAME) {
      return {
        status: "SUCCESS",
        data: app,
        error: null,
      };
    }

    await this.disconnect();

    return {
      status: "ERROR",
      data: null,
      error: {
        type:
          appInfo?.returnCode === 0x5515
            ? "LEDGER_LOCKED"
            : "IRONFISH_NOT_OPEN",
        message: `Failed to open Ironfish app. Latest app name: ${
          appInfo?.appName || "Unknown"
        }`,
      },
    };
  };

  private disconnect = async () => {
    try {
      if (this.transport) {
        await this.transport.close();
      }
      this.transport = null;
    } catch (err) {
      logger.error(
        err instanceof Error
          ? err.message
          : "Failed to disconnect from transport",
      );
    }

    return true;
  };

  private pollForStatus = async () => {
    const returnStatus = { ...EMPTY_CONNECTION_STATUS };

    try {
      const connectResponse = await this.connect();

      if (connectResponse.status !== "SUCCESS") {
        throw new Error(connectResponse.error.message);
      }

      const transport = connectResponse.data;
      const ironfishAppReponse = await this.getIronfishApp(transport);

      returnStatus.isLedgerConnected = true;
      returnStatus.isLedgerUnlocked =
        ironfishAppReponse.error?.type !== "LEDGER_LOCKED";
      returnStatus.isIronfishAppOpen = ironfishAppReponse.status === "SUCCESS";
      returnStatus.deviceName = transport.deviceModel?.productName ?? "";

      if (ironfishAppReponse.status === "SUCCESS") {
        const keyResponse: ResponseAddress =
          await ironfishAppReponse.data.retrieveKeys(
            DERIVATION_PATH,
            IronfishKeys.PublicAddress,
            false,
          );
        returnStatus.publicAddress = keyResponse.publicAddress
          ? keyResponse.publicAddress.toString("hex")
          : "";
      }
    } catch (err) {
      this.disconnect();
    } finally {
      await delay(POLL_INTERVAL);

      if (this.subscribers.size > 0) {
        for (const subscriber of this.subscribers.values()) {
          subscriber(returnStatus);
        }

        this.pollForStatus();
      }
    }
  };

  subscribe = (cb: (status: ConnectionStatus) => void) => {
    const id = randomUUID();
    this.subscribers.set(id, cb);

    // Start polling if this is the first subscriber
    if (this.subscribers.size === 1) {
      this.pollForStatus();
    }

    return id;
  };

  unsubscribe = (id: string) => {
    this.subscribers.delete(id);
  };
}

export const ledgerManager = new LedgerManager();
