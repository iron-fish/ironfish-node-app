import { trpcReact } from "@/providers/TRPCProvider";
import {
  MnemonicPhrase,
  splitMnemonicPhrase,
} from "@/ui/Forms/MnemonicPhrase/MnemonicPhrase";

type Props = {
  accountName: string;
};

export function AccountMnemonicView({ accountName }: Props) {
  const { data: exportData } = trpcReact.exportAccount.useQuery(
    {
      name: accountName ?? "",
      format: "Mnemonic",
    },
    {
      enabled: !!accountName,
    },
  );

  if (!exportData) return null;

  if (typeof exportData.account !== "string") {
    throw new Error("Expected exportData.account to be a string");
  }

  return (
    <MnemonicPhrase
      readOnly
      phrase={splitMnemonicPhrase(exportData?.account)}
    />
  );
}
