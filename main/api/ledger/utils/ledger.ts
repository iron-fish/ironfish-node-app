import { TransportError } from "@ledgerhq/errors";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import IronfishApp, { IronfishKeys } from "@zondax/ledger-ironfish";

import { logger } from "../../ironfish/logger";

export const DERIVATION_PATH = "m/44'/1338'/0";
const OPEN_TIMEOUT = 3000;
const LISTEN_TIMEOUT = 3000;

const ERROR_TYPES = [
  "UNKNOWN_ERROR",
  "LEDGER_NOT_FOUND",
  "IRONFISH_NOT_OPEN",
  "CANNOT_OPEN_DEVICE",
  "OPERATION_ERROR",
];

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

type Transport = Awaited<ReturnType<typeof TransportNodeHid.create>>;

class LedgerManager {
  transport: Transport | null = null;
  DERIVATION_PATH = DERIVATION_PATH;

  private getTransport = async (): ManagerResponse<Transport> => {
    let error: unknown;

    try {
      const transport =
        this.transport ||
        (await TransportNodeHid.create(OPEN_TIMEOUT, LISTEN_TIMEOUT));

      this.transport = transport;

      return {
        status: "SUCCESS",
        data: transport,
        error: null,
      };
    } catch (err) {
      error = err;
      await this.disconnect();
    }

    if (
      error instanceof TransportError &&
      [
        TransportNodeHid.ErrorMessage_ListenTimeout,
        TransportNodeHid.ErrorMessage_NoDeviceFound,
      ].includes(error.id)
    ) {
      logger.error(`LEDGER_NOT_FOUND: ${error.message}`);

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

  private getIronfishApp = async (): ManagerResponse<IronfishApp> => {
    const transportResponse = await this.getTransport();

    if (transportResponse.status === "ERROR") {
      return transportResponse;
    }

    const transport = transportResponse.data;

    let app: IronfishApp | undefined;

    try {
      app = new IronfishApp(transport);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      logger.error(`IRONFISH_NOT_OPEN: ${message}`);
      return {
        status: "ERROR",
        data: null,
        error: {
          type: "IRONFISH_NOT_OPEN",
          message,
        },
      };
    }

    return {
      status: "SUCCESS",
      data: app,
      error: null,
    };
  };

  private disconnect = async () => {
    try {
      if (this.transport) {
        await this.transport.close();
        this.transport = null;
      }
    } catch (err) {
      logger.error(
        err instanceof Error
          ? err.message
          : "Failed to disconnect from transport",
      );
    }

    return true;
  };

  private doOperation = async <T>(
    operation: (app: IronfishApp) => T,
  ): ManagerResponse<Awaited<T>> => {
    const ironfishAppResult = await this.getIronfishApp();

    if (ironfishAppResult.status === "ERROR") {
      return ironfishAppResult;
    }

    let result: Awaited<T> | undefined;

    try {
      result = await operation(ironfishAppResult.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      logger.error(`OPERATION_ERROR: ${message}`);
      return {
        status: "ERROR",
        data: null,
        error: {
          type: "OPERATION_ERROR",
          message,
        },
      };
    }

    return {
      status: "SUCCESS",
      data: result,
      error: null,
    };
  };

  isLedgerConnected = async () => {
    const { status } = await this.doOperation(() => true);
    return status === "SUCCESS";
  };

  isLedgerUnlocked = async () => {
    const { status, data: isUnlocked } = await this.doOperation(async (app) => {
      const appInfo = await app.appInfo();
      return appInfo.returnCode !== 0x5515;
    });

    return status === "SUCCESS" && isUnlocked === true;
  };

  isIronfishAppOpen = async () => {
    const { status, data: isOpen } = await this.doOperation(async (app) => {
      const appInfo = await app.appInfo();
      return appInfo.appName === "Ironfish";
    });

    return status === "SUCCESS" && isOpen === true;
  };

  getPublicAddress = async () => {
    const result = await this.doOperation(async (app) => {
      const response = await app.retrieveKeys(
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
    });

    return result;
  };
}

export const ledgerManager = new LedgerManager();
