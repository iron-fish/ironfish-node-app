import { TRPCRouterOutputs } from "@/providers/TRPCProvider";

const chainportConfig = {
  0: {
    outgoingAddresses: new Set(
      toLower([
        "06102d319ab7e77b914a1bd135577f3e266fd82a3e537a02db281421ed8b3d13",
        "db2cf6ec67addde84cc1092378ea22e7bb2eecdeecac5e43febc1cb8fb64b5e5",
        "3be494deb669ff8d943463bb6042eabcf0c5346cf444d569e07204487716cb85",
      ]),
    ),
    incomingAddresses: new Set(
      toLower([
        "06102d319ab7e77b914a1bd135577f3e266fd82a3e537a02db281421ed8b3d13",
      ]),
    ),
  },
  1: {
    outgoingAddresses: new Set(
      toLower([
        "576ffdcc27e11d81f5180d3dc5690294941170d492b2d9503c39130b1f180405",
        "7ac2d6a59e19e66e590d014af013cd5611dc146e631fa2aedf0ee3ed1237eebe",
      ]),
    ),
    incomingAddresses: new Set(
      toLower([
        "1216302193e8f1ad020f458b54a163039403d803e98673c6a85e59b5f4a1a900",
      ]),
    ),
  },
};

type TransactionData = TRPCRouterOutputs["getTransaction"];
type TransactionNote = TransactionData["notes"][number];

export function isChainportNote(networkId: number, note: TransactionNote) {
  if (networkId !== 1 && networkId !== 0) {
    throw new Error(`Unknown network id: ${networkId}`);
  }

  const config = chainportConfig[networkId];

  if (note.type === "send") {
    const { outgoingAddresses } = config;
    return hasAddress(outgoingAddresses, toLower(note.to));
  }
  if (note.type === "receive") {
    const { incomingAddresses } = config;
    return hasAddress(incomingAddresses, toLower(note.from));
  }
  return false;
}

export function isChainportTx(
  networkId: number,
  transactionData: TransactionData,
) {
  return transactionData.notes.some((note) => {
    return isChainportNote(networkId, note);
  });
}

function toLower(content: string | string[]) {
  return Array.isArray(content)
    ? content.map((c) => c.toLowerCase())
    : content.toLowerCase();
}

function hasAddress(haystack: Set<string>, needle: string | string[]) {
  return Array.isArray(needle)
    ? needle.some((n) => haystack.has(n))
    : haystack.has(needle);
}
