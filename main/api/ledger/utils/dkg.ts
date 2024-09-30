/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { Assert, createRootLogger, Logger } from "@ironfish/sdk";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import {
  default as IronfishDkgApp,
  ResponseIdentity,
} from "@zondax/ledger-ironfish-dkg";
import { ResponseError } from "@zondax/ledger-js";

class LedgerDkg {
  app: IronfishDkgApp | undefined;
  logger: Logger;
  PATH = "m/44'/1338'/0";

  constructor(logger?: Logger) {
    this.app = undefined;
    this.logger = logger ? logger : createRootLogger();
  }

  tryInstruction = async <T>(
    instruction: (app: IronfishDkgApp) => Promise<T>,
  ) => {
    await this.refreshConnection();
    Assert.isNotUndefined(
      this.app,
      "Unable to establish connection with Ledger device",
    );

    try {
      return await instruction(this.app);
    } catch (error: unknown) {
      if (isResponseError(error)) {
        this.logger.debug(
          `Ledger ResponseError returnCode: ${error.returnCode.toString(16)}`,
        );
        if (error.returnCode === LedgerDeviceLockedError.returnCode) {
          throw new LedgerDeviceLockedError(
            "Please unlock your Ledger device.",
          );
        } else if (
          LedgerAppUnavailableError.returnCodes.includes(error.returnCode)
        ) {
          throw new LedgerAppUnavailableError();
        }

        throw new LedgerError(error.errorMessage);
      }

      throw error;
    }
  };

  connect = async () => {
    const transport = await TransportNodeHid.create(3000);

    transport.on("disconnect", async () => {
      await transport.close();
      this.app = undefined;
    });

    if (transport.deviceModel) {
      this.logger.debug(`${transport.deviceModel.productName} found.`);
    }

    const app = new IronfishDkgApp(transport, true);

    // If the app isn't open or the device is locked, this will throw an error.
    await app.getVersion();

    this.app = app;

    return { app, PATH: this.PATH };
  };

  private refreshConnection = async () => {
    if (!this.app) {
      await this.connect();
    }
  };

  dkgGetIdentity = async (index: number): Promise<Buffer> => {
    this.logger.log("Retrieving identity from ledger device.");

    const response: ResponseIdentity = await this.tryInstruction((app) =>
      app.dkgGetIdentity(index, false),
    );

    return response.identity;
  };

  reviewTransaction = async (transaction: string): Promise<Buffer> => {
    if (!this.app) {
      throw new Error("Connect to Ledger first");
    }

    this.logger.info(
      "Please review and approve the outputs of this transaction on your ledger device.",
    );

    const { hash } = await this.tryInstruction((app) =>
      app.reviewTransaction(transaction),
    );

    return hash;
  };

  dkgGetCommitments = async (transactionHash: string): Promise<Buffer> => {
    if (!this.app) {
      throw new Error("Connect to Ledger first");
    }

    const { commitments } = await this.tryInstruction((app) =>
      app.dkgGetCommitments(transactionHash),
    );

    return commitments;
  };

  dkgSign = async (
    randomness: string,
    frostSigningPackage: string,
    transactionHash: string,
  ): Promise<Buffer> => {
    if (!this.app) {
      throw new Error("Connect to Ledger first");
    }

    const { signature } = await this.tryInstruction((app) =>
      app.dkgSign(randomness, frostSigningPackage, transactionHash),
    );

    return signature;
  };
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

export class LedgerAppUnavailableError extends LedgerError {
  static returnCodes = [
    0x6d00, // Instruction not supported
    0xffff, // Unknown transport error
    0x6f00, // Technical error
  ];

  constructor() {
    super(
      `Unable to connect to Ironfish app on Ledger. Please check that the device is unlocked and the app is open.`,
    );
  }
}

export const ledgerDkg = new LedgerDkg();
