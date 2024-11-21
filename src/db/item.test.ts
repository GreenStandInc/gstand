import * as fsp from 'fs/promises';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { createSQLiteDb, type DatabaseSchema, migrateToLatest } from "./db.ts";
import * as Item from "./item.ts";
import * as Image from "./image.ts";
import { beforeAll, describe, expect, test } from '@jest/globals';
import { Database } from './db.ts';

let db: Database;

beforeAll(async () => {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "gstand-"));
  db = createSQLiteDb(path.join(dir, "test.db"));
  await migrateToLatest(db);
})

test('create', async () => {
  const i = Item.create();
  const o = Item.create({ uri: "" });
  expect(i).toEqual(o);
});

test('insert', async () => {
  const i = Item.create({ uri: "insertTest" });
  const res = await Item.insert(db, i);
  expect(res).toHaveLength(1);
  expect(res[0].numInsertedOrUpdatedRows).toEqual(1n);
});

test('query', async () => {
  const i = Item.create({ uri: "queryTest", });
  await Item.insert(db, i);
  const res = await Item.get(db, "queryTest");
  expect(res).toEqual(i);
});

test('delete', async () => {
  const i = Item.create({ uri: "deleteTest" });
  await Item.insert(db, i);
  const res = await Item.del(db, "deleteTest");
  expect(res).toHaveLength(1);
  expect(async () => await Item.get(db, "deleteTest")).rejects.toThrow();
});

test('update', async () => {
  const i = Item.create({ uri: "updateTest", sellerDid: "A" });
  const j: Item.Item = { ...i, sellerDid: "B" };
  await Item.insert(db, i);
  await Item.update(db, 'updateTest', j);
  const res = await Item.get(db, 'updateTest');
  expect(res).toEqual(j);
});

test("insertWithImage", async () => {
  const i = Item.create({
    uri: "insertWithImageTest",
    image: [
      Image.create({ type: "A", data: Buffer.from([1, 2, 3]) }),
      Image.create({ type: "B", data: Buffer.from([7, 8, 9]) })
    ]
  });
  await Item.insert(db, i);
  const o = await Item.get(db, "insertWithImageTest");
  expect(o).toEqual(i);
});

test("updateWithImage", async () => {
  const i = Item.create({
    uri: "updateWithImageTest",
    image: [
      Image.create({ type: "A", data: Buffer.from([1, 2, 3]) }),
    ]
  });
  const u = { ...i, image: [Image.create({ type: "B", data: Buffer.from([7, 8, 9]) })] };
  await Item.insert(db, i);
  await Item.update(db, "updateWithImageTest", u);
  const o = await Item.get(db, "updateWithImageTest");
  expect(u).not.toEqual(i);
  expect(o).toEqual(u);
});
