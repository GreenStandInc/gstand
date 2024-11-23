import { test, expect, jest } from '@jest/globals';
import { testClient } from 'hono/testing';

jest.unstable_mockModule('#/globals', () => ({
  oauthClient: {
    authorize: jest.fn((handle) => handle),
  },
  db: {},
}))

const globals = await import('#/globals');
const {server} = await import('./routes');

test("testlogin", async () => {
  const client = testClient(server);
  const res = await client.login.$post({ form: { bskyid: "data.pl" } });
  expect(res.status).toEqual(302);
  expect(res.headers.get("location")).toEqual("data.pl");
})
