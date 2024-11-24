import type { Kysely } from "kysely";
import { recordPrefix } from "./record";
import * as Image from './image';
import * as ItemRecord from '#/lexicon/types/app/gstand/unstable/store/item.ts';
import * as Payment from "#/lexicon/types/app/gstand/unstable/store/payment.ts";
import type { Database } from "./db";
import type { BlobRef } from "@atproto/lexicon";

export const RecordPath = recordPrefix + ".store.item";

export const getClient = async (db: Database, key: string): Promise<Client> => {
  const i = await db.selectFrom("item").selectAll().where('uri', '=', key).executeTakeFirstOrThrow();
  return {...i, image: JSON.parse(i.image) as string[]};
}
export type Item = {
  uri: string;
  sellerDid: string;
  name: string;
  description: string;
  image: Image.Image[];
}

export type Client = {
  uri: string;
  sellerDid: string;
  name: string;
  description: string;
  image: string[];
}

export type Table = {
  uri: string;
  sellerDid: string;
  name: string;
  description: string;
  image: string;
}

export const toRecord = (i: Item, {
  image = [],
  payment = [],
}: {
  image?: BlobRef[],
  payment?: Payment.Main[],
} = {}): ItemRecord.Record => {
  return {
    $type: RecordPath,
    name: i.name,
    description: i.description,
    image,
    payment,
  }
}

export const toClient = (i: Item): Client => {
  return {...i, 
    image: i.image.map((i) => i.id)
    .filter((i) => i !== undefined)
    .map((i) => i.toString())};
}

export const create = ({
  uri = "",
  sellerDid = "",
  name = "",
  description = "",
  image = []
}: {
  uri?: string,
  sellerDid?: string,
  name?: string,
  description?: string,
  image?: Array<Image.Image>,
} = {}): Item => {
  return {
    uri,
    sellerDid,
    name,
    description,
    image,
  }
}

export const insert = async (db: Database, item: Item) => {
  return await db.transaction().execute(async (trx) => {
    const imageIds = await Promise.all(item.image.map(async (i) => {
      return (await trx.insertInto('image').values(i).execute())[0].insertId?.toString();
    }));
    return await trx.insertInto('item')
      .values({ ...item, image: JSON.stringify(imageIds) })
      .execute();
  })
  // TODO, add ability to auto update, using:
  // .onConflict((oc) => oc.column('uri').doUpdateSet({
  //   name: rec.name,
  //   description: rec.description,
  // }))
  // Note that you'll _also_ have to handle deleting images.
}

export const get = async (db: Database, key: string): Promise<Item> => {
  const i = await db.selectFrom("item").selectAll().where("uri", "=", key).executeTakeFirstOrThrow();
  const image_ids = (JSON.parse(i.image) as number[]);
  const image = await db.selectFrom('image').selectAll().where('id', 'in', image_ids).execute();
  return { ...i, image: image.map(Image.create) };
}

export const del = async (db: Database, key: string) => {
  return await db.transaction().execute(async (trx) => {
    const i = await trx.selectFrom("item").selectAll().where("uri", "=", key).executeTakeFirstOrThrow();
    const imageIds = (JSON.parse(i.image) as number[]);
    await trx.deleteFrom('image').where('id', 'in', imageIds).execute();
    return await trx.deleteFrom('item').where('uri', '=', key).execute();
  })
}

export const update = async (db: Database, key: string, item: Item) => {
  return await db.transaction().execute(async (trx) => {
    // Delete old item
    const i = await trx.selectFrom("item").selectAll().where("uri", "=", key).executeTakeFirstOrThrow();
    const imageIds = (JSON.parse(i.image) as number[]);
    await trx.deleteFrom('image').where('id', 'in', imageIds).execute();
    await trx.deleteFrom('item').where('uri', '=', key).execute();
    // Insert new item
    const newImageIds = await Promise.all(item.image.map(async (i) => {
      return (await trx.insertInto('image').values(i).execute())[0].insertId?.toString();
    }));
    return await trx.insertInto('item').values({ ...item, image: JSON.stringify(newImageIds) }).execute();
  })
}
