import * as fsp from 'fs/promises';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { createSQLiteDb, type DatabaseSchema, migrateToLatest } from "./db.ts";
import * as Item from "./item.ts";
import * as Image from "./image.ts";
import { beforeAll, describe, expect, test } from '@jest/globals';
import { Database } from './db.ts';
import * as ItemRecord from '#/lexicon/types/app/gstand/unstable/store/item.ts'

let db: Database;

beforeAll(async () => {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "gstand-"));
  db = createSQLiteDb(path.join(dir, "test.db"));
  await migrateToLatest(db, "sqlite");
})

test('create', async () => {
  const i = Item.create();
  const o = Item.create({ uri: "" });
  expect(i).toEqual(o);
});

test('toRecord', () => {
  const i = Item.create();
  const o = Item.toRecord(i);
  expect(ItemRecord.isRecord(o)).toEqual(true);
  expect(ItemRecord.validateRecord(o).success).toEqual(true);
})

test('toClient', () => {
  const i = Item.create({
    image: [Image.create({ id: 1 }), Image.create({ id: 2 })],
  });
  const o = Item.toClient(i);
  expect(o).toEqual({...i, image: ["1", "2"]});
})

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
  expect(o.image).toHaveLength(2);
  expect(o.image[0].data).toEqual(Buffer.from([1, 2, 3]))
  expect(o.image[0].id).toBeDefined();
  expect(o.image[1].data).toEqual(Buffer.from([7, 8, 9]))
  expect(o.image[1].id).toBeDefined();
});

test("updateWithImage", async () => {
  const i = Item.create({
    uri: "updateWithImageTest",
    image: [
      Image.create({ data: Buffer.from([1, 2, 3]) }),
    ]
  });
  const u = { ...i, image: [Image.create({ data: Buffer.from([7, 8, 9]) })] };
  await Item.insert(db, i);
  await Item.update(db, "updateWithImageTest", u);
  const o = await Item.get(db, "updateWithImageTest");
  expect(u).not.toEqual(i);
  expect(o.image).toHaveLength(1);
  expect(o.image[0].data).toEqual(Buffer.from([7, 8, 9]))
  expect(o.image[0].id).toBeDefined();
});
