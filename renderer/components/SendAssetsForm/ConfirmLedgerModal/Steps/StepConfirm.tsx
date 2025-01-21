import { Heading, ModalBody, ModalFooter } from "@chakra-ui/react";
import Image from "next/image";
import { useIntl, defineMessages } from "react-intl";

import { PillButton } from "@/ui/PillButton/PillButton";

import connectImage from "./assets/connect.svg";

const messages = defineMessages({
  heading: {
    defaultMessage: "Please approve the transaction on your device.",
  },
  cancel: {
    defaultMessage: "Cancel",
  },
});

type Props = {
  onCancel: () => void;
};

export function StepConfirm({ onCancel }: Props) {
  const { formatMessage } = useIntl();
  return (
    <>
      <ModalBody px={16} pt={16}>
        <Heading mb={4}>{formatMessage(messages.heading)}</Heading>
        <Image src={connectImage} alt="" />
      </ModalBody>
      <ModalFooter display="flex" gap={2} px={16} py={8}>
        <PillButton size="sm" onClick={onCancel} variant="inverted" border={0}>
          {formatMessage(messages.cancel)}
        </PillButton>
      </ModalFooter>
    </>
  );
}
