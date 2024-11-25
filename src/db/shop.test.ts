import { beforeAll, test, expect } from '@jest/globals';
import { Database, migrateToLatest, createSQLiteDb } from './db.ts'
import * as Shop from "./shop.ts";
import * as Item from "./item.ts";

let db: Database;
beforeAll(async () => {
  db = createSQLiteDb();
  migrateToLatest(db, "sqlite");
})

test("create", async () => {
  const i = Shop.create();
  const o = Shop.create({ ...i, name: "" });
  expect(o).toEqual(i);
})

/*
test("insert", async () => {
  const item = Item.create({ uri: "onlyitem", name: "onlyitem" });
  const shop = Shop.create({uri: "onlyshop", item: [item]});
  await Item.insert(db, item);
})
  */
