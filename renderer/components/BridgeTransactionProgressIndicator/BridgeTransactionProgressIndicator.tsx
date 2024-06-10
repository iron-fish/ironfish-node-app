import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { IoMdCheckmark } from "react-icons/io";
import { defineMessages, useIntl } from "react-intl";

import { TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { useChainportTransactionStatus } from "@/utils/chainport/useChainportTransactionStatus";

const messages = defineMessages({
  submitted: {
    defaultMessage: "Submitted",
  },
  bridgePending: {
    defaultMessage: "Preparing target txn",
  },
  bridgeSubmitted: {
    defaultMessage: "Submitted target txn",
  },
  complete: {
    defaultMessage: "Complete",
  },
});

const STEPS = [
  "iron_fish_submitted",
  "bridge_pending",
  "bridge_submitted",
  "complete",
];

const BAR_BG = "#D9D9D9";
const ICON_SIZE = "24px";
const PENDING_SIZE = "16px";

type Props = {
  transaction: TRPCRouterOutputs["getTransaction"]["transaction"];
};

export function BridgeTransactionProgressIndicator({ transaction }: Props) {
  const { formatMessage } = useIntl();

  const status = useChainportTransactionStatus(transaction);

  const progressWidth = useMemo(() => {
    if (status === "loading" || status === "failed") return 0;

    const sections = STEPS.length - 1;
    const padding = 100 / sections / 2;

    return Math.min(STEPS.indexOf(status) * (100 / sections) + padding, 100);
  }, [status]);

  if (status === "failed") {
    return null;
  }

  const currentStepIndex = STEPS.indexOf(status);

  return (
    <Box my={8} pb={8} maxW="650px" w="100%">
      <HStack justifyContent="space-between" position="relative">
        <Step
          status={currentStepIndex >= 0 ? "complete" : "pending"}
          align="left"
          label={formatMessage(messages.submitted)}
        />
        <Step
          status={currentStepIndex >= 1 ? "complete" : "pending"}
          align="center"
          label={formatMessage(messages.bridgePending)}
        />
        <Step
          status={currentStepIndex >= 2 ? "complete" : "pending"}
          align="center"
          label={formatMessage(messages.bridgeSubmitted)}
        />
        <Step
          status={currentStepIndex >= 3 ? "complete" : "pending"}
          align="right"
          label={formatMessage(messages.complete)}
        />
        <Box
          position="absolute"
          height="4px"
          width={`calc(100% - ${PENDING_SIZE})`}
          bg={BAR_BG}
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <Box
            height="100%"
            width={`${progressWidth}%`}
            backgroundImage={`linear-gradient(90deg, ${COLORS.PISTACHIO} 50%, ${COLORS.GREEN_DARK} 0)`}
            backgroundSize="4px 100%"
          />
        </Box>
      </HStack>
    </Box>
  );
}

function Step({
  label,
  status,
  align = "center",
}: {
  label: string;
  status: "pending" | "complete" | "failed";
  align?: "center" | "left" | "right";
}) {
  const labelPositionStyles = useMemo(() => {
    if (align === "center") {
      return {
        left: "50%",
        transform: "translateX(-50%)",
      };
    }
    if (align === "left") {
      return {
        left: 0,
      };
    }
    if (align === "right") {
      return {
        right: 0,
      };
    }
  }, [align]);

  const indicator = useMemo(() => {
    const borderColor = {
      pending: "transparent",
      complete: COLORS.GREEN_DARK,
      failed: COLORS.RED,
    }[status] as string;

    const icon = {
      pending: <Box boxSize={PENDING_SIZE} bg={BAR_BG} borderRadius="full" />,
      complete: <IoMdCheckmark color={borderColor} />,
      failed: <IoMdCheckmark color={borderColor} />,
    }[status];

    return (
      <Flex
        bg={
          {
            pending: "transparent",
            complete: COLORS.WHITE,
            failed: COLORS.RED,
          }[status]
        }
        border={`2px solid ${borderColor}`}
        alignItems="center"
        justifyContent="center"
        borderRadius="full"
        height={ICON_SIZE}
        width={ICON_SIZE}
        _dark={{
          bg: {
            pending: "transparent",
            complete: COLORS.DARK_MODE.BG,
            failed: COLORS.DARK_MODE.BG,
          }[status],
        }}
      >
        {icon}
      </Flex>
    );
  }, [status]);

  return (
    <Box position="relative" zIndex={1}>
      {indicator}
      <Text
        mt={1}
        position="absolute"
        whiteSpace="nowrap"
        top="100%"
        fontWeight="medium"
        {...labelPositionStyles}
      >
        {label}
      </Text>
    </Box>
  );
}
