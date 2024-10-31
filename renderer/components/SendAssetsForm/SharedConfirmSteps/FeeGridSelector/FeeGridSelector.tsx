import { CheckIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  IconButton,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import Image from "next/image";
import React, { useMemo, useState, KeyboardEvent } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import {
  AssetOptionType,
  normalizeAmountInputChange,
} from "@/components/AssetAmountInput/utils";
import { TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { RenderError } from "@/ui/Forms/FormField/FormField";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { formatOre, parseIron } from "@/utils/ironUtils";
import { IRON_DECIMAL_PLACES } from "@shared/constants";

import edit from "../icons/edit.svg";

const messages = defineMessages({
  slow: {
    defaultMessage: "Slow",
  },
  average: {
    defaultMessage: "Average",
  },
  fast: {
    defaultMessage: "Fast",
  },
  custom: {
    defaultMessage: "Custom",
  },
  enterCustomValue: {
    defaultMessage: "Enter custom value",
  },
  fee: {
    defaultMessage: "Fee",
  },
  highFeeWarning: {
    defaultMessage:
      "Your custom fee is significantly higher than the fast fee.",
  },
  seeFeesInstructions: {
    defaultMessage:
      "Fill out the 'To' and 'Amount' fields to see estimated fees.",
  },
});

interface FeeOptionProps {
  label: string;
  fee: number;
  isSelected: boolean;
  onSelect: () => void;
}

const FeeOption: React.FC<FeeOptionProps> = ({
  label,
  fee,
  isSelected,
  onSelect,
}) => {
  const { formatMessage } = useIntl();
  return (
    <Button
      variant="outline"
      width="100%"
      height="100%"
      borderRadius="0"
      onClick={onSelect}
      border="1px solid"
      bg={isSelected ? COLORS.GRAY_LIGHT : "white"}
      _dark={{
        bg: isSelected
          ? COLORS.DARK_MODE.GRAY_MEDIUM
          : COLORS.DARK_MODE.GRAY_DARK,
        borderColor: COLORS.DARK_MODE.GRAY_MEDIUM,
      }}
    >
      <HStack width="100%" justifyContent="space-between">
        <VStack alignItems="flex-start">
          <Text fontWeight={200} color="muted" _dark={{ color: "muted" }}>
            {formatMessage(messages[label as keyof typeof messages])}
          </Text>
          <Text>{formatOre(fee)} $IRON</Text>
        </VStack>
        {isSelected && (
          <Box
            h={6}
            w={6}
            minW={6}
            bg={COLORS.GREEN_DARK}
            borderRadius="full"
            position="relative"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
          >
            <CheckIcon boxSize={3} />
          </Box>
        )}
      </HStack>
    </Button>
  );
};

interface FeeGridSelectorProps {
  estimatedFeesData: TRPCRouterOutputs["getEstimatedFees"] | undefined;
  selectedAsset: AssetOptionType;
}

const FeeGridSelector: React.FC<FeeGridSelectorProps> = ({
  estimatedFeesData,
  selectedAsset,
}) => {
  const [showGrid, setShowGrid] = useState(true);
  const {
    control,
    formState: { errors },
    clearErrors,
  } = useFormContext();
  const { formatMessage } = useIntl();
  const transactionFormData = useWatch();
  const fee = useWatch({ control, name: "fee" });
  const customFee = useWatch({ control, name: "customFee" });

  const showHighFeeWarning = useMemo(() => {
    if (
      transactionFormData.fee !== "custom" ||
      !transactionFormData.customFee ||
      !estimatedFeesData
    ) {
      return false;
    }
    const fastFee = estimatedFeesData.fast;
    const customFeeValue = parseIron(transactionFormData.customFee);
    return customFeeValue >= fastFee * 5;
  }, [
    transactionFormData.fee,
    transactionFormData.customFee,
    estimatedFeesData,
  ]);

  const getFormattedFee = () => {
    if (fee === "custom" && customFee) {
      return customFee;
    }
    if (estimatedFeesData && fee in estimatedFeesData) {
      return formatOre(
        estimatedFeesData[fee as keyof typeof estimatedFeesData],
      );
    }
    return formatOre(0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (Number(customFee) > 0) {
        setShowGrid(false);
      }
    }
  };

  if (!estimatedFeesData) {
    return <FeeGridSkeleton showGrid={showGrid} />;
  }

  return (
    <Box py={2} borderBottom="1.5px dashed #DEDFE2">
      {showGrid ? (
        <Controller
          name="fee"
          control={control}
          render={({ field: feeField }) => (
            <Grid pb={2} templateRows="1fr 1fr" templateColumns="1fr 1fr">
              {Object.entries(estimatedFeesData).map(([key, fee]) => (
                <FeeOption
                  key={key}
                  label={key}
                  fee={fee}
                  isSelected={feeField.value === key}
                  onSelect={() => {
                    feeField.onChange(key);
                    clearErrors("customFee");
                    setShowGrid(false);
                  }}
                />
              ))}
              <Controller
                name="customFee"
                control={control}
                render={({ field: customFeeField }) => (
                  <TextInput
                    value={
                      customFeeField.value && feeField.value === "custom"
                        ? customFeeField.value
                        : ""
                    }
                    onKeyDown={handleKeyDown}
                    onSubmit={() => {
                      Number(customFeeField.value) > 0 && setShowGrid(false);
                    }}
                    label={formatMessage(messages.custom)}
                    onFocus={() => feeField.onChange("custom")}
                    onChange={(e) => {
                      normalizeAmountInputChange({
                        changeEvent: e,
                        selectedAsset,
                        onChange: (value) => {
                          customFeeField.onChange(value);
                          clearErrors("root.serverError");
                          feeField.onChange("custom");
                        },
                        decimalsOverride: IRON_DECIMAL_PLACES,
                      });
                    }}
                    icon={
                      customFeeField.value && (
                        <IconButton
                          variant="ghost"
                          borderRadius="full"
                          color="white"
                          size="sm"
                          bg={COLORS.GREEN_DARK}
                          onClick={() => setShowGrid(false)}
                          aria-label="Save memo"
                          isDisabled={Number(customFeeField.value) <= 0}
                          _disabled={{
                            bg: COLORS.GREEN_DARK,
                            opacity: 0.4,
                            cursor: "not-allowed",
                            _hover: { bg: COLORS.GREEN_DARK },
                          }}
                          icon={<CheckIcon />}
                        />
                      )
                    }
                    triggerProps={{
                      bg:
                        feeField.value === "custom"
                          ? COLORS.GRAY_LIGHT
                          : "white",
                      borderRadius: "0",
                    }}
                  />
                )}
              />
            </Grid>
          )}
        />
      ) : (
        <VStack flex="left" gap={0} alignItems="flex-start">
          <Text color={COLORS.GRAY_MEDIUM}>{formatMessage(messages.fee)}</Text>
          <HStack>
            <Text fontSize="md">
              {getFormattedFee()}
              {` `}
              $IRON
            </Text>
            <Button variant="ghost" size="sm" onClick={() => setShowGrid(true)}>
              <Image src={edit} alt="edit fee" />
            </Button>
          </HStack>
        </VStack>
      )}
      {showHighFeeWarning && (
        <Flex
          justifyContent="center"
          alignItems="center"
          bg="#FFE5DD"
          p={2}
          borderRadius={2}
        >
          <Text color={COLORS.RED}>
            {formatMessage(messages.highFeeWarning)}
          </Text>
        </Flex>
      )}
      <RenderError error={errors.customFee?.message} />
    </Box>
  );
};

const FeeGridSkeleton = ({ showGrid }: { showGrid: boolean }) => {
  const feeLabels = ["Slow", "Average", "Fast", "Custom"];
  const { formatMessage } = useIntl();
  return showGrid ? (
    <Box py={2} borderBottom="1.5px dashed #DEDFE2">
      <Grid
        height="128px"
        pb={2}
        templateRows="1fr 1fr"
        templateColumns="1fr 1fr"
      >
        {feeLabels.map((label) => (
          <Box
            border="1px solid"
            _dark={{
              background: COLORS.DARK_MODE.GRAY_DARK,
              borderColor: COLORS.DARK_MODE.GRAY_MEDIUM,
            }}
            p={3}
            key={label}
            height="100%"
          >
            <HStack width="100%" justifyContent="space-between">
              <VStack alignItems="flex-start">
                <Text
                  fontWeight={200}
                  color="muted"
                  _dark={{
                    color: "muted",
                  }}
                >
                  {label}
                </Text>
              </VStack>
            </HStack>
          </Box>
        ))}
      </Grid>
      <Text color="muted">{formatMessage(messages.seeFeesInstructions)}</Text>
    </Box>
  ) : (
    <Box py={2} borderBottom="1.5px dashed #DEDFE2">
      <Text color="muted">Fee</Text>
      <Skeleton my="1" width="40%" height="24px" />
      <Text color="muted">{formatMessage(messages.seeFeesInstructions)}</Text>
    </Box>
  );
};

export default FeeGridSelector;
