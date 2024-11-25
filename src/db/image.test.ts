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
  expect(k).toHaveLength(1);
  expect(k[0].insertId).toBeDefined();
  const o = await Image.get(db, (k[0].insertId as bigint));
  expect(o.id?.toString()).toEqual(k[0].insertId?.toString());
  expect(o.data).toEqual(i.data);
  expect(o.type).toEqual(i.type);
})
