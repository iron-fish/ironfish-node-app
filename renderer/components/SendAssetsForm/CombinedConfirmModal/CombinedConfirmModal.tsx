// import {
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalBody,
//   ModalFooter,
//   Heading,
//   Box,
//   Progress,
// } from "@chakra-ui/react";
// import { useCallback, useEffect, useState } from "react";
// import { defineMessages, useIntl } from "react-intl";
// import { Control } from "react-hook-form";

// import { AssetOptionType } from "@/components/AssetAmountInput/utils";
// import { trpcReact, TRPCRouterOutputs } from "@/providers/TRPCProvider";
// import { PillButton } from "@/ui/PillButton/PillButton";

// import { ReviewTransaction } from "../SharedConfirmSteps/ReviewTransaction";
// import { SubmissionError } from "../SharedConfirmSteps/SubmissionError";
// import { TransactionSubmitted } from "../SharedConfirmSteps/TransactionSubmitted";
// import { TransactionData, TransactionFormData } from "../transactionSchema";
// import { StepConfirm } from "./Steps/StepConfirm";
// import { StepConnect } from "./Steps/StepConnect";

// const messages = defineMessages({
//   cancel: {
//     defaultMessage: "Cancel",
//   },
//   continue: {
//     defaultMessage: "Continue",
//   },
//   submittingTransaction: {
//     defaultMessage: "Submitting Transaction",
//   },
// });

// type LedgerStatus = {
//   isLedgerConnected: boolean;
//   isLedgerUnlocked: boolean;
//   isIronfishAppOpen: boolean;
//   publicAddress: string;
//   deviceName: string;
// };

// type Props = {
//   isOpen: boolean;
//   transactionData: TransactionData;
//   selectedAccount: TRPCRouterOutputs["getAccounts"][number];
//   selectedAsset?: AssetOptionType;
//   onCancel: () => void;
//   control: Control<TransactionFormData>;
//   isLedgerTransaction: boolean;
// };

// export function ConfirmTransactionModal({
//   isOpen,
//   transactionData,
//   selectedAccount,
//   selectedAsset,
//   onCancel,
//   control,
//   isLedgerTransaction,
// }: Props) {
//   const { formatMessage } = useIntl();
//   const [step, setStep] = useState<
//     | "IDLE"
//     | "CONNECT_LEDGER"
//     | "CONFIRM_TRANSACTION"
//     | "TRANSACTION_SUBMITTED"
//     | "SUBMISSION_ERROR"
//   >("IDLE");

//   const [
//     { isLedgerConnected, isLedgerUnlocked, isIronfishAppOpen },
//     setLedgerStatus,
//   ] = useState<LedgerStatus>(() => ({
//     isLedgerConnected: false,
//     isLedgerUnlocked: false,
//     isIronfishAppOpen: false,
//     publicAddress: "",
//     deviceName: "",
//   }));

//   const [_statusError, setStatusError] = useState("");

//   trpcReact.ledgerStatus.useSubscription(undefined, {
//     onData: (data) => {
//       setLedgerStatus(data);
//     },
//     onError: (err) => {
//       setStatusError(err.message);
//     },
//     enabled: isLedgerTransaction,
//   });

//   useEffect(() => {
//     if (
//       isLedgerTransaction &&
//       !["CONNECT_LEDGER", "SUBMISSION_ERROR"].includes(step) &&
//       (!isLedgerConnected || !isLedgerUnlocked || !isIronfishAppOpen)
//     ) {
//       setStep("CONNECT_LEDGER");
//     }
//   }, [
//     step,
//     isLedgerConnected,
//     isLedgerUnlocked,
//     isIronfishAppOpen,
//     isLedgerTransaction,
//   ]);

//   const {
//     mutate: sendTransaction,
//     data: sentTransactionData,
//     isLoading,
//     reset,
//     error,
//   } = isLedgerTransaction
//     ? trpcReact.submitLedgerTransaction.useMutation({
//         onSuccess: () => setStep("TRANSACTION_SUBMITTED"),
//         onError: () => setStep("SUBMISSION_ERROR"),
//       })
//     : trpcReact.sendTransaction.useMutation({
//         onSuccess: () => setStep("TRANSACTION_SUBMITTED"),
//         onError: () => setStep("SUBMISSION_ERROR"),
//       });

