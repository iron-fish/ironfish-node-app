import { GENESIS_BLOCK_SEQUENCE } from "@ironfish/sdk";
import axios from "axios";

const MAINNET_API_URL = `https://api.ironfish.network`;
const TESTNET_API_URL = `https://testnet.api.ironfish.network`;
const CONFIRMATION_BLOCKS = 20;

type Block = { sequence: number; hash: string };

// Try to get a head sequence to use for new account createdAt fields if the chain is not yet synced
export async function getExternalChainHead(
  networkId: number,
): Promise<Block | undefined> {
  const fromAPI = await getChainHeadWithConfirmation(networkId).catch(
    () => undefined,
  );

  return fromAPI || getDefaultHead(networkId);
}

async function getChainHeadWithConfirmation(
  networkId: number,
): Promise<Block | undefined> {
  const headFromAPI = await getChainHeadFromAPI(networkId).catch(
    () => undefined,
  );
  if (!headFromAPI) {
    return undefined;
  }

  const sequence = Math.max(
    GENESIS_BLOCK_SEQUENCE,
    headFromAPI.sequence - CONFIRMATION_BLOCKS,
  );
  return getBlockFromAPI(networkId, sequence).catch(() => undefined);
}

// Local block sequences in case network is unreachable
function getDefaultHead(networkId: number): Block | undefined {
  switch (networkId) {
    case 0:
      return {
        sequence: 740000,
        hash: "00000419de21cb51eeea7b002c89e630f0b326525e99a6595b4c87442fd7bfa5",
      };
    case 1:
      return {
        sequence: 806900,
        hash: "0000000000016a6993058e7459fff9f1413f14c09483612d511e5e86894803b7",
      };
    default:
      return undefined;
  }
}

async function getChainHeadFromAPI(networkId: number): Promise<Block> {
  const apiURL = getAPIUrl(networkId);
  if (!apiURL) {
    throw new Error(
      `Manifest url for the snapshots are not available for network ID ${networkId}`,
    );
  }

  const headBlock = (
    await axios.get<{ sequence: number; hash: string }>(
      `${apiURL}/blocks/head`,
      {
        timeout: 5000,
      },
    )
  ).data;

  return {
    sequence: headBlock.sequence,
    hash: headBlock.hash,
  };
}

async function getBlockFromAPI(
  networkId: number,
  sequence: number,
): Promise<Block | undefined> {
  const apiURL = getAPIUrl(networkId);
  if (!apiURL) {
    throw new Error(
      `Manifest url for the snapshots are not available for network ID ${networkId}`,
    );
  }

  const head = (
    await axios.get<{ sequence: number; hash: string }>(
      `${apiURL}/blocks/find?sequence=${sequence}&with_transactions=false`,
      {
        timeout: 5000,
      },
    )
  ).data;

  return {
    sequence: head.sequence,
    hash: head.hash,
  };
}

const getAPIUrl = (networkId: number): string | null => {
  switch (networkId) {
    case 0:
      return TESTNET_API_URL;
    case 1:
      return MAINNET_API_URL;
    default:
      return null;
  }
};
