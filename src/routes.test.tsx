import { test, expect, jest, beforeAll, beforeEach, describe } from '@jest/globals';
import { testClient } from 'hono/testing';
import { createSQLiteDb, migrateToLatest } from '#/db/db';
import * as Item from '#/db/item';
import { randomBytes } from 'node:crypto';

let sessionCookie: {
  did?: string,
  save: () => any,
  destroy: () => any
};

jest.unstable_mockModule('@atproto/api', () => ({
  Agent: class Agent {
    private assertDid: string;
    constructor(private session: { did: string }) {
      this.assertDid = session.did;
    }
    public com = {
      atproto: {
        repo: {
          uploadBlob: jest.fn(async (data: any) => {
            const key = randomBytes(9).toString('base64');
            return { data: { uri: key } };
          }),
          putRecord: jest.fn(async (rec: any) => {
            const key = randomBytes(9).toString('base64');
            return { data: { uri: key } };
          }),
        }
      }
    }
    getProfile() {
      return {
        success: true,
        data: { did: this.session.did },
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
  db: createSQLiteDb(),
}))

const ironSession = await import("iron-session");
const env = await import('#/env');
const globals = await import('#/globals');
const { server } = await import('./routes');

let client = testClient(server);

beforeAll(async () => {
  migrateToLatest(globals.db, "sqlite");
})

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
    const profile: { did: string } = await res.json();
    expect(profile.did).toEqual("thedid");
  })

  test('additem', async () => {
    const res = await client.api.addItem.$post({
      'form': {
        name: "Item",
        description: "My Description",
        image: "",
      }
    });
    expect(res.ok).toEqual(true);
    const data = await res.json();
    expect(data.sellerDid).toEqual("thedid");
    expect(data.name).toEqual("Item");
    expect(data.description).toEqual("My Description");
    const inDb = await Item.get(globals.db, data.uri);
    expect(data).toEqual(inDb);
  });

  test("addItemWithPicture", async () => {
    const res = await client.api.addItem.$post({
      'form': {
        name: "Item",
        description: "My Description",
        image: new File([Buffer.from([1,2,3])], "foo.png", {type: "image/png"}),
      }
    });
    expect(res.ok).toEqual(true);
    const data = await res.json();
    expect(data.image).toHaveLength(1);
    const inDb = await Item.get(globals.db, data.uri);
    expect(inDb.image).toHaveLength(1);
    expect(inDb.image[0].type).toEqual('image/png');
    expect(inDb.image[0].data).toEqual(Buffer.from([1,2,3]));
  });
})
