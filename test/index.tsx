import { createSQLiteDb, migrateToLatest } from "#/db/db.ts";
import * as Item from "#/db/item.ts";

const db = createSQLiteDb("./test.db");
await migrateToLatest(db);

try {
  const i = Item.create({ uri: "uniqueuri",
    sellerDid: "bob",
    name: "thing",
    description: "here"
   });
  const res = await Item.insert(db, i);
  console.log(res);
} catch (e) {
  console.log(e);
}
