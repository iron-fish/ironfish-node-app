import { ironfish } from "../ironfish";

type InitialState =
  | "create-account"
  | "snapshot-download-prompt"
  | "start-node";

let initialStateData: InitialState | null = null;

export async function handleGetInitialState(): Promise<InitialState> {
  if (initialStateData) return initialStateData;

  const sdk = await ironfish.sdk();

  if (sdk.internal.get("isFirstRun")) {
    initialStateData = "snapshot-download-prompt";
  }

  initialStateData = "start-node";

  return initialStateData;
}
