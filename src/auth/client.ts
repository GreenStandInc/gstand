import { NodeOAuthClient } from '@atproto/oauth-client-node';
import { url, port, isPublicUrl } from '#/env.ts';
import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from '@atproto/oauth-client-node';
import type { Database } from '#/db/db.ts';

export const createClient = async (db: Database) => {
  const enc = encodeURIComponent;
  return new NodeOAuthClient({
    clientMetadata: {
      client_name: "GStand",
      client_id: isPublicUrl
        ? `${url}/client-metadata.json`
        : `http://localhost?redirect_uri=${enc(`http://127.0.0.1:${port}/oauth/callback`)}&scope=${enc('atproto transition:generic')}`,
      client_uri: url,
      redirect_uris: [isPublicUrl ? `${url}/oauth/callback` : `http://127.0.0.1:${port}/oauth/callback`],
      scope: 'atproto transition:generic',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ["code"],
      application_type: "web",
      token_endpoint_auth_method: "none",
      dpop_bound_access_tokens: true,
    },
    stateStore: new StateStore(db),
    sessionStore: new SessionStore(db),
  })
}

// TODO, don't do it in memory!
class StateStore implements NodeSavedStateStore {
  constructor(private db: Database) { }
  async get(key: string): Promise<NodeSavedState | undefined> {
    const res = await this.db.selectFrom("auth_state")
      .selectAll().where("key", "=", key)
      .executeTakeFirst();
    if (res) return JSON.parse(res.state) as NodeSavedState;
    else return;
  }
  async set(key: string, val: NodeSavedState) {
    const state = JSON.stringify(val);
    await this.db.insertInto("auth_state")
      .values({ key, state })
      .onConflict((oc) => oc.doUpdateSet({ state }))
      .execute();
  }
  async del(key: string) {
    await this.db.deleteFrom("auth_state").where("key", "=", key).execute();
  }
}

class SessionStore implements NodeSavedSessionStore {
  constructor(private db: Database) { }
  async get(key: string): Promise<NodeSavedSession | undefined> {
    const res = await this.db.selectFrom("auth_session")
      .selectAll().where("key", "=", key)
      .executeTakeFirst();
    if (res) return JSON.parse(res.session) as NodeSavedSession;
    else return;
  }
  async set(key: string, val: NodeSavedSession) {
    const session = JSON.stringify(val);
    await this.db.insertInto("auth_session")
      .values({ key, session })
      .onConflict((oc) => oc.doUpdateSet({ session }))
      .execute();
  }
  async del(key: string) {
    await this.db.deleteFrom("auth_session").where("key", "=", key).execute();
  }
}
