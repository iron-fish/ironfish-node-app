import { getAccount } from "./utils/getAccount";

export async function handleGetAccount({ name }: { name: string }) {
  return getAccount(name);
}
