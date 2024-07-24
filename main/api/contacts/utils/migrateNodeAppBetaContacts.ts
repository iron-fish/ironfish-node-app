import fs from "fs";
import os from "os";
import path from "path";

import NeDBStorage from "nedb";

import { contactsStore } from "../../../stores/contactsStore";

type BetaContact = {
  name: string;
  address: string;
};

let nedb: NeDBStorage;

function getNodeAppBetaContacts(): Promise<Array<BetaContact>> {
  const betaContactsDbPath = path.join(
    os.homedir(),
    "/.ironfish/node-app",
    "address_book.db",
  );

  if (!fs.existsSync(betaContactsDbPath)) {
    return Promise.resolve([]);
  }

  if (!nedb) {
    nedb = new NeDBStorage({
      filename: betaContactsDbPath,
      autoload: true,
      timestampData: true,
    });
  }

  return new Promise((resolve, reject) => {
    nedb.find({}, (err: unknown, docs: Array<BetaContact>) => {
      if (err) {
        reject(err);
      } else {
        resolve(docs || []);
      }
    });
  });
}

function deleteNodeAppBetaContacts(): void {
  const betaContactsDbPath = path.join(
    os.homedir(),
    "/.ironfish/node-app",
    "address_book.db",
  );

  if (fs.existsSync(betaContactsDbPath)) {
    fs.rmSync(betaContactsDbPath);
  }
}

export async function migrateNodeAppBetaContacts() {
  const betaContacts = await getNodeAppBetaContacts();
  contactsStore.batchAddNodeAppBetaContacts(betaContacts);
  deleteNodeAppBetaContacts();

  return contactsStore.getContacts();
}
