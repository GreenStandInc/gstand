import { Kysely, Migrator, PostgresDialect, SqliteDialect, type Migration, type MigrationProvider } from "kysely"
import pg, { type PoolConfig } from 'pg';
import SQLiteDb from 'better-sqlite3';

const { Pool } = pg;

export type DatabaseSchema = {
  item: Item,
  auth_session: AuthSession,
  auth_state: AuthState,
}

export type Item = {
  uri: string;
  name: string;
  description: string;
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
