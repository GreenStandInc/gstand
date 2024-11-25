import { test, expect, beforeAll } from '@jest/globals';
import * as Image from './image';
import { createSQLiteDb, migrateToLatest } from './db';
import type { Database } from '#/db/db';

let db: Database;
beforeAll(async () => {
  db = createSQLiteDb();
  await migrateToLatest(db, "sqlite");
})

test("create", () => {
  const ret = Image.create();
  expect(ret.data).toHaveLength(0);
  expect(ret.type).toEqual("");
})

test("get", async () => {
  const i = Image.create({data: Buffer.from([1,2,3])});
  const k = await Image.insert(db, i);
  const o = await Image.get(db, (k.insertId as bigint));
  expect(o.id?.toString()).toEqual(k.insertId?.toString());
  expect(o.data).toEqual(i.data);
  expect(o.type).toEqual(i.type);
})
