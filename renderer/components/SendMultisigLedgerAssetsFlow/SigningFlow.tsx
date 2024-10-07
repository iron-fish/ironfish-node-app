import { useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import octopus from "@/images/octopus.svg";
import { WithExplanatorySidebar } from "@/layouts/WithExplanatorySidebar";
import { PillButton } from "@/ui/PillButton/PillButton";

import { AggregateSignatureShares } from "./Steps/AggregateSignatureSharesAndBroadcast";
import { CollectIdentities } from "./Steps/CollectIdentities";
import { CreateSignatureShare } from "./Steps/CreateSignatureShare";
import { CreateSigningCommitment } from "./Steps/CreateSigningCommitment";
import {
  CreateSigningPackage,
  EnterSigningPackage,
} from "./Steps/CreateSigningPackage";
import { GetUnsignedTransaction } from "./Steps/GetUnsignedTransaction";
import { ReviewTransaction } from "./Steps/ReviewTransaction";
import { SelectRole } from "./Steps/SelectRole";

export type Step1ChoseRole = {
  step: 1;
};

export type Step2GetUnsignedTransaction = {
  step: 2;
  role: SigningRole;
};

export type Step3CollectIdentities =
  | {
      step: 3;
      role: "participant";
      unsignedTransaction: string;
      selectedAccount: string;
    }
  | {
      step: 3;
      role: "coordinator";
      unsignedTransaction: string;
      selectedAccount: string;
    };

export type Step4ReviewTransaction =
  | {
      step: 4;
      role: "participant";
      unsignedTransaction: string;
      selectedAccount: string;
      identities: string[];
    }
  | {
      step: 4;
      role: "coordinator";
      unsignedTransaction: string;
      selectedAccount: string;
      identities: string[];
    };

export type Step5CreateSigningCommitment =
  | {
      step: 5;
      role: "participant";
      unsignedTransaction: string;
      selectedAccount: string;
      identities: string[];
      txHash: string;
    }
  | {
      step: 5;
      role: "coordinator";
      unsignedTransaction: string;
      selectedAccount: string;
      identities: string[];
      txHash: string;
    };

export type Step6CreateSigningPackage =
  | {
      step: 6;
      role: "participant";
      unsignedTransaction: string;
      selectedAccount: string;
      identities: string[];
      txHash: string;
    }
  | {
      step: 6;
      role: "coordinator";
      unsignedTransaction: string;
      selectedAccount: string;
      identities: string[];
      commitments: string[];
      txHash: string;
    };

export type Step7CreateSignatureShare =
  | {
      step: 7;
      role: "participant";
      unsignedTransaction: string;
      selectedAccount: string;
      identities: string[];
      txHash: string;
      signingPackage: string;
    }
  | {
      step: 7;
      role: "coordinator";
      unsignedTransaction: string;
      selectedAccount: string;
      identities: string[];
      commitments: string[];
      txHash: string;
      signingPackage: string;
    };

export type Step8AggregateSignatureSharesAndBroadcast =
  | {
      step: 8;
      role: "participant";
      unsignedTransaction: string;
      selectedAccount: string;
      identities: string[];
      txHash: string;
      signingPackage: string;
    }
  | {
      step: 8;
      role: "coordinator";
      unsignedTransaction: string;
      selectedAccount: string;
      identities: string[];
      commitments: string[];
      txHash: string;
      signingPackage: string;
      signatureShares: string[];
    };

export type SigningRole = "participant" | "coordinator";

export type SigningState =
  | Step1ChoseRole
  | Step2GetUnsignedTransaction
  | Step3CollectIdentities
  | Step4ReviewTransaction
  | Step5CreateSigningCommitment
  | Step6CreateSigningPackage
  | Step7CreateSignatureShare
  | Step8AggregateSignatureSharesAndBroadcast;

const messages = defineMessages({
  multisigHeading: {
    defaultMessage: "Multisig Transaction",
  },
  multisigText: {
    defaultMessage: "Put an explantaion here",
  },
  multisigSelectRoleHeading: {
    defaultMessage: "Select Role",
  },
  multisigSelectRoleText: {
    defaultMessage:
      "Coordinators are responsible for gathering and combining all signatures and other information from participants. Participants sign the transaction and send their signatures and other data to the coordinator.",
  },
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
      <WithExplanatorySidebar
        heading={formatMessage(messages.multisigSelectRoleHeading)}
        description={formatMessage(messages.multisigSelectRoleText)}
        imgSrc={octopus}
      >
        <SelectRole onChange={(role) => setSigningStep({ step: 2, role })} />
      </WithExplanatorySidebar>
    );
  } else if (step === 2) {
    return (
      <GetUnsignedTransaction
        {...signingStep}
        onSubmit={({ unsignedTransaction, selectedAccount }) => {
          setSigningStep({
            ...signingStep,
            step: 3,
            unsignedTransaction,
            selectedAccount,
          });
        }}
      />
    );
  } else if (step === 3) {
    return (
      <WithExplanatorySidebar
        heading={formatMessage(messages.multisigCollectIdentitiesHeading)}
        description={formatMessage(messages.multisigCollectIdentitiesText)}
        imgSrc={octopus}
      >
        <CollectIdentities
          onSubmit={(identities) =>
            setSigningStep({ ...signingStep, step: 4, identities })
          }
        />
      </WithExplanatorySidebar>
    );
  } else if (step === 4) {
    return (
      <WithExplanatorySidebar
        heading={formatMessage(messages.multisigReviewTransactionHeading)}
        description={formatMessage(messages.multisigReviewTransactionText)}
        imgSrc={octopus}
      >
        <ReviewTransaction
          {...signingStep}
          onSubmit={(txHash) =>
            setSigningStep({ ...signingStep, step: 5, txHash })
          }
        />
      </WithExplanatorySidebar>
    );
  } else if (step === 5) {
    return (
      <WithExplanatorySidebar
        heading={formatMessage(messages.multisigSigningCommitmentHeading)}
        description={formatMessage(messages.multisigSigningCommitmentText)}
        imgSrc={octopus}
      >
        <CreateSigningCommitment
          {...signingStep}
          onSubmit={(commitments) => {
            if (signingStep.role === "participant") {
              setSigningStep({ ...signingStep, step: 6 });
            } else {
              setSigningStep({
                ...signingStep,
                step: 6,
                commitments: commitments,
              });
            }
          }}
        />
      </WithExplanatorySidebar>
    );
  } else if (step === 6) {
    if (signingStep.role === "participant") {
      return (
        <WithExplanatorySidebar
          heading={formatMessage(messages.multisigSigningPackageHeading)}
          description={formatMessage(
            messages.multisigSigningPackageParticipantText,
          )}
          imgSrc={octopus}
        >
          <EnterSigningPackage
            onSubmit={(signingPackage) =>
              setSigningStep({ ...signingStep, step: 7, signingPackage })
            }
          />
        </WithExplanatorySidebar>
      );
    }

    return (
      <WithExplanatorySidebar
        heading={formatMessage(messages.multisigSigningPackageHeading)}
        description={formatMessage(
          messages.multisigSigningPackageCoordinatorText,
        )}
        imgSrc={octopus}
      >
        <CreateSigningPackage
          {...signingStep}
          onSubmit={(signingPackage) => {
            setSigningStep({ ...signingStep, step: 7, signingPackage });
          }}
        />
      </WithExplanatorySidebar>
    );
  } else if (step === 7) {
    const description =
      signingStep.role === "participant"
        ? formatMessage(messages.multisigSignatureShareParticipantText)
        : formatMessage(messages.multisigSignatureShareCoordinatorText);

    return (
      <WithExplanatorySidebar
        heading={formatMessage(messages.multisigSignatureShareHeading)}
        description={description}
        imgSrc={octopus}
      >
        <CreateSignatureShare
          {...signingStep}
          onSubmit={(signatureShares) => {
            if (signingStep.role === "participant") {
              setSigningStep({ ...signingStep, step: 8 });
            } else {
              setSigningStep({ ...signingStep, step: 8, signatureShares });
            }
          }}
        />
      </WithExplanatorySidebar>
    );
  } else if (step === 8) {
    if (signingStep.role === "participant") {
      return (
        <WithExplanatorySidebar
          heading={"Signing Complete"}
          description={
            "The coordinator should have all the signatures and submit the transaction to the network."
          }
          imgSrc={octopus}
        >
          <div>
            <h1></h1>
            <PillButton
              mt={8}
              height="60px"
              px={8}
              onClick={() => setSigningStep({ step: 1 })}
            >
              Finish
            </PillButton>
          </div>
        </WithExplanatorySidebar>
      );
    }

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
