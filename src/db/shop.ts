import { recordPrefix } from "./record";
import type { Database } from "./db";
import * as Item from "./item";
import * as Image from './image';
import * as ShopRecord from '#/lexicon/types/app/gstand/store/shop';

export const RecordPath = recordPrefix + ".store.item";

export type Shop = {
  uri: string;
  name: string;
  banner?: Image.Image;
  item: Item.Item[];
  createdAt: Date;
  updatedAt: Date;
}

export type Client = {
  uri: string;
  name: string;
  banner: string;
  item: string[];
  createdAt: number;
  updatedAt: number;
}

export type Table = {
  uri: string;
  name: string;
  banner: string;
  item: string;
  createdAt: number;
  updatedAt: number;
}

export const create = ({
  uri = "",
  name = "",
  banner = undefined,
  item = [],
  createdAt = new Date(),
  updatedAt = new Date(),
}: {
  uri?: string,
  name?: string,
  banner?: Image.Image,
  item?: Array<Item.Item>,
  createdAt?: Date,
  updatedAt?: Date,
} = {}): Shop => ({
  uri,
  name,
  banner,
  item,
  createdAt,
  updatedAt,
})

export const toRecord = (s: Shop): ShopRecord.Record | undefined => {
  return undefined;
}

export const insert = async (db: Database, shop: Shop) => {
  return await db.transaction().execute(async (trx) => {
    const items = await Promise.all(shop.item.map(async (i) => {
      await Item.insert(trx, i);
      return i.uri;
    }));
    const banner = shop.banner && (await Image.insert(db, shop.banner)).insertId;
    return await trx.insertInto('shop').values({
      ...shop,
      banner: banner ? banner.toString() : "",
      item: JSON.stringify(items),
      createdAt: shop.createdAt.getTime(),
      updatedAt: shop.updatedAt.getTime(),
    })
  });
}

export const get = async (db: Database, key: string): Promise<Shop> => {
  const s = await db.selectFrom('shop').selectAll().where('uri', '=', key).executeTakeFirstOrThrow();
  const banner = s.banner === "" ? undefined : await Image.get(db, BigInt(s.banner));
  const itemIds = (JSON.parse(s.item) as string[]);
  const items = await Promise.all(itemIds.map(async (i) => await Item.get(db, i)));
  return {
    ...s,
    banner: banner,
    item: items,
    createdAt: new Date(s.createdAt),
    updatedAt: new Date(s.updatedAt),
  }
}
