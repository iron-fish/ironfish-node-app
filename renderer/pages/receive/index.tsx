import { Heading, Flex, Box, Text, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { AccountAddressDisplay } from "@/components/AccountAddressDisplay/AccountAddressDisplay";
import octopus from "@/images/octopus.svg";
import MainLayout from "@/layouts/MainLayout";
import { TRPCRouterOutputs, trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { Select } from "@/ui/Forms/Select/Select";

const dataSchema = z.object({
  account: z.string().min(1),
});

export function ReceiveAccountsContent({
  accountsData,
}: {
  accountsData: TRPCRouterOutputs["getAccounts"];
}) {
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
      <Heading>Receive</Heading>

      <Flex gap={16}>
        <Box
          maxW={{
            base: "100%",
            lg: "592px",
          }}
          w="100%"
        >
          <VStack alignItems="stretch" gap={8} mt={5}>
            <Select
              {...register("account")}
              value={addressValue}
              label="From"
              options={accountOptions}
              error={errors.account?.message}
            />
            <AccountAddressDisplay address={addressValue} />
          </VStack>
        </Box>
        <Box
          display={{
            base: "none",
            lg: "block",
          }}
        >
          <Heading fontSize="2xl" mb={4}>
            Transaction Details
          </Heading>
          <Text fontSize="sm" maxW="340px" mb={8} color={COLORS.GRAY_MEDIUM}>
            You can share your public address with whomever you choose to
            receive payments. Your account will remain completely private, and
            individuals with this public address will not be able to see any of
            your other transfers or balances.
          </Text>
          <Image src={octopus} alt="" />
        </Box>
      </Flex>
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
