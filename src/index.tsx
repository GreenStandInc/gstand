import * as env from '#/env.ts';
import { serve } from '@hono/node-server';
import { migrateToLatest } from '#/db/db.ts';
import * as globals from '#/globals.ts';
import { server } from "#/routes.ts";

migrateToLatest(globals.db);
if (env.firehoseRelay !== "") {
  globals.firehose.start();
}

const onCloseSignal = () => {
  setTimeout(() => process.exit(1), 10e3).unref();
  if (env.firehoseRelay !== "") {
    globals.firehose.destroy();
  }
  process.exit();
}

serve({ fetch: server.fetch, port: env.port });
process.on('SIGINT', onCloseSignal)
process.on('SIGTERM', onCloseSignal)
