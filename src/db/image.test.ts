import { test, expect } from '@jest/globals';
import * as Image from './image';

test("create", () => {
  const ret = Image.create();
  expect(ret.data).toHaveLength(0);
  expect(ret.type).toEqual("");
})
