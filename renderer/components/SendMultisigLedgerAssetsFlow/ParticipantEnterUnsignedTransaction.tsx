import { Box } from "@chakra-ui/react";
import { useState } from "react";

import { TextareaInput } from "@/ui/Forms/TextareaInput/TextareaInput";
import { PillButton } from "@/ui/PillButton/PillButton";

export function ParticipantEnterUnsignedTransactionForm({ onSubmit }: { onSubmit: (rawTransaction: string) => void }) {
    const [unsignedTransaction, setUnsignedTransaction] = useState("");
  
    return (
        <Box>
            <TextareaInput
                label="Enter Unsigned Transaction from Coordinator"
                value={unsignedTransaction}
                onChange={(e) => { setUnsignedTransaction(e.target.value) }}
            />
            <PillButton
                mt={8}
                height="60px"
                px={8}
                isDisabled={!unsignedTransaction}
                onClick={() => {
                    onSubmit(unsignedTransaction);
                }}
            >
                Next
            </PillButton>
        </Box>
    );
  }
