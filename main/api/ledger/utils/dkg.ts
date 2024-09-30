/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
 import {
  ACCOUNT_SCHEMA_VERSION,
  Assert,
  createRootLogger,
  Logger,
} from '@ironfish/sdk'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import IronfishApp, {
  IronfishKeys,
  ResponseAddress,
  ResponseProofGenKey,
  ResponseSign,
  ResponseViewKey,
} from '@zondax/ledger-ironfish'
import {
  default as IronfishDkgApp,
  KeyResponse,
  ResponseAddress as ResponseAddressDkg,
  ResponseIdentity,
  ResponseProofGenKey as ResponseProofGenKeyDkg,
  ResponseViewKey as ResponseViewKeyDkg,
} from '@zondax/ledger-ironfish-dkg'
import { ResponseError } from '@zondax/ledger-js'

export class LedgerDkg {
  app: IronfishDkgApp | undefined
  logger: Logger
  PATH = "m/44'/1338'/0"

  constructor(logger?: Logger) {
    this.app = undefined
    this.logger = logger ? logger : createRootLogger()
  }

  tryInstruction = async <T>(instruction: (app: IronfishDkgApp) => Promise<T>) => {
    await this.refreshConnection()
    Assert.isNotUndefined(this.app, 'Unable to establish connection with Ledger device')

    try {
      return await instruction(this.app)
    } catch (error: unknown) {
      if (isResponseError(error)) {
        this.logger.debug(`Ledger ResponseError returnCode: ${error.returnCode.toString(16)}`)
        if (error.returnCode === LedgerDeviceLockedError.returnCode) {
          throw new LedgerDeviceLockedError('Please unlock your Ledger device.')
        } else if (LedgerAppUnavailableError.returnCodes.includes(error.returnCode)) {
          throw new LedgerAppUnavailableError()
        }

        throw new LedgerError(error.errorMessage)
      }

      throw error
    }
  }

  connect = async () => {
    const transport = await TransportNodeHid.create(3000)

    transport.on('disconnect', async () => {
      await transport.close()
      this.app = undefined
    })

    if (transport.deviceModel) {
      this.logger.debug(`${transport.deviceModel.productName} found.`)
    }

    const app = new IronfishDkgApp(transport, true)

    // If the app isn't open or the device is locked, this will throw an error.
    await app.getVersion()

    this.app = app

    return { app, PATH: this.PATH }
  }

  private refreshConnection = async () => {
    if (!this.app) {
      await this.connect()
    }
  }

  dkgGetIdentity = async (index: number): Promise<Buffer> => {
    this.logger.log('Retrieving identity from ledger device.')

    const response: ResponseIdentity = await this.tryInstruction((app) =>
      app.dkgGetIdentity(index, false),
    )

    return response.identity
  }

  dkgRetrieveKeys = async (): Promise<{
    publicAddress: string
    viewKey: string
    incomingViewKey: string
    outgoingViewKey: string
    proofAuthorizingKey: string
  }> => {
    const responseAddress: KeyResponse = await this.tryInstruction((app) =>
      app.dkgRetrieveKeys(IronfishKeys.PublicAddress),
    )

    if (!isResponseAddress(responseAddress)) {
      throw new Error(`No public address returned.`)
    }

    const responseViewKey = await this.tryInstruction((app) =>
      app.dkgRetrieveKeys(IronfishKeys.ViewKey),
    )

    if (!isResponseViewKey(responseViewKey)) {
      throw new Error(`No view key returned.`)
    }

    const responsePGK: KeyResponse = await this.tryInstruction((app) =>
      app.dkgRetrieveKeys(IronfishKeys.ProofGenerationKey),
    )

    if (!isResponseProofGenKey(responsePGK)) {
      throw new Error(`No proof authorizing key returned.`)
    }

    return {
      publicAddress: responseAddress.publicAddress.toString('hex'),
      viewKey: responseViewKey.viewKey.toString('hex'),
      incomingViewKey: responseViewKey.ivk.toString('hex'),
      outgoingViewKey: responseViewKey.ovk.toString('hex'),
      proofAuthorizingKey: responsePGK.nsk.toString('hex'),
    }
  }

