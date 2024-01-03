import { Flex, HStack, Text, ToastId, useToast } from "@chakra-ui/react";
import { ReactNode, useCallback } from "react";

import { COLORS } from "../colors";

type Props = {
  children: ReactNode;
  handleDismiss?: () => void;
};

export function Toast({ children, handleDismiss }: Props) {
  return (
    <Flex>
      <HStack
        bg="black"
        _dark={{
          bg: "white",
        }}
        px={6}
        py={4}
      >
        <Text
          color="white"
          textStyle="h4"
          _dark={{
            color: "black",
          }}
        >
          {children}
        </Text>
        {handleDismiss && (
          <Text
            color={COLORS.LIGHT_BLUE}
            as="button"
            onClick={handleDismiss}
            ml={4}
            _dark={{
              color: COLORS.LIGHT_BLUE,
            }}
          >
            Close
          </Text>
        )}
      </HStack>
    </Flex>
  );
}

export function useIFToast() {
  const toast = useToast();

  return useCallback(
    ({
      message,
      isClosable = true,
      duration = 3000,
    }: {
      message: string;
      isClosable?: boolean;
      duration?: number;
    }) => {
      let toastId: null | ToastId = null;
      toastId = toast({
        duration,
        render: () => (
          <Toast
            handleDismiss={
              isClosable
                ? () => {
                    if (toastId) {
                      toast.close(toastId);
                    }
                  }
                : undefined
            }
          >
            {message}
          </Toast>
        ),
        position: "bottom-left",
      });
    },
    [toast],
  );
}
