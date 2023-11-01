import { accountRouter } from "./accounts";
import { addressBookRouter } from "./address-book/v1";
import { ironfishRouter } from "./ironfish";
import { snapshotRouter } from "./snapshot";
import { transactionRouter } from "./transactions";
import { t } from "./trpc";
import { userSettingsRouter } from "./user-settings";
import { windowRouter } from "./window";

export const router = t.mergeRouters(
  accountRouter,
  transactionRouter,
  userSettingsRouter,
  snapshotRouter,
  addressBookRouter,
  ironfishRouter,
  windowRouter,
);

export type AppRouter = typeof router;