  dkgGetPublicPackage = async (): Promise<Buffer> => {
    if (!this.app) {
      throw new Error('Connect to Ledger first')
    }

    const response = await this.tryInstruction((app) => app.dkgGetPublicPackage())

    return response.publicPackage
  }

  reviewTransaction = async (transaction: string): Promise<Buffer> => {
    if (!this.app) {
      throw new Error('Connect to Ledger first')
    }

    this.logger.info(
      'Please review and approve the outputs of this transaction on your ledger device.',
    )

    const { hash } = await this.tryInstruction((app) => app.reviewTransaction(transaction))

    return hash
  }

  dkgGetCommitments = async (transactionHash: string): Promise<Buffer> => {
    if (!this.app) {
      throw new Error('Connect to Ledger first')
    }

    const { commitments } = await this.tryInstruction((app) =>
      app.dkgGetCommitments(transactionHash),
    )

    return commitments
  }

  dkgSign = async (
    randomness: string,
    frostSigningPackage: string,
    transactionHash: string,
  ): Promise<Buffer> => {
    if (!this.app) {
      throw new Error('Connect to Ledger first')
    }

    const { signature } = await this.tryInstruction((app) =>
      app.dkgSign(randomness, frostSigningPackage, transactionHash),
    )

    return signature
  }

  dkgBackupKeys = async (): Promise<Buffer> => {
    if (!this.app) {
      throw new Error('Connect to Ledger first')
    }

    this.logger.log('Please approve the request on your ledger device.')

    const { encryptedKeys } = await this.tryInstruction((app) => app.dkgBackupKeys())

    return encryptedKeys
  }

  dkgRestoreKeys = async (encryptedKeys: string): Promise<void> => {
    if (!this.app) {
      throw new Error('Connect to Ledger first')
    }

    this.logger.log('Please approve the request on your ledger device.')

    await this.tryInstruction((app) => app.dkgRestoreKeys(encryptedKeys))
  }
}

export class Ledger {
  app: IronfishApp | undefined
  logger: Logger
  PATH = "m/44'/1338'/0"

  constructor(logger?: Logger) {
    this.app = undefined
    this.logger = logger ? logger : createRootLogger()
  }

  connect = async () => {
    const transport = await TransportNodeHid.create(3000)

    if (transport.deviceModel) {
      this.logger.debug(`${transport.deviceModel.productName} found.`)
    }

    const app = new IronfishApp(transport)

    const appInfo = await app.appInfo()
    this.logger.debug(appInfo.appName ?? 'no app name')

    if (appInfo.appName !== 'Ironfish') {
      this.logger.debug(appInfo.appName ?? 'no app name')
      this.logger.debug(appInfo.returnCode.toString(16))
      this.logger.debug(appInfo.errorMessage.toString())

      // references:
      // https://github.com/LedgerHQ/ledger-live/blob/173bb3c84cc855f83ab8dc49362bc381afecc31e/libs/ledgerjs/packages/errors/src/index.ts#L263
      // https://github.com/Zondax/ledger-ironfish/blob/bf43a4b8d403d15138699ee3bb1a3d6dfdb428bc/docs/APDUSPEC.md?plain=1#L25
      if (appInfo.returnCode === 0x5515) {
        throw new LedgerError('Please unlock your Ledger device.')
      }

      throw new LedgerError('Please open the Iron Fish app on your ledger device.')
    }

    if (appInfo.appVersion) {
      this.logger.debug(`Ironfish App Version: ${appInfo.appVersion}`)
    }

    this.app = app

    return { app, PATH: this.PATH }
  }

