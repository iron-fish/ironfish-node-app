import { Heading, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";
import * as z from "zod";

import { AccountAddressDisplay } from "@/components/AccountAddressDisplay/AccountAddressDisplay";
import octopus from "@/images/octopus.svg";
import MainLayout from "@/layouts/MainLayout";
import { WithExplanatorySidebar } from "@/layouts/WithExplanatorySidebar";
import { TRPCRouterOutputs, trpcReact } from "@/providers/TRPCProvider";
import { Select } from "@/ui/Forms/Select/Select";

const messages = defineMessages({
  receiveHeading: {
    defaultMessage: "Receive",
  },
  transactionDetailsHeading: {
    defaultMessage: "Transaction Details",
  },
  transactionDetailsText: {
    defaultMessage:
      "Share your address to receive payments while keeping your account details entirely private.",
  },
  fromLabel: {
    defaultMessage: "From",
  },
});

const dataSchema = z.object({
  account: z.string().min(1),
});

export function ReceiveAccountsContent({
  accountsData,
}: {
  accountsData: TRPCRouterOutputs["getAccounts"];
}) {
  const { formatMessage } = useIntl();
  const router = useRouter();
  const accountOptions = useMemo(() => {
    return accountsData?.map((account) => {
      return {
        label: account.name,
        value: account.address,
      };
    });
  }, [accountsData]);

  const defaultAccount = useMemo(() => {
    const queryMatch = accountOptions?.find(
      (option) => option.label === router.query.account,
    );

    return queryMatch ? queryMatch.value : accountOptions?.[0].value;
  }, [accountOptions, router.query.account]);

  const {
    register,
    formState: { errors },
    watch,
  } = useForm<z.infer<typeof dataSchema>>({
    resolver: zodResolver(dataSchema),
    defaultValues: {
      account: defaultAccount,
    },
  });

  const addressValue = watch("account");

  return (
    <MainLayout>
      <Heading mb={5}>{formatMessage(messages.receiveHeading)}</Heading>

      <WithExplanatorySidebar
        heading={formatMessage(messages.transactionDetailsHeading)}
        description={formatMessage(messages.transactionDetailsText)}
        imgSrc={octopus}
      >
        <VStack alignItems="stretch" gap={4}>
          <Select
            {...register("account")}
            value={addressValue}
            label={formatMessage(messages.fromLabel)}
            options={accountOptions}
            error={errors.account?.message}
          />
          <AccountAddressDisplay address={addressValue} />
        </VStack>
      </WithExplanatorySidebar>
    </MainLayout>
  );
}

export default function ReceiveAccounts() {
  const { data: accountsData } = trpcReact.getAccounts.useQuery();

  if (!accountsData) {
    return null;
  }

  return <ReceiveAccountsContent accountsData={accountsData} />;
}
