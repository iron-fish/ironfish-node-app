import { randomUUID } from "crypto";

import { AccountFormat, encodeAccountImport } from "@ironfish/sdk";
import { TransportError } from "@ledgerhq/errors";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import IronfishApp, {
  IronfishKeys,
  ResponseAddress,
  ResponseViewKey,
  ResponseProofGenKey,
  ResponseSign,
  KeyResponse,
} from "@zondax/ledger-ironfish";
import { z } from "zod";

import { ledgerStore } from "../../../stores/ledgerStore";
import { handleImportAccount } from "../../accounts/handleImportAccount";
import { logger } from "../../ironfish/logger";
import { manager } from "../../manager";
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

type ResponseError = {
  returnCode: number;
  errorMessage: string;
};

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
  signTransactionPromise: Promise<ResponseSign> | null = null;
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
    let error: string = "UNKNOWN_ERROR";

    while (
      retries > 0 &&
      (appInfo === null || appInfo?.appName !== IRONFISH_APP_NAME)
    ) {
      retries--;

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
        if (isResponseError(err)) {
          logger.debug(
            `Ledger ResponseError returnCode: ${err.returnCode.toString(16)}`,
          );
          if (err.returnCode === LedgerDeviceLockedError.returnCode) {
            error = "LEDGER_LOCKED";
          } else {
            error = "IRONFISH_NOT_OPEN";
          }
        }
        throw err;
      }

      if (app && appInfo?.appName === IRONFISH_APP_NAME) {
        return {
          status: "SUCCESS",
          data: app,
          error: null,
        };
      }
    }

    await this.disconnect();
    return {
      status: "ERROR",
      data: null,
      error: {
        type: error,
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
          const keyResponse = await ironfishAppReponse.data.retrieveKeys(
            DERIVATION_PATH,
            IronfishKeys.PublicAddress,
            false,
          );

          if (!isResponseAddress(keyResponse)) {
            throw new Error("No public address returned");
          }
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

        const publicAddressResponse =
          await ironfishAppReponse.data.retrieveKeys(
            DERIVATION_PATH,
            IronfishKeys.PublicAddress,
            false,
          );

        if (!isResponseAddress(publicAddressResponse)) {
          throw new Error("No public address returned");
        }

        const viewKeyResponse = await ironfishAppReponse.data.retrieveKeys(
          DERIVATION_PATH,
          IronfishKeys.ViewKey,
          true,
        );

        if (!isResponseViewKey(viewKeyResponse)) {
          throw new Error(`No view key returned`);
        }

        const responsePGK = await ironfishAppReponse.data.retrieveKeys(
          DERIVATION_PATH,
          IronfishKeys.ProofGenerationKey,
          false,
        );

        if (!isResponseProofGenKey(responsePGK)) {
          const error = `No proof authorizing key returned`;
          logger.debug(error);
          throw new Error(error);
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
        await this.markAccountAsLedger(publicAddress);

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

  markAccountAsLedger = async (publicAddress: string) => {
    await ledgerStore.setIsLedgerAccount(publicAddress, true);
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

        this.signTransactionPromise = ironfishAppReponse.data.sign(
          DERIVATION_PATH,
          unsignedTransactionBuffer,
        );

        const signResponse = await this.signTransactionPromise;

        if (!this.signTransactionPromise) {
          logger.info("Transaction was cancelled by the client");
          return null;
        }

        if (!signResponse.signature) {
          throw new Error("No signature returned");
        }

        const ironfish = await manager.getIronfish();
        const rpcClient = await ironfish.rpcClient();

        const addSignatureResponse = await rpcClient.wallet.addSignature({
          unsignedTransaction,
          signature: signResponse.signature.toString("hex"),
        });

        const addTransactionResponse = await rpcClient.wallet.addTransaction({
          transaction: addSignatureResponse.content.transaction,
          broadcast: true,
        });

        return addTransactionResponse.content;
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

  cancelTransaction() {
    this.signTransactionPromise = null;
  }
}

function isResponseAddress(response: KeyResponse): response is ResponseAddress {
  return "publicAddress" in response;
}

function isResponseViewKey(response: KeyResponse): response is ResponseViewKey {
  return "viewKey" in response;
}

function isResponseProofGenKey(
  response: KeyResponse,
): response is ResponseProofGenKey {
  return "ak" in response && "nsk" in response;
}

function isResponseError(error: unknown): error is ResponseError {
  return (
    "errorMessage" in (error as object) && "returnCode" in (error as object)
  );
}

export class LedgerError extends Error {
  name = this.constructor.name;
}

export class LedgerDeviceLockedError extends LedgerError {
  static returnCode = 0x5515;
}

export class LedgerAppNotOpenError extends LedgerError {
  static returnCode = 0x6f00;
}

export const ledgerManager = new LedgerManager();
