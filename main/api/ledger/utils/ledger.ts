import { randomUUID } from "crypto";

import { AccountFormat, encodeAccountImport } from "@ironfish/sdk";
import { TransportError } from "@ledgerhq/errors";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import IronfishApp, {
  IronfishKeys,
  ResponseAddress,
  ResponseViewKey,
  ResponseProofGenKey,
} from "@zondax/ledger-ironfish";
import { z } from "zod";

import { ledgerStore } from "../../../stores/ledgerStore";
import { handleImportAccount } from "../../accounts/handleImportAccount";
import { logger } from "../../ironfish/logger";
import { handleSendTransactionInput } from "../../transactions/handleSendTransaction";
import { PromiseQueue } from "../../utils/promiseQueue";
import { createUnsignedTransaction } from "../../utils/transactions";

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
  taskQueue = new PromiseQueue();

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
          logger.debug(
            `Unable to open Ironfish app. App info:\n\n${JSON.stringify(
              appInfo,
              null,
              2,
            )}\n`,
          );

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

  private pollForStatus = () => {
    this.taskQueue.enqueue(async () => {
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
        returnStatus.isIronfishAppOpen =
          ironfishAppReponse.status === "SUCCESS";
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
        if (this.subscribers.size > 0) {
          for (const subscriber of this.subscribers.values()) {
            subscriber(returnStatus);
          }

          await delay(POLL_INTERVAL);
          this.pollForStatus();
        }
      }
    });
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

  importAccount = async () => {
    const returnValue = await this.taskQueue.enqueue(async () => {
      try {
        const connectResponse = await this.connect();

        if (connectResponse.status !== "SUCCESS") {
          throw new Error(connectResponse.error.message);
        }

        const transport = connectResponse.data;
        const ironfishAppReponse = await this.getIronfishApp(transport);

        if (ironfishAppReponse.status !== "SUCCESS") {
          throw new Error(ironfishAppReponse.error.message);
        }

        const publicAddressResponse: ResponseAddress =
          await ironfishAppReponse.data.retrieveKeys(
            DERIVATION_PATH,
            IronfishKeys.PublicAddress,
            false,
          );

        if (!publicAddressResponse.publicAddress) {
          throw new Error("No public address returned");
        }

        const viewKeyResponse: ResponseViewKey =
          await ironfishAppReponse.data.retrieveKeys(
            DERIVATION_PATH,
            IronfishKeys.ViewKey,
            true,
          );

        if (
          !viewKeyResponse.viewKey ||
          !viewKeyResponse.ovk ||
          !viewKeyResponse.ivk
        ) {
          logger.debug(`No view key returned`);
          logger.debug(viewKeyResponse.returnCode.toString());
          throw new Error(viewKeyResponse.errorMessage);
        }

        const responsePGK: ResponseProofGenKey =
          await ironfishAppReponse.data.retrieveKeys(
            DERIVATION_PATH,
            IronfishKeys.ProofGenerationKey,
            false,
          );

        if (!responsePGK.ak || !responsePGK.nsk) {
          logger.debug(`No proof authorizing key returned`);
          throw new Error(responsePGK.errorMessage);
        }

        const accountName = transport.deviceModel?.productName ?? "Ledger";

        const publicAddress =
          publicAddressResponse.publicAddress.toString("hex");

        const accountImport = {
          version: 4, // ACCOUNT_SCHEMA_VERSION as of 2024-05
          name: accountName,
          viewKey: viewKeyResponse.viewKey.toString("hex"),
          incomingViewKey: viewKeyResponse.ivk.toString("hex"),
          outgoingViewKey: viewKeyResponse.ovk.toString("hex"),
          publicAddress,
          proofAuthorizingKey: responsePGK.nsk.toString("hex"),
          spendingKey: null,
          createdAt: null,
        };

        const encoded = encodeAccountImport(
          accountImport,
          AccountFormat.Base64Json,
        );

        await handleImportAccount({
          name: accountName,
          account: encoded,
        });
        await ledgerStore.setIsLedgerAccount(publicAddress, true);

        return accountImport;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to import account";
        logger.error(message);
        await this.disconnect();
        throw new Error(message);
      }
    });

    return returnValue;
  };

  submitTransaction = async ({
    fromAccount,
    toAccount,
    assetId,
    amount,
    fee,
    memo,
  }: z.infer<typeof handleSendTransactionInput>) => {
    const returnValue = await this.taskQueue.enqueue(async () => {
      try {
        const unsignedTransaction = await createUnsignedTransaction({
          fromAccount,
          toAccount,
          assetId,
          amount,
          fee,
          memo,
        });
        const unsignedTransactionBuffer = Buffer.from(
          unsignedTransaction,
          "hex",
        );

        if (unsignedTransactionBuffer.length > 16 * 1024) {
          throw new Error(
            "Transaction size is too large, must be less than 16kb.",
          );
        }

        const connectResponse = await this.connect();

        if (connectResponse.status !== "SUCCESS") {
          throw new Error(connectResponse.error.message);
        }

        const transport = connectResponse.data;
        const ironfishAppReponse = await this.getIronfishApp(transport);

        if (ironfishAppReponse.status !== "SUCCESS") {
          throw new Error(ironfishAppReponse.error.message);
        }

        const signResponse = await ironfishAppReponse.data.sign(
          DERIVATION_PATH,
          unsignedTransactionBuffer,
        );

        if (!signResponse.signature) {
          throw new Error(signResponse.errorMessage || "No signature returned");
        }

        const splitSignParams = {
          unsignedTransaction: unsignedTransactionBuffer,
          signature: signResponse.signature.toString("hex"),
        };

        // @todo: Sign and submit the transaction once addSignature is available from the RPC client
        return splitSignParams;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to import account";
        logger.error(message);
        await this.disconnect();
        throw new Error(message);
      }
    });

    return returnValue;
  };
}

export const ledgerManager = new LedgerManager();
