import { ironfish } from "../ironfish";

export async function handleGetInitialState() {
  type InitialState =
    | "create-account"
    | "snapshot-download-prompt"
    | "continue-snapshot-download-prompt"
    | "sync-from-peers";

  const _sdk = await ironfish.sdk();

  const initialState: InitialState = "create-account";

  return initialState;
}
