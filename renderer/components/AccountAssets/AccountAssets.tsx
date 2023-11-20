import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  LightMode,
  Text,
} from "@chakra-ui/react";
import Image from "next/image";
import NextLink from "next/link";

import treasureChest from "@/images/treasure-chest.svg";
import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";
import { ArrowReceive } from "@/ui/SVGs/ArrowReceive";
import { ArrowSend } from "@/ui/SVGs/ArrowSend";
import { hexToUTF16String } from "@/utils/hexToUTF16String";
import { formatOre } from "@/utils/ironUtils";

export function AccountAssets({ accountName }: { accountName: string }) {
  const { data } = trpcReact.getAccount.useQuery({
    name: accountName,
  });

  if (!data) {
    // @todo: Error handling
    return null;
  }

  return (
    <Box>
      <LightMode>
        <ShadowCard
          contentContainerProps={{
            bg: COLORS.VIOLET,
            p: 8,
          }}
          mb={10}
        >
          <Heading color={COLORS.BLACK} fontSize={24} mb={4}>
            Your Assets
          </Heading>
          <HStack
            bg="rgba(255, 255, 255, 0.15)"
            p={8}
            borderRadius="7px"
            justifyContent="space-between"
          >
            <Flex alignItems="flex-start" flexDirection="column">
              <Text fontSize="lg" mb={2}>
                $IRON
              </Text>
              <Heading as="span" color="black" mb={5}>
                {formatOre(data.balances.iron.confirmed)}
              </Heading>
              <HStack alignItems="stretch" justifyContent="center">
                <NextLink href={`/send?account=${accountName}`}>
                  <Box>
                    <PillButton as="div">
                      <ArrowSend transform="scale(0.8)" />
                      Send
                    </PillButton>
                  </Box>
                </NextLink>
                <NextLink href={`/receive?account=${accountName}`}>
                  <Box>
                    <PillButton as="div">
                      <ArrowReceive transform="scale(0.8)" />
                      Receive
                    </PillButton>
                  </Box>
                </NextLink>
              </HStack>
            </Flex>
            <Image alt="" src={treasureChest} />
          </HStack>

          {data.balances.custom.length > 0 && (
            <Box
              bg="rgba(255, 255, 255, 0.15)"
              p={8}
              mt={8}
              borderRadius="7px"
              justifyContent="space-between"
            >
              <Text fontSize="lg" mb={4}>
                Other Assets
              </Text>
              <Grid
                gap={4}
                templateColumns={
                  data.balances.custom.length > 1 ? "repeat(2, 1fr)" : "1fr"
                }
              >
                {data.balances.custom.map((balance) => {
                  return (
                    <GridItem
                      key={balance.assetId}
                      bg="rgba(255, 255, 255, 0.15)"
                      display="flex"
                      alignItems="center"
                      p={4}
                      borderRadius="4px"
                    >
                      <Text fontSize="lg" flexGrow={1} as="span">
                        {hexToUTF16String(balance.asset.name)}
                      </Text>
                      <Text fontSize="lg">{formatOre(balance.confirmed)}</Text>
                    </GridItem>
                  );
                })}
              </Grid>
            </Box>
          )}
        </ShadowCard>
      </LightMode>
    </Box>
  );
}
