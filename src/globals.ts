import { Firehose } from '@atproto/sync';
import { IdResolver, MemoryCache } from '@atproto/identity';
import * as env from '#/env';
import { createSQLiteDb, createPostgresDb } from './db/db';
import { createClient } from './auth/client';
import type { NodeOAuthClient } from '@atproto/oauth-client-node';
import * as ItemRecord from '#/lexicon/types/app/gstand/unstable/store/item.ts';
import * as Item from '#/db/item.ts';

export const db = env.dbType === "sqlite" ?
  createSQLiteDb(env.dbPath) :
  createPostgresDb({
    database: env.dbDatabase,
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUsername,
    password: env.dbPassword,
    max: 10 // Probably doesn't matter.
  });

export const oauthClient: NodeOAuthClient = await createClient(db);

const HOUR = 60e3 * 60;
const DAY = HOUR * 24;

const idResolver = new IdResolver({
  didCache: new MemoryCache(HOUR, DAY)
})

export const firehose = new Firehose({
  idResolver,
  service: env.firehoseRelay,
  handleEvent: async (e) => {
    if (e.event === "create" || e.event === "update") {
      const now = new Date();
      const rec = e.record;
      if (e.collection === Item.RecordPath
        && ItemRecord.isRecord(rec) && ItemRecord.validateRecord(rec)
      ) {
        await Item.insert(db, {
          uri: e.uri.toString(),
          sellerDid: e.did,
          name: rec.name,
          description: rec.description,
          image: []
        });
      }
    } else if (e.event === "delete" && e.collection === Item.RecordPath) {
      await Item.del(db, e.uri.toString());
    }
  },
  onError: (err) => {
    console.error(err);
  },
  filterCollections: [Item.RecordPath],
  excludeIdentity: true,
  excludeAccount: true,
})
