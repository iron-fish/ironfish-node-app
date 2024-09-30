import { ledgerDkg } from "../utils/dkg";

export async function handleCreateSignatureShare({
  randomness,
  signingPackage,
  txHash,
}: {
  randomness: string;
  signingPackage: string;
  txHash: string;
}) {
  return ledgerDkg.dkgSign(randomness, signingPackage, txHash);
}
