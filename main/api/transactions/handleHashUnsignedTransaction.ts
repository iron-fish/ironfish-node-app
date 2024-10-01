import { UnsignedTransaction } from "@ironfish/sdk";

export async function handleHashUnsignedTransaction(unsignedTransaction: string) {
  const unsigned = new UnsignedTransaction(Buffer.from(unsignedTransaction, "hex"));
  const hash = unsigned.takeReference().hash()
  unsigned.returnReference()
  return hash.toString("hex");
}
