import type { Kysely } from "kysely";
import { recordPrefix } from "./record";
import * as Image from './image';
import * as ItemRecord from '#/lexicon/types/app/gstand/unstable/store/item.ts';
import type { DatabaseSchema } from "./db";

export const RecordPath = recordPrefix + ".store.item";

export type Item = {
  uri: string;
  sellerDid: string;
  name: string;
  description: string;
  image: Image.Image[];
}

export type Table = {
  uri: string;
  sellerDid: string;
  name: string;
  description: string;
  image: string;
}

export const toRecord = (i: Item): ItemRecord.Record => {
  return {
    $type: RecordPath,
    name: i.name,
    description: i.description,
    image: [],
    payment: [],
  }
}

export const create = ({
  uri = "",
  sellerDid = "",
  name = "",
  description = "",
  image = []
} = {}): Item => {
  return {
    uri,
    sellerDid,
    name,
    description,
    image,
  }
}

export const insert = async (db: Kysely<DatabaseSchema>, item: Item) => {
  return await db.transaction().execute(async (trx) => {
    const imageIds = item.image.length === 0 ? [] :
      ((await trx.insertInto('image').values(item.image).execute())
        .map((i) => i.insertId).filter((v) => v !== undefined));
    console.log({ ...item, image: JSON.stringify(imageIds) });
    return await trx.insertInto('item')
      .values({ ...item, image: JSON.stringify(imageIds) })
      .execute();
  })
  // TODO, add ability to auto update, using:
  // .onConflict((oc) => oc.column('uri').doUpdateSet({
  //   name: rec.name,
  //   description: rec.description,
  // }))
  // Note that you'l _also_ have to handle deleting images.
}

export const get = async (db: Kysely<DatabaseSchema>, key: string): Promise<Item> => {
  const i = await db.selectFrom("item").selectAll().where("uri", "=", key).executeTakeFirstOrThrow();
  const image_ids = (JSON.parse(i.image) as number[]);
  const image = await db.selectFrom('image').selectAll().where('id', 'in', image_ids).execute();
  return { ...i, image };
}

export const del = async (db: Kysely<DatabaseSchema>, key: string) => {
  await db.transaction().execute(async (trx) => {
    const i = await db.selectFrom("item").selectAll().where("uri", "=", key).executeTakeFirstOrThrow();
    const imageIds = (JSON.parse(i.image) as number[]);
    await trx.deleteFrom('image').where('id', 'in', imageIds).execute();
    await trx.deleteFrom('item').where('uri', '=', key).execute();
  })
}

export const update = async (db: Kysely<DatabaseSchema>, key: string, item: Item) => {
  return await db.transaction().execute(async (trx) => {
    // Delete old item
    const i = await trx.selectFrom("item").selectAll().where("uri", "=", key).executeTakeFirstOrThrow();
    const imageIds = (JSON.parse(i.image) as number[]);
    await trx.deleteFrom('image').where('id', 'in', imageIds).execute();
    await trx.deleteFrom('item').where('uri', '=', key).execute();
    // Insert new item
    const newImageIds = (await trx.insertInto('image').values(item.image).execute())
      .map((i) => i.insertId).filter((v) => v !== undefined);
    return await trx.insertInto('item').values({ ...item, image: JSON.stringify(newImageIds) }).execute();
  })
}
