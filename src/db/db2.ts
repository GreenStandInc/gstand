import { type Selectable, type Insertable, Kysely, Migrator, PostgresDialect, SqliteDialect, type Generated, type Migration, type MigrationProvider, type Updateable } from "kysely"
import pg, { type PoolConfig } from 'pg';
import SQLiteDb from 'better-sqlite3';
import { describe } from "node:test";
import { z } from 'zod';
import * as ItemRecord from '#/lexicon/types/app/gstand/unstable/store/item.ts';
import { dbType } from "#/env";

const recordPrefix = "app.gstand.unstable";

const { Pool } = pg;

export type DatabaseSchema = {
  image: ImageTable,
  item: ItemTable,
  auth_session: AuthSession,
  auth_state: AuthState,
}

export type ImageTable = {
  id: Generated<number>,
  type: string,
  data: Uint8Array,
};
export type Image = {
  type: string,
  data: Uint8Array,
}

export const itemRecord = recordPrefix + ".store.item";
export type Item = {
  uri: string;
  sellerDid: string;
  name: string;
  description: string;
  image: Image[];
}
export type ItemTable = {
  uri: string;
  sellerDid: string;
  name: string;
  description: string;
  image: string;
}
export const itemToItemRecord = (i: Item): ItemRecord.Record => {
  return {
    $type: itemRecord,
    name: i.name,
    description: i.description,
    image: [],
    payment: [],
  }
}
export const createItem = (): Item => {
  return {
    uri: "",
    sellerDid: "",
    name: "",
    description: "",
    image: [],
  }
}

export type AuthSession = {
  key: string,
  session: string,
}

export type AuthState = {
  key: string,
  state: string,
}

const migrations: Record<string, Migration> = {
  '00001': {
    async up(db: Kysely<unknown>) {

      if (dbType === "sqlite") {
        await db.schema.createTable('image')
          .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
          .addColumn('type', 'varchar', (col) => col.notNull())
          .addColumn('data', 'blob', (col) => col.notNull())
          .execute();
      } else {
        await db.schema.createTable('image')
          .addColumn('id', 'serial', (col) => col.primaryKey())
          .addColumn('type', 'varchar', (col) => col.notNull())
          .addColumn('data', 'blob', (col) => col.notNull())
          .execute();
      }

      await db.schema.createTable('item')
        .addColumn('uri', 'varchar', (col) => col.primaryKey())
        .addColumn('sellerDid', 'varchar', (col) => col.notNull())
        .addColumn('name', 'varchar', (col) => col.notNull())
        .addColumn('description', 'varchar', (col) => col.notNull())
        .addColumn('image', 'varchar', (col) => col.notNull())
        .execute();

      await db.schema.createTable('auth_session')
        .addColumn('key', 'varchar', (col) => col.primaryKey())
        .addColumn('session', 'varchar', (col) => col.notNull())
        .execute();

      await db.schema.createTable('auth_state')
        .addColumn('key', 'varchar', (col) => col.primaryKey())
        .addColumn('state', 'varchar', (col) => col.notNull())
        .execute();
    },
    async down(db: Kysely<unknown>) {
      await db.schema.dropTable('auth_state').execute();
      await db.schema.dropTable('auth_session').execute();
      await db.schema.dropTable('item').execute();
      await db.schema.dropTable('image').execute();
    },
  }
}

const migrationProvider: MigrationProvider = {
  async getMigrations() {
    return migrations;
  }
}

export type Database = Kysely<DatabaseSchema>

export const createSQLiteDb = (location: string) => {
  return new Kysely<DatabaseSchema>({
    dialect: new SqliteDialect({
      database: new SQLiteDb(location),
    }),
  });
}

export const createPostgresDb = (opts: PoolConfig) => {
  return new Kysely<DatabaseSchema>({
    dialect: new PostgresDialect({
      pool: new Pool(opts),
    }),
  });
}

export const migrateToLatest = async (db: Database) => {
  const migrator = new Migrator({ db, provider: migrationProvider });
  const { error } = await migrator.migrateToLatest()
  if (error) throw error;
}

const insertItem = async (db: Kysely<DatabaseSchema>, item: Item) => {
  return await db.transaction().execute(async (trx) => {
    const imageIds = (await db.insertInto('image').values(item.image).execute())
      .map((i) => i.insertId).filter((v) => v !== undefined);
    return await db.insertInto('item').values({ ...item, image: JSON.stringify(imageIds) });
  })
}

const getItem = async (db: Kysely<DatabaseSchema>, key: string): Promise<Item> => {
  const i = await db.selectFrom("item").selectAll().where("uri", "=", key).executeTakeFirstOrThrow();
  const image_ids = (JSON.parse(i.image) as number[]);
  const image = await db.selectFrom('image').selectAll().where('id', 'in', image_ids).execute();
  return { ...i, image };
}

const deleteItem = async (db: Kysely<DatabaseSchema>, key: string) => {
  await db.transaction().execute(async (trx) => {
    const i = await db.selectFrom("item").selectAll().where("uri", "=", key).executeTakeFirstOrThrow();
    const imageIds = (JSON.parse(i.image) as number[]);
    await db.deleteFrom('image').where('id', 'in', imageIds).execute();
    await db.deleteFrom('item').where('uri', '=', key).execute();
  })
}

const updateItem = async (db: Kysely<DatabaseSchema>, key: string, item: Item) => {
  return await db.transaction().execute(async (trx) => {
    // Delete old item
    const i = await db.selectFrom("item").selectAll().where("uri", "=", key).executeTakeFirstOrThrow();
    const imageIds = (JSON.parse(i.image) as number[]);
    await db.deleteFrom('image').where('id', 'in', imageIds).execute();
    await db.deleteFrom('item').where('uri', '=', key).execute();
    // Insert new item
    const newImageIds = (await db.insertInto('image').values(item.image).execute())
      .map((i) => i.insertId).filter((v) => v !== undefined);
    return await db.insertInto('item').values({ ...item, image: JSON.stringify(newImageIds) });
  })
}