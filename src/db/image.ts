import type { Generated } from 'kysely';
import type { Database } from "./db";

export type Image = {
  id?: string,
  type: string,
  data: Uint8Array,
}

export type Table = {
  id: Generated<bigint>,
  type: string,
  data: Uint8Array,
};

export const create = ({
  id = undefined,
  type = "",
  data = new Uint8Array()
}: {
  id?: string | bigint,
  type?: string,
  data?: Uint8Array
} = {}): Image => {
  return {
    id: typeof id  === 'undefined' ? id : id.toString(),
    type,
    data
  };
}

export const insert = async (db: Database, image: Image) => {
  return await db.insertInto('image')
    .values({ type: image.type, data: image.data })
    .execute();
}

export const get = async (db: Database, key: bigint): Promise<Image> => {
  let ret = await db.selectFrom("image").selectAll().where("id", "=", key).executeTakeFirstOrThrow();
  return { ...ret, id: ret.id.toString() };
}
