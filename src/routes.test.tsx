import { test, expect, jest, beforeEach, describe } from '@jest/globals';
import { testClient } from 'hono/testing';
import { createSQLiteDb } from './db/db';
import * as fsp from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

let sessionCookie: { did?: string, save: () => any, destroy: () => any };
const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "gstand-"));

jest.unstable_mockModule('@atproto/api', () => ({
  Agent: class Agent {
    constructor(private session: { did: string }) { }
    getProfile() {
      return {
        success: true,
        data: {did: this.session.did},
      };
    }
  }
}));

jest.unstable_mockModule('iron-session', () => ({
  getIronSession: jest.fn(() => sessionCookie),
}))

jest.unstable_mockModule('#/env', () => ({
  loglevel: "none",
  dbType: "sqlite",
  secret: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
}))

jest.unstable_mockModule('#/globals', () => ({
  oauthClient: {
    authorize: jest.fn((handle) => handle),
    clientMetadata: { some: "metadata" },
    callback: jest.fn((params: URLSearchParams) => ({
      session: { did: params.get("did") }
    })),
    restore: jest.fn((did: string) =>
      did === sessionCookie.did ? sessionCookie : undefined),
  },
  db: createSQLiteDb(path.join(dir, "test.db")),
}))

const ironSession = await import("iron-session");
const env = await import('#/env');
const globals = await import('#/globals');
const { server } = await import('./routes');

let client = testClient(server);

beforeEach(async () => {
  client = testClient(server);
  sessionCookie = {
    save: jest.fn(),
    destroy: jest.fn(() => sessionCookie.did = undefined),
  };
})

test("login", async () => {
  const res = await client.login.$post({ form: { bskyid: "data.pl" } });
  expect(res.status).toEqual(302);
  expect(res.headers.get("location")).toEqual("data.pl");
})

test("clientMetadata", async () => {
  const res = await client['client-metadata.json'].$get();
  expect(res.ok).toEqual(true);
  expect(await res.json()).toEqual({ some: "metadata" });
})

test("oathCallback", async () => {
  const res = await client.oauth.callback.$get({ query: { did: "thedid" } });
  expect(res.status).toEqual(302);
  expect(res.headers.get('location')).toEqual("/");

  expect(sessionCookie.did).toEqual("thedid");

  const res2 = await client.oauth.callback.$get({ query: { did: "anotherdid" } });
  expect(res2.status).toEqual(302);
  expect(res2.headers.get("location")).toEqual("/?error");
})

test("logout", async () => {
  expect(sessionCookie.did).toBeUndefined();
  await client.oauth.callback.$get({ query: { did: "thedid" } });
  expect(sessionCookie.did).toEqual("thedid");

  const res = await client.logout.$post();
  expect(res.status).toEqual(302);
  expect(res.headers.get("location")).toEqual("/");
  expect(sessionCookie.did).toBeUndefined();
})

test("notloggedin", async () => {
  const res = await client.api.profile.$get();
  expect(res.status).toEqual(401);
})

describe("Once Logged In", () => {
  beforeEach(() => {
    sessionCookie.did = "thedid";
  })

  test('profile', async () => {
    const res = await client.api.profile.$get();
    expect(res.ok).toEqual(true);
    const profile: {did: string} = await res.json();
    expect(profile.did).toEqual("thedid");
  })
})
