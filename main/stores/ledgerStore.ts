import Store, { Schema } from "electron-store";

const STORE_NAME = "ledger";

const schema: Schema<{
  ledgerAccountsMapping: Record<string, boolean>;
}> = {
  ledgerAccountsMapping: {
    type: "object",
  },
};

class LedgerStore {
  private store = new Store({
    name: STORE_NAME,
    schema,
  });

  setIsLedgerAccount = async (
    publicKey: string,
    isLedgerAccount: boolean = true,
  ) => {
    const ledgerAccountsMapping = await this.store.get(
      "ledgerAccountsMapping",
      {},
    );
    ledgerAccountsMapping[publicKey] = isLedgerAccount;
    this.store.set("ledgerAccountsMapping", ledgerAccountsMapping);
  };

  getIsLedgerAccount = async (publicKey: string) => {
    const ledgerAccountsMapping = await this.store.get(
      "ledgerAccountsMapping",
      {},
    );
    return ledgerAccountsMapping[publicKey] ?? false;
  };
}

export const ledgerStore = new LedgerStore();
