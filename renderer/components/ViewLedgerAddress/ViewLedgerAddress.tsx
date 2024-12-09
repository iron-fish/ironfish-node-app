import { Box, Code, HStack, Spinner, Text, VStack } from "@chakra-ui/react";

import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";

function getErrorMessage(error: string) {
  if (error === "APP_NOT_OPEN") {
    return "Your Ledger device is locked or the Ironfish app is not open.";
  }

  if (error === "TRANSACTION_REJECTED") {
    return "The transaction was rejected on your Ledger device.";
  }

  return error;
}

export function ViewLedgerAddress() {
  const { mutate, isLoading, data, error, isSuccess, isError } =
    trpcReact.verifyAddress.useMutation();

  return (
    <Box>
      <VStack alignItems="stretch">
        <Text>
          View the public address of your connected Ledger device by clicking
          the button below.
        </Text>

        <Text>
          Your device will display its public address, and if you approve the
          request we will also display the address below.
        </Text>

        <Text>
          Ensure that your Ledger device is unlocked and that the Ironfish app
          is open before proceeding.
        </Text>
      </VStack>

      <Box my={6}>
        {(isSuccess || isLoading) && (
          <VStack
            p={8}
            borderRadius={4}
            bg={COLORS.GRAY_LIGHT}
            alignItems="stretch"
            gap={4}
            _dark={{
              bg: "transparent",
              border: `1px solid ${COLORS.DARK_MODE.GRAY_MEDIUM}`,
            }}
          >
            {isLoading ? (
              <HStack justifyContent="center" my={4}>
                <Spinner opacity="0.5" size="lg" />
              </HStack>
            ) : (
              <VStack alignItems="stretch">
                <Text fontWeight="bold">Address:</Text>
                <Text>{data}</Text>
              </VStack>
            )}
          </VStack>
        )}

        {isError && (
          <Code
            colorScheme="red"
            p={4}
            maxH="400px"
            maxW="100%"
            w="100%"
            overflow="auto"
            mb={6}
          >
            <Text as="pre">{getErrorMessage(error.message)}</Text>
          </Code>
        )}
      </Box>

      <HStack>
        <PillButton isDisabled={isLoading} onClick={() => mutate()}>
          View Address
        </PillButton>
      </HStack>
    </Box>
  );
}
