import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";

export function AggregateSignatureShares({ signingPackage, onSubmit, signatureShares }: { signingPackage: string, signatureShares: string[], onSubmit: () => void } ) {
    const {
        mutate: aggregateSignatureShares,
        data: result,
        isIdle,
        isLoading,
        isError,
        isSuccess,
        error,
        reset,
    } = trpcReact.aggregateSignatureShares.useMutation();

    if (isIdle) {
        <PillButton
            mt={8}
            height="60px"
            px={8}
            onClick={() => {
                aggregateSignatureShares({ signingPackage, signatureShares, broadcast: true });
            }}
        >
            Submit Transaction
        </PillButton>
    } else if (isSuccess) {
        return <div>
            <h1>Transaction Approved!</h1>
            {JSON.stringify(result)}
            <PillButton
                type="submit"
                height="60px"
                px={8}
                onClick={() => onSubmit()}
            >
                Finish
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
      <h1>Sending Transaction...</h1>
    </div>
  }
}
