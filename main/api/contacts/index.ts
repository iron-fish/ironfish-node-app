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

class ContactsUtil {
  store = new Store({ schema, name: "contacts" });
  contactsByAddress: Map<string, Contact> = new Map();

  constructor() {
    this.init();
  }

  init() {
    const contacts = this.store.get("contacts", []);
    const deduped = contacts.filter((contact) => {
      if (this.contactsByAddress.has(contact.address)) {
        return false;
      }
      this.contactsByAddress.set(contact.address, contact);
      return true;
    });
    this.store.set("contacts", deduped);
  }

  getContacts() {
    return this.store.get("contacts", []);
  }

  getContactByAddress(address: string) {
    return this.contactsByAddress.get(address) ?? null;
  }

  addContact({ name, address }: { name: string; address: string }) {
    if (this.contactsByAddress.has(address)) {
      throw new Error("DUPLICATE_CONTACT_ERROR");
    }

    const contacts = this.getContacts();

    contacts.push({
      id: uuidv4(),
      name,
      address,
      order: contacts.length,
    });

    this.store.set("contacts", contacts);

    return contacts;
  }

  editContact({
    id,
    name,
    address,
  }: {
    id: string;
    name: string;
    address: string;
  }) {
    const contacts = this.getContacts();
    const index = contacts.findIndex((contact) => contact.id === id);

    if (index > -1) {
      contacts[index] = {
        id,
        name,
        address,
        order: contacts[index].order,
      };
      this.store.set("contacts", contacts);
    }

    return contacts;
  }

  deleteContact(id: string) {
    const contacts = this.getContacts();
    const index = contacts.findIndex((contact) => contact.id === id);

    if (index > -1) {
      const contact = contacts[index];
      this.contactsByAddress.delete(contact.address);
      contacts.splice(index, 1);
      this.store.set("contacts", contacts);
    }

    return contacts;
  }
}

const contactsUtil = new ContactsUtil();

export const contactsRouter = t.router({
  getContacts: t.procedure.query(async () => {
    return contactsUtil.getContacts();
  }),
  getContactByAddress: t.procedure
    .input(
      z.object({
        address: z.string(),
      }),
    )
    .query(async (opts) => {
      return contactsUtil.getContactByAddress(opts.input.address);
    }),
  addContact: t.procedure
    .input(
      z.object({
        name: z.string(),
        address: z.string(),
      }),
    )
    .mutation(async (opts) => {
      return contactsUtil.addContact(opts.input);
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
      return contactsUtil.editContact(opts.input);
    }),
  deleteContact: t.procedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async (opts) => {
      return contactsUtil.deleteContact(opts.input.id);
    }),
});
