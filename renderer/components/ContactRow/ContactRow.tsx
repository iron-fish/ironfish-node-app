import { ChevronRightIcon } from "@chakra-ui/icons";
import { Grid, GridItem, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

import { ChakraLink } from "@/ui/ChakraLink/ChakraLink";
import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";
import { ArrowSend } from "@/ui/SVGs/ArrowSend";

import { CopyAddress } from "../CopyAddress/CopyAddress";
import { FishIcon } from "../FishIcon/FishIcon";

export function ContactHeadings() {
  return (
    <Grid
      templateColumns={{
        base: `1fr 3fr auto`,
        md: `1fr 3fr auto 55px`,
      }}
      opacity="0.8"
      mb={4}
    >
      <GridItem pl={8}>
        <Text as="span">Contact</Text>
      </GridItem>
      <GridItem>
        <Text as="span">Address</Text>
      </GridItem>
    </Grid>
  );
}

type Props = {
  name: string;
  address: string;
};

export function ContactRow({ name, address }: Props) {
  const router = useRouter();
  return (
    <ChakraLink w="100%" href={`/address-book/${address}`}>
      <ShadowCard
        hoverable
        contentContainerProps={{
          display: "flex",
          alignItems: "center",
          p: 0,
          py: 5,
        }}
      >
        <Grid
          templateColumns={{
            base: `1fr 3fr auto`,
            md: `1fr 3fr auto 55px`,
          }}
          opacity="0.8"
          w="100%"
          gap={4}
        >
          <GridItem display="flex" alignItems="center" pl={8}>
            <FishIcon bg="pink" mr={4} />
            <Text as="span">{name}</Text>
          </GridItem>
          <GridItem display="flex">
            <CopyAddress address={address} color="inherit" />
          </GridItem>
          <GridItem display="flex" alignItems="center" mr={4}>
            <PillButton
              onClick={(e) => {
                e.preventDefault();
                // @todo: Set default "to" value
                router.push(`/send`);
              }}
            >
              <ArrowSend transform="scale(0.8)" />
              Send
            </PillButton>
          </GridItem>
          <GridItem
            alignItems="center"
            display={{
              base: "none",
              md: "flex",
            }}
          >
            <ChevronRightIcon
              boxSize={5}
              color={COLORS.GRAY_MEDIUM}
              _dark={{ color: COLORS.DARK_MODE.GRAY_LIGHT }}
            />
          </GridItem>
        </Grid>
      </ShadowCard>
    </ChakraLink>
  );
}
