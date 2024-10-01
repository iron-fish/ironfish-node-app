import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";

export function ReviewTransaction({ unsignedTransaction, onSubmit}: { unsignedTransaction: string, onSubmit: (hash: string) => void } ) {
    const {
        mutate: reviewTransaction,
        data: txHash,
        isIdle,
        isLoading,
        isError,
        isSuccess,
        error,
        reset,
    } = trpcReact.reviewTransaction.useMutation();

    if (isIdle) {
        reviewTransaction({ unsignedTransaction });
    } else if (isSuccess) {
        return <div>
            <h1>Transaction Approved</h1>

            <PillButton
                type="submit"
                height="60px"
                px={8}
                onClick={() => onSubmit(txHash)}
            >
                {"Next"}
            </PillButton>
        </div>
  } else if (isError) {
    return <div>
      <h1>Error</h1>
      <p>{error.message}</p>
      <PillButton
          mt={8}
          height="60px"
          px={8}
          onClick={reset}
      >
          Retry
      </PillButton>
    </div>
  } else if (isLoading) {
    return <div>
      <h1>Reviewing and approve transaction on ledger...</h1>
      {JSON.stringify(unsignedTransaction)}
    </div>
  }

}
