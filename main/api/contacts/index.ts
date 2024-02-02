import Store, { Schema } from "electron-store";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { t } from "../trpc";

const contactDefinition = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  order: z.number(),
  note: z.string().optional(),
});

type Contact = z.infer<typeof contactDefinition>;

const schema: Schema<{
  contacts: Contact[];
}> = {
  contacts: {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        address: { type: "string" },
        order: { type: "number" },
        note: { type: "string" },
      },
      required: ["id", "name", "address"],
      additionalProperties: false,
    },
  },
};

export const store = new Store({ schema, name: "contacts" });

export const contactsRouter = t.router({
  getContacts: t.procedure.query(async () => {
    return store.get("contacts", []);
  }),
  getContactByAddress: t.procedure
    .input(
      z.object({
        address: z.string(),
      }),
    )
    .query(async (opts) => {
      const contacts = store.get("contacts", []);
      return (
        contacts.find((contact) => contact.address === opts.input.address) ??
        null
      );
    }),
  addContact: t.procedure
    .input(
      z.object({
        name: z.string(),
        address: z.string(),
      }),
    )
    .mutation(async (opts) => {
      const contacts = store.get("contacts", []);
      contacts.push({
        id: uuidv4(),
        name: opts.input.name,
        address: opts.input.address,
        order: contacts.length,
      });
      store.set("contacts", contacts);
      return contacts;
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
      const contacts = store.get("contacts", []);
      const index = contacts.findIndex(
        (contact) => contact.id === opts.input.id,
      );

      if (index > -1) {
        contacts[index] = {
          id: opts.input.id,
          name: opts.input.name,
          address: opts.input.address,
          order: contacts[index].order,
        };
        store.set("contacts", contacts);
      }

      return contacts;
    }),
  deleteContact: t.procedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async (opts) => {
      const contacts = store.get("contacts", []);
      const index = contacts.findIndex(
        (contact) => contact.id === opts.input.id,
      );

      if (index > -1) {
        contacts.splice(index, 1);
        store.set("contacts", contacts);
      }

      return contacts;
    }),
});
