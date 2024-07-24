import Store, { Schema } from "electron-store";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

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

class ContactsStore {
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

    const contact = {
      id: uuidv4(),
      name,
      address,
      order: contacts.length,
    };

    contacts.push(contact);

    this.store.set("contacts", contacts);
    this.contactsByAddress.set(address, contact);

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
      this.contactsByAddress.set(address, contacts[index]);
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

  batchAddNodeAppBetaContacts(
    betaContacts: Array<{ name: string; address: string }>,
  ) {
    const contacts = this.getContacts();

    for (const betaContact of betaContacts) {
      if (!this.contactsByAddress.has(betaContact.address)) {
        const contact = {
          id: uuidv4(),
          name: betaContact.name,
          address: betaContact.address,
          order: contacts.length,
        };
        contacts.push(contact);
        this.contactsByAddress.set(contact.address, contact);
      }
    }

    this.store.set("contacts", contacts);
  }
}

export const contactsStore = new ContactsStore();