  getPublicAddress = async () => {
    if (!this.app) {
      throw new Error('Connect to Ledger first')
    }

    const response: ResponseAddress = await this.app.retrieveKeys(
      this.PATH,
      IronfishKeys.PublicAddress,
      false,
    )

    if (!response.publicAddress) {
      this.logger.debug(`No public address returned.`)
      this.logger.debug(response.returnCode.toString())
      throw new Error(response.errorMessage)
    }

    return response.publicAddress.toString('hex')
  }

  importAccount = async () => {
    if (!this.app) {
      throw new Error('Connect to Ledger first')
    }

    const responseAddress: ResponseAddress = await this.app.retrieveKeys(
      this.PATH,
      IronfishKeys.PublicAddress,
      false,
    )

    if (!responseAddress.publicAddress) {
      this.logger.debug(`No public address returned.`)
      this.logger.debug(responseAddress.returnCode.toString())
      throw new Error(responseAddress.errorMessage)
    }

    this.logger.log('Please confirm the request on your ledger device.')

    const responseViewKey: ResponseViewKey = await this.app.retrieveKeys(
      this.PATH,
      IronfishKeys.ViewKey,
      true,
    )

    if (!responseViewKey.viewKey || !responseViewKey.ovk || !responseViewKey.ivk) {
      this.logger.debug(`No view key returned.`)
      this.logger.debug(responseViewKey.returnCode.toString())
      throw new Error(responseViewKey.errorMessage)
    }

    const responsePGK: ResponseProofGenKey = await this.app.retrieveKeys(
      this.PATH,
      IronfishKeys.ProofGenerationKey,
      false,
    )

    if (!responsePGK.ak || !responsePGK.nsk) {
      this.logger.debug(`No proof authorizing key returned.`)
      throw new Error(responsePGK.errorMessage)
    }

    return {
      version: ACCOUNT_SCHEMA_VERSION,
      name: 'ledger',
      viewKey: responseViewKey.viewKey.toString('hex'),
      incomingViewKey: responseViewKey.ivk.toString('hex'),
      outgoingViewKey: responseViewKey.ovk.toString('hex'),
      publicAddress: responseAddress.publicAddress.toString('hex'),
      proofAuthorizingKey: responsePGK.nsk.toString('hex'),
      spendingKey: null,
      createdAt: null,
    }
  }

  sign = async (message: string): Promise<Buffer> => {
    if (!this.app) {
      throw new Error('Connect to Ledger first')
    }

    this.logger.log('Please confirm the request on your ledger device.')

    const buffer = Buffer.from(message, 'hex')

    // max size of a transaction is 16kb
    if (buffer.length > 16 * 1024) {
      throw new Error('Transaction size is too large, must be less than 16kb.')
    }

    const response: ResponseSign = await this.app.sign(this.PATH, buffer)

    if (!response.signature) {
      this.logger.debug(`No signatures returned.`)
      this.logger.debug(response.returnCode.toString())
      throw new Error(response.errorMessage)
    }

    return response.signature
  }
}

function isResponseAddress(response: KeyResponse): response is ResponseAddressDkg {
  return 'publicAddress' in response
}

function isResponseViewKey(response: KeyResponse): response is ResponseViewKeyDkg {
  return 'viewKey' in response
}

function isResponseProofGenKey(response: KeyResponse): response is ResponseProofGenKeyDkg {
  return 'ak' in response
}

function isResponseError(error: unknown): error is ResponseError {
  return 'errorMessage' in (error as object) && 'returnCode' in (error as object)
}

export class LedgerError extends Error {
  name = this.constructor.name
}

export class LedgerDeviceLockedError extends LedgerError {
  static returnCode = 0x5515
}

export class LedgerAppUnavailableError extends LedgerError {
  static returnCodes = [
    0x6d00, // Instruction not supported
    0xffff, // Unknown transport error
    0x6f00, // Technical error
  ]

  constructor() {
    super(
      `Unable to connect to Ironfish app on Ledger. Please check that the device is unlocked and the app is open.`,
    )
  }
}
