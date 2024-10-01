import { useState } from "react";

import { PillButton } from "@/ui/PillButton/PillButton";

import { AggregateSignatureShares } from "./AggregateSignatureSharesAndBroadcast";
import { CreateSignatureShare } from "./CreateSignatureShare";
import { CreateSigningCommitment } from "./CreateSigningCommitment";
import { CreateSigningPackage, EnterSigningPackage } from "./CreateSigningPackage";
import { CreateUnsignedTransactionForm } from "./CreateUnsignedTransactionForm";
import { ParticipantEnterUnsignedTransactionForm } from "./ParticipantEnterUnsignedTransaction";
import { ReviewTransaction } from "./ReviewTransaction";
import { SelectRole } from "./SelectRole";

type Step1ChoseRole = {
    step: 1
}

type Step2CreateUnsignedTransaction = {
    step: 2
    role: SigningRole
}

type Step3ReviewTransaction = {
    step: 3
    role: SigningRole
    unsignedTransaction: string
}

type Step4CreateSigningCommitment = {
    step: 4
    role: SigningRole
    unsignedTransaction: string
    hash: string
}

type Step5CreateSigningPackage = {
    step: 5
    role: "coordinator"
    unsignedTransaction: string
    signingCommitments: string[]
    hash: string
} | {
    step: 5
    role: "participant"
    unsignedTransaction: string
    hash: string
}

type Step6CreateSignatureShare = {
    step: 6
    role: "coordinator"
    unsignedTransaction: string
    signingCommitments: string[]
    hash: string
    signingPackage: string
} | {
    step: 6
    role: "participant"
    unsignedTransaction: string
    hash: string
    signingPackage: string
}

type Step7AggregateSignatureSharesAndBroadcast = {
    step: 7
    role: "coordinator"
    unsignedTransaction: string
    signingCommitments: string[]
    hash: string
    signingPackage: string
    signatureShares: string[]
} | {
    step: 7
    role: "participant"
    unsignedTransaction: string
    hash: string
    signingPackage: string
}

type SigningRole = "participant" | "coordinator"

type SigningState =
    Step1ChoseRole |
    Step2CreateUnsignedTransaction |
    Step3ReviewTransaction |
    Step4CreateSigningCommitment |
    Step5CreateSigningPackage |
    Step6CreateSignatureShare |
    Step7AggregateSignatureSharesAndBroadcast

export function SendMultisigLedgerAssetsFlow() {
    const [signingState, setSigningState] = useState<SigningState>({step: 1});
    const { step } = signingState;

    if(step === 1) {
        return <SelectRole
            onChange={(role) => setSigningState({step: 2, role})}
        />
    } else if(step === 2) {
        return <GetUnsignedTransaction role={signingState.role} onSubmit={({unsignedTransaction}) => {
            setSigningState({ step: 3, role: signingState.role, unsignedTransaction });
        }} />
    } else if(step === 3) {
        return <ReviewTransaction unsignedTransaction={signingState.unsignedTransaction} onSubmit={(hash) => {
            setSigningState({step: 4, role: signingState.role, unsignedTransaction: signingState.unsignedTransaction, hash });
        }} />
    } else if(step === 4) {
        return <CreateSigningCommitment role={signingState.role} txHash={signingState.hash} onSubmit={(commitments) => {
            if (signingState.role === "participant") {
                setSigningState({ ...signingState, role: signingState.role, step: 5 });
            } else {
                setSigningState({...signingState, step: 5, signingCommitments: commitments });
            }
        }} />
    } else if(step === 5) {
        // TODO: Pass in the account we're working with. We'll need to select the account for participants as well
        if(signingState.role === "participant") {
            return <EnterSigningPackage onSubmit={(signingPackage) => {
                setSigningState({ ...signingState, step: 6, signingPackage });
            }} />
        }

        return <CreateSigningPackage commitments={signingState.signingCommitments} unsignedTransaction={signingState.unsignedTransaction} onSubmit={(signingPackage) => {
            setSigningState({ ...signingState, step: 6, signingPackage });
        }} />
    } else if(step === 6) {
        return <CreateSignatureShare role={signingState.role} signingPackage={signingState.signingPackage} unsignedTransaction={signingState.unsignedTransaction} onSubmit={(signatureShares) => {
            if (signingState.role === "participant") {
                setSigningState({ ...signingState, step: 7 });
            } else {
                setSigningState({ ...signingState, step: 7, signatureShares });
            }
        }} />
    } else if(step === 7) {
        if(signingState.role === "participant") {
            return <div>
                <h1>Waiting for coordinator to aggregate signature shares</h1>
                <PillButton
                    mt={8}
                    height="60px"
                    px={8}
                    onClick={() => setSigningState({ step: 1 })}
                >
                    Finish
                </PillButton>
            </div>
        }
        return <AggregateSignatureShares signingPackage={signingState.signingPackage} signatureShares={signingState.signatureShares} onSubmit={() => {
            setSigningState({ step: 1 });
        }}/>
    }
}


function GetUnsignedTransaction({ role, onSubmit }: { role: SigningRole, onSubmit: (transactionInfo: {unsignedTransaction: string}) => void }) {
    if (role === "coordinator") {
        return <CreateUnsignedTransactionForm onSubmit={(unsignedTransaction) => {
            onSubmit({unsignedTransaction})
        }} />
    }

    return <ParticipantEnterUnsignedTransactionForm onSubmit={(unsignedTransaction) => {
        onSubmit({unsignedTransaction})
    }} />
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