//   const { mutate: cancelTransaction } =
//     trpcReact.cancelSubmitLedgerTransaction.useMutation();

//   const handleClose = useCallback(() => {
//     if (isLedgerTransaction && step === "CONFIRM_TRANSACTION") {
//       cancelTransaction();
//     }
//     reset();
//     onCancel();
//   }, [isLedgerTransaction, onCancel, reset, step, cancelTransaction]);

//   const handleSubmit = useCallback(() => {
//     sendTransaction(transactionData);
//     if (isLedgerTransaction) {
//       setStep("CONFIRM_TRANSACTION");
//     }
//   }, [sendTransaction, transactionData, isLedgerTransaction]);

//   return (
//     <Modal isOpen={isOpen} onClose={handleClose}>
//       <ModalOverlay />
//       <ModalContent maxW="100%" width="600px">
//         {step === "IDLE" && (
//           <ReviewTransaction
//             transactionData={transactionData}
//             selectedAccount={selectedAccount}
//             selectedAsset={selectedAsset}
//             isLoading={isLoading}
//             onClose={handleClose}
//             onSubmit={
//               isLedgerTransaction
//                 ? () => setStep("CONNECT_LEDGER")
//                 : handleSubmit
//             }
//             control={control}
//           />
//         )}
//         {isLedgerTransaction && step === "CONNECT_LEDGER" && (
//           <>
//             <ModalBody px={16} pt={16}>
//               <StepConnect
//                 isLedgerConnected={isLedgerConnected}
//                 isLedgerUnlocked={isLedgerUnlocked}
//                 isIronfishAppOpen={isIronfishAppOpen}
//               />
//             </ModalBody>
//             <ModalFooter display="flex" gap={2} px={16} py={8}>
//               <PillButton
//                 size="sm"
//                 onClick={handleClose}
//                 variant="inverted"
//                 border={0}
//               >
//                 {formatMessage(messages.cancel)}
//               </PillButton>
//               <PillButton
//                 size="sm"
//                 isDisabled={
//                   isLoading ||
//                   !isLedgerConnected ||
//                   !isLedgerUnlocked ||
//                   !isIronfishAppOpen
//                 }
//                 onClick={handleSubmit}
//               >
//                 {formatMessage(messages.continue)}
//               </PillButton>
//             </ModalFooter>
//           </>
//         )}
//         {isLedgerTransaction && step === "CONFIRM_TRANSACTION" && (
//           <>
//             <ModalBody px={16} pt={16}>
//               <StepConfirm />
//             </ModalBody>
//             <ModalFooter display="flex" gap={2} px={16} py={8}>
//               <PillButton
//                 size="sm"
//                 onClick={handleClose}
//                 variant="inverted"
//                 border={0}
//               >
//                 {formatMessage(messages.cancel)}
//               </PillButton>
//             </ModalFooter>
//           </>
//         )}
//         {!isLedgerTransaction && isLoading && (
//           <ModalBody px={16} pt={16}>
//             <Heading fontSize="2xl" mb={8}>
//               {formatMessage(messages.submittingTransaction)}
//             </Heading>
//             <Box py={8}>
//               <Progress size="sm" isIndeterminate />
//             </Box>
//           </ModalBody>
//         )}
//         {step === "TRANSACTION_SUBMITTED" && (
//           <TransactionSubmitted
//             fromAccount={selectedAccount.name}
//             transactionHash={sentTransactionData?.hash ?? ""}
//             handleClose={handleClose}
//           />
//         )}
//         {step === "SUBMISSION_ERROR" && (
//           <SubmissionError
//             errorMessage={error?.message ?? "Unknown error"}
//             isLoading={isLoading}
//             handleClose={handleClose}
//             handleSubmit={handleSubmit}
//           />
//         )}
//       </ModalContent>
//     </Modal>
//   );
// }
