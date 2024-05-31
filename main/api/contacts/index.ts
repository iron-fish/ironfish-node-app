import { z } from "zod";

import { contactsStoreUtil } from "./utils/contactsStoreUtil";
import { t } from "../trpc";

export const contactsRouter = t.router({
  getContacts: t.procedure.query(async () => {
    return contactsStoreUtil.getContacts();
  }),
  getContactByAddress: t.procedure
    .input(
      z.object({
        address: z.string(),
      }),
    )
    .query(async (opts) => {
      return contactsStoreUtil.getContactByAddress(opts.input.address);
    }),
  addContact: t.procedure
    .input(
      z.object({
        name: z.string(),
        address: z.string(),
      }),
    )
    .mutation(async (opts) => {
      return contactsStoreUtil.addContact(opts.input);
    }),
  editContact: t.procedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        address: z.string(),
      }),
    )
    .mutation(async (opts) => {
      return contactsStoreUtil.editContact(opts.input);
    }),
  deleteContact: t.procedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async (opts) => {
      return contactsStoreUtil.deleteContact(opts.input.id);
    }),
});
