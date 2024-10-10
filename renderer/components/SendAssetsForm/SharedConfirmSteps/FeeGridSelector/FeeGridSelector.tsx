import { CheckIcon } from "@chakra-ui/icons";
import {
  Box,
  Grid,
  Text,
  Button,
  IconButton,
  HStack,
  VStack,
} from "@chakra-ui/react";
import Image from "next/image";
import React, { useState, KeyboardEvent } from "react";
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
import { formatOre } from "@/utils/ironUtils";
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
});

interface FeeOptionProps {
  label: string;
  fee: number;
  isSelected: boolean;
  onSelect: () => void;
}

const isPositiveValue = (val: string): boolean => {
  // Check for empty string
  if (val.trim() === "") return false;

  // Split the string by decimal point
  const splitVal = val.split(".");
  if (splitVal.length > 2) return false;

  const [integerVal, decimalVal] = splitVal;

  // Check if the input is just a decimal point
  if (integerVal === "" && decimalVal === undefined) return false;

  // Check if the integer Val is valid
  if (integerVal !== "" && !/^(0|[1-9]\d*)$/.test(integerVal)) return false;

  // Check if the decimal Val is valid (if it exists)
  if (decimalVal !== undefined && !/^\d+$/.test(decimalVal)) return false;

  // Parse the number and check if it's greater than 0
  const num = parseFloat(val);
  return !isNaN(num) && num > 0;
};

const FeeOption: React.FC<FeeOptionProps> = ({
  label,
  fee,
  isSelected,
  onSelect,
}) => {
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
            {label}
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
    resetField,
    formState: { errors },
  } = useFormContext();
  const { formatMessage } = useIntl();
  const fee = useWatch({ control, name: "fee" });
  const customFee = useWatch({ control, name: "customFee" });

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
      if (isPositiveValue(customFee)) {
        setShowGrid(false);
      }
    }
  };

  if (!estimatedFeesData) {
    return <Text>Loading...</Text>;
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
                    resetField("customFee");
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
                      isPositiveValue(customFeeField.value) &&
                        setShowGrid(false);
                    }}
                    label={formatMessage(messages.custom)}
                    onFocus={() => feeField.onChange("custom")}
                    onChange={(e) => {
                      normalizeAmountInputChange({
                        changeEvent: e,
                        selectedAsset,
                        onChange: (value) => {
                          customFeeField.onChange(value);
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
                          isDisabled={!isPositiveValue(customFeeField.value)}
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
      <RenderError error={errors.customFee?.message} />
    </Box>
  );
};

export default FeeGridSelector;
