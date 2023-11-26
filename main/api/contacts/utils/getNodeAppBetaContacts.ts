import fs from "fs";
import os from "os";
import path from "path";

import NeDBStorage from "nedb";

type BetaContact = {
  name: string;
  address: string;
};

let nedb: NeDBStorage;

export function getNodeAppBetaContacts(): Promise<Array<BetaContact>> {
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
