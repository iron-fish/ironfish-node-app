import { accountRouter } from "./accounts";
import { contactsRouter } from "./contacts";
import { ironfishRouter } from "./ironfish";
import { snapshotRouter } from "./snapshot";
import { themeRouter } from "./theme";
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
  themeRouter,
);

export type AppRouter = typeof router;
