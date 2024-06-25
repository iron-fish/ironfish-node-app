import { ChevronRightIcon } from "@chakra-ui/icons";
import { Grid, GridItem, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { defineMessages, useIntl } from "react-intl";

import { ChakraLink } from "@/ui/ChakraLink/ChakraLink";
import { COLORS, getGradientByOrder } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";
import { ArrowSend } from "@/ui/SVGs/ArrowSend";

import { CopyToClipboard } from "../CopyToClipboard/CopyToClipboard";
import { FishIcon } from "../FishIcon/FishIcon";

const messages = defineMessages({
  contact: {
    defaultMessage: "Contact",
  },
  address: {
    defaultMessage: "Address",
  },
  send: {
    defaultMessage: "Send",
  },
});

export function ContactHeadings() {
  const { formatMessage } = useIntl();
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
        <Text as="span">{formatMessage(messages.contact)}</Text>
      </GridItem>
      <GridItem>
        <Text as="span">{formatMessage(messages.address)}</Text>
      </GridItem>
    </Grid>
  );
}

type Props = {
  name: string;
  address: string;
  order: number;
};

export function ContactRow({ name, address, order }: Props) {
  const router = useRouter();
  const { formatMessage } = useIntl();
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
          w="100%"
          gap={4}
        >
          <GridItem display="flex" alignItems="center" pl={8}>
            <FishIcon bg={getGradientByOrder(order)} mr={4} />
            <Text as="span">{name}</Text>
          </GridItem>
          <GridItem display="flex">
            <CopyToClipboard text={address} color="inherit" />
          </GridItem>
          <GridItem display="flex" alignItems="center" mr={4}>
            <PillButton
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                router.push(`/send?to=${address}`);
              }}
            >
              <ArrowSend transform="scale(0.8)" />
              {formatMessage(messages.send)}
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
