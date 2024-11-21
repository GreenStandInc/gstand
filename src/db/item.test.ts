import * as fsp from 'fs/promises';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { createSQLiteDb, type DatabaseSchema, migrateToLatest } from "./db.ts";
import * as Item from "./item.ts";
import { beforeAll, describe, expect, test } from '@jest/globals';
import { Database } from './db.ts';

let db: Database;

beforeAll(async () => {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "gstand-"));
  db = createSQLiteDb(path.join(dir, "test.db"));
  await migrateToLatest(db);
})

test('insert', async () => {
  const i = Item.create({
    uri: "uniqueuri",
    sellerDid: "bob",
    name: "thing",
    description: "here"
  });
  const res = await Item.insert(db, i);
  expect(res).toHaveLength(1);
  expect(res[0].numInsertedOrUpdatedRows).toEqual(1n);
})

test('query', async () => {
  const i = Item.create({
    uri: "Addremove",
    sellerDid: "addDid",
    name: "thing",
    description: "here"
  });
  const res = await Item.insert(db, i);
  const out = await Item.get(db, "Addremove");
  expect(out).toEqual(i);
})