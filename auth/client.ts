import { NodeOAuthClient } from "@atproto/oauth-client-node";
import { url, isPublicUrl } from "#/env";
import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from '@atproto/oauth-client-node'


export const createClient = async () => {
  let enc = encodeURIComponent;
  return new NodeOAuthClient({
    clientMetadata: {
      client_name: "GStand",
      client_id: isPublicUrl
        ? `${url}/client-metadata.json`
        : `http://localhost?redirect_uri=${enc(`http://127.0.0.1/oauth/callback`)}&scope=${enc('atproto transition:generic')}`,
      client_uri: url,
      redirect_uris: [`${url}/oauth/callback`],
      scope: 'atproto transition:generic',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ["code"],
      application_type: "web",
      token_endpoint_auth_method: "none",
      dpop_bound_access_tokens: true,
    },
    stateStore: new StateStore(),
    sessionStore: new SessionStore(),
  })
}

// TODO, don't do it in memory!
class StateStore implements NodeSavedStateStore {
  db: Map<String, NodeSavedState>;
  constructor () {
    this.db = new Map();
  }
  async get(key: string): Promise<NodeSavedState | undefined> { return this.db.get(key); }
  async set(key: string, val: NodeSavedState) { this.db.set(key, val)}
  async del(key: string) { this.db.delete(key)}
}

// TODO, don't do it in memory!
class SessionStore implements NodeSavedSessionStore {
  db: Map<String, NodeSavedSession>;
  constructor () {
    this.db = new Map();
  }
  async get(key: string): Promise<NodeSavedSession | undefined> { return this.db.get(key); }
  async set(key: string, val: NodeSavedSession) { this.db.set(key, val)}
  async del(key: string) { this.db.delete(key) }
}
