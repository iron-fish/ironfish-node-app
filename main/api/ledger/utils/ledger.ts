/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { Assert } from "@ironfish/sdk";
import {
  DisconnectedDevice,
  DisconnectedDeviceDuringOperation,
  StatusCodes,
  TransportStatusError,
} from "@ledgerhq/errors";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import IronfishApp, {
  KeyResponse,
  ResponseAddress,
  ResponseProofGenKey,
  ResponseViewKey,
} from "@zondax/ledger-ironfish";
import { ResponseError, Transport } from "@zondax/ledger-js";

export const IronfishLedgerStatusCodes = {
  ...StatusCodes,
  COMMAND_NOT_ALLOWED: 0x6986,
  APP_NOT_OPEN: 0x6e01,
  UNKNOWN_TRANSPORT_ERROR: 0xffff,
  INVALID_TX_HASH: 0xb025,
  PANIC: 0xe000,
};

export class Ledger {
  app: IronfishApp | undefined;
  PATH = "m/44'/1338'/0";
  isMultisig: boolean;
  isConnecting: boolean = false;
  connectTimeout = 2000;

  constructor(isMultisig: boolean) {
    this.app = undefined;
    this.isMultisig = isMultisig;
  }

  tryInstruction = async <T>(instruction: (app: IronfishApp) => Promise<T>) => {
    try {
      await this.connect();

      Assert.isNotUndefined(
        this.app,
        "Unable to establish connection with Ledger device",
      );

      return await instruction(this.app);
    } catch (e: unknown) {
      let error = e;

      if (LedgerPortIsBusyError.IsError(e)) {
        throw new LedgerPortIsBusyError();
      } else if (LedgerConnectError.IsError(e)) {
        throw new LedgerConnectError();
      } else if (e instanceof DisconnectedDeviceDuringOperation) {
        throw new LedgerConnectError();
      } else if (e instanceof DisconnectedDevice) {
        throw new LedgerConnectError();
      }

      if (error instanceof TransportStatusError) {
        error = new ResponseError(error.statusCode, error.statusText);
      }

      if (error instanceof ResponseError) {
        if (error.returnCode === IronfishLedgerStatusCodes.LOCKED_DEVICE) {
          throw new LedgerDeviceLockedError();
        } else if (
          error.returnCode === IronfishLedgerStatusCodes.CLA_NOT_SUPPORTED
        ) {
          throw new LedgerClaNotSupportedError();
        } else if (error.returnCode === IronfishLedgerStatusCodes.PANIC) {
          throw new LedgerPanicError();
        } else if (
          error.returnCode === IronfishLedgerStatusCodes.GP_AUTH_FAILED
        ) {
          throw new LedgerGPAuthFailed();
        } else if (
          [
            IronfishLedgerStatusCodes.COMMAND_NOT_ALLOWED,
            IronfishLedgerStatusCodes.CONDITIONS_OF_USE_NOT_SATISFIED,
          ].includes(error.returnCode)
        ) {
          throw new LedgerActionRejected();
        } else if (
          [
            IronfishLedgerStatusCodes.TECHNICAL_PROBLEM,
            IronfishLedgerStatusCodes.UNKNOWN_TRANSPORT_ERROR,
            IronfishLedgerStatusCodes.APP_NOT_OPEN,
          ].includes(error.returnCode)
        ) {
          throw new LedgerAppNotOpen(
            `Unable to connect to Ironfish app on Ledger. Please check that the device is unlocked and the app is open.`,
          );
        } else if (
          error.returnCode === IronfishLedgerStatusCodes.INVALID_TX_HASH
        ) {
          throw new LedgerInvalidTxHash();
        } else if (e instanceof TransportStatusError) {
          throw new LedgerConnectError();
        }

        throw new LedgerError(error.message);
      }

      throw error;
    }
  };

  connect = async () => {
    if (this.app || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    let transport: Transport | undefined = undefined;

    try {
      transport = await TransportNodeHid.create(
        this.connectTimeout,
        this.connectTimeout,
      );

      transport.on("disconnect", async () => {
        await transport?.close();
        this.app = undefined;
      });

      const app = new IronfishApp(transport, this.isMultisig);

      this.app = app;
      return { app, PATH: this.PATH };
    } catch (e) {
      await transport?.close();
      throw e;
    } finally {
      this.isConnecting = false;
    }
  };

  close = () => {
    void this.app?.transport.close();
  };
}

export function isResponseAddress(
  response: KeyResponse,
): response is ResponseAddress {
  return "publicAddress" in response;
}

export function isResponseViewKey(
  response: KeyResponse,
): response is ResponseViewKey {
  return "viewKey" in response;
}

export function isResponseProofGenKey(
  response: KeyResponse,
): response is ResponseProofGenKey {
  return "ak" in response && "nsk" in response;
}

export class LedgerError extends Error {
  name = this.constructor.name;
}

export class LedgerConnectError extends LedgerError {
  static IsError(error: unknown): error is Error {
    const ids = [
      "ListenTimeout",
      "InvalidChannel",
      "InvalidTag",
      "InvalidSequence",
      "NoDeviceFound",
    ];

    return (
      error instanceof Error &&
      "id" in error &&
      typeof error["id"] === "string" &&
      ids.includes(error.id)
    );
  }
}

export class LedgerPortIsBusyError extends LedgerError {
  static IsError(error: unknown): error is Error {
    return (
      error instanceof Error &&
      error.message.includes("cannot open device with path")
    );
  }
}

export class LedgerDeviceLockedError extends LedgerError {}
export class LedgerGPAuthFailed extends LedgerError {}
export class LedgerClaNotSupportedError extends LedgerError {}
export class LedgerAppNotOpen extends LedgerError {}
export class LedgerActionRejected extends LedgerError {}
export class LedgerInvalidTxHash extends LedgerError {}
export class LedgerPanicError extends LedgerError {}

export const mapLedgerError = (e: Error, ledger: Ledger) => {
  if (e instanceof LedgerDeviceLockedError) {
    throw new Error("Ledger is locked. Please unlock it.");
  } else if (e instanceof LedgerActionRejected) {
    throw new Error("User Rejected Ledger Request!");
  } else if (e instanceof LedgerConnectError) {
    throw new Error("Connect and unlock your Ledger");
  } else if (e instanceof LedgerAppNotOpen) {
    const appName = ledger.isMultisig ? "Ironfish DKG" : "Ironfish";
    throw new Error(`Open Ledger App ${appName}`);
  } else if (e instanceof LedgerPanicError) {
    throw new Error("Ledger App Crashed");
  } else if (e instanceof LedgerPortIsBusyError) {
    throw new Error("Ledger is busy, retrying");
  } else if (e instanceof LedgerGPAuthFailed) {
    throw new Error("Ledger handshake failed, retrying");
  } else if (e instanceof LedgerClaNotSupportedError) {
    const appName = ledger.isMultisig ? "Ironfish DKG" : "Ironfish";
    throw new Error(`Wrong Ledger app. Please open ${appName}`);
  } else {
    throw e;
  }
};
