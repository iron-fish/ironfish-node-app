import { TRPCRouterOutputs } from "@/providers/TRPCProvider";

const OUTGOING_ADDRESSES = new Set(
  toLower([
    "06102d319ab7e77b914a1bd135577f3e266fd82a3e537a02db281421ed8b3d13",
    "db2cf6ec67addde84cc1092378ea22e7bb2eecdeecac5e43febc1cb8fb64b5e5",
    "3be494deb669ff8d943463bb6042eabcf0c5346cf444d569e07204487716cb85",
  ]),
);

const INCOMING_ADDRESSES = new Set(
  toLower(["06102d319ab7e77b914a1bd135577f3e266fd82a3e537a02db281421ed8b3d13"]),
);

type TransactionData = TRPCRouterOutputs["getTransaction"];
type TransactionNote = TransactionData["notes"][number];

export function isChainportNote(note: TransactionNote) {
  if (note.type === "send") {
    return hasAddress(OUTGOING_ADDRESSES, toLower(note.to));
  }
  if (note.type === "receive") {
    return hasAddress(INCOMING_ADDRESSES, toLower(note.from));
  }
  return false;
}

export function isChainportTx(transactionData: TransactionData) {
  return transactionData.notes.some((note) => {
    return isChainportNote(note);
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
