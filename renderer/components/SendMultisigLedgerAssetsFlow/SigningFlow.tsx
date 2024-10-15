import { useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import octopus from "@/images/octopus.svg";
import { WithExplanatorySidebar } from "@/layouts/WithExplanatorySidebar";

import { AggregateSignatureShares } from "./Steps/AggregateSignatureSharesAndBroadcast";
import { CollectIdentities } from "./Steps/CollectIdentities";
import { CreateSignatureShare } from "./Steps/CreateSignatureShare";
import { CreateSigningCommitment } from "./Steps/CreateSigningCommitment";
import { GetUnsignedTransaction } from "./Steps/GetUnsignedTransaction";
import { ReviewTransaction } from "./Steps/ReviewTransaction";

export type Step1GetUnsignedTransaction = {
  step: 1;
};

export type Step2CollectIdentities = {
  step: 2;
  unsignedTransaction: string;
  selectedAccount: string;
};

export type Step3ReviewTransaction = {
  step: 3;
  unsignedTransaction: string;
  selectedAccount: string;
  identities: string[];
};

export type Step4CreateSigningCommitment = {
  step: 4;
  unsignedTransaction: string;
  selectedAccount: string;
  identities: string[];
  txHash: string;
};

export type Step5CreateSignatureShare = {
  step: 5;
  unsignedTransaction: string;
  selectedAccount: string;
  identities: string[];
  commitments: string[];
  txHash: string;
};

export type Step6AggregateSignatureSharesAndBroadcast = {
  step: 6;
  unsignedTransaction: string;
  selectedAccount: string;
  identities: string[];
  commitments: string[];
  txHash: string;
  signingPackage: string;
  signatureShares: string[];
};

export type SigningState =
  | Step1GetUnsignedTransaction
  | Step2CollectIdentities
  | Step3ReviewTransaction
  | Step4CreateSigningCommitment
  | Step5CreateSignatureShare
  | Step6AggregateSignatureSharesAndBroadcast;

const messages = defineMessages({
  multisigCollectIdentitiesHeading: {
    defaultMessage: "Multisig Identities",
  },
  multisigCollectIdentitiesText: {
    defaultMessage:
      "Add the identities of the participants in the multisig transaction.",
  },
  multisigReviewTransactionHeading: {
    defaultMessage: "Review Transaction",
  },
  multisigReviewTransactionText: {
    defaultMessage:
      "Review and approve the transaction information on your Ledger device.",
  },
  multisigSigningCommitmentHeading: {
    defaultMessage: "Signing Commitments",
  },
  multisigSigningCommitmentText: {
    defaultMessage:
      "Input a signing commitment for each participant in the multisig transaction. These do not have to be in any particular order.",
  },
  multisigSigningPackageHeading: {
    defaultMessage: "Signing Package",
  },
  multisigSigningPackageCoordinatorText: {
    defaultMessage:
      "Send the signing package to all of the participants so they can sign the transaction.",
  },
  multisigSigningPackageParticipantText: {
    defaultMessage:
      "Get the signing package from the coordinator and sign the transaction.",
  },
  multisigSignatureShareHeading: {
    defaultMessage: "Signature Shares",
  },
  multisigSignatureShareCoordinatorText: {
    defaultMessage:
      "Collect the signature shares from all of the participants to aggregate them.",
  },
  multisigSignatureShareParticipantText: {
    defaultMessage:
      "Send your signing share to the coordinator so they can aggregate the signatures.",
  },
  multisigSubmitTransactionHeading: {
    defaultMessage: "Submit Transaction",
  },
  multisigSubmitTransactionText: {
    defaultMessage: "Submit the signed transaction to the network.",
  },
});

export function SendMultisigLedgerAssetsFlow() {
  const { formatMessage } = useIntl();
  const [signingStep, setSigningStep] = useState<SigningState>({ step: 1 });
  const { step } = signingStep;

  if (step === 1) {
    return (
      <GetUnsignedTransaction
        {...signingStep}
        onSubmit={({ unsignedTransaction, selectedAccount }) => {
          setSigningStep({
            ...signingStep,
            step: 2,
            unsignedTransaction,
            selectedAccount,
          });
        }}
      />
    );
  } else if (step === 2) {
    return (
      <WithExplanatorySidebar
        heading={formatMessage(messages.multisigCollectIdentitiesHeading)}
        description={formatMessage(messages.multisigCollectIdentitiesText)}
        imgSrc={octopus}
      >
        <CollectIdentities
          onSubmit={(identities) =>
            setSigningStep({ ...signingStep, step: 3, identities })
          }
        />
      </WithExplanatorySidebar>
    );
  } else if (step === 3) {
    return (
      <WithExplanatorySidebar
        heading={formatMessage(messages.multisigReviewTransactionHeading)}
        description={formatMessage(messages.multisigReviewTransactionText)}
        imgSrc={octopus}
      >
        <ReviewTransaction
          {...signingStep}
          onSubmit={(txHash) =>
            setSigningStep({ ...signingStep, step: 4, txHash })
          }
        />
      </WithExplanatorySidebar>
    );
  } else if (step === 4) {
    return (
      <WithExplanatorySidebar
        heading={formatMessage(messages.multisigSigningCommitmentHeading)}
        description={formatMessage(messages.multisigSigningCommitmentText)}
        imgSrc={octopus}
      >
        <CreateSigningCommitment
          {...signingStep}
          onSubmit={(commitments) => {
            setSigningStep({
              ...signingStep,
              step: 5,
              commitments: commitments,
            });
          }}
        />
      </WithExplanatorySidebar>
    );
  } else if (step === 5) {
    const description = formatMessage(
      messages.multisigSignatureShareCoordinatorText,
    );

    return (
      <WithExplanatorySidebar
        heading={formatMessage(messages.multisigSignatureShareHeading)}
        description={description}
        imgSrc={octopus}
      >
        <CreateSignatureShare
          {...signingStep}
          onSubmit={(signingPackage, signatureShares) => {
            setSigningStep({
              ...signingStep,
              step: 6,
              signatureShares,
              signingPackage,
            });
          }}
        />
      </WithExplanatorySidebar>
    );
  } else if (step === 6) {
    return (
      <WithExplanatorySidebar
        heading={formatMessage(messages.multisigSubmitTransactionHeading)}
        description={formatMessage(messages.multisigSubmitTransactionText)}
        imgSrc={octopus}
      >
        <AggregateSignatureShares {...signingStep} />
      </WithExplanatorySidebar>
    );
  }
}
