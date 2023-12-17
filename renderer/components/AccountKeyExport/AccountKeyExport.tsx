import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  HStack,
  Menu,
  MenuButton,
  Button,
  MenuList,
  MenuItem,
  Text,
  VStack,
  Flex,
  Switch,
} from "@chakra-ui/react";
import type { AccountFormat } from "@ironfish/sdk";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";
import { downloadString } from "@/utils/downloadString";

import { ViewOnlyChip } from "../ViewOnlyChip/ViewOnlyChip";

type FormatTypes = `${AccountFormat}`;

const viewOnlyFormatOptions: Map<string, FormatTypes> = new Map([
  ["Bech32", "Bech32"],
  ["JSON", "JSON"],
]);

const formatOptions: Map<string, FormatTypes> = new Map([
  ["Bech32", "Bech32"],
  ["JSON", "JSON"],
  ["Mnemonic", "Mnemonic"],
  ["Spending Key", "SpendingKey"],
]);

const defaultFormat: FormatTypes = "Bech32";

export function AccountKeyExport({ accountName }: { accountName: string }) {
  const [exportFormat, setExportFormat] = useState<FormatTypes>(defaultFormat);
  const [viewOnlyChecked, setViewOnlyChecked] = useState<boolean>(false);

  if (accountName.length === 0) {
    throw new Error("Expected accountName to be a non-empty string");
  }

  const { data: accountData } = trpcReact.getAccount.useQuery({
    name: accountName,
  });

  useEffect(() => {
    if (
      viewOnlyChecked &&
      ![...viewOnlyFormatOptions.values()].includes(exportFormat)
    ) {
      setExportFormat(defaultFormat);
    }
  }, [exportFormat, viewOnlyChecked]);

  useEffect(() => {
    if (accountData?.status.viewOnly) {
      setViewOnlyChecked(true);
    }
  }, [accountData?.status.viewOnly]);

  const formatOptionsMap = [
    ...(viewOnlyChecked ? viewOnlyFormatOptions : formatOptions).entries(),
  ];
  const exportFormatDisplay =
    formatOptionsMap.find((m) => m[1] === exportFormat)?.[0] ?? "";

  const exportQuery = trpcReact.useUtils().exportAccount;

  return (
    <Flex>
      <VStack gap={4} alignItems={"flex-start"}>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            <HStack>
              <Text fontWeight="light">
                <FormattedMessage defaultMessage="Export Format:" />
              </Text>
              <Text>{exportFormatDisplay}</Text>
            </HStack>
          </MenuButton>
          <MenuList>
            {formatOptionsMap.map(([k, v]) => (
              <MenuItem key={v} onClick={() => setExportFormat(v)}>
                {k}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
        <HStack>
          <ViewOnlyChip />
          <Switch
            isDisabled={accountData?.status.viewOnly}
            isChecked={viewOnlyChecked}
            onChange={(c) => setViewOnlyChecked(c.target.checked)}
          />
        </HStack>
        <PillButton
          type="submit"
          height="60px"
          px={8}
          onClick={() => {
            exportQuery
              .fetch({
                name: accountName,
                format: exportFormat,
                viewOnly: viewOnlyChecked,
              })
              .then((c) => {
                if (typeof c.account !== "string") {
                  console.error("account should not be string");
                  return;
                }
                downloadString(
                  c.account,
                  `iron-fish-account-${exportFormat.toLowerCase()}-${accountName}`,
                );
              });
          }}
        >
          <FormattedMessage defaultMessage="Export Account" />
        </PillButton>
      </VStack>
    </Flex>
  );
}
