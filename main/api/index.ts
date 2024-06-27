import { accountRouter } from "./accounts";
import { chainportRouter } from "./chainport";
import { contactsRouter } from "./contacts";
import { intlRouter } from "./intl";
import { ironfishRouter } from "./ironfish";
import { snapshotRouter } from "./snapshot";
import { transactionRouter } from "./transactions";
import { t } from "./trpc";
import { updateRouter } from "./updates";
import { userSettingsRouter } from "./user-settings";
import { windowRouter } from "./window";

export const router = t.mergeRouters(
  accountRouter,
  transactionRouter,
  userSettingsRouter,
  snapshotRouter,
  ironfishRouter,
  windowRouter,
  contactsRouter,
  updateRouter,
  intlRouter,
  chainportRouter,
);

export type AppRouter = typeof router;
