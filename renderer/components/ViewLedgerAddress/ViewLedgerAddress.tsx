import { Box, Code, HStack, Spinner, Text, VStack } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";

const messages = defineMessages({
  appNotOpen: {
    defaultMessage:
      "Your Ledger device is locked or the Ironfish app is not open.",
  },
  transactionRejected: {
    defaultMessage: "The request was rejected on your Ledger device.",
  },
  viewAddressInstructions: {
    defaultMessage:
      "View the public address of your connected Ledger device by clicking the button below.",
  },
  deviceDisplayInstructions: {
    defaultMessage:
      "Your device will display its public address, and if you approve the request we will also display the address below.",
  },
  devicePrerequisites: {
    defaultMessage:
      "Ensure that your Ledger device is unlocked and that the Ironfish app is open before proceeding.",
  },
  approveRequest: {
    defaultMessage: "Please approve the request on your Ledger device.",
  },
  addressLabel: {
    defaultMessage: "Address:",
  },
  viewAddressButton: {
    defaultMessage: "View Address",
  },
  genericError: {
    defaultMessage: "Something went wrong, please try again.",
  },
});

function getErrorMessage(error: string) {
  if (error === "APP_NOT_OPEN") {
    return messages.appNotOpen;
  }

  if (error === "TRANSACTION_REJECTED") {
    return messages.transactionRejected;
  }

  return messages.genericError;
}

export function ViewLedgerAddress() {
  const { formatMessage } = useIntl();
  const { mutate, isLoading, data, error, isSuccess, isError } =
    trpcReact.verifyAddress.useMutation();

  return (
    <Box>
      <VStack alignItems="stretch">
        <Text>{formatMessage(messages.viewAddressInstructions)}</Text>

        <Text>{formatMessage(messages.deviceDisplayInstructions)}</Text>

        <Text>{formatMessage(messages.devicePrerequisites)}</Text>
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
              <VStack justifyContent="center" my={4} gap={4}>
                <Spinner opacity="0.5" size="lg" />
                <Text>{formatMessage(messages.approveRequest)}</Text>
              </VStack>
            ) : (
              <VStack alignItems="stretch">
                <Text fontWeight="bold">
                  {formatMessage(messages.addressLabel)}
                </Text>
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
            <Text as="pre">
              {formatMessage(getErrorMessage(error.message))}
            </Text>
          </Code>
        )}
      </Box>

      <HStack>
        <PillButton isDisabled={isLoading} onClick={() => mutate()}>
          {formatMessage(messages.viewAddressButton)}
        </PillButton>
      </HStack>
    </Box>
  );
}
