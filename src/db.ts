import { Kysely, Migrator, PostgresDialect, SqliteDialect, type Migration, type MigrationProvider } from "kysely"
import pg, { type PoolConfig } from 'pg';
import SQLiteDb from 'better-sqlite3';
import { describe } from "node:test";
import { z } from 'zod';
import * as ItemRecord from '#/lexicon/types/app/gstand/unstable/store/item.ts';

const recordPrefix = "app.gstand.unstable";

const { Pool } = pg;

export type DatabaseSchema = {
  item: Item,
  auth_session: AuthSession,
  auth_state: AuthState,
}

export const itemRecord = recordPrefix + ".store.item";
export type Item = {
  uri: string;
  sellerDid: string;
  name: string;
  description: string;
  image: string[];
}
export const ZodItem = z.object({
  uri: z.string(),
  sellerDid: z.string(),
  name: z.string(),
  description: z.string(),
  image: z.array(z.string())
});
ZodItem._output satisfies Item;
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
      await db.schema.createTable('item')
        .addColumn('uri', 'varchar', (col) => col.primaryKey())
        .addColumn('sellerDid', 'varchar', (col) => col.notNull())
        .addColumn('name', 'varchar', (col) => col.notNull())
        .addColumn('description', 'varchar', (col) => col.notNull())
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
