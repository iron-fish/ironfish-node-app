import { z } from "zod";

import { ContactSchema } from "./Contact";
import SortType from "./SortType";
import { manager } from "../../manager";
import { t } from "../../trpc";

export const addressBookRouter = t.router({
  v1GetContacts: t.procedure.input(z.string()).query((opts) => {
    return manager.v1AddressBook.list(opts.input, SortType.ASC);
  }),
  v1AddContact: t.procedure.input(ContactSchema).mutation(async (opts) => {
    return manager.v1AddressBook.add(opts.input);
  }),
  v1DeleteContact: t.procedure.input(z.string()).mutation(async (opts) => {
    return manager.v1AddressBook.delete(opts.input);
  }),
});
