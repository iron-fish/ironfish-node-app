import { z } from "zod";

import { contactsStore } from "../../stores/contactsStore";
import { t } from "../trpc";

export const contactsRouter = t.router({
  getContacts: t.procedure.query(async () => {
    return contactsStore.getContacts();
  }),
  getContactByAddress: t.procedure
    .input(
      z.object({
        address: z.string(),
      }),
    )
    .query(async (opts) => {
      return contactsStore.getContactByAddress(opts.input.address);
    }),
  addContact: t.procedure
    .input(
      z.object({
        name: z.string(),
        address: z.string(),
      }),
    )
    .mutation(async (opts) => {
      return contactsStore.addContact(opts.input);
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
      return contactsStore.editContact(opts.input);
    }),
  deleteContact: t.procedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async (opts) => {
      return contactsStore.deleteContact(opts.input.id);
    }),
});
