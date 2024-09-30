import { ledgerDkg } from "../utils/dkg";

export async function handleCreateSigningCommitment({
  txHash,
}: {
  txHash: string;
}) {
  const response = await ledgerDkg.dkgGetCommitments(txHash);
  return response;
}
