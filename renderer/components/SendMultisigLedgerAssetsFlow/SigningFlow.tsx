import { useState } from "react";

import { AggregateSignatureShares } from "./AggregateSignatureSharesAndBroadcast";
import { CreateSignatureShare } from "./CreateSignatureShare";
import { CreateSigningCommitment } from "./CreateSigningCommitment";
import { CreateSigningPackage } from "./CreateSigningPackage";
import { CreateUnsignedTransactionForm } from "./CreateUnsignedTransactionForm";
import { ReviewTransaction } from "./ReviewTransaction";

type Step2CreateUnsignedTransaction = {
  step: 2;
};

type Step3ReviewTransaction = {
  step: 3;
  unsignedTransaction: string;
};

type Step4CreateSigningCommitment = {
  step: 4;
  unsignedTransaction: string;
  hash: string;
};

type Step5CreateSigningPackage = {
  step: 5;
  unsignedTransaction: string;
  signingCommitments: string[];
  hash: string;
};

type Step6CreateSignatureShare = {
  step: 6;
  unsignedTransaction: string;
  signingCommitments: string[];
  hash: string;
  signingPackage: string;
};

type Step7AggregateSignatureSharesAndBroadcast = {
  step: 7;
  unsignedTransaction: string;
  signingCommitments: string[];
  hash: string;
  signingPackage: string;
  signatureShares: string[];
};

type SigningState =
  | Step2CreateUnsignedTransaction
  | Step3ReviewTransaction
  | Step4CreateSigningCommitment
  | Step5CreateSigningPackage
  | Step6CreateSignatureShare
  | Step7AggregateSignatureSharesAndBroadcast;

export function SendMultisigLedgerAssetsFlow() {
  const [signingState, setSigningState] = useState<SigningState>({ step: 2 });
  const { step } = signingState;

  if (step === 2) {
    return (
      <GetUnsignedTransaction
        onSubmit={({ unsignedTransaction }) => {
          setSigningState({ step: 3, unsignedTransaction });
        }}
      />
    );
  } else if (step === 3) {
    return (
      <ReviewTransaction
        unsignedTransaction={signingState.unsignedTransaction}
        onSubmit={(hash) => {
          setSigningState({
            step: 4,
            unsignedTransaction: signingState.unsignedTransaction,
            hash,
          });
        }}
      />
    );
  } else if (step === 4) {
    return (
      <CreateSigningCommitment
        txHash={signingState.hash}
        onSubmit={(commitments) => {
          setSigningState({
            ...signingState,
            step: 5,
            signingCommitments: commitments,
          });
        }}
      />
    );
  } else if (step === 5) {
    return (
      <CreateSigningPackage
        commitments={signingState.signingCommitments}
        unsignedTransaction={signingState.unsignedTransaction}
        onSubmit={(signingPackage) => {
          setSigningState({ ...signingState, step: 6, signingPackage });
        }}
      />
    );
  } else if (step === 6) {
    return (
      <CreateSignatureShare
        signingPackage={signingState.signingPackage}
        unsignedTransaction={signingState.unsignedTransaction}
        onSubmit={(signatureShares) => {
          setSigningState({ ...signingState, step: 7, signatureShares });
        }}
      />
    );
  } else if (step === 7) {
    return (
      <AggregateSignatureShares
        signingPackage={signingState.signingPackage}
        signatureShares={signingState.signatureShares}
        onSubmit={() => {
          setSigningState({ step: 2 });
        }}
      />
    );
  }
}

function GetUnsignedTransaction({
  onSubmit,
}: {
  onSubmit: (transactionInfo: { unsignedTransaction: string }) => void;
}) {
  return (
    <CreateUnsignedTransactionForm
      onSubmit={(unsignedTransaction) => {
        onSubmit({ unsignedTransaction });
      }}
    />
  );
}

// 1. Choose Role
// participant
// coordinator

// 2. Create Unsigned Transaction
// <coordinator>
// -> createUnsignedTransaction

// 3. Review Transaction
// <coordinator/participant>
// -> createSigningCommitment

// 4. Create Signing Commitment
// <coordinator/participant>
// -> createSigningCommitment

// 5. Create Signing Package
// <coordinator>
// -> createSigningPackage

// 6. Create Signing Share
// <coordinator/participant>
// -> createSigningShare

// 7. Aggregate Signing Shares
// <coordinator>
// -> aggregateSigningShares

// 8. Send Transaction
// <coordinator>
// -> sendTransaction
