import { randomUUID } from "crypto";

import { AccountFormat, encodeAccountImport } from "@ironfish/sdk";
import { z } from "zod";

import {
  LedgerAppNotOpen,
  LedgerClaNotSupportedError,
  LedgerConnectError,
  LedgerDeviceLockedError,
  LedgerGPAuthFailed,
  LedgerPanicError,
  LedgerPortIsBusyError,
} from "./ledger";
import { LedgerSingleSigner } from "./ledgerSingleSigner";
import { ledgerStore } from "../../../stores/ledgerStore";
import { handleImportAccount } from "../../accounts/handleImportAccount";
import { manager } from "../../manager";
import { handleSendTransactionInput } from "../../transactions/handleSendTransaction";
import { PromiseQueue } from "../../utils/promiseQueue";
import { createUnsignedTransaction } from "../../utils/transactions";

const POLL_INTERVAL = 500;

export type ConnectionStatus = {
  isLedgerConnected: boolean;
  isLedgerUnlocked: boolean;
  isIronfishAppOpen: boolean;
  publicAddress: string;
  deviceName: string;
};

const EMPTY_CONNECTION_STATUS: ConnectionStatus = {
  isLedgerConnected: false,
  isLedgerUnlocked: false,
  isIronfishAppOpen: false,
  publicAddress: "",
  deviceName: "",
};

class LedgerManager {
  ledgerSingleSigner = new LedgerSingleSigner();
  subscribers: Map<string, (status: ConnectionStatus) => void> = new Map();
  signTransactionPromise: Promise<Buffer> | null = null;
  taskQueue = new PromiseQueue();

  private getLedgerStatus = async (): Promise<ConnectionStatus> => {
    try {
      const publicAddress = await this.ledgerSingleSigner.getPublicAddress();

      return {
        isLedgerConnected: true,
        isLedgerUnlocked: true,
        isIronfishAppOpen: true,
        publicAddress,
        deviceName:
          this.ledgerSingleSigner.app?.transport.deviceModel?.productName ??
          "Ledger",
      };
    } catch (e) {
      if (
        e instanceof LedgerConnectError ||
        e instanceof LedgerPortIsBusyError
      ) {
        return { ...EMPTY_CONNECTION_STATUS };
      }

      if (
        e instanceof LedgerDeviceLockedError ||
        e instanceof LedgerGPAuthFailed
      ) {
        return {
          isLedgerConnected: true,
          isLedgerUnlocked: false,
          isIronfishAppOpen: false,
          publicAddress: "",
          deviceName:
            this.ledgerSingleSigner.app?.transport.deviceModel?.productName ??
            "",
        };
      }

      if (
        e instanceof LedgerAppNotOpen ||
        e instanceof LedgerPanicError ||
        e instanceof LedgerClaNotSupportedError
      ) {
        return {
          isLedgerConnected: true,
          isLedgerUnlocked: true,
          isIronfishAppOpen: false,
          publicAddress: "",
          deviceName:
            this.ledgerSingleSigner.app?.transport.deviceModel?.productName ??
            "",
        };
      }

      return { ...EMPTY_CONNECTION_STATUS };
    }
  };

  private pollForStatus = async () => {
    const status = await this.taskQueue.enqueue(() => {
      return this.getLedgerStatus();
    });

    if (this.subscribers.size > 0) {
      for (const subscriber of this.subscribers.values()) {
        subscriber(status);
      }

      setTimeout(this.pollForStatus, POLL_INTERVAL);
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

  importAccount = async () => {
    const returnValue = await this.taskQueue.enqueue(async () => {
      const accountImport = await this.ledgerSingleSigner.importAccount();
      const accountName =
        this.ledgerSingleSigner.app?.transport.deviceModel?.productName ??
        "Ledger";

      const encoded = encodeAccountImport(
        accountImport,
        AccountFormat.Base64Json,
      );

      await handleImportAccount({
        name: accountName,
        account: encoded,
      });

      await this.markAccountAsLedger(accountImport.publicAddress);

      return accountImport;
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
    const unsignedTransaction = await createUnsignedTransaction({
      fromAccount,
      toAccount,
      assetId,
      amount,
      fee,
      memo,
    });

    const signature = await this.taskQueue.enqueue(async () => {
      this.signTransactionPromise =
        this.ledgerSingleSigner.sign(unsignedTransaction);

      return this.signTransactionPromise;
    });

    if (!this.signTransactionPromise) {
      return null;
    }

    const ironfish = await manager.getIronfish();
    const rpcClient = await ironfish.rpcClient();

    const addSignatureResponse = await rpcClient.wallet.addSignature({
      unsignedTransaction,
      signature: signature.toString("hex"),
    });

    const addTransactionResponse = await rpcClient.wallet.addTransaction({
      transaction: addSignatureResponse.content.transaction,
      broadcast: true,
    });

    return addTransactionResponse.content;
  };

  cancelTransaction() {
    this.signTransactionPromise = null;
  }
}

export const ledgerManager = new LedgerManager();
